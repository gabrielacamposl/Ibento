import firebase_admin
from firebase_admin import credentials
from decouple import config
import os

# Ruta desde .env
cred_path = config("FIREBASE_CREDENTIALS_PATH")

# Inicializa Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

print("[Firebase] Admin SDK inicializado")
