import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ROUTES } from './src/data/traditions';

const siteUrl = (process.env.SITE_URL ?? '').replace(/\/$/, '');

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
      transformIndexHtml: html => html.replaceAll('%SITE_URL%', siteUrl),
    },
    {
      // The server answers each page's address with index.html, titled for that page (see backend/main.py),
      // so shared links such as /alpana show the right title. A sitemap is written when SITE_URL is known.
      name: 'routes',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'routes.json', source: JSON.stringify(ROUTES, null, 2) });
        if (siteUrl) {
          const urls = ROUTES.map(r => `  <url><loc>${siteUrl}${r.path}</loc></url>`).join('\n');
          this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
        }
      },
    },
  ],
});
