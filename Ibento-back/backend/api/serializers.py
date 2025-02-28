from rest_framework import serializers
from .models import Usuario
from django.contrib.auth.hashers import make_password

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nombre', 'apellido', 'email', 'password']

    def create(self, validated_data):
        # Hashear la contraseña antes de guardarla
        usuario = Usuario.objects.create(**validated_data)
        usuario.password = make_password(validated_data['password'])  # Asegura que la contraseña esté hasheada
        usuario.save()
        return usuario
