from playwright.sync_api import sync_playwright
import time
import re
import json
import requests

api_key = ""

def obtener_coordenadas(direccion, api_key):
    """
    Obtiene las coordenadas geográficas (latitud y longitud) de una dirección
    utilizando la API de Geocoding de Google Maps.
    
    Args:
        direccion (str): La dirección o nombre del lugar a buscar
        api_key (str): Tu clave de API de Google Maps
        
    Returns:
        dict: Un diccionario con las coordenadas {'lat': latitud, 'lng': longitud}
             o None si no se encontraron resultados
    """
    # Preparar la URL para la solicitud a la API
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": direccion,
        "key": api_key
    }
    
    time.sleep(0.5)

    # Realizar la solicitud a la API
    response = requests.get(base_url, params=params)
    data = response.json()
    
    
    # Verificar si la solicitud fue exitosa
    if data["status"] == "OK" and len(data["results"]) > 0:
        # Extraer las coordenadas del primer resultado
        location = data["results"][0]["geometry"]["location"]
        return {
            "lat": location["lat"],
            "lng": location["lng"],
            "formatted_address": data["results"][0]["formatted_address"]
        }
    else:
        print(f"Error o no se encontraron resultados: {data['status']}")
        print(data)
        return None


def existe_blockquote(page, selector):
    try:
        return page.locator(selector).count() > 0
    except:
        return False

def obtener_detalles_evento_con_blockquote(page):

    #Ciertas paginas tienen solo un blockquoute y luego una etiqueta p, checar
    nombre = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image h1').inner_text()
    lugar = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image h2').inner_text()
    descripcion = page.locator('.container.px-2 blockquote').all_inner_texts()
    costo = page.locator('.row.w-100 div ul li ul li').all_inner_texts()
    ubicacion = page.locator('.col-md-9.px-md-5.d-flex.align-items-center.flex-row div span').inner_text()

    style_img = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image').get_attribute('style')

    patron = r"\s*url\(['\"](.*?)['\"]\)"
    coincidencia = re.search(patron, style_img)

    img = None

    if coincidencia:
        img = coincidencia.group(0).split("'")[1]

    #url('https://cartelera.cdmx.gob.mx/wp-content/uploads/ae_usercontent/usercontent/67a24b564ee67-Museo-Nacional-de-la-Revolucion.jpg')

    #Obtener dias del evento, en cada div del dia, esta la etiqueta event para los dias que existe el evento
    #Debido a que los dias pueden estar repartidos en varios meses, es necesario recorrer por lo menos un mes mas

    fechas = []
    dias_con_eventos = page.locator('.day.event').all()
        
    # Extraer la información de los días con eventos
    for dia in dias_con_eventos:
        # Obtener las clases del día
        clases = dia.get_attribute('class')
        
        # Extraer la fecha (asumiendo que está en las clases)
        fecha = next((clase for clase in clases.split() if clase.startswith('calendar-day-')), None)
        
        if fecha:
            fechas.append(fecha.split('-')[-1]+"/"+fecha.split('-')[-2]+"/"+fecha.split('-')[-3])

    #Normalización de la descripción
    desc = ""
    for p in descripcion:
        desc = desc + p + " "

    coordenadas = None
    if ubicacion:
        coordenadas = obtener_coordenadas(ubicacion, api_key)

    return {
        "nombre": nombre,
        "lugar": lugar,
        "costo": costo,
        "ubicacion": ubicacion,
        "descripcion": desc,
        "fechas": fechas,
        "coordenadas": coordenadas,
        "img_url": img
    }

def obtener_detalles_evento_sin_blockquote(page):

    nombre = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image h1').inner_text()
    lugar = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image h2').inner_text()
    descripcion = page.locator('.container.px-2 p').all_inner_texts()
    costo = page.locator('.row.w-100 div ul li ul li').all_inner_texts()
    ubicacion = page.locator('.col-md-9.px-md-5.d-flex.align-items-center.flex-row div span').inner_text()

    style_img = page.locator('.container-fluid.cdmx-billboard-page-event-banner-image').get_attribute('style')

    patron = r"\s*url\(['\"](.*?)['\"]\)"
    coincidencia = re.search(patron, style_img)

    img = None

    if coincidencia:
        img = coincidencia.group(0).split("'")[1]

    #Obtener dias del evento, en cada div del dia, esta la etiqueta event para los dias que existe el evento
    #Debido a que los dias pueden estar repartidos en varios meses, es necesario recorrer por lo menos un mes mas

    #fechas = page.locator('.days headers day.today.event').inner_text()
    fechas = []
    dias_con_eventos = page.locator('.day.event').all()
        
    # Extraer la información de los días con eventos
    for dia in dias_con_eventos:
        # Obtener las clases del día
        clases = dia.get_attribute('class')
        
        # Extraer la fecha (asumiendo que está en las clases)
        fecha = next((clase for clase in clases.split() if clase.startswith('calendar-day-')), None)
        
        if fecha:
            fechas.append(fecha.split('-')[-1]+"/"+fecha.split('-')[-2]+"/"+fecha.split('-')[-3])

    #Normalización de la descripción
    desc = ""
    for p in descripcion:
        desc = desc + p + " "
    
    coordenadas = None
    if ubicacion:
        coordenadas = obtener_coordenadas(ubicacion, api_key)

    return {
        "nombre": nombre,
        "lugar": lugar,
        "costo": costo,
        "ubicacion": ubicacion,
        "descripcion": desc,
        "fechas": fechas,
        "coordenadas": coordenadas,
        "img_url": img
    }

def imprimir_detalles_evento(detalles, n):
    """
    Imprime los detalles del evento.
    """
    print(f"------------------------Evento {n+1}------------------------")
    print(f"Evento: {detalles['nombre']}")
    print(f"Lugar: {detalles['lugar']}")
    print(f"Costo: {detalles['costo']}")
    print(f"Ubicación: {detalles['ubicacion']}")
    print(f"Descripción: {detalles['descripcion']}")
    print(f"Fechas: {detalles['fechas']}")
    print(f"Coordenadas: {detalles['coordenadas']}")
    print(f"Imagen_URL: {detalles['img_url']}")

def scrape_eventos():

    eventos_data = []
    
    with sync_playwright() as p:
        # Iniciar el navegador
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navegar a la página
        page.goto('https://cartelera.cdmx.gob.mx/')

        p1 = 1

        while(True):

            time.sleep(1)

            try:
                if page.get_by_role("heading", name="No encontramos resultados que coincidan con tu búsqueda").is_visible() or p1 == 3:
                    break
            except:
                pass 

            p1 = p1 + 1

            # Esperar a que los eventos estén cargados
            page.wait_for_selector('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row')
        
            # Extraer los eventos
            events = page.query_selector_all('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row')

            print(f"--- Página {int(page.locator(f'[jp-role="next"].page.btn').nth(0).get_attribute("jp-data")) - 1} ---")

            # Iterar sobre los eventos
            for n in range(len(events)):
                page.wait_for_selector('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row')
                event = page.locator('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row').nth(n)
                event.click()

                # Obtener detalles del evento
                page.wait_for_load_state('networkidle')

                if existe_blockquote(page, '.container.px-2 blockquote'):
                    detalles = obtener_detalles_evento_con_blockquote(page)
                else:
                    detalles = obtener_detalles_evento_sin_blockquote(page)

                # Imprimir detalles del evento
                imprimir_detalles_evento(detalles, n)

                # Agregar el evento a la lista de eventos
                eventos_data.append(detalles)

                # Regresar a la página anterior
                salir = page.get_by_role("button", name="Regresar a búsqueda")
                salir.click()

            # Navegar a la siguiente página

            page.wait_for_selector(f'[jp-role="next"].page.btn')
            nav = page.locator(f'[jp-role="next"].page.btn').nth(0)
            nav.click()

        # Cerrar el navegador
        browser.close()

        # Convertir la lista de eventos a JSON y guardarla en un archivo
    with open('eventos_cdmx.json', 'w', encoding='utf-8') as f:
        json.dump(eventos_data, f, ensure_ascii=False, indent=4)
    
    print(f"\nSe han guardado {len(eventos_data)} eventos en el archivo 'eventos_cdmx.json'")
    
    return eventos_data

eventos = scrape_eventos()

# Mostrar el JSON resultante
print("\nJSON de eventos:")
print(json.dumps(eventos, ensure_ascii=False, indent=2))