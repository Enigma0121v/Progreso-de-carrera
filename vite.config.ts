import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base relativa: funciona en GitHub Pages (/progreso-de-carrera/) y en cualquier hosting estático.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
