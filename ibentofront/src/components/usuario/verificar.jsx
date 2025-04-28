import React, { useState, useEffect, useRef } from 'react';
import "../../assets/css/botones.css";
import { buttonStyle } from "../../styles/styles";
//import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
const verificar = () => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState({
        pictures: ["/jin.jpeg", "/jin2.png","/jin3.jpeg"],
        ine: ["/ine.jpg"],
    });

    const [activeIndex, setActiveIndex] = useState(3);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // Estado para respuestas seleccionadas

    // Desplazar al inicio de la página al cargar el componente
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPictures = [...user.pictures];
                newPictures[index] = reader.result;
                setUser({ ...user, pictures: newPictures });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageDelete = (index) => {
        const newPictures = user.pictures.filter((_, i) => i !== index);
        setUser({ ...user, pictures: newPictures });
    };

    const handleImageINE = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPictures = [...user.ine];
                newPictures[index] = reader.result;
                setUser({ ...user, ine: newPictures });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageDeleteINE = (index) => {
        const newPictures = user.ine.filter((_, i) => i !== index);
        setUser({ ...user, ine: newPictures });
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
            question: '¿En qué momento del día sueles ser más activo?',
            answers: ['En las mañanas', 'En las tardes', 'En las noches', 'Durante todo el día']
        },
        {
            question: '¿Qué tipo de música prefieres?',
            answers: ['Pop', 'Rock', 'Clásica', 'Electrónica', 'Latina', 'Jazz', 'Otro']
        },
        {
            question: '¿Tienes mascotas?',
            answers: ['Perros', 'Gatos', 'Peces', 'Aves', 'Reptiles', 'Roedores', 'Otro', 'Me gustaría uno', 'Soy alergico', 'No me gustan']
        },
        {
            question: '¿Cuáles son tús intereses?',
            answers: ['Música', 'Deportes', 'Cine', 'Viajar', 'Cocinar', 'Leer', 'Tecnología', 'Dibujo/Pintar', 'Arte', 'Otro']
        },
        {
            question: '¿Qué tan activo eres en redes?',
            answers: ['Muy activo', 'Activo', 'Poco activo', 'No uso redes']
        },
        {
            question: '¿Qué medio de transporte sueles usar?',
            answers: ['Auto', 'Bicicleta', 'Transporte público', 'Caminar', 'Moto', 'Uber', 'Otro']
        },
        {
            question: '¿Cómo te sientes respecto a planes espontáneos',
            answers: ['Me encantan', 'Depende del plan', 'No me gustan', 'Prefiero planear con anticipación']
        },
        {
            question: '¿Qué valoras más en una compañía?',
            answers: ['Buena conversación', 'Sentido del humor', 'Inteligencia', 'Honestidad', 'Empatía', 'Lealtad', 'Otro']
        },
        {
            question: '¿Qué tipo de interacción esperas durante un evento?',
            answers: ['Risas y diversión', 'Compartir intereses mutuos', 'Disfrutar el momento', 'Conocer gente nueva', 'Conversaciones profundas']
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
        if(user=== "Verificado"){
            alert("Tu perfil ha sido verificado con éxito.");
            navigate("../profileVerify");
            
        }else if(user === "Repetido"){
            navigate("../profileRepeat");
        }
        else{
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
                                                                            src={user.pictures[index]}
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
                    <button className={buttonStyle}
                        onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
                        disabled={activeIndex === 0}
                    >
                        Anterior
                    </button>
                    {activeIndex === 3 ?(
                    <button
                        className={buttonStyle}
                        onClick={() => handdleVerify()}
                        
                    >
                        Verificar
                    </button>
                    ) : (
                        <button
                            className={buttonStyle}
                            onClick={() => handdleNavigate(Math.min(activeIndex + 1, items.length - 1))}
                            disabled={activeIndex === items.length - 1}
                        >
                            Siguiente
                        </button>
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default verificar;
