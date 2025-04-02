from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from api.utils import enviar_email_confirmacion
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from api.models import Usuario
from .serializers import (UsuarioSerializer, 
                          Login,
                          Logout,
                          UploadProfilePicture,
                          PersonalData,
                          PersonalPreferences,
                          UploadINE,
                          CompararRostroSerializer
                          )



class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def create(self, request, *args, **kwargs):
        usuario = UsuarioSerializer(data=request.data)
        if usuario.is_valid():
            nuevo_usuario = usuario.save()
            enviar_email_confirmacion(nuevo_usuario)  # Enviar email con el token
            return Response({"mensaje": "Usuario registrado. Revisa tu correo para confirmarlo."}, status=status.HTTP_201_CREATED)
        return Response(usuario.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])  # Permite GET en lugar de POST 
def confirmar_usuario(request, token):
    usuario = get_object_or_404(Usuario, token=token)

    if usuario.is_confirmed:
        return JsonResponse({"mensaje": "Este usuario ya ha sido confirmado."}, status=status.HTTP_400_BAD_REQUEST)

    usuario.is_confirmed = True
    usuario.save()
    return JsonResponse({"mensaje": "Cuenta confirmada exitosamente."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_usuario(request):
    serializer = Login(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data, status=200)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_usuario(request):
    serializer = Logout(data=request.data)
    if serializer.is_valid():
        return Response({"mensaje": "Sesión cerrada correctamente."}, status=200)
    return Response(serializer.errors, status=400)

# ------------- Creación de Perfil para la Busqueda de Acompñantes --------------------------------

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

# --------- Subir INE para Validar el Perfil -----------------------------------

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

# ----------- Comparación de Rostros ----------------------------------

@api_view(['POST'])
def comparar_rostros(request):
    usuario = request.user
    serializer = CompararRostroSerializer(data=request.data)

    if serializer.is_valid():
        foto_camara = serializer.validated_data['foto_camara']
        
        # Simulación de API externa que compara rostros
        # rostro_coincide = comparar_rostro_con_ine(usuario, foto_camara)
        rostro_coincide = True
        if rostro_coincide:
            usuario.is_validated_camera = True
            usuario.save()
            return Response({"mensaje": "Rostro validado exitosamente."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "El rostro no coincide con la INE."}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
