import React, { useState } from 'react';
import "../../assets/css/botones.css";
import "../../assets/css/sombras.css";
import { useNavigate } from "react-router-dom";

const buscarMatchx = () => {
    const navigate = useNavigate();
    const users = [
        {
            name: 'Lee Know',
            age: 26,
            pictures: ["/lee2.jpeg", "/lee.jpeg"],
            asistir: ['EDC', 'FlowFest'],
            eventosComun: ['Fiesta de disfraces', 'Karaoke'],
            match:false,
        },
        {
            name: 'Jungkook',
            age: 27,
            pictures: ["/jung2.webp", "/jung.webp"],
            asistir: ['Lollapalooza', 'Tomorrowland'],
            eventosComun: ['Concierto de rock', 'Festival de cine'],
            match:false,
        },
        {
            name: 'Jin',
            age: 23,
            pictures: ["/jin2.png", "/jin.jpeg"],
            asistir: ['Ultra Music Festival', 'Coachella'],
            eventosComun: ['Exposición de arte', 'Torneo de videojuegos'],
            match:true,
        },
        // Add more users as needed
    ];

    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleNextUser = () => {
        setCurrentUserIndex((prevIndex) => (prevIndex + 1));
        setCurrentImageIndex(0);
    };

    const handleMatch = () => {
        setCurrentUserIndex((prevIndex) => (prevIndex + 1));
        setCurrentImageIndex(0);
        if(users[currentUserIndex].match){
            setTimeout(() => navigate("../itsMatch"), 0);
        }
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % users[currentUserIndex].pictures.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + users[currentUserIndex].pictures.length) % users[currentUserIndex].pictures.length);
    };


    const handdleMessage = () =>{
        setTimeout(() => navigate("../match"), 0);
    }

    
    if (currentUserIndex >= users.length) {
        return (
            <div className="text-black flex justify-center items-center min-h-screen">
                <div className="w-full   relative flex flex-col items-center  shadow-md  shadow-t max-w-lg w-full ">
                <div className=" left-2 top-10  space-x-5 font-bold flex justify-between items-center ">
                        <button  className="cursor-pointer BuscarMatch text-white ">
                            Buscar Match
                        </button>
                        <button onClick={handdleMessage} className="cursor-pointer text-black font-bold rounded-full">
                            Mensajes
                        </button>
                    </div>

                    <div className="flex justify-center items-center mt-auto mb-auto font-bold text-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>

                    Sin usuarios disponibles
                    </div>
            </div>
            
            </div>
        );
    }

    const user = users[currentUserIndex];

    return (
        <div className="flex justify-center items-center min-h-screen ">
            <div className="relative flex flex-col items-center  shadow-md shadow-t max-w-lg w-full ">
                <div className="relative w-full min-h-screen  overflow-hidden ">
                
                <div className="absolute  z-5 left-2 top-10  space-x-5 transform font-bold flex justify-between items-center ">
                        <button onClick  className="cursor-pointer BuscarMatch text-white ">
                            Buscar Match
                        </button>
                        <button onClick={handdleMessage}  className="cursor-pointer text-white font-bold rounded-full">
                            Mensajes
                        </button>
                    </div>

                    <div className="absolute inset-0 z-3 flex justify-between items-center ">
                        <button onClick={handlePrev} className="btnTransparente text-white p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button onClick={handleNext} className="btnTransparente text-white p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                
                    <div className="absolute text-white ml-3 inset-0 z-4 right-0 top-55 transform translate-x-1 translate-y-1/2">
                        <h1 className="mt-1 mb-2 text-2xl font-semibold ">{user.name}, {user.age}</h1>
                        <div className=" w-full">
                            <div className="flex flex-wrap">
                                <h2 className="mt-2">Asistirá a: </h2>
                                {user.asistir.map((interest, index) => (
                                    <h1 key={index} className="botonAsistir rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                                ))}
                            </div>

                            <h2 className="m-1">Tienen {user.eventosComun.length} eventos en común</h2>
                            <div className="flex flex-wrap">
                                {user.eventosComun.map((comun, index) => (
                                    <h1 key={index} className="Transparencia2 rounded-lg text-center mb-1 px-3 ml-3 mt-1 sm:w-auto negritas">{comun}</h1>
                                ))}
                            </div>

                            <div className="flex flex-wrap justify-center mt-5 space-x-10">
                                <button onClick={handleNextUser} className="botonTransparente text-white p-2 rounded-full size-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.7" stroke="currentColor" className="size-10 w-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <button onClick={handleMatch} className="botonTransparente ml-20 text-white p-2 rounded-full size-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.7" stroke="currentColor" className="size-10z w-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/> 
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 z-1 bodyFoto"/>
                    <div className="absolute inset-0 z-0">
                        <img src={user.pictures[currentImageIndex]} className="w-full h-full sm:h-full object-cover z-0" alt={user.name} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default buscarMatchx;
