import React, { use, useState,useEffect } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../api';
import { Carousel } from 'primereact/carousel';
import { useNavigate } from 'react-router-dom';
import {buttonStyle, buttonStyleSecondary} from '../../styles/styles';
const verPerfil = () => {
    const nativate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const productTemplate = (product) => {
        return (
            <div className='relative w-full h-64'>
                <img src={product} alt="Fotos" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
        );
    };
    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentUser.profile_pic.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentUser.profile_pic.length) % currentUser.profile_pic.length);
    };

    const [showDialog, setShowDialog] = useState(false);

    const [showDialogBlock, setShowDialogBlock] = useState(false);

    const handleCancelMatch = () => {
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
    };

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


    const [messageBlock, setMessageBlock] = useState(false);

//CONSULTAS DEL BACKEND CON EL USUARIO EN CUESTION
    const [currentUser, setCurrentUser] = useState([]);
    const [matchID, setMatchID] = useState([]);
    const queryID = new URLSearchParams( window.location.search );
    const userId = queryID.get('id');
    const Id_Match = queryID.get('match');
   
    //Obtener el id del match para realizar acciones como bloquear, eliminar match y reportar
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('access');
            try {
                const response = await api.get(`matches/${Id_Match}/obtener/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.status === 200) {
                    setMatchID(response.data);
                    console.log(response.data);
                } else {
                    console.error('Error fetching user data:', response.status);
                }
            }
            catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    //Obtenemos la informacion del usuario
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('access');
            try {
                const response = await api.get(`usuarios/${userId}/info/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.status === 200) {
                    setCurrentUser(response.data[0]);
                    console.log(response.data);
                } else {
                    console.error('Error fetching user data:', response.status);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    //Funciones para eliminar el match, bloquear y reportar al usuario
    //BLOQUEAR USUARIO
    const handleBlockUser = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await api.post(`bloquear/`,
                { usuario_bloqueado: userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                console.log('Usuario bloqueado');
                console.log(response);
            }
        } catch (error) {
            console.error(error);
        }
    }
    //REPORTAR USUARIO
    const handleReportUser = async () => {
        try {
            const response = await api.post(`users/${userId}/report`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to report user');
            }
        } catch (error) {
            console.error(error);
        }
    }
    //ELIMINAR MATCH
    const [InfoDelete, setInfoDelete] = useState([]);
    const deleteMatch = async () => {
        const token = localStorage.getItem('access');
        setMessageBlock(true);
        try {
            const response = await api.delete(`matches/${matchID}/eliminar/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                setInfoDelete(response.data);
                console.log('Match eliminado');
                setTimeout(() => {
                    nativate("../match");
                }, 3000);

              

            }
        } catch (error) {
            console.error(error);
        }
       
    };

    if (!currentUser || Object.keys(currentUser).length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="text-gray-500">Cargando...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex justify-center items-start ">
            <div className="max-w-lg w-full bg-white shadow-lg overflow-hidden">
                {/* Header con carrusel de fotos */}
                <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-b-3xl overflow-visible">
                    {/* Botón de 3 puntitos */}
                    <button
                        className="absolute top-4 right-4 z-30 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={handleCancelDetails}
                        aria-label="Más opciones"
                        type="button"
                    >
                        {/* Heroicons outline: EllipsisVertical */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>

                    </button>
                    <div className="w-full h-full overflow-hidden rounded-b-3xl">
                        <Carousel 
                            value={Array.isArray(currentUser?.profile_pic) ? currentUser.profile_pic : [currentUser?.profile_pic]} 
                            numVisible={1} numScroll={1} responsiveOptions={responsiveOptions} 
                            className="custom-carousel rounded-b-3xl w-full h-full" circular
                            autoplayInterval={3000} itemTemplate={productTemplate} showNavigators={false} 
                        />
                        {/* Navegación de fotos */}
                    </div>
                    {/* Foto de perfil flotante */}
                    <div className="absolute bottom-[-4rem] left-1/2 transform -translate-x-1/2 z-20">
                        <img
                            src={Array.isArray(currentUser.profile_pic) && currentUser.profile_pic.length > 0 ? currentUser.profile_pic[0] : '/profile_empty.webp'}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                            alt={currentUser.nombre || 'Default Profile'}
                        />
                    </div>
                </div>

                {/* Información del usuario */}
                <div className="px-6 pt-20 pb-6">
                    {/* Nombre y edad */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            {currentUser.nombre} {currentUser.apellido}
                        </h1>
                        <div className="flex items-center justify-center space-x-3 text-gray-600">
                            <div className="flex items-center space-x-1">
                                
                                <span className="text-lg font-medium">{currentUser.edad} años</span>
                            </div>
                        </div>
                    </div>

                    {/* Sobre mí */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-blue-500 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            Sobre mí
                        </h2>
                        <p className="text-gray-600 text-justify leading-relaxed pl-7">
                            {currentUser.descripcion}
                        </p>
                    </div>

                    {/* Intereses */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-purple-500 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                            </svg>
                            Intereses
                        </h2>
                        <div className="flex flex-wrap gap-2 pl-7">
                            {Array.isArray(currentUser.preferencias_evento) && currentUser.preferencias_evento.map((interest, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Personalidad */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-green-500 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                            </svg>
                            Personalidad
                        </h2>
                        <div className="flex flex-wrap gap-2 ">
                            {Array.isArray(currentUser.preferencias_generales) && currentUser.preferencias_generales.length > 0
                                ? (
                                    <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                        {currentUser.preferencias_generales[currentUser.preferencias_generales.length - 1].respuesta}
                                    </span>
                                )
                                : null}
                        </div>
                         {/* Botón Eliminar Match */}
                    <div className="mt-2  mb-15 flex justify-center gap-4">
                        <button onClick={handleCancelMatch} className="btn-custom bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-all duration-300">
                            Eliminar Match
                        </button>
                    </div>
                </div>
                    </div>

                   


                <Dialog open={showDialog} onClose={setShowDialog} className="items-center  w-full relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
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
                                                Eliminar Match
                                            </DialogTitle>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                ¿Está seguro de eliminar su match con {currentUser.nombre}?
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center flex justify-center">
                                    <button
                                        type="button"
                                        onClick={()=> {handleCloseDialog(); deleteMatch(); }}
                                        className="inline-flex w-full btn-custom justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs  sm:ml-3 sm:w-auto"
                                    >
                                        Eliminar Match
                                    </button>
                                    <button
                                        type="button"
                                        data-autofocus
                                        onClick={handleCloseDialog}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>

                <Dialog open={showDialogBlock} onClose={setShowDialogBlock} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
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
                                                ¿Está seguro de bloquear al usuario {currentUser.nombre}?
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => { handleBlockUser(currentUser._id); handleCloseBlock(); handleCloseDetails(); }}
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
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
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



                {/*Mensaje de confirmación de eliminación de cuenta */}

                <Dialog open={messageBlock} onClose={() => setMessageBlock(false)} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-xl">
                    <DialogTitle as="h3" className="text-base font-semibold text-center text-gray-900">
                                                            {InfoDelete.message}
                                                        </DialogTitle>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">Conversaciones eliminadas: {InfoDelete.conversaciones_eliminadas}</p>
                        <p className="text-sm text-gray-600">Interacciones eliminadas: {InfoDelete.interacciones_eliminadas}</p>
                        <p className="text-sm text-gray-600">Mensajes eliminadas: {InfoDelete.mensajes_eliminados}</p>
              
                    </div>
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                        onClick={() => setMessageBlock(false)}
                        className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
                        >
                        Cancelar
                        </button>
                        <button
                        onClick={() => {
                            // Lógica de eliminación
                            setMessageBlock(false);
                        }}
                        className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                        >
                        Eliminar
                        </button>
                    </div>
                    </Dialog.Panel>
                </div>
                </Dialog>


            </div>
        </div>
    );
}

export default verPerfil;
