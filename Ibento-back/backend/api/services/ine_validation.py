import os
import base64
import requests
import cloudinary.uploader

from dotenv import load_dotenv
load_dotenv()

API_KEY_KIBAN = os.getenv("KIBAN_API")

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
    image_response = requests.get(url)
    return base64.b64encode(image_response.content).decode('utf-8')

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
    print(f" Enviando - CIC: {cic}, ID Ciudadano: {id_ciudadano}")

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
    
 #   return status == "VALID"
