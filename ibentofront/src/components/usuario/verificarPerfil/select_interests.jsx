import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, CheckCircle, Upload, Plus, X } from 'lucide-react';
import Webcam from 'react-webcam';
import api from "../../../api";
import { Toast } from 'primereact/toast';
import { curp_regex, patron_curp } from "../../../utils/regex";
// Agregar esta importación para face-api.js
// import * as face-api.js;

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

   


    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            // Redirige si no hay token
            navigate("/");
        }
        window.scrollTo(0, 0);
    }, []);

   
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

            // Guardar las preferencias localmente
            setSavedPreferences({ respuestas });
            // setStepsCompleted(prev => ({ ...prev, preferences: true }));
            console.log("Preferencias guardadas localmente:", { respuestas });

            // Subir las preferencias al servidor
            const response = await api.post("intereses-respuestas/", { respuestas });
            console.log("Respuesta del servidor:", response.data);
            if (response.status == 200) {
                showSuccess("Preferencias guardadas correctamente.");
                 setTimeout(() => {
                    navigate("../eventos");
                }, 2000);
            }
            // setActiveIndex(prev => prev + 1);
        } catch (err) {
            console.error("Error al procesar preferencias:", err);
            showError(`Error al guardar preferencias: ${err.message}`);
        } finally {
            setSavingPreferences(false);
        }
    };

 

    //------------------------- VALIDACIÓN Y COMPARACIÓN DE ROSTRO -------------------
  
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
                            <p className="text-sm text-gray-600">Paso {5} de {5}</p>
                        </div>
                    </div>

                    <div className="w-12 h-12 flex items-center justify-center">
                        {/* <div className="relative w-10 h-10">
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
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-24 px-4 pb-8">
                <div className="max-w-4xl mx-auto">
                    {/* Content Cards */}
                    <div className="glass-premium rounded-3xl p-6 mb-6">
                        
                                         {/* STEP 2: INTERESTS */}
                      
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
                                    
                        
                        <div className="mt-8 flex justify-center space-x-4 w-full mb-20">
                    
                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                        Anterior
                    </button>
                   

                    
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
                    
                </div>x
                </div>
                
                 
            </div>
        </div>
        <Toast ref={toast} position="bottom-center" />
    </div>
    );
};

export default Verificar;