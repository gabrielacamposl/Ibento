import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, CheckCircle, Upload, Plus, X, RotateCcw, Check, Image, Crop } from 'lucide-react';
import Webcam from 'react-webcam';
import api from "../../../api";
import { Toast } from 'primereact/toast';

const VerifyProfile = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const toast = useRef(null);

    // REFS PARA INE
    const ineWebcamRef = useRef(null);
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

    const [ineImages, setIneImages] = useState([null, null]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [message, setMessage] = useState([]);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [stepsCompleted, setStepsCompleted] = useState({ ine: false, face: false });

    // ESTADOS PARA INE CON 4 PUNTOS - ACTUALIZADO
    const [ineCapture, setIneCapture] = useState({
        mode: null,
        activeIndex: 0,
        showCamera: false,
        capturedImage: null,
        showCrop: false,
        selectedFromGallery: null,
        cropData: {
            topLeft: { x: 50, y: 50 },
            topRight: { x: 300, y: 50 },
            bottomLeft: { x: 50, y: 200 },
            bottomRight: { x: 300, y: 200 },
            dragging: null,
            imageSize: { width: 0, height: 0 }
        }
    });

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
            navigate("/login");
        }
        window.scrollTo(0, 0);
    }, []);

    // ===== FUNCIONES PARA INE CON 4 PUNTOS =====

    const startIneCapture = (mode, index) => {
        setIneCapture(prev => ({
            ...prev,
            mode,
            activeIndex: index,
            showCamera: mode === 'camera',
            showCrop: false,
            capturedImage: null,
            selectedFromGallery: null,
            cropData: {
                topLeft: { x: 50, y: 50 },
                topRight: { x: 300, y: 50 },
                bottomLeft: { x: 50, y: 200 },
                bottomRight: { x: 300, y: 200 },
                dragging: null,
                imageSize: { width: 0, height: 0 }
            }
        }));
    };

    const captureInePhoto = () => {
        if (!ineWebcamRef.current) return;

        const imageSrc = ineWebcamRef.current.getScreenshot();
        setIneCapture(prev => ({
            ...prev,
            capturedImage: imageSrc,
            showCamera: false
        }));
    };

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

        resetIneCaptureWithHandles();
        showSuccess('Imagen de INE guardada correctamente');
    };

    // ===== FUNCIONES PARA EL SISTEMA DE 4 PUNTOS =====

    const initializeCropPoints = (imageElement) => {
        if (!imageElement) return;
        
        const rect = imageElement.getBoundingClientRect();
        const idealAspectRatio = 1.6; // Proporción común para INE/ID
        const padding = 30;
        
        // Calcular dimensiones iniciales manteniendo la proporción
        let width = rect.width - (padding * 2);
        let height = width / idealAspectRatio;
        
        // Ajustar si la altura es demasiado grande
        if (height > rect.height - (padding * 2)) {
            height = rect.height - (padding * 2);
            width = height * idealAspectRatio;
        }
        
        const left = (rect.width - width) / 2;
        const top = (rect.height - height) / 2;
        
        setIneCapture(prev => ({
            ...prev,
            cropData: {
                ...prev.cropData,
                topLeft: { x: left, y: top },
                topRight: { x: left + width, y: top },
                bottomLeft: { x: left, y: top + height },
                bottomRight: { x: left + width, y: top + height },
                imageSize: { width: rect.width, height: rect.height },
                aspectRatio: idealAspectRatio
            }
        }));
    };

    const startDragHandle = (e, handleType) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIneCapture(prev => ({
            ...prev,
            cropData: {
                ...prev.cropData,
                dragging: handleType
            }
        }));
    };

    const updateDragHandle = (e) => {
        if (!ineCapture.cropData.dragging || !cropImageRef.current) return;
        
        const rect = cropImageRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        
        const { dragging, aspectRatio } = ineCapture.cropData;
        const newCropData = { ...ineCapture.cropData };
        
        // Actualizar la posición del punto arrastrado
        newCropData[dragging] = { x, y };
        
        // Mantener proporción al arrastrar las esquinas
        if (aspectRatio) {
            const opposite = {
                topLeft: 'bottomRight',
                topRight: 'bottomLeft',
                bottomLeft: 'topRight',
                bottomRight: 'topLeft'
            };
            
            const anchor = newCropData[opposite[dragging]];
            const width = Math.abs(x - anchor.x);
            const height = width / aspectRatio;
            
            // Calcular nueva posición manteniendo la proporción
            if (dragging.includes('top')) {
                newCropData[dragging].y = anchor.y - height;
            } else {
                newCropData[dragging].y = anchor.y + height;
            }
        }
        
        // Aplicar los cambios
        setIneCapture(prev => ({
            ...prev,
            cropData: newCropData
        }));
        
        e.preventDefault();
    };

    const endDragHandle = (e) => {
        setIneCapture(prev => ({
            ...prev,
            cropData: {
                ...prev.cropData,
                dragging: null
            }
        }));
        
        e?.preventDefault();
    };

    const getCropRectangle = () => {
        const { topLeft, topRight, bottomLeft, bottomRight } = ineCapture.cropData;
        
        const minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
        const maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
        const minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
        const maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };

    const confirmCropWithHandles = async () => {
        console.log('Iniciando crop con handles...');
        
        if (!cropCanvasRef.current || !cropImageRef.current) {
            showError('Error: Referencias no disponibles');
            return;
        }

        const rect = getCropRectangle();
        
        // Validar tamaño mínimo y proporción
        if (rect.width < 100 || rect.height < 100) {
            showWarn('El área seleccionada es demasiado pequeña. Debe ser al menos 100x100 píxeles.');
            return;
        }

        const currentAspectRatio = rect.width / rect.height;
        const idealAspectRatio = 1.6;
        const tolerance = 0.2;

        if (Math.abs(currentAspectRatio - idealAspectRatio) > tolerance) {
            showWarn(`La proporción debe ser cercana a ${idealAspectRatio}:1 para una INE. Ajusta los puntos.`);
            return;
        }

        try {
            const canvas = cropCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = cropImageRef.current;
            
            // Calcular la escala para mantener la calidad
            const scaleX = img.naturalWidth / img.offsetWidth;
            const scaleY = img.naturalHeight / img.offsetHeight;
            
            const cropX = rect.x * scaleX;
            const cropY = rect.y * scaleY;
            const cropWidth = rect.width * scaleX;
            const cropHeight = rect.height * scaleY;
            
            // Ajustar el tamaño del canvas para mantener la calidad
            canvas.width = cropWidth;
            canvas.height = cropHeight;
            
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            
            tempImg.onload = () => {
                try {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Dibujar con suavizado
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    ctx.drawImage(
                        tempImg,
                        cropX, cropY, cropWidth, cropHeight,
                        0, 0, cropWidth, cropHeight
                    );
                    
                    // Convertir a blob con alta calidad
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            showError('Error al crear la imagen recortada');
                            return;
                        }
                        
                        const file = new File([blob], `ine_${ineCapture.activeIndex === 0 ? 'frontal' : 'trasera'}.jpg`, {
                            type: 'image/jpeg'
                        });
                        
                        const newImages = [...ineImages];
                        newImages[ineCapture.activeIndex] = file;
                        setIneImages(newImages);
                        
                        const updatedUserINE = [...user.ine];
                        updatedUserINE[ineCapture.activeIndex] = file;
                        setUser(prev => ({ ...prev, ine: updatedUserINE }));
                        
                        resetIneCaptureWithHandles();
                        showSuccess('Imagen recortada y optimizada correctamente');
                    }, 'image/jpeg', 0.95); // Aumentar calidad a 95%
                    
                } catch (error) {
                    console.error('Error al procesar imagen:', error);
                    showError('Error al procesar la imagen');
                }
            };
            
            tempImg.onerror = () => {
                showError('Error al cargar la imagen');
            };
            
            tempImg.src = ineCapture.selectedFromGallery;
            
        } catch (error) {
            console.error('Error en crop:', error);
            showError('Error al procesar el recorte');
        }
    };

    const handleGallerySelectionWithHandles = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Por favor selecciona una imagen válida');
            e.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showError('La imagen es demasiado grande. Máximo 10MB');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
            setIneCapture(prev => ({
                ...prev,
                activeIndex: index,
                selectedFromGallery: event.target.result,
                showCrop: true,
                mode: 'gallery',
                capturedImage: null,
                showCamera: false
            }));
            
            setTimeout(() => {
                if (cropImageRef.current) {
                    initializeCropPoints(cropImageRef.current);
                }
            }, 100);
        };
        
        reader.onerror = () => {
            showError('Error al cargar la imagen');
            e.target.value = '';
        };
        
        reader.readAsDataURL(file);
    };

    const resetIneCaptureWithHandles = () => {
        setIneCapture({
            mode: null,
            activeIndex: 0,
            showCamera: false,
            capturedImage: null,
            showCrop: false,
            selectedFromGallery: null,
            cropData: {
                topLeft: { x: 50, y: 50 },
                topRight: { x: 300, y: 50 },
                bottomLeft: { x: 50, y: 200 },
                bottomRight: { x: 300, y: 200 },
                dragging: null,
                imageSize: { width: 0, height: 0 }
            }
        });
        
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => input.value = '');
        
        showInfo('Operación cancelada');
    };

    const handleImageDeleteINE = (index) => {
        const newImages = [...ineImages];
        newImages[index] = null;
        setIneImages(newImages);

        const updatedUserINE = [...user.ine];
        updatedUserINE[index] = null;
        setUser(prev => ({ ...prev, ine: updatedUserINE }));
    };

    // ===== VALIDACIÓN DE INE =====
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
                    setActiveIndex(1);
                } catch (uploadError) {
                    console.error("Error al subir datos después de validación:", uploadError);
                    setMessage(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    showWarn(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    setActiveIndex(1);
                }
            } else {
                setMessage(data.error || 'La validación falló. Revisa las imágenes.');
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Error desconocido';
            setMessage(`Error: ${errorMessage}`);
            showError(`Error: ${errorMessage}`);
        } finally {
            setValidatingIne(false);
        }
    };

    // ===== VALIDACIÓN DE ROSTRO =====
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
                setMessage('¡Rostro validado exitosamente! Ahora completa tu información personal.');
                try {
                    await uploadAllData();
                    setStepsCompleted(prev => ({ ...prev, face: true }));
                    showSuccess("¡Rostro validado exitosamente!");
                    setActiveIndex(2);
                } catch (uploadError) {
                    console.error("Error al subir datos después de validación:", uploadError);
                    setMessage(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    showWarn(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    setActiveIndex(2);
                }
            } else {
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

        if (newAttempts >= 3) {
            setTimeout(() => {
                showInfo('Has agotado los 3 intentos. Puedes validar tu perfil después.');
                setActiveIndex(2);
            }, 2000);
        }
    };

    // ===== CAPTURA DE FOTO =====
    const capturarImagen = () => {
        if (!webcamRef.current) {
            showWarn('La cámara no está disponible');
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedPhoto(imageSrc);
        setUser(prev => ({ ...prev, facePhoto: imageSrc }));
        showSuccess('¡Foto capturada correctamente!');
    };

    const retakePhoto = () => {
        setCapturedPhoto(null);
        setUser(prev => ({ ...prev, facePhoto: null }));
        setValidationFeedback('');
        setCanRetakePhoto(false);
    };

    const retakeINE = () => {
        setActiveIndex(0);
        setValidationFeedback('');
        setCanRetakeINE(false);
        setCanRetakePhoto(false);
    };

    // ===== CONFIGURACIONES DE CÁMARA =====
    const videoConstraints = {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 }
    };

    const ineVideoConstraints = {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
    };

    // ===== FUNCIONES DE TOAST =====
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

    // ===== FUNCIONES AUXILIARES =====
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

    const uploadAllData = async () => {
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
                    <div className="glass-premium rounded-3xl p-6 mb-6">

                        {/* STEP 1: INE VERIFICATION CON 4 PUNTOS */}
                        {activeIndex === 0 && (
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
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-[80%] h-[70%] border-4 border-yellow-400 rounded-2xl shadow-lg">
                                                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                                                                        Centra tu INE aquí
                                                                    </div>
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
                                                    onClick={resetIneCaptureWithHandles}
                                                    className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                                                    type="button"
                                                >
                                                    Cancelar
                                                </button>

                                                {!ineCapture.capturedImage ? (
                                                    <button
                                                        onClick={captureInePhoto}
                                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                                        type="button"
                                                    >
                                                        <Camera className="w-5 h-5" />
                                                        <span>Capturar</span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setIneCapture(prev => ({ ...prev, capturedImage: null }))}
                                                            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors flex items-center justify-center"
                                                            type="button"
                                                        >
                                                            <RotateCcw className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={confirmIneCapture}
                                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                                            type="button"
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

                                {/* Modal de Crop con 4 Puntos */}
                                {ineCapture.showCrop && ineCapture.selectedFromGallery && (
                                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[95vh] overflow-auto">
                                            <div className="text-center mb-4">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                    Ajustar INE {ineCapture.activeIndex === 0 ? 'Frontal' : 'Trasera'}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    Arrastra los 4 puntos azules para seleccionar el área de tu INE
                                                </p>
                                            </div>

                                            <div className="relative mb-6 bg-gray-100 rounded-2xl overflow-hidden">
                                                <img
                                                    ref={cropImageRef}
                                                    src={ineCapture.selectedFromGallery}
                                                    alt="Imagen a recortar"
                                                    className="w-full h-auto max-h-96 object-contain select-none"
                                                    onLoad={() => {
                                                        if (cropImageRef.current) {
                                                            initializeCropPoints(cropImageRef.current);
                                                        }
                                                    }}
                                                    onMouseMove={updateDragHandle}
                                                    onMouseUp={endDragHandle}
                                                    onMouseLeave={endDragHandle}
                                                    onDragStart={(e) => e.preventDefault()}
                                                    draggable={false}
                                                    style={{
                                                        userSelect: 'none',
                                                        WebkitUserSelect: 'none',
                                                        MozUserSelect: 'none',
                                                        msUserSelect: 'none'
                                                    }}
                                                />

                                                {ineCapture.cropData.imageSize.width > 0 && (
                                                    <>
                                                        {/* Área seleccionada */}
                                                        <div
                                                            className="absolute border-2 border-blue-400 bg-blue-400/10 pointer-events-none"
                                                            style={{
                                                                left: getCropRectangle().x,
                                                                top: getCropRectangle().y,
                                                                width: getCropRectangle().width,
                                                                height: getCropRectangle().height,
                                                            }}
                                                        >
                                                            <div className="absolute inset-0">
                                                                {/* Guías horizontales */}
                                                                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50"></div>
                                                                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50"></div>
                                                                
                                                                {/* Guías verticales */}
                                                                <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/50"></div>
                                                                <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/50"></div>
                                                                
                                                                {/* Líneas de borde con efecto de destello */}
                                                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/20 via-blue-400 to-blue-400/20 animate-pulse"></div>
                                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/20 via-blue-400 to-blue-400/20 animate-pulse"></div>
                                                                <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-blue-400/20 via-blue-400 to-blue-400/20 animate-pulse"></div>
                                                                <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-gradient-to-b from-blue-400/20 via-blue-400 to-blue-400/20 animate-pulse"></div>
                                                            </div>

                                                            {/* Indicador de proporción */}
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                                                {(getCropRectangle().width / getCropRectangle().height).toFixed(2)}:1
                                                            </div>
                                                        </div>

                                                        {/* Handle 1: Superior izquierda */}
                                                        <div
                                                            className={`absolute w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-2.5 -translate-y-2.5 hover:scale-110 transition-transform ${ineCapture.cropData.dragging === 'topLeft' ? 'scale-125 ring-2 ring-blue-300 ring-opacity-50' : ''
                                                                }`}
                                                            style={{
                                                                left: ineCapture.cropData.topLeft.x,
                                                                top: ineCapture.cropData.topLeft.y,
                                                                zIndex: 10
                                                            }}
                                                            onMouseDown={(e) => startDragHandle(e, 'topLeft')}
                                                        >
                                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                                1
                                                            </div>
                                                        </div>

                                                        {/* Handle 2: Superior derecha */}
                                                        <div
                                                            className={`absolute w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-2.5 -translate-y-2.5 hover:scale-110 transition-transform ${ineCapture.cropData.dragging === 'topRight' ? 'scale-125 ring-2 ring-blue-300 ring-opacity-50' : ''
                                                                }`}
                                                            style={{
                                                                left: ineCapture.cropData.topRight.x,
                                                                top: ineCapture.cropData.topRight.y,
                                                                zIndex: 10
                                                            }}
                                                            onMouseDown={(e) => startDragHandle(e, 'topRight')}
                                                        >
                                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                                2
                                                            </div>
                                                        </div>

                                                        {/* Handle 3: Inferior izquierda */}
                                                        <div
                                                            className={`absolute w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-2.5 -translate-y-2.5 hover:scale-110 transition-transform ${ineCapture.cropData.dragging === 'bottomLeft' ? 'scale-125 ring-2 ring-blue-300 ring-opacity-50' : ''
                                                                }`}
                                                            style={{
                                                                left: ineCapture.cropData.bottomLeft.x,
                                                                top: ineCapture.cropData.bottomLeft.y,
                                                                zIndex: 10
                                                            }}
                                                            onMouseDown={(e) => startDragHandle(e, 'bottomLeft')}
                                                        >
                                                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                                3
                                                            </div>
                                                        </div>

                                                        {/* Handle 4: Inferior derecha */}
                                                        <div
                                                            className={`absolute w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-2.5 -translate-y-2.5 hover:scale-110 transition-transform ${ineCapture.cropData.dragging === 'bottomRight' ? 'scale-125 ring-2 ring-blue-300 ring-opacity-50' : ''
                                                                }`}
                                                            style={{
                                                                left: ineCapture.cropData.bottomRight.x,
                                                                top: ineCapture.cropData.bottomRight.y,
                                                                zIndex: 10
                                                            }}
                                                            onMouseDown={(e) => startDragHandle(e, 'bottomRight')}
                                                        >
                                                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                                4
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {ineCapture.cropData.imageSize.width === 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                                                            Cargando herramientas de recorte...
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información del área */}
                                            <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-blue-700">Área:</span>
                                                        <span className="ml-2 text-blue-600">
                                                            {getCropRectangle().width.toFixed(0)} × {getCropRectangle().height.toFixed(0)} px
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-blue-700">Proporción:</span>
                                                        <span className="ml-2 text-blue-600">
                                                            {(getCropRectangle().width / getCropRectangle().height).toFixed(2)}:1
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botones */}
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={resetIneCaptureWithHandles}
                                                    className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
                                                    type="button"
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        if (cropImageRef.current) {
                                                            initializeCropPoints(cropImageRef.current);
                                                        }
                                                    }}
                                                    className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors font-medium"
                                                    type="button"
                                                >
                                                    Reiniciar
                                                </button>

                                                <button
                                                    onClick={confirmCropWithHandles}
                                                    disabled={getCropRectangle().width < 20 || getCropRectangle().height < 20}
                                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
                                                    type="button"
                                                >
                                                    <Crop className="w-5 h-5" />
                                                    <span>Recortar</span>
                                                </button>
                                            </div>

                                            {/* Consejos */}
                                            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                                    <span className="mr-2">💡</span>
                                                    Consejos:
                                                </h4>
                                                <ul className="text-xs text-gray-600 space-y-1">
                                                    <li>• Arrastra los 4 puntos azules para ajustar el área</li>
                                                    <li>• Incluye toda la información importante de la INE</li>
                                                    <li>• La imagen debe ser clara y legible</li>
                                                    <li>• Usa "Reiniciar" para volver a centrar los puntos</li>
                                                </ul>
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
                                                            type="button"
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

                                            {/* Botones de acción - ACTUALIZADO */}
                                            {!ineImages[index] && (
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => startIneCapture('camera', index)}
                                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                                        type="button"
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
                                                            onChange={(e) => handleGallerySelectionWithHandles(e, index)}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {message && (
                                    <div className="glass-premium rounded-2xl p-4 border-l-4 border-blue-500">
                                        <p className="text-blue-700 font-medium">{message}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: FACE VERIFICATION */}
                        {activeIndex === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl w-fit mx-auto mb-4">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificación facial</h2>
                                    <p className="text-gray-600">Centra tu cara para verificar que la INE sea tuya</p>
                                </div>

                                <div className="flex flex-col items-center space-y-6">
                                    <div className="relative">
                                        <div className="glass-premium rounded-3xl p-4 shadow-2xl">
                                            <div className="relative rounded-2xl overflow-hidden w-80 h-96 bg-gray-100">
                                                {!capturedPhoto ? (
                                                    <Webcam
                                                        ref={webcamRef}
                                                        audio={false}
                                                        screenshotFormat="image/jpeg"
                                                        videoConstraints={videoConstraints}
                                                        className="w-full h-full object-cover"
                                                        style={{ transform: 'scaleX(-1)' }}
                                                        mirrored={true}
                                                    />
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

                                    {!capturedPhoto ? (
                                        <div className="flex flex-col items-center space-y-4">
                                            <button
                                                onClick={capturarImagen}
                                                className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 hover:scale-110 shadow-lg rounded-full transition-all duration-300 flex items-center justify-center"
                                                type="button"
                                            >
                                                <Camera className="w-8 h-8 text-white" />
                                            </button>
                                            <p className="text-center text-sm font-medium text-gray-600">
                                                Toca para capturar tu foto
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-4">
                                            <button
                                                onClick={retakePhoto}
                                                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl transition-colors duration-300"
                                                type="button"
                                            >
                                                Retomar foto
                                            </button>
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium">Imagen capturada correctamente</span>
                                            </div>
                                        </div>
                                    )}

                                    {validationFeedback && (
                                        <div className="glass-premium rounded-2xl p-4 border-l-4 border-red-500 bg-red-50">
                                            <p className="text-red-700 font-medium mb-3">{validationFeedback}</p>
                                            <div className="flex space-x-3">
                                                {canRetakePhoto && (
                                                    <button
                                                        onClick={retakePhoto}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors"
                                                        type="button"
                                                    >
                                                        Nueva foto
                                                    </button>
                                                )}
                                                {canRetakeINE && (
                                                    <button
                                                        onClick={retakeINE}
                                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm transition-colors"
                                                        type="button"
                                                    >
                                                        Nueva INE
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

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
                                                Mantén la cabeza quieta
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
                            type="button"
                        >
                            Anterior
                        </button>

                        {activeIndex === 0 ? (
                            <button
                                onClick={handleIneValidation}
                                disabled={validatingIne}
                                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                                type="button"
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
                        ) : activeIndex === 1 ? (
                            <button
                                onClick={handleValidacionRostro}
                                disabled={validatingFace || !capturedPhoto}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                                type="button"
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

            <canvas
                ref={cropCanvasRef}
                className="hidden"
                width="800"
                height="600"
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default VerifyProfile;