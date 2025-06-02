from api.models import Evento
import uuid
import time
from celery import shared_task

def guardar_eventos_desde_json(eventos_json):

    for evento in eventos_json:

        status = Evento.objects.filter(title=evento.get("title")).exists()

        # Extraer coordenadas como lista
        coordenates = [
            evento.get("coordinates", {}).get("lat"),
            evento.get("coordinates", {}).get("lng")
        ]

        if not status:
            # Guardar el evento en la base de datos
            Evento.objects.create(
                title=evento.get("title", ""),
                place=evento.get("place", ""),
                price=evento.get("price", []),
                location=evento.get("location", ""),
                coordenates=coordenates,
                description=evento.get("description", ""),
                classifications=evento.get("classification", []),
                dates=evento.get("dates", []),
                imgs=evento.get("img_urls") if evento.get("img_urls") else [],
                url=evento.get("url", "") if evento.get("url") else None
            )

@shared_task
def prueba(id_Evento):
    
    time.sleep(10)
    evento = Evento.objects.get(id=id_Evento)
    evento.assistants += 1
    evento.save()
    print(f"Evento {evento.title} actualizado con éxito. Asistentes: {evento.assistants}")
    print(f"Prueba de tarea Celery con ID: {id_Evento} completada.")
    return True