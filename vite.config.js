import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // vulu-api'nin CORS listesindeki varsayılan adres bu porttur
    server: { port: 5173, strictPort: true },
});
