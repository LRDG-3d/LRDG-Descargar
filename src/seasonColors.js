// Colores de cada temporada (para el punto/acento del botón)
const PALETTE = {
  1: ['#2ecc71', '#ff3b4e'], // Verde y Rojo
  2: ['#3b82f6', '#ffd93b'], // Azul y Amarillo
  3: ['#3b82f6', '#ff3b4e'], // Azul y Rojo
  4: ['#ffd93b', '#ff3b4e'], // Amarillo y Rojo
  5: ['#ffd93b', '#2ecc71'], // Amarillo y Verde
  6: ['#a855f7', '#ffd93b'], // Morado y Amarillo
  7: ['#2ecc71', '#3b82f6'], // Verde y Azul
}

const DEFAULT_COLORS = ['#ff3b4e', '#22e5ff']

export function getSeasonColors(number) {
  return PALETTE[number] || DEFAULT_COLORS
}

export function getSeasonGradient(number) {
  const [a, b] = getSeasonColors(number)
  return `linear-gradient(135deg, ${a}, ${b})`
}

// Gradiente para el botón "Todas las temporadas"
export const ALL_GRADIENT = 'linear-gradient(90deg, #3b82f6, #ff3b4e, #2ecc71, #ffd93b, #a855f7)'
export const ALL_ID = 'ALL'
