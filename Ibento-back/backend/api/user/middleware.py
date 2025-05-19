from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from api.models import TokenBlackList

class JWTBlacklistMiddleware(MiddlewareMixin):
    def process_request(self, request):
        auth_header = request.headers.get('Authorization', '')

        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

            if TokenBlackList.objects.filter(token=token).exists():
                return JsonResponse(
                    {"error": "Token inválido. La sesión fue cerrada."},
                    status=401
                )

        return None  # Continuar con la petición normal si no está en blacklist
