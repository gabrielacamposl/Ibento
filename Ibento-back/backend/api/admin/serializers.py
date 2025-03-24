from rest_framework import serializers
from api.models import CategoriaEvento, Subcategoria

# -------------- Categorias para Eventos --------------
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaEvento
        fields = ["_id", "nombre"]
        

class SubcategoriaSerializer(serializers.ModelSerializer):
    categoria = serializers.SlugRelatedField(
        queryset=CategoriaEvento.objects.all(), slug_field="_id"
    )

    class Meta:
        model = Subcategoria
        fields = ["_id", "nombre_subcategoria", "categoria"]
