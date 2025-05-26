from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse  # ← ESTE IMPORT FALTABA

def api_root(request):
    return JsonResponse({
        "message": "Ibento API",
        "version": "1.0",
        "status": "active"
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('api.urls')),
    path('adminuser/',include('api.admin.urls')),
    path('health/', api_root, name='api_root'),  # Endpoint de salud
]
