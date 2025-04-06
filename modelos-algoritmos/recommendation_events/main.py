import json
import numpy as np
from pprint import pprint
from sklearn.metrics.pairwise import cosine_similarity

# Lista de elementos de Ticketmaster
ticketmaster_elements = [
    "Music",
    "Sports",
    "Arts & Theatre",
    "Family",
    "Miscellaneous",
    "Alternative",
    "Blues",
    "Classical",
    "Country",
    "Electronic",
    "Folk",
    "Hip-Hop/Rap",
    "Jazz",
    "Latin",
    "Pop",
    "R&B",
    "Rock",
    "World",
    "Adventure Sports",
    "Baseball",
    "Basketball",
    "Boxing",
    "Cricket",
    "Football",
    "American Football",
    "Golf",
    "Hockey",
    "Lacrosse",
    "Martial Arts",
    "Motor Sports",
    "Olympics",
    "Horse Racing",
    "Rodeo",
    "Tennis",
    "Volleyball",
    "Ballet",
    "Musicals",
    "Opera",
    "Performance Art",
    "Theatre",
    "Children's",
    "Disney On Ice",
    "Monster Jam",
    "Sesame Street Live",
    "Circus",
    "Comedy",
    "Fairs",
    "Festivals",
    "Movies",
    "Museums",
    "Parks",
    "Spectacular Shows",
    "Indie Rock",
    "Alternative Metal",
    "Acoustic Blues",
    "Blues Rock",
    "Chamber Music",
    "Choral",
    "Alternative Country",
    "Country Pop",
    "House",
    "Techno",
    "Alternative Folk",
    "Celtic",
    "Conscious",
    "East Coast",
    "Avant-Garde Jazz",
    "Bebop",
    "Bachata",
    "Banda",
    "Alternative Pop",
    "Dance Pop",
    "Alternative R&B",
    "Adult Contemporary",
    "Rock And Roll",
    "Alternative Rock",
    "Afro-Beat",
    "Arabic",
]

# Usuarios y sus preferencias
usuarios = {
    "usuario1": ["Music", "Folk", "Football", "Baseball", "Circus"],
    "usuario2": ["Arts & Theatre", "Comedy", "Boxing", "Jazz"],
    "usuario3": ["Music", "Rock", "Alternative Rock", "Festivals"],
    "usuario4": ["Sports", "Football", "Tennis", "Basketball"],
    "usuario5": ["Arts & Theatre", "Musicals", "Theatre", "Comedy"],
    "usuario6": ["Family", "Children's", "Disney On Ice"],
    "usuario7": ["Music", "Electronic", "House", "Pop", "Dance Pop"],
}

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
    # Ruta del archivo JSON
    ruta_archivo = "ticketmaster_events.json"

    # Cargar eventos desde el archivo
    eventos = cargar_eventos_desde_json(ruta_archivo)

    # Crear vectores para los eventos
    vectores_eventos = crear_vectores_eventos(eventos, ticketmaster_elements)

    # # Imprimir los vectores de los eventos
    # print("Vectores de eventos:")
    # pprint(vectores_eventos, width=50, indent=2, depth=3, compact=False)
    # print("\n")

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
    main()
