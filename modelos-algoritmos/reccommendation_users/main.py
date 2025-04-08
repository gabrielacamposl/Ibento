import json
import numpy as np
from pprint import pprint
from sklearn.metrics.pairwise import cosine_similarity


usuarios = []


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
            "Cospllay",
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
            "No estoy muy al pendiente",
            "En mis ratos libres",
            "Muy poco"
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

def compatibilidad_actividad():

    pass


#Asignar valores a cada pregunta
#Actualizar los valores de intereses
#Filtrar busqueda por usuario
#Generar usuarios de prueba
#Obtener el vector de cada usuario
#Obtener similitudes






def main():


    pass

if __name__ == "__main__":
    main()
    
