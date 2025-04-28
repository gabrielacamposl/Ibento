from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
import json
import random
from datetime import datetime, timezone, timedelta
from math import radians, sin, cos, sqrt, atan2

# Imports para eñ reconocimiento facial
# import base64
# import numpy as np
# from PIL import Image
# from io import BytesIO
# import dlib
# from scipy.spatial import distance

#Servicio de ticketmaster
from api.services.ticketmaster import guardar_eventos_desde_json
from django.utils import timezone
from api.utils import enviar_email_confirmacion, enviar_codigo_recuperacion
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
# Importar modelos 
from api.models import Usuario, Mensaje, Matches, Conversacion, Subcategoria, Evento
from api.models import CategoriaEvento, TokenBlackList
from .serializers import (UsuarioSerializer,   # Serializers para el auth & register
                          LoginSerializer,
                          Logout, 
                          # Serializer para selección de categorías de eventos
                          # Cambiar contraseña
                          PasswordResetRequestSerializer,
                          PasswordResetCodeValidationSerializer,
                          PasswordResetSerializer,
                          # Serializer para creación del perfil para búsqueda de acompañantes
                          UploadProfilePicture,
                          PersonalData,
                          PersonalPreferences,
                          UploadINE,
                          ValidacionRostro,
                          # Serializers para creación de matches
                          MatchSerializer,
                          # Serializer para los chats de los matches
                          MensajesSerializer,
                          ConversacionSerializer,
                          # Seriallizer para añadir categorías y sucategorías de los eventos
                          CategoriaEventoSerializer, 
                          SubcategoriaSerializer,
                          # Seriallizer de Eventos
                          EventoSerializer,
                          EventoSerializerLimitado,
                          EventoSerializerLimitadoWithFecha,
                          EventoWithDistanceSerializer
                          )

# face_detector = dlib.get_frontal_face_detector()
# shape_predictor = dlib.shape_predictor("modelos/shape_predictor_68_face_landmarks.dat")
# face_rec_model = dlib.face_recognition_model_v1("modelos/dlib_face_recognition_resnet_model_v1.dat")


# ------------------------------------------- CREACIÓN DEL USUARIO   --------------------------------------

# --------- Crear un nuevo usuario

@api_view(["POST"])
@permission_classes([AllowAny])
def crear_usuario(request):
    serializer = UsuarioSerializer(data=request.data)
    if serializer.is_valid():
        usuario = serializer.save()
        enviar_email_confirmacion(usuario)
        return Response({"mensaje": "Usuario registrado, revisa tu correo."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# --------- Confirmación de cuenta

@api_view(['GET'])  # GET para confirmar la cuenta
def confirmar_usuario(request, token):
    try:
        # Intentamos obtener el usuario usando el token
        usuario = get_object_or_404(Usuario, token=token)
        
        # Verificamos si ya está confirmado
        if usuario.is_confirmed:
            return JsonResponse({"mensaje": "Este usuario ya ha sido confirmado."}, status=status.HTTP_400_BAD_REQUEST)

        # Confirmar la cuenta
        usuario.is_confirmed = True
        usuario.save()
        return JsonResponse({"mensaje": "Cuenta confirmada exitosamente."}, status=status.HTTP_200_OK)

    except Usuario.DoesNotExist:
        return JsonResponse({"mensaje": "El token no es válido o ha expirado."}, status=status.HTTP_400_BAD_REQUEST)




# -------------------------------------------- LOGIN Y LOGOUT DEL USUARIO  ----------------------------------------------

# ------------- Login

@api_view(["POST"])
@permission_classes([AllowAny])
def login_usuario(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------- Logout

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_usuario(request):
    auth_header = request.headers.get("Authorization", "")

    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        TokenBlackList.objects.get_or_create(token=token)
        return Response({"mensaje": "Sesión cerrada correctamente."}, status=status.HTTP_205_RESET_CONTENT)

    return Response({"error": "Token no proporcionado"}, status=status.HTTP_400_BAD_REQUEST)


# ------------- CAMBIAR CONTRASEÑA -----------------------------------------------------------------

# ---- Enviar Token al correo
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = Usuario.objects.get(email=email)
            codigo = str(random.randint(100000, 999999))  # 6 dígitos
            user.codigo_reset_password = codigo
            user.codigo_reset_password_expiration = timezone.now() + timezone.timedelta(minutes=10)
            user.save()

            enviar_codigo_recuperacion(email, codigo)

            return Response({"message": "Código enviado al correo."}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---- Validar código 
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_validate(request):
    serializer = PasswordResetCodeValidationSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        codigo = serializer.validated_data['codigo']
        try:
            user = Usuario.objects.get(email=email)
            if user.codigo_reset_password != codigo:
                return Response({"error": "Código inválido."}, status=status.HTTP_400_BAD_REQUEST)
            if timezone.now() > user.codigo_reset_password_expiration:
                return Response({"error": "El código ha expirado."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Código válido."}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----- Cambiar contraseña
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']
        codigo = serializer.validated_data['codigo']
        try:
            user = Usuario.objects.get(email=email)
            if user.codigo_reset_password != codigo:
                return Response({"error": "Código inválido."}, status=status.HTTP_400_BAD_REQUEST)
            if timezone.now() > user.codigo_reset_password_expiration:
                return Response({"error": "El código ha expirado."}, status=status.HTTP_400_BAD_REQUEST)

            user.password = make_password(new_password)
            user.codigo_reset_password = None
            user.codigo_reset_password_expiration = None
            user.save()
            return Response({"message": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----- Reeenviar token nuevemente

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_resend(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = Usuario.objects.get(email=email)

            # Verificamos si pasaron al menos 2 minutos desde que pidió el primer código
            if user.codigo_reset_password_expiration:
                tiempo_transcurrido = timezone.now() - (user.codigo_reset_password_expiration - timezone.timedelta(minutes=10))
                if tiempo_transcurrido.total_seconds() < 120:  # 120 segundos = 2 minutos
                    return Response({"error": "Debes esperar 2 minutos para reenviar el código."}, status=status.HTTP_400_BAD_REQUEST)

            # Generar un nuevo código
            nuevo_codigo = str(random.randint(100000, 999999))
            user.codigo_reset_password = nuevo_codigo
            user.codigo_reset_password_expiration = timezone.now() + timezone.timedelta(minutes=10)
            user.save()

            enviar_codigo_recuperacion(email, nuevo_codigo)

            return Response({"message": "Nuevo código enviado al correo."}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------- CREACIÓN DEL PERFIL PARA LA BUSQUEDA DE ACOMPAÑANTES --------------------------------

# Upload Photos
@api_view(['POST'])
def upload_profile_pictures(request):
    usuario = request.user  # Se obtiene el usuario autenticado
    serializer = UploadProfilePicture(data=request.data)

    if serializer.is_valid():
        serializer.save(usuario)
        return Response({"mensaje": "Fotos de perfil guardadas correctamente."}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Save Personal Preferences
@api_view(['POST'])
def save_personal_preferences(request):
    usuario = request.user
    serializer = PersonalPreferences(data=request.data)

    if serializer.is_valid():
        serializer.save(usuario)
        return Response({"mensaje": "Preferencias guardadas exitosamente."}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Save Personal Data

@api_view(['POST'])
def save_personal_data(request):
    usuario = request.user
    serializer = PersonalData(data=request.data)

    if serializer.is_valid():
        serializer.save(usuario)
        return Response({"mensaje": "Datos personales guardados correctamente."}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# ------------------------------------------------ VALIDACIÓN DE PERFIL ---------------------------------------------

# --------- Subir INE para Validar el Perfil 

@api_view(['POST'])
def upload_ine(request):
    usuario = request.user
    serializer = UploadINE(data=request.data)

    if serializer.is_valid():
        ine_f = serializer.validated_data['ine_f']
        ine_m = serializer.validated_data['ine_m']
        
        # Simulación de API externa que valida la INE
        #ine_validada = validar_ine_con_api(ine_f, ine_m)
        ine_validada = True

        if ine_validada:
            usuario.is_ine_validated = True
            usuario.save()
            return Response({"mensaje": "INE validada correctamente."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "INE no válida."}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----------- Comparación de Rostros 

# def get_face_descriptor(image, face):
#     shape = shape_predictor(image, face)
#     return face_rec_model.compute_face_descriptor(image, shape)

# @api_view(['POST'])
# def comparar_rostros(request):
#     usuario = request.user
#     serializer = CompararRostroSerializer(data=request.data)

#     if serializer.is_valid():
#         foto_camara = serializer.validated_data['foto_camara']
        
#         # Simulación de API externa que compara rostros
#         # rostro_coincide = comparar_rostro_con_ine(usuario, foto_camara)
#         rostro_coincide = True
#         if rostro_coincide:
#             usuario.is_validated_camera = True
#             usuario.save()
#             return Response({"mensaje": "Rostro validado exitosamente."}, status=status.HTTP_200_OK)
#         else:
#             return Response({"error": "El rostro no coincide con la INE."}, status=status.HTTP_400_BAD_REQUEST)

#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def completar_perfil(request):
    usuario = request.user
    data = request.data

    usuario.profile_pic = data.get('profile_pictures', usuario.profile_pic)
    usuario.preferencias_generales = data.get('preferences', usuario.preferencias_generales)
    usuario.description = data.get('description', usuario.description)
    usuario.birthday = data.get('birthday', usuario.birthday)
    usuario.gender = data.get('gender', usuario.gender)
    usuario.curp = data.get('curp', usuario.curp)

    usuario.is_ine_validated = data.get('is_ine_validated', usuario.is_ine_validated)
    usuario.is_validated_camera = data.get('is_validated_camera', usuario.is_validated_camera)

    usuario.save()

    return Response({"mensaje": "Perfil completado exitosamente."}, status=status.HTTP_200_OK)


# -------------------------------------- CREACIÓN DE MATCHES -------------------------------------------

# ------- Crear Match

@api_view(["POST"])
def crear_match(request):
    
    usuario_a_id = request.data.get("usuario_a")
    usuario_b_id = request.data.get("usuario_b")

    if usuario_a_id == usuario_b_id:
        return Response({"error": "No puedes hacer match."}, status=status.HTTP_400_BAD_REQUEST)

    # Evitar duplicados (match en ambos sentidos)
    match_existente = Matches.objects.filter(
        Q(usuario_a_id=usuario_a_id, usuario_b_id=usuario_b_id) |
        Q(usuario_a_id=usuario_b_id, usuario_b_id=usuario_a_id)
    ).first()

    if match_existente:
        return Response({"message": "El match ya existe."}, status=status.HTTP_200_OK)

    # Crear Match y Conversación
    match = Matches.objects.create(usuario_a_id=usuario_a_id, usuario_b_id=usuario_b_id)
    Conversacion.objects.create(match=match, usuario_a_id=usuario_a_id, usuario_b_id=usuario_b_id)

    return Response({"message": "Match y Conversación creados"}, status=status.HTTP_201_CREATED)


# ------- Ver Matches

@api_view(["GET"])
def obtener_matches_usuario(request, usuario_id):
    
    matches = Matches.objects.filter(models.Q(usuario_a_id=usuario_id) | models.Q(usuario_b_id=usuario_id))
    serializer = MatchSerializer(matches, many=True)
    return Response(serializer.data)

# ------- Eliminar Match

@api_view(['DELETE'])
def eliminar_match(request, match_id):
    try:
        match = Matches.objects.get(id=match_id)
        match.delete()
        return Response({'mensaje': 'Match eliminado correctamente'}, status=204)
    except Matches.DoesNotExist:
        return Response({'error': 'Match no encontrado'}, status=404)
    


# -------------------------------------- MENSAJERÍA CON MATCHES -------------------------------------------

# ------- Ver chats 

@api_view(["GET"])
def obtener_conversacion(request, match_id):
    
    conversacion = Conversacion.objects.get(match_id=match_id)
    serializer = ConversacionSerializer(conversacion)
    return Response(serializer.data)

# ------- Enviar Mensaje

@api_view(["POST"])
def enviar_mensaje(request):
    
    conversacion_id = request.data.get("conversacion_id")
    remitente_id = request.data.get("remitente_id")
    receptor_id = request.data.get("receptor_id")
    contenido = request.data.get("contenido")

    conversacion = Conversacion.objects.get(_id=conversacion_id)

    mensaje = Mensaje.objects.create(
        conversacion=conversacion,
        remitente_id=remitente_id,
        receptor_id=receptor_id,
        mensaje=contenido
    )

    # # Enviar notificación push al receptor
    # devices = FCMDevice.objects.filter(user_id=receptor_id)
    # devices.send_message(
    #     title="Nuevo Mensaje",
    #     body=f"Tienes un nuevo mensaje de {mensaje.remitente.nombre}",
    #     data={"conversacion_id": conversacion_id}
    # )

    serializer = MensajesSerializer(mensaje)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


#---------- Paginación de mensajes
class MensajePagination(PageNumberPagination):
    page_size = 10  # Cambia este número por la cantidad de mensajes por página
    page_size_query_param = 'page_size'
    max_page_size = 100  # Esto es opcional, define el máximo que puede pedir un cliente


 # ------- Obtener Mensajes de los Chats
@api_view(["GET"])
def obtener_mensajes(request, conversacion_id):
    # # -------- Ver. convencional - sin paginación
    # conversacion = Conversacion.objects.get(_id=conversacion_id)
    # mensajes = Mensaje.objects.filter(conversacion=conversacion).order_by('-fecha_creacion')
    # serializer = MensajesSerializer(mensajes, many=True)
    # return Response(serializer.data)
    try:
        conversacion = Conversacion.objects.get(_id=conversacion_id)
    except Conversacion.DoesNotExist:
        return Response({"error": "Conversación no encontrada."}, status=404)
    
    mensajes = Mensaje.objects.filter(conversacion=conversacion).order_by('fecha_creacion')
    paginator = MensajePagination()
    resultado_paginado = paginator.paginate_queryset(mensajes, request)
    serializer = MensajesSerializer(resultado_paginado, many=True)
    return paginator.get_paginated_response(serializer.data)


# --------- Crear evento
@api_view(['POST'])
def importar_ticketmaster(request):
    with open("api/user/ticketmaster_events_max.json", "r", encoding="utf-8") as f:
        eventos_json = json.load(f)
    guardar_eventos_desde_json(eventos_json)
    return Response({'mensaje': 'Eventos importados correctamente'})


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radio promedio de la Tierra en km

    # Convertir grados a radianes
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)

    # Diferencia de longitudes y latitudes
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    # Aplicar la fórmula de Haversine
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c
    return distance

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def most_liked(self, request):

        queryset = self.get_queryset().order_by('-numLike')[:100]
        serializer = EventoSerializerLimitado(queryset, many=True)
        return Response(serializer.data)
    

    @action(detail=False, methods=['get'])
    def upcoming_events(self, request):

        now = datetime.now(timezone.utc)
        fecha_mas_siete_dias = now + timedelta(days=7)
        
        eventosProximos = []

        for event in self.get_queryset():
            cadena_primera_fecha = None
            objeto_primera_fecha = None

            if event.dates and isinstance(event.dates, list) and event.dates:
                cadena_primera_fecha = event.dates[0]

            if cadena_primera_fecha and isinstance(cadena_primera_fecha, str):
                try:
                    date_obj = datetime.fromisoformat(cadena_primera_fecha.replace('Z', '+00:00'))

                    if date_obj.tzinfo is None:
                        date_obj = date_obj.replace(tzinfo = timezone.utc)
                    objeto_primera_fecha = date_obj
                
                except (ValueError, TypeError):
                    pass

            if objeto_primera_fecha and now <= objeto_primera_fecha <= fecha_mas_siete_dias:
                eventosProximos.append({'event': event, 'date_to_sort_by': objeto_primera_fecha})

        sorted_events = sorted(eventosProximos, key=lambda x: x['date_to_sort_by'])

        upcoming_events = [item['event'] for item in sorted_events]

        serializer = EventoSerializerLimitadoWithFecha(upcoming_events, many=True)

        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def nearest(self, request):
        
        # Obtener latitud y longitud de los parámetros de consulta
        latitude = request.query_params.get('lat')
        longitude = request.query_params.get('lon')

        if not latitude or not longitude:
            return Response(
                {"detail": "Se requieren los parámetros de consulta 'lat' y 'lon'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not latitude or not longitude:
            return Response(
                {"detail": "Se requieren los parámetros de consulta 'lat' y 'lon'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user_lat = float(latitude)
            user_lon = float(longitude)
        except ValueError:
            return Response(
                {"detail": "Los parámetros 'lat' y 'lon' deben ser números válidos."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        eventos_distancia = []

        for event in self.get_queryset():
            if event.coordenates and isinstance(event.coordenates, list) and len(event.coordenates) == 2:
                event_lat, event_lon = event.coordenates
                try:
                    event_lat_float = float(event_lat)
                    event_lon_float = float(event_lon)

                    distance = haversine_distance(user_lat, user_lon, event_lat_float, event_lon_float)
                    eventos_distancia.append({'event': event, 'distance': distance})
                except (TypeError, ValueError):
                    pass
        eventos_ordenados = sorted(eventos_distancia, key = lambda x: x['distance'])

        eventos_mas_cercanos = [item['event'] for item in eventos_ordenados]

        serializer = EventoWithDistanceSerializer(eventos_mas_cercanos, many=True)
        
        return Response(serializer.data)
#----------------- Obtención de eventos




# -------------------------------------- CATEGORÍAS Y SUBCATEGORÍAS DE EVENTOS -------------------------------------------

# -------  Categorías de Eventos
class CategoriaEventoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaEvento.objects.all()
    serializer_class = CategoriaEventoSerializer
    
# ------- Subcategorías de Eventos

class SubcategoriaViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer
