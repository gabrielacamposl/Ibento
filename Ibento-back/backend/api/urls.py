from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.user.views import password_reset_request, password_reset_validate, password_reset_resend, password_reset_change
from api.user.views import estado_validacion_view, ine_validation_view
from api.user.views import (crear_usuario, 
                            EventoViewSet,
                            confirmar_usuario, 
                            login_usuario, 
                            logout_usuario,
                            upload_profile_pictures,
                            get_categorias_perfil,
                            guardar_respuestas_perfil,
                            crear_match,
                            eliminar_match,
                            obtener_matches_usuario,
                            matches_con_y_sin_mensajes,
                            obtener_conversacion,
                            obtener_mensajes,
                            enviar_mensaje,
                            importar_ticketmaster,
                            )


router = DefaultRouter()

router.register(r'eventos', EventoViewSet, basename='evento')

urlpatterns = [

    # Auth & Register
    path('api/', include(router.urls)),
    path('api/crear-cuenta/', crear_usuario, name='crear_cuenta'),
    path('api/login/', login_usuario, name='login'),
    path('logout/', logout_usuario, name='logout'),
    path('api/confirmar/<uuid:token>/', confirmar_usuario, name="confirmar_usuario"),  
    path("api/logout/", logout_usuario, name="logout"),

    # Cambiar contraseña
    path('password-reset/request/', password_reset_request, name='password_reset_request'),
    path('password-reset/change/', password_reset_change, name='password_reset_change'),
    path('password-reset/validate/', password_reset_validate, name='password_reset_validate'),
    path('password-reset/resend/', password_reset_resend, name='password_reset_resend'),

    # Creación de perfil para acompañantes
    # ---- Subir imágenes de perfil
     path('perfil/subir-fotos/', upload_profile_pictures, name='upload-profile-pictures'),
    # ---- Está validado
    path('estado-validacion/', estado_validacion_view, name='estado-validacion'),
    # ---- Obtener intereses
    path('categorias-perfil/', get_categorias_perfil, name='categorias-perfil'),
    path('api/guardar-respuestas/', guardar_respuestas_perfil, name='guardar-respuestas'),
    #----- Validación de INE con Kiban
    path('api/validar-ine/', ine_validation_view, name='validar_ine'),

    # Matches
    path('matches/crear/', crear_match, name='crear_match'),
    path('matches/<str:usuario_id>/', obtener_matches_usuario, name='obtener_matches_usuario'),
    path('matches/<str:usuario_id>/<str:match_id>/delete/', eliminar_match, name='eliminar_match'),

    path('matches/<str:usuario_id>/mensajes_estado/',matches_con_y_sin_mensajes, name='matches_con_y_sin_mensajes'),


    # Conversaciones
    path('conversacion/<str:match_id>/', obtener_conversacion, name='obtener_conversacion'),

    # Mensajes
    path('mensajes/enviar/', enviar_mensaje, name='enviar_mensaje'),
    path('mensajes/<str:conversacion_id>/', obtener_mensajes, name='obtener_mensajes_usuario'),

    #Otras
    path('', include(router.urls)),
    path('importar-ticketmaster/', importar_ticketmaster, name='importar_ticketmaster')

]



