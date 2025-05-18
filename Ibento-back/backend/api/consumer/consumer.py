import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from backend.api.models import Mensaje, Conversacion

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Unirse al grupo del chat
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Salir del grupo del chat
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Received data:", data)

        # Guardar el mensaje en la base de datos
        await self.save_message(
            remitente_id=data['remitente_id'],
            receptor_id=data['receptor_id'],
            conversacion_id=data['conversacion'],
            contenido=data['mensaje']
        )

        event = {
            'type': 'chat_message',
            'message': data
        }

        # Enviar el mensaje a todos en el grupo
        await self.channel_layer.group_send(
            self.room_group_name,
            event
        )

    async def chat_message(self, event):
        data = event['message']
        print("Sending to socket:", data)

        response = {
            'mensaje': data['mensaje'],
            'remitente': data['remitente_id'],
            'destinatario': data['receptor_id'],
            'conversacion_id': data['conversacion'],
        }

        await self.send(text_data=json.dumps({
            "message": response,
        }))

    @database_sync_to_async
    def save_message(self, remitente_id, receptor_id, conversacion_id, contenido):
        return Mensaje.objects.create(
            remitente_id=remitente_id,
            receptor_id=receptor_id,
            conversacion_id=conversacion_id,
            mensaje=contenido
        )
