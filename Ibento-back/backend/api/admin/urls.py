from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, SubcategoriasViewSet, CategoriasPerfilViewSet,SubcategoriasPerfilViewSet

# Routers
admin_router = DefaultRouter()
admin_router.register(r'categorias', CategoriaViewSet)
admin_router.register(r'subcategorias', SubcategoriasViewSet)
admin_router.register(r'preguntas', CategoriasPerfilViewSet)
admin_router.register(r'respuestas', SubcategoriasPerfilViewSet)


urlpatterns = [
    path('admin/', include(admin_router.urls)),
]
