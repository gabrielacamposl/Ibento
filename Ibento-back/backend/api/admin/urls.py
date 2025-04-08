from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CategoriaEventoViewSet, 
                    SubcategoriaViewSet)


router = DefaultRouter()
router.register(r'categorias', CategoriaEventoViewSet, basename='categoria')
router.register(r'subcategorias', SubcategoriaViewSet, basename='subcategoria')



urlpatterns = [
    path('admin/', include(router.urls)),
]
