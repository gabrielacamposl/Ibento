from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, confirmar_usuario

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/confirmar/', confirmar_usuario, name="confirmar_usuario"),
]



