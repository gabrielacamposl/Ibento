from rest_framework import viewsets
from api.models import CategoriaEvento, Subcategoria
from .serializers import CategoriaEventoSerializer, SubcategoriaSerializer, CategoriasPerfil, SubcategoriaPerfil, CategoriaConSubcategoriasSerializer


class CategoriaEventoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaEvento.objects.all()
    serializer_class = CategoriaEventoSerializer

class SubcategoriaViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer


class CategoriasPerfilViewSet(viewsets.ModelViewSet):
    queryset = CategoriaEvento.objects.all()
    serializer_class = CategoriasPerfil

class SubcategoriasPerfilViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaPerfil


class CategoriaConSubcategoriasViewSet(viewsets.ModelViewSet):
    queryset = CategoriaEvento.objects.all()
    serializer_class = CategoriaConSubcategoriasSerializer
