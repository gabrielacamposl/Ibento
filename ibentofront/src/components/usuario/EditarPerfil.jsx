import React, { useState,useEffect, use } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { buttonStyle, inputStyles } from "../../styles/styles";
import { Accordion, AccordionTab } from 'primereact/accordion';
import apiaxios from "../../axiosConfig";
import api from '../../api';
const EditarPerfil = () => {
    const [user, setUser] = useState({
        name: 'Harry Styles',
        age: 31,
        cumpleanos: '1 de febrero',
        genero: 'H',
        bio: 'Soy un cantante, compositor y actor británico. Me encanta la música y la moda, y disfruto de los desafíos creativos. La moda también es una gran parte de quién soy. Para mí, la ropa es una forma de expresión, de libertad. No hay reglas, solo cómo te sientes en ella. Amo los trajes llamativos, las perlas, los colores y todo lo que me haga sentir auténtico.',
        pictures: ["/minovio.jpeg", "/juas.webp"],
        interests: ['Música', 'Moda', 'Actuación', 'Viajes', 'Fotografía', 'Arte', 'Cine', 'Literatura', 'Naturaleza', 'Animales','Deportes'],
        
    });
    const [userPerfil, setUserPerfil] = useState({ profile_pic: [] })
    const [categorias, setCategorias] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);

    const [cumpleanos, setCumpleanos] = useState('');
    const [genero, setGenero] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fotos, setFotos] = useState([] );
    const [itemsAboutMe, setItemsAboutMe] = useState([]);
    const [myAwnsers, setMyAwnsers] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    

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
                    
                    setSelectedEvents(response.data.preferencias_evento);
                    setMyAwnsers(response.data.preferencias_generales);
                   
                } else {
                    console.error("Error al obtener perfil");
                }
            } catch (error) {
                console.error("Error al obtener perfil:", error);
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
        const newFotos = fotos.filter((_, i) => i !== index);
        setFotos(newFotos);
    };

    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Solo permite máximo 6 imágenes
                if (fotos.length < 6) {
                    setFotos([...fotos, reader.result]);
                }
            };
            reader.readAsDataURL(file);
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
    };


    const handleSubmit = async () => {
        const token = localStorage.getItem('access'); // Obtén el token JWT del almacenamiento local
        // Construir el objeto de datos antes de enviar
        const data = {
            nombre: nombre || userPerfil.nombre,
            apellido: apellido || userPerfil.apellido,
            birthday: cumpleanos || userPerfil.birthday,
            gender: (genero ? (genero === "Hombre" ? "H" : genero === "Mujer" ? "M" : genero) : userPerfil.genero),
            description: descripcion || userPerfil.descripcion,
            profile_pic: fotos,
            preferencias_evento:  selectedEvents || userPerfil.preferencias_evento,
            //preferencias_eventos: userPerfil.preferencias_evento
        };
        console.log("Datos a enviar:", data);
        try {
            const response = await api.patch('perfil/actualizar/', data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log("Perfil actualizado:", response.data);
            } else {
                console.error("Error al actualizar perfil");
            }
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
        }
    
       
    }

    return (
        <div className="flex shadow-lg justify-center items-center text-black">
            <div className="degradadoPerfil relative flex flex-col items-center p-5 max-w-lg w-full">
                <div className="flex justify-center items-center m-2 space-x-4">
                    <div className="relative">
                        <img src={userPerfil.profile_pic[0]} className="w-45 h-45 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover" alt={userPerfil.nombre} />
                    </div>
                </div>

                <div className="text-black w-full -2xl">
                    <div className='mb-2 items-center'>
                        <div className='flex items-center mr-4 mb-2'>
                            <h1 className="font-semibold mr-2">Nombre: </h1>
                            <input type="text"
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none bg-gray-50 text-base"
                                defaultValue={userPerfil.nombre}
                                rows={1}
                                onChange={(e) => setNombre(e.target.value)}
                            ></input>
                        </div>
                        <div className='flex items-center'>
                            <h1 className="font-semibold mr-2">Apellido:</h1>
                            <input type="text"
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none bg-gray-50 text-base"
                                defaultValue={userPerfil.apellido}
                                rows={1}
                                onChange={(e) => setApellido(e.target.value)}
                                
                            ></input>
                        </div>
                    </div>
                    <div className='flex items-center'>
                        <h1 className="font-semibold mr-2">Sexo:</h1>    
                    <div className='flex space-x-2 mr-2 items-center'>
                        
                        {genero === 'Hombre' ? (
                            <i className="pi pi-mars mt-1 font-semibold " style={{ color: 'slateblue' }}></i>
                        ) : (
                            <i className="pi pi-venus mt-1 font-semibold" style={{ color: 'orange' }}></i>
                        )}
                     
                    </div>
                    <div className="relative">
                            <select
                                className="appearance-none border border-indigo-400 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-base font-medium text-indigo-700 shadow-sm transition-all"
                                value={genero || userPerfil.genero || user.genero}
                                onChange={(e) => setGenero(e.target.value)}
                            >
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                            </select>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className='flex space-x-2 mt-2 items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                        </svg>
                        
                        <input type="text"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none bg-gray-50 text-base"
                            defaultValue={userPerfil.birthday}
                            rows={1}
                            placeholder='AAAA-MM-DD'  
                            onChange={(e) => {
                                const birthday = e.target.value;
                                const age = calculateAge(birthday);
                                setCumpleanos(e.target.value);
                            }}
                        ></input>
                        <h1 className="text-lg">{} años</h1>
                    </div>
                </div>
                
                <div className="p-4 w-full overflow-x-auto min-h-screen">
                    <React.Fragment>
                        <h2 className="">Fotos {fotos.length}/6</h2>
                        <h2 className="mb-2 text-lg font-semibold">Mis fotografías</h2>
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="relative w-30 h-35 sm:w-30 sm:h-35 md:w-30 md:h-35 divBorder flex items-center justify-center">
                                    {fotos[index] ? (
                                        <>
                                            <img 
                                            src={typeof fotos[index] === "string"
                                                                ? fotos[index]
                                                                : URL.createObjectURL(fotos[index])
                                                    } 
                                            className="w-full h-full object-cover m" alt={user.name} />
                                            <button onClick={() => handleImageDelete(index)} className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7 Morado absolute top-0 right-0 text-white p-2 rounded-full btn-custom">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <label htmlFor={`fileInput-${index}`} className="absolute bottom-0 text-center w-full Transparencia cursor-pointer">
                                                <div className='flex justify-center items-center'>
                                                    <svg className='' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="size-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                                    </svg>
                                                    <span className='ml-2'>Cambiar</span>
                                                </div>
                                            </label>
                                            <input id={`fileInput-${index}`} type="file" className="hidden" onChange={(e) => handleImageChange(e, index)} />
                                        </>
                                    ) : (
                                        <>
                                            <label htmlFor={`fileInput-${index}`} className="cursor-pointer texto">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-15 h-12">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                <span className="block mt-1">Agregar</span>
                                            </label>
                                            <input id={`fileInput-${index}`} type="file" className="hidden" onChange={(e) => handleAddImage(e)} />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <h2 className="mt-5 text-lg font-semibold">Sobre mí</h2>
                        <textarea
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none bg-gray-50 text-base w-full h-32"
                            defaultValue={userPerfil.description}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Escribe algo sobre ti..."
                        ></textarea>
                        <div className='mt-5'>
                           <Accordion multiple >
                            <AccordionTab className="text-lg font-semibold mb-3" header="Mis Intereses">
                                <div className="scroll-x-overflow">
              
                               
                                <h1>¿Qué tipo de eventos te gustan?</h1>
                                

                                
                                <div className="intereses-container">
                                    {categorias.map((categoria) => (
                                    <div key={categoria.id} className="categoria mb-5">
                                        <div className={buttonStyle} style={{ cursor: 'default' }}>
                                        {categoria.nombre}
                                        </div>
                                        <ul className="flex flex-wrap">
                                        {categoria.valores.map((valor) => (
                                            <li
                                            key={valor}
                                            className={`cursor-pointer mt-2 text-center px-4 py-1 ml-2 rounded-full font-medium transition ${selectedEvents.includes(valor)
                                                ? 'bg-purple-400 text-white shadow border-2 border-white'
                                                : 'btn-off'
                                                }`}
                                            onClick={() => toggleSeleccionado(valor)}
                                            >
                                            {valor}
                                            </li>
                                        ))}
                                        </ul>
                                    </div>
                                    ))}
                                </div>
                                

                                
                                </div>
                            </AccordionTab>
                            <AccordionTab className="text-lg font-semibold" header="Intereses de Eventos">
                                 <div className='mt-5'>
                           
                            
                            <div className="flex flex-wrap gap-2 mt-2">
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
                                                const isSelected =  selectedAnswers[item._id]?.includes(answer);
                                                
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
                           
                        </div>
                            </AccordionTab>
                        
    
                        </Accordion>
                        </div>


                       
                    </React.Fragment>
                </div>
                {/* <Link to="../perfil" className="w-full text-white flex items-center justify-center p-2"> */}
                    <button onClick={handleSubmit} className={buttonStyle}>Guardar</button>
                {/* </Link> */}
            </div>
        </div>
    );
}

export default EditarPerfil;
