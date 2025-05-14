import requests
import json
import base64
import os
from dotenv import load_dotenv


load_dotenv()
API = os.getenv("API_KEY_KIBAN")

# Convertir imagen a bytes
def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

ine_t_b64 = image_to_base64("D:/Proyectos/Ibento/modelos-algoritmos/INEValidation/dataset/memo_t.jpeg")
ine_f_b64 = image_to_base64("D:/Proyectos/Ibento/modelos-algoritmos/INEValidation/dataset/memo_f.jpeg")
print("INE_T Base64:", ine_t_b64)
print("INE_F Base64:", ine_f_b64)

# --------- API de extracción de datos de la INE -------------------
url = "https://link.kiban.com/api/v2/ine/data_extraction/"

payload = { "files": [
        {
            "name": "front",
            "base64": ine_f_b64
        },
        {
            "name": "back",
            "base64": ine_t_b64
        }
    ] }

headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "x-api-key": API
}

print ("--- API de extracción de datos de la INE----")
response = requests.post(url, json=payload, headers=headers)

print(response.text) 

data = response.json()
cic = data["response"]["cic"]
id_ciudadano = data["response"]["identificadorCiudadano"]

print("cic:", cic, "idciudadano:", id_ciudadano)
    # --------- API de validación de la INE -------------------

url_validation = "https://link.kiban.com/api/v2/ine/validate"

headers_validation = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API 
}

payload_validation = {
        "modelo": "e",
        "cic": cic,  
        "idCiudadano": id_ciudadano  
    }

response_validation = requests.post(url_validation, json=payload_validation, headers=headers_validation)
print("response_validation:", response_validation)

userinfo = response_validation.json()
status = userinfo["response"]["status"]
print(status)
is_valid = False

if status == "VALID":
    is_valid = True
    print("La INE es válida.")
else:
    print("La INE no es válida.")
