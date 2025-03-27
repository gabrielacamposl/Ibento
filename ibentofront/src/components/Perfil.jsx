import React from 'react';
import '../../public/css/botones.css';
import { Link } from 'react-router-dom';

const Perfil = () => {
    const user = {
        name: 'Harry Styles',
        age: 31,
        bio: 'Soy un cantante, compositor y actor británico. Me encanta la música y la moda, y disfruto de los desafíos creativos. La moda también es una gran parte de quién soy. Para mí, la ropa es una forma de expresión, de libertad. No hay reglas, solo cómo te sientes en ella. Amo los trajes llamativos, las perlas, los colores y todo lo que me haga sentir auténtico.',
        profilePicture: 'https://via.placeholder.com/150',
        interests: ['Música', 'Moda', 'Actuación', 'Viajes', 'Fotografía', 'Arte', 'Cine', 'Literatura', 'Naturaleza', 'Animales','Deportes']
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="degradadoPerfil relative flex flex-col items-center mt-5 shadow-md p-5 shadow-t max-w-lg w-full">
                <div className="miPerfil flex font-bold text-2xl w-full">
                    <h1 className='miPerfil'>Mi Perfil</h1>
                </div>
                <div className="flex justify-center items-center mb-10 space-x-4">
                    <button className="text-white flex items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </button>
                    <button className="text-white flex items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                    </button>
                    <button className="text-white flex items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                    </button>
                </div>
                
                <div className="relative">
                    <img src="/minovio.jpeg" className="w-30 h-30 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover" alt={user.name} />
                    <Link to="/editarPerfil" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute bottom-0 right-0 bg-purple-300 text-white p-2 rounded-full btn-custom">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                    </Link>
                </div>
                <h1 className="mt-4 mb-5 text-2xl font-semibold text-center">{user.name}, {user.age}</h1>
                <div className="bg-white shadow-xl p-4 w-full">
                    <h2 className="text-lg font-semibold">Sobre mí</h2>
                    <p>{user.bio}</p>
                    <h2 className="text-lg mt-3 font-semibold">Intereses</h2>
                    <div className="mt-2 flex flex-wrap">
                        {user.interests.map((interest, index) => (
                            <h1 key={index} className="interes rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;
