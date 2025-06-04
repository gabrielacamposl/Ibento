// hooks/usePWAInstall.js - Hook para manejar la instalación de PWA
import { useState, useEffect } from 'react';

function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si la app ya está instalada
    const checkIfInstalled = () => {
      // Método 1: Display mode standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Método 2: iOS Safari standalone
      const isIOSStandalone = window.navigator.standalone === true;
      
      // Método 3: Android TWA
      const isAndroidTWA = document.referrer.includes('android-app://');
      
      return isStandalone || isIOSStandalone || isAndroidTWA;
    };

    setIsInstalled(checkIfInstalled());

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      console.log('💾 PWA instalable detectada');
    };

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      
      console.log('✅ PWA instalada exitosamente');
      
      // Opcional: Analytics o tracking
      if (window.gtag) {
        window.gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'PWA Installation'
        });
      }
    };

    // Detectar cambios en el display mode
    const handleDisplayModeChange = (e) => {
      setIsInstalled(e.matches);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log('❌ No hay prompt de instalación disponible');
      return false;
    }

    try {
      // Mostrar el prompt de instalación
      await deferredPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('❌ Usuario rechazó instalar la PWA');
        return false;
      }
    } catch (error) {
      console.error('❌ Error durante la instalación:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installPWA,
    canInstall: isInstallable && !isInstalled
  };
}

export default usePWAInstall;
