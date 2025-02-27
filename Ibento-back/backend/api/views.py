from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Usuario
from .serializers import UsuarioSerializer
from .utils import enviar_email_confirmacion
from django.shortcuts import get_object_or_404
from django.http import JsonResponse

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
    
def confirmar_usuario(request, token):
    usuario = get_object_or_404(Usuario, token=token)
    if usuario.is_confirmed:
        return JsonResponse({"mensaje": "El usuario ya ha sido confirmado."})
        
    usuario.is_confirmed = True
    usuario.save()
    return JsonResponse({"mensaje": "Cuenta confirmada con éxito. Ahora puedes iniciar sesión."})
