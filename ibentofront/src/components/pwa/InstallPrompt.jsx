import React, { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [instalable, setInstalable] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setInstalable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Solicitar permiso para notificaciones push
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('[Notificaciones] Permiso:', permission)
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const instalarApp = () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()

    deferredPrompt.userChoice.then(choice => {
      console.log('[PWA]', choice.outcome === 'accepted' ? 'Aceptó' : 'Rechazó')
      setDeferredPrompt(null)
      setInstalable(false)
    })
  }

  if (!instalable) return null

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 999 }}>
      <button
        onClick={instalarApp}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
      >
        Instalar Ibento
      </button>
    </div>
  )
}
