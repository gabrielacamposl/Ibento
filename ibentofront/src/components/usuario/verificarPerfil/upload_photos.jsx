import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Camera, CheckCircle, Upload, Plus, X } from 'lucide-react';
import api from '../../../api';
import { Toast } from 'primereact/toast';


const fotos = () => {
    const navigate = useNavigate();
    
    const toast = useRef(null);
    const [user, setUser] = useState({
        pictures: Array(6).fill(null), // Inicializar con 6 elementos `null`
        
    });
    
    const [loading, setLoading] = useState(false);

    // Estados de carga individuales para cada acción
    const [pictures, setPictures] = useState(Array(6).fill(null)); // Inicializar con 6 elementos `null`
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    
// Obtener imágenes de perfil del usuario
useEffect(() => {
    const fetchFotos = async () => {
        try {
            const response = await api.get("perfil/imagenes/");
            console.log("Respuesta de obtener imágenes:", response.data);

            const images = response.data.imagenes;
            if (response.status === 200 && images && Array.isArray(images)) {
                const picturesArray = Array.from({ length: 6 }, (_, i) => images[i] || null);
                setPictures(picturesArray); // Actualizar el estado `pictures`
            } else {
                console.warn("La respuesta no contiene la propiedad 'imagenes' o no es un array.");
                setPictures(Array(6).fill(null)); // Rellenar con `null` si no hay imágenes
            }
        } catch (error) {
            console.error("Error al obtener imágenes de perfil:", error.response?.data || error);
        }
    };

    fetchFotos();
}, []);

// Actualizar imágenes de perfil del usuario
const updateProfileImages = async () => {
    if (pictures.filter((pic) => pic !== null).length < 3) {
        toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Debes subir al menos 3 fotos.', life: 4000 });
        return;
    }

    setUploadingPhotos(true);

    try {
        const formData = new FormData();
        pictures.forEach((picture) => {
            if (picture instanceof File) {
                formData.append("pictures", picture);
            } else if (typeof picture === "string") {
                formData.append("pictures", picture); // Mantener las URLs existentes
            }
        });

        const response = await api.patch("perfil/imagenes/actualizar/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.status === 200) {
            console.log("Fotos actualizadas exitosamente:", response.data.profile_pic);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: '¡Fotos actualizadas correctamente!', life: 4000 });
            setPictures(response.data.profile_pic); // Actualizar el estado con las imágenes actualizadas
            setTimeout(() => {
                    navigate("../intereses"); // Redirigir al perfil después de subir las fotos
                }, 1000);
        } else {
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Error al actualizar las fotos. Por favor, inténtalo de nuevo.', life: 4000 });
        }
    } catch (error) {
        console.error("Error al actualizar fotos:", error.response?.data || error);
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al actualizar las fotos. Por favor, inténtalo de nuevo.', life: 4000 });
    } finally {
        setUploadingPhotos(false);
    }
};



    //Estado para guardas las fotos de perfil
    const [savedPhotos, setSavedPhotos] = useState([]);

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
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor selecciona una imagen válida.', life: 4000 });
            return;
        }

        setPictures((prev) => {
            const newPictures = [...prev];
            newPictures[index] = file; // Reemplazar la imagen en el índice especificado
            return newPictures;
        });
    };

    const handleImageDelete = (indexToDelete) => {
        setPictures((prev) => {
            const newPictures = [...prev];
            newPictures[indexToDelete] = null; // Reemplazar la imagen eliminada con `null`
            return newPictures;
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
            const formData = new FormData();
            user.pictures.forEach((picture) => {
                formData.append("pictures", picture);
            });

            console.log("Subiendo fotos:", user.pictures);

            const response = await api.post("perfil/subir-fotos/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data && response.data.pictures) {
                showSuccess("¡Fotos subidas correctamente!");
                setSavedPhotos(response.data.pictures); // Guardar las fotos subidas en el estado
                setTimeout(() => {
                    navigate("../intereses");
                }, 2000);
            } else {
                showWarn("Error al subir las fotos. Por favor, inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error al subir fotos:", error.response?.data || error);
            showWarn("Error al subir las fotos. Por favor, inténtalo de nuevo.");
        } finally {
            setUploadingPhotos(false);
        }
    };

   

    // Funciones para mostrar toasts
    const showSuccess = (message) => {
        toast.current.show({severity:'success', summary: 'Éxito', detail: message, life: 4000});
    };

    

    const showWarn = (message) => {
        toast.current.show({severity:'warn', summary: 'Advertencia', detail: message, life: 4000});
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
            {/* <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/30">
                <div className="flex items-center justify-between p-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/60 transition-all duration-300 absolute left-6"
                        style={{ left: '1.5rem' }}
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                Subir Fotos
                            </h1>
                            <p className="text-sm text-gray-600">Paso {4} de {5}</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Content */}
            <div className="pt-24 px-4 pb-8">
                <div className="max-w-4xl mx-auto">
                    {/* Content Cards */}
                    <div className="glass-premium rounded-3xl p-6 mb-6">
                        <div className="text-black">
                            <h1 className='mt-2 text-3xl font-bold miPerfil'>Editar Perfil</h1>
                                <h2 className="mt-2">Elige tus mejores fotos, elige como mínimo 3 fotografías</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 items-center justify-items-center gap-4 mt-6">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="relative">
                                            <div className="relative w-35 h-45 sm:w-35 sm:h-40 md:w-35 md:h-45 border-dashed divBorder flex items-center justify-center mt-4">
                                                {pictures[index] ? (
                                                    <img
                                                        src={
                                                            typeof pictures[index] === "string"
                                                                ? pictures[index]
                                                                : pictures[index] instanceof File
                                                                    ? URL.createObjectURL(pictures[index])
                                                                    : ""
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

                                                {pictures[index] && (
                                                    <button
                                                        type="button"
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
                            
                        </div>
                        <div className="flex justify-center mt-6 space-x-4">
                            <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                        Anterior
                    </button>
                         <button
                            type="button"
                            onClick={updateProfileImages}
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
                                'Actualizar Fotos'
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

export default fotos;

