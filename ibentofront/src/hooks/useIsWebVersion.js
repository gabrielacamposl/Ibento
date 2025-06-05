import { useState, useEffect } from 'react';

// Hook to detect if the user is on a web version (desktop/large screen)
function useIsWebVersion() {
  const [isWebVersion, setIsWebVersion] = useState(false);

  useEffect(() => {
    const checkIfWebVersion = () => {
      // Check screen size (web version if width >= 768px)
      const isLargeScreen = window.innerWidth >= 768;
      
      // Check if it's NOT a mobile device
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                             (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
      
      // Check if it's NOT a PWA or mobile web app
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true;
      
      // Consider it web version if:
      // 1. Large screen AND not a mobile device
      // 2. OR large screen AND not running as PWA
      const shouldShowWebVersion = isLargeScreen && (!isMobileDevice || !isPWA);
      
      setIsWebVersion(shouldShowWebVersion);
    };

    // Initial check
    checkIfWebVersion();

    // Listen for resize events
    window.addEventListener('resize', checkIfWebVersion);
    
    // Listen for display mode changes (PWA installation/uninstallation)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkIfWebVersion);

    return () => {
      window.removeEventListener('resize', checkIfWebVersion);
      mediaQuery.removeEventListener('change', checkIfWebVersion);
    };
  }, []);

  return isWebVersion;
}

export default useIsWebVersion;
