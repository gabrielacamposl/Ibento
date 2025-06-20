import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import "../../assets/css/botones.css";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../api';
import Terminos from '../accounts/Terminos';

export default function PositionDemo() {
    
    const [visibleRight, setVisibleRight] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showDialogSesion, setShowDialogSesion] = useState(false);
    const [showTerminosDialog, setShowTerminosDialog] = useState(false);


    const handleCancel = () => {
        setShowDialog(true);
    };    const handleCloseDialog = () => {
        setShowDialog(false);
    };

    const handleCancelSesion = () => {
        setShowDialogSesion(true);
    };const handleCloseSesion = () => {
        setShowDialogSesion(false);
    };

    const handleOpenTerminos = () => {
        setShowTerminosDialog(true);
        setVisibleRight(false); // Cerrar el sidebar
    };

    const handleCloseTerminos = () => {
        setShowTerminosDialog(false);
    };


const logout = async () => {
    console.log(localStorage.getItem('access'))
    try {
      const token = localStorage.getItem('access');
      await api.post(
        'logout/',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      alert('Sesión cerrada');
      window.location.href = '/';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('access');
      await api.delete('eliminar_cuenta/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      alert('Cuenta eliminada exitosamente');
      window.location.href = '/';
    } catch (err) {
      console.error('Error al eliminar la cuenta:', err);
      alert('Error al eliminar la cuenta. Por favor, inténtelo de nuevo más tarde.');
    }
  };

  

   

    
    return (
        <div className=" z-0 w-full flex justify-center items-center  ">
              <div className="flex space-x-1 gap-2 absolute top-4 right-4 z-50">
               <Button 
                onClick={() => setVisibleRight(true)}
                className="menu-button-enhanced bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:scale-110 p-3 rounded-xl"
                aria-label="Abrir menú de configuración"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    minWidth: '48px',
                    minHeight: '48px'
                }}
             >
             <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2.5" 
                stroke="currentColor" 
                className="size-6 text-purple-600 hover:text-purple-800 transition-colors duration-200"
             >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
             </svg>
             </Button>
            </div>

            <Sidebar visible={visibleRight} position="right"   role="region" className='degradadoPerfil sidebar colorRosa  ' onHide={() => setVisibleRight(false)} showCloseIcon={false}>                <button 
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white/95 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 hover:border-purple-300" 
                    onClick={() => setVisibleRight(false)}
                    aria-label="Cerrar menú de configuración"
                >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="2.5" 
                    stroke="currentColor" 
                    className="size-5 text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                </button>
           

                <div className=" mt-10 flex flex-col p-8 gap-5">
                <h1 className='text-3xl'>Configuración</h1>
                    <button className="flex space-x-2" onClick={() => setVisibleRight(false)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                            />
                        </svg>
                        <span className='text-black text-bold'>Usuarios Bloqueados</span>
                    </button>
                    <Button className='space-x-2' onClick={() => setVisibleRight(false)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                            />
                        </svg>
                        <span className='text-black text-bold'>Servicio al Cliente</span>
                    </Button>                    <Button className='space-x-2' onClick={handleOpenTerminos}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                            />
                        </svg>
                        <span className='text-black text-bold'>Términos y Privacidad</span>
                    </Button>
                    <Button className='space-x-2' onClick={() => { handleCancel();  setVisibleRight(false); }} >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                            />
                        </svg>
                        <span  className='text-black text-bold'>Eliminar Cuenta</span>
                    </Button>
                    <Button className=' justify-end  space-x-2' onClick={() => { handleCancelSesion();  setVisibleRight(false); }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <span  className='text-black text-bold'>Cerrar Sesión</span>
                    </Button>
                </div>
               
           
            
        
            </Sidebar>
            
               <Dialog open={showDialog} onClose={setShowDialog} className="fixed inset-0 flex items-center justify-center z-10">
                              <DialogBackdrop
                                  transition
                                  className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                              />
                              <div className="relative z-10 w-screen overflow-y-auto">
                                  <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
                                      <DialogPanel
                                          transition
                                          className="relative transform overflow-hidden rounded bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                      >
                                          <div className="degradadoPerfil px-2 pt-5 pb-4 sm:p-6 sm:pb-4">
                                              <div className="sm:flex sm:items-start">
                                                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full btn-custom sm:mx-0 sm:size-10">
                                                      <ExclamationTriangleIcon aria-hidden="true" className="size-6" />
                                                  </div>
                                                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                      <DialogTitle as={"h3" as React.ElementType} className="text-base font-semibold text-center text-gray-900">
                                                          Eliminar Cuenta
                                                      </DialogTitle>
                                                      <div className="mt-2">
                                                          <p className="text-sm text-gray-500">
                                                          ¿Está seguro de eliminar su cuenta? Se borrarán todos sus datos de la plataforma.
                                                          </p>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center justify-center">
                                              <button
                                                  type="button"
                                                  onClick={()=> handleDeleteAccount()}
                                                  className="inline-flex w-full btn-custom justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs  sm:ml-3 sm:w-auto"
                                              >
                                                  Eliminar Cuenta
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






                          <Dialog open={showDialogSesion} onClose={setShowDialogSesion} className="fixed inset-0 flex items-center justify-center z-10">
                              <DialogBackdrop
                                  transition
                                  className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                              />
                              <div className="relative z-10 w-screen overflow-y-auto">
                                  <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
                                      <DialogPanel
                                          transition
                                          className="relative transform overflow-hidden rounded bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                      >
                                          <div className="degradadoPerfil px-2 pt-5 pb-4 sm:p-6 sm:pb-4 z-30">
                                              <div className="sm:flex sm:items-start">
                                                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full btn-custom sm:mx-0 sm:size-10">
                                                      <ExclamationTriangleIcon aria-hidden="true" className="size-6" />
                                                  </div>
                                                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                      <DialogTitle as={"h3" as React.ElementType} className="text-base font-semibold text-center text-gray-900">
                                                            Cerrar Sesión
                                                      </DialogTitle>
                                                      <div className="mt-2">
                                                          <p className="text-sm text-gray-500">
                                                          ¿Está seguro de cerrar sesión?
                                                          </p>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center justify-center">
                                              <button
                                                  type="button"
                                                  onClick={() =>{ handleCloseSesion(); logout();}}
                                                  className="inline-flex w-full btn-custom justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs  sm:ml-3 sm:w-auto"
                                              >
                                                    Cerrar Sesión
                                              </button>
                                              <button
                                                  type="button"
                                                  data-autofocus
                                                  onClick={() =>{ handleCloseSesion()}}
                                                  
                                                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                              >
                                                  Cancelar
                                              </button>
                                          </div>
                                      </DialogPanel>
                                  </div>
                              </div>                          </Dialog>

            {/* Dialog de Términos y Privacidad */}
            <Dialog open={showTerminosDialog} onClose={handleCloseTerminos} className="fixed inset-0 flex items-center justify-center z-50">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />
                <div className="relative z-10 w-screen overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-4xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">                                <div className="flex justify-between items-center mb-4">
                                    <DialogTitle as={"h3" as React.ElementType} className="text-lg font-medium leading-6 text-gray-900">
                                        Términos y Condiciones - Aviso de Privacidad
                                    </DialogTitle>
                                    <button
                                        type="button"
                                        onClick={handleCloseTerminos}
                                        className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <span className="sr-only">Cerrar</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <Terminos />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleCloseTerminos}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
              
            

        </div>
    )
}