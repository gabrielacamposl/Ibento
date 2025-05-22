import React, { use, useState,useEffect } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { InputSwitch } from "primereact/inputswitch";

import api from '../../api';
const Guardados = ({events}) => {
    const navigate = useNavigate();
    const [verify, setVerificar] = useState();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access');
    const fetchMode = async () => {
        try {
            const response = await api.get("match/modo/buscar/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                const modo =response.data.modo
                if(modo =='global'){
                    setChecked(false);
                }else{
                    setChecked(true);
                }
                
            }
        }
        catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
        }
    }
    fetchMode();
    }, []);
    
    const changeMode = async () => {
        const token = localStorage.getItem('access');
        try {
            const body = { modo: checked ? 'global' : 'evento' };
            const response = await api.post("match/modo/", body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                console.log("Modo cambiado a:", checked ? 'global' : 'evento');
            }
        } catch (error) {
            console.error("Error al cambiar el modo:", error);
        }
    }

     //VERIFICA SI EL USUARIO TIENE SU PERFIL DE ACOMPAÑANTE
    const isVerify = async () => {
             const token = localStorage.getItem('access');
            try { 
                const response = await api.get("estado-validacion/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    const userData = response.data;
                    const estado1 = userData.is_ine_validated 
                    const estado2 =userData.is_validated_camera;
                    
                    console.log(estado1, estado2)
                    if (estado1 == true && estado2 == true) {
                        setVerificar(true);
                        navigate('../verificar');
                    } else {
                        setVerificar(false);
                    }
                    
                }
            }
            catch (error) {
                console.error("Error al obtener los datos del usuario:", error);
            }
        }
    return (
        <div className=" justify-center text-black   ">
            <div className="relative flex flex-col items-center bg-white  rounded-xl max-w-lg w-full ">
                <h2 className="font-bold text-2xl w-full mb-4 text-center">Eventos a los que asistiré</h2>
                <div className=" flex-col w-full mb-2">
                    {checked ==false?(
                    <h2 className="text-base text-gray-700 text-center">
                        Modo Global: Aparecer a todas las personas que asistan a cualquier evento.
                    </h2>
                    ):(
                        <h2 className="text-base text-gray-700 text-center">
                        Modo Evento: Aparecer sólo a las personas que asistirán a los mismos eventos.
                    </h2>
                    )}

                </div>
                <label className="switch mb-4">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    onClick={changeMode}
                />
                <span className="slider"></span>
                </label>

                <div className="flex flex-col w-full gap-4">
                    {events.map(event => (
                        <div
                            key={event.id}
                            className="flex items-center mb-3 p-4 rounded-lg bg-gray-100 shadow relative transition hover:shadow-lg"
                        >
                            <img
                                src={event.image}
                                className="w-20 h-20 object-cover rounded-lg mr-4 border-2 border-purple-300"
                                alt={event.name}
                            />
                            <div className=" flex-col flex-1">
                                <h2 className="text-lg font-semibold text-purple-800">{event.title}</h2>
                                <p className="text-gray-600">{event.date}</p>
                                <p className="mb-7 text-gray-500">{event.ubication}</p>
                            </div>
                            <div className="mt-2">
                                {event.buscando === 'No' ? (
                                    <button
                                        onClick={() => isVerify()}
                                        className="absolute right-4 bottom-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition"
                                    >
                                        Buscar Match
                                    </button>
                                ) : (
                                    <button
                                        className="absolute right-4 bottom-0 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
                                    >
                                        Cancelar Match
                                    </button>
                                )}
                            </div>
                            {verify === false && (
                                <div className="fixed inset-0 z-60 flex items-center justify-center bg-gradient-to-b from-blue-600/70 via-purple-600/70 to-pink-600/70 backdrop-blur-md">
                                    <div className="text-center text-white bg-white/20 p-8 rounded-xl shadow-lg">
                                        <h1 className="text-3xl font-bold mb-2">Aún no cuentas con tu perfil de acompañantes</h1>
                                        <p className="mb-4">¡Créalo ahora!.</p>
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
                                            onClick={() => navigate('../verificar')}
                                        >
                                            Crear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Guardados;
