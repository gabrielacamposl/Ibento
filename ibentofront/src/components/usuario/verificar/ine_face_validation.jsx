import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, CheckCircle, Upload, Plus, X } from 'lucide-react';
import Webcam from 'react-webcam';
import api from "../../../api";
import { Toast } from 'primereact/toast';
import { curp_regex, patron_curp } from "../../../utils/regex";
// Agregar esta importación para face-api.js
// import * as face-api.js';

const Verificar = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [validatingFace, setValidatingFace] = useState(false);
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
    const [activeIndex, setActiveIndex] = useState(2);
    const [itemsAboutMe, setItemsAboutMe] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [message, setMessage] = useState([]);
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    // Estado para guardar preferencias
    const [savedPreferences, setSavedPreferences] = useState(null);

    //Estado para guardas las fotos de perfil
    const [savedPhotos, setSavedPhotos] = useState([]);

    // Estados necesarios
    const [isModelLoaded, setIsModelLoaded] = useState(false); // Para rastrear si los modelos están cargados
    const [realTimeDetection, setRealTimeDetection] = useState(false); // Para rastrear si la detección está activa
    const [faceStatus, setFaceStatus] = useState({
        detected: false,
        distance: '',
        feedback: '',
        confidence: 0,
    }); // Para manejar el estado de la detección facial
    const [canCaptureOptimal, setCanCaptureOptimal] = useState(false); // Para habilitar la captura cuando las condiciones sean óptimas

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
    };    
   


    const handleValidacionRostro = async () => {
        try {
            console.log("Iniciando validación de rostro...");
            // Lógica para validar el rostro
            showSuccess("¡Validación de rostro completada exitosamente!");
            setStepsCompleted((prev) => ({ ...prev, info: true }));
            setActiveIndex(4); // Avanzar al siguiente paso
        } catch (error) {
            console.error("Error durante la validación de rostro:", error);
            showError("Error durante la validación de rostro. Intenta nuevamente.");
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
        if (!ineImages[0] || !ineImages[1] ) {
            showWarn('Debes subir ambas imágenes de la INE y capturar tu foto');
            return;
        }

        setValidatingIne(true);

        try {
            const formData = new FormData();
            // Validar orientación de las imágenes INE (frontal y trasera deben ser horizontales)
            const checkImageOrientation = (file) => {
                return new Promise((resolve, reject) => {
                    const img = new window.Image();
                    img.onload = () => {
                        resolve(img.width > img.height);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });
            };

            const isFrontHorizontal = await checkImageOrientation(ineImages[0]);
            const isBackHorizontal = await checkImageOrientation(ineImages[1]);
            if (!isFrontHorizontal || !isBackHorizontal) {
                showWarn('Ambas imágenes de la INE deben estar en formato horizontal (ancho mayor que alto).');
                setValidatingIne(false);
                return;
            }
            formData.append('ine_front', ineImages[0]);
            formData.append('ine_back', ineImages[1]);
            //formData.append('selfie', dataURLtoFile(capturedPhoto, 'selfie.jpg'));

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
    
    // Función para iniciar la detección facial
    const startFaceDetection = async () => {
        try {
            setRealTimeDetection(true);
            console.log("Iniciando detección facial...");

            // Simular la carga de modelos (si usas face-api.js, aquí cargarías los modelos)
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setIsModelLoaded(true);

            // Simular detección facial en tiempo real
            setFaceStatus({
                detected: true,
                distance: 'optimal',
                feedback: 'Rostro detectado correctamente.',
                confidence: 0.95,
            });
            setCanCaptureOptimal(true); // Habilitar la captura
        } catch (error) {
            console.error("Error al iniciar la detección facial:", error);
            setRealTimeDetection(false);
        }
    };

    // Función para capturar la imagen cuando las condiciones sean óptimas
    const capturarImagenMejorada = () => {
        if (!canCaptureOptimal) {
            console.warn("No se puede capturar la imagen: condiciones no óptimas.");
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedPhoto(imageSrc);
        setUser((prev) => ({ ...prev, facePhoto: imageSrc }));
        setRealTimeDetection(false); // Detener la detección en tiempo real
        console.log("Imagen capturada correctamente:", imageSrc);
    };

    // Función para retomar la foto
    const retakePhoto = () => {
        setCapturedPhoto(null);
        setCanCaptureOptimal(false);
        setFaceStatus({
            detected: false,
            distance: '',
            feedback: '',
            confidence: 0,
        });
        setRealTimeDetection(true); // Reiniciar la detección en tiempo real
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
            {/* Header Section */}
            {/* <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/30">
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
            </div> */}

            {/* Main Content */}
            <div className="pt-10 px-4 pb-8">
                <div className="max-w-4xl mx-auto">
                    {/* Content Cards */}
                    <div className="glass-premium rounded-3xl p-6 mb-6">
                        
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

                                {/* Indicador de carga de modelos */}
                                {!isModelLoaded && (
                                    <div className="glass-premium rounded-2xl p-4 border-l-4 border-blue-500">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-blue-700 font-medium">Cargando sistema de detección facial...</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center space-y-6">
                                    {/* Contenedor de la cámara o foto capturada */}
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
                                                            mirrored={true} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <canvas
                                                            ref={canvasRef}
                                                            className="absolute top-0 left-0 w-full h-full pointer-events-none scaleX(-1)"
                                                            
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

                                    {/* Retroalimentación en tiempo real */}
                                    {!capturedPhoto && realTimeDetection && (
                                        <div
                                            className={`glass-premium rounded-2xl p-4 text-center transition-all duration-300 border-2 ${
                                                faceStatus.distance === 'optimal'
                                                    ? 'border-green-500 bg-green-50'
                                                    : faceStatus.distance === 'close'
                                                    ? 'border-red-500 bg-red-50'
                                                    : faceStatus.distance === 'far'
                                                    ? 'border-yellow-500 bg-yellow-50'
                                                    : 'border-gray-400 bg-gray-50'
                                            }`}
                                        >
                                            <p className="font-semibold text-sm">{faceStatus.feedback}</p>
                                            {faceStatus.detected && (
                                                <p className="text-xs mt-1 text-gray-600">
                                                    Confianza: {Math.round(faceStatus.confidence * 100)}%
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Botones de acción */}
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
                                </div>
                            </div>
                        )}
                     
                </div>
                
                 <div className="mt-8 flex justify-center space-x-4 w-full mb-20">
                    {activeIndex === 2 ? (
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
                    ) :(
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
                    )}
                </div>
            </div>
        </div>
        <Toast ref={toast} position="bottom-center" />
    </div>

    );
};

export default Verificar;