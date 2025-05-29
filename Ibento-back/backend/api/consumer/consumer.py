import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Received data:", data)

        # Aquí llamamos save_message de forma segura en código async
        await database_sync_to_async(self.save_message)(
            conversacion_id=data['conversacion'],
            remitente_id=data['remitente_id'],
            receptor_id=data['receptor_id'],
            mensaje=data['mensaje']
        )

        event = {
            'type': 'chat_message',
            'message': data
        }

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

        await self.send(text_data=json.dumps({
            "message": response,
        }))

    # Método síncrono que guarda el mensaje en la base de datos
    def save_message(self, conversacion_id, remitente_id, receptor_id, mensaje):
        from backend.api.models import Mensaje, Conversacion, Usuario

        conversacion = Conversacion.objects.get(_id=conversacion_id)
        remitente = Usuario.objects.get(_id=remitente_id)
        receptor = Usuario.objects.get(_id=receptor_id)

        Mensaje.objects.create(
            conversacion=conversacion,
            remitente=remitente,
            receptor=receptor,
            mensaje=mensaje
        )
