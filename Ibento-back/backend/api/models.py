from djongo import models
from django.core.exceptions import ValidationError
from django.db.models import Q
from bson import ObjectId
import uuid


def generate_objectid():
    return str(ObjectId())  # Retorna un ObjectId convertido a string

class Usuario(models.Model):
    _id = models.CharField(primary_key=True, default=generate_objectid, max_length=100, editable=False)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Debe estar hasheada
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    is_confirmed = models.BooleanField(default=False)
    preferencias_evento = models.JSONField(default=list, blank=True, null=True)

     # Preferenicas de eventos
    save_events = models.JSONField(default=list, blank=True, null=True)
    favourite_events = models.JSONField(default=list, blank=True, null=True)

    # Campos para la creación del perfil de acompañantes
    profile_pic = models.JSONField(default=list, null=True, blank=True)
    preferencias_generales = models.JSONField(default=list, null=True, blank=True)
    birthday = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('F', 'Femenino'), ('M', 'Masculino'), ('O', 'Otro')])
    description = models.TextField(null=True, blank=True)
    curp = models.CharField(max_length=18, null = True, blank=True)

    # Campos para validación del INE
    is_ine_validated = models.BooleanField(default=False) # Verificación del perfil con INE
    is_validated_camera = models.BooleanField(default=False) # Verificación del perfil con la cámara

    # Emparejamiento con acompañantes
    matches = models.JSONField(default=list, blank=True, null=True)
    futuros_matches = models.JSONField(default=list, blank=True, null=True)
    blocked = models.JSONField(default = list, blank= True, null=True)

    # Token para Firebase Cloud Messaging
    token_fcm = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.email

# Clases para las Preguntas de preferencias personales para crear el perfil de "Busqueda de Acompañantes"

class CategoriasPerfil(models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid)
    categoria_perfil = models.CharField(max_length=50)
    def __str__(self):
        return self.categoria_perfil

class SubcategoriaPerfil(models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid)
    categoria_perfil = models.ForeignKey(
        CategoriasPerfil, on_delete = models.CASCADE, related_name="subcategorias_perfiles", to_field="_id"
    )
    nombre_subcategoria_perfil = models.CharField(max_length=70)
    def __str__(self):
        return self.nombre_subcategoria_perfil
    
    
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


# Matches de acompañantes

class Matches (models.Model):
    _id = models.CharField(primary_key=True, max_length=50, default= generate_objectid)
    usuario_a = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="usuario_a", to_field= "_id")
    usuario_b = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name = "usuario_b", to_field= "_id")
    fecha_match = models.DateTimeField(auto_now_add = True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['usuario_a', 'usuario_b'],
                name='unique_match_pair'
            )
        ]

    def save(self, *args, **kwargs):
        # Validar duplicados en ambos sentidos
        if Matches.objects.filter(
            Q(usuario_a=self.usuario_a, usuario_b=self.usuario_b) |
            Q(usuario_a=self.usuario_b, usuario_b=self.usuario_a)
        ).exists():
            raise ValidationError("Este match ya existe entre estos usuarios.")

        super().save(*args, **kwargs)

    def _str_ (self):
        return f"Match entre {self.usuario_a.nombre} y {self.usuario_b.nombre}"
    
    
# Chats con los matches

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


# Envío de Mensajes -> Notificaciones Push

# class UserDevice(models.Model):
#     user = models.OneToOneField(Usuario, on_delete=models.CASCADE)
#     device = models.OneToOneField(GCMDevice, on_delete=models.CASCADE)


# class Evento(models.Model):
#     _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid)
#     organizador = models.ForeignKey(
#         Usuario, on_delete=models.CASCADE, related_name="eventos", to_field="_id")
#     nombre_evento = models.CharField(max_length=100, null=True, blank=True)
#     descripcion_evento = models.TextField(null=True, blank=True)
#     lugar_maps = models.CharField(max_length=100, null=True, blank=True)
#     fecha_evento= models.DateField(null=True, blank=True)
#     hora_evento = models.TimeField(null=True, blank=True)
#     categorias_tags = models.JSONField(default=list, blank=True, null=True)
#     foto_evento = models.ImageField(upload_to='fotos_evento/', null=True, blank=True)
#     is_boletos = models.BooleanField(default=False)
#     boletos = models.JSONField(default=list, blank=True, null=True)

#     def _str_(self):
#         return self.nombre_evento
    
