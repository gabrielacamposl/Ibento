from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CategoriaViewSet, 
                    SubcategoriasViewSet, 
                    CategoriasPerfilViewSet,
                    SubcategoriasPerfilViewSet, 
                    CategoriaConSubcategoriasViewSet)

# Routers
admin_router = DefaultRouter()
admin_router.register(r'categorias', CategoriaViewSet)
admin_router.register(r'subcategorias', SubcategoriasViewSet)
admin_router.register(r'preguntas', CategoriasPerfilViewSet)
admin_router.register(r'respuestas', SubcategoriasPerfilViewSet)


api_router = DefaultRouter()
api_router.register(r'categorias-con-subcategorias', CategoriaConSubcategoriasViewSet, basename="categorias-con-subcategorias")

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('preferencias-eventos/', include(api_router.urls)),
]
