# -*- coding: utf-8 -*-
from channels.routing import include, route

from gibberish.chat.consumers import (
    ws_connect, ws_receive, ws_disconnect,
    chat_join, chat_send, chat_leave
)

# http_routing = [
#     route("http.request", poll_consumer, path=r"^/poll/$", method=r"POST$"),
# ]


# There's no path matching on these routes; we just rely on the matching
# from the top-level routing. We _could_ path match here if we wanted.
websocket_routing = [
    # Called when WebSockets connect
    route('websocket.connect', ws_connect),

    # Called when WebSockets get sent a data frame
    route('websocket.receive', ws_receive),

    # Called when WebSockets disconnect
    route('websocket.disconnect', ws_disconnect),
]


# You can have as many lists here as you like, and choose any name.
# Just refer to the individual names in the include() function.
chat_routing = [
    route('chat.messages', chat_join, command='^join$'),
    route('chat.messages', chat_send, command='^send$'),
    route('chat.messages', chat_leave, command='^leave$'),
]
