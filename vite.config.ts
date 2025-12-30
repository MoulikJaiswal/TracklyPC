
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      devOptions: {
        enabled: true, // IMPORTANT: Enables PWA in development mode
        type: 'module',
      },
      manifest: {
        name: 'Trackly PC',
        short_name: 'Trackly',
        description: 'High-performance study tracker.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn.jsdelivr.net/gh/lucide-icons/lucide/icons/activity.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'https://cdn.jsdelivr.net/gh/lucide-icons/lucide/icons/activity.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true, 
  },
  build: {
    outDir: 'dist',
  }
});
