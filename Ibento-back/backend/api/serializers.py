from rest_framework import serializers
from .models import Usuario
from django.contrib.auth.hashers import make_password, check_password

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nombre', 'apellido', 'email', 'password']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])  
        return Usuario.objects.create(**validated_data)  
    
    
class Login(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from .models import Usuario  # Importa correctamente el modelo

        try:
            usuario = Usuario.objects.get(email=data["email"])
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Error en el correo o contraseña")

        if not usuario.password or usuario.password.startswith("pbkdf2_sha256$") is False:
            raise serializers.ValidationError("Contraseña no válida. Intenta restablecerla.")

        if not check_password(data["password"], usuario.password):
            raise serializers.ValidationError("Error en el correo o contraseña")

        if not usuario.is_confirmed:
            raise serializers.ValidationError("Debes confirmar tu cuenta primero")

        return {"id": usuario.id, "email": usuario.email, "nombre": usuario.nombre}
