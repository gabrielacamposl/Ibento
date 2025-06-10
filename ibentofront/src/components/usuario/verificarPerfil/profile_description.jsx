import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, CheckCircle, Upload, Plus, X } from 'lucide-react';
import api from "../../../api";
import { Toast } from 'primereact/toast';
import { curp_regex, patron_curp } from "../../../utils/regex";
// Agregar esta importación para face-api.js
// import * as faceapi from 'face-api.js';

const description = () => {
    const navigate = useNavigate();
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);

    // Estados de carga individuales para cada acción
    const [submittingInfo, setSubmittingInfo] = useState(false);
    
   
    // Estados para el formulario de información adicional (step 4)
    const [formData, setFormData] = useState({
        birthday: '',
        gender: '',
        description: '',
        curp: ''
    });
    
    
    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            // Redirige si no hay token
            navigate("/");
        }
        window.scrollTo(0, 0);
    }, []);

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
            showWarn('La fecha de nacimiento es requerida.');
            return false;
        }
        
        if (!gender) {
            showWarn('El género es requerido.');
            return false;
        }
        
        if (!description.trim()) {
            showWarn('La descripción es requerida.');
            return false;
        }
        
        if (!curp.trim()) {
            showWarn('El CURP es requerido.');
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
   

    // Funciones para mostrar toasts
    const showSuccess = (message) => {
        toast.current.show({severity:'success', summary: 'Éxito', detail: message, life: 4000});
    };


    const showWarn = (message) => {
        toast.current.show({severity:'warn', summary: 'Advertencia', detail: message, life: 4000});
    };

    const showError = (message) => {
        toast.current.show({severity:'error', summary: 'Error', detail: message, life: 4000});
    };

    

    const showContrast = (message) => {
        toast.current.show({severity:'contrast', summary: 'Completado', detail: message, life: 4000});
    };

    return (
        <div className="text-black min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
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
                                            <div className="relative">
                                                <select
                                                    value={formData.gender}
                                                    onChange={(e) => handleFormChange('gender', e.target.value)}
                                                    className="w-full px-4 py-3 pr-10 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none shadow-sm hover:border-purple-400"
                                                    required
                                                >
                                                    <option value="">Selecciona tu género</option>
                                                    <option value="H">Hombre</option>
                                                    <option value="M">Mujer</option>
                                                    <option value="O">Otro</option>
                                                </select>
                                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </span>
                                            </div>
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
                                    {/* <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                        <div className="flex items-center text-green-700">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            <span className="font-medium">¡Casi terminamos! Solo falta completar estos datos.</span>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-6">
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
                                'Subir información'
                            )}                        
                        </button> 
                        </div>
                   
                </div>
            </div>
        </div>
        <Toast ref={toast} position="bottom-center" />
    </div>
    );
};

export default description;