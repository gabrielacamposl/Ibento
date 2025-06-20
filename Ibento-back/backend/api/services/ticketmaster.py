from api.models import Evento
import uuid
import time

def guardar_eventos_desde_json(eventos_json):

    for evento in eventos_json:

        status = Evento.objects.filter(title=evento.get("title")).exists()

        # Extraer coordenadas como lista de forma segura
        coordinates_data = evento.get("coordinates", {}) or {}
        coordenates = [
            coordinates_data.get("lat"),
            coordinates_data.get("lng")
        ]

        if not status:
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