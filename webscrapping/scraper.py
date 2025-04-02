# scraper.py
from playwright.sync_api import sync_playwright
import time
import re

def existe_blockquote(page, selector):
    try:
        return page.locator(selector).count() > 0
    except:
        return False

def obtener_detalles_evento_con_blockquote(page):
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

    fechas = []
    dias_con_eventos = page.locator('.day.event').all()
        
    for dia in dias_con_eventos:
        clases = dia.get_attribute('class')
        fecha = next((clase for clase in clases.split() if clase.startswith('calendar-day-')), None)
        
        if fecha:
            fechas.append(fecha.split('-')[-1]+"/"+fecha.split('-')[-2]+"/"+fecha.split('-')[-3])

    return {
        "nombre": nombre,
        "lugar": lugar,
        "costo": costo,
        "ubicacion": ubicacion,
        "descripcion": descripcion,
        "fechas": fechas,
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

    fechas = []
    dias_con_eventos = page.locator('.day.event').all()
        
    for dia in dias_con_eventos:
        clases = dia.get_attribute('class')
        fecha = next((clase for clase in clases.split() if clase.startswith('calendar-day-')), None)
        
        if fecha:
            fechas.append(fecha.split('-')[-1]+"/"+fecha.split('-')[-2]+"/"+fecha.split('-')[-3])

    return {
        "nombre": nombre,
        "lugar": lugar,
        "costo": costo,
        "ubicacion": ubicacion,
        "descripcion": descripcion,
        "fechas": fechas,
        "img_url": img
    }

def scrape_eventos(max_pages=3):
    """
    Realiza el scraping de eventos con un límite de páginas para evitar tiempos de espera excesivos.
    Retorna una lista de eventos.
    """
    eventos = []
    
    with sync_playwright() as p:
        # Iniciar el navegador (headless=True para producción)
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navegar a la página
        page.goto('https://cartelera.cdmx.gob.mx/')

        page_count = 0

        while page_count < max_pages:
            page_count += 1
            time.sleep(1)

            try:
                if page.get_by_role("heading", name="No encontramos resultados que coincidan con tu búsqueda").is_visible():
                    break
            except:
                pass 

            # Esperar a que los eventos estén cargados
            page.wait_for_selector('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row')
        
            # Extraer los eventos
            events = page.query_selector_all('.cdmx-billboard-event-result-list-item-container.cdmx-billboard-event-item-clickeable.row')

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

                # Añadir a la lista de eventos
                eventos.append(detalles)

                # Regresar a la página anterior
                salir = page.get_by_role("button", name="Regresar a búsqueda")
                salir.click()

            # Verificar si hay siguiente página
            try:
                page.wait_for_selector('[jp-role="next"].page.btn', timeout=5000)
                nav = page.locator('[jp-role="next"].page.btn').nth(0)
                nav.click()
            except:
                # No hay más páginas
                break

        # Cerrar el navegador
        browser.close()
    
    return eventos
