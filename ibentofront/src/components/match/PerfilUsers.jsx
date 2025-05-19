import React, { use, useState,useEffect } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import {buttonStyle, buttonStyleSecondary} from '../../styles/styles';
const verPerfil = () => {
    const nativate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
            const response = await api.post(`matches/${userId}/bloquear`, {
                method: 'POST',
            });
            if(response.status === 200){
                console.log('Usuario bloqueado');
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
        <div className="text-black flex justify-center  min-h-screen ">
            <div className="relative flex flex-col items-center    shadow-t max-w-lg w-full">
                <div className="relative h-100 w-full">
                    <img src={Array.isArray(currentUser.profile_pic) ? currentUser.profile_pic[currentImageIndex] : '/profile_empty.webp'} className="w-full h-full object-cover" alt={currentUser.nombre || ''} />
                    

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
                <h1 className="mt-2 mb-3 text-2xl font-semibold ">{currentUser.nombre} {currentUser.apellido}, {currentUser.edad}</h1>
                <div className="bg-white  p-2 w-full">
                    <h2 className="text-lg font-semibold">Sobre mí</h2>
                    <p className='text-justify'>{currentUser.descripcion}</p>

                {/*
                    <h2 className="text-lg mt-3 font-semibold">Eventos en común</h2>
                    <div className="mt-2 flex flex-wrap">
                        {user.eventosComun.map((comun, index) => (
                            <h1 key={index} className="btnAzul rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{comun}</h1>
                        ))}
                    </div>
                */}
                    <h2 className="text-lg mt-3 font-semibold">Intereses</h2>
                    <div className="mt-2 flex flex-wrap">
                        {Array.isArray(currentUser.preferencias_evento) && currentUser.preferencias_evento.map((interest, index) => (
                            <h1 key={index} className="btnRosa rounded-lg text-center mb-1 px-3 ml-3 mt-2 sm:w-auto negritas">{interest}</h1>
                        ))}
                    </div>
                   
                    
                    <h2 className="text-lg mt-3 font-semibold">Personalidad </h2>
                    <h1 className="btnVerde rounded-lg text-center mb-1 px-3 ml-3 mt-2 w-auto w-fit flex-w negritas">
                        {Array.isArray(currentUser.preferencias_generales) && currentUser.preferencias_generales.length > 12
                            ? currentUser.preferencias_generales[13].respuesta
                            : ''}
                    </h1>
                    <div className="mt-5 flex justify-between">
                        <button onClick={handleCancelMatch} className={buttonStyle}>
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
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center justify-center">
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
    );
}

export default verPerfil;
