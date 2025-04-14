from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CategoriaEventoViewSet, 
                    SubcategoriaViewSet, 
                    CategoriasPerfilViewSet,
                    SubcategoriasPerfilViewSet,
                    )


router = DefaultRouter()
router.register(r'eventos/categorias', CategoriaEventoViewSet, basename='categoria')
router.register(r'eventos/categorias/subcategorias', SubcategoriaViewSet, basename='subcategoria')
router.register(r'perfil/preguntas', CategoriasPerfilViewSet, basename='categoria_perfil')
router.register(r'perfil/respuestas', SubcategoriasPerfilViewSet, basename='subcategoria_perfil')

urlpatterns = [
    path('admin/', include(router.urls)),
]
