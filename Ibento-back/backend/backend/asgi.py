import os
import sys
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.backend.settings')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.api.consumer.routing import wsPatterns  # Ajusta según tu estructura

application = ProtocolTypeRouter({
    "http": get_asgi_application(),

    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(wsPatterns)
        )
    ),
})
