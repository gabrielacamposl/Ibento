import React, { useState,useEffect } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
const verMatch = () => {
    const navigate = useNavigate();

    const handdleMatch = async(user_id) => {
        console.log('match con ',user_id);
         try {
            const token = localStorage.getItem('access');
           
            const response = await api.post('interaccion/', {
                "usuario_destino": user_id,
                "tipo_interaccion": "like"}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })
            console.log(response.data)
            if (response.data?.match_id ) {
                navigate(`../itsMatch/?id=${response.data.match_id}`);

            }
            console.log('Respuesta de la API:', response);
        }catch (error) {
            console.error('Error:', error);
        }

       // navigate('../itsMatch');
    }
   
    const handdleVerLike = () => {
        navigate('../verLike');
    }
    
    const eliminarLike = (user_id) => async () => {

        console.log('match con ',user_id);
         try {
            const token = localStorage.getItem('access');
           
            const response = await api.post('interaccion/', {
                "usuario_destino": user_id,
                "tipo_interaccion": "dislike"}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })
            console.log(response.data)
            console.log('Respuesta de la API:', response);
        }catch (error) {
            console.error('Error:', error);
        }

       // navigate('../itsMatch');

        //console.log(user_id);
    }

    //Ver Uusuarios que me han dado like
    const [UsuarioLike, setUsuarioLike] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access');
            try {
                const response = await api.get('likes-recibidos/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });
                if (response.status === 200) {
                    console.log('Usuarios disponibles:', response.data);
                    setUsuarioLike(response.data);
                } else {
                    console.error('Error en la respuesta:', response.status);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchData();
    }, []);
    return (
        <div className="text-black flex justify-center min-h-screen">
            <div className="degradadoPerfil p-5 max-w-lg w-full">
                <div className="mb-2 flex justify-end items-end font-bold text-2xl w-full">
                    <button className="">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
                <div className="miPerfil flex font-bold text-2xl w-full">
                    <h1 className="miPerfil">Tus futuros acompañantes</h1>
                </div>
                <div className="mt-5 ml-auto mr-auto grid grid-cols-3 sm:grid-cols-2 gap-4 p-3 w-full">
                    <React.Fragment>
                        {UsuarioLike.map((user, index) => (
                            <div key={index} className="flex justify-center">
                                <div className="relative rounded-full">
                                    <img
                                        onClick={handdleVerLike}
                                        src={user.profile_pic}
                                        className="w-35 h-45 object-cover rounded"
                                        alt={user.name}
                                    />
                                    <label className="absolute bottom-0 text-center w-full Transparencia cursor-pointer">
                                        <span className="ml-2">{user.nombre}</span>
                                        <div className="flex justify-center items-center">
                                            <div className="flex flex-wrap justify-center space-x-10 mb-1">
                                                <button onClick={eliminarLike(user._id)} className="botonTransparente text-white p-2 rounded-full size-8">
                                               
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1"
                                                        stroke="currentColor"
                                                        className="size-4 w-auto rojo"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                    
                                                </button>
                                                <button
                                                    onClick={()=> handdleMatch(user._id)}
                                                    className="botonTransparente text-white p-2 rounded-full size-8"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="size-4 morado"
                                                    >
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
