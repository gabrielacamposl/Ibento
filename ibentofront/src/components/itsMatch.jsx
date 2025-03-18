import React, { useState } from 'react';
import '../../public/css/botones.css';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
const itsMatch = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: 'Harry Styles',
        age: 31,
        bio: 'Soy un cantante, compositor y actor británico. Me encanta la música y la moda, y disfruto de los desafíos creativos.',
        pictures: ["/minovio.jpeg", "/juas.webp"],
        interests: ['Música', 'Moda', 'Actuación', 'Viajes', 'Fotografía', 'Arte', 'Cine', 'Literatura', 'Naturaleza', 'Animales','Deportes'],
        
    });
    const users = [
        {
            name: 'Lee Know',
            age: 26,
            pictures: ["/lee2.jpeg", "/lee.jpeg"],
            asistir: ['EDC', 'FlowFest'],
            eventosComun: ['Fiesta de disfraces', 'Karaoke'],
        },
        {
            name: 'Felix',
            age: 22,
            pictures: ["/harry.jpeg", "/felix2.jpeg"],
            asistir: ['Lollapalooza', 'Tomorrowland'],
            eventosComun: ['Concierto de rock', 'Festival de cine'],
        }
    ];

const handdleContinuar = () => {
    navigate("/matches");
}
const handdleChat = () => {
    navigate("/chat");
}


   

    return (
        <div className="flashOnce flex justify-center items-center min-h-screen p-4">
            <div className=" mt-5 p-5 max-w-lg w-full" style={{ backgroundImage: `url('/public/fondoMatch.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backdropFilter: 'blur(50px)' }}>
                <div className="flex justify-end items-end font-bold text-2xl w-full">
                    <button className="">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>

                <div className="h-175 mt-10 p-4 w-full flex flex-col justify-center items-center">

                    <React.Fragment>
                        <div className="animateDiv flex justify-center items-center ">
                            <div className="relative ">
                                <img src={users[0].pictures[0]} className="sombraMatch1 w-50 h-50 object-cover rounded-full" alt={users[0].name} />
                                <div className="absolute bottom-12 right-10 w-full flex justify-center items-center mb-10">
                                    <svg width="300" height="150">
                                        <defs>
                                            <path id="curve1" d="M 50,70 Q 130,-20 200,50"  />
                                        </defs>
                                        <text fontSize="27" fontWeight="bold" fill="black">
                                            <textPath href="#curve1" startOffset="30%" textAnchor="middle">
                                                ¡NUEVO
                                            </textPath>
                                        </text>
                                    </svg>
                                </div>
                            </div>

                            <div className="relative">
                                <img src={users[1].pictures[0]} className="sombraMatch2 w-50 h-50 object-cover rounded-full" alt={users[1].name} />
                                <div className="absolute top-13 right-1 w-full flex justify-center items-center">
                                    <svg width="300" height="300">
                                        <defs>
                                            <path id="curve2" d="M -60,60 Q 30,300 296 100" fill="transparent" />
                                        </defs>
                                        <text fontSize="27" fontWeight="bold" fill="black">
                                            <textPath href="#curve2" startOffset="50%" textAnchor="middle">
                                                ACOMPAÑANTE!
                                            </textPath>
                                        </text>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                    </React.Fragment>
                    <div className="mt-30 w-full">
                        <button onClick={handdleChat} className="btn-custom rounded-full h-10 w-full font-bold text-lg mb-4">Iniciar chat</button>
                        <button onClick={handdleContinuar} className='btn-custom2 rounded h-10 w-full font-bold text-lg'>Continuar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default itsMatch;
