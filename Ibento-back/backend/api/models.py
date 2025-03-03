from django.db import models
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
    extra_data = models.JSONField(null= True, blank=True) #Permite que los datos sean dinámicos

    # objects = models.Manager()

    def __str__(self):
        return self.email

