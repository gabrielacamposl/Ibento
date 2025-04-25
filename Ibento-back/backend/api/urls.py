from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.user.views import (crear_usuario, 
                            CategoriaEventoViewSet,
                            SubcategoriaViewSet,
                            EventoViewSet,
                            confirmar_usuario, 
                            login_usuario, 
                            logout_usuario,
                            usuario_preferencias,
                            crear_match,
                            eliminar_match,
                            obtener_matches_usuario,
                            obtener_conversacion,
                            obtener_mensajes,
                            enviar_mensaje,
                            importar_ticketmaster
                            )


router = DefaultRouter()

router.register(r'categorias', CategoriaEventoViewSet, basename='categoria')
router.register(r'subcategorias', SubcategoriaViewSet, basename='subcategoria')
router.register(r'eventos', EventoViewSet, basename='evento')

urlpatterns = [

    # Auth & Register
    path('api/', include(router.urls)),
    path('api/crear-cuenta/', crear_usuario, name='crear_cuenta'),
    path('api/login/', login_usuario, name='login'),
    path('logout/', logout_usuario, name='logout'),
    path('api/confirmar/<uuid:token>/', confirmar_usuario, name="confirmar_usuario"),  
    path("api/logout/", logout_usuario, name="logout"),
    path('usuarios/<str:usuario_id>/preferencias-eventos/', usuario_preferencias, name='usuario_preferencias'),
   # path('usuarios/<int:usuario_id>/preferencias/', guardar_preferencias, name='guardar-preferencias'),
    
    # JWT Tokens
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Matches
    path('matches/crear/', crear_match, name='crear_match'),
    path('matches/<str:usuario_id>/', obtener_matches_usuario, name='obtener_matches_usuario'),
    path('matches/eliminar/<str:match_id>/', eliminar_match, name='eliminar_match'),


    # Conversaciones
    path('conversacion/<str:match_id>/', obtener_conversacion, name='obtener_conversacion'),

    # Mensajes
    path('mensajes/enviar/', enviar_mensaje, name='enviar_mensaje'),
    path('mensajes/<str:conversacion_id>/', obtener_mensajes, name='obtener_mensajes_usuario'),

    #Otras
    path('', include(router.urls)),
    path('importar-ticketmaster/', importar_ticketmaster, name='importar_ticketmaster')

]



