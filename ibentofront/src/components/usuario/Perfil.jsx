import React from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { Carousel } from 'primereact/carousel';
import { Button } from 'primereact/button';
import Favoritos from './Favoritos'; // Asegúrate de que la ruta sea correcta
import Guardados from './Guardados'; // Asegúrate de que la ruta sea correcta
import SideBar from '../usuario/sidebar'; // Asegúrate de que la ruta sea correcta
const Perfil = () => {

    
    const user = {
        name: 'Harry Styles',
        age: 31,
        genero:"H",
        cumpleanos: '1 de febrero',
        bio: 'Soy un cantante, compositor y actor británico. Me encanta la música y la moda, y disfruto de los desafíos creativos. La moda también es una gran parte de quién soy. Para mí, la ropa es una forma de expresión, de libertad. No hay reglas, solo cómo te sientes en ella. Amo los trajes llamativos, las perlas, los colores y todo lo que me haga sentir auténtico.',
        profilePicture: 'https://via.placeholder.com/150',
        pictures: ["/jeje.webp", "/juas.webp"],
        interests: ['Música', 'Moda', 'Actuación', 'Viajes', 'Fotografía', 'Arte', 'Cine', 'Literatura', 'Naturaleza', 'Animales','Deportes'],
       
    };

   

    const handleTabChange = (newIndex) => {
        setIndex(newIndex);
    }
    const [index, setIndex] = React.useState(0);
    
    const events = [
        {
            id: 1,
            name: 'Love yourself BTS',
            date: '2023-11-01',
            description: 'Un concierto de KPOP para que Gaby se emocione.',
            image: '/bts.jpeg',
            ubication: 'Estadio Azteca'
        },
        
        {
            id: 2,
            name: 'Love On Tour - Harry Styles',
            date: '2023-12-01',
            description: 'Harry Styles en su gira mundial Love On Tour, presentando su último álbum.',
            image: '/love.jpeg',
            ubication:'Palacio de los Deportes'
        },
        {
            id: 3,
            name: 'Torneo de League of Legends',
            date: '2025-01-01',
            description: 'Un torneo de LOL para que Gaby se emocione.',
            image: '/lol.jpeg',
            ubication:'Bellas Artes'
        }
    ];


        const eventsSaved = [
            {
                id: 1,
                name: 'Love yourself BTS',
                date: '2023-11-01',
                description: 'Un concierto de KPOP para que Gaby se emocione.',
                image: '/bts.jpeg',
                ubication: 'Estadio Azteca',
                buscando:'Sí'
            },
            
            {
                id: 2,
                name: 'Love On Tour - Harry Styles',
                date: '2023-12-01',
                description: 'Harry Styles en su gira mundial Love On Tour, presentando su último álbum.',
                image: '/love.jpeg',
                ubication:'Palacio de los Deportes',
                buscando:'Sí'
            },
            {
                id: 3,
                name: 'Torneo de League of Legends',
                date: '2025-01-01',
                description: 'Un torneo de LOL para que Gaby se emocione.',
                image: '/lol.jpeg',
                ubication:'Bellas Artes',
                buscando:'No'
            }
        ];

    

   

  
    const responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    return (
        <div  className="flex justify-center  min-h-screen overflow-x-auto" style={{ width: '100vw' }}>
            
            <div className="relative degradadoPerfil  flex flex-col items-center  shadow-md  shadow-t max-w-lg w-full">
                
                <div className=" relative w-full h-60 ">
                {/* Carrusel */}
                <div className="carousel rounded-box w-full h-60">
                    {user.pictures.map((picture, index) => (
                    <div className="carousel-item w-full" key={index}>
                        <img
                        src={picture}
                        className="w-full object-cover h-80 rounded-lg"
                        alt={`Foto ${index}`}
                        />
                    </div>
                    ))}
                </div>

                {/* Imagen de perfil sobrepuesta */}
                <div className="mr-5 absolute bottom-[-2rem] right-0 z-10 flex justify-end items-end">
                    <img
                    src="/minovio.jpeg"
                    className="border-4 w-30 h-30 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover"
                    alt={user.name}
                    />
                    <Link
                    to="../editarPerfil"
                    className="fondoFavorito border-3 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute bottom-0 right-0 bg-purple-300 text-white p-2 rounded-full"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sm:size-7 md:size-6  size-4 ">
  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>

                    </Link>
                    
                </div> 
                <SideBar className=""  />
                </div>

                <div className='p-5'>
                <div className="text-black w-full">
                    <h1 className="mt-5 text-3xl mb-3 font-semibold">{user.name}</h1>
                    <div className='space-x-2'>
                    <h1 className="flex space-x-2 text-lg ">
                        <div className="flex ">
                        {user.genero === 'H' ? (
                            <i className="pi pi-mars mt-1" style={{ color: 'slateblue' }}></i>
                        ) : (
                            <i className="pi pi-venus mt-1" style={{ color: 'pink' }}></i>
                        )}
                        </div>
                        <div>
                         {user.age} años
                         </div>
                         </h1>
                    </div>
                    <div className='flex space-x-2'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                        </svg>
                        <h1 className="text-lg">{user.cumpleanos}</h1>
                    </div>
                </div>
                <div className="  w-full mt-5" >
                <div>
                    <h2 className="w-full text-black text-lg mt-3 font-semibold">Mis intereses</h2>
                    <div className="mt-2 flex flex-wrap">
                        {user.interests.map((interest, index) => (
                            <h1 key={index} className="btn-off rounded-full text-center mb-1 px-2 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 w-full">
                    <h2 className="text-black text-lg font-semibold">Sobre mí</h2>
                    <p className='text-black text-justify'>{user.bio}</p> 
                
                    <div className="flex justify-start mb-5 space-x-5 mt-10 text-black">
                        <button onClick={() => handleTabChange(0)} className={index === 0 ? 'activo' : 'inactivo'}>
                            <span className='flex'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                                Mis Favoritos
                            </span>
                        </button>
                        <button onClick={() => handleTabChange(1)} className={index === 1 ? 'activo' : 'inactivo'}>
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
                            <Favoritos events={events} />
                        </div>
                    ) : (
                        <Guardados events={eventsSaved} />
                    )}
                </div>
                </div>
            </div>
            </div>
        </div>
    );
}

export default Perfil;
