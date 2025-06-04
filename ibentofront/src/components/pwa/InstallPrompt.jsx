import React, { useEffect, useState } from 'react'
import usePWAInstall from '../../hooks/usePWAInstall'

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installPWA, canInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Mostrar el prompt después de un delay si la app es instalable
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Esperar 5 segundos antes de mostrar

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  useEffect(() => {
    // Solicitar permiso para notificaciones push cuando sea instalable
    if (isInstallable && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('[Notificaciones] Permiso:', permission)
      })
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // No mostrar de nuevo en esta sesión
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // No mostrar si ya está instalada o si fue rechazada en esta sesión
  if (isInstalled || !canInstall || !showPrompt) return null;

  // Verificar si ya fue rechazada en esta sesión
  if (sessionStorage.getItem('pwa-prompt-dismissed')) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-xl p-4 transform transition-all duration-300 ease-in-out">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">
          📱
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            ¡Instala Ibento!
          </h3>
          <p className="text-sm text-indigo-100 mb-3">
            Obtén acceso rápido y disfruta de una experiencia nativa en tu dispositivo
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors flex-1"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-800 transition-colors"
            >
              Más tarde
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-indigo-200 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
