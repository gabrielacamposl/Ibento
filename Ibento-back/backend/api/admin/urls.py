from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CategoriaEventoViewSet, 
                    SubcategoriaViewSet, 
                    CategoriasPerfilViewSet,
                    SubcategoriasPerfilViewSet,
                    )


router = DefaultRouter()
# --- Urls para la creación de categorías de eventos
router.register(r'eventos/categorias/subcategorias', SubcategoriaViewSet, basename='subcategoria')
router.register(r'eventos/categorias', CategoriaEventoViewSet, basename='categoria')
# --- Urls para la creación de Preguntas y respuestas para la parte de intereses del usuario
router.register(r'perfil/respuestas', SubcategoriasPerfilViewSet, basename='subcategoria_perfil')
router.register(r'perfil/preguntas', CategoriasPerfilViewSet, basename='categoria_perfil')


urlpatterns = [
    path('', include(router.urls)),
]
