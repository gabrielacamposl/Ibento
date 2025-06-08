import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, CheckCircle, Upload, Plus, X, RotateCcw, Check, Image, Crop } from 'lucide-react';
import Webcam from 'react-webcam';
import api from "../../api";
import { Toast } from 'primereact/toast';
//import * as faceapi from '@vladmandic/face-api';

const VerifyProfile = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const canvasRef = useRef(null); //Canvas de detección facial
    const toast = useRef(null);
    const detectionIntervalRef = useRef(null); // Intervalo de detección

    const ineWebcamRef = useRef(null); // Cámara de INE
    const cropCanvasRef = useRef(null);
    const cropImageRef = useRef(null);
    
    const [user, setUser] = useState({
        ine: [],
        facePhoto: null,
    });

    const [loading, setLoading] = useState(false);

    // Estados de carga individuales para cada acción
    const [validatingIne, setValidatingIne] = useState(false);
    const [validatingFace, setValidatingFace] = useState(false);
    
    // Estados para la validación de rostro
    const [validationAttempts, setValidationAttempts] = useState(0);
    const [validationFeedback, setValidationFeedback] = useState('');
    const [canRetakePhoto, setCanRetakePhoto] = useState(false);
    const [canRetakeINE, setCanRetakeINE] = useState(false);
    
    // ===== ESTADOS PARA DETECCIÓN FACIAL EN TIEMPO REAL =====
    const [faceStatus, setFaceStatus] = useState({
        detected: false,
        distance: 'unknown',
        confidence: 0,
        feedback: 'Posiciona tu rostro frente a la cámara'
    });
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [realTimeDetection, setRealTimeDetection] = useState(false);
    const [canCaptureOptimal, setCanCaptureOptimal] = useState(false);

    const [ineImages, setIneImages] = useState([null, null]);
    const [activeIndex, setActiveIndex] = useState(0); // Para testing 2, cambiar a 0 en producción
    const [message, setMessage] = useState([]);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [stepsCompleted, setStepsCompleted] = useState({ ine: false, face: false });

    // ===== NUEVOS ESTADOS PARA INE MEJORADA =====
    const [ineCapture, setIneCapture] = useState({
        mode: null, // 'camera' | 'gallery' | null
        activeIndex: 0, // 0 para frontal, 1 para trasera
        showCamera: false,
        capturedImage: null,
        showCrop: false,
        selectedFromGallery: null,
        cropData: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            isDragging: false,
            startX: 0,
            startY: 0
        }
    });

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
                console.log('Iniciando carga de modelos de face-api.js...');
                
                // Cargar modelos necesarios desde la carpeta public/models
                await Promise.all([
                    window.faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                    window.faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
                ]);
                
                setIsModelLoaded(true);
                console.log('✅ Modelos de face-api.js cargados correctamente');
                showSuccess('Sistema de detección facial listo');
            } catch (error) {
                console.error('❌ Error cargando modelos de face-api.js:', error);
                showError('Error al cargar el sistema de detección facial. Verifica que los modelos estén en /public/models');
                
                // Como fallback, usar simulación
                console.log('🔄 Usando modo simulación...');
                setTimeout(() => {
                    setIsModelLoaded(true);
                }, 1000);
            }
        };

        loadFaceAPIModels();
    }, []);

    // ===== FUNCIÓN DE DETECCIÓN FACIAL EN TIEMPO REAL =====
    const detectFaceRealTime = useCallback(async () => {
        if (!webcamRef.current || !webcamRef.current.video || !canvasRef.current || !isModelLoaded) {
            return;
        }

        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        
        if (!video.videoWidth || !video.videoHeight) return;

        try {
            // ===== DETECCIÓN REAL CON FACE-API.JS =====
            const detections = await window.faceapi
                .detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions({
                    inputSize: 416,
                    scoreThreshold: 0.5
                }))
                .withFaceLandmarks();

            // Configurar canvas
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            window.faceapi.matchDimensions(canvas, displaySize);
            
            // Limpiar canvas anterior
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detections.length > 0) {
                // Tomar la primera detección (la más confiable)
                const detection = detections[0];
                const box = detection.detection.box;
                const confidence = detection.detection.score;
                
                // Analizar distancia basada en el tamaño de la caja de detección
                const faceSize = Math.max(box.width, box.height);
                const videoSize = Math.min(video.videoWidth, video.videoHeight);
                const sizeRatio = faceSize / videoSize;
                
                let distance, boxColor, feedback;
                
                if (sizeRatio > 0.45) {
                    distance = 'close';
                    boxColor = '#ff4444';
                    feedback = '🔴 Aléjate un poco de la cámara';
                } else if (sizeRatio < 0.25) {
                    distance = 'far';
                    boxColor = '#ffaa00';
                    feedback = '🟡 Acércate más a la cámara';
                } else {
                    distance = 'optimal';
                    boxColor = '#44ff44';
                    feedback = '🟢 ¡Perfecto! Ya puedes capturar la foto';
                }

                // Dibujar rectángulo alrededor del rostro
                ctx.strokeStyle = boxColor;
                ctx.lineWidth = 4;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
                
                // Dibujar puntos de landmarks (opcional)
                if (detection.landmarks) {
                    ctx.fillStyle = boxColor;
                    detection.landmarks.positions.forEach(point => {
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                        ctx.fill();
                    });
                }

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
            // Fallback a simulación en caso de error
            const mockDetection = simulateFaceDetection(video.videoWidth, video.videoHeight);
            if (mockDetection) {
                const { box, distance, confidence } = mockDetection;
                
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

                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = boxColor;
                ctx.lineWidth = 4;
                ctx.strokeRect(box.x, box.y, box.width, box.height);

                setFaceStatus({
                    detected: true,
                    distance,
                    confidence,
                    feedback
                });
                
                setCanCaptureOptimal(distance === 'optimal' && confidence > 0.7);
            }
        }
    }, [isModelLoaded]);

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
            // Usar un intervalo más optimizado para face-api.js
            detectionIntervalRef.current = setInterval(detectFaceRealTime, 300); // 300ms para mejor rendimiento
            
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

    // ===== NUEVAS FUNCIONES PARA INE MEJORADA =====
    
    // Iniciar captura de INE
    const startIneCapture = (mode, index) => {
        setIneCapture(prev => ({
            ...prev,
            mode,
            activeIndex: index,
            showCamera: mode === 'camera',
            showCrop: false,
            capturedImage: null,
            selectedFromGallery: null
        }));
    };

    // Capturar imagen desde cámara
    const captureInePhoto = () => {
        if (!ineWebcamRef.current) return;
        
        const imageSrc = ineWebcamRef.current.getScreenshot();
        setIneCapture(prev => ({
            ...prev,
            capturedImage: imageSrc,
            showCamera: false
        }));
    };

    // Confirmar imagen capturada desde cámara
    const confirmIneCapture = () => {
        if (!ineCapture.capturedImage) return;

        const newImages = [...ineImages];
        newImages[ineCapture.activeIndex] = dataURLtoFile(
            ineCapture.capturedImage, 
            `ine_${ineCapture.activeIndex === 0 ? 'frontal' : 'trasera'}.jpg`
        );
        setIneImages(newImages);

        const updatedUserINE = [...user.ine];
        updatedUserINE[ineCapture.activeIndex] = newImages[ineCapture.activeIndex];
        setUser(prev => ({ ...prev, ine: updatedUserINE }));

        resetIneCapture();
        showSuccess('Imagen de INE guardada correctamente');
    };

    // Manejar selección desde galería
    const handleGallerySelection = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setIneCapture(prev => ({
                    ...prev,
                    selectedFromGallery: event.target.result,
                    showCrop: true,
                    mode: 'gallery'
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Funciones de crop
    const startCrop = (e) => {
        if (!cropImageRef.current) return;
        
        const rect = cropImageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setIneCapture(prev => ({
            ...prev,
            cropData: {
                ...prev.cropData,
                isDragging: true,
                startX: x,
                startY: y,
                x: x,
                y: y,
                width: 0,
                height: 0
            }
        }));
    };

    const updateCrop = (e) => {
        if (!ineCapture.cropData.isDragging || !cropImageRef.current) return;
        
        const rect = cropImageRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const width = currentX - ineCapture.cropData.startX;
        const height = currentY - ineCapture.cropData.startY;
        
        setIneCapture(prev => ({
            ...prev,
            cropData: {
                ...prev.cropData,
                width: width,
                height: height
            }
        }));
    };

    const endCrop = () => {
        setIneCapture(prev => ({
            ...prev,
            cropData: {
                ...prev.cropData,
                isDragging: false
            }
        }));
    };

    // Confirmar crop
    const confirmCrop = () => {
        if (!cropCanvasRef.current || !cropImageRef.current) return;

        const canvas = cropCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = cropImageRef.current;
        
        const { x, y, width, height } = ineCapture.cropData;
        
        // Asegurar que el crop sea válido
        if (width <= 0 || height <= 0) {
            showWarn('Selecciona un área válida para recortar');
            return;
        }

        // Calcular ratios para el crop
        const scaleX = img.naturalWidth / img.offsetWidth;
        const scaleY = img.naturalHeight / img.offsetHeight;
        
        const cropX = x * scaleX;
        const cropY = y * scaleY;
        const cropWidth = width * scaleX;
        const cropHeight = height * scaleY;

        // Configurar canvas
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Crear imagen temporal para cargar
        const tempImg = new Image();
        tempImg.onload = () => {
            ctx.drawImage(
                tempImg,
                cropX, cropY, cropWidth, cropHeight,
                0, 0, cropWidth, cropHeight
            );

            // Convertir a blob y crear archivo
            canvas.toBlob((blob) => {
                const file = new File([blob], `ine_${ineCapture.activeIndex === 0 ? 'frontal' : 'trasera'}.jpg`, {
                    type: 'image/jpeg'
                });

                const newImages = [...ineImages];
                newImages[ineCapture.activeIndex] = file;
                setIneImages(newImages);

                const updatedUserINE = [...user.ine];
                updatedUserINE[ineCapture.activeIndex] = file;
                setUser(prev => ({ ...prev, ine: updatedUserINE }));

                resetIneCapture();
                showSuccess('Imagen recortada y guardada correctamente');
            }, 'image/jpeg', 0.9);
        };
        
        tempImg.src = ineCapture.selectedFromGallery;
    };

    // Resetear captura de INE
    const resetIneCapture = () => {
        setIneCapture({
            mode: null,
            activeIndex: 0,
            showCamera: false,
            capturedImage: null,
            showCrop: false,
            selectedFromGallery: null,
            cropData: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                isDragging: false,
                startX: 0,
                startY: 0
            }
        });
    };

    // Eliminar imagen de INE (MODIFICADA para usar la nueva estructura)
    const handleImageDeleteINE = (index) => {
        const newImages = [...ineImages];
        newImages[index] = null;
        setIneImages(newImages);

        const updatedUserINE = [...user.ine];
        updatedUserINE[index] = null;
        setUser(prev => ({ ...prev, ine: updatedUserINE }));
    };

    // -------- Validar imagenes de INE (MANTENIDA ORIGINAL)
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

    // ===== FUNCIONES MANTENIDAS ORIGINALES =====
    
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
        
        showInfo('Iniciando detección facial en tiempo real...');
        setRealTimeDetection(true);
        setValidationFeedback('');
        
        // Reset face status
        setFaceStatus({
            detected: false,
            distance: 'unknown',
            confidence: 0,
            feedback: 'Buscando rostro...'
        });
    };

    const capturarImagenMejorada = () => {
        if (!faceStatus.detected) {
            showWarn('Espera a que se detecte tu rostro.');
            return;
        }
        
        if (faceStatus.distance !== 'optimal') {
            showWarn('Posiciona tu rostro a la distancia correcta.');
            return;
        }
        
        if (faceStatus.confidence < 0.7) {
            showWarn('Mejora la iluminación para una mejor detección');
            return;
        }

        // Capturar imagen normal (sin espejo) para validación
        const video = webcamRef.current.video;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Dibujar la imagen sin efecto espejo
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        
        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
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

    //------------------------- VALIDACIÓN Y COMPARACIÓN DE ROSTRO -------------------
    // -------- Capturar imagen con cámara
    const videoConstraints = {
        facingMode: "user", // Usa la cámara frontal para rostro
        width: { ideal: 640 }, // Resolución optimizada para face-api.js
        height: { ideal: 480 },
        frameRate: { ideal: 30, max: 30 } // Frame rate optimizado
    };

    // Configuración de cámara para INE (mayor resolución para OCR)
    const ineVideoConstraints = {
        facingMode: "environment", // Cámara trasera para INE
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
    };

    // Funciones para mostrar toasts (MANTENIDAS ORIGINALES)
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

    // Función auxiliar para convertir dataURL a File (MANTENIDA ORIGINAL)
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

    // Función uploadAllData (placeholder - agregar tu implementación)
    const uploadAllData = async () => {
        // Implementar tu lógica de subida de datos aquí
        console.log('Subiendo todos los datos...');
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
                        
                        {/* STEP 3: INE VERIFICATION MEJORADA */}
                        {activeIndex === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl w-fit mx-auto mb-4">
                                        <Shield className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifica tu identidad</h2>
                                    <p className="text-gray-600">Captura o selecciona fotos claras de ambos lados de tu INE</p>
                                </div>

                                {/* Modal de Cámara */}
                                {ineCapture.showCamera && (
                                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-3xl p-6 max-w-md w-full">
                                            <div className="text-center mb-4">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                    Capturar INE {ineCapture.activeIndex === 0 ? 'Frontal' : 'Trasera'}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    Centra tu INE dentro del recuadro amarillo
                                                </p>
                                            </div>

                                            <div className="relative mb-6">
                                                <div className="aspect-[3/2] bg-gray-100 rounded-2xl overflow-hidden relative">
                                                    {!ineCapture.capturedImage ? (
                                                        <>
                                                            <Webcam
                                                                ref={ineWebcamRef}
                                                                audio={false}
                                                                screenshotFormat="image/jpeg"
                                                                videoConstraints={ineVideoConstraints}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {/* Overlay de centrado */}
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-[80%] h-[70%] border-4 border-yellow-400 rounded-2xl shadow-lg">
                                                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                                                                        Centra tu INE aquí
                                                                    </div>
                                                                    {/* Esquinas para guía */}
                                                                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-yellow-400"></div>
                                                                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-yellow-400"></div>
                                                                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-yellow-400"></div>
                                                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-yellow-400"></div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <img 
                                                            src={ineCapture.capturedImage} 
                                                            alt="INE Capturada" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={resetIneCapture}
                                                    className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                
                                                {!ineCapture.capturedImage ? (
                                                    <button
                                                        onClick={captureInePhoto}
                                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                                    >
                                                        <Camera className="w-5 h-5" />
                                                        <span>Capturar</span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setIneCapture(prev => ({ ...prev, capturedImage: null }))}
                                                            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors flex items-center justify-center"
                                                        >
                                                            <RotateCcw className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={confirmIneCapture}
                                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                            <span>Confirmar</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Modal de Crop */}
                                {ineCapture.showCrop && ineCapture.selectedFromGallery && (
                                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
                                            <div className="text-center mb-4">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                    Recortar INE {ineCapture.activeIndex === 0 ? 'Frontal' : 'Trasera'}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    Arrastra para seleccionar el área de la INE
                                                </p>
                                            </div>

                                            <div className="relative mb-6 bg-gray-100 rounded-2xl overflow-hidden">
                                                <img
                                                    ref={cropImageRef}
                                                    src={ineCapture.selectedFromGallery}
                                                    alt="Imagen a recortar"
                                                    className="w-full h-auto max-h-96 object-contain cursor-crosshair"
                                                    onMouseDown={startCrop}
                                                    onMouseMove={updateCrop}
                                                    onMouseUp={endCrop}
                                                    onMouseLeave={endCrop}
                                                    draggable={false}
                                                />
                                                
                                                {/* Overlay de selección */}
                                                {ineCapture.cropData.width !== 0 && ineCapture.cropData.height !== 0 && (
                                                    <div
                                                        className="absolute border-2 border-yellow-400 bg-yellow-400/20 pointer-events-none"
                                                        style={{
                                                            left: Math.min(ineCapture.cropData.x, ineCapture.cropData.x + ineCapture.cropData.width),
                                                            top: Math.min(ineCapture.cropData.y, ineCapture.cropData.y + ineCapture.cropData.height),
                                                            width: Math.abs(ineCapture.cropData.width),
                                                            height: Math.abs(ineCapture.cropData.height)
                                                        }}
                                                    >
                                                        <div className="absolute -top-6 left-0 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                                                            Área seleccionada
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={resetIneCapture}
                                                    className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                
                                                <button
                                                    onClick={confirmCrop}
                                                    disabled={ineCapture.cropData.width === 0 || ineCapture.cropData.height === 0}
                                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                                >
                                                    <Crop className="w-5 h-5" />
                                                    <span>Recortar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Grid de imágenes INE */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Array.from({ length: 2 }).map((_, index) => (
                                        <div key={index} className="glass-premium rounded-2xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                                {index === 0 ? 'Parte frontal' : 'Parte trasera'}
                                            </h3>
                                            
                                            <div className="relative w-full aspect-[3/2] border-2 border-dashed border-purple-200 rounded-2xl overflow-hidden hover:border-purple-400 transition-colors duration-300 mb-4">
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
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-purple-600">
                                                        <Upload className="w-8 h-8 mb-2" />
                                                        <span className="text-sm font-medium text-center px-4">
                                                            Agregar {index === 0 ? 'frontal' : 'trasera'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botones de acción */}
                                            {!ineImages[index] && (
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => startIneCapture('camera', index)}
                                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                                    >
                                                        <Camera className="w-4 h-4" />
                                                        <span className="text-sm">Cámara</span>
                                                    </button>
                                                    
                                                    <label className="flex-1 cursor-pointer">
                                                        <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2">
                                                            <Image className="w-4 h-4" />
                                                            <span className="text-sm">Galería</span>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                setIneCapture(prev => ({ ...prev, activeIndex: index }));
                                                                handleGallerySelection(e);
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Guía de tips */}
                                <div className="glass-premium rounded-2xl p-6 max-w-md mx-auto">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center">
                                        <span className="mr-2">💡</span>
                                        Consejos para mejores resultados
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                            Usa buena iluminación natural
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                            Superficie plana y lisa
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                            INE sin doblez ni rayaduras
                                        </li>
                                        <li className="flex items-center">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                            Evita sombras y reflejos
                                        </li>
                                    </ul>
                                </div>

                                {message && (
                                    <div className="glass-premium rounded-2xl p-4 border-l-4 border-blue-500">
                                        <p className="text-blue-700 font-medium">{message}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: FACE VERIFICATION (MANTENIDA ORIGINAL) */}
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
                                            <div>
                                                <span className="text-blue-700 font-medium block">Cargando sistema de detección facial...</span>
                                                <span className="text-blue-600 text-xs">Descargando modelos de IA</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-blue-600">
                                            <strong>Nota:</strong> Asegúrate de tener los modelos de face-api.js en /public/models:
                                            <ul className="list-disc list-inside mt-1 ml-2">
                                                <li>tiny_face_detector_model-weights_manifest.json</li>
                                                <li>face_landmark_68_model-weights_manifest.json</li>
                                                <li>face_recognition_model-weights_manifest.json</li>
                                                <li>ssd_mobilenetv1_model-weights_manifest.json</li>
                                            </ul>
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
                                                            style={{ transform: 'scaleX(-1)' }}
                                                            mirrored={true}
                                                        />
                                                        <canvas
                                                            ref={canvasRef}
                                                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                                            style={{ transform: 'scaleX(-1)' }}
                                                        />
                                                        
                                                        {/* Overlay de estado de detección */}
                                                        {realTimeDetection && (
                                                            <div className="absolute top-2 left-2 right-2">
                                                                <div className={`px-3 py-2 rounded-xl text-xs font-medium text-center ${
                                                                    faceStatus.distance === 'optimal' ? 'bg-green-500 text-white' :
                                                                    faceStatus.distance === 'close' ? 'bg-red-500 text-white' :
                                                                    faceStatus.distance === 'far' ? 'bg-yellow-500 text-black' :
                                                                    'bg-gray-500 text-white'
                                                                }`}>
                                                                    {faceStatus.detected ? (
                                                                        <>
                                                                            {faceStatus.distance === 'optimal' ? '✓ ' : ''}
                                                                            Rostro detectado - {Math.round(faceStatus.confidence * 100)}%
                                                                        </>
                                                                    ) : (
                                                                        'Buscando rostro...'
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <img 
                                                        src={capturedPhoto} 
                                                        alt="Captura" 
                                                        className="w-full h-full object-cover"
                                                        style={{ transform: 'scaleX(-1)' }}
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
                      
                </div>
                
                 <div className="mt-8 flex justify-center space-x-4 w-full mb-20">
                    <button
                        onClick={() => setActiveIndex(prev => prev - 1)}
                        disabled={activeIndex === 0}
                        className="px-8 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                        Anterior
                    </button>

                    { activeIndex === 2 ? (
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
                        
                    ) : null}
                </div>
            </div>
        </div>
        <Toast ref={toast} position="bottom-center" />
        
        {/* Canvas oculto para crop */}
        <canvas ref={cropCanvasRef} className="hidden" />
    </div>
    );
};

export default VerifyProfile;