from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# Views para cambio restablecer contraseña
from api.user.views import password_reset_request, password_reset_validate, password_reset_resend, password_reset_change
# Views para el flujo de matches
from api.user.views import matches, sugerencia_usuarios,personas_que_me_dieron_like, obtener_matches, eliminar_match, cambiar_modo_busqueda
# Views para chats
from api.user.views import obtener_mensajes, mis_conversaciones, enviar_mensaje
# views para validar user
from api.user.views import estado_validacion_view, ine_validation_view
# Views par el FCM
from api.user.views import save_fcm_token,notification_status, test_notification,remove_fcm_token

from api.user.views import (crear_usuario, 
                            EventoViewSet,
                            UsuarioViewSet,
                            confirmar_usuario, 
                            login_usuario, 
                            logout_usuario,
                            upload_profile_pictures,
                            get_categorias_perfil,
                            guardar_respuestas_perfil,
                            importar_ticketmaster,
                            like_event,
                            obtener_eventos_favoritos,
                            obtener_match,
                            obtener_usuarios_conversacion,
                            es_favorito,
                            obtener_usuario_info,
                            bloquear_usuario,
                            obtener_match_id,
                            obtener_modo_busqueda,
                            actualizar_perfil,
                            eliminar_evento_favorito
                            )


router = DefaultRouter()

router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [

    # Auth & Register
    path('api/', include(router.urls)),
    path('api/crear-cuenta/', crear_usuario, name='crear_cuenta'),
    path('api/login/', login_usuario, name='login'),
    path('api/confirmar/<uuid:token>/', confirmar_usuario, name="confirmar_usuario"),  
    path("api/logout/", logout_usuario, name="logout"),

    # Cambiar contraseña
    path('api/password-reset/request/', password_reset_request, name='password_reset_request'),
    path('api/password-reset/change/', password_reset_change, name='password_reset_change'),
    path('api/password-reset/validate/', password_reset_validate, name='password_reset_validate'),
    path('api/password-reset/resend/', password_reset_resend, name='password_reset_resend'),
    
    
    # Creación de perfil para acompañantes
    # ---- Subir imágenes de perfil
     path('api/perfil/subir-fotos/', upload_profile_pictures, name='upload-profile-pictures'),
    # ---- Actualizar perfil
    path('api/perfil/actualizar/', actualizar_perfil, name='actualizar_perfil'),
    # ---- Está validado
    path('api/estado-validacion/', estado_validacion_view, name='estado-validacion'),
    # ---- Obtener intereses
    path('api/categorias-perfil/', get_categorias_perfil, name='categorias-perfil'),
    path('api/intereses-respuestas/', guardar_respuestas_perfil, name='guardar_respuestas_perfil'),
    #----- Validación de INE con Kiban
    path('api/validar-ine/', ine_validation_view, name='validar_ine'),

    # Matches
    # ---- Dar like o dislike
    path('api/interaccion/', matches, name='dar_like_dislike'),
    # --- Selección de búsqueda de acompañantes - Por eventos o global-
    path('api/match/modo/', cambiar_modo_busqueda, name='cambiar_modo_busqueda'),
    path('api/match/modo/buscar/', obtener_modo_busqueda, name='obtener_modo_busqueda'),
    # --- Sugerencia de acompañantes
    path('api/matches/sugerencias/', sugerencia_usuarios, name='sugerencias_usuarios'),
    # ---- Futuros acompañantes
    path("api/likes-recibidos/", personas_que_me_dieron_like, name="likes-recibidos"),
    # --- Ver matches
    path('api/matches/', obtener_matches, name='obtener_matches'), 
    # --- Eliminar match
    path('api/matches/<str:match_id>/eliminar/', eliminar_match, name='eliminar_match'),
    
    path('api/matches/<str:match_id>/', obtener_match, name='obtener_match'),
    path('api/bloquear/', bloquear_usuario, name='bloquear_usuario'),
    path('api/matches/<str:match_id>/obtener/', obtener_match_id, name='obtener_match_id'),
    

    # Conversaciones
    path('api/mis-conversaciones/', mis_conversaciones, name='mis_conversaciones'),
    path('api/mensajes/enviar/', enviar_mensaje, name='enviar_mensaje'),
    path('api/mensajes/<str:conversacion_id>/', obtener_mensajes, name='obtener_mensajes'),
    path('api/usuarios/<str:conversacion_id>/conversacion/', obtener_usuarios_conversacion, name='obtener_usuarios_conversacion'),
    path('api/usuarios/<str:pk>/info/', obtener_usuario_info, name='obtener_usuario_info'),
    # Eventos
    path('api/importar-ticketmaster/', importar_ticketmaster, name='importar_ticketmaster'),


    #Acciones User
    path('api/eventos/<str:pk>/like/',like_event,name='DarLikeEvento'),
    path('api/eventos/<str:pk>/favoritos/', obtener_eventos_favoritos, name='obtener_eventos_favoritos'),
    path('api/perfil/favoritos/', obtener_eventos_favoritos, name='obtener_eventos_favoritos'),
    path('api/eventos/<str:pk>/dislike/', eliminar_evento_favorito, name='QuitarLikeEvento'),
    path('api/eventos/<str:evento_id>/es-favorito/', es_favorito, name='es_favorito'),
    
    # Notificaciones URLs para notificaciones FCM
    path('api/save-fcm-token/', save_fcm_token, name='save_fcm_token'),
    path('api/remove-fcm-token/', remove_fcm_token, name='remove_fcm_token'),
    path('api/notification-status/', notification_status, name='notification_status'),
    path('api/test-notification/', test_notification, name='test_notification'),  # Solo para desarrollo
    
  
]