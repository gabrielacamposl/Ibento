from django.core.mail import send_mail
from django.conf import settings

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
