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

from dotenv import load_dotenv
load_dotenv()

API_KEY_KIBAN = os.getenv("KIBAN_API")

def validate_ine_image(image_file):
    try:
        # Verificar tamaño del archivo (máximo 10MB)
        image_file.seek(0, 2)  # Ir al final
        file_size = image_file.tell()
        image_file.seek(0)  # Volver al inicio
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            return False, "Imagen demasiado grande (máximo 10MB)"
        
        if file_size < 1024:  # 1KB
            return False, "Imagen demasiado pequeña"
        
        # Verificar que sea una imagen válida
        try:
            image = Image.open(image_file)
            image_file.seek(0)  
            
            # Verificar dimensiones
            width, height = image.size
            if width > 4000 or height > 4000:
                return False, "Dimensiones demasiado grandes"
            
            if width < 200 or height < 150:
                return False, "Dimensiones demasiado pequeñas para una INE"
            
            # Verificar formato
            if image.format not in ['JPEG', 'PNG', 'JPG']:
                return False, "Formato no válido (solo JPEG/PNG)"
                
            return True, "Imagen válida"
            
        except Exception as e:
            return False, f"Imagen corrupta: {str(e)}"
            
    except Exception as e:
        return False, f"Error de validación: {str(e)}"

def process_ine_image_secure(image_file):
    try:
        print("=== PROCESANDO IMAGEN DE INE ===")
        
        # Validar imagen primero
        is_valid, message = validate_ine_image(image_file)
        if not is_valid:
            raise Exception(f"Imagen no válida: {message}")
        
        # Leer imagen
        image_file.seek(0)
        image = Image.open(image_file)
        
        # Hash para logging (sin datos sensibles)
        image_file.seek(0)
        image_data = image_file.read()
        image_hash = hashlib.sha256(image_data).hexdigest()[:8]
        print(f"Procesando imagen: {image_hash}")
        
        # Convertir a RGB si es necesario
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        original_size = image.size
        print(f"Tamaño original: {original_size[0]}x{original_size[1]}")
        
        # Redimensionar si es necesario para mejor OCR
        width, height = image.size
        if width < 1000 or height < 700:
            # Calcular nuevo tamaño manteniendo proporción
            target_width = max(1000, width)
            target_height = int(target_width * height / width)
            
            if target_height < 700:
                target_height = 700
                target_width = int(target_height * width / height)
            
            image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
            print(f"Redimensionado a: {target_width}x{target_height}")
        
        # Mejorar calidad para OCR
        print("Aplicando mejoras de calidad...")
        
        # Mejorar nitidez (importante para texto)
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.8)
        
        # Mejorar contraste
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)
    
        # Ajustar brillo ligeramente
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.1)
        
        # Convertir a OpenCV para procesamiento avanzado
        cv_image = np.array(image)
        cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGB2BGR)
        
        # Reducir ruido manteniendo bordes
        denoised = cv2.bilateralFilter(cv_image, 9, 75, 75)
        
        # Mejorar contraste adaptativamente
        gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced_gray = clahe.apply(gray)
        
        # Convertir de vuelta a color
        enhanced_bgr = cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2BGR)
        enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
        
        # Convertir de vuelta a PIL
        final_image = Image.fromarray(enhanced_rgb)
        
        # Convertir a base64 con alta calidad
        buffer = io.BytesIO()
        final_image.save(buffer, format='JPEG', quality=95, optimize=True)
        processed_data = buffer.getvalue()
        
        # Limpiar memoria
        buffer.close()
        del cv_image, denoised, enhanced_bgr
        
        # Convertir a base64
        base64_result = base64.b64encode(processed_data).decode('utf-8')
        
        print(f"Imagen procesada: {len(base64_result)} caracteres")
        print("=== PROCESAMIENTO COMPLETADO ===")
        
        return base64_result
        
    except Exception as e:
        print(f"Error en procesamiento: {str(e)}")
        raise Exception(f"Error al procesar imagen de INE: {str(e)}")
    
    finally:
        # Limpiar variables sensibles
        if 'image_data' in locals():
            del image_data
        if 'processed_data' in locals():
            del processed_data

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
    try:
        print(f"Descargando imagen desde: {url}")
        response = requests.get(url, timeout=30)
        
        if response.status_code != 200:
            raise Exception(f"Error al descargar imagen: {response.status_code}")
        
        # Crear stream para procesamiento
        image_stream = io.BytesIO(response.content)
        
        # Procesar con las mismas mejoras
        return process_ine_image_secure(image_stream)
        
    except Exception as e:
        print(f"Error al procesar URL: {str(e)}")
        # Fallback básico
        response = requests.get(url)
        return base64.b64encode(response.content).decode('utf-8')

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