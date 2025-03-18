from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.user.views import UsuarioViewSet, confirmar_usuario, login_usuario


router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/login/',login_usuario, name='login_usuario'),
    path('api/confirmar/<uuid:token>/', confirmar_usuario, name="confirmar_usuario"),  
]



