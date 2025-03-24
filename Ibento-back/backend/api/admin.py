from django.contrib import admin
from .models import Usuario, CategoriaEvento, Subcategoria

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['_id', 'nombre', 'apellido', 'email']
    search_fields = ['nombre', 'apellido', 'email']
    list_filter = ['apellido']
    readonly_fields = ['_id']

# ------------------ Registro de etiquetas de eventos Categorías y Subcategorias -----------------

@admin.register(CategoriaEvento)
class CategoriaEventoAdmin(admin.ModelAdmin):
    list_display = ['_id', 'nombre']
    search_fields = ['nombre']


class SubcategoriasEventoAdmin(admin.ModelAdmin):
    list_display = ['_id', 'nombre_subcategoria', 'categoria']
    search_fields = ['nombre_subcategoria']
    list_filter = ['categoria']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "categoria":
            kwargs["queryset"] = CategoriaEvento.objects.all()
            kwargs["to_field_name"] = "_id"  # Asegurar que usa el campo correcto
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

admin.site.register(Subcategoria, SubcategoriasEventoAdmin)


