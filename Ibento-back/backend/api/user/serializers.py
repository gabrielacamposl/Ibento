from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination  
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
import cloudinary.uploader
from api.models import (Usuario, 
                        TokenBlackList,
                        Subcategoria, 
                        SubcategoriaPerfil, 
                        Matches, 
                        Conversacion, 
                        Mensaje, 
                        CategoriaEvento)




# ------------------------------------------- CREACIÓN DE USUARIO -------------------------------------------

# -------- Creación del usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["_id",'nombre', 'apellido', 'email', 'password']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])  
        return Usuario.objects.create(**validated_data)  
    

# -------- Selección de preferencias para la recomendación de eventos
class UsuarioPreferences (serializers.ModelSerializer):
    preferencias_evento = serializers.PrimaryKeyRelatedField(
    many=True,  # Porque es una lista de referencias
    queryset=Subcategoria.objects.all()
)

    class Meta:
        model = Usuario
        fields = ['preferencias_evento']

        def update(self, instance, validated_data):
            #instance.preferencias_evento.set(validated_data.get('preferencias_evento', instance.preferencias_evento.all()))
            instance.preferencias_evento = [sub._id for sub in validated_data['preferencias_evento']]
            instance.save()
            return instance


    
# -------------------------------------- LOGIN / LOGOUT ----------------------------------------
    
# ------ Login / Inicio de Sesión    
class Login(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            usuario = Usuario.objects.get(email=data["email"])
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Error en el correo o contraseña.")

        if not check_password(data["password"], usuario.password):
            raise serializers.ValidationError("Error en el correo o contraseña.")

        if not usuario.is_confirmed:
            raise serializers.ValidationError("Debes confirmar tu cuenta primero.")

        refresh = RefreshToken.for_user(usuario)

        return {
            "id": str(usuario._id),
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
    



# -------------------------------------------  CREACIÓN DE PERFIL PARA BUSQUEDA DE ACOMPAÑANTES ------------------------------------

#---------- Subir imágenes de perfil para la busqueda de acompañantes

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
    
# ------- Validación de INE

class UploadINE(serializers.ModelSerializer):
    ine_f = serializers.ImageField()
    ine_m = serializers.ImageField()

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
       
       
    
# ---------------------------------- CREACIÓN DE CATEGORÍAS PARA EVENTOS ----------------- --------------

class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = ['_id', 'categoria', 'nombre_subcategoria']

class CategoriaEventoSerializer(serializers.ModelSerializer):
    subcategorias = SubcategoriaSerializer(many=True, read_only=True)

    class Meta:
        model = CategoriaEvento
        fields = ['_id', 'nombre', 'subcategorias']

