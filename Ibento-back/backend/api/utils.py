from django.core.mail import EmailMultiAlternatives, send_mail
from django.conf import settings
from django.utils.html import strip_tags

# --------------------------------------- ENVIAR CORREO ELECTRÓNICOS -------------------------------------

def enviar_email_confirmacion(usuario):
    asunto = "Confirma tu cuenta"
    mensaje_html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirma tu cuenta</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f7;
                color: #333;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .email-header {{
                background: linear-gradient(90deg, #60a5fa 0%, #f472b6 50%, #a78bfa 100%);
                padding: 20px;
                text-align: center;
                color: #ffffff;
            }}
            .email-header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .email-body {{
                padding: 20px;
            }}
            .email-body h2 {{
                font-size: 20px;
                color: #333333;
            }}
            .email-body p {{
                font-size: 16px;
                line-height: 1.5;
                color: #555555;
            }}
            .email-button {{
                display: inline-block;
                margin: 20px 0;
                padding: 12px 24px;
                font-size: 16px;
                color: #ffffff;
                background-color: #a78bfa;
                border-radius: 5px;
                text-decoration: none;
                text-align: center;
            }}
            .email-footer {{
                background-color: #f4f4f7;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #888888;
            }}
            .email-footer a {{
                color: #a78bfa;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <table role="presentation" class="email-container">
            <tr>
                <td class="email-header">
                    <h1>Ibento</h1>
                </td>
            </tr>
            <tr>
                <td class="email-body">
                    <h2>Hola, {usuario.nombre}</h2>
                    <p>
                        Gracias por registrarte en Ibento. Por favor, confirma tu cuenta haciendo clic en el botón de abajo:
                    </p>
                    <p style="text-align: center;">
                        <a href="https://ibento.com.mx/confirmar/{usuario.token}" class="email-button">Confirmar cuenta</a>
                    </p>
                    <p>
                        Si no solicitaste esta cuenta, puedes ignorar este correo.
                    </p>
                    <p>¡Gracias por unirte a Ibento!</p>
                </td>
            </tr>
            <tr>
                <td class="email-footer">
                    <p>
                        &copy; 2025 Ibento. Todos los derechos reservados.<br>
                        <a href="https://ibento.com.mx">Visita nuestro sitio web</a>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Generar texto plano como respaldo
    mensaje_texto = strip_tags(mensaje_html)

    # Crear el correo electrónico
    email = EmailMultiAlternatives(
        asunto,
        mensaje_texto,  # Texto plano
        settings.EMAIL_HOST_USER,
        [usuario.email],
    )
    email.attach_alternative(mensaje_html, "text/html")  # Adjuntar el contenido HTML
    email.send()


def enviar_codigo_recuperacion(email, codigo):
    asunto = 'Tu código de recuperación'
    mensaje_html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de recuperación</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f7;
                color: #333;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .email-header {{
                background: linear-gradient(90deg, #60a5fa 0%, #f472b6 50%, #a78bfa 100%);
                padding: 20px;
                text-align: center;
                color: #ffffff;
            }}
            .email-header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .email-body {{
                padding: 20px;
            }}
            .email-body h2 {{
                font-size: 20px;
                color: #333333;
            }}
            .email-body p {{
                font-size: 16px;
                line-height: 1.5;
                color: #555555;
            }}
            .email-code {{
                display: inline-block;
                margin: 20px 0;
                padding: 12px 24px;
                font-size: 18px;
                font-weight: bold;
                color: #ffffff;
                background-color: #ff7e5f;
                border-radius: 5px;
                text-decoration: none;
                text-align: center;
            }}
            .email-footer {{
                background-color: #f4f4f7;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #888888;
            }}
            .email-footer a {{
                color: #a78bfa;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <table role="presentation" class="email-container">
            <tr>
                <td class="email-header">
                    <h1>Ibento</h1>
                </td>
            </tr>
            <tr>
                <td class="email-body">
                    <h2>Hola,</h2>
                    <p>
                        Has solicitado recuperar tu contraseña. Usa el siguiente código para completar el proceso:
                    </p>
                    <p style="text-align: center;">
                        <span class="email-code">{codigo}</span>
                    </p>
                    <p>
                        Este código expirará en 10 minutos. Si no solicitaste este cambio, puedes ignorar este correo.
                    </p>
                    <p>¡Gracias por confiar en Ibento!</p>
                </td>
            </tr>
            <tr>
                <td class="email-footer">
                    <p>
                        &copy; 2025 Ibento. Todos los derechos reservados.<br>
                        <a href="https://ibento.com.mx">Visita nuestro sitio web</a>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Generar texto plano como respaldo
    mensaje_texto = strip_tags(mensaje_html)

    # Crear el correo electrónico
    email_message = EmailMultiAlternatives(
        asunto,
        mensaje_texto,  # Texto plano
        settings.EMAIL_HOST_USER,
        [email],
    )
    email_message.attach_alternative(mensaje_html, "text/html")  # Adjuntar el contenido HTML
    email_message.send()

