from rest_framework import serializers
from api.models import CategoriaEvento, Subcategoria, CategoriasPerfil, SubcategoriaPerfil


# -------------- Categorias para Eventos --------------

class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = ['_id', 'categoria', 'nombre_subcategoria']

class CategoriaEventoSerializer(serializers.ModelSerializer):
    subcategorias = SubcategoriaSerializer(many=True, read_only=True)

    class Meta:
        model = CategoriaEvento
        fields = ['_id', 'nombre', 'subcategorias']

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





class CategoriaConSubcategoriasSerializer(serializers.ModelSerializer):
    subcategorias = SubcategoriaSerializer(many=True)  # Esto incluirá las subcategorías relacionadas

    class Meta:
        model = CategoriaEvento
        fields = ["_id", "nombre", "subcategorias"]  # Agregamos 'subcategorias' aquí