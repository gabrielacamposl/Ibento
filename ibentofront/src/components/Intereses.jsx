import React, { useState } from 'react';
import '../../public/css/botones.css';
import { Link } from 'react-router-dom';
const categorias = [
    { id: 1, nombre: 'Deportes', valores: ['Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Ciclismo'] },
    { id: 2, nombre: 'Música', valores: ['Rock', 'Pop', 'Jazz', 'Clásica', 'Hip-Hop'] },
    { id: 3, nombre: 'Tecnología', valores: ['Programación', 'Gadgets', 'AI', 'Robótica', 'Ciberseguridad'] },
    { id: 4, nombre: 'Cine', valores: ['Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción'] },
    { id: 5, nombre: 'Literatura', valores: ['Novela', 'Poesía', 'Ensayo', 'Cuento', 'Biografía'] },
];

const Intereses = () => {
    const [seleccionados, setSeleccionados] = useState(['Fútbol', 'Rock', 'AI', 'Gadgets', 'Ciclismo', 'Comedia', 'Novela']); // Inicializa con valores seleccionados

    const toggleSeleccionado = (valor) => {
        setSeleccionados((prevSeleccionados) =>
            prevSeleccionados.includes(valor)
                ? prevSeleccionados.filter((item) => item !== valor)
                : [...prevSeleccionados, valor]
        );
    };

    return (

        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="degradadoPerfil relative flex flex-col items-center mt-5 shadow-md p-5 shadow-t max-w-lg w-full">
                <div className="miPerfil flex font-bold text-2xl w-full">
                    <h1 className='miPerfil'>Editar Intereses</h1>
                </div>
                <div className="flex justify-center items-center mb-5 space-x-4">
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
                <div className="intereses-container">
            {categorias.map((categoria) => (
                <div key={categoria.id} className="categoria mb-5">
                    <h3 className='font-bold text-2xl'> {categoria.nombre}</h3>
                    <ul className='flex flex-wrap'>
                        {categoria.valores.map((valor) => (
                            <li
                                key={valor}
                                className={`${
                                    `${seleccionados.includes(valor) ? 'seleccionado btn-custom' : 'btn-off'}`} 
                                    mt-2 text-center px-4 ml-2 rounded-full` }
                                onClick={() => toggleSeleccionado(valor)}
                            >
                                {valor}
                            </li>
                        ))}
                    </ul>
                   
                </div>
            ))}
            
        </div>
    
        <Link to="/perfil" className="text-white flex items-center justify-center p-2">
        <button className='rounded-full btn-custom text-2xl flex wrap font-semibold items-center justify-center px-10'>Guardar</button>
        </Link>
            </div>
        </div>
        
    
       
    );
};

export default Intereses;