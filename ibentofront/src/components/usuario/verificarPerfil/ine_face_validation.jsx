import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, CheckCircle, Upload, Plus, X, RotateCcw, Check, Image, Crop, Clock, AlertTriangle } from 'lucide-react';
import Webcam from 'react-webcam';
import api from "../../../api";
import { Toast } from 'primereact/toast';

const VerifyProfile = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const toast = useRef(null);

    // REF PARA INE
    const ineWebcamRef = useRef(null);

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
    const [showVerifyLaterScreen, setShowVerifyLaterScreen] = useState(false);

    const [ineImages, setIneImages] = useState([null, null]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [message, setMessage] = useState([]);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [stepsCompleted, setStepsCompleted] = useState({ ine: false, face: false });

    // ESTADOS SIMPLIFICADOS PARA INE
    const [ineCapture, setIneCapture] = useState({
        showCamera: false,
        activeIndex: 0,
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

    // ===== FUNCIONES SIMPLIFICADAS PARA INE =====

    const startIneCapture = (index) => {
        setIneCapture({
            showCamera: true,
            activeIndex: index,
        });
    };

    const captureInePhoto = () => {
        if (!ineWebcamRef.current) return;

        const imageSrc = ineWebcamRef.current.getScreenshot();
        
        // Convertir a File y guardar directamente
        const file = dataURLtoFile(
            imageSrc,
            `ine_${ineCapture.activeIndex === 0 ? 'frontal' : 'trasera'}.jpg`
        );

        const newImages = [...ineImages];
        newImages[ineCapture.activeIndex] = file;
        setIneImages(newImages);

        const updatedUserINE = [...user.ine];
        updatedUserINE[ineCapture.activeIndex] = file;
        setUser(prev => ({ ...prev, ine: updatedUserINE }));

        // Cerrar cámara
        setIneCapture({
            showCamera: false,
            activeIndex: 0,
        });

        showSuccess('Imagen de INE guardada correctamente');
    };

    const handleGallerySelection = (e, index) => {
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

        // Guardar directamente la imagen seleccionada
        const newImages = [...ineImages];
        newImages[index] = file;
        setIneImages(newImages);

        const updatedUserINE = [...user.ine];
        updatedUserINE[index] = file;
        setUser(prev => ({ ...prev, ine: updatedUserINE }));

        // Limpiar el input
        e.target.value = '';
        
        showSuccess('Imagen seleccionada correctamente');
    };

    const cancelIneCapture = () => {
        setIneCapture({
            showCamera: false,
            activeIndex: 0,
        });
        showInfo('Captura cancelada');
    };

    const handleImageDeleteINE = (index) => {
        const newImages = [...ineImages];
        newImages[index] = null;
        setIneImages(newImages);

        const updatedUserINE = [...user.ine];
        updatedUserINE[index] = null;
        setUser(prev => ({ ...prev, ine: updatedUserINE }));

        showInfo('Imagen eliminada');
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
                showError(data.error || 'La validación falló. Revisa las imágenes.');
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

        // Verificar si ya se agotaron los intentos
        if (validationAttempts >= 3) {
            setShowVerifyLaterScreen(true);
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
                    navigate("/ibento/descripcion");
                } catch (uploadError) {
                    console.error("Error al subir datos después de validación:", uploadError);
                    setMessage(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    showWarn(`Validación exitosa pero error al subir datos: ${uploadError.message}`);
                    navigate("/ibento/descripcion");
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
                
                // Verificar si se agotaron los intentos después del error
                if (validationAttempts + 1 >= 3) {
                    setTimeout(() => {
                        setShowVerifyLaterScreen(true);
                    }, 2000);
                }
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
                setShowVerifyLaterScreen(true);
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

    // ===== FUNCIÓN PARA CONTINUAR SIN VERIFICAR =====
    const continueWithoutVerification = () => {
        showInfo('Puedes verificar tu perfil más tarde desde la configuración');
        navigate("../descripcion");
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


    // Función para saltar la validación y actualizar el estado en el backend
    const validarSkip = async () => {
        const token = localStorage.getItem("access");
        try {
            // Aquí mandamos los campos que espera tu endpoint
            const response = await api.post(
                'validar/',
                {
                    is_ine_validated: true,
                    is_validated_camera: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            if (response.status === 200) {
                showSuccess('Validación saltada exitosamente');
                setTimeout(() => {
                    navigate('../descripcion');
                }, 1000);
            } else {
                showError('Error al saltar la validación: ' + (response.data?.error || ''));
            }
        } catch (error) {
            console.error('Error al saltar validación:', error);
            showError('Error al saltar validación: ' + (error.response?.data?.error || error.message));
        }
    };

    

    // ===== PANTALLA DE VERIFICAR MÁS TARDE =====
    if (showVerifyLaterScreen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="glass-premium rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl w-fit mx-auto mb-6">
                        <Clock className="w-12 h-12 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Verificar más tarde
                    </h2>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Has agotado tus 3 intentos de verificación facial. No te preocupes, puedes verificar tu perfil más tarde desde la configuración de tu cuenta.
                    </p>
                    
                    <div className="glass-premium rounded-2xl p-4 mb-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-center mb-2">
                            <AlertTriangle className="w-5 h-5 text-blue-500 mr-2" />
                            <span className="font-semibold text-blue-700">Importante</span>
                        </div>
                        <p className="text-sm text-blue-600">
                            Tu perfil tendrá verificación pendiente hasta que completes este proceso.
                        </p>
                    </div>
                    
                    <button
                        onClick={continueWithoutVerification}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                    >
                        Continuar con mi perfil
                    </button>
                    
                    <p className="text-xs text-gray-500 mt-4">
                        Podrás intentar nuevamente en 24 horas
                    </p>
                </div>
            </div>
        );
    }


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

                        {/* STEP 1: INE VERIFICATION SIMPLIFICADO */}
                        {activeIndex === 0 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl w-fit mx-auto mb-4">
                                        <Shield className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifica tu identidad</h2>
                                    <p className="text-gray-600">Captura o selecciona fotos claras de ambos lados de tu INE</p>
                                </div>

                                {/* Modal de Cámara Simplificado */}
                                {ineCapture.showCamera && (
                                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-3xl p-6 max-w-md w-full">
                                            <div className="text-center mb-4">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                    Capturar INE {ineCapture.activeIndex === 0 ? 'Frontal' : 'Trasera'}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    Centra tu INE dentro del recuadro
                                                </p>
                                            </div>

                                            <div className="relative mb-6">
                                                <div className="aspect-[3/2] bg-gray-100 rounded-2xl overflow-hidden relative">
                                                    <Webcam
                                                        ref={ineWebcamRef}
                                                        audio={false}
                                                        screenshotFormat="image/jpeg"
                                                        videoConstraints={ineVideoConstraints}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-[80%] h-[70%] border-4 rounded-2xl shadow-lg">
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                                                                Centra tu INE aquí
                                                            </div>
                                                            {/* <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-yellow-400"></div>
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-yellow-400"></div>
                                                            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-yellow-400"></div>
                                                            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-yellow-400"></div> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={cancelIneCapture}
                                                    className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                                                    type="button"
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    onClick={captureInePhoto}
                                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                                    type="button"
                                                >
                                                    <Camera className="w-5 h-5" />
                                                    <span>Capturar</span>
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
                                                            type="button"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>Imagen cargada</span>
                                                        </div>
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

                                            {!ineImages[index] && (
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => startIneCapture(index)}
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
                                                            onChange={(e) => handleGallerySelection(e, index)}
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
                                    
                                    {/* Contador de intentos */}
                                    <div className="mt-4 inline-flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                                        <span className="text-blue-600 text-sm font-medium">
                                            Intento {validationAttempts + 1} de 3
                                        </span>
                                    </div>
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
                                                        mirrored={false}
                                                        style={{ transform: 'scaleX(-1)' }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={capturedPhoto}
                                                        alt="Captura"
                                                        className="w-full h-full object-cover"
                                                        style={{ transform: 'scaleX(-1)' }}
                                                    />
                                                )}
                                                
                                                {/* Overlay con guía facial */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-48 h-64 border-4 border-green-400 rounded-full opacity-50">
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-400 text-white px-2 py-1 rounded text-xs font-bold">
                                                            Centra tu rostro
                                                        </div>
                                                    </div>
                                                </div>
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


                        <button
                            onClick={() => validarSkip()}
                            
                            className="px-8 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
                            type="button"
                        >
                            Saltar Paso
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
                                disabled={validatingFace || !capturedPhoto || validationAttempts >= 3}
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
        </div>
    );
};

export default VerifyProfile;