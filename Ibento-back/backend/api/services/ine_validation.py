import os
import base64
import requests
import cloudinary.uploader
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import io
import hashlib
import time
import gc

from dotenv import load_dotenv
load_dotenv()

API_KEY_KIBAN = os.getenv("KIBAN_API")

def aggressive_memory_cleanup():
    """
    Limpieza agresiva de memoria para servidores con poca RAM
    """
    try:
        # Forzar recolección de basura múltiples veces
        for _ in range(3):
            gc.collect()
        print("Limpieza de memoria completada")
    except Exception as e:
        print(f"Error en limpieza de memoria: {e}")

def memory_safe_resize(image, target_width, target_height):
    """
    Redimensiona imagen de manera segura para la memoria
    """
    try:
        # Usar algoritmo más eficiente en memoria
        resized = image.resize((target_width, target_height), Image.Resampling.NEAREST)
        
        # Limpiar inmediatamente
        if resized != image:
            image.close()
            aggressive_memory_cleanup()
        
        return resized
    except Exception as e:
        # Si falla el redimensionamiento, devolver imagen original
        print(f"Error en redimensionamiento: {e}")
        return image

def validate_ine_image(image_file):
    """
    Validación ligera para servidores con poca RAM
    """
    try:
        # Verificar tamaño del archivo (límite más estricto)
        image_file.seek(0, 2)
        file_size = image_file.tell()
        image_file.seek(0)
        
        if file_size > 5 * 1024 * 1024:  # 5MB (reducido de 10MB)
            return False, "Imagen demasiado grande (máximo 5MB)"
        
        if file_size < 1024:  # 1KB
            return False, "Imagen demasiado pequeña"
        
        # Verificar que sea una imagen válida sin cargar en memoria
        try:
            with Image.open(image_file) as image:
                # Verificar dimensiones más conservadoras
                width, height = image.size
                if width > 4000 or height > 4000:  # Reducido de 8000
                    return False, "Dimensiones demasiado grandes (máximo 4000x4000)"
                
                if width < 200 or height < 150:
                    return False, "Dimensiones demasiado pequeñas para una INE"
                
                # Verificar formato
                if image.format not in ['JPEG', 'PNG', 'JPG']:
                    return False, "Formato no válido (solo JPEG/PNG)"
            
            image_file.seek(0)  # Resetear posición
            return True, "Imagen válida"
            
        except Exception as e:
            return False, f"Imagen corrupta: {str(e)}"
            
    except Exception as e:
        return False, f"Error de validación: {str(e)}"

def process_ine_image_secure(image_file):
    """
    Versión optimizada para servidores con poca RAM (512MB)
    Reduce drásticamente el consumo de memoria
    """
    image = None
    temp_buffer = None
    
    try:
        print("=== PROCESANDO IMAGEN DE INE (MODO LIGERO) ===")
        
        # Limpieza preventiva
        aggressive_memory_cleanup()
        
        # Verificar tamaño del archivo primero
        image_file.seek(0, 2)
        file_size = image_file.tell()
        image_file.seek(0)
        
        # Límite más estricto de tamaño
        if file_size > 5 * 1024 * 1024:  # 5MB máximo
            raise Exception("Imagen demasiado grande (máximo 5MB)")
        
        # Abrir imagen
        image = Image.open(image_file)
        
        # Dimensiones mucho más conservadoras
        width, height = image.size
        max_dimension = 1200  # Reducido de 6000 a 1200
        
        # Redimensionar agresivamente para ahorrar RAM
        if width > max_dimension or height > max_dimension:
            print(f"Redimensionando imagen ({width}x{height})")
            if width > height:
                new_width = max_dimension
                new_height = int(height * max_dimension / width)
            else:
                new_height = max_dimension
                new_width = int(width * max_dimension / height)
            
            # Usar función segura de redimensionamiento
            image = memory_safe_resize(image, new_width, new_height)
            print(f"Redimensionada a: {new_width}x{new_height}")
        
        # Convertir a RGB de manera eficiente
        if image.mode != 'RGB':
            rgb_image = image.convert('RGB')
            image.close()
            image = rgb_image
            aggressive_memory_cleanup()
        
        # Tamaño objetivo más pequeño para OCR
        width, height = image.size
        target_width = min(800, width)  # Reducido de 1000 a 800
        target_height = min(600, height)  # Reducido de 700 a 600
        
        if width != target_width or height != target_height:
            # Mantener proporción pero forzar tamaño más pequeño
            ratio = min(target_width/width, target_height/height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            
            image = memory_safe_resize(image, new_width, new_height)
            print(f"Optimizada para OCR: {new_width}x{new_height}")
        
        # Mejoras mínimas para conservar memoria
        print("Aplicando mejoras básicas...")
        
        # Solo mejoras esenciales con menos memoria
        enhancer = ImageEnhance.Sharpness(image)
        enhanced_image = enhancer.enhance(1.3)  # Reducido de 1.8
        image.close()
        image = enhanced_image
        del enhancer  # Liberar inmediatamente
        aggressive_memory_cleanup()
        
        enhancer = ImageEnhance.Contrast(image)
        enhanced_image = enhancer.enhance(1.2)  # Reducido de 1.5
        image.close()
        image = enhanced_image
        del enhancer
        aggressive_memory_cleanup()
        
        # Sin procesamiento OpenCV para ahorrar memoria
        # Convertir directamente a base64
        temp_buffer = io.BytesIO()
        # Calidad reducida para menor tamaño
        image.save(temp_buffer, format='JPEG', quality=75, optimize=True)
        processed_data = temp_buffer.getvalue()
        
        # Convertir a base64
        base64_result = base64.b64encode(processed_data).decode('utf-8')
        
        print(f"Imagen procesada: {len(base64_result)} caracteres")
        print("=== PROCESAMIENTO COMPLETADO ===")
        
        return base64_result
        
    except Exception as e:
        print(f"Error en procesamiento: {str(e)}")
        raise Exception(f"Error al procesar imagen de INE: {str(e)}")
    
    finally:
        # Limpieza agresiva de memoria
        if temp_buffer:
            temp_buffer.close()
        if image:
            image.close()
        # Forzar liberación de memoria
        aggressive_memory_cleanup()

# Funciones originales sin cambios
def upload_image_to_cloudinary(file, name="temp_image"):
    response = cloudinary.uploader.upload(
        file,
        folder = "temp_ine",
        use_filename = True,
        unique_filename = False,
        overwrite = True,
        resources_type = "image",
    )
    return response['secure_url'], response['public_id']

def delete_image_from_cloudinary(public_id):
    response = cloudinary.uploader.destroy(
        public_id,
        resource_type = "image"
    )

def url_to_base64(url):
    """
    Versión optimizada para servidores con poca RAM
    """
    response = None
    image_stream = None
    
    try:
        print(f"Descargando imagen desde: {url}")
        response = requests.get(url, timeout=30, stream=True)
        
        if response.status_code != 200:
            raise Exception(f"Error al descargar imagen: {response.status_code}")
        
        # Verificar tamaño antes de cargar todo en memoria
        content_length = response.headers.get('content-length')
        if content_length and int(content_length) > 5 * 1024 * 1024:  # 5MB
            raise Exception("Imagen demasiado grande para procesar")
        
        # Crear stream para procesamiento con límite de memoria
        image_stream = io.BytesIO()
        
        # Leer en chunks para controlar memoria
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                image_stream.write(chunk)
                # Verificar que no exceda el límite
                if image_stream.tell() > 5 * 1024 * 1024:  # 5MB
                    raise Exception("Imagen demasiado grande")
        
        image_stream.seek(0)
        
        # Procesar con las mejoras optimizadas
        return process_ine_image_secure(image_stream)
        
    except Exception as e:
        print(f"Error al procesar URL: {str(e)}")
        # Fallback básico más simple
        try:
            response = requests.get(url, timeout=10)
            if len(response.content) > 5 * 1024 * 1024:  # 5MB
                raise Exception("Imagen demasiado grande")
            return base64.b64encode(response.content).decode('utf-8')
        except:
            raise Exception(f"No se pudo procesar la imagen desde {url}")
    
    finally:
        if response:
            response.close()
        if image_stream:
            image_stream.close()
        # Forzar liberación de memoria
        import gc
        gc.collect()

def ocr_ine(front_b64, back_b64):
    print("Iniciando OCR de INE...")
    print(f"Enviando base64 - Front: {len(front_b64)} chars, Back: {len(back_b64)} chars")

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API_KEY_KIBAN,
    }
    payload = {
        "files": [
            {"name": "front", "base64": front_b64},
            {"name": "back", "base64": back_b64}
        ]
    }
    r = requests.post("https://link.kiban.com/api/v2/ine/data_extraction/", json=payload, headers=headers)

    print(f"Status code OCR: {r.status_code}")
    print(f"Response OCR: {r.text}")

    if r.status_code != 200:
        raise Exception("Error al extraer datos de la INE.")
    
    data = r.json().get("response", {})
    cic = data.get("cic")
    id_ciudadano = data.get("identificadorCiudadano")
    metadata = data.get("metadata", {})
    curp = metadata.get("curp")

    print(f"Datos extraídos - CIC: {cic}, ID Ciudadano: {id_ciudadano}")
    
    return cic, id_ciudadano, curp

def validate_ine(cic, id_ciudadano):
    print("Iniciando validación de INE...")
    print(f"Enviando - CIC: {cic}, ID Ciudadano: {id_ciudadano}")

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API_KEY_KIBAN,
    }
    payload = {
        "modelo": "e",
        "cic": cic,
        "idCiudadano": id_ciudadano
    }
    r = requests.post("https://link.kiban.com/api/v2/ine/validate/", json=payload, headers=headers)

    print(f"Status code VALIDATE: {r.status_code}")
    print(f"Response VALIDATE: {r.text}")

    if r.status_code != 200:
        raise Exception("Error al validar la INE.")
    
    status = r.json().get("response", {}).get("status", {})
    print(f"Resultado validación: {status}")
    
    if status == "VALID":
        return True
    else:
       return False

def validate_selfie_image(image_file):
    """
    Validación ligera para selfies en servidores con poca RAM
    """
    try:
        # Verificar tamaño del archivo (límite más estricto para selfies)
        image_file.seek(0, 2)
        file_size = image_file.tell()
        image_file.seek(0)
        
        if file_size > 3 * 1024 * 1024:  # 3MB (reducido de 15MB)
            return False, "Selfie demasiado grande (máximo 3MB)"
        
        if file_size < 1024:  # 1KB
            return False, "Imagen demasiado pequeña"
        
        # Verificar que sea una imagen válida sin cargar en memoria
        try:
            with Image.open(image_file) as image:
                # Verificar dimensiones más conservadoras para selfies
                width, height = image.size
                if width > 2000 or height > 2000:  # Muy reducido de 10000
                    return False, "Dimensiones demasiado grandes (máximo 2000x2000)"
                
                if width < 150 or height < 150:
                    return False, "Dimensiones demasiado pequeñas para un selfie"
                
                # Verificar formato
                if image.format not in ['JPEG', 'PNG', 'JPG']:
                    return False, "Formato no válido (solo JPEG/PNG)"
            
            image_file.seek(0)  # Resetear posición
            return True, "Selfie válido"
            
        except Exception as e:
            return False, f"Imagen corrupta: {str(e)}"
            
    except Exception as e:
        return False, f"Error de validación: {str(e)}"

def process_selfie_image_secure(image_file):
    """
    Versión optimizada para servidores con poca RAM (512MB)
    Específica para procesamiento de selfies
    """
    image = None
    temp_buffer = None
    
    try:
        print("=== PROCESANDO SELFIE (MODO LIGERO) ===")
        
        # Limpieza preventiva
        aggressive_memory_cleanup()
        
        # Verificar tamaño del archivo
        image_file.seek(0, 2)
        file_size = image_file.tell()
        image_file.seek(0)
        
        # Límite más estricto para selfies
        if file_size > 3 * 1024 * 1024:  # 3MB máximo
            raise Exception("Selfie demasiado grande (máximo 3MB)")
        
        # Abrir imagen
        image = Image.open(image_file)
        
        # Redimensionar agresivamente para selfies
        width, height = image.size
        max_dimension = 800  # Mucho más pequeño para selfies
        
        if width > max_dimension or height > max_dimension:
            print(f"Redimensionando selfie ({width}x{height})")
            if width > height:
                new_width = max_dimension
                new_height = int(height * max_dimension / width)
            else:
                new_height = max_dimension
                new_width = int(width * max_dimension / height)
            
            image = memory_safe_resize(image, new_width, new_height)
            print(f"Selfie redimensionado: {new_width}x{new_height}")
        
        # Convertir a RGB
        if image.mode != 'RGB':
            rgb_image = image.convert('RGB')
            image.close()
            image = rgb_image
            aggressive_memory_cleanup()
        
        # Mejoras mínimas para selfies
        print("Aplicando mejoras básicas para rostro...")
        
        # Solo mejoras esenciales
        enhancer = ImageEnhance.Sharpness(image)
        enhanced_image = enhancer.enhance(1.1)  # Muy sutil
        image.close()
        image = enhanced_image
        del enhancer
        aggressive_memory_cleanup()
        
        enhancer = ImageEnhance.Contrast(image)
        enhanced_image = enhancer.enhance(1.05)  # Muy sutil
        image.close()
        image = enhanced_image
        del enhancer
        aggressive_memory_cleanup()
        
        # Convertir a base64 con calidad reducida
        temp_buffer = io.BytesIO()
        image.save(temp_buffer, format='JPEG', quality=70, optimize=True)
        processed_data = temp_buffer.getvalue()
        
        # Convertir a base64
        base64_result = base64.b64encode(processed_data).decode('utf-8')
        
        print(f"Selfie procesado: {len(base64_result)} caracteres")
        print("=== PROCESAMIENTO DE SELFIE COMPLETADO ===")
        
        return base64_result
        
    except Exception as e:
        print(f"Error en procesamiento de selfie: {str(e)}")
        raise Exception(f"Error al procesar selfie: {str(e)}")
    
    finally:
        # Limpieza agresiva de memoria
        if temp_buffer:
            temp_buffer.close()
        if image:
            image.close()
        # Forzar liberación de memoria
        aggressive_memory_cleanup()

# ===== FUNCIÓN DE EMERGENCIA PARA MEMORIA CRÍTICA =====
def emergency_process_ine_fallback(image_file):
    """
    Función de emergencia para procesamiento mínimo cuando hay problemas de memoria
    Solo redimensiona y convierte a base64 sin mejoras
    """
    try:
        print("=== MODO EMERGENCIA - PROCESAMIENTO MÍNIMO ===")
        
        # Limpieza agresiva primero
        aggressive_memory_cleanup()
        
        image_file.seek(0)
        
        # Abrir con PIL de manera muy básica
        with Image.open(image_file) as image:
            # Redimensionar a tamaño muy pequeño
            width, height = image.size
            max_dim = 600  # Muy pequeño
            
            if width > max_dim or height > max_dim:
                if width > height:
                    new_width = max_dim
                    new_height = int(height * max_dim / width)
                else:
                    new_height = max_dim
                    new_width = int(width * max_dim / height)
                
                # Usar el método más básico de redimensionamiento
                image = image.resize((new_width, new_height), Image.Resampling.NEAREST)
            
            # Convertir a RGB básico
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convertir directamente a base64 con calidad muy baja
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=50)
            image_data = buffer.getvalue()
            buffer.close()
            
            # Limpieza inmediata
            aggressive_memory_cleanup()
            
            return base64.b64encode(image_data).decode('utf-8')
            
    except Exception as e:
        print(f"Error en modo emergencia: {e}")
        # Si todo falla, intentar conversión directa
        try:
            image_file.seek(0)
            raw_data = image_file.read()
            if len(raw_data) > 2 * 1024 * 1024:  # Si es mayor a 2MB, fallar
                raise Exception("Imagen demasiado grande para modo emergencia")
            return base64.b64encode(raw_data).decode('utf-8')
        except:
            raise Exception("No se pudo procesar la imagen en modo emergencia")

def safe_process_ine_with_fallback(image_file):
    """
    Función principal que intenta el procesamiento optimizado y cae a modo emergencia si falla
    """
    try:
        # Intentar procesamiento optimizado primero
        return process_ine_image_secure(image_file)
    except Exception as e:
        print(f"Procesamiento optimizado falló: {e}")
        print("Intentando modo emergencia...")
        try:
            return emergency_process_ine_fallback(image_file)
        except Exception as e2:
            print(f"Modo emergencia también falló: {e2}")
            raise Exception(f"No se pudo procesar la imagen: {e}")

def safe_process_selfie_with_fallback(image_file):
    """
    Función principal para selfies que intenta el procesamiento optimizado y cae a modo emergencia si falla
    """
    try:
        # Intentar procesamiento optimizado primero
        return process_selfie_image_secure(image_file)
    except Exception as e:
        print(f"Procesamiento de selfie optimizado falló: {e}")
        print("Intentando modo emergencia para selfie...")
        try:
            return emergency_process_ine_fallback(image_file)  # Usar la misma función de emergencia
        except Exception as e2:
            print(f"Modo emergencia para selfie también falló: {e2}")
            raise Exception(f"No se pudo procesar el selfie: {e}")