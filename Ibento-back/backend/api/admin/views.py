from rest_framework import viewsets
from backend.api.models import CategoriaEvento, Subcategoria, CategoriasPerfil
from .serializers import (CategoriaEventoSerializer, 
                          SubcategoriaSerializer, 
                          CategoriaPerfilSerializer, 
                          )



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
    queryset = CategoriasPerfil.objects.all()
    serializer_class = CategoriaPerfilSerializer