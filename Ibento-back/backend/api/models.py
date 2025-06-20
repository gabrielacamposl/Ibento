from djongo import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from bson import ObjectId
import uuid


def generate_objectid():
    return str(ObjectId())  # Retorna un ObjectId convertido a string



class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        extra_fields["password"] = make_password(password)  # Hasheo
        user = self.model(email=email, **extra_fields)
        user.save(using=self._db)
        return user

# ----------------------------------------------- USER ---------------------------------------------------------
class Usuario(AbstractBaseUser, PermissionsMixin):
    _id = models.CharField(primary_key=True, default=generate_objectid, max_length=100, editable=False)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Debe estar hasheada
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    is_confirmed = models.BooleanField(default=False)
    preferencias_evento = models.JSONField(default=list, blank=True, null=True)

    # Cmabiar contraseña
    codigo_reset_password = models.CharField(max_length=6, null=True, blank=True)
    codigo_reset_password_expiration = models.DateTimeField(null=True, blank=True)

    # Preferenicas de eventos
    save_events = models.JSONField(default=list, blank=True, null=True)
    favourite_events = models.JSONField(default=list, blank=True, null=True)

    # Matches
    modo_busqueda_match = models.CharField(
        max_length=20,
        choices=[("global", "Global"), ("evento", "Por evento")],
        default="global"
    )
    eventos_buscar_match = models.JSONField(default=list, blank=True, null=True)

    # Campos para la creación del perfil de acompañantes
    profile_pic = models.JSONField(default=list, null=True, blank=True)
    preferencias_generales = models.JSONField(default=list, blank=True, null=True)
    birthday = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('F', 'Femenino'), ('M', 'Masculino'), ('O', 'Otro')])
    description = models.TextField(null=True, blank=True)
    curp = models.CharField(max_length=18, null = True, blank=True)

    # Campos para validación del INE
    is_ine_validated = models.BooleanField(default=False) # Verificación del perfil con INE
    is_validated_camera = models.BooleanField(default=False) # Verificación del perfil con la cámara
    
    # Token para Firebase Cloud Messaging
    tokens_fcm = models.JSONField(default=list, blank=True, null=True) 

    objects = UsuarioManager()
    REQUIRED_FIELDS = ['nombre', 'apellido']
    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email

# ------------------ Tokens para Login 
class TokenBlackList(models.Model):
    token = models.CharField(max_length=500, unique=True)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.token[:50] + "..."
    

# ------------------------------------------------------ MATCHES ------------------------------------------------
# --------- Interacciones entre usuarios
class Interaccion(models.Model):
    TIPO_INTERACCION = (
        ('like', 'Like'),
        ('dislike', 'Dislike'),
    )
    usuario_origen = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="interacciones_origen", to_field="_id")
    usuario_destino = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="interacciones_destino", to_field="_id")
    tipo_interaccion = models.CharField(max_length=10, choices=TIPO_INTERACCION)
    compatibilidad = models.FloatField(default=0.0)
    fecha_interaccion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('usuario_origen', 'usuario_destino')
        
    def __str__(self):
        return f"{self.usuario_origen.email} → {self.usuario_destino.email}: {self.tipo_interaccion}"
    

# --------- Matches de acompañantes
class Matches (models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default= generate_objectid)
    usuario_a = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="usuario_a", to_field= "_id")
    usuario_b = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name = "usuario_b", to_field= "_id")
    compatibilidad = models.FloatField(default=0.0)
    fecha_match = models.DateTimeField(auto_now_add = True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['usuario_a', 'usuario_b'],
                name='unique_match_pair'
            )
        ]

    # def save(self, *args, **kwargs):
    #     # Validar duplicados en ambos sentidos
    #     if Matches.objects.filter(
    #         Q(usuario_a=self.usuario_a, usuario_b=self.usuario_b) |
    #         Q(usuario_a=self.usuario_b, usuario_b=self.usuario_a)
    #     ).exists():
    #         raise ValidationError("Este match ya existe entre estos usuarios.")

    #     super().save(*args, **kwargs)

    def _str_ (self):
        return f"Match entre {self.usuario_a.nombre} y {self.usuario_b.nombre}"
    
    
# ------------- Chats con los matches

class Conversacion (models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid)
    match = models.OneToOneField(Matches, on_delete=models.CASCADE, related_name="chat", to_field="_id")
    usuario_a = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="chats_a", to_field = "_id")
    usuario_b = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="chats_b", to_field = "_id")

    def __str__(self):
        return f"{self.usuario_a} - {self.usuario_b}"

class Mensaje(models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid)
    conversacion = models.ForeignKey(Conversacion, on_delete=models.CASCADE, related_name="mensajes", to_field="_id")
    remitente = models.ForeignKey(Usuario, on_delete = models.CASCADE, related_name = "mensajes_enviados", to_field = "_id")
    receptor = models.ForeignKey(Usuario, on_delete = models.CASCADE, related_name = "mensajes_recibidos", to_field = "_id")
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.remitente} -> {self.receptor}: {self.mensaje}"

# ----- Bloqueos
class Bloqueo(models.Model):
    usuario_bloqueador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='bloqueos_realizados', to_field="_id")
    usuario_bloqueado = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='bloqueos_recibidos', to_field="_id")
    fecha_bloqueo = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario_bloqueador', 'usuario_bloqueado')

    def __str__(self):
        return f"{self.usuario_bloqueador.email} bloqueó a {self.usuario_bloqueado.email}"


    
#-------------------------------------- CREACIÓN DE EVENTOS ---------------------------------------------------

#   Clase para los eventos
class Evento(models.Model):
    _id = models.CharField(primary_key=True, default=generate_objectid, max_length=100, editable=False)
    title = models.CharField(max_length=100, default="")
    place = models.CharField(max_length=100, default="")
    price = models.JSONField(default=list, null=True, blank=True)
    location = models.CharField(max_length=100)
    coordenates = models.JSONField(default=list, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    classifications = models.JSONField(default=list, null=True, blank=True)
    dates =  models.JSONField(default=list, null=True, blank=True)
    imgs = models.JSONField(default=list, null=True, blank=True)
    url = models.CharField(max_length=100, default="")
    numLike = models.IntegerField(default=0)
    numSaves = models.IntegerField(default=0)
    assistants = models.JSONField(default=list, null=True, blank=True)


    def __str__(self):
        return self.title

# ------------------------------------------- FUNCIONES PARA ADMIN -------------------------------------------    
    
    # Clases para las Preguntas de preferencias personales para crear el perfil de "Busqueda de Acompañantes"

class CategoriasPerfil(models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid)
    question = models.CharField(max_length=150)
    answers = models.JSONField(default=list, null=True, blank=True)
    multi_option =  models.BooleanField(default=False)
    optional = models.BooleanField(default=False)
    def __str__(self):
        return self.question
    
# Clases para las Categorias y Subcategorías de los Eventos

class CategoriaEvento (models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid, editable= False)
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Subcategoria(models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid)
    categoria = models.ForeignKey(
        CategoriaEvento, on_delete = models.CASCADE, related_name="subcategorias", to_field="_id"
    )
    nombre_subcategoria = models.CharField(max_length=70)

    def __str__(self):
        return self.nombre_subcategoria

# ---------------------------------- FIREBASE ENVIO DE NOTIFICACIONES ----------------------------------------

class FCMToken(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='fcm_tokens')
    token = models.TextField(unique=True)
    device_type = models.CharField(max_length=20, choices=[
        ('web', 'Web'),
        ('android', 'Android'),
        ('ios', 'iOS')
    ], default='web')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fcm_tokens'
        unique_together = ['usuario', 'token']
    
    def __str__(self):
        return f"{self.usuario.nombre} - {self.device_type}"

#----------------------------------- MODELO PARA LAS METRICAS DE USO ----------------------------------------

class Metricas(models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid, editable= False)
    num_ine_checked = models.IntegerField(default=0)
    num_ine_validated = models.IntegerField(default=0)
    num_face_checked = models.IntegerField(default=0)
    num_face_validated = models.IntegerField(default=0)
    num_matches = models.IntegerField(default=0)
    num_interactions = models.IntegerField(default=0)

    class Meta:
        db_table = 'metricas'
    
    def __str__(self):
        return f"Metricas: {self._id} - INE Checked: {self.num_ine_checked}, INE Validated: {self.num_ine_validated}, Face Checked: {self.num_face_checked}, Face Validated: {self.num_face_validated}, Matches: {self.num_matches}, Interactions: {self.num_interactions}"