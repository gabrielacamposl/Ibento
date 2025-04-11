from rest_framework import serializers
from api.models import CategoriaEvento, Subcategoria, CategoriasPerfil, SubcategoriaPerfil


# -------------- Categorias para Eventos --------------

    
# ---------------------------------- CREACIÓN DE CATEGORÍAS PARA EVENTOS -------------------------------

class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = ['_id', 'categoria', 'nombre_subcategoria']

class CategoriaEventoSerializer(serializers.ModelSerializer):
    subcategorias = SubcategoriaSerializer(many=True, read_only=True)

    class Meta:
        model = CategoriaEvento
        fields = ['_id', 'nombre', 'subcategorias']



# ------------------------------ CATEGORÍAS PARA LAS PREGUNTAS DEL PERFIL -----------------------------------


# ------- Respuestas para el perfil
class SubcategoriaPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = ['_id', 'nombre_subcategoria_perfil', 'categoria_perfil']


# ----- Preguntas para el perfil
class CategoriaPerfilSerializer(serializers.ModelSerializer):
    subcategorias_perfil = SubcategoriaSerializer(many=True, read_only=True)

    class Meta:
        model = CategoriasPerfil
        fields = ['_id', 'categoria_perfil']
        



# class RespuestasSerializer(serializers.ModelSerializer):
#     categoria_perfil = serializers.SlugRelatedField(
#         queryset=CategoriasPerfil.objects.all(), slug_field="_id"  
#     )

#     class Meta:
#         model = SubcategoriaPerfil
#         fields = ["_id", "nombre_subcategoria_perfil", "categoria_perfil"]



