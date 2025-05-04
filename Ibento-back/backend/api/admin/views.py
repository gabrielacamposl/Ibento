from rest_framework import viewsets
from api.models import CategoriaEvento, Subcategoria
from .serializers import (CategoriaEventoSerializer, 
                          SubcategoriaSerializer, 
                          CategoriasPerfil, 
                          SubcategoriaPerfil)



# -------------------------------------- CATEGORÍAS Y SUBCATEGORÍAS DE EVENTOS -------------------------------------------
# -------  Categorías de Eventos
class CategoriaEventoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaEvento.objects.all()
    serializer_class = CategoriaEventoSerializer
    
# ------- Subcategorías de Eventos
class SubcategoriaViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer

# ----------------------------------- CATEGORÍAS PARA LAS PREGUNTAS DEL PERFIL -----------------------------------
# ------- Preguntas para el perfil
class CategoriasPerfilViewSet(viewsets.ModelViewSet):
    queryset = CategoriaEvento.objects.all()
    serializer_class = CategoriasPerfil

# ------- Respuestas para el perfil
class SubcategoriasPerfilViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaPerfil

