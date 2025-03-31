import React, { useState } from 'react';
import "../assets/css/botones.css";
import { Link } from 'react-router-dom';

const EditarPerfil = () => {
    const [user, setUser] = useState({
        name: 'Harry Styles',
        age: 31,
        bio: 'Soy un cantante, compositor y actor británico. Me encanta la música y la moda, y disfruto de los desafíos creativos.',
        pictures: ["/minovio.jpeg", "/juas.webp"],
        interests: ['Música', 'Moda', 'Actuación', 'Viajes', 'Fotografía', 'Arte', 'Cine', 'Literatura', 'Naturaleza', 'Animales','Deportes'],
        
    });

   
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

    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...user, pictures: [...user.pictures, reader.result] });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="degradadoPerfil relative flex flex-col items-center mt-5 shadow-md p-5 shadow-t max-w-lg w-full">
                <div className="miPerfil flex font-bold text-2xl w-full">
                    <h1 className='miPerfil'>Editar Perfil</h1>
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
                <div className="flex justify-center items-center m-2 space-x-4">
                    <div className="relative">
                        <img src={user.pictures[0]} className="w-30 h-30 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover" alt={user.name} />
                        
                       
                    </div>
                    <h1 className="mt-4 mb-5 text-2xl text-center font-semibold">{user.name}, {user.age}</h1>
                </div>
                <div className="bg-white shadow-xl p-4 w-full">
                    <h2 className="text-lg font-semibold">Sobre mí</h2>
                    <textarea className=" border border-gray-200 rounded-lg w-full h-30 p-2 border rounded" defaultValue={user.bio}></textarea>
                    <React.Fragment>
                        <h2 className="text-lg font-semibold">Fotografías</h2>
                        <div className="flex justify-center items-center m-2 space-x-4">
                            {user.pictures.map((picture, index) => (
                                <div key={index} className="relative">
                                    <img src={picture} className="w-30 h-30 sm:w-32 sm:h-32 md:w-40 md:h-40 object-cover" alt={user.name} />
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
                                </div>
                            ))}
                            {user.pictures.length < 3 && (
                                <div className="relative w-30 h-30 sm:w-32 sm:h-32 md:w-40 md:h-40 border-2 border-dashed divBorder flex items-center justify-center">
                                    <label htmlFor="addImageInput" className="cursor-pointer texto">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-15 h-12">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        <span className="block mt-2">Agregar</span>
                                    </label>
                                    <input id="addImageInput" type="file" className="hidden" onChange={handleAddImage} />
                                </div>
                            )}
                        </div>
                        <div className='mt-5'>
                        <h2 className="text-lg font-semibold">Intereses</h2>
                        <Link to="/editarIntereses">
                            <button className="">Editar Intereses</button>
                        </Link>
                        <div className="mt-2 flex flex-wrap">
                            {user.interests.map((interest, index) => (
                                <h1 key={index} className="interes rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                            ))}
                        </div>
                        </div>
                    </React.Fragment>
                    <hr className='border-2 border-gray-300 mt-5 mb-5'/>
                     <Link to="/perfil" className="text-white flex items-center justify-center p-2">
                             <button className='rounded-full btn-custom font-semibold text-2xl flex wrap items-center justify-center px-10'>Guardar</button>
                             </Link>
                </div>
            </div>
        </div>
    );
}

export default EditarPerfil;
