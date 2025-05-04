import React, { useState, useEffect, useRef } from 'react';
import { Button } from "primereact/button";
import { useNavigate } from 'react-router-dom';
import { buttonStyle } from "../../styles/styles";
import "../../assets/css/botones.css";
//import Webcam from 'react-webcam';
import api from "../../api";


const Verificar = () => {
    const navigate = useNavigate();


    const [user, setUser] = useState({
        pictures: [],
        ine: []
    });
    const [ineImages, setIneImages] = useState([null, null]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // Estado para respuestas seleccionadas

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // Redirige si no hay token
            navigate("/login");
        }
        window.scrollTo(0, 0);
    }, []);

    // Desplazar al inicio de la página al cargar el componente
    // useEffect(() => {
    //     window.scrollTo(0, 0);
    // }, []);

    // ------------- Subir fotos de perfil

    const handleUploadPictures = async () => {
        if (user.pictures.length < 3 || user.pictures.length > 6) {
            alert("Debes subir entre 3 y 6 fotos.");
            return;
        }

        const formData = new FormData();
        user.pictures.forEach((picture) => {
            formData.append("pictures", picture);
        });

        try {
            const response = await api.post("api/upload-profile-pictures/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Fotos subidas:", response.data.pictures);
            alert("¡Fotos subidas con éxito!");
        } catch (error) {
            console.error("Error al subir fotos:", error.response?.data || error);
            alert("Error al subir fotos. Revisa el tamaño o intenta de nuevo.");
        }
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
    

    // ---------------------------- VALIDACION DE INE -----------------------------
    // ------ Manejo de imagenes de INE ------

    const handleImageINE = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newImages = [...ineImages];
            newImages[index] = file;
            setIneImages(newImages);
        }
    };

    const handleImageDeleteINE = (index) => {
        const newImages = [...ineImages];
        newImages[index] = null;
        setIneImages(newImages);
    };

    // ------ Conexión con el backend ------

    const handleIneValidation = async () => {
        if (!ineImages[0] || !ineImages[1]) {
            setMessage('Por favor, sube ambas imágenes de tu INE.');
            return;
        }

        const formData = new FormData();
        formData.append("ine_front", ineImages[0]);
        formData.append("ine_back", ineImages[1]);

        try {
            const response = await api.post("validar-ine/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });

            if (response.data.is_valid) {
                setMessage('Tu identidad mediante la INE ha sido validada.');
                setActiveIndex(3); // avanzar de sección
            } else {
                setMessage('La validación de la INE ha fallado. Por favor, verifica las imágenes.');
            }
        } catch (error) {
            console.error('Error al validar la INE:', error);
            setMessage('Hubo un error al validar la INE. Por favor, intenta nuevamente.');
        }
    };



    const handdleNavigate = (index) => {

        if (index === 1) {
            if (user.pictures.length < 3) {
                alert('Debes seleccionar al menos 3 fotos');
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
        if (index === 3) {
            setActiveIndex(index);
        }
    };

    const items = [
        { label: 'Paso 1' },
        { label: 'Paso 2' },
        { label: 'Paso 3' },
        { label: 'Paso 4' },
    ];

    const itemsAboutMe = [
        {
            question: '¿Fumas con frecuencia?',
            answers: ['Sí, fumo con frecuencia', 'No me gusta fumar', 'Solo en ocasiones especiales', 'Lo hago para socializar', 'Trato de dejarlo']
        },
        {
            question: '¿Bebes alcohol con frecuencia?',
            answers: ['Sí, bebo con frecuencia', 'No me gusta beber', 'Solo en ocasiones especiales', 'Lo hago para socializar', 'Trato de dejarlo']
        },

        {
            question: '¿Cuál es su tipo de personalidad?',
            answers: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
        }
    ];


    const handleAnswerSelect = (question, answer) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [question]: answer
        }));
    };


    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const webcamRef = useRef(null);

    const foto = () => {
        const captura = webcamRef.current.getScreenshot();
        setCapturedPhoto(captura);
    }

    const handdleVerify = () => {
        const user = "Repetido";

        console.log("Verificando perfil desde back...");
        if (user === "Verificado") {
            alert("Tu perfil ha sido verificado con éxito.");
            navigate("../profileVerify");

        } else if (user === "Repetido") {
            navigate("../profileRepeat");
        }
        else {
            alert("Tu perfil no ha podido ser verificado.");
            return;
        }
        // Lógica para verificar el perfil
    }

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
                                    <Button className={buttonStyle} onClick={handleUploadPictures}>
                                        Siguiente
                                    </Button>
                                </div>
                            </React.Fragment>
                        </div>)}

                    {/*VENTANA PARA VERIFICAR INFORMACIÓN */}
                    {activeIndex === 1 && (
                        <React.Fragment>
                            <div
                                className='h-180 gap-2 custom-scrollbar'

                            >
                                <h1 className='text-3xl mt-2 font-bold miPerfil'>Más sobre mí</h1>
                                <h2 className="mt-2">Completa tu información</h2>
                                <div className="grid grid-cols-1 gap-4 mt-2 ">
                                    {itemsAboutMe.map((item, index) => (
                                        <div key={index} className="flex flex-col">

                                            {item.question === '¿Cuál es su tipo de personalidad?' ? (

                                                <div className="flex space-x-1">
                                                    <p className="text-black font-semibold">{item.question}</p>
                                                    <a className="botonLink" href='https://www.16personalities.com/es/test-de-personalidad' target="_blank"
                                                        rel="noopener noreferrer">Hacer test de personalidad</a>
                                                </div>
                                            )
                                                : (
                                                    <p className="font-semibold">{item.question}</p>)
                                            }

                                            <div className="grid grid-cols-2 gap-2 mt-2 flex">
                                                {item.answers.map((answer, i) => (
                                                    <button
                                                        key={i}
                                                        className={`rounded-full ${selectedAnswers[item.question]?.includes(answer) ? 'btn-active' : 'btn-inactive'}`}
                                                        onClick={() => {
                                                            setSelectedAnswers((prev) => {
                                                                const currentAnswers = prev[item.question] || [];
                                                                if (currentAnswers.includes(answer)) {
                                                                    return {
                                                                        ...prev,
                                                                        [item.question]: currentAnswers.filter((a) => a !== answer)
                                                                    };
                                                                } else {
                                                                    return {
                                                                        ...prev,
                                                                        [item.question]: [...currentAnswers, answer]
                                                                    };
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        {answer}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </React.Fragment>
                    )}


                    {/*VENTANA PARA VERIFICAR IDENTIDAD*/}
                    {activeIndex === 2 && (
                        <div className='h-180'>
                            <h1 className="text-2xl font-bold">Verificar mi perfil</h1>
                            <p>Para verificar su identidad deberás subir foto de su INE.</p>
                            <React.Fragment>
                                <div className="w-full mt-2 items-center flex flex-col">
                                    {Array.from({ length: 2 }).map((_, index) => (
                                        <div key={index} className="relative w-80 h-45 sm:w-80 sm:h-45 md:w-80 md:h-45 m-2 border-dashed divBorder flex items-center justify-center mt-6">
                                            {user.ine[index] ? (
                                                <img
                                                    src={user.ine[index]}
                                                    alt={`Imagen ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <label htmlFor={`fileInput-${index}`} className="cursor-pointer texto flex">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-15 h-12">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                    <span className="block mt-2 colorTexto text-center">
                                                        {index === 0 ? 'Subir INE (parte frontal)' : 'Subir INE (parte trasera)'} en formato jpg, png
                                                    </span>
                                                </label>
                                            )}
                                            {user.ine[index] && (
                                                <button
                                                    className="w-7 h-7 btn-custom absolute top-0 right-0 text-white rounded-full"
                                                    onClick={() => handleImageDeleteINE(index)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                            <input id={`fileInput-${index}`} type="file" className="hidden" onChange={(e) => handleImageINE(e, index)} />
                                        </div>
                                    ))}
                                </div>
                            </React.Fragment>
                        </div>
                    )}



                    {/*VENTANA PARA VERIFICAR IDENTIDAD*/}
                    {activeIndex === 3 && (
                        <div className='h-180'>
                            <h1 className="text-2xl font-bold">Verificar mi perfil</h1>
                            <p>Ahora, centra tu cara para verificar que la INE sea suya</p>
                            <React.Fragment>
                                <div className="w-full mt-2 items-center flex flex-col">
                                    {/* Webcam component to capture image 
                                  <Webcam
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{
                                        facingMode: "user", // Ensures the front camera is used
                                    }}
                                    onUserMediaError={(error) => {
                                        if (error.name === "NotAllowedError") {
                                            alert("Verifica los permisos de su dispotivio.");
                                        } else if (error.name === "NotFoundError") {
                                            alert("No se pudo detectar la cámara. Asegúrate de que esté conectada y funcionando.");
                                        } else {
                                            alert("Error al accesar a la camara.");
                                        }
                                        console.error(error);
                                    }}
                                        
                                  />*/}
                                    <button onClick={foto} className="Capturar w-10 h-10 rounded-full" />
                                    <p className="text-center">Capturar imagen</p>
                                    {capturedPhoto ? (
                                        <img src={capturedPhoto} alt="Captura" />
                                    ) : (
                                        <p className="text-center text-red-500">No se ha capturado ninguna imagen.</p>
                                    )}
                                </div>
                            </React.Fragment>
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
                        <Button className={buttonStyle} onClick={handleUploadPictures}>
                            Siguiente
                        </Button>
                    ) : activeIndex === 2 ? (
                        <Button className={buttonStyle} onClick={handleIneValidation}>
                            Verificar
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
