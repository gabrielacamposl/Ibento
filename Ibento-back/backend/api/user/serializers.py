from rest_framework import serializers
import json
from collections import OrderedDict
from rest_framework_simplejwt.tokens import RefreshToken
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

# ------ Obtener modo de busqueda del usuario
class UsuarioSerializerModoBusqueda(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ['modo_busqueda_match']
        read_only_fields = ['modo_busqueda_match']

    
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

class UpdateProfilePicture(serializers.Serializer):
    pictures = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=False
    )

    def validate_pictures(self, value):
        for img in value:
            if img.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
                raise serializers.ValidationError("Solo se permiten imágenes JPG, PNG o WebP.")
        return value
#---------- Validar el estado de validación



    
# ----- Preguntas para el perfil
class CategoriaPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasPerfil
        fields = ['_id', 'question', 'answers', 'multi_option', 'optional']
        
#---------- Comparación de rostros segundo filtro
class ValidacionRostro(serializers.ModelSerializer):
    foto_camara = serializers.ImageField(required=True)

# ----------------------------------------------- MATCHES ------------------------------------------------

# ------ Sugerencias de usuarios
class SugerenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['_id', 'nombre', 'apellido', 'profile_pic', 'preferencias_evento', 'preferencias_generales', 'modo_busqueda_match','birthday','gender','description','save_events']
        read_only_fields = ['_id', 'nombre', 'apellido', 'profile_pic', 'preferencias_evento', 'preferencias_generales','modo_busqueda_match','birthday','gender','description', 'save_events']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Lista de campos que deberían ser arrays
        json_fields = ['profile_pic', 'preferencias_evento', 'preferencias_generales', 'save_events']

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
# ------ Buscar match para un evento en específico
class EventoMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ['_id', 'title', 'place', 'buscar_match']
        read_only_fields = ['_id', 'title', 'place', 'buscar_match']

# ------ Interacción con matches
class IntereccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaccion
        fields = '__all__'
        read_only_fields = ['usuario_origen', 'fecha_interaccion']

# ------Generar Match
class MatchSerializer(serializers.ModelSerializer):
    usuario_a_nombre = serializers.CharField(source="usuario_a.nombre", read_only=True)
    usuario_a_apellido = serializers.CharField(source="usuario_a.apellido", read_only=True)
    usuario_b_nombre = serializers.CharField(source="usuario_b.nombre", read_only=True)
    usuario_b_apellido = serializers.CharField(source="usuario_b.apellido", read_only=True)

    imagen_usuario_a = serializers.SerializerMethodField()
    imagen_usuario_b = serializers.SerializerMethodField()

    def get_imagen_usuario_a(self, obj):
        val = obj.usuario_a.profile_pic
        if not val:
            return []
        if isinstance(val, list):
            return val
        if isinstance(val, str) and val.startswith('['):
            try:
                return json.loads(val)
            except Exception:
                return []
        return [val]

    def get_imagen_usuario_b(self, obj):
        val = obj.usuario_b.profile_pic
        if not val:
            return []
        if isinstance(val, list):
            return val
        if isinstance(val, str) and val.startswith('['):
            try:
                return json.loads(val)
            except Exception:
                return []
        return [val]


    
    class Meta:
        model = Matches
        fields = ['_id', 'usuario_a', 'usuario_b',
          'usuario_a_nombre', 'usuario_a_apellido', 'imagen_usuario_a',
          'usuario_b_nombre', 'usuario_b_apellido', 'imagen_usuario_b']


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
        json_fields = ['imgs', 'coordenates', 'classifications', 'dates', 'price', 'assistants']

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

class EventoSerializerParaPerfil(serializers.ModelSerializer):
    class Meta:
        model = Evento
        # Define la lista explícita de campos que quieres incluir
        fields = ['_id', 'title', 'imgs', 'dates', 'place']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        #Lista de campos que deberían ser arrays
        json_fields = ['imgs', 'dates']

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
    
# ---------------------------------- OBTENCIÓN DE INFORMACIÓN USUARIOS ----------------- --------------

class UsuarioSerializerParaEventos(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['save_events', 'favourite_events']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Lista de campos que deberían ser arrays
        json_fields = ['save_events', 'favourite_events']
        
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

class UsuarioSerializerEdit(serializers.ModelSerializer):

    preferencias_generales = serializers.SerializerMethodField()
    def get_preferencias_generales(self, obj):
        if hasattr(obj, 'preferencias_generales') and obj.preferencias_generales:
            # Convertir OrderedDict a dict normales
            if isinstance(obj.preferencias_generales, list):
                return [dict(item) if isinstance(item, OrderedDict) else item 
                       for item in obj.preferencias_generales]
            return obj.preferencias_generales
        return []

    class Meta:
        model = Usuario
        fields = ['nombre', 'apellido', 'password', 
                  'preferencias_evento', 'save_events', 
                  'favourite_events', 'profile_pic', 
                  'preferencias_generales', 'birthday',
                  'gender', 'description', 'is_ine_validated', 'is_validated_camera']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        #Lista de campos que deberían ser arrays,
        json_fields = ['save_events', 'favourite_events', 'preferencias_evento', 'profile_pic', 'preferencias_generales']

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

    

class UsuarioSerializerEventosBuscarMatch(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['eventos_buscar_match']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Lista de campos que deberían ser arrays
        json_fields = ['eventos_buscar_match']
        
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
# Serializer para actgualizar el perfil
class ActualizarPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nombre', 'apellido', 'birthday', 'gender']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure all fields are not None, and if so, set to empty string or appropriate type
        # If you have fields that are expected to be dict/list, set them accordingly
        dict_fields = []  # Add field names here if any field is expected to be a dict
        list_fields = []  # Add field names here if any field is expected to be a list

        for field in self.Meta.fields:
            if data.get(field) is None:
                if field in dict_fields:
                    data[field] = {}
                elif field in list_fields:
                    data[field] = []
                else:
                    data[field] = ''
        return data

