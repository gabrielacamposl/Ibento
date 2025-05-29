from api.models import Evento
import uuid

def guardar_eventos_CDMX_desde_json(eventos_json):
    for evento in eventos_json:

        # Extraer coordenadas como lista
        coordenates = [
            evento.get("coordinates", {}).get("lat"),
            evento.get("coordinates", {}).get("lng")
        ]
        
        # Guardar el evento en la base de datos
        Evento.objects.create(
            title=evento.get("title", ""),
            place=evento.get("place", ""),
            price=evento.get("price", []),
            location=evento.get("location", ""),
            coordenates=coordenates,
            description=evento.get("description", ""),
            classifications=evento.get("classification", []),
            dates = evento.get("dates", []),
            imgs= evento.get("img_urls") if evento.get("img_urls") else [],
            url = evento.get("url", "") if evento.get("url") else None
        )