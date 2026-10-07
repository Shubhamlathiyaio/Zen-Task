// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://cronosfocus.com',
  base: '/',

  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Chronos Focus',
        short_name: 'ChronosFocus',
        description: 'A playful gamified task manager.',
        theme_color: '#925CF3',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: 'icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}']
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});