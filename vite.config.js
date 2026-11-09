// Configuration de Vite : compilation de l'app et transformation en PWA
// (installable sur l'écran d'accueil, fonctionne hors ligne).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Nom du dépôt GitHub : l'app sera publiée à https://<utilisateur>.github.io/flashcards-bs/
// ⚠ Si vous nommez le dépôt autrement, changez cette ligne.
const BASE = '/flashcards-bs/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // 'prompt' : une nouvelle version n'est installée que lorsque vous touchez
      // « Mettre à jour » (jamais d'interruption au milieu d'une session).
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Révisions · Business Strategy',
        short_name: 'Révisions',
        description: 'Flashcards, statistiques et planning de révision',
        lang: 'fr',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tout est mis en cache, y compris les visuels des slides : l'app
        // fonctionne entièrement sans réseau une fois ouverte une première fois.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,json,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
})
