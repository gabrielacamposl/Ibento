from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.user.views import password_reset_request, password_reset_validate, password_reset_resend, password_reset_change
from api.user.views import matches, sugerencia_usuarios,personas_que_me_dieron_like, obtener_matches, eliminar_match, cambiar_modo_busqueda
from api.user.views import obtener_mensajes, mis_conversaciones, enviar_mensaje
from api.user.views import estado_validacion_view, ine_validation_view
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
                            eliminar_evento_favorito,
                            obtener_eventos_favoritos
                            )


router = DefaultRouter()

router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [

    # Auth & Register
    path('api/', include(router.urls)),
    path('api/crear-cuenta/', crear_usuario, name='crear_cuenta'),
    path('api/login/', login_usuario, name='login'),
    path('logout/', logout_usuario, name='logout'),
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
    # ---- Está validado
    path('api/estado-validacion/', estado_validacion_view, name='estado-validacion'),
    # ---- Obtener intereses
    path('api/categorias-perfil/', get_categorias_perfil, name='categorias-perfil'),
    path('api/guardar-respuestas/', guardar_respuestas_perfil, name='guardar-respuestas'),
    #----- Validación de INE con Kiban
    path('api/validar-ine/', ine_validation_view, name='validar_ine'),

    # Matches
    path('api/interaccion/', matches, name='dar_like_dislike'),
    path('api/match/modo/', cambiar_modo_busqueda, name='cambiar_modo_busqueda'),
    path('api/matches/sugerencias/', sugerencia_usuarios, name='sugerencias_usuarios'),
    path('api/matches/', obtener_matches, name='obtener_matches'), 
    path('api/matches/<str:match_id>/eliminar/', eliminar_match, name='eliminar_match'),
    
    # Likes recibidos
    path("api/likes-recibidos/", personas_que_me_dieron_like, name="likes-recibidos"),

    # Conversaciones
    path('api/mis-conversaciones/', mis_conversaciones, name='mis_conversaciones'),
    path('api/mensajes/enviar/', enviar_mensaje, name='enviar_mensaje'),
    path('api/mensajes/<str:conversacion_id>/', obtener_mensajes, name='obtener_mensajes'),
  
    #Otras
    path('', include(router.urls)),
    path('api/importar-ticketmaster/', importar_ticketmaster, name='importar_ticketmaster'),


    #Acciones User
    path('api/eventos/<str:pk>/like/',like_event,name='DarLikeEvento'),
    path('api/eventos/<str:pk>/dislike/', eliminar_evento_favorito, name='QuitarLikeEvento'),
    path('api/eventos/<str:pk>/favoritos/', obtener_eventos_favoritos, name='obtener_eventos_favoritos')

]