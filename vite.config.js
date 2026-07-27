import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: cambia "LRDG-Descargar" por el nombre exacto de tu repositorio de GitHub
// si tu repo se llama distinto, ej. base: '/mi-repo/'
export default defineConfig({
  plugins: [react()],
  base: '/LRDG-Descargar/',
})
