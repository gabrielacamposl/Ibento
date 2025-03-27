from rest_framework import serializers
from api.models import CategoriaEvento, Subcategoria, CategoriasPerfil, SubcategoriaPerfil
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


# --------------  Categorías para el Perfil de Usuario --------------

class CategoriasPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasPerfil
        fields = ["_id", "categoria_perfil"]
        

class RespuestasSerializer(serializers.ModelSerializer):
    categoria_perfil = serializers.SlugRelatedField(
        queryset=CategoriasPerfil.objects.all(), slug_field="_id"  
    )

    class Meta:
        model = SubcategoriaPerfil
        fields = ["_id", "nombre_subcategoria_perfil", "categoria_perfil"]
