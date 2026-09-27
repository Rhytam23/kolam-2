import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // In development the FastAPI backend runs separately; in production it serves the built app itself.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  plugins: [
    react(),
    {
      // Link previews need absolute image URLs: set SITE_URL (e.g. https://kolam.example.com) when building.
      name: 'site-url',
      transformIndexHtml: html => html.replaceAll('%SITE_URL%', (process.env.SITE_URL ?? '').replace(/\/$/, '')),
    },
  ],
});
