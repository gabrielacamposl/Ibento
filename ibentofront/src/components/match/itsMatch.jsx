import React, { use, useState,useEffect } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import api from '../../api';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useContext } from 'react';
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
const [usersMatch, setUsersMatch] = useState([]);


const handdleContinuar = () => {
    navigate("../matches");
}
const handdleChat = () => {
    navigate("../chat");
}



useEffect(() => {
    const  fetchData = async() => {
    const token = localStorage.getItem('access');
    const queryParams = new URLSearchParams(window.location.search);
    const matchId = queryParams.get('id');
    
    try {
        const response = await api.get(`matches/${matchId}/`, {
           
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
     
        setUsersMatch(response.data);
     
       
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
fetchData();
}  
, []);





    return (
        <div className="text-black flashOnce flex justify-center items-center min-h-screen ">
            <div className="  p-5 max-w-lg " style={{ backgroundImage: `url('/fondoMatch.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backdropFilter: 'blur(50px)' }}>
                <div className="flex justify-end items-end font-bold text-2xl w-full">
                    <button className="">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>

                <div className="min-h-screen p-4 w-full flex flex-col justify-center items-center">

                    <React.Fragment>
                        <div className="animateDiv flex justify-center items-center ">
                            <div className="relative ">
                                <img src={usersMatch?.match?.imagen_usuario_a?.[0] || '/profile_empty.webp'} className="sombraMatch1 w-50 h-50 object-cover rounded-full" alt={usersMatch?.match?.usuario_a_nombre || 'Default Name'} />
                                <div className="absolute bottom-12 right-10 w-full flex justify-center items-center mb-10">
                                    <svg width="280" height="150">
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
                            <img src={usersMatch?.match?.imagen_usuario_b?.[0] || '/profile_empty.webp'} className="sombraMatch1 w-50 h-50 object-cover rounded-full" alt={usersMatch?.match?.usuario_b_nombre || 'Default Name'} />
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
                    <div className="mt-40 w-full">
                        <button onClick={() => navigate(`../chat/?room=${usersMatch?.conversacion_id}`)} className="btn-custom rounded-full h-10 w-full font-bold text-lg mb-4">Iniciar chat</button>
                        <button onClick={handdleContinuar} className='btn-custom2 rounded h-10 w-full font-bold text-lg'>Continuar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default itsMatch;
