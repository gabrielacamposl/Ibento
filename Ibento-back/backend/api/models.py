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

    extra_data = models.JSONField(null= True, blank=True) #Permite que los datos sean dinámicos

    def __str__(self):
        return self.email

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

