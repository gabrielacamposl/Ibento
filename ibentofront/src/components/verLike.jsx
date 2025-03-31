import React, { useState } from 'react';
import "../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
const Like = () => {
    const navigate = useNavigate();

    const user = {
        name: 'Harry Styles',
        age: 31,
        bio: 'Soy un cantante, compositor y actor británico. Me encanta la música y la moda, y disfruto de los desafíos creativos. La moda también es una gran parte de quién soy. Para mí, la ropa es una forma de expresión, de libertad. No hay reglas, solo cómo te sientes en ella. Amo los trajes llamativos, las perlas, los colores y todo lo que me haga sentir auténtico.',
        pictures: ["/minovio.jpeg", "/juas.webp", "/harry.jpeg"],
        interests: ['Fotografía', 'Arte', 'Cine', 'Literatura', 'Naturaleza', 'Animales','Deportes'],
        eventosComun: ['Fiesta de disfraces', 'Karaoke', 'Cine al aire libre', 'Picnic'],
        personalidad: ['ISFJ']
    };

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % user.pictures.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + user.pictures.length) % user.pictures.length);
    };

    const [showDialogBlock, setShowDialogBlock] = useState(false);

  


    const handleCancelBlock = () => {
        setShowDialogBlock(true);
    };

    const handleCloseBlock = () => {
        setShowDialogBlock(false);
    };


    const [showDialogDetails, setShowDialogDetail] = useState(false);
    const handleCancelDetails = () => {
        setShowDialogDetail(true);
    };

    const handleCloseDetails = () => {
        setShowDialogDetail(false);
    };

    const [showDialogReport, setShowDialogReport] = useState(false);
    const handleCancelReport = () => {
        setShowDialogReport(true);
    };



    const handleLike= () => {
        navigate('/itsMatch');
    };

    const handleDislike = () => {
        navigate('/verMatches');
    }


    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="relative flex flex-col items-center mt-5 shadow-md p-5 shadow-t max-w-lg w-full">
                <div className="relative h-100 w-full">
                    <img src={user.pictures[currentImageIndex]} className="w-full h-full object-cover" alt={user.name} />
                    

                    <button onClick={handleCancelDetails} className="absolute right-0 top-0 transform  text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>

                    </button>
                    
                    <button onClick={handlePrev} className="absolute left-0 top-1/2 transform -translate-y-1/2 btnTransparente text-white p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button onClick={handleNext} className="absolute right-0 top-1/2 transform -translate-y-1/2 btnTransparente text-white p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-wrap justify-center space-x-10">
                                <button onClick={handleDislike} className="border rojo p-2 rounded-full shadow-xl size-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.7" stroke="currentColor" className="size-10 w-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <button onClick={handleLike} className="border morado ml-20  p-2  shadow-xl  rounded-full size-14">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.7" stroke="currentColor" className="size-10z w-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/> 
                                    </svg>
                                </button>
                            </div>


                <h1 className="mt-2 mb-3 text-2xl font-semibold ">{user.name}, {user.age}</h1>
                <div className="bg-white shadow-xl p-2 w-full">
                    <h2 className="text-lg font-semibold">Sobre mí</h2>
                    <p>{user.bio}</p>

                    <h2 className="text-lg mt-3 font-semibold">Eventos en común</h2>
                    <div className="mt-2 flex flex-wrap">
                        {user.eventosComun.map((comun, index) => (
                            <h1 key={index} className="btnAzul rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{comun}</h1>
                        ))}
                    </div>

                    <h2 className="text-lg mt-3 font-semibold">Intereses</h2>
                    <div className="mt-2 flex flex-wrap">
                        {user.interests.map((interest, index) => (
                            <h1 key={index} className="btnRosa rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                        ))}
                    </div>
                    
                    <h2 className="text-lg mt-3 font-semibold">Personalidad </h2>
                    <h1 className="btnVerde rounded-lg text-center mb-1 px-3 ml-3 mt-2 w-auto w-fit flex-w negritas">{user.personalidad}</h1>
                    <div className="mt-1 flex justify-center">
                        
                    </div>
                </div>
            </div>


        

            
            <Dialog open={showDialogBlock} onClose={setShowDialogBlock} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden  rounded bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        >
                            <div className=" degradadoPerfil  px-2 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full btn-custom sm:mx-0 sm:size-10">
                                        <ExclamationTriangleIcon aria-hidden="true" className="size-6" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <DialogTitle as="h3" className="text-base font-semibold text-center text-gray-900">
                                            Bloquear usuario
                                        </DialogTitle>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                            ¿Está seguro de bloquear al usuario {user.name}?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => { handleCloseBlock(); handleCloseDetails(); }}
                                    className="inline-flex w-full btn-custom justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs  sm:ml-3 sm:w-auto"
                                >
                                    Bloquear
                                </button>
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={()=>{handleCloseBlock(); handleCloseDetails()}}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>






            <Dialog open={showDialogDetails} onClose={setShowDialogDetail} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden  rounded bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        >
                            
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-auto items-center justify-center">
                                <button
                                    type="button"
                                    onClick={handleCancelBlock}
                                    className="inline-flex w-full  justify-center rounded-md btnRed px-3 py-2 text-sm font-semibold text-white shadow-xs  sm:ml-3 sm:w-auto"
                                >
                                    Bloquear
                                </button>
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={handleCancelReport}
                                    className="inline-flex w-full  justify-center rounded-md btnRed px-3 py-2 text-sm font-semibold text-white shadow-xs  sm:ml-3 sm:w-auto"
                                >
                                    Reportar
                                </button>

                                
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>


        </div>
    );
}

export default Like;
