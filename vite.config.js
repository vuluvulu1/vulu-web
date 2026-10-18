import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // GitHub Pages'te site /vulu-web/ altında yayınlanır; kendi domain'inde "/" olur
    base: process.env.BASE_PATH || '/',
    // vulu-api'nin CORS listesindeki varsayılan adres bu porttur
    server: { port: 5173, strictPort: true },
});
