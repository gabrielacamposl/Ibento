import requests
import json
import time
import os
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

# Cargar variables de entorno desde el archivo .env
TICKETMASTER_API_KEY = os.getenv("API_KEY_TICKETMASTER")

classification_translations = {
    
    # Miscellaneous
    "Miscellaneous": "Diverso",
    "Casino/Gaming": "Casino/Juegos",
    "Comedy": "Comedia",
    "Community/Civic": "Comunidad/Cívico",
    "Community/Cultural": "Comunidad/Cultural",
    "Fairs & Festivals": "Ferias y Festivales",
    "Family": "Familia",
    "Food & Drink": "Comida y Bebida",
    "Health/Wellness": "Salud/Bienestar",
    "Hobby/Special Interest Expos": "Exposiciones de Pasatiempos/Intereses Especiales",
    "Holiday": "Festividades",
    "Ice Shows": "Shows de Hielo",
    "Lecture/Seminar": "Conferencia/Seminario",
    "Multimedia": "Multimedia",
    "Psychics/Mediums/Hypnotists": "Psíquicos/Médiums/Hipnotistas",
    "Special Interest/Hobby": "Interés Especial/Pasatiempos",
    "Undefined": "No Definido",

    # Sports
    "Sports" : "Deportes",
    "Aquatics": "Acuáticos",
    "Athletic Races": "Carreras Atléticas",
    "Badminton": "Bádminton",
    "Bandy": "Bandy",
    "Baseball": "Béisbol",
    "Basketball": "Baloncesto",
    "Biathlon": "Biatlón",
    "Body Building": "Fisicoculturismo",
    "Boxing": "Boxeo",
    "Cricket": "Cricket",
    "Curling": "Curling",
    "Cycling": "Ciclismo",
    "Equestrian": "Ecuestre",
    "eSports": "eSports",
    "Extreme": "Extremo",
    "Field Hockey": "Hockey sobre Césped",
    "Fitness": "Fitness",
    "Floorball": "Floorball",
    "Football": "Fútbol Americano",
    "Golf": "Golf",
    "Gymnastics": "Gimnasia",
    "Handball": "Balonmano",
    "Hockey": "Hockey",
    "Ice Skating": "Patinaje sobre Hielo",
    "Indoor Soccer": "Fútbol Sala",
    "Lacrosse": "Lacrosse",
    "Martial Arts": "Artes Marciales",
    "Miscellaneous": "Diverso",
    "Motorsports/Racing": "Motores/Carreras",
    "Netball": "Netball",
    "Rodeo": "Rodeo",
    "Roller Derby": "Roller Derby",
    "Roller Hockey": "Roller Hockey",
    "Rugby": "Rugby",
    "Ski Jumping": "Salto de Esquí",
    "Skiing": "Esquí",
    "Soccer": "Fútbol",
    "Softball": "Softbol",
    "Squash": "Squash",
    "Surfing": "Surf",
    "Swimming": "Natación",
    "Table Tennis": "Tenis de Mesa",
    "Tennis": "Tenis",
    "Toros": "Toros",
    "Track & Field": "Atletismo",
    "Volleyball": "Voleibol",
    "Waterpolo": "Waterpolo",
    "Wrestling": "Lucha Libre",
    "Ringuette": "Ringuette",
    "Padel": "Pádel",

    # Music
    "Music" : "Música",
    "Alternative": "Alternativa",
    "Ballads/Romantic": "Baladas/Romántica",
    "Blues": "Blues",
    "Chanson Francaise": "Canción Francesa",
    "Children's Music": "Música Infantil",
    "Classical": "Clásica",
    "Country": "Country",
    "Dance/Electronic": "Dance/Electrónica",
    "Folk": "Folk",
    "Hip-Hop/Rap": "Hip-Hop/Rap",
    "Holiday": "Festiva",
    "Jazz": "Jazz",
    "Latin": "Latina",
    "Medieval/Renaissance": "Medieval/Renacimiento",
    "Metal": "Metal",
    "New Age": "New Age",
    "Other": "Otro",
    "Pop": "Pop",
    "R&B": "R&B",
    "Reggae": "Reggae",
    "Religious": "Religiosa",
    "Rock": "Rock",
    "Undefined": "No Definido",
    "World": "Mundial",

    # Arts & Theatre
    "Arts & Theatre": "Artes y Teatro",
    "Children's Theatre": "Teatro Infantil",
    "Circus & Specialty Acts": "Circo y Actos Especiales",
    "Classical": "Clásico",
    "Comedy": "Comedia",
    "Cultural": "Cultural",
    "Dance": "Danza",
    "Espectaculo": "Espectáculo",
    "Fashion": "Moda",
    "Fine Art": "Bellas Artes",
    "Magic & Illusion": "Magia e Ilusión",
    "Miscellaneous": "Diverso",
    "Miscellaneous Theatre": "Teatro diverso",
    "Multimedia": "Multimedia",
    "Music": "Música",
    "Opera": "Ópera",
    "Performance Art": "Arte Performático",
    "Puppetry": "Títeres",
    "Spectacular": "Espectacular",
    "Theatre": "Teatro",
    "Variety": "Variedades",

    # Undefined
    "Undefined": "No Definido",

    # Film
    "Film": "Cine",
    "Action/Adventure": "Acción/Aventura",
    "Animation": "Animación",
    "Arthouse": "Cine de Autor",
    "Comedy": "Comedia",
    "Documentary": "Documental",
    "Drama": "Drama",
    "Family": "Familiar",
    "Foreign": "Extranjero",
    "Horror": "Terror",
    "Miscellaneous": "Diverso",
    "Music": "Música",
    "Science Fiction": "Ciencia Ficción",
    "Urban": "Urbano"
}

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
        
        image_urls = []
        if 'images' in event and event['images']:
            # Prioritize 16_9 ratio images > 500px width
            primary_images = [img for img in event['images'] if img.get('ratio') == '16_9' and img.get('width', 0) > 500]
            if primary_images:
                image_urls.extend([img['url'] for img in primary_images[:3]])
            
            if len(image_urls) < 3:
                other_images = [img['url'] for img in event['images'] if img not in primary_images]
                image_urls.extend(other_images[:3 - len(image_urls)])

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
        location = 'Ubicación no especificada'
        if '_embedded' in event and 'venues' in event['_embedded'] and event['_embedded']['venues']:
            venue = event['_embedded']['venues'][0]
            city = venue.get('city', {}).get('name', '')
            state = venue.get('state', {}).get('name', '')
            country = venue.get('country', {}).get('name', '')
            address = venue.get('address', {}).get('line1', '')
            location_parts = [part for part in [address, city, state, country] if part]
            if location_parts:
                location = ", ".join(location_parts)
                
        # Clasificaciones
        classi = []
        if 'classifications' in event:
            classifications = event['classifications']
            for classification in classifications:
                if 'segment' in classification:
                    segment = classification['segment'].get('name', 'Sin clasificación')
                    # Traducir el segmento si existe en el diccionario
                    translated_segment = classification_translations.get(segment, segment) # Si no encuentra traducción, usa el original
                    classi.append(translated_segment)
                if 'genre' in classification:
                    genre = classification['genre'].get('name', 'Sin género')
                    # Traducir el género si existe en el diccionario
                    translated_genre = classification_translations.get(genre, genre)
                    classi.append(translated_genre)
                if 'subGenre' in classification:
                    sub_genre = classification['subGenre'].get('name', 'Sin subgénero')
                    # Traducir el subgénero si existe en el diccionario
                    translated_sub_genre = classification_translations.get(sub_genre, sub_genre)
                    classi.append(translated_sub_genre)

        

        # Construir el objeto formateado
        formatted_event = {
            "title": event.get('name', 'Sin nombre'),
            "place": event.get('_embedded', {}).get('venues', [{}])[0].get('name', 'Lugar no especificado'),
            "price": prices if prices else ['Precio no disponible'],
            "location": location,
            "coordinates": coordinates,
            "description": event.get('info') or event.get('pleaseNote') or 'Sin descripción disponible',
            "classification": classi if classi else ['Sin clasificaciones'],
            "dates": dates if dates else ['Fecha no especificada'],
            "img_urls": image_urls,  # Changed from img_url to img_urls
            "url": event.get('url', 'URL no disponible')
        }
        
        formatted_events.append(formatted_event)
    
    return formatted_events

def get_all_ticketmaster_events(size=200, city=None, dma_id=802, start_date_time=None, 
                               end_date_time=None, keyword=None, max_pages=1):
    all_events = []
    page = 0

    while True:
        # Construir URL base
        api_url = (
            f"https://app.ticketmaster.com/discovery/v2/events.json?"
            f"apikey={TICKETMASTER_API_KEY}&size={size}&page={page}"
        )
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
            response = requests.get(api_url)
            data = response.json()

            # Verificar si hay eventos
            if '_embedded' not in data or 'events' not in data['_embedded']:
                print(f"No more events found on page {page}.")
                break

            events = data['_embedded']['events']
            formatted_events = format_event_data(events)
            all_events.extend(formatted_events)

            print(f"Fetched {len(events)} events from page {page}.")

            # Si la cantidad de eventos es menor al máximo, ya no hay más páginas
            if len(events) < size:
                break

            page += 1

            # Seguridad: evitar bucles infinitos
            if page >= max_pages:
                print("Reached max_pages limit.")
                break

        except Exception as e:
            print(f"Error fetching data from TicketMaster API: {e}")
            break

    return all_events

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

    print("Fetching all events from Ticketmaster (with pagination)...")
    events = get_all_ticketmaster_events(
        size=200,
        max_pages=10
    )
    print(f"\nFound {len(events)} events in total")
    
    # Mostrar información de eventos
    print(f"\nFound {len(events)} events")
    for i, event in enumerate(events[:5]):
        print(f"\n--- Event {i+1} ---")
        print(f"Nombre: {event['title']}")
        print(f"Lugar: {event['place']}")
        print(f"Ubicación: {event['location']}")
        print(f"Coordenadas: {event['coordinates']}")
        print(f"Fechas: {event['dates']}")
        print(f"Descripción: {event['description']}")
        print(f"Clasificaciones: {event['classification']}")
        print(f"URLs de Imagen: {event['img_urls']}") # Changed to print the list of URLs
        print(f"URL: {event['url']}")
    
    # Guardar eventos en JSON
    filename = f"ticketmaster_events_max.json"
    save_events_to_json(events, filename)
