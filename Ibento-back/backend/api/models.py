from django.db import models
import uuid

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    edad = models.IntegerField()
    is_confirmed = models.BooleanField(default=False)  # Si el usuario ha confirmado su email
    token = models.UUIDField(default=uuid.uuid4, unique=True)  # Token único

    objects = models.Manager()

    def __str__(self):
        return self.email

