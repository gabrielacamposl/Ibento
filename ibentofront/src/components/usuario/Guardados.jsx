import React, { useState } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Guardados = ({events}) => {
    const navigate = useNavigate();
    const [valido, setValido] = useState('No');

    const matchDisponible = (valido) => {
        if(valido === 'No'){
            alert("No puedes buscar match, crea una cuenta de matches");
            navigate('../verificar');
            return ;
           
        }
      
        navigate('../matches');
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
                                <button onClick={() => matchDisponible(valido)} className="botonMatch absolute right-4 bottom-2 bg-green-500 text-white p-2 rounded fondoFavorito">
                                    Buscar Match
                                </button>
                            ) : (
                                <button className="cancelarMatch absolute right-4 bottom-0 bg-red-500 text-white p-2 rounded fondoFavorito">
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
