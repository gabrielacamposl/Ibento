import React, { useState, useEffect, useRef } from 'react';
import { Button } from "primereact/button";
import { useNavigate } from 'react-router-dom';
import { buttonStyle } from "../../styles/styles";
import "../../assets/css/botones.css";
import Webcam from 'react-webcam';
import api from "../../api";
import { Toast } from 'primereact/toast';


const Verificar = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const toast = useRef(null);
    const [user, setUser] = useState({
        pictures: [],
        interest: [],
        ine: [],
        facePhoto: null,
    });const [loading, setLoading] = useState(false);
    // Estados de carga individuales para cada acción
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [validatingIne, setValidatingIne] = useState(false);
    
    // Estados para tracking de pasos completados
    const [stepsCompleted, setStepsCompleted] = useState({
        photos: false,
        preferences: false,
        ine: false
    });
    
    const [ineImages, setIneImages] = useState([null, null]);
    const [activeIndex, setActiveIndex] = useState(0); // ✅ Ya estaba en 0
    const [itemsAboutMe, setItemsAboutMe] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [message, setMessage] = useState([]);
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    // Estado para guardar preferencias
    const [savedPreferences, setSavedPreferences] = useState(null);

    //Estado para guardas las fotos de perfil
    const [savedPhotos, setSavedPhotos] = useState([]);

    const items = [
        { label: 'Paso 1' },
        { label: 'Paso 2' },
        { label: 'Paso 3' },
        { label: 'Paso 4' },
    ];


    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            // Redirige si no hay token
            navigate("/login");
        }
        window.scrollTo(0, 0);
    }, []);

    // ------------- Subir fotos de perfil
    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;        if (!file.type.startsWith("image/")) {
            showWarn("Por favor selecciona una imagen válida.");
            return;
        }

        setUser((prev) => {
            const newPictures = [...prev.pictures];
            newPictures[index] = file;
            return {
                ...prev,
                pictures: newPictures,
            };
        });
    };

    const handleImageDelete = (indexToDelete) => {
        setUser((prev) => {
            const newPictures = [...prev.pictures];
            newPictures.splice(indexToDelete, 1);
            return {
                ...prev,
                pictures: newPictures,
            };
        });
    };    const handleUploadPictures = async () => {        if (user.pictures.length < 3 || user.pictures.length > 6) {
            showWarn("Debes subir entre 3 y 6 fotos.");
            return;
        }        // Validar cada archivo
        for (const picture of user.pictures) {
            if (!["image/jpeg", "image/png", "image/jpg"].includes(picture.type)) {
                showWarn("Solo se permiten imágenes JPG o PNG.");
                return;
            }
            if (picture.size > 5 * 1024 * 1024) { // 5MB
                showWarn("Cada imagen debe pesar menos de 5MB.");
                return;
            }
        }

        setUploadingPhotos(true);
        try {            // Guardar las fotos en local para enviar despues
            setSavedPhotos([...user.pictures]);
            setStepsCompleted(prev => ({ ...prev, photos: true }));
            console.log("Fotos guardadas localmente:", user.pictures);            // Simular un pequeño delay para mostrar el loading
            await new Promise(resolve => setTimeout(resolve, 500));

            showSuccess("¡Fotos guardadas correctamente!");
            setActiveIndex(prev => prev + 1);
        } finally {
            setUploadingPhotos(false);
        }

        // const formData = new FormData();
        // user.pictures.forEach((picture) => {
        //     formData.append("pictures", picture);
        // });

        // try {
        //     const response = await api.post("perfil/subir-fotos/", formData, {
        //         headers: {
        //             "Content-Type": "multipart/form-data",
        //         },
        //     });

        //     console.log("Fotos subidas:", response.data.pictures);
        //     alert("¡Fotos subidas con éxito!");
        //     setActiveIndex(prev => prev + 1);
        // } catch (error) {
        //     console.error("Error al subir fotos:", error.response?.data || error);
        //     alert("Error al subir fotos. Revisa el tamaño o intenta de nuevo.");
        // }
    };

    const uploadSavedPhotos = async () => {
        if (savedPhotos.length === 0) {
            console.error("No hay fotos guardadas para subir");
            return;
        }

        try {
            const formData = new FormData();
            savedPhotos.forEach((picture) => {
                formData.append("pictures", picture);
            });

            console.log("Subiendo fotos guardadas:", savedPhotos);
            const response = await api.post("perfil/subir-fotos/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Fotos subidas exitosamente:", response.data.pictures);
            return response.data;
        } catch (error) {
            console.error("Error al subir fotos:", error.response?.data || error);
            throw error;
        }
    };

    // ---------------------------- Intereses -----------------------------
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await api.get('categorias-perfil/');
                console.log("categorias recibidas:", response.data);
                setItemsAboutMe(response.data);
            } catch (error) {
                console.error("Error al cargar las preguntas", error);
            }
        };

        fetchQuestions();
    }, []);    const handleSavePreferences = async () => {
        setSavingPreferences(true);
        try {
            // Crear array de respuestas para TODAS las preguntas (incluso las no respondidas)
            const respuestas = itemsAboutMe.map(item => {
                const respuesta = selectedAnswers[item._id] || [];

                // Si es multi_option, enviamos el array completo
                // Si no es multi_option, enviamos solo el primer elemento (o string vacío si no hay respuesta)
                return {
                    categoria_id: item._id,
                    respuesta: item.multi_option ? respuesta : (respuesta.length > 0 ? respuesta[0] : "")
                };
            });

            // Validación: asegurarse de que todas las obligatorias estén contestadas
            const obligatoriasNoRespondidas = itemsAboutMe.filter(item => {
                const respuestaUsuario = selectedAnswers[item._id] || [];
                return !item.optional && respuestaUsuario.length === 0;
            });            if (obligatoriasNoRespondidas.length > 0) {
                showWarn("Por favor responde todas las preguntas obligatorias marcadas con *.");
                return;
            }

            console.log("=== DEBUG RESPUESTAS ===");
            console.log("selectedAnswers:", selectedAnswers);
            console.log("itemsAboutMe:", itemsAboutMe);
            console.log("respuestas a enviar:", respuestas);
            console.log("Payload completo:", JSON.stringify({ respuestas }, null, 2));

            // Simular delay para mostrar loading
            await new Promise(resolve => setTimeout(resolve, 500));            // Guardamos las preferencias en un estado
            setSavedPreferences({ respuestas });
            setStepsCompleted(prev => ({ ...prev, preferences: true }));
            console.log("Preferencias guardadas localmente:", { respuestas })

            // Intentar con el endpoint que aparece en el error            // const response = await api.post("intereses-respuestas/", { respuestas });
            // console.log("Respuesta del servidor:", response.data);
            showSuccess("Preferencias guardadas correctamente.");
            setActiveIndex(prev => prev + 1);        } catch (err) {

            console.error("Error al procesar preferencias:", err);
            showError(`Error al guardar preferencias: ${err.message}`);

            // console.error("Error completo:", err);
            // console.error("Error response:", err.response?.data);
            // console.error("Error status:", err.response?.status);
            // console.error("Error message:", err.message);
            // alert(`Error al guardar preferencias: ${err.response?.data?.error || err.message}`);
        } finally {
            setSavingPreferences(false);
        }
    };

    // Función para enviar las preferencias guardadas
    const sendSavedPreferences = async () => {
        if (!savedPreferences) {
            console.error("No hay preferencias guardadas para enviar");
            return;
        }

        try {
            console.log("Enviando preferencias guardadas:", savedPreferences);
            const response = await api.post("intereses-respuestas/", savedPreferences);
            console.log("Respuesta del servidor:", response.data);
            return response.data;
        } catch (err) {
            console.error("Error al enviar preferencias:", err);
            throw err;
        }
    };

    // ---------------------------- ENVIAR TODA LA INFORMACIÓN -----------------------------    // 🔥 FUNCIÓN COMBINADA para enviar todo al final
const uploadAllData = async () => {
    try {
        setLoading(true);
        
        // 1. Subir fotos
        console.log("Subiendo fotos...");
        await uploadSavedPhotos();
        
        // 2. Enviar preferencias
        console.log("Enviando preferencias...");
        await sendSavedPreferences();
        
        console.log("¡Todos los datos han sido enviados exitosamente!");
        
    } catch (error) {
        console.error("Error al enviar datos:", error);
        throw error; // Re-lanzar el error para que lo maneje la función que llama
    } finally {
        setLoading(false);
    }
};


    // ---------------------------- VALIDACION DE INE -----------------------------
    // ------ Manejo de imagenes de INE ------

    // Imagen INE
    const handleImageINE = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newImages = [...ineImages];
            newImages[index] = file;
            setIneImages(newImages);

            const updatedUserINE = [...user.ine];
            updatedUserINE[index] = file;
            setUser(prev => ({ ...prev, ine: updatedUserINE }));
        }
    };

    const handleImageDeleteINE = (index) => {
        const newImages = [...ineImages];
        newImages[index] = null;
        setIneImages(newImages);

        const updatedUserINE = [...user.ine];
        updatedUserINE[index] = null;
        setUser(prev => ({ ...prev, ine: updatedUserINE }));
    };

    // Pasar a base 64 la foto
    // Base64 a File
    const base64ToFile = (base64Data, filename) => {
        const arr = base64Data.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    };    // ------ Conexión con el backend ------
    const handleIneValidation = async () => {
        console.log("=== DEBUG VALIDACIÓN INE ===");
        console.log("user.ine[0]:", user.ine[0]);
        console.log("user.ine[1]:", user.ine[1]);
        console.log("user.facePhoto:", user.facePhoto ? "Foto capturada" : "No hay foto");

        // Validar que el INE esté subido
        if (!user.ine[0] || !user.ine[1]) {
            setMessage('Por favor, sube ambas imágenes de tu INE.');
            return;
        }
        if (!user.facePhoto) {
            setMessage('Por favor, captura una imagen de tu rostro.');
            return;
        }

        // Validar que las fotos estén guardadas
        if (savedPhotos.length === 0) {
            setMessage('Por favor, guarda primero tus fotos de perfil en el Paso 1.');
            return;
        }

        // Validar que las preferencias estén guardadas
        if (!savedPreferences) {
            setMessage('Por favor, guarda primero tus preferencias en el Paso 2.');
            return;
        }

        setValidatingIne(true);
        setMessage('');

        try {
            // Verificar que base64ToFile funcione correctamente
            const selfieFile = base64ToFile(user.facePhoto, "selfie.jpg");
            console.log("Selfie file creado:", selfieFile);
            console.log("Selfie file size:", selfieFile.size);
            console.log("Selfie file type:", selfieFile.type);

            const formData = new FormData();
            formData.append("ine_front", user.ine[0]);
            formData.append("ine_back", user.ine[1]);
            formData.append("selfie", selfieFile);

            console.log("FormData creado:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ', pair[1]);
            }

            const response = await api.post("validar-ine/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });            
            
            console.log("Respuesta del servidor:", response.data);
            
            const data = response.data;            
            
            if (data.mensaje_ine && data.mensaje_rostro) {
                setMessage('Tu identidad ha sido validada exitosamente. Subiendo datos...');

                // Subir automáticamente todos los datos del usuario
                try {
                    console.log("Subiendo todos los datos del usuario...");
                    await uploadAllData();                    setStepsCompleted(prev => ({ ...prev, ine: true }));
                    setMessage('¡Validación completada y todos los datos han sido enviados exitosamente!');
                    showContrast("¡Proceso completado! Bienvenido a Ibento.");
                    setActiveIndex(3);
                    
                    // Navegar a la página principal después de un delay
                    setTimeout(() => {
                        navigate("../principal");
                    }, 2000);                } catch (uploadError) {
                    console.error("Error al subir datos después de validación:", uploadError);
                    setMessage(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    showWarn(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    setActiveIndex(3);
                }
            } else {
                setMessage(data.error || 'La validación falló. Revisa las imágenes.');
            }
        } catch (error) {
            console.error('=== ERROR COMPLETO ===');
            console.error('Error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Error desconocido';            setMessage(`Error: ${errorMessage}`);
            showError(`Error detallado: ${JSON.stringify(error.response?.data, null, 2)}`);
        } finally {
            setValidatingIne(false);
        }
    };

    // ✅ FUNCIÓN CORREGIDA - Esta función tenía errores de lógica
    const handleNavigate = (index) => {        if (index === 1) {
            if (user.pictures.length < 3) {
                showWarn('Debes seleccionar al menos 3 fotos');
                return;
            }
            setActiveIndex(index);
        } else if (index === 2) {
            // Validación opcional para las preferencias
            const obligatoriasNoRespondidas = itemsAboutMe.filter(item => {
                return !item.optional && !(selectedAnswers[item._id]?.length > 0);
            });            if (obligatoriasNoRespondidas.length > 0) {
                showWarn('Debes responder todas las preguntas obligatorias');
                return;
            }
            setActiveIndex(index);
        } else {
            setActiveIndex(index);
        }
    };

    //------------------------- VALIDACIÓN Y COMPARACIÓN DE ROSTRO -------------------
    // -------- Capturar imagen con cámara
    const videoConstraints = {
        facingMode: "user", // Usa la cámara frontal
    };

    const capturarImagen = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedPhoto(imageSrc);
        setUser(prev => ({ ...prev, facePhoto: imageSrc }));
    };

    // Funciones para mostrar toasts
    const showSuccess = (message) => {
        toast.current.show({severity:'success', summary: 'Éxito', detail: message, life: 4000});
    };

    const showInfo = (message) => {
        toast.current.show({severity:'info', summary: 'Información', detail: message, life: 4000});
    };

    const showWarn = (message) => {
        toast.current.show({severity:'warn', summary: 'Advertencia', detail: message, life: 4000});
    };

    const showError = (message) => {
        toast.current.show({severity:'error', summary: 'Error', detail: message, life: 4000});
    };

    const showSecondary = (message) => {
        toast.current.show({severity:'secondary', summary: 'Información', detail: message, life: 4000});
    };

    const showContrast = (message) => {
        toast.current.show({severity:'contrast', summary: 'Completado', detail: message, life: 4000});
    };

    return (
        <div className="text-black flex justify-center items-center h-full">
            <div className="degradadoPerfil relative flex flex-col items-center p-5 shadow-t max-w-lg w-full">
                <div className="justify-start w-full">
                    <h1 className='font-semibold texto'>{items[activeIndex].label}</h1>
                    <div className="w-50 bg-gray-200 rounded-full h-1.5 dark:bg-gray-400 mt-2">
                        <div
                            className="btn-custom h-1.5 rounded-full"
                            style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="w-full overflow-y-auto gap-2 custom-scrollbar">
                    {/*VENTANA PARA INGRESAR IMAGENES */}
                    {activeIndex === 0 && (
                        <div className="">
                            <h1 className='mt-2 text-3xl font-bold miPerfil'>Editar Perfil</h1>
                            <React.Fragment>
                                <h2 className="mt-2">Elige tus mejores fotos, elige como mínimo 3 fotografías</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 ">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="relative">
                                            <div className="relative w-35 h-45 sm:w-35 sm:h-40 md:w-35 md:h-45 border-dashed divBorder flex items-center justify-center mt-4">
                                                {user.pictures[index] ? (
                                                    <img
                                                        src={
                                                            typeof user.pictures[index] === "string"
                                                                ? user.pictures[index]
                                                                : URL.createObjectURL(user.pictures[index])
                                                        }
                                                        alt={`Imagen ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <label htmlFor={`fileInput-${index}`} className="cursor-pointer texto">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-15 h-12">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                        </svg>
                                                        <span className="block mt-2 colorTexto">Agregar</span>
                                                    </label>
                                                )}

                                                {user.pictures[index] && (
                                                    <button
                                                        className="w-7 h-7 btn-custom absolute top-0 right-0 text-white  rounded-full btn-custom"
                                                        onClick={() => handleImageDelete(index)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 ">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <input id={`fileInput-${index}`} type="file" className="hidden" onChange={(e) => handleImageChange(e, index)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </React.Fragment>
                        </div>
                    )}

                    {/* SELECCIÓN DE INTERESES */}
                    {activeIndex === 1 && (
                        <div className="grid grid-cols-1 gap-4 mt-2">
                            {itemsAboutMe.map((item, index) => {
                                // 👇 Parseamos "answers" por si vienen mal como string
                                let answers = [];
                                try {
                                    answers = Array.isArray(item.answers)
                                        ? item.answers
                                        : JSON.parse(item.answers.replace(/'/g, '"'));
                                } catch (e) {
                                    console.error("No se pudo parsear answers para:", item.question);
                                    answers = [];
                                }

                                return (
                                    <div key={index} className="flex flex-col">
                                        {item.question === '¿Cuál es tu personalidad?' ? (
                                            <div className="flex space-x-1 items-center">
                                                <p className="text-black font-semibold">
                                                    {item.question}
                                                    {!item.optional && <span className="text-red-500"> *</span>}
                                                </p>
                                                <a
                                                    className="botonLink"
                                                    href="https://www.16personalities.com/es/test-de-personalidad"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Hacer test de personalidad
                                                </a>
                                            </div>
                                        ) : (
                                            <p className="font-semibold">
                                                {item.question}
                                                {!item.optional && <span className="text-red-500"> *</span>}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {answers.map((answer, i) => {
                                                const isSelected = selectedAnswers[item._id]?.includes(answer);

                                                return (
                                                    <button
                                                        key={i}
                                                        className={`rounded-full ${isSelected ? 'btn-active' : 'btn-inactive'}`}
                                                        onClick={() => {
                                                            setSelectedAnswers((prev) => {
                                                                const currentAnswers = prev[item._id] || [];

                                                                if (item.multi_option) {
                                                                    return {
                                                                        ...prev,
                                                                        [item._id]: currentAnswers.includes(answer)
                                                                            ? currentAnswers.filter((a) => a !== answer)
                                                                            : [...currentAnswers, answer]
                                                                    };
                                                                } else {
                                                                    return {
                                                                        ...prev,
                                                                        [item._id]: [answer]
                                                                    };
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        {answer}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/*VENTANA PARA VERIFICAR IDENTIDAD*/}
                    {activeIndex === 2 && (
                        <div className='h-180'>
                            <h1 className="text-2xl font-bold">Verificar mi perfil</h1>
                            <p>Para verificar su identidad deberás subir foto de su INE.</p>
                            <div className="w-full mt-2 items-center flex flex-col">
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className="relative w-80 h-45 m-2 border-dashed divBorder flex items-center justify-center mt-6">
                                        {ineImages[index] ? (
                                            <>
                                                <img
                                                    src={URL.createObjectURL(ineImages[index])}
                                                    alt={`Imagen ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    className="w-7 h-7 btn-custom absolute top-0 right-0 text-white rounded-full"
                                                    onClick={() => handleImageDeleteINE(index)}
                                                >
                                                    X
                                                </button>
                                            </>
                                        ) : (
                                            <label htmlFor={`fileInput-${index}`} className="cursor-pointer texto flex flex-col items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-15 h-12">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                <span className="block mt-2 colorTexto text-center">
                                                    {index === 0 ? 'Subir INE (parte frontal)' : 'Subir INE (parte trasera)'} en formato jpg, png
                                                </span>
                                            </label>
                                        )}
                                        <input
                                            id={`fileInput-${index}`}
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageINE(e, index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/*VENTANA PARA VERIFICAR IDENTIDAD*/}
                    {activeIndex === 3 && (
                        <div className='h-180'>
                            <h1 className="text-2xl font-bold">Verificar mi perfil</h1>
                            <p>Ahora, centra tu cara para verificar que la INE sea suya</p>
                            <div className="w-full mt-2 items-center flex flex-col">
                                <div className="rounded-[30px] overflow-hidden border-4 border-purple-300 shadow-md">
                                    {!capturedPhoto ? (
                                        <Webcam
                                            ref={webcamRef}
                                            audio={false}
                                            screenshotFormat="image/jpeg"
                                            videoConstraints={videoConstraints}
                                            className="w-72 h-96 object-cover"
                                        />
                                    ) : (
                                        <img src={capturedPhoto} alt="Captura" className="w-72 h-96 object-cover" />
                                    )}
                                </div>                                {!capturedPhoto ? (
                                    <>
                                        <button
                                            onClick={capturarImagen}
                                            className="mt-4 w-14 h-14 rounded-full bg-purple-400 hover:bg-purple-500 transition-colors"
                                        />
                                        <p className="text-center mt-2">Capturar imagen</p>
                                        <p className="text-center text-red-500 mt-2">No se ha capturado ninguna imagen.</p>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center mt-4">
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => {
                                                    setCapturedPhoto(null);
                                                    setUser(prev => ({ ...prev, facePhoto: null }));
                                                }}
                                                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                                            >
                                                Retomar foto
                                            </button>
                                        </div>
                                        <p className="text-center text-green-600 mt-2">Imagen capturada correctamente</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>                {/* ✅ BOTONES CORREGIDOS */}
                <div className="mt-2 flex justify-center space-x-2 w-full mb-10 ">
                    <Button
                        className={buttonStyle}
                        onClick={() => setActiveIndex(prev => prev - 1)}
                        disabled={activeIndex === 0}
                    >
                        Anterior
                    </Button>

                    {activeIndex === 0 ? (
                        <Button 
                            className={buttonStyle} 
                            onClick={handleUploadPictures}
                            disabled={uploadingPhotos}
                        >
                            {uploadingPhotos ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Subiendo...
                                </div>
                            ) : (
                                'Subir Fotos'
                            )}
                        </Button>
                    ) : activeIndex === 1 ? (
                        <Button 
                            className={buttonStyle} 
                            onClick={handleSavePreferences}
                            disabled={savingPreferences}
                        >
                            {savingPreferences ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </div>
                            ) : (
                                'Guardar Preferencias'
                            )}
                        </Button>
                    ) : activeIndex === 2 ? (
                        <Button className={buttonStyle} onClick={() => setActiveIndex(3)}>
                            Siguiente
                        </Button>
                    ) : activeIndex === 3 ? (
                        <Button 
                            className={buttonStyle} 
                            onClick={handleIneValidation} 
                            disabled={validatingIne}
                        >
                            {validatingIne ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Validando...
                                </div>
                            ) : (
                                'Validar identidad'
                            )}
                        </Button>
                    ) : null}                </div>
            </div>
            <Toast ref={toast} position="bottom-center"/>
        </div>
    );
};

export default Verificar;