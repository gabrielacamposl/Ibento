// Componente para inicializar el Service Worker y manejar notificaciones offline
import React, { useEffect, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const ServiceWorkerProvider = ({ children }) => {
    const toast = useRef(null);
    const [swRegistration, setSwRegistration] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        // Registrar Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/src/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                    setSwRegistration(registration);

                    // Escuchar actualizaciones del SW
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true);
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });

            // Escuchar mensajes del SW
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'SW_UPDATED') {
                    setUpdateAvailable(true);
                    showUpdateNotification();
                }
            });
        }

        // Listeners para conexión
        const handleOnline = () => {
            setIsOnline(true);
            showConnectivityNotification(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
            showConnectivityNotification(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const showUpdateNotification = () => {
        if (toast.current) {
            toast.current.show({
                severity: 'info',
                summary: 'Actualización disponible',
                detail: 'Hay una nueva versión de Ibento disponible. Actualiza para obtener las últimas funciones.',
                sticky: true,
                content: (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <i className="pi pi-refresh text-blue-500" />
                            <div>
                                <div className="font-semibold">Actualización disponible</div>
                                <div className="text-sm text-gray-600">Nueva versión de Ibento lista para instalar</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                                onClick={handleUpdate}
                            >
                                Actualizar ahora
                            </button>
                            <button
                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                                onClick={() => toast.current.clear()}
                            >
                                Más tarde
                            </button>
                        </div>
                    </div>
                )
            });
        }
    };

    const showConnectivityNotification = (online) => {
        if (toast.current) {
            if (online) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Conexión restaurada',
                    detail: 'Ya tienes conexión a internet. Los datos se sincronizarán automáticamente.',
                    life: 3000
                });
            } else {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Sin conexión',
                    detail: 'Trabajando en modo offline. Algunos datos pueden estar desactualizados.',
                    life: 5000
                });
            }
        }
    };

    const handleUpdate = () => {
        if (swRegistration && swRegistration.waiting) {
            swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    };

    // Limpiar datos expirados cada 30 minutos
    useEffect(() => {
        const cleanupInterval = setInterval(async () => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const messageChannel = new MessageChannel();
                navigator.serviceWorker.controller.postMessage(
                    { type: 'CLEAN_EXPIRED_DATA' },
                    [messageChannel.port2]
                );
            }
        }, 30 * 60 * 1000); // 30 minutos

        return () => clearInterval(cleanupInterval);
    }, []);

    return (
        <>
            {children}
            <Toast ref={toast} position="top-right" />
            
            {/* Notificación de actualización flotante */}
            {updateAvailable && (
                <div className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-xl max-w-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <i className="pi pi-refresh text-xl" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">Nueva actualización</h4>
                            <p className="text-sm text-blue-100 mb-3">
                                Hay una versión mejorada de Ibento lista para instalar
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
                                >
                                    Actualizar
                                </button>
                                <button
                                    onClick={() => setUpdateAvailable(false)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Más tarde
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceWorkerProvider;
