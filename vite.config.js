import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Site domainin kökünde yayınlanır; bir alt klasöre taşınırsa BASE_PATH ile verilir
    base: process.env.BASE_PATH || '/',
    server: {
        port: 5173,
        strictPort: true,
        // npm run dev'de /api ve /releases canlı sunucudan gelir
        proxy: {
            '/api': { target: 'https://vuluvulu.com.tr', changeOrigin: true },
            '/releases': { target: 'https://vuluvulu.com.tr', changeOrigin: true },
        },
    },
});
