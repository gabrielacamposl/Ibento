# api/services/notification_service.py
import logging
from firebase_admin import messaging
from ..models import FCMToken, Usuario
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

class NotificationService:
    """Servicio para manejar notificaciones push con Firebase"""
    
    @staticmethod
    def send_notification(
        user_id: str, 
        title: str, 
        body: str, 
        notification_type: str = 'general',
        data: Optional[Dict[str, str]] = None,
        click_action: Optional[str] = None
    ) -> bool:
        """
        Envía una notificación a un usuario específico
        """
        try:
            # Obtener tokens activos del usuario
            tokens = FCMToken.objects.filter(
                usuario___id=user_id, 
                is_active=True
            ).values_list('token', flat=True)
            
            if not tokens:
                logger.info(f"No active tokens found for user {user_id}")
                return False
            
            tokens_list = list(tokens)
            
            # Preparar data payload
            notification_data = data or {}
            notification_data.update({
                'type': notification_type,
                'user_id': user_id,
                'click_action': click_action or f'https://ibento.com.mx/',
            })
            
            # Crear mensaje
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                    image=None  # Puedes agregar imagen si necesitas
                ),
                data=notification_data,
                android=messaging.AndroidConfig(
                    notification=messaging.AndroidNotification(
                        icon='ic_notification',
                        color='#6366f1',
                        sound='default',
                        tag=notification_type,
                        click_action=click_action or f'https://ibento.com.mx/',
                    ),
                    priority='high'
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title=title,
                                body=body
                            ),
                            badge=1,
                            sound='default',
                            category=notification_type
                        )
                    )
                ),
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        title=title,
                        body=body,
                        icon='/icons/ibento192x192.png',
                        badge='/icons/ibentoba.png',
                        tag=notification_type,
                        renotify=True,
                        require_interaction=True,
                        vibrate=[200, 100, 200],
                        actions=[
                            messaging.WebpushNotificationAction(
                                action='open',
                                title='Ver ahora'
                            )
                        ]
                    ),
                    fcm_options=messaging.WebpushFCMOptions(
                        link=click_action or f'https://ibento.com.mx/'
                    )
                ),
                tokens=tokens_list
            )
            
            # Enviar notificación
            response = messaging.send_multicast(message)
            
            # Manejar respuesta
            success_count = response.success_count
            failure_count = response.failure_count
            
            logger.info(f"Notifications sent to user {user_id}: {success_count} success, {failure_count} failures")
            
            # Manejar tokens inválidos
            if response.responses:
                invalid_tokens = []
                for idx, resp in enumerate(response.responses):
                    if not resp.success:
                        error_code = resp.exception.code if resp.exception else 'unknown'
                        if error_code in ['registration-token-not-registered', 'invalid-registration-token']:
                            invalid_tokens.append(tokens_list[idx])
                            logger.info(f"Invalid token found: {tokens_list[idx][:20]}...")
                
                # Desactivar tokens inválidos
                if invalid_tokens:
                    FCMToken.objects.filter(token__in=invalid_tokens).update(is_active=False)
                    logger.info(f"Deactivated {len(invalid_tokens)} invalid tokens")
            
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error sending notification to user {user_id}: {str(e)}")
            return False
    
    @staticmethod
    def send_like_notification(liked_user_id: str, liker_name: str) -> bool:
        """Envía notificación cuando alguien da like"""
        return NotificationService.send_notification(
            user_id=liked_user_id,
            title="¡Alguien te dio like! 💕",
            body=f"{liker_name} está interesado en ser tu acompañante",
            notification_type='like',
            click_action='https://ibento.com.mx/ibento/match',
            data={
                'liker_name': liker_name,
                'action': 'view_likes'
            }
        )
    
    @staticmethod
    def send_match_notification(user_id: str, match_name: str) -> bool:
        """Envía notificación cuando hay un match"""
        return NotificationService.send_notification(
            user_id=user_id,
            title="¡Es un Match! 🎉",
            body=f"Tú y {match_name} se han gustado mutuamente. ¡Empieza a chatear!",
            notification_type='match',
            click_action='https://ibento.com.mx/ibento/chat',
            data={
                'match_name': match_name,
                'action': 'open_chat'
            }
        )
    
    @staticmethod
    def send_message_notification(receiver_id: str, sender_name: str, message_preview: str) -> bool:
        """Envía notificación cuando se recibe un mensaje"""
        # Truncar mensaje si es muy largo
        preview = message_preview[:50] + "..." if len(message_preview) > 50 else message_preview
        
        return NotificationService.send_notification(
            user_id=receiver_id,
            title=f"Mensaje de {sender_name} 💬",
            body=preview,
            notification_type='message',
            click_action='https://ibento.com.mx/ibento/chat',
            data={
                'sender_name': sender_name,
                'action': 'open_chat'
            }
        )
    
    @staticmethod
    def send_event_notification(user_id: str, event_title: str, event_type: str = 'new_event') -> bool:
        """Envía notificación sobre eventos"""
        if event_type == 'new_event':
            title = "¡Nuevo evento disponible! 🎪"
            body = f"Descubre: {event_title}"
        elif event_type == 'event_reminder':
            title = "Recordatorio de evento 📅"
            body = f"Tu evento {event_title} es próximamente"
        else:
            title = "Actualización de evento"
            body = f"Hay cambios en {event_title}"
        
        return NotificationService.send_notification(
            user_id=user_id,
            title=title,
            body=body,
            notification_type='event',
            click_action='https://ibento.com.mx/ibento/eventos',
            data={
                'event_title': event_title,
                'event_type': event_type,
                'action': 'view_event'
            }
        )
    
    @staticmethod
    def send_bulk_notification(
        user_ids: List[str], 
        title: str, 
        body: str, 
        notification_type: str = 'general'
    ) -> Dict[str, int]:
        """Envía notificación a múltiples usuarios"""
        results = {'success': 0, 'failed': 0}
        
        for user_id in user_ids:
            success = NotificationService.send_notification(
                user_id=user_id,
                title=title,
                body=body,
                notification_type=notification_type
            )
            if success:
                results['success'] += 1
            else:
                results['failed'] += 1
        
        logger.info(f"Bulk notification results: {results}")
        return results