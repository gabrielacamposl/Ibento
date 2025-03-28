from rest_framework import serializers
from api.models import Usuario, Subcategoria, SubcategoriaPerfil
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


# Creación de perfil para busqueda de acompañantes

## Subir imágenes de perfil para la busqueda de acompañantes

class UploadProfilePicture(serializers.Serializer):
    images = serializers.ListField(
        child = serializers.ImageField(),
        min_length = 3,
        max_length = 6,
    )

    def save (self, usuario):
        urls = []
        for image in self.validated_data['images']:
            result = cloudinary.uploader.upload(image)
            urls.append(result['secure_url'])
        usuario.profile_pic = urls
        usuario.save()
        return usuario

## Datos Personales para el perfil

class PersonalData(serializers.ModelSerializer):
    model = Usuario
    fields = ["description", "birthday", "gender", "curp"]

    def update(self, instance, validated_data):
        instance.description = validated_data.get("description", instance.description)
        instance.birthday = validated_data.get("birthday", instance.birthday)
        instance.gender = validated_data.get("gender", instance.gender)
        instance.curp = validated_data.get("curp", instance.curp)
        instance.save()
        return instance
      

## Selección de respuestas para conocer más al usuarios

class PersonalPreferences(serializers.ModelSerializer):
    preferences = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=SubcategoriaPerfil.objects.all(),
    )

    def save(self, usuario):
        usuario.preferencias_generales = [p.id for p in self.validated_data["preferences"]]
        usuario.save()
        return usuario
    
# Validación de INE

class UploadINE(serializers.ModelSerializer):
    ine_f = serializers.ImageField()
    ine_m = serializers.ImageField()

# Comparación de rostros segundo filtro

class CompararRostroSerializer(serializers.Serializer):
    foto_camara = serializers.ImageField()

