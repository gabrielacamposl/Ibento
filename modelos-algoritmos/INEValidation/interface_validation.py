import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import base64
import requests
import os
from dotenv import load_dotenv

# Cargar API key
load_dotenv()
API = os.getenv("API_KEY_KIBAN")

# Función para convertir imagen a base64
def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

# Función para seleccionar imágenes
def select_image(side):
    file_path = filedialog.askopenfilename(
        filetypes=[("Image files", "*.jpg *.jpeg *.png")])
    if not file_path:
        return

    image = Image.open(file_path)
    image.thumbnail((250, 250))
    photo = ImageTk.PhotoImage(image)

    if side == "front":
        front_label.configure(image=photo)
        front_label.image = photo
        app.front_path = file_path
    else:
        back_label.configure(image=photo)
        back_label.image = photo
        app.back_path = file_path

# Función para enviar a la API y validar INE
def validate_ine():
    if not hasattr(app, "front_path") or not hasattr(app, "back_path"):
        messagebox.showerror("Error", "Selecciona ambas imágenes.")
        return

    ine_f_b64 = image_to_base64(app.front_path)
    ine_t_b64 = image_to_base64(app.back_path)

    # API de extracción de datos
    url = "https://link.kiban.com/api/v2/ine/data_extraction/"
    payload = {
        "files": [
            {"name": "front", "base64": ine_f_b64},
            {"name": "back", "base64": ine_t_b64}
        ]
    }
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": API
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        cic = data["response"]["cic"]
        id_ciudadano = data["response"]["identificadorCiudadano"]

        # Validar INE
        url_validation = "https://link.kiban.com/api/v2/ine/validate"
        payload_validation = {
            "modelo": "e",
            "cic": cic,
            "idCiudadano": id_ciudadano
        }

        response_validation = requests.post(url_validation, json=payload_validation, headers=headers)
        userinfo = response_validation.json()
        status = userinfo["response"]["status"]

        if status == "VALID":
            messagebox.showinfo("Resultado", "La INE es válida.")
        else:
            messagebox.showwarning("Resultado", "La INE no es válida.")

    except Exception as e:
        messagebox.showerror("Error", f"Ocurrió un error:\n{e}")

# Crear ventana principal
app = tk.Tk()
app.title("Validador de INE")
app.geometry("600x400")

# Botones para cargar imágenes
btn_frame = tk.Frame(app)
btn_frame.pack(pady=10)

tk.Button(btn_frame, text="Seleccionar INE Frontal", command=lambda: select_image("front")).pack(side="left", padx=10)
tk.Button(btn_frame, text="Seleccionar INE Trasera", command=lambda: select_image("back")).pack(side="left", padx=10)

# Espacios para mostrar imágenes
img_frame = tk.Frame(app)
img_frame.pack()

front_label = tk.Label(img_frame)
front_label.pack(side="left", padx=10)

back_label = tk.Label(img_frame)
back_label.pack(side="left", padx=10)

# Botón de validación
tk.Button(app, text="Validar INE", command=validate_ine, bg="green", fg="white").pack(pady=20)

app.mainloop()
