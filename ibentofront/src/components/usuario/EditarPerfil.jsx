import React, { useState, useEffect, use } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { buttonStyle, inputStyles } from "../../styles/styles";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ArrowLeft, Upload, X, User, Calendar, Camera } from 'lucide-react';
import apiaxios from "../../axiosConfig";
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './../../assets/components/LoadingSpinner';

const EditarPerfil = () => {
    const navigate = useNavigate();
    const [userPerfil, setUserPerfil] = useState({ profile_pic: [] })
    const [categorias, setCategorias] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);

    const [cumpleanos, setCumpleanos] = useState('');
    const [genero, setGenero] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fotos, setFotos] = useState([]);
    const [itemsAboutMe, setItemsAboutMe] = useState([]);
    const [myAwnsers, setMyAwnsers] = useState([]);    const [selectedAnswers, setSelectedAnswers] = useState({});

    const [loading, setLoading] = useState(true);
      // Estados para validaciones
    const [errors, setErrors] = useState({
        nombre: '',
        apellido: '',
        cumpleanos: ''
    });
    
    // Estado para el botón de guardar cambios
    const [isSaving, setIsSaving] = useState(false);// Función para validar solo letras, acentos y espacios
    const validateLettersOnly = (value) => {
        // Permite letras (incluyendo acentos), espacios, y caracteres especiales del español
        const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/;
        // También validar que no sea solo espacios
        return regex.test(value) && value.trim().length > 0;
    };

    // Función para validar edad mínima de 18 años
    const validateAge = (birthday) => {
        if (!birthday) return false;
        
        const today = new Date();
        const birthDate = new Date(birthday);
        
        // Verificar formato de fecha válido
        if (isNaN(birthDate.getTime())) return false;
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    };

    // Función para manejar cambios en el nombre
    const handleNombreChange = (value) => {
        if (value === '' || validateLettersOnly(value)) {
            setNombre(value);
            setErrors(prev => ({ ...prev, nombre: '' }));
        } else {
            setErrors(prev => ({ 
                ...prev, 
                nombre: 'El nombre solo puede contener letras, acentos y espacios' 
            }));
        }
    };

    // Función para manejar cambios en el apellido
    const handleApellidoChange = (value) => {
        if (value === '' || validateLettersOnly(value)) {
            setApellido(value);
            setErrors(prev => ({ ...prev, apellido: '' }));
        } else {
            setErrors(prev => ({ 
                ...prev, 
                apellido: 'El apellido solo puede contener letras, acentos y espacios' 
            }));
        }
    };

    // Función para manejar cambios en la fecha de cumpleaños
    const handleCumpleanosChange = (value) => {
        setCumpleanos(value);
        
        if (value === '') {
            setErrors(prev => ({ ...prev, cumpleanos: '' }));
            return;
        }

        if (!validateAge(value)) {
            setErrors(prev => ({ 
                ...prev, 
                cumpleanos: 'Debes ser mayor de 18 años' 
            }));
        } else {
            setErrors(prev => ({ ...prev, cumpleanos: '' }));
        }
    };
    // Función para obtener categorías de eventos
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await apiaxios.get('eventos/categorias/');
                const categoriasFormateadas = res.data.map(cat => ({
                    id: cat._id,
                    nombre: cat.nombre,
                    valores: cat.subcategorias.map(sub => sub.nombre_subcategoria),
                }));
                setCategorias(categoriasFormateadas);
                console.log("categorias", categoriasFormateadas);
            } catch (err) {
                console.error('Error al obtener categorías:', err);
            }
        };
        fetchCategorias();
    }, []);

    // Función para manejar la selección y deselección de eventos
    const toggleSeleccionado = (valor) => {
        setSelectedEvents((prevSelected) => {
            if (prevSelected.includes(valor)) {
                // Si el valor ya está seleccionado, lo quitamos
                return prevSelected.filter((item) => item !== valor);
            } else {
                // Si no está seleccionado, lo agregamos
                return [...prevSelected, valor];
            }
        });
    };

    useEffect(() => {
        const Perfil = async () => {
            try {
                const token = localStorage.getItem('access'); // Obtén el token JWT del almacenamiento local
                const response = await api.get('usuarios/info_to_edit/', {
                    headers: {
                        'Authorization': `Bearer ${token}`

                    }
                });

                if (response.status === 200) {
                    setUserPerfil(response.data);

                    setFotos(response.data.profile_pic);

                    setDescripcion(response.data.description);
                    setSelectedEvents(response.data.preferencias_evento);
                    setGenero(response.data.gender);

                    const respuestas = response.data.preferencias_generales || [];
                    const transformado = respuestas.reduce((acc, curr) => {
                        acc[curr.categoria_id] = curr.respuesta;
                        return acc;
                    }, {});
                    setSelectedAnswers(transformado);

                    setMyAwnsers(response.data.preferencias_generales);
                    console.log("Perfil de usuario:", response.data);

                } else {
                    console.error("Error al obtener perfil");
                }
            } catch (error) {
                console.error("Error al obtener perfil:", error);
            }
            finally {
                setLoading(false); // Cambiar el estado de loading a false una vez que se haya cargado el perfil
            }
        };
        Perfil();
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await api.get('categorias-perfil/');

                setItemsAboutMe(response.data);

            } catch (error) {
                console.error("Error al cargar las preguntas", error);
            }
        };
        fetchQuestions();
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-50">
                <LoadingSpinner
                    logoSrc="/ibento_logo.png"
                    loadingText="Cargando información de perfil"
                />
            </div>
        )
    }

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newFotos = [...fotos];
            newFotos[index] = file;
            setFotos(newFotos);
        }
    };


    const handleImageDelete = (index) => {
        const newFotos = fotos.filter((_, i) => i !== index);
        setFotos(newFotos);
    };

    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (file && fotos.length < 6) {
            setFotos([...fotos, file]);
        }
    };








    //Convertir la fecha de cumpleaños AAAA-MM-DD a edad
    const calculateAge = (birthday) => {
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };    const handleSubmit = async () => {
        const token = localStorage.getItem('access');
        
        if (!token) {
            alert("No se encontró token de autenticación");
            return;
        }

        // Validar todos los campos antes de enviar
        let hasValidationErrors = false;
        let newErrors = { nombre: '', apellido: '', cumpleanos: '' };

        // Validar nombre si se ha modificado
        if (nombre && !validateLettersOnly(nombre)) {
            newErrors.nombre = 'El nombre solo puede contener letras, acentos y espacios';
            hasValidationErrors = true;
        }

        // Validar apellido si se ha modificado
        if (apellido && !validateLettersOnly(apellido)) {
            newErrors.apellido = 'El apellido solo puede contener letras, acentos y espacios';
            hasValidationErrors = true;
        }

        // Validar fecha de nacimiento si se ha modificado
        if (cumpleanos && !validateAge(cumpleanos)) {
            newErrors.cumpleanos = 'Debes ser mayor de 18 años';
            hasValidationErrors = true;
        }

        // Verificar si hay errores existentes
        if (errors.nombre || errors.apellido || errors.cumpleanos) {
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            setErrors(newErrors);
            alert("Por favor corrige los errores en el formulario antes de continuar.");
            return;
        }

        // Establecer estado de carga
        setIsSaving(true);

        try {
            const respuestas = Object.entries(selectedAnswers).map(([categoria_id, respuesta]) => ({
                categoria_id,
                respuesta: respuesta.length === 1 ? respuesta[0] : respuesta
            }));

            // Validación: asegurarse de que todas las obligatorias estén contestadas
            const obligatoriasNoRespondidas = itemsAboutMe.filter(item => {
                return !item.optional && !(selectedAnswers[item._id]?.length > 0);
            });

            if (userPerfil.preferencias_generales?.length > 0 && obligatoriasNoRespondidas.length > 0) {
                alert("Por favor responde todas las preguntas obligatorias marcadas con *.");
                return;
            }

            const formData = new FormData();
            
            // Solo agregar imágenes si hay cambios en las fotos
            // Verificar si hay nuevas imágenes (archivos File) o cambios en las existentes
            const hasNewImages = fotos.some(foto => foto instanceof File);
            const hasImageChanges = JSON.stringify(fotos) !== JSON.stringify(userPerfil.profile_pic);
            
            if (hasNewImages || hasImageChanges) {
                fotos.forEach((picture) => {
                    formData.append("pictures", picture);
                });
            }

            // Agregar solo los campos que han cambiado
            if (nombre && nombre !== userPerfil.nombre) {
                formData.append("nombre", nombre);
            }
            
            if (apellido && apellido !== userPerfil.apellido) {
                formData.append("apellido", apellido);
            }
            
            if (cumpleanos && cumpleanos !== userPerfil.birthday) {
                formData.append("birthday", cumpleanos);
            }
            
            if (genero && genero !== userPerfil.gender) {
                const genderValue = genero === "H" ? "H" : genero === "M" ? "M" : genero;
                formData.append("gender", genderValue);
            }
            
            if (descripcion !== undefined && descripcion !== userPerfil.description) {
                formData.append("description", descripcion);
            }

            // Siempre enviar preferencias_evento si han cambiado
            if (JSON.stringify(selectedEvents) !== JSON.stringify(userPerfil.preferencias_evento)) {
                formData.append("preferencias_evento", JSON.stringify(selectedEvents));
            }

            // Solo enviar preferencias_generales si hay respuestas y han cambiado
            if (respuestas.length > 0) {
                const currentPreferencias = JSON.stringify(userPerfil.preferencias_generales || []);
                const newPreferencias = JSON.stringify(respuestas);
                if (currentPreferencias !== newPreferencias) {
                    formData.append("preferencias_generales", newPreferencias);
                }
            }

            // Verificar si hay algo que actualizar
            let hasChanges = false;
            for (let pair of formData.entries()) {
                hasChanges = true;
                break;
            }

            if (!hasChanges) {
                alert("No se detectaron cambios para actualizar.");
                return;
            }

            console.log("Datos a enviar:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? 'File object' : pair[1]));
            }

            const response = await api.patch('perfil/actualizar/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                console.log("Perfil actualizado:", response.data);
                setLoading(true);
                setTimeout(() => navigate('../perfil'), 2000);
            } else {
                console.error("Error al actualizar perfil");
                alert("Error al actualizar el perfil. Inténtalo de nuevo.");
            }        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            alert("Error al actualizar el perfil: " + (error.response?.data?.error || error.message));
        } finally {
            // Restablecer estado de carga
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header con navegación */}
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 p-6 pb-8">
                <div className="flex items-center justify-between">
                    <Link
                        to="../perfil"
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">Editar Perfil</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="relative px-6 -mt-4">
                {/* Perfil photo section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <img
                                src={userPerfil.profile_pic[0] ? userPerfil.profile_pic[0] : '/profile_empty.webp'}
                                className="w-28 h-28 rounded-full object-cover border-4 border-gradient-to-r from-purple-400 to-blue-400 shadow-lg"
                                alt={userPerfil.nombre}
                            />
                        </div>
                    </div>

                    {/* Información básica */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">                            <div>                                <label className="flex items-center text-gray-700 font-semibold mb-2">
                                    <User className="w-4 h-4 mr-2 text-purple-500" />
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 ${
                                        errors.nombre 
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100' 
                                        : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                                    }`}
                                    defaultValue={userPerfil.nombre}
                                    onChange={(e) => handleNombreChange(e.target.value)}
                                    placeholder="Ej: María José"
                                />
                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.nombre}
                                    </p>
                                )}
                                {!errors.nombre && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Solo se permiten letras, acentos y espacios
                                    </p>
                                )}
                            </div>

                            <div>                                <label className="flex items-center text-gray-700 font-semibold mb-2">
                                    <User className="w-4 h-4 mr-2 text-purple-500" />
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 ${
                                        errors.apellido 
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100' 
                                        : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                                    }`}
                                    defaultValue={userPerfil.apellido}
                                    onChange={(e) => handleApellidoChange(e.target.value)}
                                    placeholder="Ej: García López"
                                />
                                {errors.apellido && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.apellido}
                                    </p>
                                )}
                                {!errors.apellido && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Solo se permiten letras, acentos y espacios
                                    </p>
                                )}
                            </div>
                        </div>
                        {userPerfil.gender != "" && userPerfil.birthday != null && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center text-gray-700 font-semibold mb-2">
                                        Sexo
                                    </label>
                                    <div className="flex items-center space-x-2 mb-2">
                                        {userPerfil.gender === 'H' ? (
                                            <i className="pi pi-mars text-blue-500 text-lg"></i>
                                        ) : (
                                            <i className="pi pi-venus text-pink-500 text-lg"></i>
                                        )}
                                        <select
                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-gray-50 text-gray-800"
                                            value={genero}
                                            onChange={(e) => setGenero(e.target.value)}
                                        >
                                            <option value="H">Hombre</option>
                                            <option value="M">Mujer</option>
                                            <option value="O">Otro</option>
                                        </select>
                                    </div>
                                </div>                                <div>
                                    <label className="flex items-center text-gray-700 font-semibold mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                        Fecha de nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        className={`w-full px-3 py-2 rounded-lg border transition-all bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 ${
                                            errors.cumpleanos 
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-100' 
                                            : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100'
                                        }`}
                                        defaultValue={userPerfil.birthday}
                                        onChange={(e) => handleCumpleanosChange(e.target.value)}
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    />
                                    {errors.cumpleanos && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.cumpleanos}
                                        </p>
                                    )}
                                    {!errors.cumpleanos && (cumpleanos || userPerfil.birthday) && (
                                        <span className="text-sm text-gray-500 mt-1 block">
                                            {calculateAge(cumpleanos || userPerfil.birthday)} años
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>                {/* Fotos section */}

                {userPerfil.profile_pic.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <Camera className="w-5 h-5 mr-2 text-purple-500" />
                                Mis fotografías
                            </h2>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {fotos.length}/6
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 transition-all duration-300 flex items-center justify-center relative group">
                                    {fotos[index] ? (
                                        <>
                                            <img
                                                src={fotos[index] instanceof File ? URL.createObjectURL(fotos[index]) : fotos[index]}
                                                alt="preview"
                                                className="object-cover w-full h-full rounded-xl"
                                            />
                                            <button
                                                onClick={() => handleImageDelete(index)}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <label
                                                htmlFor={`fileInput-${index}`}
                                                className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300"
                                            >
                                                <div className='flex items-center justify-center'>
                                                    <Camera className="w-3 h-3 mr-1" />
                                                    Cambiar
                                                </div>
                                            </label>
                                            <input id={`fileInput-${index}`} type="file" className="hidden" onChange={(e) => handleImageChange(e, index)} />
                                        </>
                                    ) : (
                                        <>
                                            <label htmlFor={`fileInput-${index}`} className="cursor-pointer text-purple-400 hover:text-purple-600 transition-colors flex flex-col items-center justify-center h-full w-full">
                                                <Upload className="w-8 h-8 mb-2" />
                                                <span className="text-xs font-medium">Agregar</span>
                                            </label>
                                            <input id={`fileInput-${index}`} type="file" className="hidden" onChange={(e) => handleAddImage(e)} />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Descripción section */}
                {userPerfil.description != null && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-purple-500" />
                            Sobre mí
                        </h2>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50 text-gray-800 h-32 resize-none"
                            defaultValue={descripcion !== '' ? descripcion : (userPerfil.description || '')}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Cuéntanos sobre ti..."
                        />
                    </div>
                )}
                {/* Intereses sections */}
                <div className="space-y-6">
                    {/* Intereses de Eventos */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
                            <h2 className="text-lg font-bold text-white flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                                </svg>
                                Mis Intereses
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">¿Qué tipo de eventos te gustan?</p>
                            <div className="space-y-6">
                                {categorias.map((categoria) => (
                                    <div key={categoria.id} className="space-y-3">
                                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-lg">
                                            <h3 className="font-semibold text-purple-700">{categoria.nombre}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {categoria.valores.map((valor) => (
                                                <button
                                                    key={valor}
                                                    className={`px-4 py-2 rounded-full font-light transition-all duration-300 text-sm ${selectedEvents.includes(valor)
                                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                                                        }`}
                                                    onClick={() => toggleSeleccionado(valor)}
                                                >
                                                    {valor}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Intereses Generales */}
                    {userPerfil.preferencias_generales?.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                                <h2 className="text-lg font-bold text-white flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Intereses Generales
                                </h2>
                            </div>
                            <div className="p-6">
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
                                            <div key={index} className="space-y-3">
                                                {item.question === '¿Cuál es tu personalidad?' ? (
                                                    <div className="space-y-2">
                                                        <p className="font-bold text-gray-800">
                                                            {item.question}
                                                            {!item.optional && <span className="text-red-500"> *</span>}
                                                        </p>
                                                        <a
                                                            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm underline"
                                                            href="https://www.16personalities.com/es/test-de-personalidad"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Hacer test de personalidad →
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <p className="font-semibold text-gray-800">
                                                        {item.question}
                                                        {!item.optional && <span className="text-red-500"> *</span>}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-2">
                                                    {answers.map((answer, i) => {
                                                        const isSelected = selectedAnswers[item._id]?.includes(answer);

                                                        return (
                                                            <button
                                                                key={i}
                                                                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${isSelected
                                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
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
                        </div>
                    )}
                </div>                {/* Botón de guardar */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-20">
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || errors.nombre || errors.apellido || errors.cumpleanos}
                        className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform flex items-center justify-center space-x-2 ${
                            isSaving || errors.nombre || errors.apellido || errors.cumpleanos
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:scale-105'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Guardando cambios...</span>
                            </>
                        ) : (
                            <span>Guardar Cambios</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Loading overlay */}
            {loading === true && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-blue-600/70 via-purple-600/70 to-pink-600/70 backdrop-blur-md transition-opacity duration-700 opacity-100">
                    <div className="text-center text-white p-8 rounded-xl">
                        <h1 className="text-3xl font-bold mb-2">¡Perfil Actualizado!</h1>
                        <p className="mb-4">Redirigiendo a Perfil...</p>
                    </div>
                </div>
            )}
        </div>
    );
};


export default EditarPerfil;
