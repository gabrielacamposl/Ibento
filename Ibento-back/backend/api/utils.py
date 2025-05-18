from django.core.mail import send_mail
from django.conf import settings

# --------------------------------------- ENVIAR CORREO ELECTRÓNICOS -------------------------------------

def enviar_email_confirmacion(usuario):
    asunto = "Confirma tu cuenta"
    mensaje = f"Hola {usuario.nombre}, confirma tu cuenta haciendo clic en este enlace:\n\n"
    mensaje += f"https://ibento.com.mx/confirmar/{usuario.token}/"

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

