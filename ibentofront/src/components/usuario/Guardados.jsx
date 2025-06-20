import React, { use, useState, useEffect } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { InputSwitch } from "primereact/inputswitch";

import api from '../../api';
const Guardados = ({ events }) => {
    const [eventsCopy, setEventsCopy] = useState([...events]);
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
                    const modo = response.data.modo
                    if (modo == 'global') {
                        setChecked(false);
                    } else {
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
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', options);
    }

    //VERIFICA SI EL USUARIO TIENE SU PERFIL DE ACOMPAÑANTE
  useEffect(() => {
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
                const estado2 = userData.is_validated_camera;

                console.log(estado1, estado2)
                if (estado1 == true && estado2 == true) {
                    setVerificar(true);
                   
                } else {
                    setVerificar(false);
                }

            }
        }
        catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
        }
    }
    isVerify();
    }, []);
    const bucarMatch = async (eventId, index) => {
        console.log("Buscar match para el evento:", eventId, index);
        //cambiar a true el estado del evento
        eventsCopy[index].status = true;
        setEventsCopy([...eventsCopy]);
        const token = localStorage.getItem('access');
        try {
            const response = await api.post(`usuarios/agregar_eventos_match/?idEvent=${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                console.log("Match creado");
            }
        } catch (error) {
            console.error("Error al crear el match:", error);
        }


    }
    const cancelarMatch = async (eventId, index) => {
        console.log("Cancelar match para el evento:", eventId, index);
        eventsCopy[index].status = false;
        setEventsCopy([...eventsCopy]);
        //Eliminar evento de evento para buscar match
        const token = localStorage.getItem('access');
        try {
            const response = await api.delete(`usuarios/eliminar_eventos_match/?idEvent=${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                console.log("Match cancelado");
            }
        } catch (error) {
            console.error("Error al cancelar el match:", error);
        }
    }
    return (
        <div className=" justify-center text-black bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center gap-4 mb-10">
            <div className="relative flex flex-col items-center bg-white  rounded-xl max-w-lg w-full ">
                <h2 className="font-bold text-2xl w-full mb-4 text-center">Eventos a los que asistiré</h2>
                {eventsCopy.length === 0 ? (
                    <div className="col-span-full text-center py-2">
                        <div className="text-gray-600 px-4 py-3 rounded">
                            <p className="font-medium">No tienes eventos guardados</p>
                            <p className="text-sm">Para obtener modos de busqueda para match, completa tu perfil.</p>
                        </div>
                    </div>
                ) : (
                    verify ? (
                    <div className="relative flex flex-col items-center bg-white  rounded-xl max-w-lg w-full ">
                       
                        <div className=" flex-col w-full mb-2">
                            {checked == false ? (
                                <h2 className="text-base text-gray-700 text-center">
                                    Modo Global: Aparecer a todas las personas que asistan a cualquier evento.
                                </h2>
                            ) : (
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
                    </div>
                    ) : (
                    <div className="mb-12 w-full h-16 rounded-lg flex flex-col items-center">
                        <h2 className="text-base text-gray-700 text-center mb-4">
                            Verifica tu perfil para acceder a todas las funcionalidades!
                        </h2>
                        
                    </div>
                    )
                )}
           
                <div className="flex flex-col w-full gap-4">
                    {eventsCopy.map((event, index) => (
                        <div
                            key={event._id}
                            className="flex items-center mb-3 p-4 rounded-lg bg-gray-100 shadow relative transition hover:shadow-lg cursor-pointer"
                        >

                            <img
                                src={event.imgs[0]}
                                className="w-20 h-20 object-cover rounded-lg mr-4 border-2 border-purple-300"
                                alt={event.name}
                            />

                            <Link to={`../eventos/${event._id}`} className="">
                                <div className="flex-col flex-1">
                                    <h2 className="text-lg font-semibold text-purple-800">{event.title}</h2>
                                    <p className="text-gray-600">{formatDate(event.dates[0])}</p>
                                    <p className="mb-7 text-gray-500">{event.place}</p>
                                </div>
                            </Link>
                            <div className="mt-2">

                                {event.status === false ? (
                                    <button
                                        disabled={checked === false}
                                        onClick={() => bucarMatch(event._id, index)}
                                        className={`absolute right-4 bottom-2 px-4 py-2 rounded-lg shadow transition text-white ${checked === false
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                    >
                                        Buscar Match
                                    </button>
                                ) : (
                                    <button
                                        disabled={checked === false}
                                        onClick={() => cancelarMatch(event._id, index)}
                                        className={`absolute right-4 bottom-2 px-4 py-2 rounded-lg shadow transition text-white ${checked === false
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                    >
                                        Cancelar Match
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Guardados;
