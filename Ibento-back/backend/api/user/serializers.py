from rest_framework import serializers
import json
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination  
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
import cloudinary.uploader
from api.models import (Usuario, 
                        TokenBlackList,
                        Subcategoria, 
                        SubcategoriaPerfil, 
                        Matches, 
                        Conversacion, 
                        Mensaje, 
                        CategoriaEvento,
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


# ---------- Datos Personales para el perfil

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
      

#----------- Selección de respuestas para conocer más al usuarios

class PersonalPreferences(serializers.ModelSerializer):
    preferences = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=SubcategoriaPerfil.objects.all(),
    )

    def save(self, usuario):
        usuario.preferencias_generales = [p.id for p in self.validated_data["preferences"]]
        usuario.save()
        return usuario
    
# ------- Validación de INE con API de KIBAN

class IneValidationSerializer(serializers.Serializer):
    ine_front_url = serializers.URLField()
    ine_back_url = serializers.URLField()

    def validate(self, data):
        # Opcional: validar que vengan de Cloudinary u otro dominio confiable
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        front_url = self.validated_data['ine_front_url']
        back_url = self.validated_data['ine_back_url']

        # Validar con Kiban
        result = validate_ine_with_kiban(front_url, back_url)
        user.is_ine_validated = result["is_valid"]
        user.curp = result["curp"]
        user.save()
        return user
    
#---------- Comparación de rostros segundo filtro

class ValidacionRostro(serializers.ModelSerializer):
    foto_camara = serializers.ImageField(required=True)

# ----------------------------------------------- MATCHES ------------------------------------------------

# ------Generar Match
class MatchSerializer (serializers.ModelSerializer):
    usuario_a = UsuarioSerializer(read_only=True)
    usuario_b = UsuarioSerializer(read_only = True)

    class Meta:
        model = Matches
        fields = ["_id", "usuario_a", "usuario_b", "fecha_match"]


#---------- Mensajería con matches

class MensajesSerializer(serializers.ModelSerializer):
    remitente_nombre = serializers.CharField(source="remitente.nombre", read_only= True)
    receptor_nombre = serializers.CharField(source="receptor.nombre", read_only=True)

    class Meta:
        model = Mensaje
        fields = ["_id", "conversacion", "remitente", "receptor", "mensaje", "fecha_envio"]

# --------- Conversaciones con matches

class ConversacionSerializer (serializers.ModelSerializer):
   usuario_a_nombre = serializers.CharField(source="usuario_a.nombre", read_only = True)
   usuario_b_nombre = serializers.CharField(source = "usuario_b.nombre", read_only = True)
   mensajes = MensajesSerializer (many= True, read_only=True) # Se inicializan los mensajes

   class Meta:
       model = Conversacion
       fields = ["_id", "usuario_a", "usuario_a.nombre",  "usuario_b", "usuario_b.nombre"]
       
       
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
        fields = ['_id', 'title', 'imgs', 'numLike', 'dates']

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

 



