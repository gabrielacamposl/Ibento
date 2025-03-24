from rest_framework import serializers
from api.models import Usuario, Subcategoria
from django.contrib.auth.hashers import make_password, check_password
import cloudinary.uploader

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["_id",'nombre', 'apellido', 'email', 'password']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])  
        return Usuario.objects.create(**validated_data)  
    
    
class Login(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from api.models import Usuario  # Importa correctamente el modelo

        try:
            usuario = Usuario.objects.get(email=data["email"])
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Error en el correo o contraseña.")

        if not check_password(data["password"], usuario.password):
            raise serializers.ValidationError("Error en el correo o contraseña.")

        if not usuario.is_confirmed:
            raise serializers.ValidationError("Debes confirmar tu cuenta primero.")

        return {"id": usuario._id, "email": usuario.email, "nombre": usuario.nombre}
    

class UsuarioPreferences (serializers.ModelSerializer):
    preferencias_evento = serializers.PrimaryKeyRelatedField(
    many=True,  # Porque es una lista de referencias
    queryset=Subcategoria.objects.all()
)

    class Meta:
        model = Usuario
        fields = ['preferencias_evento']

        def update(self, instance, validated_data):
            instance.preferencias_evento.set(validated_data.get('preferencias_evento', instance.preferencias_evento.all()))
            instance.save()
            return instance


