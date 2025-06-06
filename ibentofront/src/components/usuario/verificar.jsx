import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, CheckCircle, Upload, Plus, X } from 'lucide-react';
import Webcam from 'react-webcam';
import api from "../../api";
import { Toast } from 'primereact/toast';
import { curp_regex, patron_curp } from "../../utils/regex";
// Agregar esta importación para face-api.js
// import * as faceapi from 'face-api.js';

const Verificar = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const toast = useRef(null);
    const [user, setUser] = useState({
        pictures: [],
        interest: [],
        ine: [],
        facePhoto: null,
    });
    
    const [loading, setLoading] = useState(false);

    // Estados de carga individuales para cada acción
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [validatingIne, setValidatingIne] = useState(false);
    const [submittingInfo, setSubmittingInfo] = useState(false);
    
    // Estados para tracking de pasos completados
    const [stepsCompleted, setStepsCompleted] = useState({
        photos: false,
        preferences: false,
        ine: false,
        info: false
    });
    
    // Estados para el formulario de información adicional (step 4)
    const [formData, setFormData] = useState({
        birthday: '',
        gender: '',
        description: '',
        curp: ''
    });
    
    const [ineImages, setIneImages] = useState([null, null]);
    const [activeIndex, setActiveIndex] = useState(0);
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
        { label: 'Paso 5' },
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

            // Intentar con el endpoint que aparece en el error            
            // const response = await api.post("intereses-respuestas/", { respuestas });
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

    // ---------------------------- ENVIAR TODA LA INFORMACIÓN ----------------------------- 

    
    // 🔥 FUNCIÓN COMBINADA para enviar todo al final
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

    // -------- Validar imagenes de INE
    const handleIneValidation = async () => {
        if (!ineImages[0] || !ineImages[1] || !capturedPhoto) {
            showWarn('Debes subir ambas imágenes de la INE y capturar tu foto');
            return;
        }

        setValidatingIne(true);

        try {
            const formData = new FormData();
            formData.append('ine_front', ineImages[0]);
            formData.append('ine_back', ineImages[1]);
            formData.append('selfie', dataURLtoFile(capturedPhoto, 'selfie.jpg'));

            const response = await api.post('validar-ine/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;

            if (data.success && data.usuario_validado) {
                setMessage('¡INE validada exitosamente! Ahora completa tu información personal.');
                try {
                    console.log("Subiendo todos los datos del usuario...");
                    await uploadAllData();                    
                    setStepsCompleted(prev => ({ ...prev, ine: true }));
                    showSuccess("¡INE validada exitosamente! Completa tu información personal.");
                    setActiveIndex(4); // Navigate to step 5 (form)
                } catch (uploadError) {
                    console.error("Error al subir datos después de validación:", uploadError);
                    setMessage(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    showWarn(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    setActiveIndex(4); // Still navigate to step 5 even if upload fails
                }
            } else if (data.mensaje_ine) {
                 setMessage('INE validada correctamente. El servicio de validación de rostro no está disponible temporalmente. Por favor, intenta más tarde.');
                 try {
                    console.log("Subiendo todos los datos del usuario...");
                    await uploadAllData();                    
                    setStepsCompleted(prev => ({ ...prev, ine: true }));
                    setMessage('¡INE validada y todos los datos han sido enviados exitosamente!');
                    showContrast("¡INE validada! Completa tu información personal.");
                    setActiveIndex(4); // Navigate to step 5 (form)
                } catch (uploadError) {
                    console.error("Error al subir datos después de validación:", uploadError);
                    setMessage(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    showWarn(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    setActiveIndex(4); // Still navigate to step 5 even if upload fails
                }
            }
             else {
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

    // ---------------------------- FORMULARIO DE INFORMACIÓN ADICIONAL ----------------------------
    
    // Función para manejar cambios en el formulario
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para validar el formulario
    const validateForm = () => {
        const { birthday, gender, description, curp } = formData;
        
        if (!birthday.trim()) {
            showWarn('La fecha de nacimiento es requerida');
            return false;
        }
        
        if (!gender) {
            showWarn('El género es requerido');
            return false;
        }
        
        if (!description.trim()) {
            showWarn('La descripción es requerida');
            return false;
        }
        
        if (!curp.trim()) {
            showWarn('El CURP es requerido');
            return false;
        }

      
        
        // Validar formato de fecha (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(birthday)) {
            showWarn('El formato de fecha debe ser YYYY-MM-DD');
            return false;
        }
        
        // Validar CURP (18 caracteres alfanuméricos)
        // if (curp.length !== 18) {
        //     showWarn('El CURP debe tener exactamente 18 caracteres');
        //     return false;
        // }
        if (!patron_curp.test(curp.trim().toUpperCase())) {
                showWarn("La CURP debe tener 18 caracteres alfanuméricos y seguir el formato correcto.");
                return false;
         }
        
        return true;
    };

    // Función para enviar la información adicional
    const handleSubmitInfo = async () => {
        if (!validateForm()) {
            return;
        }

        setSubmittingInfo(true);

        try {
            const response = await api.post('usuarios/agregar_info/', formData);
            
            if (response.status === 200) {
                setStepsCompleted(prev => ({ ...prev, info: true }));
                showContrast("¡Registro completado exitosamente! Bienvenido a Ibento.");
                
                // Navegar a la página de eventos después de un delay
                setTimeout(() => {
                    navigate("../eventos");
                }, 2000);
            }
        } catch (error) {
            console.error('Error al enviar información:', error);
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.detail || 
                                error.message || 
                                'Error al guardar la información';
            showError(`Error: ${errorMessage}`);
        } finally {
            setSubmittingInfo(false);
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

    // Función auxiliar para convertir dataURL a File
    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }        return new File([u8arr], filename, { type: mime });
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
            {/* Header Section */}
            <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/30">
                <div className="flex items-center justify-between p-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/60 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                Verificación
                            </h1>
                            <p className="text-sm text-gray-600">Paso {activeIndex + 1} de {items.length}</p>
                        </div>
                    </div>

                    <div className="w-12 h-12 flex items-center justify-center">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                            <div 
                                className="absolute inset-0 bg-white rounded-full"
                                style={{ 
                                    clipPath: `polygon(0 0, ${((activeIndex + 1) / items.length) * 100}% 0, ${((activeIndex + 1) / items.length) * 100}% 100%, 0 100%)` 
                                }}
                            ></div>
                            <div className="absolute inset-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{activeIndex + 1}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-24 px-4 pb-8">
                <div className="max-w-4xl mx-auto">
                    {/* Content Cards */}
                    <div className="glass-premium rounded-3xl p-6 mb-6">
                        
                        {/*STEP 1: PHOTOS */}
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
                        )}                        {/* STEP 2: INTERESTS */}
                        {activeIndex === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl w-fit mx-auto mb-4">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Cuéntanos sobre ti</h2>
                                    <p className="text-gray-600">Responde estas preguntas para personalizar tu experiencia</p>
                                </div>

                                <div className="space-y-6">
                                    {itemsAboutMe.map((item, index) => {
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
                                            <div key={index} className="glass-premium rounded-2xl p-6">
                                                <div className="mb-4">
                                                    {item.question === '¿Cuál es tu personalidad?' ? (
                                                        <div className="flex flex-col space-y-2">
                                                            <p className="text-lg font-semibold text-gray-800">
                                                                {item.question}
                                                                {!item.optional && <span className="text-red-500"> *</span>}
                                                            </p>                                                            <a
                                                                className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm underline"
                                                                href="https://www.16personalities.com/es/test-de-personalidad"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Hacer test de personalidad →
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <p className="text-lg font-semibold text-gray-800">
                                                            {item.question}
                                                            {!item.optional && <span className="text-red-500"> *</span>}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {answers.map((answer, i) => {
                                                        const isSelected = selectedAnswers[item._id]?.includes(answer);

                                                        return (
                                                            <button
                                                                key={i}
                                                                className={`p-2 rounded-2xl border-2 transition-all duration-300 font-light text-sm ${
                                                                    isSelected
                                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg transform scale-105'
                                                                        : 'bg-white/50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-white/70'
                                                                }`}
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
                            </div>
                        )}                        {/* STEP 3: INE VERIFICATION */}
                        {activeIndex === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl w-fit mx-auto mb-4">
                                        <Shield className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifica tu identidad</h2>
                                    <p className="text-gray-600">Sube fotos de ambos lados de tu INE para verificar tu identidad</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Array.from({ length: 2 }).map((_, index) => (
                                        <div key={index} className="glass-premium rounded-2xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                                {index === 0 ? 'Parte frontal' : 'Parte trasera'}
                                            </h3>
                                            <div className="relative w-full aspect-[3/2] border-2 border-dashed border-purple-200 rounded-2xl overflow-hidden hover:border-purple-400 transition-colors duration-300">
                                                {ineImages[index] ? (
                                                    <>
                                                        <img
                                                            src={URL.createObjectURL(ineImages[index])}
                                                            alt={`INE ${index === 0 ? 'frontal' : 'trasera'}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                                            onClick={() => handleImageDeleteINE(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <label htmlFor={`ineInput-${index}`} className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-purple-600 hover:text-purple-700 transition-colors">
                                                        <Upload className="w-8 h-8 mb-2" />
                                                        <span className="text-sm font-medium text-center px-4">
                                                            Subir {index === 0 ? 'frontal' : 'trasera'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-1">JPG, PNG</span>
                                                    </label>
                                                )}
                                                <input
                                                    id={`ineInput-${index}`}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageINE(e, index)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {message && (
                                    <div className="glass-premium rounded-2xl p-4 border-l-4 border-blue-500">
                                        <p className="text-blue-700 font-medium">{message}</p>
                                    </div>
                                )}
                            </div>
                        )}                        {/* STEP 4: FACE VERIFICATION */}
                        {activeIndex === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl w-fit mx-auto mb-4">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificación facial</h2>
                                    <p className="text-gray-600">Centra tu cara para verificar que la INE sea tuya</p>
                                </div>

                                {/* Model Loading Indicator */}
                                {!isModelLoaded && (
                                    <div className="glass-premium rounded-2xl p-4 border-l-4 border-blue-500">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-blue-700 font-medium">Cargando sistema de detección facial...</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center space-y-6">
                                    {/* Camera/Photo Container */}
                                    <div className="relative">
                                        <div className="glass-premium rounded-3xl p-4 shadow-2xl">
                                            <div className="relative rounded-2xl overflow-hidden w-80 h-96 bg-gray-100">
                                                {!capturedPhoto ? (
                                                    <>
                                                        <Webcam
                                                            ref={webcamRef}
                                                            audio={false}
                                                            screenshotFormat="image/jpeg"
                                                            videoConstraints={videoConstraints}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <canvas
                                                            ref={canvasRef}
                                                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                                            style={{ transform: 'scaleX(-1)' }}
                                                        />
                                                    </>
                                                ) : (
                                                    <img 
                                                        src={capturedPhoto} 
                                                        alt="Captura" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Real-time Feedback */}
                                    {!capturedPhoto && realTimeDetection && (
                                        <div className={`glass-premium rounded-2xl p-4 text-center transition-all duration-300 border-2 ${
                                            faceStatus.distance === 'optimal' ? 'border-green-500 bg-green-50' :
                                            faceStatus.distance === 'close' ? 'border-red-500 bg-red-50' :
                                            faceStatus.distance === 'far' ? 'border-yellow-500 bg-yellow-50' :
                                            'border-gray-400 bg-gray-50'
                                        }`}>
                                            <p className="font-semibold text-sm">{faceStatus.feedback}</p>
                                            {faceStatus.detected && (
                                                <p className="text-xs mt-1 text-gray-600">
                                                    Confianza: {Math.round(faceStatus.confidence * 100)}%
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {!capturedPhoto ? (
                                        <div className="flex flex-col items-center space-y-4">
                                            {!realTimeDetection ? (
                                                <button
                                                    onClick={startFaceDetection}
                                                    disabled={!isModelLoaded}
                                                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                                                >
                                                    {isModelLoaded ? 'Iniciar detección facial' : 'Cargando modelos...'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={capturarImagenMejorada}
                                                    disabled={!canCaptureOptimal}
                                                    className={`w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center ${
                                                        canCaptureOptimal
                                                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-110 shadow-lg animate-pulse'
                                                            : 'bg-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <Camera className="w-8 h-8 text-white" />
                                                </button>
                                            )}
                                            <p className="text-center text-sm font-medium text-gray-600">
                                                {!realTimeDetection 
                                                    ? 'Inicia la detección para continuar'
                                                    : (canCaptureOptimal 
                                                        ? '✓ Toca para capturar la foto' 
                                                        : 'Posiciona tu rostro correctamente')
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-4">
                                            <button
                                                onClick={retakePhoto}
                                                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl transition-colors duration-300"
                                            >
                                                Retomar foto
                                            </button>
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium">Imagen capturada correctamente</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Validation Feedback */}
                                    {validationFeedback && (
                                        <div className="glass-premium rounded-2xl p-4 border-l-4 border-red-500 bg-red-50">
                                            <p className="text-red-700 font-medium mb-3">{validationFeedback}</p>
                                            <div className="flex space-x-3">
                                                {canRetakePhoto && (
                                                    <button
                                                        onClick={retakePhoto}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors"
                                                    >
                                                        Nueva foto
                                                    </button>
                                                )}
                                                {canRetakeINE && (
                                                    <button
                                                        onClick={retakeINE}
                                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm transition-colors"
                                                    >
                                                        Nueva INE
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    <div className="glass-premium rounded-2xl p-6 max-w-md">
                                        <h4 className="font-semibold text-lg mb-3 flex items-center">
                                            <span className="mr-2">💡</span>
                                            Consejos para una mejor captura
                                        </h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li className="flex items-center">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                                Buena iluminación natural
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                                Rostro centrado y visible
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                                Sin lentes oscuros
                                            </li>
                                            <li className="flex items-center">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                                Espera el marco verde
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                      { activeIndex === 4 && (
                        <div className="flex flex-col items-center justify-center min-h-[600px] px-6 py-8">
                            <div className="w-full max-w-2xl space-y-8">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-4 shadow-lg">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                        Tu información personal
                                    </h1>
                                    <p className="text-gray-600 text-lg">
                                        Tu INE ha sido validada exitosamente ✓
                                    </p>
                                    <p className="text-gray-500">
                                        Agrega los siguientes datos para finalizar tu registro
                                    </p>
                                </div>

                                {/* Form Container */}
                                <div className="glass-premium rounded-3xl p-8 shadow-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Fecha de nacimiento */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center">
                                                <span className="mr-2">📅</span>
                                                Fecha de nacimiento
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.birthday}
                                                onChange={(e) => handleFormChange('birthday', e.target.value)}
                                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                                required
                                            />
                                        </div>

                                        {/* Género */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center">
                                                <span className="mr-2">👤</span>
                                                Género
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => handleFormChange('gender', e.target.value)}
                                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                                required
                                            >
                                                <option value="">Selecciona tu género</option>
                                                <option value="H">Hombre</option>
                                                <option value="M">Mujer</option>
                                                <option value="O">Otro</option>
                                            </select>
                                        </div>

                                        {/* CURP */}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center">
                                                <span className="mr-2">🆔</span>
                                                CURP
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.curp}
                                                onChange={(e) => handleFormChange('curp', e.target.value.toUpperCase())}
                                                placeholder="Ingresa tu CURP (18 caracteres)"
                                                maxLength={18}
                                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm uppercase font-mono"
                                                required
                                            />
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <span className="mr-2">💡</span>
                                                El CURP debe tener exactamente 18 caracteres
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center">
                                                <span className="mr-2">📝</span>
                                                Descripción personal
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => handleFormChange('description', e.target.value)}
                                                placeholder="Cuéntanos un poco sobre ti... ¿Qué te gusta hacer? ¿Cuáles son tus aficiones?"
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                                                required
                                            />
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span className="flex items-center">
                                                    <span className="mr-1">💡</span>
                                                    Sé auténtico y describe tus intereses
                                                </span>
                                                <span className="text-gray-400">
                                                    {formData.description.length}/500
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Success Message */}
                                    <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                        <div className="flex items-center text-green-700">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            <span className="font-medium">¡Casi terminamos! Solo falta completar estos datos.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                 <div className="mt-8 flex justify-center space-x-4 w-full mb-20">
                    <button
                        onClick={() => setActiveIndex(prev => prev - 1)}
                        disabled={activeIndex === 0}
                        className="px-8 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                        Anterior
                    </button>

                    {activeIndex === 0 ? (
                        <button
                            onClick={handleUploadPictures}
                            disabled={uploadingPhotos}
                            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
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
                        </button>
                    ) : activeIndex === 1 ? (
                        <button
                            onClick={handleSavePreferences}
                            disabled={savingPreferences}
                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
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
                        </button>
                    ) : activeIndex === 2 ? (
                        <button
                            onClick={handleIneValidation}
                            disabled={validatingIne}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
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
                                'Validar INE'
                            )}
                        </button>
                    ) : activeIndex === 3 ? (
                        <button
                            onClick={handleValidacionRostro}
                            disabled={validatingFace}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                        >
                            {validatingFace ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Validando...
                                </div>
                            ) : (
                                'Validar Identidad'
                            )}
                        </button>
                        
                    ) : activeIndex === 4 ? (
                        <button
                            onClick={handleSubmitInfo}
                            disabled={submittingInfo}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                        >
                            {submittingInfo ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando...
                                </div>
                            ) : (
                                'Finalizar Registro'
                            )}                        </button>
                    ) : null}
                </div>
            </div>
        </div>
        <Toast ref={toast} position="bottom-center" />
    </div>
    );
};

export default Verificar;