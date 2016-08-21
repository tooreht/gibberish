# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from channels import Channel, Group
from channels.sessions import channel_session
from channels.auth import channel_session_user, channel_session_user_from_http

from .exceptions import ClientError
from .models import Message, Room
from .utils import catch_client_error, chat_room, get_room_or_error

import json, logging


logger = logging.getLogger(__name__)


# **********
# WEBSOCKET
# **********

# This decorator copies the user from the HTTP session (only available in
# websocket.connect or http.request messages) to the channel session (available
# in all consumers with the same reply_channel, so all three here)
@channel_session_user_from_http
def ws_connect(message):
    """
    Initialize chat session
    """
    message.channel_session['rooms'] = []


# Unpacks the JSON in the received WebSocket frame and puts it onto a channel
# of its own with a few attributes extra so we can route it
# This doesn't need @channel_session_user as the next consumer will have that,
# and we preserve message.reply_channel (which that's based on)
def ws_receive(message):
    # All WebSocket frames have either a text or binary payload; we decode the
    # text part here assuming it's JSON.
    # You could easily build up a basic framework that did this encoding/decoding
    # for you as well as handling common errors.
    payload = json.loads(message['text'])
    payload['reply_channel'] = message.content['reply_channel']
    Channel('chat.messages').send(payload)


@channel_session_user
def ws_disconnect(message):
    """
    Unsubscribe from any connected rooms.
    """
    for room_id in message.channel_session.get('rooms', set()):
        try:
            room = Room.objects.get(pk=room_id)
        except Room.DoesNotExist as e:
            logger.warning(e)
        else:
            # Removes us from the room's send group. If this doesn't get run,
            # we'll get removed once our first reply message expires.
            room.websocket_group.discard(message.reply_channel)


# *****
# CHAT
# *****


# Channel_session_user loads the user out from the channel session and presents
# it as message.user. There's also a http_session_user if you want to do this on
# a low-level HTTP handler, or just channel_session if all you want is the
# message.channel_session object without the auth fetching overhead.
@channel_session_user
@catch_client_error
@chat_room
def chat_join(message, room):
    # # Find the room they requested (by ID) and add ourselves to the send group
    # # Note that, because of channel_session_user, we have a message.user
    # # object that works just like request.user would. Security!
    # room = get_room_or_error(message)


    # # Send a "enter message" to the room if available
    # if NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS:
        # room.send_message(None, message.user, Room.TYPE.enter)

    # OK, add them in. The websocket_group is what we'll send messages
    # to, so that everyone in the chat room gets them.
    room.websocket_group.add(message.reply_channel)
    message.channel_session['rooms'] = list(set(message.channel_session['rooms']).union([room.id]))

    # Send a message back that will prompt them to open the room.
    # This is done server-side so that we could, for example, make people
    # join rooms automatically.
    message.reply_channel.send({
        'text': json.dumps({
            'join': str(room.id),
            'name': room.name,
        })
    })


@channel_session_user
@catch_client_error
@chat_room
def chat_send(message, room):
    # Check if user is in this chat room.
    if int(room.id) not in message.channel_session['rooms']:
        raise ClientError('ROOM_ACCESS_DENIED')

    # # Find the chat room which the user is sending to und check permissions.
    # room = get_room_or_error(message)

    # Send the message along
    room.send_message(message['message'], message.user)


@channel_session_user
@catch_client_error
@chat_room
def chat_leave(message, room):
    """
    Remove user from this chat room channel he is subscribed to.
    """
    # room = get_room_or_error(message)

    # # Send a "leave message" to the room if available
    # if NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS:
    #     room.send_message(None, message.user, Message.TYPE.leave)

    room.websocket_group.discard(message.reply_channel)
    message.channel_session['rooms'] = list(set(message.channel_session['room']).difference([room.id]))

    # Send a message back that will prompt the user to close the room
    message.reply_channel.send({
        "text": json.dumps({
            "leave": str(room.id),
            'name': room.name,
        }),
    })
