// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://shubhamlathiyaio.github.io',
  base: '/Zen-Task',

  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Zen Task',
        short_name: 'ZenTask',
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
        navigateFallback: '/Zen-Task/',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}']
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});