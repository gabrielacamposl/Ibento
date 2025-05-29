from playwright.sync_api import sync_playwright
import time
import re
import json
import requests
import logging
from datetime import datetime

from dotenv import load_dotenv
import os
from openai import OpenAI

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraping_cdmx.log'),
        logging.StreamHandler()
    ]
)

load_dotenv()

API_KEY_GOOGLE = os.getenv("API_KEY_GOOGLE")
API_KEY_DEEPSEEK = os.getenv("API_KEY_DEEPSEEK")

client = OpenAI(api_key=API_KEY_DEEPSEEK, base_url="https://api.deepseek.com")
API_URL = "https://api.deepseek.com/v1/chat/completions"

def analizar_genero(titulo, descripcion):
    """
    Analiza el género del evento usando IA.
    """
    prompt = f"""
    Analiza el siguiente título y descripción, y determina a qué categorias y subcategorias pertenece.
    Responde **solo** con una lista de su categoria y maximo 2 subcategorias separados por comas.
    Tienes que elegir una categoria y debes elegir subcategorias que pertenezcan a esa categoria.
    Categorias:
    Música, Deportes, Artes y Teatro, Cine, Diverso, 
    Subcategorias:

    #Diverso
    "Casino/Juegos",
    "Comedia",
    "Comunidad/Cívico",
    "Comunidad/Cultural",
    "Ferias y Festivales",
    "Familia",
    "Comida y Bebida",
    "Salud/Bienestar",
    "Exposiciones de Pasatiempos/Intereses Especiales",
    "Festividades",
    "Shows de Hielo",
    "Conferencia/Seminario",
    "Multimedia",
    "Psíquicos/Médiums/Hipnotistas",
    "Interés Especial/Pasatiempos",
    "No Definido",
    #Deportes
    "Acuáticos",
    "Carreras Atléticas",
    "Bádminton",
    "Bandy",
    "Béisbol",
    "Baloncesto",
    "Biatlón",
    "Fisicoculturismo",
    "Boxeo",
    "Cricket",
    "Curling",
    "Ciclismo",
    "Ecuestre",
    "eSports",
    "Extremo",
    "Hockey sobre Césped",
    "Fitness",
    "Floorball",
    "Fútbol Americano",
    "Golf",
    "Gimnasia",
    "Balonmano",
    "Hockey",
    "Patinaje sobre Hielo",
    "Fútbol Sala",
    "Lacrosse",
    "Artes Marciales",
    "Diverso",
    "Motores/Carreras",
    "Netball",
    "Rodeo",
    "Roller Derby",
    "Roller Hockey",
    "Rugby",
    "Salto de Esquí",
    "Esquí",
    "Fútbol",
    "Softbol",
    "Squash",
    "Surf",
    "Natación",
    "Tenis de Mesa",
    "Tenis",
    "Toros",
    "Atletismo",
    "Voleibol",
    "Waterpolo",
    "Lucha Libre",
    "Ringuette",
    "Pádel",
    #Música
    "Alternativa",
    "Baladas/Romántica",
    "Blues",
    "Canción Francesa",
    "Música Infantil",
    "Clásica",
    "Country",
    "Dance/Electrónica",
    "Folk",
    "Hip-Hop/Rap",
    "Festiva",
    "Jazz",
    "Latina",
    "Medieval/Renacimiento",
    "Metal",
    "New Age",
    "Otro",
    "Pop",
    "R&B",
    "Reggae",
    "Religiosa",
    "Rock",
    "No Definido",
    "Mundial",
    #Artes y Teatro
    "Teatro Infantil",
    "Circo y Actos Especiales",
    "Clásico",
    "Comedia",
    "Cultural",
    "Danza",
    "Espectáculo",
    "Moda",
    "Bellas Artes",
    "Magia e Ilusión",
    "Diverso",
    "Teatro diverso",
    "Multimedia",
    "Música",
    "Ópera",
    "Arte Performático",
    "Títeres",
    "Espectacular",
    "Teatro",
    "Variedades",
    "No Definido",
    #Cine
    "Acción/Aventura",
    "Animación",
    "Cine de Autor",
    "Comedia",
    "Documental",
    "Drama",
    "Familiar",
    "Extranjero",
    "Terror",
    "Diverso",
    "Música",
    "Ciencia Ficción",
    "Urbano"    **Título**: {titulo}  
    **Descripción**: {descripcion}
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content": f"{prompt}"},
            ],
            stream=False
        )
        
        generos = response.choices[0].message.content
        return generos.strip()
    except Exception as e:
        logging.warning(f"Error al analizar género: {e}")
        return "No Definido"


def obtener_coordenadas(direccion, api_key):
    """
    Obtiene las coordenadas geográficas de una dirección.
    """
    if not direccion or not api_key:
        return None
        
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": direccion,
        "key": api_key
    }
    
    try:
        time.sleep(0.5)  # Rate limiting
        response = requests.get(base_url, params=params)
        data = response.json()
        
        if data["status"] == "OK" and len(data["results"]) > 0:
            location = data["results"][0]["geometry"]["location"]
            return {
                "lat": location["lat"],
                "lng": location["lng"],
                "formatted_address": data["results"][0]["formatted_address"]
            }
        else:
            logging.warning(f"No se pudieron obtener coordenadas para: {direccion}")
            return None
    except Exception as e:
        logging.error(f"Error al obtener coordenadas para {direccion}: {e}")
        return None


def existe_blockquote(page, selector):
    """
    Verifica si existe un elemento blockquote en la página.
    """
    try:
        return page.locator(selector).count() > 0
    except:
        return False


def obtener_detalles_evento_con_blockquote(page):
    """
    Extrae los detalles del evento cuando existe un blockquote.
    """
    try:
        nombre = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image h1').inner_text()
        lugar = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image h2').inner_text()
        descripcion = page.locator('.container.px-2 blockquote').all_inner_texts()
        costo = page.locator('.row.w-100 div ul li ul li').all_inner_texts()
        ubicacion = page.locator('.col-md-9.px-md-5.d-flex.align-items-center.flex-row div span').inner_text()
        url = page.url
        style_img = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image').get_attribute('style')

        patron = r"\s*url\(['\"](.*?)['\"]\)"
        coincidencia = re.search(patron, style_img)

        img = None
        if coincidencia:
            img = coincidencia.group(0).split("'")[1]

        # Obtener fechas
        fechas = []
        dias_con_eventos = page.locator('.day.event').all()
        
        for dia in dias_con_eventos:
            clases = dia.get_attribute('class')
            fecha = next((clase for clase in clases.split() if clase.startswith('calendar-day-')), None)
            
            if fecha:
                fecha_parts = fecha.split('-')[-3:]
                if len(fecha_parts) == 3:
                    fechas.append("/".join([fecha_parts[2], fecha_parts[1], fecha_parts[0]]))

        # Normalizar descripción
        desc = " ".join(descripcion)

        generos = analizar_genero(nombre, descripcion)
        coordenadas = obtener_coordenadas(ubicacion, API_KEY_GOOGLE) if ubicacion else None

        return {
            "title": nombre,
            "place": lugar,
            "price": costo,
            "location": ubicacion,
            "description": desc,
            "dates": fechas,
            "coordinates": coordenadas,
            "img_urls": img,
            "url": url,
            "classification": generos,
            "source": "CDMX Cartelera"
        }
    except Exception as e:
        logging.error(f"Error al obtener detalles del evento con blockquote: {e}")
        return None


def obtener_detalles_evento_sin_blockquote(page):
    """
    Extrae los detalles del evento cuando no existe un blockquote.
    """
    try:
        nombre = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image h1').inner_text()
        lugar = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image h2').inner_text()
        descripcion = page.locator('.container.px-2 p').all_inner_texts()
        costo = page.locator('.row.w-100 div ul li ul li').all_inner_texts()
        url = page.url
        ubicacion = page.locator('.col-md-9.px-md-5.d-flex.align-items-center.flex-row div span').inner_text()

        style_img = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image').get_attribute('style')

        patron = r"\s*url\(['\"](.*?)['\"]\)"
        coincidencia = re.search(patron, style_img)

        img = None
        if coincidencia:
            img = coincidencia.group(0).split("'")[1]

        # Obtener fechas
        fechas = []
        dias_con_eventos = page.locator('.day.event').all()
            
        for dia in dias_con_eventos:
            clases = dia.get_attribute('class')
            fecha = next((clase for clase in clases.split() if clase.startswith('calendar-day-')), None)
            
            if fecha:
                fecha_parts = fecha.split('-')[-3:]
                if len(fecha_parts) == 3:
                    fechas.append("-".join(fecha_parts))

        # Normalizar descripción
        desc = " ".join(descripcion)

        generos = analizar_genero(nombre, descripcion)
        coordenadas = obtener_coordenadas(ubicacion, API_KEY_GOOGLE) if ubicacion else None

        return {
            "title": nombre,
            "place": lugar,
            "price": costo,
            "location": ubicacion,
            "description": desc,
            "dates": fechas,
            "coordinates": coordenadas,
            "img_urls": img,
            "url": url,
            "classification": generos,
            "source": "CDMX Cartelera"
        }
    except Exception as e:
        logging.error(f"Error al obtener detalles del evento sin blockquote: {e}")
        return None


def imprimir_detalles_evento(detalles, n, pagina_actual):
    """
    Imprime los detalles del evento.
    """
    if detalles:
        print(f"------------------------Evento {n+1} (Página {pagina_actual})------------------------")
        print(f"Evento: {detalles['title']}")
        print(f"Lugar: {detalles['place']}")
        print(f"Costo: {detalles['price']}")
        print(f"Ubicación: {detalles['location']}")
        print(f"Descripción: {detalles['description'][:100]}...")
        print(f"Géneros: {detalles['classification']}")
        print(f"Fechas: {detalles['dates']}")
        print("------------------------------------------------------------")


def wait_for_page_load(page, timeout=10):
    """
    Espera a que la página se cargue completamente.
    """
    try:
        page.wait_for_load_state('networkidle', timeout=timeout * 1000)
        time.sleep(1)  # Tiempo adicional para asegurar que todo esté cargado
        return True
    except Exception as e:
        logging.warning(f"Timeout esperando carga de página: {e}")
        return False


def verificar_si_hay_siguiente_pagina(page):
    """
    Verifica si existe un botón de siguiente página y si está habilitado.
    """
    try:
        # Buscar específicamente el botón de siguiente página para eventos (no venues)
        next_button = page.locator('#cdmx-billboard-event-paginator [jp-role="next"].page.btn')
        
        # Verificar si existe y si está habilitado
        if next_button.count() > 0:
            # Verificar si el botón no está deshabilitado
            button_classes = next_button.first().get_attribute('class')
            is_disabled = 'disabled' in button_classes if button_classes else False
            return not is_disabled
        
        return False
    except Exception as e:
        logging.warning(f"Error al verificar siguiente página: {e}")
        return False


def verificar_si_hay_eventos(page):
    """
    Verifica si hay eventos en la página actual.
    """
    try:
        # Verificar si aparece el mensaje de "No encontramos resultados"
        no_results = page.get_by_role("heading", name="No encontramos resultados que coincidan con tu búsqueda")
        if no_results.is_visible(timeout=2000):
            return False
        
        # Verificar si hay eventos en la página
        events = page.query_selector_all('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row')
        return len(events) > 0
    
    except Exception as e:
        logging.warning(f"Error al verificar eventos: {e}")
        return False


def scrape_eventos():
    """
    Función principal para hacer scraping de todos los eventos disponibles.
    """
    eventos_data = []
    
    with sync_playwright() as p:
        try:
            # Iniciar el navegador
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Configurar timeouts más largos
            page.set_default_timeout(30000)
            
            # Navegar a la página
            logging.info("Navegando a la página de CDMX Cartelera...")
            page.goto('https://cartelera.cdmx.gob.mx/')
            
            wait_for_page_load(page)
            
            pagina_actual = 1
            total_eventos = 0
            
            while True:
                logging.info(f"Procesando página {pagina_actual}...")
                
                try:
                    # Verificar si hay mensaje de "No encontramos resultados"
                    if not verificar_si_hay_eventos(page):
                        logging.info("No hay más resultados disponibles")
                        break
                    
                    # Esperar a que los eventos estén cargados
                    page.wait_for_selector('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row', timeout=15000)
                    
                    # Extraer los eventos
                    events = page.query_selector_all('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row')
                    
                    if not events:
                        logging.info("No se encontraron eventos en esta página")
                        break
                    
                    logging.info(f"Encontrados {len(events)} eventos en la página {pagina_actual}")
                    
                    # Iterar sobre los eventos
                    for n in range(len(events)):
                        try:
                            # Asegurarse de que los eventos estén disponibles
                            page.wait_for_selector('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row')
                            event = page.locator('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row').nth(n)
                            event.click()

                            # Esperar a que la página del evento se cargue
                            wait_for_page_load(page)

                            # Obtener detalles del evento
                            if existe_blockquote(page, '.container.px-2 blockquote'):
                                detalles = obtener_detalles_evento_con_blockquote(page)
                            else:
                                detalles = obtener_detalles_evento_sin_blockquote(page)

                            if detalles:
                                # Imprimir detalles del evento
                                imprimir_detalles_evento(detalles, n, pagina_actual)
                                
                                # Agregar el evento a la lista de eventos
                                eventos_data.append(detalles)
                                total_eventos += 1
                                
                                logging.info(f"Evento {total_eventos} procesado exitosamente")
                            else:
                                logging.warning(f"No se pudieron obtener detalles del evento {n+1} en página {pagina_actual}")

                            # Regresar a la página anterior
                            salir = page.get_by_role("button", name="Regresar a búsqueda")
                            salir.click()
                            
                            wait_for_page_load(page)
                            
                        except Exception as e:
                            logging.error(f"Error procesando evento {n+1} en página {pagina_actual}: {e}")
                            try:
                                # Intentar regresar a la búsqueda si hay error
                                page.go_back()
                                wait_for_page_load(page)
                            except:
                                pass
                            continue                    # Verificar si hay botón de siguiente página
                    if not verificar_si_hay_siguiente_pagina(page):
                        logging.info("No hay más páginas disponibles")
                        break
                    
                    # Hacer clic en siguiente página - usar selector específico para eventos
                    next_button = page.locator('#cdmx-billboard-event-paginator [jp-role="next"].page.btn').first()
                    next_button.click()
                    wait_for_page_load(page)
                    
                    pagina_actual += 1
                    
                    # Pequeña pausa entre páginas
                    time.sleep(2)
                        
                except Exception as e:
                    logging.error(f"Error procesando página {pagina_actual}: {e}")
                    break

            # Cerrar el navegador
            browser.close()
            
        except Exception as e:
            logging.error(f"Error general en el scraping: {e}")
            return []

    # Guardar los eventos en un archivo JSON
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f'eventos_cdmx_{timestamp}.json'
    
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(eventos_data, f, ensure_ascii=False, indent=4)
        
        logging.info(f"Se han guardado {len(eventos_data)} eventos en el archivo '{filename}'")
        
    except Exception as e:
        logging.error(f"Error guardando archivo JSON: {e}")
    
    return eventos_data


def main():
    """
    Función principal para ejecutar el scraping.
    """
    try:
        eventos = scrape_eventos()
        
        # Mostrar resumen final
        print(f"\n📋 Resumen del scraping:")
        print(f"   • Total de eventos: {len(eventos)}")
        print(f"   • Archivo generado: eventos_cdmx_completos.json")
        
        return eventos
        
    except Exception as e:
        print(f"❌ Error durante el scraping: {e}")
        return []


if __name__ == "__main__":
    logging.info("Iniciando scraping de eventos CDMX...")
    start_time = datetime.now()
    
    eventos = scrape_eventos()
    
    end_time = datetime.now()
    duration = end_time - start_time
    
    logging.info(f"Scraping completado en {duration}")
    logging.info(f"Total de eventos obtenidos: {len(eventos)}")
    
    # Mostrar estadísticas básicas
    if eventos:
        print(f"\n=== RESUMEN DEL SCRAPING ===")
        print(f"Total de eventos: {len(eventos)}")
        print(f"Tiempo total: {duration}")
        print(f"Promedio por evento: {duration.total_seconds() / len(eventos):.2f} segundos")
        
        # Contar eventos por categoría
        categorias = {}
        for evento in eventos:
            categoria = evento.get('classification', 'No Definido').split(',')[0].strip()
            categorias[categoria] = categorias.get(categoria, 0) + 1
        
        print(f"\nEventos por categoría:")
        for categoria, count in sorted(categorias.items()):
            print(f"  {categoria}: {count}")
