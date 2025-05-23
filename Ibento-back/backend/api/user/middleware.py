from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from api.models import TokenBlackList
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
import jwt
from django.conf import settings

class JWTBlacklistMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Rutas que no requieren autenticación
        exempt_paths = ['/api/login/', '/api/crear-cuenta/', 'api/confirmar/<uuid:token>/', 'api/password-reset/request/', 'api/password-reset/change/', 'api/password-reset/validate/', 'api/password-reset/resend/']
        
        if any(request.path.startswith(path) for path in exempt_paths):
            return None
            
        auth_header = request.headers.get('Authorization', '')

        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

            # Verificar si está en blacklist
            if TokenBlackList.objects.filter(token=token).exists():
                return JsonResponse(
                    {"error": "Token inválido. La sesión fue cerrada.", "code": "TOKEN_BLACKLISTED"},
                    status=401
                )
            
            # Verificar si el token es válido y no ha expirado
            try:
                AccessToken(token)
            except TokenError:
                return JsonResponse(
                    {"error": "Token expirado o inválido.", "code": "TOKEN_EXPIRED"},
                    status=401
                )

        return None