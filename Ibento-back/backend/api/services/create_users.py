from api.models import Evento, Usuario
import uuid
import random
from datetime import datetime
from django.contrib.auth.hashers import make_password
import ast


preguntas = [
    {
        "_id": "6817cc11a05c79868a61b640",
        "question": "¿En qué momento del día sueles ser más activo?",
        "answers": "['En las mañanas', 'En las tardes', 'Por las noches', 'Todo el día']",
        "multi_option": False,
        "optional": True
    },
    {
        "_id": "6817cc5ea05c79868a61b641",
        "question": "¿Qué medio de transporte sueles usar?",
        "answers": "['Metro', 'Cablebus', 'Taxi', 'Metrobus', 'Camión', 'Combi', 'Suburbano', 'Uber', 'Bicicleta', 'Motocicleta', 'Tengo carro propio']",
        "multi_option": True,
        "optional": True
    },
    {
        "_id": "6817cdb3a05c79868a61b642",
        "question": "¿Qué tan activo eres en redes?",
        "answers": "['Estoy al pendiente siempre', 'Normalmente estoy activo', 'En mis ratos libres', 'No estoy muy al pendiente', 'No las uso']",
        "multi_option": False,
        "optional": True
    },
    {
        "_id": "6817cdf6a05c79868a61b643",
        "question": "¿En qué zonas de CDMX te mueves más seguido?",
        "answers": "['Centro (Cuauhtémoc, Doctores, Juárez, Roma, Condesa)', 'Sur (Coyoacán, Tlalpan, Xochimilco)', 'Poniente (Santa Fe, Álvaro Obregón, San Ángel)', 'Norte (GAM, Azcapotzalco, Lindavista)', 'Oriente (Iztapalapa, Iztacalco, Neza)', 'Me muevo por toda la ciudad', 'Vivo en el Estado de México pero voy seguido a CDMX']",
        "multi_option": True,
        "optional": False
    },
    {
        "_id": "6817cf49a05c79868a61b644",
        "question": "¿Qué días prefieres para asistir a eventos?",
        "answers": "['Entre semana (Lunes a Jueves)', 'Fines de semana (Viernes a Domingo)', 'Cualquier día', 'Depende del evento']",
        "multi_option": False,
        "optional": False
    },
    {
        "_id": "6817cf85a05c79868a61b645",
        "question": "¿Qué tan dispuesto estás a desplazarte para un evento?",
        "answers": "['Estoy dispuesto a ir a cualquier parte de la ciudad', 'Prefiero eventos cerca de mi zona', 'Depende de la hora y tipo de evento', 'Solo si voy acompañado']",
        "multi_option": False,
        "optional": False
    },
    {
        "_id": "6817cfb1a05c79868a61b646",
        "question": "¿Fumas con frecuencia?",
        "answers": "['Sí, fumo con frecuencia', 'No me gusta fumar', 'Solamente en reuniones', 'Trato de dejarlo', 'Lo hago para socializar']",
        "multi_option": False,
        "optional": True
    },
    {
        "_id": "6817d024a05c79868a61b647",
        "question": "¿Bebes alcohol con frecuencia?",
        "answers": "['Sí, bebo con frecuencia', 'Lo hago para socializar o en reuniones', 'Rara vez bebo alcohol', 'No me gusta beber']",
        "multi_option": False,
        "optional": True
    },
    {
        "_id": "6817d046a05c79868a61b648",
        "question": "¿Cómo te sientes respecto a planes espontáneos?",
        "answers": "['Me encantan, siempre estoy listo/a', 'Los disfruto si son interesantes', 'Prefiero tener algo de tiempo para organizarme', 'No son lo mío']",
        "multi_option": False,
        "optional": False
    },
    {
        "_id": "6817d061a05c79868a61b649",
        "question": "¿Qué tipo de interacción esperas durante un evento?",
        "answers": "['Muchas risas y diversión', 'Compartir intereses mutuos', 'Solo estar presente y disfrutar el momento', 'Conversaciones profundas y significativas']",
        "multi_option": False,
        "optional": False
    },
    {
        "_id": "6817d128a05c79868a61b64a",
        "question": "¿Tienes mascotas?",
        "answers": "['Perro(s)', 'Gato(s)', 'Aves', 'Peces', 'Hamster', 'Conejo', 'Otras', 'No me gustan', 'No tengo mascotas pero quisiera una', 'Soy alérgico', 'Me gustan pero no tengo']",
        "multi_option": True,
        "optional": True
    },
    {
        "_id": "6817d1cfa05c79868a61b64b",
        "question": "¿Cuáles son tus intereses?",
        "answers": "['Naturaleza', 'Tours a pie', 'Viajar', 'Senderismo', 'Aire libre', 'Acampar', 'Tarot', 'Probar cosas nuevas', 'Meditación', 'Astrología', 'Estilo de vida activo', 'Gastronomía', 'Cócteles sin alcohol', 'Dulces', 'Comida callejera', 'Bubble Tea', 'Asado de cerdo', 'Café', 'Sushi', 'Winnie Poo', 'Ramen', 'Comida coreana', 'Cerveza artesanal', 'Té', 'NBA', 'Marvel', 'MLB', 'Disney', 'Manga', 'Dungeons & Dragons', 'Fotografía', 'Cosplay', 'Moda vintage', 'Influencer', 'Exposiciones', 'Canto', 'Poesía', 'Intercambio de idiomas', 'Literatura', 'Tatuajes', 'Pintar', 'Bailar', 'Instrumento musical', 'Arte', 'Dibujo', 'Deportes', 'Futbol', 'Automovilismo', 'F1', 'Deportes de motor', 'Artes marciales', 'K-Pop', 'Pop', 'Rock-Pop', 'Techno', 'Reguetón', 'BTS', 'BTR', 'Maratonear series', 'Morat', 'Cocinar', 'Leer', 'Videojuegos', 'Compras en línea', 'Juegos de mesa', 'Repostaría', 'TikTok', 'Netflix', 'YouTube', 'Karaoke', 'Coches', 'Hotwheels', 'Pokemon', 'Fiestas', 'Vida nocturna', 'Galerías de arte', 'Festival de cine', 'Conciertos', 'Fiestas de pueblos', 'Películas animadas', 'Peliculas de acción', 'Peliculas', 'K-dramas', 'Anime', 'Documentales', 'Comedias', 'E-Sports', 'League of Legends', 'Among Us', 'Roblox']",
        "multi_option": True,
        "optional": False
    },
    {
        "_id": "6817d200a05c79868a61b64c",
        "question": "¿Qué tipo de eventos te interesan más en CDMX?",
        "answers": "['Conciertos y festivales', 'Cultura y exposiciones', 'Ferias y bazares', 'Eventos gastronómicos', 'Eventos alternativos o underground', 'Eventos de anime, cómics o gaming', 'Eventos deportivos', 'Meetups tranquilos (café, parque, museo)']",
        "multi_option": True,
        "optional": False
    },
    {
        "_id": "6817d224a05c79868a61b64d",
        "question": "¿Qué valoras más en una compañía?",
        "answers": "['Buen sentido del humor', 'Amabilidad y cortesía', 'Confianza y apoyo', 'Capacidad para adaptarse', 'Gusto por las mismas actividades']",
        "multi_option": False,
        "optional": False
    },
    {
        "_id": "6817d473a05c79868a61b64e",
        "question": "¿Qué tipo de acompañante te gustaría para un evento?",
        "answers": "['Alguien divertido para pasarla bien', 'Alguien con intereses similares', 'Alguien para conocer mejor con el tiempo', 'Alguien que ya conozca el tipo de evento', 'Estoy abierto a conocer cualquier tipo de persona']",
        "multi_option": False,
        "optional": False
    },
    {
        "_id": "6817d5fea05c79868a61b650",
        "question": "¿Cuál es tu personalidad?",
        "answers": "['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']",
        "multi_option": False,
        "optional": True
    }
]


events_classification = [
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
    

def crearUsuarios():

    fotos = [
        "https://res.cloudinary.com/dgvfyneo0/image/upload/v1748067936/usuarios/perfiles_genericos/n6jquovhkfdwvmpsuqxz.jpg",
        "https://res.cloudinary.com/dgvfyneo0/image/upload/v1748068087/usuarios/perfiles_genericos/oyeaasmuqni6vcw8sozj.png",
        "https://res.cloudinary.com/dgvfyneo0/image/upload/v1748067969/usuarios/perfiles_genericos/rtb6jdf8q9jb9byg8ihd.jpg" 
        ]

    gender = ["Hombre", "Mujer", "Hombre", "Mujer", "Hombre", "Mujer", "Otro"]
    
    inicio = datetime(1997, 1, 1)
    final =  datetime(2007, 12, 12)

    random_date = inicio + (final - inicio) * random.random()

    for i in range(0,99):

        eventosG = eventos_guardados()

        Usuario.objects.create(
            nombre = "Usuario " + str(i),
            apellido = "Sanchez",
            password = "Usuario123",
            is_confirmed = True,
            email = f"usuario{i}@ibento.com",
            preferencias_evento = random.choices(events_classification, k=7),
            save_events = eventosG,
            #favourite_events
            profile_pic = fotos,
            preferencias_generales = random_respuestas(preguntas),
            birthday = random_date,
            gender = random.choice(gender),
            description = "Esta es una descripción de mi perfil. Espero sea de tu agrado.",
            curp = make_password("Usuario" + str(i) + str(random_date)),
            is_ine_validated = True,
            is_validated_camera = True,
            #matches
            #futuros_matches
            #blocked
            modo_busqueda_match = "global",
            eventos_buscar_match = random.choices(eventosG, k=5)
        )

    return True

def random_respuestas(preguntas):
    respuestas = []
    for pregunta in preguntas:
        # Parsear las respuestas posibles
        try:
            opciones = ast.literal_eval(pregunta["answers"])
        except Exception:
            opciones = []

        respuesta = None

        # Si es opcional, hay 20% de probabilidad de dejar vacío
        if pregunta.get("optional", False) and random.random() < 0.2:
            respuesta = [] if pregunta.get("multi_option", False) else ""
        elif pregunta.get("multi_option", False):
            n = random.randint(1, min(len(opciones), 4)) if opciones else 0
            respuesta = random.sample(opciones, n) if n > 0 else []
        else:
            respuesta = random.choice(opciones) if opciones else ""

        respuestas.append({
            "categoria_id": pregunta["_id"],
            "respuesta": respuesta
        })

    return {"respuestas": respuestas}


def eventos_guardados():
    eventos = Evento.objects.all().values_list('_id', flat=True)

    eventos = random.choices(eventos, k=10)
    eventos.append("681d9e394f3b2936f4714483")

    return eventos
