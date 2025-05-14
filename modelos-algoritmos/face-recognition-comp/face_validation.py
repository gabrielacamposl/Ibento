import dlib
import cv2


face_detector = dlib.get_frontal_face_detector()

# Cargar la imagen de la INE
image_ine = dlib.load_rgb_image('D:/Proyectos/Ibento/modelos-algoritmos/INEValidation/dataset/ine_gaby.jpeg')
#image_ine = dlib.load_rgb_image('D:/Proyectos/Ibento/modelos-algoritmos/INEValidation/dataset/gaby_f.jpg')
faces_ine = face_detector(image_ine)

if len(faces_ine) > 0:
    face = faces_ine[0]
    x1, y1, x2, y2 = face.left(), face.top(), face.right(), face.bottom() 
    face_ine_crop = image_ine[y1:y2, x1:x2]
else:
    print("No se detectó rostro en la INE.")
    exit()


#Captura desde la webcam
cap = cv2.VideoCapture(0)


print("Presiona 'c' para capturar una imagen.")
while True:
    ret, frame = cap.read()
    cv2.imshow("Webcam", frame)
    if cv2.waitKey(1) & 0xFF == ord('c'):
        break

#Desde el teléfono


# url = "http://192.168.1.110/4747/video"
# cap = cv2.VideoCapture(url)

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("No se pudo obtener el frame.")
#         break

#     cv2.imshow("Cámara del Celular", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

cap.release()
cv2.destroyAllWindows()

# Convertir a RGB y detectar rostro
frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
faces_cam = face_detector(frame_rgb)

if len(faces_cam) > 0:
    face = faces_cam[0]
    x1, y1, x2, y2 = face.left(), face.top(), face.right(), face.bottom()
    face_cam_crop = frame_rgb[y1:y2, x1:x2]
else:
    print("No se detectó rostro en la cámara.")
    exit()


# Cargar los modelos necesarios
shape_predictor = dlib.shape_predictor("modelos/shape_predictor_68_face_landmarks.dat")
face_rec_model = dlib.face_recognition_model_v1("modelos/dlib_face_recognition_resnet_model_v1.dat")

# Función para obtener descriptor de rostro
def get_face_descriptor(image, face):
    shape = shape_predictor(image, face)
    face_descriptor = face_rec_model.compute_face_descriptor(image, shape)
    return face_descriptor

# Obtener descriptores
face_descriptor_ine = get_face_descriptor(image_ine, faces_ine[0])
face_descriptor_cam = get_face_descriptor(frame_rgb, faces_cam[0])

# Calcular distancia
from scipy.spatial import distance
dist = distance.euclidean(face_descriptor_ine, face_descriptor_cam)

print(f"Distancia entre rostros: {dist}")
if dist < 0.6:
    print("Rostros coinciden (probablemente la misma persona).")
else:
    print("Rostros diferentes.")
