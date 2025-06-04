import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "primereact/button";
import { useNavigate } from 'react-router-dom';
import { buttonStyle } from "../../styles/styles";
import "../../assets/css/botones.css";
import Webcam from 'react-webcam';
import api from "../../api";
import { Toast } from 'primereact/toast';
import { curp_regex } from "../../utils/regex";
// Agregar esta importación para face-api.js
// import * as faceapi from 'face-api.js';

const Verificar = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const canvasRef = useRef(null); // Nuevo ref para el canvas de detección
    const toast = useRef(null);
    const detectionIntervalRef = useRef(null); // Nuevo ref para el intervalo de detección
    
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
    const [validatingFace, setValidatingFace] = useState(false);
    
    // Estados para la validación de rostro
    const [validationAttempts, setValidationAttempts] = useState(0);
    const [validationFeedback, setValidationFeedback] = useState('');
    const [canRetakePhoto, setCanRetakePhoto] = useState(false);
    const [canRetakeINE, setCanRetakeINE] = useState(false);
    
    // ===== NUEVOS ESTADOS PARA DETECCIÓN FACIAL EN TIEMPO REAL =====
    const [faceStatus, setFaceStatus] = useState({
        detected: false,
        distance: 'unknown',
        confidence: 0,
        feedback: 'Posiciona tu rostro frente a la cámara'
    });
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [realTimeDetection, setRealTimeDetection] = useState(false);
    const [canCaptureOptimal, setCanCaptureOptimal] = useState(false);

    // Estados para tracking de pasos completados
    const [stepsCompleted, setStepsCompleted] = useState({
        photos: false,
        preferences: false,
        ine: false,
        face: false,
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

    // ===== INICIALIZACIÓN DE MODELOS DE FACE-API.JS =====
    useEffect(() => {
        const loadFaceAPIModels = async () => {
            try {
                // En la implementación real descomenta estas líneas:
                // await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                // await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
                
                // Simulación de carga de modelos para este ejemplo
                await new Promise(resolve => setTimeout(resolve, 2000));
                setIsModelLoaded(true);
                console.log('Modelos de detección facial cargados correctamente');
            } catch (error) {
                console.error('Error cargando modelos de face-api.js:', error);
                showError('Error al cargar el sistema de detección facial');
            }
        };

        loadFaceAPIModels();
    }, []);

    // ===== FUNCIÓN DE DETECCIÓN FACIAL EN TIEMPO REAL =====
    const detectFaceRealTime = useCallback(async () => {
        if (!webcamRef.current || !webcamRef.current.video || !canvasRef.current) {
            return;
        }

        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        
        if (!video.videoWidth || !video.videoHeight) return;

        try {
            // ===== SIMULACIÓN DE DETECCIÓN (reemplazar con face-api.js real) =====
            // En la implementación real usar:
            // const detections = await faceapi
            //     .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            //     .withFaceLandmarks();

            // Simulación de detección facial
            const mockDetection = simulateFaceDetection(video.videoWidth, video.videoHeight);
            
            // Configurar canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (mockDetection) {
                const { box, distance, confidence } = mockDetection;
                
                // Determinar color y feedback basado en la distancia
                let boxColor, feedback;
                switch (distance) {
                    case 'close':
                        boxColor = '#ff4444';
                        feedback = '🔴 Aléjate un poco de la cámara';
                        break;
                    case 'far':
                        boxColor = '#ffaa00';
                        feedback = '🟡 Acércate más a la cámara';
                        break;
                    case 'optimal':
                        boxColor = '#44ff44';
                        feedback = '🟢 ¡Perfecto! Ya puedes capturar la foto';
                        break;
                    default:
                        boxColor = '#ffffff';
                        feedback = 'Posiciona tu rostro frente a la cámara';
                }

                // Dibujar rectángulo alrededor del rostro
                ctx.strokeStyle = boxColor;
                ctx.lineWidth = 4;
                ctx.strokeRect(box.x, box.y, box.width, box.height);

                // Actualizar estado
                setFaceStatus({
                    detected: true,
                    distance,
                    confidence,
                    feedback
                });
                
                setCanCaptureOptimal(distance === 'optimal' && confidence > 0.7);
                
            } else {
                // No se detectó rostro
                setFaceStatus({
                    detected: false,
                    distance: 'unknown',
                    confidence: 0,
                    feedback: 'No se detecta rostro. Posiciona tu cara frente a la cámara'
                });
                setCanCaptureOptimal(false);
            }
        } catch (error) {
            console.error('Error en detección facial en tiempo real:', error);
        }
    }, []);

    // ===== SIMULACIÓN DE DETECCIÓN FACIAL =====
    const simulateFaceDetection = (videoWidth, videoHeight) => {
        // Simulamos detección facial variando aleatoriamente
        const random = Math.random();
        
        // 20% de probabilidad de no detectar rostro
        if (random < 0.2) return null;
        
        const centerX = videoWidth / 2;
        const centerY = videoHeight / 2;
        
        // Simulamos diferentes tamaños de rostro
        const baseSize = Math.min(videoWidth, videoHeight) * 0.25;
        const sizeVariation = (Math.random() - 0.5) * 0.6; // -0.3 a +0.3
        const faceSize = baseSize + (baseSize * sizeVariation);
        
        const box = {
            x: centerX - faceSize / 2,
            y: centerY - faceSize / 2,
            width: faceSize,
            height: faceSize
        };
        
        // Determinar distancia basada en el tamaño
        const sizeRatio = faceSize / Math.min(videoWidth, videoHeight);
        let distance;
        
        if (sizeRatio > 0.4) {
            distance = 'close';
        } else if (sizeRatio < 0.2) {
            distance = 'far';
        } else {
            distance = 'optimal';
        }
        
        return {
            box,
            distance,
            confidence: Math.random() * 0.3 + 0.7 // 0.7 a 1.0
        };
    };

    // ===== INICIAR/DETENER DETECCIÓN EN TIEMPO REAL =====
    useEffect(() => {
        if (isModelLoaded && realTimeDetection && !capturedPhoto) {
            detectionIntervalRef.current = setInterval(detectFaceRealTime, 200);
            
            return () => {
                if (detectionIntervalRef.current) {
                    clearInterval(detectionIntervalRef.current);
                }
            };
        }
    }, [isModelLoaded, realTimeDetection, capturedPhoto, detectFaceRealTime]);

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
        if (!file) return; 
        if (!file.type.startsWith("image/")) {
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
    }; 
    
    const handleUploadPictures = async () => {
        if (user.pictures.length < 3 || user.pictures.length > 6) {
            showWarn("Debes subir entre 3 y 6 fotos.");
            return;
        }        
        // Validar cada archivo
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
        try {            
            // Guardar las fotos en local para enviar despues
            setSavedPhotos([...user.pictures]);
            setStepsCompleted(prev => ({ ...prev, photos: true }));
            console.log("Fotos guardadas localmente:", user.pictures);            
            // Simular un pequeño delay para mostrar el loading
            await new Promise(resolve => setTimeout(resolve, 500));

            showSuccess("¡Fotos guardadas correctamente!");
            setActiveIndex(prev => prev + 1);
        } finally {
            setUploadingPhotos(false);
        }
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
    }, []);

    const handleSavePreferences = async () => {
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
            }); 
            
            if (obligatoriasNoRespondidas.length > 0) {
                showWarn("Por favor responde todas las preguntas obligatorias marcadas con *.");
                return;
            }

            console.log("=== DEBUG RESPUESTAS ===");
            console.log("selectedAnswers:", selectedAnswers);
            console.log("itemsAboutMe:", itemsAboutMe);
            console.log("respuestas a enviar:", respuestas);
            console.log("Payload completo:", JSON.stringify({ respuestas }, null, 2));

            // Simular delay para mostrar loading
            await new Promise(resolve => setTimeout(resolve, 500));            
            // Guardamos las preferencias en un estado
            setSavedPreferences({ respuestas });
            setStepsCompleted(prev => ({ ...prev, preferences: true }));
            console.log("Preferencias guardadas localmente:", { respuestas })

            showSuccess("Preferencias guardadas correctamente.");
            setActiveIndex(prev => prev + 1);
        } catch (err) {
            console.error("Error al procesar preferencias:", err);
            showError(`Error al guardar preferencias: ${err.message}`);
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
        if (!ineImages[0] || !ineImages[1]) {
            showWarn('Debes subir ambas imágenes de la INE');
            return;
        }

        setValidatingIne(true);

        try {
            const formData = new FormData();
            formData.append('ine_front', ineImages[0]);
            formData.append('ine_back', ineImages[1]);

            const response = await api.post('validar-ine/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;

            if (data.success && data.ine_validada) {
                setMessage('¡INE validada exitosamente! Ahora valida tu identidad.');
                try {
                    setStepsCompleted(prev => ({ ...prev, ine: true }));
                    showSuccess("¡INE validada exitosamente! Ahora valida tu identidad.");
                    setActiveIndex(3); // Navigate to step 4 (Validación del rostro)
                } catch (uploadError) {
                    console.error("Error al subir datos después de validación:", uploadError);
                    setMessage(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    showWarn(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    setActiveIndex(4); // Still navigate to step 5 even if upload fails
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
                'Error desconocido'; 
            setMessage(`Error: ${errorMessage}`);
            showError(`Error detallado: ${JSON.stringify(error.response?.data, null, 2)}`);
        } finally {
            setValidatingIne(false);
        }
    };

    const handleValidacionRostro = async () => {
        if (!capturedPhoto) {
            showWarn('Debes capturar una imagen de tu rostro');
            return;
        }

        setValidatingFace(true);
        setValidationFeedback('');

        try {
            showInfo('Validando rostro, por favor espera...');
            
            const formData = new FormData();
            formData.append('ine_front', ineImages[0]);
            formData.append('selfie', dataURLtoFile(capturedPhoto, 'selfie.jpg'));

            const response = await api.post('validar-rostro/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            const data = response.data;

            if (data.success && data.rostro_validado) {
                // Validación exitosa
                setMessage('¡Rostro validado exitosamente! Ahora completa tu información personal.');
                try {
                    await uploadAllData();
                    setStepsCompleted(prev => ({ ...prev, face: true }));
                    showSuccess("¡Rostro validado exitosamente! Ahora completa tu información personal.");
                    setActiveIndex(4);
                } catch (uploadError) {
                    console.error("Error al subir datos después de validación:", uploadError);
                    setMessage(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    showWarn(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    setActiveIndex(4);
                }
            } else {
                // Validación falló
                handleValidationFailure(data);
            }

        } catch (error) {
            console.error('Error al validar rostro:', error);
            const errorData = error.response?.data;
            
            if (errorData) {
                handleValidationFailure(errorData);
            } else {
                setValidationAttempts(prev => prev + 1);
                showError('Error de conexión. Intenta nuevamente.');
                setValidationFeedback('Error de conexión. Verifica tu internet.');
            }
        } finally {
            setValidatingFace(false);
        }
    };

    const handleValidationFailure = (errorData) => {
        const newAttempts = validationAttempts + 1;
        setValidationAttempts(newAttempts);
        
        // Determinar el tipo de error y dar feedback específico
        const errorMessage = errorData.error || errorData.mensaje || '';
        let feedback = '';
        let shouldRetakePhoto = false;
        let shouldRetakeINE = false;
        
        if (errorMessage.includes('No se detectó rostro en la INE')) {
            feedback = 'No se detectó rostro en tu INE. Sube una imagen más clara de tu INE y toma una nueva foto.';
            shouldRetakeINE = true;
            shouldRetakePhoto = true;
            showWarn('La imagen de tu INE no es clara. Sube una nueva imagen y retoma la foto.');
        } else if (errorMessage.includes('No se detectó rostro en la imagen de la cámara')) {
            feedback = 'No se detectó tu rostro en la foto. Asegúrate de que tu cara esté bien visible y centrada.';
            shouldRetakePhoto = true;
            showWarn('No se detectó tu rostro. Retoma la foto asegurándote de que tu cara esté bien visible.');
        } else if (errorMessage.includes('Rostro demasiado cerca') || errorData.sugerencia?.includes('Aléjate')) {
            feedback = 'Tu rostro está demasiado cerca de la cámara. Aléjate un poco y retoma la foto.';
            shouldRetakePhoto = true;
            showWarn('Aléjate un poco de la cámara y retoma la foto.');
        } else if (errorMessage.includes('Rostro muy lejos') || errorData.sugerencia?.includes('Acércate')) {
            feedback = 'Tu rostro está muy lejos de la cámara. Acércate un poco y retoma la foto.';
            shouldRetakePhoto = true;
            showWarn('Acércate un poco más a la cámara y retoma la foto.');
        } else if (errorMessage.includes('no coincide') || errorMessage.includes('no match')) {
            feedback = 'Tu rostro no coincide con la foto de la INE. Asegúrate de que la iluminación sea buena y retoma la foto.';
            shouldRetakePhoto = true;
            showWarn('El rostro no coincide. Mejora la iluminación y retoma la foto.');
        } else {
            feedback = errorMessage || 'Error en la validación. Intenta nuevamente.';
            shouldRetakePhoto = true;
            showError(feedback);
        }
        
        setValidationFeedback(feedback);
        setCanRetakePhoto(shouldRetakePhoto);
        setCanRetakeINE(shouldRetakeINE);
        
        // Si ya agotó los 3 intentos, avanzar al siguiente paso
        if (newAttempts >= 3) {
            setTimeout(() => {
                showInfo('Has agotado los 3 intentos. Puedes validar tu perfil después.');
                setActiveIndex(4); // Avanzar al paso 5
            }, 2000);
        }
    };

    // ===== FUNCIONES MEJORADAS PARA CAPTURA DE FOTO =====
    const startFaceDetection = () => {
        if (!isModelLoaded) {
            showWarn('El sistema de detección aún se está cargando, espera un momento');
            return;
        }
        setRealTimeDetection(true);
        setValidationFeedback('');
    };

    const capturarImagenMejorada = () => {
        if (!faceStatus.detected) {
            showWarn('Espera a que se detecte tu rostro');
            return;
        }
        
        if (faceStatus.distance !== 'optimal') {
            showWarn('Posiciona tu rostro a la distancia correcta');
            return;
        }
        
        if (faceStatus.confidence < 0.7) {
            showWarn('Mejora la iluminación para una mejor detección');
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedPhoto(imageSrc);
        setUser(prev => ({ ...prev, facePhoto: imageSrc }));
        setRealTimeDetection(false);
        
        // Limpiar detección
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }
        
        showSuccess('¡Foto capturada correctamente!');
    };

    // Función para reiniciar la foto y limpiar el feedback
    const retakePhoto = () => {
        setCapturedPhoto(null);
        setUser(prev => ({ ...prev, facePhoto: null }));
        setValidationFeedback('');
        setCanRetakePhoto(false);
        setCanCaptureOptimal(false);
        setRealTimeDetection(false);
        setFaceStatus({
            detected: false,
            distance: 'unknown',
            confidence: 0,
            feedback: 'Posiciona tu rostro frente a la cámara'
        });
    };

    // Función para volver al paso anterior (INE) si es necesario
    const retakeINE = () => {
        setActiveIndex(2); // Volver al paso de INE
        setValidationFeedback('');
        setCanRetakeINE(false);
        setCanRetakePhoto(false);
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
        if (!curp_regex.test(curp.trim().toUpperCase())) {
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
        width: 640,
        height: 480
    };

    // Funciones para mostrar toasts
    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: message, life: 4000 });
    };

    const showInfo = (message) => {
        toast.current.show({ severity: 'info', summary: 'Información', detail: message, life: 4000 });
    };

    const showWarn = (message) => {
        toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: message, life: 4000 });
    };

    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 4000 });
    };

    const showSecondary = (message) => {
        toast.current.show({ severity: 'secondary', summary: 'Información', detail: message, life: 4000 });
    };

    const showContrast = (message) => {
        toast.current.show({ severity: 'contrast', summary: 'Completado', detail: message, life: 4000 });
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
        }
        return new File([u8arr], filename, { type: mime });
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

                    {/*===== VENTANA PARA VERIFICAR IDENTIDAD CON DETECCIÓN EN TIEMPO REAL =====*/}
                    {activeIndex === 3 && (
                        <div className='h-180'>
                            <h1 className="text-2xl font-bold">Verificar mi perfil</h1>
                            <p>Ahora, centra tu cara para verificar que la INE sea suya</p>
                            
                            {/* Indicador de carga de modelos */}
                            {!isModelLoaded && (
                                <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></svg>
                                        <span className="text-blue-700 text-sm">Cargando sistema de detección facial...</span>
                                    </div>
                                </div>
                            )}

                            <div className="w-full mt-2 items-center flex flex-col">
                                <div className="relative rounded-[30px] overflow-hidden border-4 border-purple-300 shadow-md">
                                    {!capturedPhoto ? (
                                        <>
                                            <Webcam
                                                ref={webcamRef}
                                                audio={false}
                                                screenshotFormat="image/jpeg"
                                                videoConstraints={videoConstraints}
                                                className="w-72 h-96 object-cover"
                                            />
                                            {/* Canvas para detección en tiempo real */}
                                            <canvas
                                                ref={canvasRef}
                                                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                                style={{ transform: 'scaleX(-1)' }}
                                            />
                                        </>
                                    ) : (
                                        <img src={capturedPhoto} alt="Captura" className="w-72 h-96 object-cover" />
                                    )}
                                </div>

                                {/* Feedback en tiempo real */}
                                {!capturedPhoto && realTimeDetection && (
                                    <div className={`mt-4 p-4 rounded-lg text-center max-w-xs transition-all duration-300 ${
                                        faceStatus.distance === 'optimal' ? 'bg-green-100 border-green-500 border-2' :
                                        faceStatus.distance === 'close' ? 'bg-red-100 border-red-500 border-2' :
                                        faceStatus.distance === 'far' ? 'bg-yellow-100 border-yellow-500 border-2' :
                                        'bg-gray-100 border-gray-400 border-2'
                                    }`}>
                                        <p className="font-semibold text-sm">{faceStatus.feedback}</p>
                                        {faceStatus.detected && (
                                            <p className="text-xs mt-1 text-gray-600">
                                                Confianza: {Math.round(faceStatus.confidence * 100)}%
                                            </p>
                                        )}
                                    </div>
                                )}

                                {!capturedPhoto ? (
                                    <>
                                        {!realTimeDetection ? (
                                            <button
                                                onClick={startFaceDetection}
                                                disabled={!isModelLoaded}
                                                className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                                            >
                                                {isModelLoaded ? 'Iniciar detección facial' : 'Cargando modelos...'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={capturarImagenMejorada}
                                                disabled={!canCaptureOptimal}
                                                className={`mt-4 w-16 h-16 rounded-full transition-all duration-300 ${
                                                    canCaptureOptimal
                                                        ? 'bg-green-500 hover:bg-green-600 shadow-lg transform hover:scale-105 animate-pulse'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                }`}
                                            />
                                        )}
                                        <p className="text-center mt-2 text-sm font-medium">
                                            {!realTimeDetection 
                                                ? 'Inicia la detección para continuar'
                                                : (canCaptureOptimal 
                                                    ? '✓ Toca para capturar la foto' 
                                                    : 'Posiciona tu rostro correctamente')
                                            }
                                        </p>
                                        {realTimeDetection && !faceStatus.detected && (
                                            <p className="text-center text-red-500 text-xs mt-1">
                                                ❌ No se detecta rostro
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center mt-4">
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={retakePhoto}
                                                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                                            >
                                                Retomar foto
                                            </button>
                                        </div>
                                        <p className="text-center text-green-600 mt-2 font-medium">✓ Imagen capturada correctamente</p>
                                    </div>
                                )}

                                {/* Información adicional y feedback de validación */}
                                {validationFeedback && (
                                    <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg max-w-xs">
                                        <p className="text-red-700 text-sm font-medium">{validationFeedback}</p>
                                        <div className="flex space-x-2 mt-2">
                                            {canRetakePhoto && (
                                                <button
                                                    onClick={retakePhoto}
                                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                                                >
                                                    Nueva foto
                                                </button>
                                            )}
                                            {canRetakeINE && (
                                                <button
                                                    onClick={retakeINE}
                                                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors"
                                                >
                                                    Nueva INE
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Instrucciones */}
                                <div className="mt-4 p-3 bg-white rounded-lg shadow-sm max-w-xs">
                                    <h4 className="font-semibold text-sm mb-2">💡 Consejos:</h4>
                                    <ul className="text-xs space-y-1 text-gray-600">
                                        <li>• Buena iluminación natural</li>
                                        <li>• Rostro centrado y visible</li>
                                        <li>• Sin lentes oscuros</li>
                                        <li>• Espera el marco verde</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}                 
                    
                    { activeIndex === 4 && (
                        <div className='h-180'>
                            <h1 className="text-2xl font-bold">Tu información</h1>
                            <p>Tu INE ha sido validada exitosamente.</p>
                            <p>Agrega los siguientes datos para finalizar tu registro.</p>

                            <div className="mt-6 space-y-4">
                                {/* Fecha de nacimiento */}
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-2">
                                        Fecha de nacimiento <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birthday}
                                        onChange={(e) => handleFormChange('birthday', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                                        required
                                    />
                                </div>

                                {/* Género */}
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-2">
                                        Género <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleFormChange('gender', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white"
                                        required
                                    >
                                        <option value="">Selecciona tu género</option>
                                        <option value="H">Hombre</option>
                                        <option value="M">Mujer</option>
                                        <option value="O">Otro</option>
                                    </select>
                                </div>

                                {/* Descripción */}
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-2">
                                        Descripción personal <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleFormChange('description', e.target.value)}
                                        placeholder="Cuéntanos un poco sobre ti..."
                                        rows={4}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
                                        required
                                    />
                                </div>

                                {/* CURP */}
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-2">
                                        CURP <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.curp}
                                        onChange={(e) => handleFormChange('curp', e.target.value.toUpperCase())}
                                        placeholder="Ingresa tu CURP (18 caracteres)"
                                        maxLength={18}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all uppercase"
                                        required
                                    />
                                    <small className="text-gray-600 mt-1">
                                        El CURP debe tener exactamente 18 caracteres
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
               
                <div className="mt-2 flex justify-center space-x-2 w-full mb-20 ">
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
                                'Validando INE'
                            )}
                        </Button>
                    ) : activeIndex === 3 ? (
                        <Button
                            className={buttonStyle}
                            onClick={handleValidacionRostro}
                            disabled={validatingFace}
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
                                'Validando identidad'
                            )}
                        </Button>
                        
                    ) : activeIndex === 4 ? (
                        <Button
                            className={buttonStyle}
                            onClick={handleSubmitInfo}
                            disabled={submittingInfo}
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
                            )}
                        </Button>
                    ) : null}
                </div>
            </div>
            <Toast ref={toast} position="bottom-center" />
        </div>
    );
};

export default Verificar;