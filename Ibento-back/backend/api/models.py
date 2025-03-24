from djongo import models
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
    

# class Mensaje(models.Model):
#     _id = models.CharField(primary_key=True, max_length=50, default=generate_objectid)
#     UsuarioA = models.ForeignKey(models.CASCADE, related_name="usuario_A", to_field="_id")
#     UsuarioB = models.ForeignKey(models.CASCADE, related_name="usuario_B", to_field="_id")
#     mensaje = models.TextField()