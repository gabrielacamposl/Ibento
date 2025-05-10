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
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API_KEY_KIBAN,
    }
    payload = {
        "files":[
        {"name": "front", "base64": front_b64},
        {"name": "back", "base64": back_b64}
        ]
    }
    r = requests.post("https://link.kiban.com/api/v2/ine/data_extraction/", json=payload, headers=headers)
    if r.status_code != 200:
        raise Exception(f"Error al extraer datos de la INE.")
    
    # Verificar la extracción de la curp
    
    data = r.json().get("response", {})
    return data.get("cic"), data.get("identificadorCiudadano")
      #, data.get("curp")

def validate_ine(cic, id_ciudadano):
    headars = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API_KEY_KIBAN,
    }
    payload = {
        "modelo": "e",
        "cic": cic,
        "identificadorCiudadano": id_ciudadano
    }
    r = requests.post("https://link.kiban.com/api/v2/ine/validate/", json=payload, headers=headars)
    if r.status_code != 200:
        raise Exception(f"Error al validar la INE.")
    
    status = r.json().get("response", {}).get("status", {})
    if (status == "VALID"):
        return True
    else:
        return False
