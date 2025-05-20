import dlib
import cv2
import numpy as np
from scipy.spatial import distance

# ==== DETECTOR DE ROSTROS ====
face_detector = dlib.get_frontal_face_detector()

# ==== FUNCIÓN PARA DETECTAR ROSTRO CON ROTACIONES ====
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
    print(" No se detectó rostro en la INE.")
    exit()

face_ine = faces_ine[0]
x1, y1, x2, y2 = face_ine.left(), face_ine.top(), face_ine.right(), face_ine.bottom()
image_ine_bgr = cv2.cvtColor(image_ine, cv2.COLOR_RGB2BGR)
cv2.rectangle(image_ine_bgr, (x1, y1), (x2, y2), (0, 255, 0), 2)

# Mostrar INE a menor tamaño
resized_ine = cv2.resize(image_ine_bgr, (0, 0), fx=0.25, fy=0.25)
cv2.imshow("Rostro detectado en INE (Escalado)", resized_ine)

# ==== ABRIR CÁMARA LOCAL ====
print("Abriendo cámara local...")
cap = cv2.VideoCapture(0)  # <== CAMBIO IMPORTANTE

if not cap.isOpened():
    print("No se pudo abrir la cámara local.")
    exit()
print("Cámara abierta.\n")

# ==== MOSTRAR STREAM ====
frame = None
while True:
    ret, img = cap.read()
    if not ret or img is None:
        print("No se pudo leer el frame.")
        continue

    cv2.imshow("📷 Cámara Local", img)

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
frame_rgb_rotated, face_cam, rotation_angle = detect_face_with_rotation(frame_rgb, face_detector)

if face_cam is None:
    print("No se detectó rostro en la imagen capturada, incluso con rotaciones.")
    exit()
else:
    print(f"Rostro detectado con rotación de {rotation_angle}°")

# ==== CARGAR MODELOS DLIB ====
shape_predictor = dlib.shape_predictor("modelos/shape_predictor_68_face_landmarks.dat")
face_rec_model = dlib.face_recognition_model_v1("modelos/dlib_face_recognition_resnet_model_v1.dat")

def get_face_descriptor(image, face):
    shape = shape_predictor(image, face)
    return face_rec_model.compute_face_descriptor(image, shape)

# ==== OBTENER DESCRIPTORES Y COMPARAR ====
face_descriptor_ine = get_face_descriptor(image_ine, face_ine)
face_descriptor_cam = get_face_descriptor(frame_rgb_rotated, face_cam)

dist = distance.euclidean(face_descriptor_ine, face_descriptor_cam)
print(f"\nDistancia entre rostros: {dist:.4f}")

if dist < 0.6:
    print("Rostros coinciden (probablemente la misma persona).")
else:
    print("Rostros diferentes.")
