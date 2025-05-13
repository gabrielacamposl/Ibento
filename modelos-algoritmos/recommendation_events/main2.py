import json
import numpy as np
from pprint import pprint
from sklearn.metrics.pairwise import cosine_similarity

# Lista de elementos de Ticketmaster
ticketmaster_elements = [
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
    "Urbano"
]

# Función para cargar eventos desde un archivo JSON
def cargar_eventos_desde_json(ruta_archivo):
    with open(ruta_archivo, "r", encoding="utf-8") as archivo:
        return json.load(archivo)

# Función para obtener las clasificaciones de un evento
def obtener_clasificaciones(evento):
    return evento.get("clasificaciones", [])

# Función para convertir etiquetas a un vector binario
def tags_a_vector(tags, lista_tags):
    return np.array([1 if tag in tags else 0 for tag in lista_tags])

# Función para crear vectores de eventos
def crear_vectores_eventos(eventos, lista_tags):
    vectores_eventos = {}
    for evento in eventos:
        clasificaciones = obtener_clasificaciones(evento)
        vector = tags_a_vector(clasificaciones, lista_tags)
        vectores_eventos[evento["nombre"]] = vector
    return vectores_eventos

# Función principal
def main():
    # JSON o lista de Python con todos los eventos
    ruta_archivo = "ticketmaster_events.json"

    # Cargar eventos desde el archivo
    eventos = cargar_eventos_desde_json(ruta_archivo)

    # Crear vectores para los eventos
    vectores_eventos = crear_vectores_eventos(eventos, ticketmaster_elements)

    vector_usuario1 = tags_a_vector(usuarios["usuario1"], ticketmaster_elements)

    # Calcular la similitud coseno entre el usuario 1 y los eventos
    similitudes = cosine_similarity(
        [vector_usuario1], list(vectores_eventos.values())
    )[0]

    similitud_eventos = []

    # Imprimir el nombre del evento junto con su similitud con el usuario 1
    print("Similitud entre usuario 1 y eventos:")
    for evento, similitud in zip(vectores_eventos.keys(), similitudes):
        similitud_eventos.append((evento, similitud))
        print(f"Evento: {evento}, Similitud: {similitud:.2f}")

    
    # Filtrar eventos con similitud mayor a 0
    eventos_filtrados = [
        (evento, similitud)
        for evento, similitud in similitud_eventos
        if similitud > 0
    ]

    #Ordenarlos de mayor a menor similitud
    eventos_filtrados.sort(key=lambda x: x[1], reverse=True)
    
    #Imprimir los eventos filtrados
    print("\nEventos filtrados por similitud con usuario 1:")
    for evento, similitud in eventos_filtrados:
        print(f"{evento}: {similitud:.2f}")

if __name__ == "__main__":
    print(len(ticketmaster_elements))
    #main()
