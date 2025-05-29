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
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
         // o excluye la carpeta entera
        globIgnores: ['images_for_preview/**'],
        // runtimeCaching: [
        //   {
        //     urlPattern: /^https:\/\/ibento\.onrender\.com\/api\//,
        //     handler: 'NetworkFirst',
        //     options: {
        //       cacheName: 'evento-api-cache',
        //       expiration: {
        //         maxEntries: 100,
        //         maxAgeSeconds: 60 * 60 * 24, // 24 horas
        //       },
        //     },
        //   },
        // ],
      },
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Ibento',
        short_name: 'Ibento',
        description: 'Una aplicación de conexión y diversión.',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        // Categorías para mejor descubrimiento
        categories: ['social', 'entertainment', 'lifestyle'],
        // Para iOS
        apple: {
          statusBarStyle: 'black-translucent'
        },
        icons: [
          { src: '/icons/ibento48x48.png', sizes: '48x48', type: 'image/png' },
          { src: '/icons/ibento52x52.png', sizes: '52x52', type: 'image/png' },
          { src: '/icons/ibento72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/ibento144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/ibento192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/ibento256x256.png', sizes: '256x256', type: 'image/png' },
          { src: '/icons/ibento384x384.png', sizes: '384x384', type: 'image/png' },
          //{ src: '/icons/ibento512x512.png', sizes: '512x512', type: 'image/png' },
          // Iconos específicos para iOS
          { src: '/icons/ibento192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
         // { src: '/icons/ibento512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        screenshots: [
          {
            src: "/images/screenshot1.jpeg",
            sizes: "403x789",
            type: "image/jpeg",
            form_factor: "narrow"
          },
          {
            src: "/images/screenshot2.jpeg",
            sizes: "394x790",
            type: "image/jpeg",
            form_factor: "narrow"
          },
          {
            src: "/images/screenshot3.jpeg",
            sizes: "405x787",
            type: "image/jpeg",
            form_factor: "narrow"
          },
          {
            src: "/images/screenshot4.jpeg",
            sizes: "394x795",
            type: "image/jpeg",
            form_factor: "narrow"
          },
          {
            src: "/images/screenshot5.jpeg",
            sizes: "686x904",
            type: "image/jpeg",
            form_factor: "wide"
          },
          {
            src: "/images/screenshot6.jpeg",
            sizes: "678x907",
            type: "image/jpeg",
            form_factor: "wide"
          }
        ]
      }
    })
  ]
});

