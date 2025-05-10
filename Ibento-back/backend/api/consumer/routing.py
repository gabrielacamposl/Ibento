from django.urls import path
from .consumer import ChatConsumer
from channels.routing import ProtocolTypeRouter, URLRouter

from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator


wsPatterns = [
    path('ws/chat/<str:room_name>/', ChatConsumer.as_asgi()),
]