import requests
import json
import time
import os
from datetime import datetime

# Configuración
TICKETMASTER_API_KEY = "LwNCjnI1T10t1b5HfOGqeaXEFDipwWn9"  # Reemplaza con tu API key o usa variables de entorno

def format_event_data(events):
    
    if not events:
        return []
    
    formatted_events = []
    
    for event in events:
        
        # Extraer precios/costos si están disponibles
        prices = []
        if 'priceRanges' in event:
            for price_range in event['priceRanges']:
                prices.append(f"{price_range.get('min')} - {price_range.get('max')} {price_range.get('currency')}")
        
        # Extraer fechas
        dates = []
        if 'dates' in event and 'start' in event['dates']:
            start_date = event['dates']['start'].get('dateTime') or event['dates']['start'].get('localDate')
            if start_date:
                dates.append(start_date)
        
        # Si hay múltiples fechas en el evento
        if '_embedded' in event and 'venues' in event['_embedded']:
            venue = event['_embedded']['venues'][0]
            if 'upcomingEvents' in venue and 'event' in venue['upcomingEvents']:
                additional_dates = venue['upcomingEvents']['event']
                if additional_dates > 1:
                    dates.append(f"+{additional_dates - 1} más fechas")
        
        # Extraer imagen
        image_url = None
        if 'images' in event and event['images']:
            imgs = next((img for img in event['images'] if img.get('ratio') == '16_9' and img.get('width', 0) > 500), None)
            image_url = imgs['url'] if imgs else event['images'][0]['url']
        
        # Extraer coordenadas geográficas
        coordinates = None
        if '_embedded' in event and 'venues' in event['_embedded'] and event['_embedded']['venues']:
            venue = event['_embedded']['venues'][0]
            if 'location' in venue and 'latitude' in venue['location'] and 'longitude' in venue['location']:
                coordinates = {
                    'lat': float(venue['location']['latitude']),
                    'lng': float(venue['location']['longitude'])
                }
        
        # Construir ubicación
        if '_embedded' in event and 'venues' in event['_embedded'] and event['_embedded']['venues']:
            venue = event['_embedded']['venues'][0]
            city = venue.get('city', {}).get('name', '')
            state = venue.get('state', {}).get('name', '')
            country = venue.get('country', {}).get('name', '')
            address = venue.get('address', {}).get('line1', '')
            location = ""
            if address:
                location = address + ", "
            if city:
                location += city + ", "
            if state:
                location += state + ", "
            if country:
                location += country
            if location == "":
                location = 'Ubicación no especificada'
                
        #Clasificaciones
        classi = []
        if 'classifications' in event:
            classifications = event['classifications']
            for classification in classifications:
                if 'segment' in classification:
                    segment = classification['segment'].get('name', 'Sin clasificación')
                    classi.append(segment)
                if 'genre' in classification:
                    genre = classification['genre'].get('name', 'Sin género')
                    classi.append(genre)
                if 'subGenre' in classification:
                    sub_genre = classification['subGenre'].get('name', 'Sin subgénero')
                    classi.append(sub_genre)


        # Construir el objeto formateado
        formatted_event = {
            "nombre": event.get('name', 'Sin nombre'),
            "lugar": event.get('_embedded', {}).get('venues', [{}])[0].get('name', 'Lugar no especificado'),
            "costo": prices if prices else ['Precio no disponible'],
            "ubicacion": location,
            "coordenadas": coordinates,
            "descripcion": event.get('info') or event.get('pleaseNote') or 'Sin descripción disponible',
            "clasificaciones": classi if classi else ['Sin clasificaciones'],
            "fechas": dates if dates else ['Fecha no especificada'],
            "img_url": image_url
        }
        
        formatted_events.append(formatted_event)
    
    return formatted_events

def get_ticketmaster_events(size=100, city=None, dma_id=802, start_date_time=None, 
                           end_date_time=None, keyword=None):
    
    # Construir URL base
    api_url = f"https://app.ticketmaster.com/discovery/v2/events.json?apikey={TICKETMASTER_API_KEY}&size={size}"
    
    # Añadir parámetros opcionales si están presentes
    if city:
        api_url += f"&city={city}"
    if dma_id:
        api_url += f"&dmaId={dma_id}"
    if start_date_time:
        api_url += f"&startDateTime={start_date_time}"
    if end_date_time:
        api_url += f"&endDateTime={end_date_time}"
    if keyword:
        api_url += f"&keyword={keyword}"
    
    try:
        # Realizar la petición a la API de TicketMaster
        response = requests.get(api_url)
        data = response.json()
        
        # Verificar si hay eventos
        if '_embedded' not in data or 'events' not in data['_embedded']:
            print("No events found")
            return []
        
        # Formatear los datos de eventos
        formatted_events = format_event_data(data['_embedded']['events'])
        
        return formatted_events
    
    except Exception as e:
        print(f"Error fetching data from TicketMaster API: {e}")
        return []

def save_events_to_json(events, filename='ticketmaster_events.json'):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)
        print(f"Successfully saved {len(events)} events to {filename}")
        return True
    except Exception as e:
        print(f"Error saving events to JSON: {e}")
        return False

if __name__ == "__main__":
    
    # Obtener eventos
    print("Fetching events from Ticketmaster...")
    events = get_ticketmaster_events(
        size=50,
    )
    
    # Mostrar información de eventos
    print(f"\nFound {len(events)} events")
    for i, event in enumerate(events[:5]):
        print(f"\n--- Event {i+1} ---")
        print(f"Nombre: {event['nombre']}")
        print(f"Lugar: {event['lugar']}")
        print(f"Ubicación: {event['ubicacion']}")
        print(f"Coordenadas: {event['coordenadas']}")
        print(f"Fechas: {event['fechas']}")
        print(f"Descripción: {event['descripcion']}")
        print(f"Clasificaciones: {event['clasificaciones']}")
    
    # Guardar eventos en JSON
    filename = f"ticketmaster_events.json"
    save_events_to_json(events, filename)
