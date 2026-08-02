import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ Cambia "Streaming-la-rosa" si el nombre de tu repositorio en GitHub cambia.
// Con este repo, la URL final será:
// https://tu-usuario.github.io/Streaming-la-rosa/
//
// El "base" solo se aplica al compilar (npm run build / GitHub Actions).
// En desarrollo (npm run dev) siempre corre en la raíz normal, sin ruta extra.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Streaming-la-rosa/' : '/',
}))
