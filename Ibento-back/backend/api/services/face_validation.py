# import dlib
# import numpy as np
# from PIL import Image
# import io
# from scipy.spatial import distance

# # Cargar modelos solo una vez
# face_detector = dlib.get_frontal_face_detector()
# shape_predictor = dlib.shape_predictor("modelos/shape_predictor_68_face_landmarks.dat")
# face_rec_model = dlib.face_recognition_model_v1("modelos/dlib_face_recognition_resnet_model_v1.dat")

# def verificar_rostros(ine_image_file, camera_image_file, threshold=0.6):
#     # Leer imagen INE
#     image_ine = dlib.load_rgb_image(
#         ine_image_file.temporary_file_path() if hasattr(ine_image_file, 'temporary_file_path') else ine_image_file
#     )
#     faces_ine = face_detector(image_ine)
#     if len(faces_ine) == 0:
#         raise ValueError("No se detectó rostro en la INE.")
#     face_ine = faces_ine[0]

#     # Leer imagen de cámara
#     image_bytes = camera_image_file.read()
#     image_np = np.array(Image.open(io.BytesIO(image_bytes)).convert("RGB"))
#     faces_cam = face_detector(image_np)
#     if len(faces_cam) == 0:
#         raise ValueError("No se detectó rostro en la imagen de la cámara.")
#     face_cam = faces_cam[0]

#     # Evaluar distancia relativa del rostro
#     frame_width = image_np.shape[1]
#     face_width = face_cam.right() - face_cam.left()
#     face_ratio = face_width / frame_width

#     if face_ratio > 0.6:
#         distancia_msg = "Rostro demasiado cerca. Aléjate un poco."
#     elif face_ratio < 0.15:
#         distancia_msg = "Rostro muy lejos. Acércate un poco."
#     else:
#         distancia_msg = "Distancia adecuada."

#     # Obtener descriptores
#     def get_descriptor(img, face):
#         shape = shape_predictor(img, face)
#         return face_rec_model.compute_face_descriptor(img, shape)

#     descriptor_ine = get_descriptor(image_ine, face_ine)
#     descriptor_cam = get_descriptor(image_np, face_cam)
#     dist = distance.euclidean(descriptor_ine, descriptor_cam)

#     is_match = dist < threshold
#     return is_match, dist, distancia_msg
