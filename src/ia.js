// Lee archivos de una carpeta de Internet Archive
export function parseIA(url) {
  const m = String(url).match(/archive\.org\/(?:details|download)\/([^/?#]+)(?:\/([^?#]*))?/)
  return m ? { id: decodeURIComponent(m[1]), path: m[2] ? decodeURIComponent(m[2]).replace(/\/?$/, '/') : '' } : null
}

export function fmtSize(b) {
  b = +b
  if (!b) return ''
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (b >= 1024 && i < 3) { b /= 1024; i++ }
  return b.toFixed(i ? 1 : 0) + ' ' + u[i]
}

const cache = {}
export const clearCache = () => { for (const k in cache) delete cache[k] }

export async function fetchFiles(season) {
  if (cache[season.id]) return cache[season.id]
  const p = parseIA(season.url)
  if (!p) throw new Error('La URL de esta temporada no es una carpeta válida de Internet Archive.')
  const r = await fetch('https://archive.org/metadata/' + encodeURIComponent(p.id))
  if (!r.ok) throw new Error('No se pudo leer Internet Archive (' + r.status + ').')
  const j = await r.json()
  let list = (j.files || []).filter(f => !/(_meta\.xml|_files\.xml|_meta\.sqlite|_reviews\.xml|__ia_thumb\.jpg|\.torrent)$/.test(f.name))
  if (p.path) list = list.filter(f => f.name.startsWith(p.path))
  const orig = list.filter(f => f.source === 'original')
  if (orig.length) list = orig
  return (cache[season.id] = list
    .map(f => ({
      name: f.name.split('/').pop(),
      size: f.size,
      href: 'https://archive.org/download/' + encodeURIComponent(p.id) + '/' + f.name.split('/').map(encodeURIComponent).join('/'),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })))
}
