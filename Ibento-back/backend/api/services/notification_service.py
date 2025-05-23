# services/notification_service.py
from firebase_admin import messaging
from api.models import FCMToken
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    
    @staticmethod
    def send_notification(user_id, title, body, data=None, notification_type='general'):

        try:
            # Obtener todos los tokens activos del usuario
            tokens = FCMToken.objects.filter(
                usuario_id=user_id, 
                is_active=True
            ).values_list('token', flat=True)
            
            if not tokens:
                logger.warning(f"No FCM tokens found for user {user_id}")
                return False
            
            # Preparar el mensaje
            notification_data = data or {}
            notification_data.update({
                'type': notification_type,
                'click_action': NotificationService._get_click_action(notification_type),
                'timestamp': str(int(time.time()))
            })
            
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                    image=None  # Puedes agregar imagen si quieres
                ),
                data=notification_data,
                tokens=list(tokens),
                android=messaging.AndroidConfig(
                    notification=messaging.AndroidNotification(
                        icon='/icons/ibento192x192.png',
                        color='#6366f1',
                        sound='default',
                        channel_id='ibento_notifications'
                    ),
                    priority='high'
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound='default',
                            badge=1,
                            category='IBENTO_NOTIFICATION'
                        )
                    )
                ),
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        title=title,
                        body=body,
                        icon='/icons/ibento192x192.png',
                        badge='/icons/ibentoba.png',
                        vibrate=[200, 100, 200],
                        require_interaction=True,
                        tag=notification_type,
                        renotify=True
                    ),
                    fcm_options=messaging.WebpushFCMOptions(
                        link=NotificationService._get_click_action(notification_type)
                    )
                )
            )
            
            # Enviar mensaje
            response = messaging.send_multicast(message)
            
            # Procesar respuesta y limpiar tokens inválidos
            NotificationService._handle_response(response, tokens, user_id)
            
            logger.info(f"Notification sent to user {user_id}: {response.success_count} successful, {response.failure_count} failed")
            return response.success_count > 0
            
        except Exception as e:
            logger.error(f"Error sending notification to user {user_id}: {str(e)}")
            return False
    
    @staticmethod
    def send_like_notification(liked_user_id, liker_name):
        """Notificación cuando alguien te da like"""
        title = "¡Nuevo like! 💕"
        body = f"{liker_name} quiere ser tu acompañante."
        
        return NotificationService.send_notification(
            user_id=liked_user_id,
            title=title,
            body=body,
            notification_type='like'
        )
    
    @staticmethod
    def send_match_notification(user_id, match_name):
        """Notificación cuando hay un match"""
        title = "¡Es un Match! 🎉"
        body = f"Tienes un nuevo match con {match_name}"
        
        return NotificationService.send_notification(
            user_id=user_id,
            title=title,
            body=body,
            notification_type='match'
        )
    
    @staticmethod
    def send_message_notification(receiver_id, sender_name, message_preview=""):
        """Notificación cuando recibes un mensaje"""
        title = f"Mensaje de {sender_name} 💬"
        body = message_preview[:50] + "..." if len(message_preview) > 50 else message_preview
        
        return NotificationService.send_notification(
            user_id=receiver_id,
            title=title,
            body=body,
            notification_type='message',
            data={'sender_name': sender_name}
        )
    
    @staticmethod
    def _get_click_action(notification_type):
        """Define a dónde redirigir según el tipo de notificación"""
        actions = {
            'like': 'https://ibento.com.mx/ibento/verLike',
            'match': 'https://ibento.com.mx/ibento/match',
            'message': 'https://ibento.com.mx/ibento/chat',
            'general': 'https://ibento.com.mx/'
        }
        return actions.get(notification_type, 'https://ibento.com.mx/')
    
    @staticmethod
    def _handle_response(response, tokens, user_id):
        """Procesa la respuesta de Firebase y limpia tokens inválidos"""
        if response.failure_count > 0:
            failed_tokens = []
            for idx, resp in enumerate(response.responses):
                if not resp.success:
                    failed_tokens.append(tokens[idx])
                    logger.error(f"Failed to send to token {tokens[idx]}: {resp.exception}")
            
            # Desactivar tokens que fallaron por ser inválidos
            if failed_tokens:
                FCMToken.objects.filter(
                    usuario_id=user_id,
                    token__in=failed_tokens
                ).update(is_active=False)

import time