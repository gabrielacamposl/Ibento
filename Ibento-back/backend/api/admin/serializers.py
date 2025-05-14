from rest_framework import serializers
from api.models import CategoriaEvento, Subcategoria, CategoriasPerfil


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
# ----- Preguntas para el perfil
class CategoriaPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasPerfil
        fields = ['_id', 'question', 'answers', 'multi_option', 'optional']
    