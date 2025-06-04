# Rest Framework Django
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import ValidationError
import traceback
# Utils Django
from django.utils import timezone
from django.utils.timezone import now
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from bson import ObjectId
import base64
from io import BytesIO
import re

# Libraries
import json
import random
from datetime import datetime, timedelta, date
from math import radians, sin, cos, sqrt, atan2
import requests
import logging
import cloudinary.uploader


#Recomendación de eventos
from api.services.recommended_events import obtener_eventos_recomendados
# Envio de correos
from api.utils import enviar_email_confirmacion, enviar_codigo_recuperacion
#Servicio de ticketmaster
from api.services.ticketmaster import guardar_eventos_desde_json
#Servicio de recomendación de usuarios
from api.services.recommended_users import recomendacion_de_usuarios
#Creación de usuarios
from api.services.create_users import crearUsuarios
# Servicio de INES
from api.services.ine_validation import (safe_process_ine_with_fallback, safe_process_selfie_with_fallback, ocr_ine, validate_ine)
#Servicio para envío y recibo de notificaciones
from api.services.notification_service import NotificationService
# Importar modelos 
from api.models import Usuario, Evento, TokenBlackList
from api.models import Interaccion, Matches,Bloqueo, Conversacion, Mensaje
from api.models import FCMToken
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
                          # Serializers para creación de matches
                          MatchSerializer,
                          SugerenciaSerializer,
                          # Serializer para los chats de los matches
                          MensajesSerializer,
                          # Seriallizer de Eventos
                          EventoSerializer,
                          EventoSerializerLimitado,
                          EventoSerializerLimitadoWithFecha,
                          EventoSerializerParaPerfil,
                          # Serializers para la obtención de información de usuarios
                          UsuarioSerializerEdit,
                          UsuarioSerializerParaEventos,
                          UsuarioSerializerEventosBuscarMatch,
                          ActualizarPerfilSerializer,
                          UpdateProfilePicture,
                          UsuarioSerializerModoBusqueda
                          )

# Validación de rostros
FASTAPI_URL = "https://faceserv-production.up.railway.app/verificar"

# ----- Funcion de compatibilidad : provicional 
def calcular_compatibilidad(pref_usuario, pref_otro):
    score = 0
    for key, val in pref_usuario.items():
        if key in pref_otro and pref_otro[key] == val:
            score += 1
    return score

# ------ Función para calcular la edad según el cumpleaños
def calcular_edad(birthday):
    if not birthday:
        return None
    if isinstance(birthday, str):
        birthday = datetime.strptime(birthday, "%Y-%m-%d").date()
    today = date.today()
    return today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day))

# loggin para las notificaciones push
logger = logging.getLogger(__name__)

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
    try:
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:    
        return Response(
            {"error": "Error interno del servidor", "detail": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ----- Token Refresh
@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {"error": "Token de actualización requerido"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        new_access_token = str(refresh.access_token)
        
        return Response({
            "access": new_access_token
        }, status=status.HTTP_200_OK)
        
    except TokenError:
        return Response(
            {"error": "Token de actualización inválido"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
# ------------- Logout
@api_view(["POST"])
def logout_usuario(request):
    """Logout que agrega el token a la blacklist"""
    auth_header = request.headers.get('Authorization', '')
    
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        
        # Agregar token a blacklist
        TokenBlackList.objects.get_or_create(token=token)
        
        return Response(
            {"message": "Logout exitoso"}, 
            status=status.HTTP_200_OK
        )
    
    return Response(
        {"error": "Token no proporcionado"}, 
        status=status.HTTP_400_BAD_REQUEST
    )

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

#--- Intereses del usuario
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guardar_respuestas_perfil(request):
    try:
        usuario = request.user
        respuestas = request.data.get('respuestas', [])

        if not isinstance(respuestas, list):
            return Response({'error': 'El formato de las respuestas debe ser una lista'}, status=400)

        respuestas_validas = []

        for item in respuestas:
            categoria_id = item.get('categoria_id')
            respuesta = item.get('respuesta')

            if not categoria_id:
                continue

            try:
                categoria = CategoriasPerfil.objects.get(_id=categoria_id)
            except CategoriasPerfil.DoesNotExist:
                continue

            opciones_validas = categoria.answers
            if isinstance(opciones_validas, str):
                import ast
                try:
                    opciones_validas = ast.literal_eval(opciones_validas)
                except Exception:
                    opciones_validas = []

            if categoria.multi_option:
                if respuesta is None:
                    if not categoria.optional:
                        return Response({'error': f'Respuesta requerida para {categoria_id}'}, status=400)
                    respuesta = []  # Normaliza respuesta vacía

                if not isinstance(respuesta, list):
                    return Response({'error': f'Respuesta debe ser una lista para {categoria_id}'}, status=400)
                for r in respuesta:
                    if r not in opciones_validas:
                        return Response({'error': f'Opción inválida: {r}'}, status=400)

            else:
                if respuesta is None:
                    if not categoria.optional:
                        return Response({'error': f'Respuesta requerida para {categoria_id}'}, status=400)
                    respuesta = ""  # Normaliza respuesta vacía

                if not isinstance(respuesta, str):
                    return Response({'error': f'Respuesta debe ser string para {categoria_id}'}, status=400)
                if respuesta not in opciones_validas and respuesta != "":
                    return Response({'error': f'Opción inválida: {respuesta}'}, status=400)

            respuestas_validas.append({
                'categoria_id': categoria_id,
                'respuesta': respuesta
            })

        # 🛠️ Fix corregido - asegurar que nunca sea None
        usuario.preferencias_generales = respuestas_validas or []
        
        # 🛠️ También asegurar que otros campos JSONField no sean None
        if usuario.preferencias_evento is None:
            usuario.preferencias_evento = []
        if usuario.save_events is None:
            usuario.save_events = []
        if usuario.favourite_events is None:
            usuario.favourite_events = []
        if usuario.eventos_buscar_match is None:
            usuario.eventos_buscar_match = []
        if usuario.profile_pic is None:
            usuario.profile_pic = []
        if usuario.tokens_fcm is None:
            usuario.tokens_fcm = []
            
        usuario.save()

        return Response({'message': 'Respuestas guardadas correctamente'}, status=200)

    except Exception as e:
        print("ERROR en guardar_respuestas_perfil:", e)
        import traceback
        traceback.print_exc()
        return Response({'error': 'Ocurrió un error interno en el servidor'}, status=500)

#----- Actualizar Perfil
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def actualizar_perfil(request):
    usuario = request.user
    
    # Hacer mutable la información para poder modificarla
    informacion = request.data.copy()
    #Obtener las imágenes de perfil
    pictures = informacion.getlist('pictures') if hasattr(informacion, 'getlist') else informacion.get('pictures', [])
 
    # Imagenes del usuario de la BD
    current_photos = usuario.profile_pic or []
    urls_recibidas = [p for p in pictures if isinstance(p, str) and p.startswith('http')]
    nuevas_imagenes = [p for p in pictures if not isinstance(p, str)]
    print("Nuevas imágenes recibidas:", nuevas_imagenes)
    
    #print("Fotos Actuales:", current_photos)
    #print("URLs recibidas:", urls_recibidas)


    #Proceso de eliminación de imágenes de couldinary y actualiza la variable de fotos actuales
    if urls_recibidas:
        delete_urls = []
        for url_delete in current_photos:
            try:
                if url_delete not in urls_recibidas:
                    public_id = extract_public_id(url_delete)
                    if public_id: 
                        result = cloudinary.uploader.destroy(public_id)
                        if result.get('result') == 'ok':
                            delete_urls.append(url_delete)
                    else: 
                        return Response({"error": "Error al eliminar la imagen de Cloudinary."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                return Response({"error": "No se procesó la imagen."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Eliminar las URLs de las imágenes actuales
        current_photos = [url for url in current_photos if url not in delete_urls]
        usuario.profile_pic = current_photos  # <-- Actualiza la BD aquí
        usuario.save(update_fields=['profile_pic'])
        print("Fotos actuales después de eliminar:", current_photos)

    # Proceso de subida de nuevas imágenes a Cloudinary
    if nuevas_imagenes:
        data = {'pictures': nuevas_imagenes}
        serializer = UpdateProfilePicture(data=data)
        # Path dinámico por usuario
        folder_path = f"usuarios/perfiles/{usuario.nombre}_{usuario._id}"

        print("Datos del serializer:", serializer)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_images = serializer.validated_data['pictures']
        print("Nuevas imágenes a subir:", len(new_images))
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
                    folder=folder_path,
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
        print("URLs subidas:", uploaded_urls)

        print("Fotos actuales antes de actualizar:", current_photos)
        # Actualiza la lista de fotos en la BD después de subir nuevas imágenes
        usuario.profile_pic = current_photos + uploaded_urls
        usuario.save(update_fields=['profile_pic'])


    
    

    if 'preferencias_evento' in informacion:
        valor = informacion['preferencias_evento']
        # Si viene como una lista con un solo string
        if isinstance(valor, list) and len(valor) == 1 and isinstance(valor[0], str):
            try:
                informacion['preferencias_evento'] = json.loads(valor[0])  # convierte el string a lista real
            except json.JSONDecodeError:
                return Response({'error': 'preferencias_evento no es un JSON válido'}, status=400)
        
        # Si viene como string directamente
        elif isinstance(valor, str):
            try:
                informacion['preferencias_evento'] = json.loads(valor)
            except json.JSONDecodeError:
                return Response({'error': 'preferencias_evento no es un JSON válido'}, status=400)
    
    print("Preferencias evento después de parsear:", informacion.get('preferencias_generales'))
    if 'preferencias_generales' in informacion:
        valor = informacion['preferencias_generales']
        # Si viene como una lista con un solo string
        if isinstance(valor, list) and len(valor) == 1 and isinstance(valor[0], str):
            try:
                informacion['preferencias_generales'] = json.loads(valor[0])
            except json.JSONDecodeError:
                return Response({'error': 'preferencias_generales no es un JSON válido'}, status=400)
        # Si viene como string directamente
        elif isinstance(valor, str):
            try:
                informacion['preferencias_generales'] = json.loads(valor)
            except json.JSONDecodeError:
                return Response({'error': 'preferencias_generales no es un JSON válido'}, status=400)
        # Si después de parsear sigue siendo string vacía, lo dejamos como lista vacía
        if informacion['preferencias_generales'] == "" or informacion['preferencias_generales'] is None:
            informacion['preferencias_generales'] = []
        # Si no es lista ni dict, lo dejamos como lista vacía
        if not isinstance(informacion['preferencias_generales'], (list, dict)):
            informacion['preferencias_generales'] = []
    campos_a_actualizar = [
        'nombre',
        'apellido',
        'preferencias_evento',
        'birthday',
        'description',
        'gender',
        'preferencias_generales',
    ]

    update = False
    for campo in campos_a_actualizar:
        if campo in informacion:
            valor = informacion[campo]
            if valor is not None:
                if campo == 'preferencias_evento':
                    if not isinstance(valor, list):
                        return Response({'error': 'preferencias_evento debe ser una lista'}, status=400)
                    for preferencia in valor:
                        if not isinstance(preferencia, str):
                            return Response({'error': 'Cada preferencia debe ser un string'}, status=400)
                setattr(usuario, campo, valor)
                update = True

    if update:
        if usuario.preferencias_generales is None:
            usuario.preferencias_generales = []
        if usuario.profile_pic is None:
            usuario.profile_pic = []
        if usuario.gender is None:
            usuario.gender = ""
        if usuario.preferencias_evento is None:
            usuario.preferencias_evento = []
        if usuario.preferencias_generales is None:
            usuario.preferencias_generales = []

        usuario.save(update_fields=campos_a_actualizar)
        return Response({'message': 'Perfil actualizado correctamente'}, status=200)

    return Response({'error': 'No se proporcionaron campos válidos para actualizar'}, status=400)


def extract_public_id(cloudinary_url):
        try:
            pattern = r'/upload/v\d+/(.+?).[^.]+$'
            match = re.search(pattern, cloudinary_url)

            if match:
                return match.group(1)
            
            pattern = r'/upload/(.+).[^.]+$'
            match = re.search(pattern, cloudinary_url)
            if match:
                return match.group(1)

            return None

        except Exception as e:
                print(f"Error extrayendo public_id: {e}")
                return None

# ---- Subir fotos de perfil para búsqueda de acompañantes
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_pictures(request):
    usuario = request.user
    serializer = UploadProfilePicture(data=request.data)
    # Path dinámico por usuario
    folder_path = f"usuarios/perfiles/{usuario.nombre}_{usuario._id}"

    print(serializer)
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
                folder=folder_path,
                
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
        return Response({
            "error": "Ambas imágenes de la INE son requeridas.",
            "codigo": "MISSING_IMAGES"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try: 
        print("=== INICIANDO VALIDACIÓN DE INE ===")
        user: Usuario = request.user
        print(f"Usuario: {user.nombre}")

          # PROCESAR IMÁGENES CON FUNCIONES OPTIMIZADAS Y FALLBACK
        print("Procesando imagen frontal...")
        front_b64 = safe_process_ine_with_fallback(ine_front)
        
        print("Procesando imagen trasera...")
        back_b64 = safe_process_ine_with_fallback(ine_back)
        
        # EXTRAER DATOS CON OCR
        print("=== EXTRAYENDO DATOS DE LA INE ===")
        cic, id_ciudadano, curp = ocr_ine(front_b64, back_b64)
        
        # Verificar que se extrajeron los datos esenciales
        if not cic or not id_ciudadano:
            print("OCR falló - no se extrajeron datos")
            return Response({
                "error": "No se pudieron extraer los datos de la INE.",
                "sugerencia": "Asegúrate de que las imágenes estén bien iluminadas, sin reflejos y que el texto sea completamente legible. Intenta tomar las fotos en un lugar con buena luz natural.",
                "codigo": "OCR_FAILED"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Datos extraídos - CIC: {cic}, ID: {id_ciudadano}")
        
        is_valid = validate_ine(cic, id_ciudadano)
        
        if not is_valid:
            print("INE no válida en padrón electoral")
            return Response({
                "error": "La INE no es válida según el padrón electoral mexicano.",
                "sugerencia": "Verifica que tu INE esté vigente y que las imágenes sean claras.",
                "codigo": "INE_INVALID"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_ine_validated = True
        if curp:
            user.curp = curp
        user.save()
    
    finally:
        if 'front_b64' in locals():
            del front_b64
        if 'back_b64' in locals():
            del back_b64
        
    return Response({
            "success": True,
            "mensaje_ine": "Tu INE ha sido validada exitosamente en el padrón electoral.",
            "ine_validada": True,
            "rostro_validado": True
        }, status=status.HTTP_200_OK)


# ine_front + selfie
# -------------------------------------- VALIDACIÓN DE ROSTRO CON SELFIE ----------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def face_validation_view(request):
    ine_front = request.FILES.get('ine_front')
    selfie = request.FILES.get('selfie')
    
    if not ine_front:
        return Response({
            "error": "La imagen frontal de la ine es requerida.",
            "codigo": "MISSING_IMAGES"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not selfie:
        return Response({
            "error": "La foto de selfie es requerida.",
            "codigo": "MISSING_SELFIE"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try: 
        user: Usuario = request.user
        print("Procesando imagen frontal...")
        front_b64 = safe_process_ine_with_fallback(ine_front)
        print("Procesando selfie...")
        selfie_b64 = safe_process_selfie_with_fallback(selfie)
        
        print("Imágenes procesadas exitosamente")
          
        # Crear archivo temporal para INE frontal procesada
        ine_front_data = base64.b64decode(front_b64)
        ine_front_file = BytesIO(ine_front_data)
        ine_front_file.name = 'ine_front_processed.jpg'
        
        # Crear archivo temporal para selfie procesado
        selfie_data = base64.b64decode(selfie_b64)
        selfie_file = BytesIO(selfie_data)
        selfie_file.name = 'selfie_processed.jpg'
        
        # VALIDAR ROSTRO CON FASTAPI
        files = {
            "ine_image": ine_front_file,
            "camera_image": selfie_file,
        }
        
        try:
            response = requests.post(FASTAPI_URL, files=files, timeout=60)
            
            if response.status_code != 200:
                error_data = response.json() if response.content else {}
                print(f"Validación de rostro falló: {error_data}")
                
                return Response({
                    "mensaje_ine": "Tu INE ha sido validada exitosamente en el padrón electoral.",
                    "error": "Tu rostro no coincide con la foto de la INE.",
                    "sugerencia": "Asegúrate de que tu rostro esté bien iluminado y centrado en la cámara. Intenta en un lugar con mejor iluminación.",
                    "codigo": "FACE_NO_MATCH"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Guardar validación de rostro
            user.is_validated_camera = True
            user.save()
            
        except requests.RequestException as e:
            print(f"Error en conexión con FastAPI: {str(e)}")
            return Response({
                "mensaje_ine": "Tu INE ha sido validada exitosamente en el padrón electoral.",
                "error": "Error temporal en la validación de rostro. Intenta nuevamente.",
                "codigo": "FACE_SERVICE_ERROR"
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE) 
              
        # RESPUESTA EXITOSA
        return Response({
            "success": True,
            "mensaje_rostro": "Tu identidad ha sido verificada correctamente.",
            "usuario_validado": True,
            "rostro_validado": True
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"=== ERROR EN VALIDACIÓN ===")
        print(f"Error: {str(e)}")
        print(f"Tipo: {type(e).__name__}")
        print(f"Stack trace: {traceback.format_exc()}")
        
        return Response({
            "error": "Ocurrió un error durante la validación.",
            "detalle": str(e),
            "sugerencia": "Intenta nuevamente. Si el problema persiste, contacta soporte.",
            "codigo": "VALIDATION_ERROR"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    finally:
        if 'front_b64' in locals():
            del front_b64

# -------------------------------------- PERFIL MATCH - USER ----------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estado_validacion_view(request):
    user = request.user
    return Response({
        "is_ine_validated": user.is_ine_validated,
        "is_validated_camera": user.is_validated_camera
    })

#--------------------------------------- OBTENER SUGERENCIAS DE MATCHES --------------------------------
# ------- Buscar match para ciertos eventos
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cambiar_modo_busqueda(request):
    usuario = request.user
    modo = request.data.get("modo")

    if modo not in ["global", "evento"]:
        return Response({"error": "Modo no válido. Usa 'global' o 'evento'."}, status=400)

    usuario.modo_busqueda_match = modo
    usuario.save()
    return Response({"mensaje": f"Modo de búsqueda cambiado a {modo}"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_modo_busqueda(request):
    usuario = request.user
    modo = usuario.modo_busqueda_match
    return Response({"modo": modo})


# ------- Obtener sugerencias para match
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sugerencia_usuarios(request):

    usuario = request.user

    us_preferencias_generales = usuario.preferencias_generales
    us_id = usuario._id
    us_eventos_guardados = usuario.save_events
    us_modo_busqueda = usuario.modo_busqueda_match

    #Datos del json
    gender = request.data.get('gender', None)
    age_range = request.data.get('ageRange', None) or request.data.get('age_range', None)

    if age_range is not None:
        min_age = age_range.get('min', None)
        max_age = age_range.get('max', None)
    else:
        min_age = None
        max_age = None
    
    modo_busqueda = request.data.get('searchMode', None)

    # Obtener IDs de usuarios a los que ya se les dio like o dislike
    interacciones_realizadas = Interaccion.objects.filter(
        usuario_origen=usuario
    ).values_list('usuario_destino', flat=True)

    # Obtener usuarios bloqueados por el usuario actual
    usuarios_bloqueados = Bloqueo.objects.filter(
        usuario_bloqueador_id=usuario
    ).values_list('usuario_bloqueado_id', flat=True)

    # Usuarios que ya esta registrados para matches
    candidatos = Usuario.objects.filter(~Q(preferencias_generales=[]) & Q(preferencias_generales__isnull=False))

    print(f"Gender: {gender}")
    print(f"Age Range: {age_range}")

    #Filtrar por genero y edad si se especifica
    if gender != None and gender != 'Todos':
        if gender == 'Hombre':
            g = 'H'
        elif gender == 'Mujer':
            g = 'M'
        else: 
            g = 'O'
        candidatos = candidatos.filter(gender = g)
    
    usuarios_no = []
    if age_range != None:
        for candidato in candidatos:
            edad = calcular_edad(candidato.birthday)
            if edad >= min_age and edad <= max_age:
                continue
            usuarios_no.append(candidato._id)
        candidatos = candidatos.exclude(_id__in=usuarios_no)

    print("Candidatos")
    print(candidatos)

    print("Interacciones realizadas")
    print(interacciones_realizadas)

    print("Bloqueados")
    print(usuarios_bloqueados)

    sugerencias = []

    if us_modo_busqueda == 'global':
        if interacciones_realizadas:
            ids_objeto = [ObjectId(id_str) for id_str in interacciones_realizadas if id_str]
            candidatos = candidatos.exclude(_id__in=ids_objeto)
        
        if usuarios_bloqueados:
            ids_objeto = [ObjectId(id_str) for id_str in usuarios_bloqueados if id_str]
            candidatos = candidatos.exclude(_id__in=ids_objeto)

    if us_modo_busqueda == 'evento':

        try:
            eventos_status = usuario.eventos_buscar_match
            
            if not eventos_status:
                return Response({"error": "No hay usuarios en eventos para buscar match"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                eventos = Evento.objects.filter(_id__in=eventos_status)
                
                print(f"Eventos filtrados: {eventos.count()}")
                print(eventos)
                
                if not eventos.exists():
                     return Response({"error": "No hay eventos validos"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # Recopilar IDs de usuarios únicos
                    usuarios_eventos_ids = set()
                    for evento in eventos:
                        # Obtener IDs de asistentes
                        asistentes_ids = evento.assistants
                        usuarios_eventos_ids.update(asistentes_ids)
                    
                    print(f"Usuarios asistentes únicos: {len(usuarios_eventos_ids)}")
                    print(list(usuarios_eventos_ids))
                    
                    if usuarios_eventos_ids:
                        candidatos = candidatos.filter(_id__in=usuarios_eventos_ids)
                    else:
                        candidatos = candidatos.none()
                    
        except Exception as e:
            return Response(f"Error en filtrado por evento: {e}", status=status.HTTP_400_BAD_REQUEST)


    print("Candidatos despues de filtros")
    if candidatos:
        print(candidatos)

    #Falta comprobar que el otro usuario este buscando para alguno de esos eventos
    sugerencias = {}
    for candidato in candidatos:
        if candidato._id == us_id:
            continue
        compatibilidad = recomendacion_de_usuarios(us_preferencias_generales, candidato.preferencias_generales)
        sugerencias[candidato._id] = compatibilidad

    print("Sugerencias: ")
    print(sugerencias)
    
    #sugerencias_ordenadas = sorted(sugerencias.items(), key=lambda x: x[1], reverse=True)
    sugerencias_ordenadas = sorted(sugerencias, key=lambda x: sugerencias[x], reverse=True)[:100]

    #Enviar la edad, eventos en comun, num_eventos en comun

    usuarios_filtrados = candidatos.filter(_id__in=sugerencias_ordenadas)

    serializer = SugerenciaSerializer(usuarios_filtrados, many=True)

    # Añadir la edad a cada sugerencia
    for i, user_data in enumerate(serializer.data):
        user_data['edad'] = calcular_edad(candidatos[i].birthday)
        user_data['eventos_en_comun'] = len(set(candidatos[i].save_events)&set(us_eventos_guardados))
        user_data['nombres_eventos'] = [Evento.objects.filter(_id__in = set(candidatos[i].save_events)&set(us_eventos_guardados)).values_list("title", flat=True)]
        

    

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def matches(request):
    usuario_origen = request.user
    usuario_destino_id = request.data.get("usuario_destino")
    tipo_interaccion = request.data.get("tipo_interaccion")

    if tipo_interaccion not in ["like", "dislike"]:
        return Response({"error": "Tipo de interacción inválido."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        usuario_destino = Usuario.objects.get(_id=usuario_destino_id)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario destino no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if usuario_destino == usuario_origen:
        return Response({"error": "No puedes interactuar contigo mismo."}, status=status.HTTP_400_BAD_REQUEST)

    # Crear la interacción
    interaccion, created = Interaccion.objects.get_or_create(
        usuario_origen=usuario_origen,
        usuario_destino=usuario_destino,
        defaults={"tipo_interaccion": tipo_interaccion}
    )

    # Si la interacción es un like, enviar notificación y verificar match
    if tipo_interaccion == "like":
        # Enviar notificación de like
        try:
            NotificationService.send_like_notification(
                liked_user_id=usuario_destino._id,
                liker_name=f"{usuario_origen.nombre} {usuario_origen.apellido}"
            )
            logger.info(f"Like notification sent from {usuario_origen._id} to {usuario_destino._id}")
        except Exception as e:
            logger.error(f"Error sending like notification: {str(e)}")
        
        # Verificar si hay like mutuo para crear match
        interaccion_mutua = Interaccion.objects.filter(
            usuario_origen=usuario_destino,
            usuario_destino=usuario_origen,
            tipo_interaccion="like"
        ).first()

        if interaccion_mutua:
            # Crear match
            match, match_created = Matches.objects.get_or_create(
                usuario_a=min(usuario_origen, usuario_destino, key=lambda x: x._id),
                usuario_b=max(usuario_origen, usuario_destino, key=lambda x: x._id)
            )
            
            # Crear conversación
            conversacion, conv_created = Conversacion.objects.get_or_create(
                match=match,
                defaults={"usuario_a": usuario_origen, "usuario_b": usuario_destino}
            )

            Interaccion.objects.filter(
                Q(usuario_origen_id = usuario_destino._id) &
                Q(usuario_destino_id = usuario_origen._id)).delete()
            
            # Enviar notificaciones de match a ambos usuarios
            try:
                NotificationService.send_match_notification(
                    user_id=usuario_origen._id,
                    match_name=f"{usuario_destino.nombre} {usuario_destino.apellido}"
                )
                NotificationService.send_match_notification(
                    user_id=usuario_destino._id,
                    match_name=f"{usuario_origen.nombre} {usuario_origen.apellido}"
                )
                logger.info(f"Match notifications sent for users {usuario_origen._id} and {usuario_destino._id}")
            except Exception as e:
                logger.error(f"Error sending match notifications: {str(e)}")
            
            return Response({
                "message": "¡Es un match!", 
                "match_id": match._id,
                "conversacion_id": conversacion._id,
                "is_match": True
            }, status=201)

    else:
        # Verificar si hay like se cambia por un dislike
        interaccion_mutua = Interaccion.objects.filter(
            usuario_origen=usuario_destino,
            usuario_destino=usuario_origen,
            tipo_interaccion="like"
        ).first()

        if interaccion_mutua:
            print("Interaccion mutua para dislike")
            interaccion_mutua.tipo_interaccion = "dislike"
            interaccion_mutua.save()
        else:
            print("Sin interaccion mutua")

    return Response({
        "message": "Interacción registrada correctamente.",
        "is_match": False
    }, status=200)

# ------- Personas que me dieron like : *Futuros acompañantes*

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def personas_que_me_dieron_like(request):
    try:
        usuario_actual = request.user

        # Obtener interacciones donde el usuario actual fue el destino de un like
        interacciones = Interaccion.objects.filter(
            usuario_destino=usuario_actual,
            tipo_interaccion="like"
        ).select_related("usuario_origen")

        usuarios = []

        for interaccion in interacciones:
            u = interaccion.usuario_origen

            # Calcular edad si hay birthday
            edad = None
            if u.birthday:
                today = date.today()
                birthday = u.birthday
                if isinstance(birthday, str):
                    try:
                        birthday = datetime.strptime(birthday, "%Y-%m-%d").date()
                    except ValueError:
                        birthday = None
                if birthday:
                    edad = today.year - birthday.year - (
                        (today.month, today.day) < (birthday.month, birthday.day)
                    )
                else:
                    edad = None

                # Agregar datos del usuario
                usuarios.append({
                    "_id": str(u._id),
                    "nombre": u.nombre,
                    "apellido": u.apellido,
                    "profile_pic": u.profile_pic[0] if u.profile_pic and len(u.profile_pic) > 0 else None,
                    "preferencias_evento": u.preferencias_evento or [],
                    "preferencias_generales": u.preferencias_generales or [],
                    "edad": edad,
                    "descripcion": u.description or "",
                })
            
        return Response(usuarios, status=200)


    except Exception as e:
        print("Error en personas_que_me_dieron_like:", traceback.format_exc())
        return Response({"error": str(e)}, status=500)


# ------- Ver Matches
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_matches(request):
    usuario = request.user
    matches = Matches.objects.filter(
        Q(usuario_a=usuario) | Q(usuario_b=usuario)
    )
    serializer = MatchSerializer(matches, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_match(request, match_id):
    usuario = request.user

    try:
        match = Matches.objects.get(_id=match_id)
       
    except Matches.DoesNotExist:
        return Response({'error': 'Match no encontrado'}, status=404)

    if usuario not in [match.usuario_a, match.usuario_b]:
        return Response({'error': 'No tienes permiso para ver este match'}, status=403)
    

    conversacion_id = None
    try:
        conversacion = Conversacion.objects.get(match_id=match._id)
        conversacion_id = conversacion._id
    except Conversacion.DoesNotExist:
        pass

    serializer = MatchSerializer(match)
    

    return Response({
        'match': serializer.data,
        'conversacion_id': conversacion_id
    }, status=200)
    
# ------ Eliminar match
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def eliminar_match(request, match_id):
    usuario = request.user

    try:
        match = Matches.objects.get(_id=match_id)
    except Matches.DoesNotExist:
        return Response({'error': 'Match no encontrado'}, status=404)

    if usuario not in [match.usuario_a, match.usuario_b]:
        return Response({'error': 'No tienes permiso para eliminar este match'}, status=403)

    usuario_a = match.usuario_a
    usuario_b = match.usuario_b

    # Eliminar conversación y contar mensajes eliminados
    mensajes_eliminados = 0
    conversaciones_eliminadas = 0
    try:
        conversacion = Conversacion.objects.get(match=match)
        mensajes_eliminados = conversacion.mensajes.count()
        conversacion.delete()  # Esto borra también los mensajes automáticamente
        conversaciones_eliminadas = 1
    except Conversacion.DoesNotExist:
        pass

    # Eliminar interacciones entre ambos usuarios y contar
    interacciones_eliminadas, _ = Interaccion.objects.filter(
        Q(usuario_origen=usuario_a, usuario_destino=usuario_b) |
        Q(usuario_origen=usuario_b, usuario_destino=usuario_a)
    ).delete()

    # Eliminar el match
    match.delete()

    return Response({
        'message': 'Match eliminado correctamente.',
        'interacciones_eliminadas': interacciones_eliminadas,
        'mensajes_eliminados': mensajes_eliminados,
        'conversaciones_eliminadas': conversaciones_eliminadas
    }, status=200)

# ------ Bloquear usuarios
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bloquear_usuario(request):
    usuario_bloqueador = request.user
    usuario_bloqueado_id = request.data.get("usuario_bloqueado")

    if usuario_bloqueado_id == str(usuario_bloqueador._id):
        return Response({"error": "No puedes bloquearte a ti mismo."}, status=400)

    try:
        usuario_bloqueado = Usuario.objects.get(_id=usuario_bloqueado_id)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=404)

    # Crear el bloqueo si no existe
    bloqueo, created = Bloqueo.objects.get_or_create(
        usuario_bloqueador=usuario_bloqueador,
        usuario_bloqueado=usuario_bloqueado
    )

    if not created:
        return Response({"mensaje": "Ya habías bloqueado a este usuario."}, status=200)

    # Buscar y eliminar el match (sin importar el orden)
    match = Matches.objects.filter(
        usuario_a__in=[usuario_bloqueador, usuario_bloqueado],
        usuario_b__in=[usuario_bloqueador, usuario_bloqueado]
    ).first()

    if match:
        # Eliminar conversación asociada
        Conversacion.objects.filter(match=match).delete()
        # Eliminar el match
        match.delete()

    return Response({"mensaje": "Usuario bloqueado exitosamente y match eliminado."}, status=201)


# --------------------------------------  CONVERSACIONES ------------------------------------------------
# -------- Ver conversiones
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mis_conversaciones(request):
    usuario = request.user
    id_usuario = usuario._id

    conversaciones = Conversacion.objects.filter(
        Q(usuario_a=usuario) | Q(usuario_b=usuario)
    )

    print("Conversaciones encontradas: ", len(conversaciones))
    
    data = []

    for conv in conversaciones:

        print("Conversación: ", conv)

        print("Conv.usuario_a._id: ", conv.usuario_a)
        print("Conv.usuario_b._id: ", conv.usuario_b)
        print("id_usuario: ", id_usuario)

        if conv.usuario_a._id == id_usuario:
            otro_usuario = conv.usuario_b
        else:
            otro_usuario = conv.usuario_a

        #otro_usuario = conv.usuario_b if conv.usuario_a._id == id_usuario else conv.usuario_a

        print("Otro usuario: ", otro_usuario._id)

        # Buscar último mensaje (si existe)
        ultimo_mensaje = Mensaje.objects.filter(conversacion=conv).order_by("-fecha_envio").first()

        data_conv = {
            "conversacion_id": conv._id,
            "match_id": conv.match._id,
            "usuario": {
                "_id": otro_usuario._id,
                "nombre": otro_usuario.nombre,
                "apellido": otro_usuario.apellido,
                "profile_pic": otro_usuario.profile_pic[0] if otro_usuario.profile_pic else None,
                "preferencias_evento": otro_usuario.preferencias_evento,
                "preferencias_generales": otro_usuario.preferencias_generales,
                "edad": calcular_edad(otro_usuario.birthday)
            }
        }

        if ultimo_mensaje:
            try:
                # Intentamos acceder al remitente de forma segura
                if ultimo_mensaje.remitente:
                    data_conv["ultimo_mensaje"] = ultimo_mensaje.mensaje
                    data_conv["remitente_nombre"] = ultimo_mensaje.remitente.nombre
                else:
                    data_conv["ultimo_mensaje"] = ultimo_mensaje.mensaje
                    data_conv["remitente_nombre"] = "Remitente no disponible"
            except Mensaje.remitente.RelatedObjectDoesNotExist:
                data_conv["ultimo_mensaje"] = ultimo_mensaje.mensaje
                data_conv["remitente_nombre"] = "Remitente no disponible"

        data.append(data_conv)

    return Response(data)

# Vista actualizada para enviar mensajes (con notificaciones)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enviar_mensaje(request):
    remitente = request.user
    
    # Obtenemos los datos de la solicitud
    conversacion_id = request.data.get('conversacion')
    receptor_id = request.data.get('receptor')
    mensaje = request.data.get('mensaje')

    if not all([conversacion_id, receptor_id, mensaje]):
        return Response({
            'error': 'Faltan datos requeridos: conversacion, receptor, mensaje'
        }, status=400)

    # Verificar si la conversación existe
    try:
        conversacion = Conversacion.objects.get(_id=conversacion_id)
    except Conversacion.DoesNotExist:
        return Response({'error': 'Conversación no encontrada'}, status=404)

    # Verificar que el remitente esté en la conversación
    if remitente._id not in [conversacion.usuario_a._id, conversacion.usuario_b._id]:
        return Response({'error': 'No puedes enviar mensajes en esta conversación'}, status=403)

    # Verificar que el receptor sea parte de la conversación
    if receptor_id not in [conversacion.usuario_a._id, conversacion.usuario_b._id]:
        return Response({'error': 'El receptor no pertenece a esta conversación'}, status=403)

    # Obtener el receptor
    try:
        receptor = Usuario.objects.get(_id=receptor_id)
    except Usuario.DoesNotExist:
        return Response({'error': 'Receptor no encontrado'}, status=404)

    # Crear el mensaje
    mensaje_obj = Mensaje.objects.create(
        conversacion=conversacion,
        remitente=remitente,
        receptor=receptor,
        mensaje=mensaje
    )
    
    # Enviar notificación al receptor
    try:
        NotificationService.send_message_notification(
            receiver_id=receptor._id,
            sender_name=f"{remitente.nombre} {remitente.apellido}",
            message_preview=mensaje
        )
        logger.info(f"Message notification sent from {remitente._id} to {receptor._id}")
    except Exception as e:
        logger.error(f"Error sending message notification: {str(e)}")
    
    # Serializar respuesta
    from .serializers import MensajesSerializer
    serializer = MensajesSerializer(mensaje_obj)
    
    return Response(serializer.data, status=201)

# ------- Obtener mensajes
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_mensajes (request, conversacion_id):
    try:
        conversacion = Conversacion.objects.get(_id=conversacion_id)
    except Conversacion.DoesNotExist:
        return Response({"error": "Conversación no encontrada."}, status=status.HTTP_404_NOT_FOUND)
    
    if request.user._id not in [conversacion.usuario_a._id, conversacion.usuario_b._id]:
        return Response({"error": "No tienes permiso para ver esta conversación."}, status=status.HTTP_403_FORBIDDEN)
    mensajes = Mensaje.objects.filter(conversacion=conversacion).order_by("fecha_envio")
    serializer = MensajesSerializer(mensajes, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_usuarios_conversacion(request, conversacion_id):
    try:
        conversacion = Conversacion.objects.get(_id=conversacion_id)
    except Conversacion.DoesNotExist:
        return Response({"error": "Conversación no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    if request.user._id not in [conversacion.usuario_a._id, conversacion.usuario_b._id]:
        return Response({"error": "No tienes permiso para ver esta conversación."}, status=status.HTTP_403_FORBIDDEN)
    usuarios= []
    usuario_a = conversacion.usuario_a
    usuario_b = conversacion.usuario_b

    usuarios.append({
            "_id": usuario_a._id,
            "nombre": usuario_a.nombre,
            "apellido": usuario_a.apellido,
            "profile_pic": usuario_a.profile_pic[0] if usuario_a.profile_pic else None,
            
        })
    usuarios.append({
            "_id": usuario_b._id,
            "nombre": usuario_b.nombre,
            "apellido": usuario_b.apellido,
            "profile_pic": usuario_b.profile_pic[0] if usuario_b.profile_pic else None,
            
        })



    return Response(usuarios, status=status.HTTP_200_OK)

# ------- Obtener Match ID
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_match_id(request, match_id):
    try:
        match = Conversacion.objects.get(_id=match_id)
    except Conversacion.DoesNotExist:
        return Response({'error': 'Conversación no encontrada'}, status=404)

    if request.user not in [match.usuario_a, match.usuario_b]:
        return Response({'error': 'No tienes permiso para ver este match'}, status=403)

    return Response(match.match_id, status=200)


# --------------------------------------- OBTENCIÓN DE EVENTOS EN TICKETMASTER --------------------------------
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

#------------------------------------------ OBTENCIÓN DE INFORMACIÓN DE LOS EVENTOS -----------------------------------

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
    
#--------- RECOMENDACIÓN DE EVENTOS
    @action(detail=False, methods=['get'])
    @permission_classes([IsAuthenticated])
    def recommended_events(self, request):

        #Obtener el id del parametro de consulta
        usuario = request.user
        preferenciasUser = usuario.preferencias_evento

        #Obtenemos todos los eventos
        eventos_query = self.get_queryset()

        eventos_data = []

        for evento in eventos_query:
            # Acceder a los campos 'title' y 'classification' de cada objeto Evento
            titleEvento = evento.title
            classiEvento = evento.classifications

            # Agregar los datos del evento a la lista
            eventos_data.append({
                "title": titleEvento,
                "classification": classiEvento
            })

        # Mandamos todos los eventos a la función de recomendación
        eventos_recomendados = obtener_eventos_recomendados(preferenciasUser, eventos_data, eventos_query)

        serializer = EventoSerializerLimitado(eventos_recomendados, many= True)
        return Response(serializer.data)

# ------- Obtener eventos por ID
    @action(detail=False, methods=['get'])
    def event_by_id(self, request):

        # Obtener el id del parámetro de consulta
        id_event = request.query_params.get('eventId')

        # Validar que el parámetro de categoría esté presente
        if not id_event:
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'id_event'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Filtrar el evento por ID
        try:
            event = self.get_queryset().get(_id=id_event)
        except Evento.DoesNotExist:
            return Response(
                {"detail": "Evento no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        # Serializar el evento
        serializer = EventoSerializer(event)
        return Response(serializer.data)


    # ------- Guardar evento en guardado -----

    @action(detail=False, methods=['post'])
    @permission_classes([IsAuthenticated])
    def save(self, request):
        usuario = request.user

        # Obtener el id del parámetro de consulta
        id_event = request.query_params.get('eventId')

        #Obtener id del usuario
        id_user = usuario._id
        #Añadir guardado a evento
        try:
            evento = Evento.objects.get(_id=id_event)
        except Evento.DoesNotExist:
            return Response(
                {"detail": "Evento no encontrado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        #Añadir evento a guardados del usuario
        if usuario.save_events is None:
            usuario.save_events = []
            
        if id_event not in usuario.save_events:
            usuario.save_events.append(id_event)
            evento.numSaves += 1

            if evento.assistants is None:
                evento.assistans = []

            evento.assistants.append(id_user)
            evento.save(update_fields=['assistants'])
            evento.save(update_fields=['numSaves'])
            usuario.save(update_fields=['save_events'])
            return Response({"detail": "Evento guardado correctamente."}, status=status.HTTP_200_OK)

        return Response(
            {"detail": "El evento ya está guardado."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # -------- Obtener si esta el evento guardado
    @action(detail=False, methods=['get'])
    @permission_classes([IsAuthenticated])
    def evento_en_guardados(self, request):
    
        usuario = request.user
        id_event = request.query_params.get('eventId')

        # Validar que el parámetro de categoría esté presente
        if not id_event:
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'id_event'."},
                status=status.HTTP_400_BAD_REQUEST
                )
        
        # Buscar evento en guardados
        status_ev = id_event in usuario.save_events

        return Response({"status": status_ev}, status=status.HTTP_200_OK)
    
        
    # Activar y desactivar búsqueda de match en un evento
    @action(detail=False, methods=['post'])
    @permission_classes([IsAuthenticated])
    def toggle_buscar_match(self, request):
        usuario = request.user
        id_event = request.query_params.get('eventId')
        estado = request.query_params.get('estado')  # "true" o "false"
    
    # Validación básica
        if not id_event or estado not in ['true', 'false']:
            return Response({"detail": "Parámetros inválidos."}, status=status.HTTP_400_BAD_REQUEST)

    # Verifica que el evento esté guardado por el usuario
        if not usuario.save_events or id_event not in usuario.save_events:
            return Response({"detail": "Este evento no está guardado por el usuario."}, status=status.HTTP_400_BAD_REQUEST)

    # Inicializa la lista si está vacía
        if usuario.eventos_buscar_match is None:
            usuario.eventos_buscar_match = []

        if estado == 'true':
           if id_event not in usuario.eventos_buscar_match:
               usuario.eventos_buscar_match.append(id_event)
        else:
           if id_event in usuario.eventos_buscar_match:
             usuario.eventos_buscar_match.remove(id_event)

        usuario.save(update_fields=['eventos_buscar_match'])

        estado_str = "activado" if estado == 'true' else "desactivado"
        return Response({"detail": f"Buscar match {estado_str} para el evento."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'])
    @permission_classes([IsAuthenticated])
    def delete_save(self, request):

        usuario = request.user

        #Obtenemos los id del usuario y del evento

        id_event = request.query_params.get('eventId')

        id_user = usuario._id

        #Verificamos que el evento este en sus guardados

        if id_event not in usuario.save_events:
            return Response(
                {"detail": "El evento no esta en sus guardados"},
                status=status.HTTP_400_BAD_REQUEST
                )

         #Verificamos que el evento exista
        try:
            evento = Evento.objects.get(_id=id_event)
        except Evento.DoesNotExist:
            return Response(
                {"detail": "Evento no encontrado."},
                status=status.HTTP_400_BAD_REQUEST
            )
            

        usuario.save_events.remove(id_event)

        #Checamos si el evento esta en eventos buscar match
        if id_event in usuario.eventos_buscar_match:
            usuario.eventos_buscar_match.remove(id_event)

        evento.numSaves -= 1
        evento.assistants.remove(id_user)
        evento.save(update_fields=['numSaves', 'assistants'])
        usuario.save(update_fields=['save_events', 'eventos_buscar_match']) 


        return Response({"detail": "Evento eliminado de guardados."}, status=status.HTTP_200_OK)

    # -------- Obtener si esta el evento esta en favoritos
    @action(detail=False, methods=['get'])
    @permission_classes([IsAuthenticated])
    def evento_en_favoritos(self, request):
        
        usuario = request.user
        id_event = request.query_params.get('eventId')

        # Validar que el parámetro de categoría esté presente
        if not id_event:
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'id_event'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar evento en favoritos 
        status_ev = id_event in usuario.favourite_events
        
        return Response({"status": status_ev}, status=status.HTTP_200_OK)





@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_event(request, pk):
    try:
        # Obtener el evento usando pk
        event = Evento.objects.get(pk=pk)
        user = request.user

        # Verificar si el evento ya está en los favoritos del usuario
        if event.pk in user.favourite_events:
            return Response({"detail": "El evento ya está en tus favoritos."}, status=status.HTTP_400_BAD_REQUEST)

        # Agregar el evento a los favoritos del usuario
        user.favourite_events.append(event.pk)  # Store only the event ID
        user.save(update_fields=['favourite_events'])

        # Incrementar el contador de likes del evento
        event.numLike = (event.numLike or 0) + 1
        event.save(update_fields=['numLike'])

        return Response({"detail": "Evento agregado a favoritos y like registrado."}, status=status.HTTP_200_OK)
    except Evento.DoesNotExist:
        return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    

# ------- Obtener eventos favoritos
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_eventos_favoritos(request):
    user = request.user
    eventos_favoritos = Evento.objects.filter(pk__in=user.favourite_events)
    serializer = EventoSerializer(eventos_favoritos, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ------- Eliminar evento de favoritos
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def eliminar_evento_favorito(request, pk):
    user = request.user
    try:
        evento = Evento.objects.get(pk=pk)
        if evento.pk in user.favourite_events:
            user.favourite_events.remove(evento.pk)
            user.save(update_fields=['favourite_events'])

            # Reducir el contador de likes del evento
            if evento.numLike and evento.numLike > 0:
                evento.numLike -= 1
                evento.save(update_fields=['numLike'])

            return Response({"detail": "Evento eliminado de favoritos."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "El evento no está en tus favoritos."}, status=status.HTTP_400_BAD_REQUEST)
    except Evento.DoesNotExist:
        return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

# ------- Obtener eventos por ID
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_evento_por_id(request, pk):
    try:
        evento = Evento.objects.get(pk=pk)
        serializer = EventoSerializer(evento)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Evento.DoesNotExist:
        return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

# ------- ¿Es favorito?
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def es_favorito(request, pk):
    user = request.user
    try:
        evento = Evento.objects.get(pk=pk)
        if evento.pk in user.favourite_events:
            return Response({"es_favorito": True}, status=status.HTTP_200_OK)
        else:
            return Response({"es_favorito": False}, status=status.HTTP_200_OK)
    except Evento.DoesNotExist:
        return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

# ------ Creación de usuarios
@api_view(["POST"])
def crear_usuarios(request):
    valid = crearUsuarios()

    if valid:
        return Response({'mensaje': 'Usuarios creados correctamente'})
    
    return Response({'mensaje': 'Ocurrio un error'})

# ------- Obtener usuarios por ID
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_usuario_info(request, pk):
    data = []
    try:
        usuario = Usuario.objects.get(pk=pk)
        data.append({
            "_id": usuario._id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "profile_pic": usuario.profile_pic if usuario.profile_pic else None,
            "preferencias_evento": usuario.preferencias_evento,
            "preferencias_generales": usuario.preferencias_generales,
            "edad": calcular_edad(usuario.birthday),
            "descripcion": usuario.description,
        })
        return Response(data, status=status.HTTP_200_OK)
    except Usuario.DoesNotExist:
        return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)



class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    @permission_classes([IsAuthenticated])
    def events(self, request):
        usuario = request.user
        serializer = UsuarioSerializerParaEventos(usuario)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    @permission_classes([IsAuthenticated])
    def info_to_edit(self, request):
        usuario = request.user
        serializer = UsuarioSerializerEdit(usuario)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    @permission_classes([IsAuthenticated])
    def obtener_eventos_match(self, request):
        usuario = request.user

        serializer = UsuarioSerializerEventosBuscarMatch(usuario, many=False)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    @permission_classes([IsAuthenticated])
    def obtener_eventos_guardados(self, request):

        usuario = request.user

        eventos_guardados = usuario.save_events
        eventos_para_match = usuario.eventos_buscar_match

        # Filtrar eventos cuyas IDs estén en eventos_guardados
        eventos_filtrados = Evento.objects.filter(_id__in=eventos_guardados)

        serializer = EventoSerializerParaPerfil(eventos_filtrados, many=True)

        for i, evento_data in enumerate(serializer.data):

            evento_id = evento_data['_id']
        
            evento_data['status'] = evento_id in eventos_para_match

        return Response ({"Eventos guardados":serializer.data})
            

    @action(detail=False, methods=['get'])
    @permission_classes([IsAuthenticated])
    def obtener_modo_busqueda(self, request):

        usuario = request.user

        serializer = UsuarioSerializerModoBusqueda(usuario, many=False)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    @permission_classes([IsAuthenticated])
    def agregar_eventos_match(self, request):

        usuario = request.user
        id_event = request.query_params.get('idEvent')

        # Validar que el parámetro de idEvent esté presente
        if not id_event:
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'idEvent'."},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        if usuario.eventos_buscar_match is None:
            usuario.eventos_buscar_match = []
        
        if id_event not in usuario.eventos_buscar_match:
            if id_event in usuario.save_events:
                usuario.eventos_buscar_match.append(id_event)
                usuario.save(update_fields=['eventos_buscar_match'])
                return Response({"detail": "Evento guardado correctamente para buscar Match."}, status=status.HTTP_200_OK)

        return Response(
            {"detail": "El evento ya está guardado para buscar Match o no esta guardado en tus eventos guardados."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['delete'])
    @permission_classes([IsAuthenticated])
    def eliminar_eventos_match(self, request):

        usuario = request.user

        id_event = request.query_params.get('idEvent')

        #Verificamos que el evento este en sus guardados de buscar match
        if id_event not in usuario.eventos_buscar_match:
            return Response(
                {"detail": "El evento no esta en sus guardados de buscar match"},
                status=status.HTTP_400_BAD_REQUEST
                )
        
        #Verificamos que el evento exista
        try:
            evento = Evento.objects.get(_id=id_event)
        except Evento.DoesNotExist:
            return Response(
                {"detail": "Evento no encontrado."},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        usuario.eventos_buscar_match.remove(id_event)
        usuario.save(update_fields=['eventos_buscar_match'])

        return Response({"detail": "Evento eliminado de guardados."}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    @permission_classes([IsAuthenticated])
    def agregar_info(self, request):

        usuario = request.user
        
        birthday = request.data.get('birthday')
        gender = request.data.get('gender')
        description = request.data.get('description')
        curp = request.data.get('curp')

        # Actualizar los campos del usuario
        usuario.birthday = birthday
        usuario.description = description
        usuario.gender = gender
        usuario.curp = curp

        usuario.save(update_fields=['birthday', 'description', 'gender', 'curp'])

        return Response({"detail": "Información actualizada correctamente."}, status=status.HTTP_200_OK)

# ----------------------------------- VISTAS PARA NOTIFICACIONES --------------------------

# Vista para guardar token FCM (actualizada)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_fcm_token(request):
    """Guarda o actualiza el token FCM del usuario"""
    try:
        user = request.user
        token = request.data.get('token')
        device_type = request.data.get('device_type', 'web')
        
        if not token:
            return Response(
                {'error': 'Token FCM es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        print("🔐 Token FCM recibido:", token)
        print("📱 Tipo de dispositivo recibido:", device_type)
        logger.info(f"🔐 Token FCM recibido: {token}")
        logger.info(f"📱 Tipo de dispositivo recibido: {device_type}")
        # Crear o actualizar token
        fcm_token, created = FCMToken.objects.get_or_create(
            usuario=user,
            token=token,
            defaults={'device_type': device_type, 'is_active': True}
        )
        
        if not created:
            # Si ya existe, actualizarlo
            fcm_token.is_active = True
            fcm_token.device_type = device_type
            fcm_token.save()
        
        logger.info(f"FCM token {'created' if created else 'updated'} for user {user._id}")
        
        # Enviar notificación de bienvenida si es nuevo token
        if created:
            try:
                NotificationService.send_notification(
                    user_id=user._id,
                    title="¡Notificaciones activadas! 🔔",
                    body="Ya puedes recibir notificaciones de Ibento",
                    notification_type='welcome'
                )
            except Exception as e:
                logger.error(f"Error sending welcome notification: {str(e)}")
        
        return Response({
            'message': 'Token FCM guardado correctamente',
            'created': created
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error saving FCM token: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Vista para desactivar token FCM
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_fcm_token(request):
    """Desactiva un token FCM específico"""
    try:
        user = request.user
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'Token FCM es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Desactivar token
        tokens_updated = FCMToken.objects.filter(
            usuario=user,
            token=token
        ).update(is_active=False)
        
        
        
        if tokens_updated > 0:
            logger.info(f"FCM token deactivated for user {user._id}")
            return Response({'message': 'Token desactivado correctamente'})
        else:
            return Response(
                {'error': 'Token no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        logger.error(f"Error removing FCM token: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Vista para probar notificaciones
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_notification(request):
    """Vista para probar el envío de notificaciones"""
    try:
        user = request.user
        title = request.data.get('title', 'Notificación de prueba')
        body = request.data.get('body', 'Esta es una notificación de prueba desde Ibento')
        notification_type = request.data.get('type', 'test')
        
        success = NotificationService.send_notification(
            user_id=user._id,
            title=title,
            body=body,
            notification_type=notification_type
        )
        
        if success:
            return Response({
                'message': 'Notificación enviada correctamente',
                'success': True
            })
        else:
            return Response({
                'error': 'No se pudo enviar la notificación. Verifica que tengas tokens FCM activos.',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error testing notification: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Vista para obtener estado de notificaciones del usuario
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_status(request):
    """Obtiene el estado de las notificaciones del usuario"""
    try:
        user = request.user
        active_tokens = FCMToken.objects.filter(
            usuario=user, 
            is_active=True
        )
        
        tokens_info = []
        for token in active_tokens:
            tokens_info.append({
                'device_type': token.device_type,
                'created_at': token.created_at,
                'token_preview': token.token[:20] + "..." if len(token.token) > 20 else token.token
            })
            

        return Response({
            'notifications_enabled': len(tokens_info) > 0,
            'active_devices': len(tokens_info),
            'user_id': user._id,
            'tokens': tokens_info
        })
        
    except Exception as e:
        logger.error(f"Error getting notification status: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Vista para obtener todas las notificaciones del usuario
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    try:
        user = request.user
        fecha_limite = timezone.now() - timedelta(days=30)
        
        notificaciones = []
        
        # 1. NOTIFICACIONES DE MATCHES
        # Buscar matches donde el usuario sea parte
        matches = Matches.objects.filter(
            Q(usuario_a=user) | Q(usuario_b=user),
            fecha_match__gte=fecha_limite
        ).order_by('-fecha_match')
        
        for match in matches:
            # Determinar quién es el otro usuario
            otro_usuario = match.usuario_b if match.usuario_a == user else match.usuario_a
            
            # Obtener la conversación asociada al match
            try:
                conversacion = Conversacion.objects.get(match=match)
                conversacion_id = conversacion._id
            except Conversacion.DoesNotExist:
                conversacion_id = None
            
            # Obtener foto de perfil (primer elemento del array profile_pic)
            foto_perfil = None
            if otro_usuario.profile_pic and len(otro_usuario.profile_pic) > 0:
                foto_perfil = otro_usuario.profile_pic[0]
            
            notificaciones.append({
                'id': f"match_{match._id}",
                'tipo': 'match',
                'titulo': '¡Nuevo Match!',
                'mensaje': f'Tienes un nuevo match con {otro_usuario.nombre} {otro_usuario.apellido}',
                'fecha': match.fecha_match,
                'leido': False,  # Puedes agregar un campo leido al modelo si quieres
                'usuario_relacionado': {
                    'id': otro_usuario._id,
                    'nombre': f"{otro_usuario.nombre} {otro_usuario.apellido}",
                    'foto': foto_perfil
                },
                'accion': 'abrir_chat',
                'data': {
                    'match_id': match._id,
                    'conversacion_id': conversacion_id
                }
            })
        
        # 2. NOTIFICACIONES DE LIKES RECIBIDOS
        # Buscar interacciones de tipo 'like' dirigidas al usuario
        likes_recibidos = Interaccion.objects.filter(
            usuario_destino=user,
            tipo_interaccion='like',
            fecha_interaccion__gte=fecha_limite
        ).order_by('-fecha_interaccion')
        
        for like in likes_recibidos:
            # Verificar si ya hay match (para no duplicar notificaciones)
            hay_match = Matches.objects.filter(
                Q(usuario_a=user, usuario_b=like.usuario_origen) |
                Q(usuario_a=like.usuario_origen, usuario_b=user)
            ).exists()
            
            if not hay_match:  # Solo mostrar likes que no resultaron en match
                # Obtener foto de perfil
                foto_perfil = None
                if like.usuario_origen.profile_pic and len(like.usuario_origen.profile_pic) > 0:
                    foto_perfil = like.usuario_origen.profile_pic[0]
                
                notificaciones.append({
                    'id': f"like_{like.id}",  # Usar id ya que Interaccion no tiene _id
                    'tipo': 'like',
                    'titulo': '¡Alguien te dio Like!',
                    'mensaje': f'{like.usuario_origen.nombre} {like.usuario_origen.apellido} te dio like',
                    'fecha': like.fecha_interaccion,
                    'leido': False,
                    'usuario_relacionado': {
                        'id': like.usuario_origen._id,
                        'nombre': f"{like.usuario_origen.nombre} {like.usuario_origen.apellido}",
                        'foto': foto_perfil
                    },
                    'accion': 'ver_perfil',
                    'data': {
                        'usuario_id': like.usuario_origen._id
                    }
                })
        
        # 3. NOTIFICACIONES DE MENSAJES NUEVOS
        # Buscar conversaciones donde el usuario participe
        conversaciones = Conversacion.objects.filter(
            Q(usuario_a=user) | Q(usuario_b=user)
        )
        
        for conversacion in conversaciones:
            # Obtener el último mensaje de cada conversación que no sea del usuario actual
            ultimo_mensaje = Mensaje.objects.filter(
                conversacion=conversacion,
                fecha_envio__gte=fecha_limite
            ).exclude(
                remitente=user  # Excluir mensajes propios
            ).order_by('-fecha_envio').first()
            
            if ultimo_mensaje:
                otro_usuario = conversacion.usuario_b if conversacion.usuario_a == user else conversacion.usuario_a
                
                # Contar mensajes no leídos (últimos 7 días)
                mensajes_no_leidos = Mensaje.objects.filter(
                    conversacion=conversacion,
                    fecha_envio__gte=timezone.now() - timedelta(days=7)
                ).exclude(remitente=user).count()
                
                # Obtener foto de perfil
                foto_perfil = None
                if otro_usuario.profile_pic and len(otro_usuario.profile_pic) > 0:
                    foto_perfil = otro_usuario.profile_pic[0]
                
                notificaciones.append({
                    'id': f"mensaje_{ultimo_mensaje._id}",
                    'tipo': 'mensaje',
                    'titulo': 'Nuevo Mensaje',
                    'mensaje': f'{otro_usuario.nombre}: {ultimo_mensaje.mensaje[:50]}{"..." if len(ultimo_mensaje.mensaje) > 50 else ""}',
                    'fecha': ultimo_mensaje.fecha_envio,
                    'leido': False,
                    'usuario_relacionado': {
                        'id': otro_usuario._id,
                        'nombre': f"{otro_usuario.nombre} {otro_usuario.apellido}",
                        'foto': foto_perfil
                    },
                    'accion': 'abrir_chat',
                    'data': {
                        'conversacion_id': conversacion._id,
                        'mensajes_no_leidos': mensajes_no_leidos
                    }
                })
        
        # Ordenar todas las notificaciones por fecha (más recientes primero)
        notificaciones_ordenadas = sorted(
            notificaciones, 
            key=lambda x: x['fecha'], 
            reverse=True
        )
        
        # Limitar a las 50 más recientes
        notificaciones_limitadas = notificaciones_ordenadas[:50]
        
        return Response({
            'notificaciones': notificaciones_limitadas,
            'total': len(notificaciones_limitadas),
            'no_leidas': len([n for n in notificaciones_limitadas if not n['leido']])
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting user notifications: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marcar_notificaciones_leidas(request):
    try:
        user = request.user

        # Marca todos los mensajes como leídos
        mensajes = Mensaje.objects.filter(
            conversacion__usuario_a=user
        ) | Mensaje.objects.filter(
            conversacion__usuario_b=user
        )
        mensajes.exclude(remitente=user).update(leido=True)

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error marcando notificaciones como leídas: {str(e)}")
        return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_cuenta(request):
    try:
        user = request.user
        
        # Eliminar el usuario
        user.delete()
        
        return Response({'status': 'Cuenta eliminada correctamente'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error eliminando cuenta: {str(e)}")
        return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
