import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno (acepta VITE_... y variables del sistema en Vercel)
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Esto soluciona el error "process is not defined" en el navegador
      // y mapea process.env.API_KEY a la variable de entorno real
      'process.env': {
        API_KEY: env.VITE_API_KEY || env.API_KEY
      }
    }
  };
});