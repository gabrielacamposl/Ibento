# Rest Framework Django
from rest_framework import viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action, parser_classes
from rest_framework.parsers import MultiPartParser
# Utils Django
from django.utils import timezone
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.hashers import make_password
from django.db.models import Q
# Libraries
import json
import random
from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2
# Cloudinary
import cloudinary.uploader
import PIL
# Envio de correos
from api.utils import enviar_email_confirmacion, enviar_codigo_recuperacion
#Servicio de ticketmaster
from api.services.ticketmaster import guardar_eventos_desde_json
# Servicio de INES
from api.services.ine_validation import (upload_image_to_cloudinary, delete_image_from_cloudinary, url_to_base64, ocr_ine, validate_ine)
# Importar modelos 
from api.models import Usuario, Evento, TokenBlackList
from api.models import Matches,  Conversacion, Mensaje
from api.models import CategoriasPerfil
# Importar Serializers
from .serializers import (UsuarioSerializer,   # Serializers para el auth & register
                          LoginSerializer,
                          # Serializer para selección de categorías de eventos
                          # Cambiar contraseña
                          PasswordResetRequestSerializer,
                          PasswordResetChangeSerializer,
                          PasswordResetCodeValidationSerializer,
                          # Serializer para creación del perfil para búsqueda de acompañantes
                          UploadProfilePicture,
                          CategoriaPerfilSerializer,
                          ValidacionRostro,
                          # Serializers para creación de matches
                          MatchSerializer,
                          # Serializer para los chats de los matches
                          MensajesSerializer,
                          ConversacionSerializer,
                          # Seriallizer de Eventos
                          EventoSerializer,
                          EventoSerializerLimitado,
                          EventoSerializerLimitadoWithFecha,
                          )

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


# ------ Reesetear contraseña

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_change(request):
    serializer = PasswordResetChangeSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']
        try:
            user = Usuario.objects.get(email=email)

            # Asegúrate de que el usuario haya validado un código antes
            if not user.codigo_reset_password:
                return Response({"error": "No autorizado para cambiar contraseña."}, status=status.HTTP_403_FORBIDDEN)

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

# ------- Seleccionar intereses para el perfil
# Mostrar Intereses


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_categorias_perfil(request):
    categorias = CategoriasPerfil.objects.all()
    serializer = CategoriaPerfilSerializer(categorias, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Guardar respuestas del perfil
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guardar_respuestas_perfil(request):
    usuario = request.user
    respuestas = request.data.get("respuestas", [])

    preferencias = []

    for r in respuestas:
        categoria_id = r.get("categoria_id")
        respuesta = r.get("respuesta")

        try:
            categoria = CategoriasPerfil.objects.get(_id=categoria_id)
        except CategoriasPerfil.DoesNotExist:
            continue  # o devuelve error ?

        # Validación: si multi_option es False, la respuesta debe ser una sola
        if not categoria.multi_option and isinstance(respuesta, list):
            return Response(
                {"error": f"La pregunta '{categoria.question}' no permite múltiples opciones."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validación opcional: ¿es obligatoria u opcional?
        if not respuesta and not categoria.optional:
            return Response(
                {"error": f"La pregunta '{categoria.question}' es obligatoria."},
                status=status.HTTP_400_BAD_REQUEST
            )

        preferencias.append({
            "categoria_id": categoria._id,
            "pregunta": categoria.question,
            "respuesta": respuesta
        })

    # Guardamos en el campo preferencias_generales
    usuario.preferencias_generales = preferencias
    usuario.save()

    return Response({"message": "Preferencias guardadas correctamente."}, status=status.HTTP_200_OK)

# ---- Subir fotos de perfil para búsqueda de acompañantes
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_pictures(request):
    usuario = request.user
    serializer = UploadProfilePicture(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_images = serializer.validated_data['pictures']
    current_photos = usuario.profile_pic or []

    if len(current_photos) + len(new_images) > 6:
        max_allowed = 6 - len(current_photos)
        return Response(
            {"error": f"Solo puedes subir {max_allowed} foto(s) más."},
            status=status.HTTP_400_BAD_REQUEST
        )

    uploaded_urls = []

    for image in new_images:
        try:
            result = cloudinary.uploader.upload(
                image,
                folder="usuarios/perfiles",
                transformation=[
                    {"width": 800, "height": 800, "crop": "limit", "quality": "auto"}
                ]
            )
            uploaded_urls.append(result['secure_url'])
        except Exception as e:
            return Response(
                {"error": "Error al subir una imagen.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    usuario.profile_pic = current_photos + uploaded_urls
    usuario.save(update_fields=['profile_pic'])

    return Response({
        "message": "Fotos subidas correctamente.",
        "pictures": usuario.profile_pic
    }, status=status.HTTP_200_OK)

# Eliminar fotos de la nube
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_picture(request, photo_url):
    usuario = request.user
    current_photos = usuario.profile_pic or []

    if photo_url not in current_photos:
        return Response(
            {"error": "La foto no existe."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Eliminar la URL de la foto
    current_photos.remove(photo_url)
    usuario.profile_pic = current_photos
    usuario.save(update_fields=['profile_pic'])

    return Response({
        "message": "Foto eliminada correctamente.",
        "pictures": usuario.profile_pic
    }, status=status.HTTP_200_OK)


# ------------------------------------------------ VALIDACIÓN DE PERFIL ---------------------------------------------
# --------- Subir INE para Validar el Perfil 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def ine_validation_view(request):
    ine_front = request.FILES.get('ine_front')
    ine_back = request.FILES.get('ine_back')
    
    if not ine_front or not ine_back:
        return Response({"error": "Ambas imágenes de la INE son requeridas."}, status=status.HTTP_400_BAD_REQUEST)
    # Subir imágenes a Cloudinary
    
    try: 
        #Subir imágenes a Cloudinary de manera temporal
        front_url, front_id = upload_image_to_cloudinary(ine_front, name="front_ine")
        back_url, back_id = upload_image_to_cloudinary(ine_back, name="ine_back")
        
        # Convertir URLs a base64
        front_b64 = url_to_base64(front_url)
        back_b64 = url_to_base64(back_url)
        
        # Extraer datos de la INE
        cic, id_ciudadano, curp = ocr_ine(front_b64, back_b64)
        if not cic or not id_ciudadano:
            return Response({"error": "Error al extraer datos de la INE."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar la INE
        is_valid = validate_ine(cic, id_ciudadano)
        if not is_valid:
            return Response({"error": "La INE no es válida."}, status=status.HTTP_400_BAD_REQUEST)
        # Guardar datos en el usuario
        user : Usuario = request.user
        user.is_ine_validated = is_valid
        if curp:
            user.curp = curp
        user.save()

        return Response({"mensaje": "INE validada exitosamente."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    finally:
        # Eliminar imágenes de Cloudinary
        if front_id:
            delete_image_from_cloudinary(front_id)
        if back_id:
            delete_image_from_cloudinary(back_id)



# ----------- Comparación de Rostros 




# -------------------------------------- PERFIL MATCH - USER ----------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estado_validacion_view(request):
    user = request.user

    return Response({
        "is_ine_validated": user.is_ine_validated,
        "is_validated_camera": user.is_validated_camera
    })

# -------------------------------------- CREACIÓN DE MATCHES -------------------------------------------

# ------- Crear Match
@api_view(["POST"])
def crear_match(request):
    
    usuario_a_id = request.data.get("usuario_a")
    usuario_b_id = request.data.get("usuario_b")

    if usuario_a_id == usuario_b_id:
        return Response({"error": "No puedes hacer match contigo mismo."}, status=status.HTTP_400_BAD_REQUEST)

    # Evitar duplicados (match en ambos sentidos)
    match_existente = Matches.objects.filter(
        Q(usuario_a_id=usuario_a_id, usuario_b_id=usuario_b_id) |
        Q(usuario_a_id=usuario_b_id, usuario_b_id=usuario_a_id)
    ).first()

    if match_existente:
        return Response({"message": "El match ya existe."}, status=status.HTTP_200_OK)

    # Crear Match
    match = Matches.objects.create(usuario_a_id=usuario_a_id, usuario_b_id=usuario_b_id)

    # Obtener usuarios
    usuario_a = Usuario.objects.get(_id=usuario_a_id)
    usuario_b = Usuario.objects.get(_id=usuario_b_id)

    # Agregar el match a ambos usuarios (si no está ya en la lista)
    if match._id not in usuario_a.matches:
        usuario_a.matches.append(match._id)
    if match._id not in usuario_b.matches:
        usuario_b.matches.append(match._id)

    # Guardar los usuarios con el nuevo match
    usuario_a.save()
    usuario_b.save()

    # Crear Conversación
    Conversacion.objects.create(match=match, usuario_a_id=usuario_a_id, usuario_b_id=usuario_b_id)

    return Response({"message": "Match y Conversación creados y reflejados en ambos usuarios."}, status=status.HTTP_201_CREATED)


# ------- Ver Matches

@api_view(["GET"])
def obtener_matches_usuario(request, usuario_id):
    try:
        # Obtener todos los matches donde el usuario sea el usuario_a o usuario_b
        matches_usuario_a = Matches.objects.filter(usuario_a=usuario_id)
        matches_usuario_b = Matches.objects.filter(usuario_b=usuario_id)

        # Unir ambos conjuntos de matches
        matches = matches_usuario_a | matches_usuario_b

        # Serializar los matches
        serializer = MatchSerializer(matches, many=True)

        # Devolver la respuesta con los matches
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Matches.DoesNotExist:
        return Response({"error": "No matches found for this user."}, status=status.HTTP_404_NOT_FOUND)


# ------ Eliminar match
@api_view(["DELETE"])
def eliminar_match(request, usuario_id, match_id):
    # Buscar el match por su _id
    match = get_object_or_404(Matches, _id=match_id)
    
    # Verificar si el usuario está involucrado en este match
    if match.usuario_a._id != usuario_id and match.usuario_b._id != usuario_id:
        return Response({"error": "Este usuario no está involucrado en el match."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Eliminar el match de la lista de matches de ambos usuarios
    usuario_a = match.usuario_a
    usuario_b = match.usuario_b
    
    # Eliminar el match de los campos 'matches' de ambos usuarios
    if match._id in usuario_a.matches:
        usuario_a.matches.remove(match._id)
    if match._id in usuario_b.matches:
        usuario_b.matches.remove(match._id)
    
    # Guardar los cambios en los usuarios
    usuario_a.save()
    usuario_b.save()

    # Eliminar la conversación asociada (si también deseas eliminarla)
    Conversacion.objects.filter(match=match).delete()

    # Eliminar el match de la base de datos
    match.delete()

    return Response({"message": "Match eliminado con éxito."}, status=status.HTTP_200_OK)


# --------------------------------------  CONVERSACIONES ------------------------------------------------


@api_view(["GET"])
def matches_con_y_sin_mensajes(request, usuario_id):
    matches = Matches.objects.filter(
        Q(usuario_a_id=usuario_id) | Q(usuario_b_id=usuario_id)
    )

    con_mensajes = []
    sin_mensajes = []

    for match in matches:
        try:
            conversacion = Conversacion.objects.get(match=match)
            tiene_mensajes = Mensaje.objects.filter(conversacion=conversacion).exists()

            # Identificar el "otro" usuario
            otro_usuario = match.usuario_b if match.usuario_a._id == usuario_id else match.usuario_a

            if tiene_mensajes:
                con_mensajes.append(otro_usuario)
            else:
                sin_mensajes.append(otro_usuario)

        except Conversacion.DoesNotExist:
            # Podrías también decidir incluir matches sin conversación
            continue

    return Response({
        "con_mensajes": UsuarioSerializer(con_mensajes, many=True).data,
        "sin_mensajes": UsuarioSerializer(sin_mensajes, many=True).data
    }, status=status.HTTP_200_OK)


# ----- Crear conversación
@api_view(["POST"])
def crear_conversacion(request):
    match_id = request.data.get("match_id")

    # Validar que el match existe
    try:
        match = Matches.objects.get(_id=match_id)
    except Matches.DoesNotExist:
        return Response({"error": "El match no existe."}, status=status.HTTP_404_NOT_FOUND)

    # Validar que aún no existe una conversación
    if Conversacion.objects.filter(match=match).exists():
        return Response({"message": "Ya existe una conversación para este match."}, status=status.HTTP_200_OK)

    # Crear la conversación
    conversacion = Conversacion.objects.create(
        match=match,
        usuario_a=match.usuario_a,
        usuario_b=match.usuario_b
    )

    return Response({
        "message": "Conversación creada con éxito.",
        "conversacion_id": conversacion._id
    }, status=status.HTTP_201_CREATED)


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
    def everything(self, request):
        queryset = self.get_queryset()
        serializer = EventoSerializer(queryset, many=True)
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

        latitude = request.query_params.get('lat')
        longitude = request.query_params.get('lon')

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
        
        now = datetime.now(timezone.utc)

        events_with_distance = []

        for event in self.get_queryset():

            # --- Validación de Fecha (solo considerar eventos futuros) ---
            is_upcoming = False
            if event.dates and isinstance(event.dates, list) and event.dates:
                first_date_str = event.dates[0] # Tomar solo el primer elemento
                if isinstance(first_date_str, str):
                    try:
                        # Parsear la primera fecha ISO 8601 con zona horaria
                        date_obj = datetime.fromisoformat(first_date_str.replace('Z', '+00:00'))
                        # Asegurarse de que la fecha parseada tenga información de zona horaria
                        if date_obj.tzinfo is None:
                            date_obj = date_obj.replace(tzinfo=timezone.utc)

                        # Verificar si la fecha es igual o posterior a la hora actual
                        if date_obj >= now:
                            is_upcoming = True
                    except (ValueError, TypeError):
                        # Si hay un error al parsear la fecha, el evento no se considera "upcoming"
                        pass

            if is_upcoming and event.coordenates and isinstance(event.coordenates, list) and len(event.coordenates) == 2:
                event_lat, event_lon = event.coordenates
                try:
                    event_lat_float = float(event_lat)
                    event_lon_float = float(event_lon)
                    distance = haversine_distance(user_lat, user_lon, event_lat_float, event_lon_float)
                    # Almacenamos el objeto evento y la distancia calculada en un diccionario
                    events_with_distance.append({'event': event, 'distance': distance})
                except (TypeError, ValueError):
                    pass # Ignorar eventos con coordenadas inválidas

        # Ordenar los eventos por distancia
        sorted_events_data = sorted(events_with_distance, key=lambda x: x['distance'])

        # --- Limitar a los 50 eventos más cercanos ---
        limited_sorted_events_data = sorted_events_data[:50]

        # Extraer solo los objetos de evento para serializar
        sorted_events = [item['event'] for item in limited_sorted_events_data]

        # Serializar la lista de objetos Evento usando el serializer limitado
        serializer = EventoSerializerLimitadoWithFecha(sorted_events, many=True)

        # Obtener los datos serializados (una lista de diccionarios de eventos)
        serialized_data = serializer.data

        # Ahora, recorremos los datos serializados y añadimos la distancia
        # Aseguramos que el orden sea el mismo que el de sorted_events_data
        final_response_data = []
        for i, event_data in enumerate(serialized_data):
             # event_data es el diccionario serializado de un evento
             # Accedemos a la distancia calculada del diccionario original en sorted_events_data
             event_data['distance'] = sorted_events_data[i]['distance']
             final_response_data.append(event_data)


        return Response(final_response_data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        # Obtener la categoría del parámetro de consulta
        category_name = request.query_params.get('category')

        # Validar que el parámetro de categoría esté presente
        if not category_name:
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'category'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = datetime.now(timezone.utc)

        filtered_events = []

        for event in self.get_queryset():

            # --- Validar Categoría (primer elemento del array classifications) ---
            matches_category = False
            if event.classifications and isinstance(event.classifications, list) and event.classifications:
                 if isinstance(event.classifications[0], str):
                     if event.classifications[0].lower() == category_name.lower():
                         matches_category = True


            # --- Validación de Fecha (solo considerar eventos futuros) ---
            is_upcoming = False
            if event.dates and isinstance(event.dates, list) and event.dates:
                first_date_str = event.dates[0] # Tomar solo el primer elemento
                if isinstance(first_date_str, str):
                    try:
                        # Parsear la primera fecha ISO 8601 con zona horaria
                        date_obj = datetime.fromisoformat(first_date_str.replace('Z', '+00:00'))
                        # Asegurarse de que la fecha parseada tenga información de zona horaria
                        if date_obj.tzinfo is None:
                            date_obj = date_obj.replace(tzinfo=timezone.utc)

                        # Verificar si la fecha es igual o posterior a la hora actual
                        if date_obj >= now:
                            is_upcoming = True
                    except (ValueError, TypeError):
                        # Si hay un error al parsear la fecha, el evento no se considera "upcoming"
                        pass

            # --- Agregar el evento si cumple ambos criterios ---
            if matches_category and is_upcoming:
                filtered_events.append(event)
            
            limited_events = filtered_events[:50]
        
            serializer = EventoSerializerLimitadoWithFecha(limited_events, many=True)

        return Response(serializer.data)

