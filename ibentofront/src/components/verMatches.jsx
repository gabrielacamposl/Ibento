import React, { useState } from 'react';
import '../../public/css/botones.css';
import { Link } from 'react-router-dom';

const verMatch = () => {
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
            pictures: ["/lee.jpeg", "/felix2.jpeg"],
            asistir: ['Lollapalooza', 'Tomorrowland'],
            eventosComun: ['Concierto de rock', 'Festival de cine'],
        },
        {
            name: 'Hyunjin',
            age: 23,
            pictures: ["/jin.jpeg", "/hyunjin2.jpeg"],
            asistir: ['Ultra Music Festival', 'Coachella'],
            eventosComun: ['Exposición de arte', 'Torneo de videojuegos'],
        },
        {
            name: 'Harryyyy',
            age: 28,
            pictures: ["/harry.jpeg", "/jisoo2.jpeg"],
            asistir: ['SXSW', 'Burning Man'],
            eventosComun: ['Concierto de pop', 'Festival de comida'],
        },
        {
            name: 'Chinos',
            age: 27,
            pictures: ["/bts.jpeg", "/jennie2.jpeg"],
            asistir: ['Glastonbury', 'Reading Festival'],
            eventosComun: ['Desfile de moda', 'Fiesta en la playa'],
        },
        {
            name: 'Jung',
            age: 26,
            pictures: ["/jung.webp", "/lisa2.jpeg"],
            asistir: ['Primavera Sound', 'Rock in Rio'],
            eventosComun: ['Concierto de hip-hop', 'Competencia de baile'],
        }
    ];

   

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="degradadoPerfil  mt-5  p-5  max-w-lg w-full">
            <div className="mb-2 flex justify-end items-end font-bold text-2xl w-full">
                                <button className="">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                        
                                </button>
                                
                                
                </div>
                <div className="miPerfil flex font-bold text-2xl w-full">
                    
                    <h1 className='miPerfil'>Tus futuros acompañantes</h1>
                </div>
                
                <div className=" ml-auto mr-auto flex flex-wrap  p-4 w-full">
                    <React.Fragment>
                        {users.map((user, index) => (
                            <div key={index} className="flex flex-col  m-2 ">
                                <div className="relative rounded-full">
                                    <img src={user.pictures[0]} className="w-50 h-60 object-cover rounded" alt={user.name} />
                                    <label className="absolute bottom-0 text-center w-full Transparencia cursor-pointer">
                                        <span className='ml-2 '>{user.name}</span>
                                        <div className='flex justify-center items-center'>
                                            <div className="flex flex-wrap justify-center space-x-10 mb-1">
                                                <button className="  botonTransparente text-white p-2 rounded-full size-8">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-4 w-aut rojo">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <button className=" botonTransparente text-white p-2 rounded-full size-8">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4" className="morado">
                                                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                                                    </svg>

                                                </button>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                </div>
            </div>
        </div>
    );
}

export default verMatch;
