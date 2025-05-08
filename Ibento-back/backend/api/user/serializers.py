from rest_framework import serializers
import json
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination  
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from api.services import ine_validation
import cloudinary.uploader
from api.models import (Usuario, 
                        TokenBlackList,
                        CategoriasPerfil,
                        Matches, 
                        Interaccion,
                        Conversacion, 
                        Mensaje, 
                        Evento
                        )



# ------------------------------------------- CREACIÓN DE USUARIO -------------------------------------------

# -------- Creación del usuario

class UsuarioSerializer(serializers.ModelSerializer):
    preferencias_evento = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False
    )

    class Meta:
        model = Usuario
        fields = ["_id", "nombre", "apellido", "email", "password", "preferencias_evento"]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        preferencias = validated_data.pop('preferencias_evento', [])
        usuario = Usuario.objects.create_user(**validated_data)
        usuario.preferencias_evento = preferencias
        usuario.save()
        return usuario

    
# -------------------------------------- LOGIN / LOGOUT ----------------------------------------    
# ------ Login / Inicio de Sesión    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            usuario = Usuario.objects.get(email=data["email"])
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Correo o contraseña incorrectos")

        if not check_password(data["password"], usuario.password):
            raise serializers.ValidationError("Correo o contraseña incorrectos")

        if not usuario.is_confirmed:
            raise serializers.ValidationError("Debes confirmar tu cuenta primero")

        refresh = RefreshToken.for_user(usuario)

        return {
            "id": usuario._id,
            "email": usuario.email,
            "nombre": usuario.nombre,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    
#------- Logout / Cierre de Sesión
class Logout(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, data):
        refresh_token = data["refresh"]

        # Verifica si ya fue blacklisteado
        if TokenBlackList.objects.filter(token=refresh_token).exists():
            raise serializers.ValidationError("Este token ya fue invalidado.")

        # Guarda el token en la blacklist
        TokenBlackList.objects.create(token=refresh_token)
        return {}
    


#-------------------------------------------   REESTABLECER CONTRASEÑA ------------------------------------------------------------

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetCodeValidationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    codigo = serializers.CharField(max_length=6)

class PasswordResetChangeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)

# -------------------------------------------  CREACIÓN DE PERFIL PARA BUSQUEDA DE ACOMPAÑANTES ------------------------------------

#---------- Subir imágenes de perfil para la busqueda de acompañantes

class UploadProfilePicture(serializers.Serializer):
    pictures = serializers.ListField(
        child=serializers.ImageField(),
        min_length=3,
        max_length=6,
        allow_empty=False
    )

    def validate_pictures(self, value):
        for img in value:
            if img.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
                raise serializers.ValidationError("Solo se permiten imágenes JPG, PNG o WebP.")
        return value

# ----- Preguntas para el perfil
class CategoriaPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasPerfil
        fields = ['_id', 'question', 'answers', 'multi_option', 'optional']
        
# ----- Respuestas para el perfil (Selección de opciones)   
class RespuestaPerfilSerializer(serializers.Serializer):
    categoria_id = serializers.CharField()
    respuesta = serializers.JSONField()



#---------- Comparación de rostros segundo filtro

class ValidacionRostro(serializers.ModelSerializer):
    foto_camara = serializers.ImageField(required=True)

# ----------------------------------------------- MATCHES ------------------------------------------------
# ------ Interacción con matches
class IntereccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaccion
        fields = '__all__'
        read_only_fields = ['usuario_origen', 'fecha_interaccion']

# ------Generar Match
class MatchSerializer (serializers.ModelSerializer):
    class Meta:
        model = Matches
        fields = '__all__'

# --------- Conversaciones con matches
class ConversacionSerializer (serializers.ModelSerializer):
    class Meta:
        model = Conversacion
        fields = '__all__'
        
#---------- Mensajería con matches
class MensajesSerializer(serializers.ModelSerializer):
   class Meta:
         model = Mensaje
         fields = '__all__'
         read_only_fields = ['remitente','fecha_envio']


# ---------------------------------- CREACIÓN DE EVENTOS ----------------- --------------

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = 'all'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        #Lista de campos que deberían ser arrays
        json_fields = ['imgs', 'coordenates', 'classifications', 'dates', 'price']

        for field in json_fields:
            if field in data and isinstance(data[field], str):
                # Si el campo es una string pero debería ser un array, convértelo
                try:
                    if data[field].startswith('[') and data[field].endswith(']'):
                        # Reemplazar comillas simples por dobles para JSON válido
                        json_str = data[field].replace("'", '"')
                        data[field] = json.loads(json_str)
                except (json.JSONDecodeError, AttributeError):
                    # Mantener el valor original si falla la conversión
                    pass

        return data

class EventoSerializerLimitado(serializers.ModelSerializer):
    class Meta:
        model = Evento
        # Define la lista explícita de campos que quieres incluir
        fields = ['_id', 'title', 'imgs', 'numLike']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        #Lista de campos que deberían ser arrays
        json_fields = ['imgs']

        for field in json_fields:
            if field in data and isinstance(data[field], str):
                # Si el campo es una string pero debería ser un array, convértelo
                try:
                    if data[field].startswith('[') and data[field].endswith(']'):
                        # Reemplazar comillas simples por dobles para JSON válido
                        json_str = data[field].replace("'", '"')
                        data[field] = json.loads(json_str)
                except (json.JSONDecodeError, AttributeError):
                    # Mantener el valor original si falla la conversión
                    pass
        return data 

class EventoSerializerLimitadoWithFecha(serializers.ModelSerializer):
    class Meta:
        model = Evento
        # Define la lista explícita de campos que quieres incluir
        fields = ['_id', 'title', 'imgs', 'numLike', 'dates', 'location', 'classifications']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        #Lista de campos que deberían ser arrays
        json_fields = ['imgs', 'dates', 'classifications']

        for field in json_fields:
            if field in data and isinstance(data[field], str):
                # Si el campo es una string pero debería ser un array, convértelo
                try:
                    if data[field].startswith('[') and data[field].endswith(']'):
                        # Reemplazar comillas simples por dobles para JSON válido
                        json_str = data[field].replace("'", '"')
                        data[field] = json.loads(json_str)
                except (json.JSONDecodeError, AttributeError):
                    # Mantener el valor original si falla la conversión
                    pass
        return data     

# ---------------------------------- CREACIÓN DE EVENTOS ----------------- --------------

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Lista de campos que deberían ser arrays
        json_fields = ['imgs', 'coordenates', 'classifications', 'dates', 'cost']
        
        for field in json_fields:
            if field in data and isinstance(data[field], str):
                # Si el campo es una string pero debería ser un array, convértelo
                try:
                    if data[field].startswith('[') and data[field].endswith(']'):
                        # Reemplazar comillas simples por dobles para JSON válido
                        json_str = data[field].replace("'", '"')
                        data[field] = json.loads(json_str)
                except (json.JSONDecodeError, AttributeError):
                    # Mantener el valor original si falla la conversión
                    pass
                    
        return data