from rest_framework import viewsets
from api.models import CategoriaEvento, Subcategoria
from .serializers import CategoriaSerializer, SubcategoriaSerializer, CategoriasPerfil, SubcategoriaPerfil

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = CategoriaEvento.objects.all()
    serializer_class = CategoriaSerializer

class SubcategoriasViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializar_class = SubcategoriaSerializer


class CategoriasPerfilViewSet(viewsets.ModelViewSet):
    queryset = CategoriaEvento.objects.all()
    serializer_class = CategoriasPerfil

class SubcategoriasPerfilViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaPerfil
