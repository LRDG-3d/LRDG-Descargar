import { useEffect, useMemo, useState } from 'react'
import Admin from './Admin.jsx'
import { fetchFiles, fmtSize, clearCache } from './ia.js'
import { loadData, saveData, watchAuth } from './store.js'

const DlIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" />
  </svg>
)
const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

export default function App() {
  const [data, setDataState] = useState({ categories: [], seasons: [] })
  const [ready, setReady] = useState(false)
  const [selCat, setSelCat] = useState(null)
  const [selSeason, setSelSeason] = useState(null)
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => { loadData().then(d => { setDataState(d); setReady(true) }); return watchAuth(setAuthed) }, [])

  const setData = async (d, cat) => {
    setDataState(d); clearCache()
    if (cat) setSelCat(cat)
    try { await saveData(d) } catch (e) { alert('No se pudo guardar: ' + e.message) }
  }

  const cat = data.categories.some(c => c.id === selCat) ? selCat : data.categories[0]?.id || null
  const seasons = useMemo(() => data.seasons.filter(s => s.categoryId === cat), [data, cat])
  const season = seasons.find(s => s.id === selSeason) || seasons[0] || null

  useEffect(() => {
    setFiles([])
    if (!season) return setStatus('')
    let off = false
    setStatus('Cargando archivos…')
    fetchFiles(season)
      .then(l => { if (!off) { setFiles(l); setStatus(l.length ? '' : 'Esta carpeta no tiene archivos todavía.') } })
      .catch(e => { if (!off) setStatus('ERR:' + e.message) })
    return () => { off = true }
  }, [season?.id, season?.url])

  const shown = files.filter(f => f.name.toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>LRDG-DESCARGAS</h1>
          <div className="sub">Elige una categoría y una temporada para descargar</div>
        </div>
        <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Abrir admin" title="Admin"><GearIcon /></button>
      </header>

      <div className="chips">
        {data.categories.map(c => (
          <button key={c.id} className={'chip' + (c.id === cat ? ' on' : '')} onClick={() => { setSelCat(c.id); setSelSeason(null) }}>{c.name}</button>
        ))}
      </div>
      <div className="chips seasons">
        {seasons.map(s => (
          <button key={s.id} className={'chip s' + (s.id === season?.id ? ' on' : '')} onClick={() => setSelSeason(s.id)}>{s.name}</button>
        ))}
      </div>

      <div className="tools">
        <input type="search" placeholder="Buscar archivo…" aria-label="Buscar archivo" value={q} onChange={e => setQ(e.target.value)} />
        <span className="count">{files.length ? shown.length + ' archivos' : ''}</span>
      </div>

      <div className="list">
        {!ready && <div className="msg">Cargando…</div>}
        {ready && !data.categories.length && <div className="msg">Aún no hay categorías. Abre el admin (engranaje) para crear la primera.</div>}
        {ready && cat && !seasons.length && <div className="msg">Esta categoría aún no tiene temporadas.</div>}
        {status && <div className={'msg' + (status.startsWith('ERR:') ? ' err' : '')}>{status.replace('ERR:', '')}</div>}
        {files.length > 0 && !shown.length && <div className="msg">Ningún archivo coincide con tu búsqueda.</div>}
        {shown.map(f => (
          <div className="row" key={f.href}>
            <div className="name">{f.name}<div className="size">{fmtSize(f.size)}</div></div>
            <a className="dl" href={f.href} target="_blank" rel="noopener noreferrer" download aria-label={'Descargar ' + f.name} title="Descargar"><DlIcon /></a>
          </div>
        ))}
      </div>

      {open && (
        <div className="modal open" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <Admin data={data} setData={setData} authed={authed} setAuthed={setAuthed} selCat={cat} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
