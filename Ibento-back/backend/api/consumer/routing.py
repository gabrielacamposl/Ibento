# from django.urls import path
# from .consumer import ChatConsumer

# wsPatterns = [
#     path('ws/mensajes/<str:room_name>/', ChatConsumer.as_asgi()),
# ]
from django.urls import re_path
from .consumer import ChatConsumer

wsPatterns = [ 
    re_path(r'^ws/mensajes/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
]
