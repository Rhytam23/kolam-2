import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Note: nothing in src/ reads GEMINI_API_KEY. Do not add a `define` block that inlines a secret
// into the client bundle -- any future LLM calls must go through a backend endpoint, never ship
// an API key in the frontend build (Vite's `define` bakes it into plaintext JS every visitor gets).
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
