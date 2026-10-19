import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // GitHub Pages'te site /vulu-web/ altında yayınlanır; kendi domain'inde "/" olur
    base: process.env.BASE_PATH || '/',
    server: {
        port: 5173,
        strictPort: true,
        // npm run dev'de /api ve /releases canlı sunucudan gelir
        proxy: {
            '/api': { target: 'http://185.157.46.169', changeOrigin: true },
            '/releases': { target: 'http://185.157.46.169', changeOrigin: true },
        },
    },
});
