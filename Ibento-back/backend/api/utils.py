from django.core.mail import send_mail
from django.conf import settings
import requests
import base64
import os

# --------------------------------------- ENVIAR CORREO ELECTRÓNICOS -------------------------------------

def enviar_email_confirmacion(usuario):
    asunto = "Confirma tu cuenta"
    mensaje = f"Hola {usuario.nombre}, confirma tu cuenta haciendo clic en este enlace:\n\n"
    mensaje += f"http://localhost:5173/confirmar/{usuario.token}/"

    send_mail(
        asunto,
        mensaje,
        settings.EMAIL_HOST_USER,
        [usuario.email],
        fail_silently=False,
    )


def enviar_codigo_recuperacion(email, codigo):
    asunto = 'Tu código de recuperación'
    mensaje = f'''
    Hola,

    Tu código para recuperar tu contraseña es: {codigo}

    Este código expirará en 10 minutos.

    Si no solicitaste este cambio, ignora este correo.

    Saludos,
    El equipo de Ibento.
    '''
    remitente = settings.EMAIL_HOST_USER
    
    send_mail(
        asunto, 
        mensaje, 
        remitente, 
        [email]
    )


# ---------------------------------------- VALIDACIÓN DE INES ---------------------------------------------------------

def get_base64_from_url(image_url):
    """Descarga una imagen desde una URL y la convierte a base64"""
    response = requests.get(image_url)
    response.raise_for_status()
    return base64.b64encode(response.content).decode('utf-8')


def validate_ine_with_kiban(front_url, back_url):
    API = os.getenv("API_KEY_KIBAN")

    ine_front_b64 = get_base64_from_url(front_url)
    ine_back_b64 = get_base64_from_url(back_url)

    # 1. Extraer datos
    extraction_url = "https://link.kiban.com/api/v2/ine/data_extraction/"
    payload = {
        "files": [
            {"name": "front", "base64": ine_front_b64},
            {"name": "back", "base64": ine_back_b64}
        ]
    }
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API
    }

    extraction_response = requests.post(extraction_url, json=payload, headers=headers)
    extraction_data = extraction_response.json()

    cic = extraction_data["response"]["cic"]
    id_ciudadano = extraction_data["response"]["identificadorCiudadano"]
    curp = extraction_data["response"]["metadata"]["curp"]

    # 2. Validar INE
    validation_url = "https://link.kiban.com/api/v2/ine/validate"
    validation_payload = {
        "modelo": "e",
        "cic": cic,
        "idCiudadano": id_ciudadano
    }

    validation_response = requests.post(validation_url, json=validation_payload, headers=headers)
    status = validation_response.json()["response"]["status"]

    return {
        "is_valid": status == "VALID",
        "curp": curp
    }
