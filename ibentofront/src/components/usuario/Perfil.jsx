import React, { useEffect,useState } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';

import { Carousel } from 'primereact/carousel';
import { Button } from 'primereact/button';
import Favoritos from './Favoritos'; // Asegúrate de que la ruta sea correcta
import Guardados from './Guardados'; // Asegúrate de que la ruta sea correcta
import SideBar from '../usuario/sidebar'; // Asegúrate de que la ruta sea correcta
import axios from 'axios';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
const Perfil = () => {

    
   const navigate = useNavigate();
    const [favoritos, setFavoritos] = useState([]);
    const [saveEvents, setSaveEvents] = useState([]);
    const [userPerfil, setUserPerfil] = useState([]);
    const [verificar, setVerificar] = useState(false);

useEffect(() => {
    const Perfil = async () => {
        try {
            const token = localStorage.getItem('access'); // Obtén el token JWT del almacenamiento local
            const response = await api.get('usuarios/info_to_edit/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setUserPerfil(response.data);
                
                console.log("Perfil obtenido:", response.data);
            } else {
                console.error("Error al obtener perfil");
            }
        } catch (error) {
            console.error("Error al obtener perfil:", error);
        }
    };
    Perfil();
}, []);



 useEffect(() => {
        const token = localStorage.getItem('access');
        const fetchVerify = async () => {
            try {
                const response = await api.get("usuarios/obtener_eventos_guardados/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    setSaveEvents(response.data["Eventos guardados"]);
                    console.log("Guardados",response.data["Eventos guardados"]);
                    
                }
            } catch (error) {
                console.error("Error al obtener los datos del usuario:", error);
            }
        }
        fetchVerify();
    }, []);

      

useEffect(() => {
    const fetchFavoritos = async () => {
        try {
            const token = localStorage.getItem('access'); // Obtén el token JWT del almacenamiento local
            const response = await api.get('perfil/favoritos/', {
                
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response);
            if (response.status === 200) {
                const favoritosData = response.data.map((favorito) => ({
                    _id: favorito._id,
                    title: favorito.title,
                    description: favorito.description,
                    place: favorito.place,
                    dates: favorito.dates,
                    imgs: favorito.imgs,
                    isFavorite: true
                    
                   
                }));
                setFavoritos(favoritosData);
                console.log("Favoritos obtenidos:", response.data);
            } else {
                console.error("Error al obtener favoritos");
            }
            
        } catch (error) {
            console.error("Error al obtener favoritos:", error);
        }finally {
            setLoading(false);
        }
    };
    fetchFavoritos();
}, []);

    const responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    const handleTabChange = (newIndex) => {
        setIndex(newIndex);
    }
    const [index, setIndex] = React.useState(0);
    
   



        const productTemplate = (product) => {
            return (
                <div className='relative '>
                    <img src={product} alt="Fotos" className="w-full h-72 object-cover " />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent "></div>
                </div>
            );
        };

const [loading, setLoading] = useState(true);
 if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <span className="text-black loading loading-ring loading-xl"></span>
      </div>
    );
  }


  //Convertir la fecha de cumpleaños AAAA-MM-DD a edad
    const calculateAge = (birthday) => {
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    return (
        <div  className="flex justify-center  min-h-screen overflow-x-auto" style={{ width: '100vw' }}>
            
            <div className="relative degradadoPerfil  flex flex-col items-center  shadow-md  shadow-t max-w-lg w-full">
                
                <div className=" relative w-full h-60 ">
                

                <div className="">
                    <Carousel value={Array.isArray(userPerfil?.profile_pic) ? userPerfil.profile_pic : [userPerfil?.profile_pic]} numVisible={1} numScroll={1} responsiveOptions={responsiveOptions} className="custom-carousel rounded-lg w-full" circular
                    autoplayInterval={3000} itemTemplate={productTemplate} showNavigators={false}/>
                </div>


            
                                <div className="mr-5 absolute bottom-[-2rem] right-0 z-10 flex justify-end items-end">
                                    
                                    <img
                                    src={Array.isArray(userPerfil?.profile_pic) && userPerfil.profile_pic.length > 0 ? userPerfil.profile_pic[0] : '/profile_empty.webp'}
                                    className=" w-35 h-35 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover"
                                    alt={userPerfil?.nombre || 'Default Profile'}
                                    />
                                   <Link
                                    to="../editarPerfil"
                                    className="absolute bottom-2 right-2 bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg text-white p-2 rounded-full hover:scale-105 hover:from-purple-500 hover:to-purple-700 transition-all duration-300"
                                    title="Editar perfil"
                                    >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6 md:w-7 md:h-7"
                                    >
                                        <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                        />
                                    </svg>
                                    </Link>


                                </div>
                                <SideBar />
                                </div>
                               

                                <div className='p-5 mt-5'>
                                <div className="text-black w-full">
                                    <h1 className="mt-5 text-3xl mb-3 font-semibold">{userPerfil.nombre + " " + userPerfil.apellido}</h1>
                                    <div className='space-x-2'>
                                    <h1 className="flex space-x-2 text-lg ">
                                        <div className="flex ">
                                        {userPerfil.gender == 'H' || userPerfil.gender == 'Hombre' ? (
                                            <i className="pi pi-mars mt-1" style={{ color: 'slateblue' }}></i>
                                        ) : (
                                            <i className="pi pi-venus mt-1" style={{ color: 'pink' }}></i>
                                        )}
                                        </div>
                                        <div>
                                         {calculateAge(userPerfil.birthday)} años
                                         </div>
                                         </h1>
                                    </div>
                                    <div className='flex space-x-2'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                                        </svg>
                                        <h1 className="text-lg">{userPerfil.birthday}</h1>
                                    </div>
                                </div>
                                <div className="  w-full mt-5" >
                                <div>
                                    <h2 className="w-full text-black text-lg mt-3 font-semibold">Preferencias de eventos</h2>
                                    <div className=" flex flex-wrap">
                                        {userPerfil.preferencias_evento && userPerfil.preferencias_evento.map((interest, index) => (
                                            <h1 key={index} className="btn-off rounded-full text-center mb-1 px-2 ml-3 mt-2 sm:w-auto negritas shadow">{interest}</h1>
                                        ))}
                                    </div>
                                </div>

                                 {/* <div>
                                    <h2 className="w-full text-black text-lg mt-3 font-semibold">Preferencias personales</h2>
                                    <div className=" flex flex-wrap">
                                        {userPerfil.preferencias_evento && userPerfil.preferencias_evento.map((interest, index) => (
                                            <h1 key={index} className="btn-off rounded-full text-center mb-1 px-2 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                                        ))}
                                    </div>
                                </div> */}
                                 <h2 className="text-black text-lg font-semibold mt-2">Sobre mí</h2>
                                 <p className='text-black text-justify ml-5'>{userPerfil.description}</p> 
                

                <div className="bg-white p-5 w-full">
                   
                    <div className="flex justify-start mb-5 space-x-5 mt-10 text-black">
                        <button onClick={() => handleTabChange(0)} className={index === 0 ? 'activo' : 'inactivo'}>
                            <span className='flex'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                                Mis Favoritos
                            </span>
                        </button>
                        <button onClick={() => {handleTabChange(1); }} className={index === 1 ? 'activo' : 'inactivo'}>
                            <span className='flex'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                                </svg>
                                Mis Guardados
                            </span>
                        
                        </button>
                    </div>
                    {index === 0 ? (
                        <div>
                            <Favoritos events={favoritos} />
                        </div>
                    ) : (
                        <Guardados events={saveEvents} verify={verificar} />
                    )}
                </div>
                </div>
            </div>
            </div>
        </div>
    );
};
export default Perfil;
