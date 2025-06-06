import json
import numpy as np
from pprint import pprint
from sklearn.metrics.pairwise import cosine_similarity

import pdb;

from collections import OrderedDict

questions = [
    {   #1   Optional
        "question": "¿En qué momento del día sueles ser más activo?",
        "categoria_id":"6817cc11a05c79868a61b640",
        "options": [
            "En las mañanas",
            "En las tardes",
            "Por las noches",
            "Todo el día"
        ]
    },
    {   #2   Optional #Multi
        "question": "¿Qué medio de transporte sueles usar?",
        "categoria_id": "6817cc5ea05c79868a61b641",
        "options": [
            "Metro",
            "Cablebus",
            "Taxi",
            "Metrobus",
            "Camión",
            "Combi",
            "Suburbano",
            "Uber",
            "Bicicleta",
            "Motocicleta",
            "Tengo carro propio"
        ]
    },
    {   #3   Optional
        "question": "¿Qué tan activo eres en redes?",
        "categoria_id": "6817cdb3a05c79868a61b642",
        "options": [
            "Estoy al pendiente siempre",
            "Normalmente estoy activo",
            "En mis ratos libres",
            "No estoy muy al pendiente",
            "No las uso"
        ]
    },
    {   #4  Multi
        "question": "¿En qué zonas de CDMX te mueves más seguido?",
        "categoria_id": "6817cdf6a05c79868a61b643",
        "options" : ['Centro (Cuauhtémoc, Doctores, Juárez, Roma, Condesa)',
                     'Sur (Coyoacán, Tlalpan, Xochimilco)', 
                     'Poniente (Santa Fe, Álvaro Obregón, San Ángel)',
                     'Norte (GAM, Azcapotzalco, Lindavista)', 
                     'Oriente (Iztapalapa, Iztacalco, Neza)', 
                     'Me muevo por toda la ciudad', 
                     'Vivo en el Estado de México pero voy seguido a CDMX']
    },
    {   #5
        "question": "¿Qué días prefieres para asistir a eventos?",
        "categoria_id": "6817cf49a05c79868a61b644",
        "options": ['Entre semana (Lunes a Jueves)', 
                    'Fines de semana (Viernes a Domingo)', 
                    'Cualquier día', 
                    'Depende del evento']
    },
    {   #6
        "question": "¿Qué tan dispuesto estás a desplazarte para un evento?",
        "categoria_id": "6817cf85a05c79868a61b645",
        "options": ['Estoy dispuesto a ir a cualquier parte de la ciudad', 
                    'Prefiero eventos cerca de mi zona', 
                    'Depende de la hora y tipo de evento', 
                    'Solo si voy acompañado'],

    },
    {   #7  Optional
        "question": "¿Fumas con frecuencia?",
        "categoria_id": "6817cfb1a05c79868a61b646",
        "options": [
            "Sí, fumo con frecuencia",
            "No me gusta fumar",
            "Solamente en reuniones",
            "Trato de dejarlo",
            "Lo hago para socializar"
        ]
    },
    {   #8  Optional
        "question": "¿Bebes alcohol con frecuencia?",
        "categoria_id": "6817d024a05c79868a61b647",
        "options": [
            "Sí, bebo con frecuencia",
            "Lo hago para socializar o en reuniones",
            "Rara vez bebo alcohol",
            "No me gusta beber",
        ]
    },
    {   #9
        "question": "¿Cómo te sientes respecto a planes espontáneos?",
        "categoria_id": "6817d046a05c79868a61b648",
        "options": [
            "Me encantan, siempre estoy listo/a",
            "Los disfruto si son interesantes",
            "Prefiero tener algo de tiempo para organizarme",
            "No son lo mío",
        ]
    },
    {   #10
        "question": "¿Qué tipo de interacción esperas durante un evento?",
        "categoria_id": "6817d061a05c79868a61b649",
        "options": [
            "Muchas risas y diversión",
            "Compartir intereses mutuos",
            "Solo estar presente y disfrutar el momento",
            "Conversaciones profundas y significativas"
        ]
    },
    {   #11  Optional   #Multi
        "question": "¿Tienes mascotas?",
        "categoria_id": "6817d128a05c79868a61b64a",
        "options": [
            "Perro(s)",
            "Gato(s)",
            "Aves",
            "Peces",
            "Hamster",
            "Conejo",
            "Otras",
            "No me gustan",
            "No tengo mascotas pero quisiera una",
            "Soy alérgico",
            "Me gustan pero no tengo"
        ]
    },
    {   #12 Multi
        "question": "¿Cuáles son tus intereses?",
        "categoria_id": "6817d1cfa05c79868a61b64b",
        "options": [
            "Naturaleza",
            "Tours a pie",
            "Viajar",
            "Senderismo",
            "Aire libre",
            "Acampar",
            "Tarot",
            "Probar cosas nuevas",
            "Meditación",
            "Astrología",
            "Estilo de vida activo",
            "Gastronomía",
            "Cócteles sin alcohol",
            "Dulces",
            "Comida callejera",
            "Bubble Tea",
            "Asado de cerdo",
            "Café",
            "Sushi",
            "Winnie Poo",
            "Ramen",
            "Comida coreana",
            "Cerveza artesanal",
            "Té",
            "NBA",
            "Marvel",
            "MLB",
            "Disney",
            "Manga",
            "Dungeons & Dragons",
            "Fotografía",
            "Cosplay",
            "Moda vintage",
            "Influencer",
            "Exposiciones",
            "Canto",
            "Poesía",
            "Intercambio de idiomas",
            "Literatura",
            "Tatuajes",
            "Pintar",
            "Bailar",
            "Instrumento musical",
            "Arte",
            "Dibujo",
            "Deportes",
            "Futbol",
            "Automovilismo",
            "F1",
            "Deportes de motor",
            "Artes marciales",
            "K-Pop",
            "Pop",
            "Rock-Pop",
            "Techno",
            "Reguetón",
            "BTS",
            "BTR",
            "Maratonear series",
            "Morat",
            "Cocinar",
            "Leer",
            "Videojuegos",
            "Compras en línea",
            "Juegos de mesa",
            "Repostaría",
            "TikTok",
            "Netflix",
            "YouTube",
            "Karaoke",
            "Coches",
            "Hotwheels",
            "Pokemon",
            "Fiestas",
            "Vida nocturna",
            "Galerías de arte",
            "Festival de cine",
            "Conciertos",
            "Fiestas de pueblos",
            "Películas animadas",
            "Pelicuas de acción",
            "Peliculas",
            "K-drames",
            "Anime",
            "Documentales",
            "Comedias",
            "E-Sports",
            "League of Legends",
            "Among Us",
            "Roblox",
        ]
    },
    {   #13 Multi
        "question": "¿Qué tipo de eventos te interesan más en CDMX?",
        "categoria_id": "6817d200a05c79868a61b64c",
        "options": ['Conciertos y festivales',
                    'Cultura y exposiciones', 
                    'Ferias y bazares', 
                    'Eventos gastronómicos', 
                    'Eventos alternativos o underground', 
                    'Eventos de anime, cómics o gaming', 
                    'Eventos deportivos', 
                    'Meetups tranquilos (café, parque, museo)']
    },
    {   #14
        "question": "¿Qué valoras más en una compañía?",
        "categoria_id": "6817d224a05c79868a61b64d",
        "options": [
            "Buen sentido del humor",
            "Amabilidad y cortesía",
            "Confianza y apoyo",
            "Capacidad para adaptarse",
            "Gusto por las mismas actividades"
        ]
    },
    {   #15
        "question": "¿Qué tipo de acompañante te gustaría para un evento?",
        "categoria_id": "6817d473a05c79868a61b64e",
        "options": ['Alguien divertido para pasarla bien', 
                    'Alguien con intereses similares', 
                    'Alguien para conocer mejor con el tiempo', 
                    'Alguien que ya conozca el tipo de evento', 
                    'Estoy abierto a conocer cualquier tipo de persona']
    },
    {   #16 Optional
        "question": "¿Cuál es tu personalidad?",
        "categoria_id": "6817d5fea05c79868a61b650",
        "options": [
            "INTJ", "INTP", "ENTJ", "ENTP",
            "INFJ", "INFP", "ENFJ", "ENFP",
            "ISTJ", "ISFJ", "ESTJ", "ESFJ",
            "ISTP", "ISFP", "ESTP", "ESFP",
        ]
    }
]

compatibilidad = {
    "¿Fumas con frecuencia?": {
        ("Sí, fumo con frecuencia", "Sí, fumo con frecuencia"): 1.0,
        ("Sí, fumo con frecuencia", "Lo hago para socializar") : 0.7,
        ("Sí, fumo con frecuencia", "Solamente en reuniones"): 0.5,
        ("Sí, fumo con frecuencia", "Trato de dejarlo"): -0.2,
        ("Sí, fumo con frecuencia", "No me gusta fumar"): -0.5,
        

        ("Solamente en reuniones", "Solamente en reuniones"): 1.0,
        ("Solamente en reuniones", "Lo hago para socializar"): 0.8,
        ("Solamente en reuniones", "Trato de dejarlo"): 0.2,
        ("Solamente en reuniones", "No me gusta fumar"): -0.1,
        
        

        ("No me gusta fumar", "No me gusta fumar"): 1.0,
        ("No me gusta fumar", "Lo hago para socializar"): 0.1,
        ("No me gusta fumar", "Trato de dejarlo"): 0.5,
        

        ("Trato de dejarlo", "Trato de dejarlo"): 1.0,
        ("Trato de dejarlo", "Lo hago para socializar"): 0.2,

        ("Lo hago para socializar", "Lo hago para socializar"): 1.0,
    },

    questions[1]["question"]: 
    {

        (questions[1]["options"][0], questions[1]["options"][0]): 1.0,
        (questions[1]["options"][0], questions[1]["options"][1]): 0.7,
        (questions[1]["options"][0], questions[1]["options"][2]): 0.4,
        (questions[1]["options"][0], questions[1]["options"][3]): -0.5,

        (questions[1]["options"][1], questions[1]["options"][1]): 1.0,
        (questions[1]["options"][1], questions[1]["options"][2]): 0.5,
        (questions[1]["options"][1], questions[1]["options"][3]): -0.2,

        (questions[1]["options"][2], questions[1]["options"][2]): 1.0,
        (questions[1]["options"][2], questions[1]["options"][3]): 0.3,

        (questions[1]["options"][3], questions[1]["options"][3]): 1.0,
        
        
    }
}

compatibility_matrix_personality = {
    "ENFJ": [0.86, 0.91, 0.42, 0.73, 0.64, 0.80, 0.22, 0.41, 0.74, 0.73, 0.16, 0.35, 0.30, 0.40, 0.18, 0.09],
    "ENFP": [0.91, 0.97, 0.37, 0.85, 0.42, 0.93, 0.27, 0.76, 0.51, 0.73, 0.13, 0.36, 0.11, 0.49, 0.04, 0.14],
    "ENTJ": [0.42, 0.37, 0.91, 0.81, 0.53, 0.51, 0.87, 0.74, 0.25, 0.13, 0.46, 0.47, 0.29, 0.06, 0.66, 0.41],
    "ENTP": [0.73, 0.85, 0.81, 0.94, 0.32, 0.87, 0.70, 0.92, 0.11, 0.35, 0.22, 0.51, 0.05, 0.14, 0.11, 0.35],
    "ESFJ": [0.64, 0.42, 0.53, 0.32, 0.94, 0.40, 0.77, 0.37, 0.74, 0.17, 0.32, 0.05, 0.79, 0.57, 0.71, 0.19],
    "ESFP": [0.80, 0.93, 0.51, 0.87, 0.40, 0.70, 0.39, 0.75, 0.43, 0.58, 0.22, 0.39, 0.12, 0.58, 0.08, 0.26],
    "ESTJ": [0.22, 0.27, 0.87, 0.70, 0.77, 0.39, 0.96, 0.78, 0.14, 0.03, 0.33, 0.22, 0.48, 0.22, 0.79, 0.55],
    "ESTP": [0.41, 0.76, 0.74, 0.92, 0.37, 0.75, 0.78, 0.95, 0.05, 0.24, 0.17, 0.39, 0.12, 0.43, 0.20, 0.62],
    "INFJ": [0.74, 0.51, 0.25, 0.11, 0.74, 0.43, 0.14, 0.05, 0.95, 0.85, 0.65, 0.50, 0.85, 0.58, 0.53, 0.23],
    "INFP": [0.73, 0.73, 0.13, 0.35, 0.17, 0.58, 0.03, 0.24, 0.85, 0.97, 0.70, 0.84, 0.46, 0.78, 0.21, 0.49],
    "INTJ": [0.16, 0.13, 0.46, 0.22, 0.32, 0.22, 0.33, 0.17, 0.65, 0.70, 0.86, 0.89, 0.79, 0.45, 0.85, 0.78],
    "INTP": [0.35, 0.36, 0.47, 0.51, 0.05, 0.39, 0.22, 0.39, 0.50, 0.84, 0.89, 0.96, 0.38, 0.43, 0.51, 0.81],
    "ISFJ": [0.30, 0.11, 0.29, 0.05, 0.79, 0.12, 0.48, 0.12, 0.85, 0.46, 0.79, 0.38, 0.95, 0.76, 0.93, 0.62],
    "ISFP": [0.40, 0.49, 0.06, 0.14, 0.57, 0.58, 0.22, 0.43, 0.58, 0.78, 0.45, 0.43, 0.76, 0.97, 0.47, 0.76],
    "ISTJ": [0.18, 0.04, 0.66, 0.11, 0.71, 0.08, 0.79, 0.20, 0.53, 0.21, 0.91, 0.93, 0.96, 0.47, 0.96, 0.78],
    "ISTP": [0.09, 0.14, 0.41, 0.35, 0.19, 0.26, 0.55, 0.62, 0.23, 0.49, 0.78, 0.81, 0.62, 0.76, 0.78, 0.96],
}

types = list(compatibility_matrix_personality.keys())

# Función para convertir etiquetas a un vector binario
def tags_a_vector(tags, lista_tags):
    return np.array([1 if tag in tags else 0 for tag in lista_tags])

#1 Optional
def compatibilidad_actividad(respuesta_a, respuesta_b):
    
    coincidencias = set(respuesta_a) & set(respuesta_b)

    if respuesta_a == respuesta_b:
        return 1.0
    elif (respuesta_a or respuesta_b) == "Todo el día":
        return 0.8
    elif not coincidencias:
        return -0.2
    else:
        return 0.5

#2 Optional     Multi
def compatibilidad_transporte(respuesta_a, respuesta_b):

    if not isinstance(respuesta_a, list):
        respuesta_a = [respuesta_a]

    if not isinstance(respuesta_b, list):
        respuesta_b = [respuesta_b]

    # Definir la lógica de compatibilidad para transporte
    if respuesta_a == respuesta_b:
        return 1.0
    
    if "Tengo carro propio" in (respuesta_a or respuesta_b):
        return 0.8

    return 0.4

#3  Optional
def compatibilidad_redes(respuesta_a, respuesta_b):

    # Definir la lógica de compatibilidad para redes sociales
    
    if respuesta_a == respuesta_b:
        return 1.0
    
    if (respuesta_a or respuesta_b) == "Estoy al pendiente siempre":
        if (respuesta_a or respuesta_b) == "Normalmente estoy activo":
            return 0.7
        if (respuesta_a or respuesta_b) == "En mis ratos libres":
            return 0.5
        if (respuesta_a or respuesta_b) == "No estoy muy al pendiente":
            return 0.2
        if (respuesta_a or respuesta_b) == "No las uso":
            return -0.2
        return 0.5
    
    if (respuesta_a or respuesta_b) == "Normalmente estoy activo":
        if (respuesta_a or respuesta_b) == "En mis ratos libres":
            return 0.7
        if (respuesta_a or respuesta_b) == "No estoy muy al pendiente":
            return 0.2
        if (respuesta_a or respuesta_b) == "No las uso":
            return -0.2

    if (respuesta_a or respuesta_b) == "En mis ratos libres":
        if (respuesta_a or respuesta_b) == "No estoy muy al pendiente":
            return 0.5
        if (respuesta_a or respuesta_b) == "No las uso":
            return 0.2
        
    if (respuesta_a or respuesta_b) == "No estoy muy al pendiente":
            return 0.5
    
    return 0.2

#4 Multi
def compatibilidad_zonas(respuesta_a, respuesta_b):
    
    if not isinstance(respuesta_a, list):
        respuesta_a = [respuesta_a]

    if not isinstance(respuesta_b, list):
        respuesta_b = [respuesta_b]

    resp = "Me muevo por toda la ciudad"
    resp2 = "Vivo en el Estado de México pero voy seguido a CDMX"

    if respuesta_a == respuesta_b:
        return 1.0

    if resp in (respuesta_a or respuesta_b):
        return 0.7
    
    if resp2 in (respuesta_a or respuesta_b):
        return 0.5
    
    elementos_comunes = set(respuesta_a) & set(respuesta_b)

    total_elementos = len(respuesta_a) + len(respuesta_b)

    proporcion = len(elementos_comunes)*2/total_elementos

    return proporcion

#5
def compatibilidad_dias(respuesta_a, respuesta_b):
    
    if respuesta_a == respuesta_b:
        return 1.0
    
    if (respuesta_a or respuesta_b) == "Cualquier día":
        return 0.8
    
    if (respuesta_a or respuesta_b) == "Depende del evento":
        return 0.4
    
    return 0.2

#6
def compatibilidad_desplazarte(respuesta_a, respuesta_b):
    
    if respuesta_a == respuesta_b:
        return 1.0
    
    if (respuesta_a or respuesta_b) == "Estoy dispuesto a ir a cualquier parte de la ciudad":
        return 0.8

    return 0.4

#7  Optional
def compatibilidad_fumar(respuesta1, respuesta2):
    compatibilidad = {
        ("Sí, fumo con frecuencia", "Sí, fumo con frecuencia"): 1.0,
        ("Sí, fumo con frecuencia", "Lo hago para socializar"): 0.7,
        ("Sí, fumo con frecuencia", "Solamente en reuniones"): 0.5,
        ("Sí, fumo con frecuencia", "Trato de dejarlo"): -0.2,
        ("Sí, fumo con frecuencia", "No me gusta fumar"): -0.5,
        
        ("Solamente en reuniones", "Solamente en reuniones"): 1.0,
        ("Solamente en reuniones", "Lo hago para socializar"): 0.8,
        ("Solamente en reuniones", "Trato de dejarlo"): 0.2,
        ("Solamente en reuniones", "No me gusta fumar"): -0.1,
        
        ("No me gusta fumar", "No me gusta fumar"): 1.0,
        ("No me gusta fumar", "Lo hago para socializar"): 0.1,
        ("No me gusta fumar", "Trato de dejarlo"): 0.5,
        
        ("Trato de dejarlo", "Trato de dejarlo"): 1.0,
        ("Trato de dejarlo", "Lo hago para socializar"): 0.2,
        
        ("Lo hago para socializar", "Lo hago para socializar"): 1.0
    }
    
    # Verificar ambas combinaciones posibles (orden no importa)
    if (respuesta1, respuesta2) in compatibilidad:
        return compatibilidad[(respuesta1, respuesta2)]
    elif (respuesta2, respuesta1) in compatibilidad:
        return compatibilidad[(respuesta2, respuesta1)]
    else:
        return 0.0  # Valor por defecto si no hay coincidencia

#8  Optional
def compatibilidad_alcohol(respuesta1, respuesta2):
    opciones_alcohol = [
        "Sí, bebo con frecuencia",
        "Lo hago para socializar o en reuniones",
        "Rara vez bebo alcohol",
        "No me gusta beber"
    ]
    
    compatibilidad = {
        (opciones_alcohol[0], opciones_alcohol[0]): 1.0,
        (opciones_alcohol[0], opciones_alcohol[1]): 0.7,
        (opciones_alcohol[0], opciones_alcohol[2]): 0.4,
        (opciones_alcohol[0], opciones_alcohol[3]): -0.5,

        (opciones_alcohol[1], opciones_alcohol[1]): 1.0,
        (opciones_alcohol[1], opciones_alcohol[2]): 0.5,
        (opciones_alcohol[1], opciones_alcohol[3]): -0.2,

        (opciones_alcohol[2], opciones_alcohol[2]): 1.0,
        (opciones_alcohol[2], opciones_alcohol[3]): 0.3,

        (opciones_alcohol[3], opciones_alcohol[3]): 1.0
    }
    
    # Verificar ambas combinaciones posibles
    if (respuesta1, respuesta2) in compatibilidad:
        return compatibilidad[(respuesta1, respuesta2)]
    elif (respuesta2, respuesta1) in compatibilidad:
        return compatibilidad[(respuesta2, respuesta1)]
    else:
        return 0.0  # Valor por defecto si no hay coincidencia

#9
def compatibilidad_planes(respuesta_a, respuesta_b):
    if respuesta_a == respuesta_b:
        return 1.0
    
    if (respuesta_a or respuesta_b) == "Me encantan, siempre estoy listo/a":
        if (respuesta_a or respuesta_b) == "Los disfruto si son interesantes":
            return 0.8
        if (respuesta_a or respuesta_b) == "Prefiero tener algo de tiempo para organizarme":
            return 0.5
        if (respuesta_a or respuesta_b) == "No son lo mío":
            return 0.2
    
    if (respuesta_a or respuesta_b) == "Los disfruto si son interesantes":
        if (respuesta_a or respuesta_b) == "Prefiero tener algo de tiempo para organizarme":
            return 0.7
        if (respuesta_a or respuesta_b) == "No son lo mío":
            return 0.5

    if (respuesta_a or respuesta_b) == "Prefiero tener algo de tiempo para organizarme": 
        if (respuesta_a or respuesta_b) == "No son lo mío":
            return 0.5

    return 0.2     

#10
def compatibilidad_interaccion(respuesta_a, respuesta_b):
    
    if respuesta_a == respuesta_b:
        return 1.0
    return 0.5

#11 Optional    Multi
def compatibilidad_mascotas(respuesta_a, respuesta_b):

    if not isinstance(respuesta_a, list):
        respuesta_a = set(respuesta_a)

    if not isinstance(respuesta_b, list):
        respuesta_b = set(respuesta_b)

    respuesta_a = set(respuesta_a)
    respuesta_b = set(respuesta_b)

    # Definir la lógica de compatibilidad para mascotas
    if respuesta_a == respuesta_b:
        return 1.0
    
    if len(respuesta_a & respuesta_b & set(["No tengo mascotas pero quisiera una", "Me gustan pero no tengo"])) > 0:
        if len(respuesta_a & respuesta_b & set(["Soy alérgico", "No me gustan"])) == 0:
            return 0.8
        else:
            return -0.2

    if "Soy alérgico" in (respuesta_a or respuesta_b):
        if len(respuesta_a & respuesta_b & ["No me gustan", "Me gustan pero no tengo"]) > 0:
            return 0.5
        if "No tengo mascotas pero quisiera una" in (respuesta_a or respuesta_b):
            return -0.3
        return -0.5

    return 0.5

#12 Multi
def compatibilidad_intereses(respuesta_a, respuesta_b):

    if not isinstance(respuesta_a, list):
        respuesta_a = [respuesta_a]

    if not isinstance(respuesta_b, list):
        respuesta_b = [respuesta_b]

    intereses = questions[11]["options"]

    vector_usuario1 = tags_a_vector(respuesta_a, intereses)
    vector_usuario2 = tags_a_vector(respuesta_b, intereses)

    # Calcular la similitud coseno entre los dos usuarios
    similitud = cosine_similarity([vector_usuario1], [vector_usuario2])[0][0]
    return similitud

#13 Multi
def compatibilidad_tipoEventos(respuesta_a, respuesta_b):
    
    if not isinstance(respuesta_a, list):
        respuesta_a = [respuesta_a]

    if not isinstance(respuesta_b, list):
        respuesta_b = [respuesta_b]
    
    tipoEventos = questions[12]["options"]

    vector_usuario1 = tags_a_vector(respuesta_a, tipoEventos)
    vector_usuario2 = tags_a_vector(respuesta_b, tipoEventos)

    # Calcular la similitud coseno entre los dos usuarios
    similitud = cosine_similarity([vector_usuario1], [vector_usuario2])[0][0]
    return similitud

#14
def compatibilidad_valores(respuesta_a, respuesta_b):
    
    if respuesta_a == respuesta_b:
        return 1.0
    return 0.5

#15
def compatibilidad_tipoAcompañante(respuesta_a, respuesta_b):
    if respuesta_a == respuesta_b:
        return 1.0
    return 0.6

#16 Optional
def compatibilidad_personalidad(respuesta_a, respuesta_b):
    type1, type2 = respuesta_a.upper(), respuesta_b.upper()
    if type1 not in compatibility_matrix_personality or type2 not in compatibility_matrix_personality:
        return 0.0
    index = types.index(type2)
    return compatibility_matrix_personality[type1][index]


def compatibilidad_total(lista_preguntas ,respuestas_usuario1, respuestas_usuario2):
    total_compatibilidad = 0.0
    preguntas_consideradas = 0

    if questions[0]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[0]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[0]["categoria_id"]]

        total_compatibilidad += compatibilidad_actividad(respuesta_A, respuesta_B)
        preguntas_consideradas += 1

    if questions[1]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[1]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[1]["categoria_id"]]

        total_compatibilidad += compatibilidad_transporte(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[2]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[2]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[2]["categoria_id"]]

        total_compatibilidad += compatibilidad_redes(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[3]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[3]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[3]["categoria_id"]]

        total_compatibilidad += compatibilidad_zonas(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[4]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[4]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[4]["categoria_id"]]

        total_compatibilidad += compatibilidad_dias(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[5]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[5]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[5]["categoria_id"]]

        total_compatibilidad += compatibilidad_desplazarte(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[6]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[6]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[6]["categoria_id"]]

        total_compatibilidad += compatibilidad_fumar(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[7]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[7]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[7]["categoria_id"]]

        total_compatibilidad += compatibilidad_alcohol(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[8]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[8]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[8]["categoria_id"]]

        total_compatibilidad += compatibilidad_planes(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[9]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[9]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[9]["categoria_id"]]

        total_compatibilidad += compatibilidad_interaccion(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[10]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[10]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[10]["categoria_id"]]

        total_compatibilidad += compatibilidad_mascotas(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[11]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[11]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[11]["categoria_id"]]

        total_compatibilidad += compatibilidad_intereses(respuesta_A, respuesta_B)*2.0
        preguntas_consideradas += 1
    
    if questions[12]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[12]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[12]["categoria_id"]]

        total_compatibilidad += compatibilidad_tipoEventos(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[13]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[13]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[13]["categoria_id"]]

        total_compatibilidad += compatibilidad_valores(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[14]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[14]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[14]["categoria_id"]]

        total_compatibilidad += compatibilidad_tipoAcompañante(respuesta_A, respuesta_B)
        preguntas_consideradas += 1
    
    if questions[15]["categoria_id"] in lista_preguntas:
        respuesta_A = respuestas_usuario1[questions[15]["categoria_id"]]
        respuesta_B = respuestas_usuario2[questions[15]["categoria_id"]]

        total_compatibilidad += compatibilidad_personalidad(respuesta_A, respuesta_B)
        preguntas_consideradas += 1

    if preguntas_consideradas == 0:
        return 0.0
    
    return total_compatibilidad/preguntas_consideradas

def recomendacion_de_usuarios(preferencias_usuario, preferencias_candidato):

    usuario1 = {}
    usuario2 = {}

    lista_preguntas = []

    for respuesta_usuario in preferencias_usuario:
        for respuesta_candidato in preferencias_candidato:

            if respuesta_usuario['categoria_id'] == respuesta_candidato['categoria_id']:
                usuario1[respuesta_usuario['categoria_id']] = respuesta_usuario['respuesta']
                usuario2[respuesta_candidato['categoria_id']] = respuesta_candidato['respuesta']
                lista_preguntas.append(respuesta_usuario['categoria_id'])
                break

    compatibilidad = compatibilidad_total(lista_preguntas, usuario1, usuario2)

    return compatibilidad