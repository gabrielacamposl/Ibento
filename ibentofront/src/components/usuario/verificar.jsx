import React, { useState, useEffect, useRef } from 'react';
import { Button } from "primereact/button";
import { useNavigate } from 'react-router-dom';
import { buttonStyle } from "../../styles/styles";
import "../../assets/css/botones.css";
import Webcam from 'react-webcam';
import api from "../../api";


const Verificar = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [user, setUser] = useState({
        pictures: [],
        interest: [],
        ine: [],
        facePhoto: null,
    });

    const [loading, setLoading] = useState(false);
    const [ineImages, setIneImages] = useState([null, null]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [itemsAboutMe, setItemsAboutMe] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [message, setMessage] = useState([]);
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    const items = [
        { label: 'Paso 1' },
        { label: 'Paso 2' },
        { label: 'Paso 3' },
        { label: 'Paso 4' },
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
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Por favor selecciona una imagen válida.");
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
            alert("Debes subir entre 3 y 6 fotos.");
            return;
        }
        // Validar cada archivo
        for (const picture of user.pictures) {
            if (!["image/jpeg", "image/png", "image/jpg"].includes(picture.type)) {
                alert("Solo se permiten imágenes JPG o PNG.");
                return;
            }
            if (picture.size > 5 * 1024 * 1024) { // 5MB
                alert("Cada imagen debe pesar menos de 5MB.");
                return;
            }
        }

        const formData = new FormData();
        user.pictures.forEach((picture) => {
            formData.append("pictures", picture);
        });

        try {
            const response = await api.post("perfil/subir-fotos/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });


            console.log("Fotos subidas:", response.data.pictures);
            alert("¡Fotos subidas con éxito!");
            setActiveIndex(prev => prev + 1);
        } catch (error) {
            console.error("Error al subir fotos:", error.response?.data || error);
            alert("Error al subir fotos. Revisa el tamaño o intenta de nuevo.");
        } finally {
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
        try {
            const respuestas = Object.entries(selectedAnswers).map(([categoria_id, respuesta]) => ({
                categoria_id,
                respuesta: respuesta.length === 1 ? respuesta[0] : respuesta
            }));

            // Validación: asegurarse de que todas las obligatorias estén contestadas
            const obligatoriasNoRespondidas = itemsAboutMe.filter(item => {
                return !item.optional && !(selectedAnswers[item._id]?.length > 0);
            });

            if (obligatoriasNoRespondidas.length > 0) {
                alert("Por favor responde todas las preguntas obligatorias marcadas con *.");
                return;
            }

            await api.post("guardar-respuestas/", { respuestas });
            alert("Preferencias guardadas correctamente.");
            setActiveIndex(prev => prev + 1);
        } catch (err) {
            console.error("Error al guardar preferencias", err);
            alert("Hubo un error al guardar tus preferencias.");
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


    // Pasar a base 64 la foto
    // Base64 a File
    const base64ToFile = (base64Data, filename) => {
        const arr = base64Data.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    };



    // ------ Conexión con el backend ------

    const handleIneValidation = async () => {
        if (!user.ine[0] || !user.ine[1]) {
            setMessage('Por favor, sube ambas imágenes de tu INE.');
            return;
        }
        if (!user.facePhoto) {
            setMessage('Por favor, captura una imagen de tu rostro.');
            return;
        }

        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append("ine_front", user.ine[0]);
        formData.append("ine_back", user.ine[1]);
        formData.append("selfie", base64ToFile(user.facePhoto, "selfie.jpg"));

        try {
            const response = await api.post("validar-ine/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });

            const data = response.data;

            if (data.mensaje_ine && data.mensaje_rostro) {
                setMessage('Tu identidad ha sido validada exitosamente.');
                setActiveIndex(4);
            } else {
                setMessage(data.error || 'La validación falló. Revisa las imágenes.');
            }
        } catch (error) {
            console.error('Error al validar la identidad:', error);
            setMessage('Hubo un error al validar tu identidad. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handdleNavigate = (index) => {

        if (index === 1) {
            if (user.pictures.length < 3) {
                // alert('Debes seleccionar al menos 3 fotos');
                return;
            }
            setActiveIndex(index);
        }
        if (index === 2) {
            if (Object.keys(selectedAnswers).length < itemsAboutMe.length) {
                // alert('Debes responder todas las preguntas');
            }
            setActiveIndex(index);
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

                <div className="w-full  overflow-y-auto gap-2 custom-scrollbar">
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
                        </div>)}

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
                    {/*VENTANA PARA VERIFICAR IDENTIDAD*/}
                    {activeIndex === 3 && (
                        <div className='h-180'>
                            <h1 className="text-2xl font-bold">Verificar mi perfil</h1>
                            <p>Ahora, centra tu cara para verificar que la INE sea suya</p>
                            <div className="w-full mt-2 items-center flex flex-col">
                                <div className="rounded-[30px] overflow-hidden border-4 border-purple-300 shadow-md">
                                    {!capturedPhoto ? (
                                        <Webcam
                                            ref={webcamRef}
                                            audio={false}
                                            screenshotFormat="image/jpeg"
                                            videoConstraints={videoConstraints}
                                            className="w-72 h-96 object-cover"
                                        />
                                    ) : (
                                        <img src={capturedPhoto} alt="Captura" className="w-72 h-96 object-cover" />
                                    )}
                                </div>

                                <button
                                    onClick={capturarImagen}
                                    className="mt-4 w-14 h-14 rounded-full bg-purple-400 hover:bg-purple-500 transition-colors"
                                />
                                <p className="text-center mt-2">Capturar imagen</p>

                                {!capturedPhoto && (
                                    <p className="text-center text-red-500 mt-2">No se ha capturado ninguna imagen.</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                <div className="mt-2 flex justify-center space-x-2 w-full ">
                    <Button className={buttonStyle}
                        onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
                        disabled={activeIndex === 0}
                    >
                        Anterior
                    </Button>

                    {activeIndex === 0 ? (
                        <Button className={buttonStyle} onClick={setActiveIndex(1)}>
                            Siguiente
                        </Button>

                    ) : activeIndex === 1 ? (
                        <Button className={buttonStyle} onClick={setActiveIndex(2)}>
                            Guardar Preferencias
                        </Button>
                    ) : activeIndex === 2 ? (
                        <Button className={buttonStyle} onClick={setActiveIndex(3)}>

                        </Button>
                    ) : activeIndex === 3 ? (
                        <Button className={buttonStyle} onClick={handleIneValidation} disabled={loading}>
                            {loading ? "Validando..." : "Validar identidad"}
                        </Button>
                    ) : (
                        <Button
                            className={buttonStyle}
                            onClick={() => handdleNavigate(activeIndex + 1)}
                            disabled={activeIndex === items.length - 1}
                        >
                            Siguiente
                        </Button>
                    )}
                </div>

            </div>

        </div>
    );
};

export default Verificar;
