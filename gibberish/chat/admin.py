# -*- coding: utf-8 -*-
from django.contrib import admin

from .models import Message, Room


admin.site.register(
	Message,
	list_display=['id', 'room', 'message', 'user'],
	list_display_link=['id'],
)

admin.site.register(
    Room,
    list_display=['id', 'name', 'staff_only'],
    list_display_link=['id'],
)
