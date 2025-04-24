import json
import numpy as np
from pprint import pprint
from sklearn.metrics.pairwise import cosine_similarity


users = [
    ["No me gusta fumar", "Rara vez bebo alcohol", ["En las mañanas"], "No tengo mascotas pero quisiera una", 
     ["Naturaleza", "Leer", "Meditación", "Café", "Documentales"], "En mis ratos libres", ["Metro", "Bicicleta"], 
     "Prefiero tener algo de tiempo para organizarme", "Confianza y apoyo", 
     "Conversaciones profundas y significativas", "INFJ"],

    ["Sí, fumo con frecuencia", "Sí, bebo con frecuencia", ["Por las noches"], "Perro(s)", 
     ["Vida nocturna", "Fiestas", "Cócteles sin alcohol", "Comida callejera", "Reguetón", "Leer"], "Estoy al pendiente siempre", 
     ["Uber", "Tengo carro propio"], "Me encantan, siempre estoy listo/a", "Buen sentido del humor", 
     "Muchas risas y diversión", "ESFP"],

    ["Solamente en reuniones", "Lo hago para socializar o en reuniones", ["En las tardes"], "Gato(s)", 
     ["Maratonear series", "Netflix", "Comedias", "K-dramas", "Anime"], "Normalmente estoy activo", 
     ["Metro", "Metrobus"], "Los disfruto si son interesantes", "Gusto por las mismas actividades", 
     "Compartir intereses mutuos", "INFP"],

    ["Trato de dejarlo", "No me gusta beber", ["Todo el día"], "No me gustan", 
     ["Deportes", "Fútbol", "NBA", "Gastronomía", "Cocinar"], "No estoy muy al pendiente", 
     ["Bicicleta", "Motocicleta"], "No son lo mío", "Amabilidad y cortesía", 
     "Solo estar presente y disfrutar el momento", "ISTJ"],

    ["Lo hago para socializar", "Rara vez bebo alcohol", ["En las mañanas", "En las tardes"], "Gato(s)", 
     ["Arte", "Pintar", "Exposiciones", "Galerías de arte", "Fotografía"], "No las uso", 
     ["Cablebus", "Taxi"], "Prefiero tener algo de tiempo para organizarme", "Capacidad para adaptarse", 
     "Conversaciones profundas y significativas", "ENFJ"],

    ["No me gusta fumar", "No me gusta beber", ["Por las noches"], "Soy alérgico", 
     ["Videojuegos", "E-Sports", "League of Legends", "Roblox", "Juegos de mesa"], "En mis ratos libres", 
     ["Tengo carro propio"], "No son lo mío", "Gusto por las mismas actividades", 
     "Compartir intereses mutuos", "INTP"],

    ["Sí, fumo con frecuencia", "Sí, bebo con frecuencia", ["Todo el día"], "Perro(s)", 
     ["Automovilismo", "F1", "Deportes de motor", "Coches", "Hotwheels"], "Estoy al pendiente siempre", 
     ["Motocicleta", "Tengo carro propio"], "Me encantan, siempre estoy listo/a", "Buen sentido del humor", 
     "Muchas risas y diversión", "ESTP"],

    ["No me gusta fumar", "Lo hago para socializar o en reuniones", ["En las tardes"], "No tengo mascotas pero quisiera una", 
     ["K-Pop", "BTS", "Pop", "Conciertos", "Bailar"], "Normalmente estoy activo", 
     ["Metro", "Uber"], "Los disfruto si son interesantes", "Amabilidad y cortesía", 
     "Solo estar presente y disfrutar el momento", "ISFP"],

    ["Solamente en reuniones", "Rara vez bebo alcohol", ["En las mañanas"], "Aves", 
     ["Senderismo", "Acampar", "Aire libre", "Viajar", "Tours a pie"], "No estoy muy al pendiente", 
     ["Camión", "Combi"], "Prefiero tener algo de tiempo para organizarme", "Confianza y apoyo", 
     "Conversaciones profundas y significativas", "ISTP"],

    ["Trato de dejarlo", "Lo hago para socializar o en reuniones", ["Por las noches"], "Me gustan pero no tengo", 
     ["Cerveza artesanal", "Comida coreana", "Ramen", "Sushi", "Asado de cerdo"], "Normalmente estoy activo", 
     ["Suburbano", "Taxi"], "Los disfruto si son interesantes", "Capacidad para adaptarse", 
     "Compartir intereses mutuos", "ENTP"],

    ["No me gusta fumar", "No me gusta beber", ["En las mañanas"], "Hamster", 
     ["Literatura", "Poesía", "Intercambio de idiomas", "Leer", "Manga"], "No las uso", 
     ["Bicicleta"], "No son lo mío", "Amabilidad y cortesía", 
     "Solo estar presente y disfrutar el momento", "INTJ"],

    ["Lo hago para socializar", "Sí, bebo con frecuencia", ["En las tardes", "Por las noches"], "Conejo", 
     ["Moda vintage", "Cosplay", "Tatuajes", "Influencer", "TikTok", "YouTube"], "Estoy al pendiente siempre", 
     ["Uber", "Metrobus"], "Me encantan, siempre estoy listo/a", "Buen sentido del humor", 
     "Muchas risas y diversión", "ENFP"]
]


questions = [
    {
        "question": "¿Fumas con frecuencia?",
        "options": [
            "Sí, fumo con frecuencia",
            "No me gusta fumar",
            "Solamente en reuniones",
            "Trato de dejarlo",
            "Lo hago para socializar"
        ]
    },
    {
        "question": "¿Bebes alcohol con frecuencia?",
        "options": [
            "Sí, bebo con frecuencia",
            "Lo hago para socializar o en reuniones",
            "Rara vez bebo alcohol",
            "No me gusta beber",
        ]
    },
    {
        "question": "¿En qué momento del día sueles ser más activo?",
        "options": [
            "En las mañanas",
            "En las tardes",
            "Por las noches",
            "Todo el día"
        ]
    },
    {
        "question": "¿Tienes mascotas?",
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
    {
        "question": "¿Cuáles son tus intereses?",
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
    {
        "question": "¿Qué tan activo eres en redes?",
        "options": [
            "Estoy al pendiente siempre",
            "Normalmente estoy activo",
            "En mis ratos libres",
            "No estoy muy al pendiente",
            "No las uso"
        ]
    },
    {
        "question": "¿Qué medio de transporte sueles usar?",
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
    {
        "question": "¿Cómo te sientes respecto a planes espontáneos?",
        "options": [
            "Me encantan, siempre estoy listo/a",
            "Los disfruto si son interesantes",
            "Prefiero tener algo de tiempo para organizarme",
            "No son lo mío",
        ]
    },
    {
        "question": "¿Qué valoras más en una compañía?",
        "options": [
            "Buen sentido del humor",
            "Amabilidad y cortesía",
            "Confianza y apoyo",
            "Capacidad para adaptarse",
            "Gusto por las mismas actividades"
        ]
    },
    {
        "question": "¿Qué tipo de interacción esperas durante un evento?",
        "options": [
            "Muchas risas y diversión",
            "Compartir intereses mutuos",
            "Solo estar presente y disfrutar el momento",
            "Conversaciones profundas y significativas"
        ]
    },
    {
        "question": "¿Cuál es tu personalidad?",
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
            #"Sí, bebo con frecuencia",
            # "Lo hago para socializar o en reuniones",
            # "Rara vez bebo alcohol",
            # "No me gusta beber",

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

def compatibilidad_mascotas(respuesta_a, respuesta_b):
    # Definir la lógica de compatibilidad para mascotas
    if respuesta_a == respuesta_b:
        return 1.0
    if (respuesta_a or respuesta_b ) in  ["No tengo mascotas pero quisiera una", "Me gustan pero no tengo"]:
        if (respuesta_a or respuesta_b) not in ["Soy alérgico", "No me gustan"]:
            return 0.8
        else:
            return -0.2
    if (respuesta_a or respuesta_b) == "Soy alérgico":
        if (respuesta_a or respuesta_b) in ["No me gustan", "Me gustan pero no tengo"]:
            return 0.5
        if (respuesta_a or respuesta_b) == "No tengo mascotas pero quisiera una":
            return -0.3
        return -0.5
    return 0.5

def compatibilidad_intereses(respuesta_a, respuesta_b):

    intereses = questions[4]["options"]

    vector_usuario1 = tags_a_vector(respuesta_a, intereses)
    vector_usuario2 = tags_a_vector(respuesta_b, intereses)

    # Calcular la similitud coseno entre los dos usuarios
    similitud = cosine_similarity([vector_usuario1], [vector_usuario2])[0][0]
    return similitud

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
            # "Estoy al pendiente siempre",
            # "Normalmente estoy activo",
            # "En mis ratos libres",
            # "No estoy muy al pendiente",
            # "No las uso"

def compatibilidad_transporte(respuesta_a, respuesta_b):
    
    # Definir la lógica de compatibilidad para transporte
    if respuesta_a == respuesta_b:
        return 1.0
    if (respuesta_a or respuesta_b) == "Tengo carro propio":
        return 0.8
    return 0.4

            # "Metro",
            # "Cablebus",
            # "Taxi",
            # "Metrobus",
            # "Camión",
            # "Combi",
            # "Suburbano",
            # "Uber",
            # "Bicicleta",
            # "Motocicleta",
            # "Tengo carro propio"

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

            # "Me encantan, siempre estoy listo/a",
            # "Los disfruto si son interesantes",
            # "Prefiero tener algo de tiempo para organizarme",
            # "No son lo mío",


        
    pass
            # "Buen sentido del humor",
            # "Amabilidad y cortesía",
            # "Confianza y apoyo",
            # "Capacidad para adaptarse",
            # "Gusto por las mismas actividades"

def compatibilidad_interaccion(respuesta_a, respuesta_b):
    
    # Definir la lógica de compatibilidad para interacción
    if respuesta_a == respuesta_b:
        return 1.0
    return 0.5

            # "Muchas risas y diversión",
            # "Compartir intereses mutuos",
            # "Solo estar presente y disfrutar el momento",
            # "Conversaciones profundas y significativas"

def compatibilidad_personalidad(respuesta_a, respuesta_b):
    type1, type2 = respuesta_a.upper(), respuesta_b.upper()
    if type1 not in compatibility_matrix_personality or type2 not in compatibility_matrix_personality:
        return "Tipo de personalidad no válido. Usa uno de estos: " + ", ".join(types)
    index = types.index(type2)
    print(f"La compatibilidad entre {type1} y {type2} es del {compatibility_matrix_personality[type1][index]}.")
    return compatibility_matrix_personality[type1][index]

def compatibilidad_total(respuestas_usuario1, respuestas_usuario2):
    total_compatibilidad = 0.0
    total_compatibilidad += compatibilidad_fumar(respuestas_usuario1[0], respuestas_usuario2[0])
    total_compatibilidad += compatibilidad_alcohol(respuestas_usuario1[1], respuestas_usuario2[1])
    total_compatibilidad += compatibilidad_actividad(respuestas_usuario1[2], respuestas_usuario2[2])
    total_compatibilidad += compatibilidad_mascotas(respuestas_usuario1[3], respuestas_usuario2[3])
    total_compatibilidad += compatibilidad_intereses(respuestas_usuario1[4], respuestas_usuario2[4])*1.8
    total_compatibilidad += compatibilidad_redes(respuestas_usuario1[5], respuestas_usuario2[5])
    total_compatibilidad += compatibilidad_transporte(respuestas_usuario1[6], respuestas_usuario2[6])
    total_compatibilidad += compatibilidad_planes(respuestas_usuario1[7], respuestas_usuario2[7])
    total_compatibilidad += compatibilidad_interaccion(respuestas_usuario1[8], respuestas_usuario2[8])
    total_compatibilidad += compatibilidad_personalidad(respuestas_usuario1[10], respuestas_usuario2[10])

    return total_compatibilidad/10.0 

#Asignar valores a cada pregunta
#Actualizar los valores de intereses
#Filtrar busqueda por usuario
#Generar usuarios de prueba
#Obtener el vector de cada usuario
#Obtener similitudes

def main():

    #Ejemplo
    usuario1 = users[0]

    x = 1
    for usuario in users:
        compatibilidad = compatibilidad_total(usuario1, usuario)
        print(f"La compatibilidad entre el usuario 1 y el usuario {x} es: {compatibilidad}")
        x += 1
    

    pass

if __name__ == "__main__":
    main()
    
    
