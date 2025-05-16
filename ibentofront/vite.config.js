import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Ibento',
        short_name: 'Ibento',
        description: 'Una aplicación de conexión y diversión.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/ibento48x48.png', sizes: '48x48', type: 'image/png' },
          { src: '/icons/ibento52x52.png', sizes: '52x52', type: 'image/png' },
          { src: '/icons/ibento72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/ibento144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/ibento192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/ibento256x256.png', sizes: '256x256', type: 'image/png' },
          { src: '/icons/ibento384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/ibento512x512.png', sizes: '512x512', type: 'image/png' }
        ],
        "screenshots": [
          {
            "src": "/images/screenshot1.jpeg",
            "sizes": "403x789",
            "type": "image/png",
          },
          {
            "src": "/images/screenshot2.jpeg",
            "sizes": "394x790",
            "type": "image/png"
          },
           {
            "src": "/images/screenshot3.jpeg",
            "sizes": "405x787",
            "type": "image/png",
          },
          {
            "src": "/images/screenshot4.jpeg",
            "sizes": "394x795",
            "type": "image/png"
          }
        ]


      }
    })
  ]
});
