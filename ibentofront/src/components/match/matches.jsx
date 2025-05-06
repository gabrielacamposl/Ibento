import React, { useState, useEffect, useRef } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const matches = () => {
    const navigate = useNavigate();
    const [verificar, setVerificar] = useState(true);
    const [user, setUser] = useState({
        
        pictures: ["/minovio.jpeg", "/juas.webp"],
        likes: 20,
        
    });
    
        useEffect(() => {
            const token = localStorage.getItem("token");
            if (!token) {
                // Redirige si no hay token
                navigate("/login");
            }
        }, []);
    
    
    const users = [
        {
            name: 'Lee Know',
            age: 26,
            pictures: ["/lee2.jpeg", "/lee.jpeg"],
            asistir: ['EDC', 'FlowFest'],
            eventosComun: ['Fiesta de disfraces', 'Karaoke'],
            ultimoMensaje:'Hola,¿Cómo estás?',
            idChat: 1,
        },
        {
            name: 'Felix',
            age: 22,
            pictures: ["/lee.jpeg", "/felix2.jpeg"],
            asistir: ['Lollapalooza', 'Tomorrowland'],
            eventosComun: ['Concierto de rock', 'Festival de cine'],
            ultimoMensaje:'',
            idChat: 2,
        },
        {
            name: 'Hyunjin',
            age: 23,
            pictures: ["/jin.jpeg", "/hyunjin2.jpeg"],
            asistir: ['Ultra Music Festival', 'Coachella'],
            eventosComun: ['Exposición de arte', 'Torneo de videojuegos'],
            ultimoMensaje:'Te amoooo <3',
            idChat: 3,
        },
        {
            name: 'Harry',
            age: 28,
            pictures: ["/harry.jpeg", "/jisoo2.jpeg"],
            asistir: ['SXSW', 'Burning Man'],
            eventosComun: ['Concierto de pop', 'Festival de comida'],
            ultimoMensaje:'Te invito a mi concierto',
            idChat: 4,
        },
        {
            name: 'Chinos',
            age: 27,
            pictures: ["/bts.jpeg", "/jennie2.jpeg"],
            asistir: ['Glastonbury', 'Reading Festival'],
            eventosComun: ['Desfile de moda', 'Fiesta en la playa'],
            ultimoMensaje:'',
            idChat: 5,
        },
        {
            name: 'Jung',
            age: 26,
            pictures: ["/jung.webp", "/lisa2.jpeg"],
            asistir: ['Primavera Sound', 'Rock in Rio'],
            eventosComun: ['Concierto de hip-hop', 'Competencia de baile'],
            ultimoMensaje:'',
            idChat: 6,
        }
    ];

   const handdleSearch = () => {
       navigate("../matches");

    }


    const handdleFuture = () => {
        navigate("../verMatches");
        }

    const handdleChat = () => {
        setTimeout(() => navigate("../chat"), 0);
    }

       
    const handdleVerificar = () => {
        setTimeout(() => navigate("../verificar"), 0);
    } 
    return (
        <div className="justify-center text-black flex min-h-screen relative">
            <div className="">
                <div className="degradadoPerfil p-5 max-w-lg w-full mx-auto bg-opacity-80 backdrop-blur-md">
                    <div className="flex justify-end items-end font-bold text-2xl w-full">
                        <button className="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>

                    <div className="miPerfil flex font-bold w-full">
                        <h1 className="miPerfil text-2xl">Mis Matches</h1>
                    </div>


                    {verificar == false && (
                    <div className="min-h-screen fixed inset-0 z-60 flex items-center justify-center bg-[linear-gradient(to_bottom,rgba(40,120,250,0.7),rgba(110,79,249,0.7),rgba(188,81,246,0.7))] backdrop-blur-md">
                    <div className="text-center text-white">
                        <h1 className="text-3xl font-bold">Aún no cuentas con tu perfil de acompañantes</h1>
                        <p className="mt-2">¡Créalo ahora!.</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handdleVerificar}>Crear</button>
                    </div>
                    </div>
                    )}

                    <h3 className="font-bold">Nuevos Matches</h3>
                    <div className="m-2 flex overflow-x-scroll" style={{ cursor: 'grab' }}>
                        <React.Fragment>
                            <div className="m-1 flex-shrink-0 relative">
                                <div className="rounded-full">
                                    <img src={user.pictures[0]} className="w-30 h-40 object-cover rounded" alt={user.name} />
                                    <label onClick={handdleFuture} className="absolute bottom-0 text text-center h-full w-full TransparenciaFoto cursor-pointer">
                                        <div className="mt-10">
                                            <h1>Futuros Acompañantes</h1>
                                            <div className="flex justify-center items-center">
                                                <svg className="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                                                </svg>
                                            </div>
                                            <h1>{user.likes} Likes</h1>
                                        </div>
                                    </label>
                                </div>
                            </div>



                          





                            {users.map((user, index) => (
                                <div key={index} className="m-1 flex-shrink-0 relative">
                                    <div className="rounded-full">
                                        <img src={user.pictures[0]} className="w-30 h-40 object-cover rounded" alt={user.name} />
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    </div>
                    <h1 className="font-bold">Mensajes</h1>

                



                    <div className="mt-4">
                        {users.map((user, index) => (
                            user.ultimoMensaje !== '' && (
                                <div key={index} className="bordeBajo mb-4 p-2">
                                    <button onClick={handdleChat} className="w-full ">
                                    <div className="flex justify-start items-center space-x-2">
                                        <img src={user.pictures[0]} className="w-10 h-10 object-cover rounded-full" alt={user.name} />
                                        <h2 className="font-bold">{user.name}</h2>
                                    </div>
                                    <p className='flex justify-start mt-2'>{user.ultimoMensaje}</p>
                                    </button>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default matches;
