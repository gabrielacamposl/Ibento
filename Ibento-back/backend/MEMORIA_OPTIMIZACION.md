# Optimizaciones de Memoria para Validación de INE

## Problema Original
El servidor explotaba durante la validación de INE debido a que las funciones consumían más de 512MB de RAM disponibles.

## Optimizaciones Implementadas

### 1. Reducción Drástica de Dimensiones
- **Antes**: Máximo 8000x8000 píxeles (hasta 6000x6000 para procesamiento)
- **Ahora**: Máximo 1200x1200 píxeles para INE, 800x800 para selfies

### 2. Límites de Tamaño de Archivo
- **INE**: Reducido de 10MB a 5MB máximo
- **Selfie**: Reducido de 15MB a 3MB máximo

### 3. Algoritmos de Redimensionamiento
- **Antes**: LANCZOS (alta calidad, alta memoria)
- **Ahora**: NEAREST (baja memoria, calidad aceptable)

### 4. Eliminación de Procesamiento OpenCV
- **Antes**: Filtros bilaterales, CLAHE, múltiples conversiones de color
- **Ahora**: Solo mejoras básicas con PIL (Sharpness, Contrast)

### 5. Calidad de Imagen Reducida
- **INE**: De quality=95 a quality=75
- **Selfie**: De quality=90 a quality=70

### 6. Gestión Agresiva de Memoria
- Limpieza inmediata de variables
- Múltiples llamadas a `gc.collect()`
- Cierre explícito de objetos `Image`
- Liberación de buffers después de uso

### 7. Funciones de Respaldo
- `emergency_process_ine_fallback()`: Procesamiento mínimo para casos críticos
- `safe_process_ine_with_fallback()`: Función principal con fallback automático

## Funciones Nuevas/Actualizadas

### Funciones Principales (Optimizadas)
```python
process_ine_image_secure(image_file)          # Optimizada para 512MB RAM
process_selfie_image_secure(image_file)       # Optimizada para selfies
```

### Funciones de Seguridad
```python
safe_process_ine_with_fallback(image_file)    # Con fallback automático
safe_process_selfie_with_fallback(image_file) # Con fallback para selfies
emergency_process_ine_fallback(image_file)    # Modo emergencia
```

### Funciones de Utilidad
```python
aggressive_memory_cleanup()                   # Limpieza forzada de memoria
memory_safe_resize(image, width, height)     # Redimensionamiento seguro
```

## Reducción de Consumo de Memoria

| Aspecto | Antes | Ahora | Reducción |
|---------|-------|-------|-----------|
| Dimensión máxima | 8000x8000 | 1200x1200 | ~78% |
| Tamaño archivo INE | 10MB | 5MB | 50% |
| Tamaño archivo Selfie | 15MB | 3MB | 80% |
| Calidad JPEG | 95% | 75% | ~25% |
| Procesamiento OpenCV | Sí | No | 100% |

## Recomendaciones Adicionales

### Para el Servidor
1. **Monitoreo**: Implementar alertas de memoria cuando se acerque a 400MB
2. **Límite de concurrencia**: Procesar solo 1 validación de INE a la vez
3. **Timeout**: Establecer timeout de 30 segundos para procesamiento

### Para el Cliente
1. **Compresión previa**: Comprimir imágenes antes de enviar
2. **Resolución recomendada**: 1000x700 píxeles para INE
3. **Formato**: Preferir JPEG sobre PNG

### Variables de Entorno Sugeridas
```bash
# Para Django settings
MAX_UPLOAD_SIZE=5242880  # 5MB
MEMORY_LIMIT_WARNING=400  # MB
INE_PROCESSING_TIMEOUT=30  # segundos
```

## Uso en Código

### Reemplazar las llamadas existentes:
```python
# Antes
front_b64 = process_ine_image_secure(ine_front)
back_b64 = process_ine_image_secure(ine_back)
selfie_b64 = process_selfie_image_secure(selfie)

# Ahora (con fallback automático)
front_b64 = safe_process_ine_with_fallback(ine_front)
back_b64 = safe_process_ine_with_fallback(ine_back)
selfie_b64 = safe_process_selfie_with_fallback(selfie)
```

## Monitoreo y Debugging

Las funciones optimizadas incluyen logging detallado:
- Tamaños de imagen antes/después del procesamiento
- Memoria utilizada (si está disponible)
- Tiempo de procesamiento
- Alertas cuando se usa modo de emergencia

## Compatibilidad

- Las funciones mantienen la misma interfaz externa
- El formato de salida (base64) es idéntico
- Compatible con la API de Kiban existente
- Fallback automático garantiza que siempre se procese algo
