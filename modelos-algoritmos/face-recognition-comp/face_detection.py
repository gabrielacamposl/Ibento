import dlib
import cv2
import numpy as np
from scipy.spatial import distance

# ==== DETECTOR DE ROSTROS ====
face_detector = dlib.get_frontal_face_detector()

# ==== CARGAR IMAGEN DE INE ====
image_ine = dlib.load_rgb_image('D:/Proyectos/Ibento/modelos-algoritmos/INEValidation/dataset/ine_gaby.jpeg')
faces_ine = face_detector(image_ine)

if len(faces_ine) == 0:
    print(" No se detectó rostro en la INE.")
    exit()

# Dibujar recuadro en la imagen de la INE
face_ine = faces_ine[0]
x1, y1, x2, y2 = face_ine.left(), face_ine.top(), face_ine.right(), face_ine.bottom()
image_ine_bgr = cv2.cvtColor(image_ine, cv2.COLOR_RGB2BGR)
cv2.rectangle(image_ine_bgr, (x1, y1), (x2, y2), (0, 255, 0), 2)
# REDIMENSIONAR imagen para mostrarla más pequeña
scale_percent = 50  # Reducción al 50%
width = int(image_ine_bgr.shape[1] * scale_percent / 100)
height = int(image_ine_bgr.shape[0] * scale_percent / 100)
dim = (width, height)
resized_ine = cv2.resize(image_ine_bgr, dim, interpolation=cv2.INTER_AREA)

# Mostrar
cv2.imshow("🪪 Rostro detectado en INE (Escalado)", resized_ine)

#cv2.imshow("Rostro detectado en INE", image_ine_bgr)

# ==== ABRIR STREAM DE DROIDCAM ====
print("Intentando abrir stream desde DroidCam...")
cap = cv2.VideoCapture("http://192.168.1.110:4747/video")

if not cap.isOpened():
    print("No se pudo abrir el stream de DroidCam.")
    exit()
print("Stream abierto.")

# ==== MOSTRAR STREAM ====
frame = None
while True:
    ret, img = cap.read()
    if not ret or img is None:
        print("No se pudo leer el frame.")
        continue

    cv2.imshow("📱 DroidCam", img)

    key = cv2.waitKey(1)
    if key & 0xFF == ord('c'):
        frame = img.copy()
        print("Imagen capturada.")
        break
    elif key & 0xFF == ord('q'):
        print("Cancelado.")
        cap.release()
        cv2.destroyAllWindows()
        exit()

cap.release()
cv2.destroyAllWindows()

# ==== DETECTAR ROSTRO EN CAPTURA ====
frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
faces_cam = face_detector(frame_rgb)

if len(faces_cam) == 0:
    print("No se detectó rostro en la imagen capturada.")
    exit()

# Dibujar recuadro en la imagen capturada
face_cam = faces_cam[0]
x1, y1, x2, y2 = face_cam.left(), face_cam.top(), face_cam.right(), face_cam.bottom()
frame_bgr = frame.copy()
cv2.rectangle(frame_bgr, (x1, y1), (x2, y2), (0, 255, 0), 2)
cv2.imshow("Rostro detectado en cámara", frame_bgr)

# ==== CARGAR MODELOS DLIB ====
shape_predictor = dlib.shape_predictor("modelos/shape_predictor_68_face_landmarks.dat")
face_rec_model = dlib.face_recognition_model_v1("modelos/dlib_face_recognition_resnet_model_v1.dat")

def get_face_descriptor(image, face):
    shape = shape_predictor(image, face)
    return face_rec_model.compute_face_descriptor(image, shape)

# ==== OBTENER DESCRIPTORES Y COMPARAR ====
face_descriptor_ine = get_face_descriptor(image_ine, face_ine)
face_descriptor_cam = get_face_descriptor(frame_rgb, face_cam)

dist = distance.euclidean(face_descriptor_ine, face_descriptor_cam)
print(f"\nDistancia entre rostros: {dist:.4f}")

if dist < 0.6:
    print("Rostros coinciden (probablemente la misma persona).")
else:
    print("Rostros diferentes.")

# Esperar para mostrar ventanas
cv2.waitKey(0)
cv2.destroyAllWindows()
