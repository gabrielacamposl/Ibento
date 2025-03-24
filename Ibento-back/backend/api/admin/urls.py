from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, SubcategoriasViewSet

# Routers
admin_router = DefaultRouter()
admin_router.register(r'categorias', CategoriaViewSet)
admin_router.register(r'subcategorias', SubcategoriasViewSet)

urlpatterns = [
    path('admin/', include(admin_router.urls)),
]
