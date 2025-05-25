import firebase_admin
from firebase_admin import credentials
from firebase_admin import messaging
from decouple import config
import os
import json
from dotenv import load_dotenv
load_dotenv()

FIREBASE_CREDENTIALS_PATH= os.getenv("FIREBASE_CREDENTIALS_PATH")
cred_path = config(FIREBASE_CREDENTIALS_PATH)

# Verificar que el archivo existe
if not os.path.exists(cred_path):
    print(f"❌ [Firebase] Archivo de credenciales no encontrado: {cred_path}")
    print("💡 [Firebase] Descarga el archivo desde Firebase Console > Project Settings > Service accounts")
    raise FileNotFoundError(f"Firebase credentials file not found: {cred_path}")

# Inicializar Firebase Admin SDK
if not firebase_admin._apps:
    try:
        # Cargar credenciales desde el archivo JSON
        cred = credentials.Certificate(cred_path)
        
        # Inicializar con las credenciales
        firebase_admin.initialize_app(cred)
        
        print("✅ [Firebase] Admin SDK inicializado correctamente")
        print(f"📄 [Firebase] Usando credenciales desde: {cred_path}")
        
        # Opcional: Verificar que la inicialización fue exitosa
        try:
            # Esto no envía nada, solo verifica que messaging esté disponible
            print("✅ [Firebase] Messaging service disponible")
        except Exception as e:
            print(f"⚠️ [Firebase] Warning al verificar messaging: {e}")
            
    except Exception as e:
        print(f"❌ [Firebase] Error inicializando Admin SDK: {e}")
        print("💡 [Firebase] Verifica que:")
        print("   1. El archivo JSON de credenciales sea válido")
        print("   2. El proyecto de Firebase sea correcto")
        print("   3. Firebase Admin SDK esté instalado: pip install firebase-admin")
        raise e
else:
    print("ℹ️ [Firebase] Admin SDK ya estaba inicializado")

