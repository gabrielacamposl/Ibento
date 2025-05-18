"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack  
from django.urls import path
from api.consumer.routing import wsPatterns  # Adjust the import according to your project structure
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.backend.settings')
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(wsPatterns)
    ),
})