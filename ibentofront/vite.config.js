import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ibento',
        short_name: 'Ibento',
        description: 'Una aplicación de conexión y diversión.',
        theme_color: '#ffffff',
        // icons: [
        //   { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        //   { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        // ]
      }
    })
  ]
});
