from django.urls import path
from .consumer import ChatConsumer

wsPatterns = [
    path('ws/mensajes/<str:room_name>/', ChatConsumer.as_asgi()),
]
