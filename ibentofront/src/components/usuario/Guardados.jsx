import React, { useState } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
const Guardados = ({events}) => {
    const navigate = useNavigate();
    const [verify, setVerificar] = useState();
   
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
        <div className="flex justify-cente text-black   ">
            <div className="relative flex flex-col items-center     max-w-lg w-full">
              

                <h2 className='font-bold text-lg w-full'>Eventos a los que asistiré</h2>
               

                <div className="flex flex-col w-full ">
                <h2 className=''>Aparecer sólo a las personas que asistirán a los mismos eventos</h2>
                </div>


                <div className="flex flex-col w-full ">
                    {events.map(event => (
                        <div key={event.id} className="flex items-center mb-3 p-2 rounded-lg Caja relative">
                            <img src={event.image} className="w-20 h-20 object-cover mr-4" alt={event.name} />
                            <div className="flex flex-col">
                                <h2 className="text-xl font-semibold">{event.title}</h2>
                                <p>{event.date}</p>
                                <p className='mb-7'>{event.ubication}</p>
                            </div>
                            <div className='mt-2 b-2'>
                            {event.buscando === 'No' ? (
                                <button onClick={() => isVerify()} className="botonMatch absolute right-4 bottom-2 bg-green-500 text-white p-2 rounded fondoFavorito">
                                    Buscar Match
                                </button>
                            ) : (
                                <button className="cancelarMatch absolute right-4 bottom-0 bg-red-500 text-white p-2 rounded fondoFavorito">
                                    Cancelar Match
                                </button>
                            )}
                           </div>
                             {verify == false && (
                                                    <div className="min-h-screen fixed inset-0 z-60 flex items-center justify-center bg-[linear-gradient(to_bottom,rgba(40,120,250,0.7),rgba(110,79,249,0.7),rgba(188,81,246,0.7))] backdrop-blur-md">
                                                    <div className="text-center text-white">
                                                        <h1 className="text-3xl font-bold">Aún no cuentas con tu perfil de acompañantes</h1>
                                                        <p className="mt-2">¡Créalo ahora!.</p>
                                                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={()=>navigate('../verificar')}>Crear</button>
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
