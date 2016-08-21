# -*- coding: utf-8 -*-
from django.db import models
from django.template import defaultfilters
from django.utils.encoding import force_text
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

from channels import Group

from model_utils import Choices
from model_utils.models import StatusModel, TimeStampedModel

import json


class Message(TimeStampedModel):
    TYPE = Choices(
        (0, 'message', _('Message')),
        (1, 'info', _('Info')),
        (2, 'warning', _('Warning')),
        (3, 'error', _('Error')),
        (4, 'muted', _('Muted')),
        (5, 'enter', _('Enter')),
        (6, 'leave', _('Leave')),
    )

    message = models.TextField(_('Message'), max_length=2047)
    message_type = models.IntegerField(choices=TYPE, default=TYPE.message)

    # Relations
    room = models.ForeignKey('chat.Room')
    user = models.ForeignKey('users.User')


class Room(TimeStampedModel):
    name = models.CharField(_('Name'), max_length=255)
    # If only "staff" users are allowed (is_staff on django's User)
    staff_only = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @property
    def websocket_group(self):
        """
        Returns the Channels Group that sockets should subscribe to, to get sent
        messages as they are generated.
        """
        return Group('chat-room-{id}'.format(id=self.id))

    def send_message(self, message, user, message_type=Message.TYPE.message):
        """
        Called to send a message to the room on behalf of a user.
        """
        Message.objects.create(
            message=message,
            message_type=message_type,
            user=user,
            room=self
        )

        final_msg = {
            'message': message,
            'message_type': force_text(Message.TYPE[message_type]),
            'user': user.username,
            'room': str(self.id),
            'created': defaultfilters.date(timezone.localtime(self.created), 'r'),
        }

        # Send out the message to everyone in the room
        self.websocket_group.send({'text': json.dumps(final_msg)})


# class RoomProfile(StatusModel):
#   STATUS = Choices()

#   # Relations
#   room = models.ForeignKey('chat.Room')


# class UserRoomProfile(StatusModel):
#   STATUS = Choices('active', 'muted', 'left')

#   # Relations
#   room = models.ForeignKey('chat.Room')
#   user = models.ForeignKey('users.User')


