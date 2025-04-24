import dlib
import cv2
import numpy as np
from scipy.spatial import distance
import pyttsx3
import time

# ==== INICIALIZAR VOZ ====
engine = pyttsx3.init()

def hablar(texto):
    engine.say(texto)
    engine.runAndWait()

# ==== DETECTOR DE ROSTROS ====
face_detector = dlib.get_frontal_face_detector()

def detect_face_with_rotation(image, detector):
    angles = [0, 90, 180, 270]
    for angle in angles:
        if angle != 0:
            rot_matrix = cv2.getRotationMatrix2D((image.shape[1] // 2, image.shape[0] // 2), angle, 1.0)
            rotated_image = cv2.warpAffine(image, rot_matrix, (image.shape[1], image.shape[0]))
        else:
            rotated_image = image.copy()

        faces = detector(rotated_image)
        if len(faces) > 0:
            return rotated_image, faces[0], angle
    return None, None, None

# ==== CARGAR IMAGEN DE INE ====
image_ine = dlib.load_rgb_image('D:/Proyectos/Ibento/modelos-algoritmos/INEValidation/dataset/ine_gaby.jpeg')
faces_ine = face_detector(image_ine)

if len(faces_ine) == 0:
    print("No se detectó rostro en la INE.")
    exit()

face_ine = faces_ine[0]
x1, y1, x2, y2 = face_ine.left(), face_ine.top(), face_ine.right(), face_ine.bottom()
face_ine_crop = image_ine[y1:y2, x1:x2]
face_ine_bgr = cv2.cvtColor(face_ine_crop, cv2.COLOR_RGB2BGR)
cv2.imshow("Rostro INE detectado", face_ine_bgr)

image_ine_full = cv2.cvtColor(image_ine, cv2.COLOR_RGB2BGR)
cv2.rectangle(image_ine_full, (x1, y1), (x2, y2), (0, 255, 0), 2)
cv2.imshow("INE con rostro detectado", image_ine_full)

# ==== STREAM DE DROIDCAM ====
cap = cv2.VideoCapture("http://192.168.1.110:4747/video")
if not cap.isOpened():
    print("No se pudo abrir el stream de DroidCam.")
    exit()
print("Stream abierto.\n")

# ==== CAPTURA AUTOMÁTICA ====
frame = None
distancia_actual = ""
ultima_distancia = ""
tiempo_inicio = None
contador_activo = False

while True:
    ret, img = cap.read()
    if not ret or img is None:
        continue

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    faces_live = face_detector(img_rgb)

    mensaje = "Buscando rostro..."
    color = (255, 255, 0)
    icono = None
    tiempo_actual = time.time()

    if len(faces_live) > 0:
        face_live = faces_live[0]
        x1, y1, x2, y2 = face_live.left(), face_live.top(), face_live.right(), face_live.bottom()
        width = x2 - x1
        height = y2 - y1
        area = width * height

        if area < 5000:
            distancia_actual = "lejos"
            mensaje = "⚠️ Acércate a la cámara"
            color = (0, 0, 255)
        elif area > 20000:
            distancia_actual = "cerca"
            mensaje = "⚠️ Aléjate un poco"
            color = (0, 165, 255)
        else:
            distancia_actual = "correcta"
            mensaje = "✅ Distancia adecuada"
            color = (0, 255, 0)
            icono = "😀"

        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

        if distancia_actual == "correcta":
            if not contador_activo:
                tiempo_inicio = tiempo_actual
                contador_activo = True
        else:
            contador_activo = False
            tiempo_inicio = None

        if contador_activo and tiempo_inicio:
            tiempo_transcurrido = tiempo_actual - tiempo_inicio
            if tiempo_transcurrido >= 1 and tiempo_transcurrido < 2:
                mensaje = "3..."
                hablar("3")
            elif tiempo_transcurrido >= 2 and tiempo_transcurrido < 3:
                mensaje = "2..."
                hablar("2")
            elif tiempo_transcurrido >= 3 and tiempo_transcurrido < 4:
                mensaje = "1..."
                hablar("1")
            elif tiempo_transcurrido >= 4:
                mensaje = "📸 Capturando..."
                hablar("Capturando imagen.")
                frame = img.copy()
                print("Imagen capturada automáticamente.")
                break

        if distancia_actual != ultima_distancia:
            if distancia_actual == "lejos":
                hablar("Por favor, acércate a la cámara.")
            elif distancia_actual == "cerca":
                hablar("Por favor, aléjate un poco.")
            elif distancia_actual == "correcta":
                hablar("Distancia adecuada. Mantente así.")
            ultima_distancia = distancia_actual
    else:
        contador_activo = False
        tiempo_inicio = None

    if icono:
        cv2.putText(img, icono, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1.5, color, 2)

    cv2.putText(img, mensaje, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
    cv2.imshow("📱 Posiciónate correctamente", img)

    key = cv2.waitKey(1)
    if key & 0xFF == ord('q'):
        print("Cancelado.")
        hablar("Cancelado.")
        cap.release()
        cv2.destroyAllWindows()
        exit()

cap.release()
cv2.destroyAllWindows()

# ==== DETECCIÓN FINAL Y COMPARACIÓN ====
frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
frame_rgb_rotated, face_cam, rotation_angle = detect_face_with_rotation(frame_rgb, face_detector)

if face_cam is None:
    print("No se detectó rostro en la imagen capturada.")
    hablar("No se detectó rostro.")
    exit()

print(f"Rostro detectado con rotación de {rotation_angle}°")

shape_predictor = dlib.shape_predictor("modelos/shape_predictor_68_face_landmarks.dat")
face_rec_model = dlib.face_recognition_model_v1("modelos/dlib_face_recognition_resnet_model_v1.dat")

def get_face_descriptor(image, face):
    shape = shape_predictor(image, face)
    return face_rec_model.compute_face_descriptor(image, shape)

face_descriptor_ine = get_face_descriptor(image_ine, face_ine)
face_descriptor_cam = get_face_descriptor(frame_rgb_rotated, face_cam)

dist = distance.euclidean(face_descriptor_ine, face_descriptor_cam)
print(f"\nDistancia entre rostros: {dist:.4f}")

if dist < 0.6:
    print("Rostros coinciden. Identidad verificada.")
    hablar("Rostros coinciden. Identidad verificada.")
else:
    print("Rostros diferentes.")
    hablar("Los rostros no coinciden.")
