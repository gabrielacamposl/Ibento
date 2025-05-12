import json 
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import Mensaje, Conversacion

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Received data:", data)
        
        event = {
            'type': 'chat_message',
            'message': data
            
        }
        # # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,event)
        

    async def chat_message(self, event):
        data = event['message']
        print(data)
        response = {
            'mensaje': data['mensaje'],
            'remitente': data['remitente_id'],
            'destinatario': data['receptor_id'],
            'conversacion_id': data['conversacion'],
            
        }

        # Send message to WebSocket
      
        await self.send(text_data=json.dumps({
           "message": response,
          
        }))

    # @database_sync_to_async
    # def save_message(self, user_id, message):
    #     # Save the message to the database using your ORM model
    #     Conversacion.objects.create(user_id=user_id, mensaje=message)  # Adjust this line according to your model structure. 