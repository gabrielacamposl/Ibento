import React, { useState ,useEffect} from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import api from '../../api';
const Favoritos = ({ events }) => {
    const [favoritosCheck, setFavoritosCheck] = useState(true);
    const [FavoritesCopy, setFavoriteCopy] = useState([...events]);


// Sincronizar FavoritesCopy con events cuando events cambie
    useEffect(() => {
        setFavoriteCopy([...events]);
    }, [events]);

    function formartDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', options);
    }

    const handleRemoveFavorite = async (eventId, index) => {

        const token = localStorage.getItem("access");
        try {
            const response = await api.delete(`eventos/${eventId}/dislike/`, {

                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status == 200) {
                console.log('Evento eliminado de favoritos:', eventId);
                FavoritesCopy[index].isFavorite = false;
                setFavoriteCopy([...FavoritesCopy]);
                console.log(FavoritesCopy);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el evento de favoritos');
        }
    };

    const handleAddFavorite = async (eventId, index) => {
        const token = localStorage.getItem("access");
        try {
            const response = await api.post(`eventos/${eventId}/like/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status == 200) {
                console.log('Evento agregado a favoritos:', eventId);
                FavoritesCopy[index].isFavorite = true;
                setFavoriteCopy([...FavoritesCopy]);
                console.log(FavoritesCopy);
            }
        }
        catch (error) {
            console.error('Error:', error);
            alert('Error al agregar el evento a favoritos');
        }
    }



    return (
        <div className="text-black bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center gap-4 mb-10">
            <div className="relative flex flex-col items-center   max-w-lg w-full">
                {FavoritesCopy.length === 0 ? (
                    <div className="col-span-full text-center py-2">
                        <div className="text-gray-600 px-4 py-3 rounded">
                            <p className="font-medium">No tienes eventos favoritos</p>
                            <p className="text-sm">Tus eventos agregados a favoritos apareceran aqui.</p>
                        </div>
                    </div>
                ) : (
                    <div className=" flex flex-col w-full gap-4 z-0">
                        {FavoritesCopy.map((event, index) => (

                            <div key={event._id} className="flex items-center mb-3 p-4 rounded-lg bg-gray-100 shadow relative transition hover:shadow-lg cursor-pointer">

                                {event.imgs && event.imgs[0] && (
                                    <img src={event.imgs[0]} className="w-20 h-20  object-cover mr-4" alt={event.title} />
                                )}
                                <Link to={`../eventos/${event._id}`} className="">
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-semibold text-purple-800">{event.title}</h2>
                                        {event.dates && event.dates[0] && (
                                            <p>{formartDate(event.dates[0])}</p>
                                        )}
                                        <p>{event.place}</p>
                                    </div>
                                </Link>
                                {event.isFavorite == true ? (
                                    <button
                                        className="z-60 absolute right-4 bottom-2  bg-gray-800 text-white p-2 rounded-full fondoFavorito"
                                        onClick={() => handleRemoveFavorite(event._id, index)}
                                    >

                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        className="z-60 absolute right-4 bottom-2  bg-gray-800 text-white p-2 rounded-full fondoFavorito"
                                        onClick={() => handleAddFavorite(event._id, index)} >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                        </svg>


                                    </button>
                                )}
                            </div>


                        ))}
                    </div>
                )}
            </div>



        </div>

    );
}

export default Favoritos;
