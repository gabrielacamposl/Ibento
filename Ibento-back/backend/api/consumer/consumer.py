import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Importa aquí para evitar errores de carga prematura
        from backend.api.models import Mensaje, Conversacion

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Unirse al grupo del canal
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Importa aquí también si necesitas modelos (en este caso no es necesario)
        # Salir del grupo del canal
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        from backend.api.models import Mensaje, Conversacion

        data = json.loads(text_data)
        print("Received data:", data)

        # Guardar el mensaje en la base de datos de forma asíncrona
        await self.save_message(
            conversacion_id=data['conversacion'],
            remitente_id=data['remitente_id'],
            receptor_id=data['receptor_id'],
            mensaje=data['mensaje']
        )

        event = {
            'type': 'chat_message',
            'message': data
        }

        # Enviar mensaje al grupo
        await self.channel_layer.group_send(
            self.room_group_name,
            event
        )

    async def chat_message(self, event):
        data = event['message']
        print(data)
        response = {
            'mensaje': data['mensaje'],
            'remitente': data['remitente_id'],
            'destinatario': data['receptor_id'],
            'conversacion_id': data['conversacion'],
        }

        # Enviar el mensaje a través del WebSocket
        await self.send(text_data=json.dumps({
            "message": response,
        }))

    @database_sync_to_async
    def save_message(self, conversacion_id, remitente_id, receptor_id, mensaje):
        from backend.api.models import Mensaje, Conversacion, Usuario

        # Obtener instancias para las relaciones
        conversacion = Conversacion.objects.get(_id=conversacion_id)
        remitente = Usuario.objects.get(_id=remitente_id)
        receptor = Usuario.objects.get(_id=receptor_id)

        # Crear y guardar el mensaje
        Mensaje.objects.create(
            conversacion=conversacion,
            remitente=remitente,
            receptor=receptor,
            mensaje=mensaje
        )
