import { useState } from 'react'
import { parseIA } from './ia.js'
import { useFirebase, ADMIN_PIN, login, logout } from './store.js'

const uid = () => Math.random().toString(36).slice(2, 9)

export default function Admin({ data, setData, authed, setAuthed, selCat, onClose }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [cn, setCn] = useState('')
  const [sn, setSn] = useState('')
  const [su, setSu] = useState('')
  const [sc, setSc] = useState(selCat || '')

  const enter = async () => {
    try {
      if (useFirebase) await login(email, pass)
      else if (pass !== ADMIN_PIN) return setErr('PIN incorrecto.')
      setAuthed(true); setErr('')
    } catch { setErr('No se pudo entrar: revisa tus datos.') }
  }

  if (!authed) {
    return (
      <div className="sheet">
        <h2>Acceso admin</h2>
        <div className="f">
          {useFirebase && <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />}
          <input type="password" placeholder={useFirebase ? 'Contraseña' : 'PIN'} value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && enter()} />
        </div>
        {err && <p className="err">{err}</p>}
        <button className="btn" onClick={enter}>Entrar</button>
      </div>
    )
  }

  const { categories: cats, seasons } = data
  const addCat = () => { const n = cn.trim(); if (!n) return; setData({ ...data, categories: [...cats, { id: uid(), name: n }] }); setCn('') }
  const addSeason = () => {
    const c = sc || cats[0]?.id
    if (!c || !sn.trim() || !su.trim()) return alert('Completa categoría, nombre y URL.')
    if (!parseIA(su)) return alert('La URL debe ser de archive.org (details o download).')
    setData({ ...data, seasons: [...seasons, { id: uid(), categoryId: c, name: sn.trim(), url: su.trim() }] }, c)
    setSn(''); setSu('')
  }
  const delCat = id => confirm('¿Eliminar la categoría y sus temporadas?') &&
    setData({ categories: cats.filter(c => c.id !== id), seasons: seasons.filter(s => s.categoryId !== id) })
  const delSeason = id => confirm('¿Eliminar esta temporada?') && setData({ ...data, seasons: seasons.filter(s => s.id !== id) })
  const renCat = c => { const n = prompt('Nuevo nombre', c.name); if (n?.trim()) setData({ ...data, categories: cats.map(x => x.id === c.id ? { ...x, name: n.trim() } : x) }) }
  const editSeason = s => {
    const n = prompt('Nombre de la temporada', s.name); if (n === null) return
    const u = prompt('URL de Internet Archive', s.url); if (u === null) return
    if (!parseIA(u)) return alert('La URL debe ser de archive.org.')
    setData({ ...data, seasons: seasons.map(x => x.id === s.id ? { ...x, name: n.trim() || x.name, url: u.trim() } : x) })
  }

  return (
    <div className="sheet">
      <div className="top"><h2>Admin</h2><button className="btn g" onClick={onClose}>Cerrar</button></div>

      <h3>Nueva categoría</h3>
      <div className="f">
        <input placeholder="Nombre (ej. Episodios, Extras)" value={cn} onChange={e => setCn(e.target.value)} />
        <button className="btn" onClick={addCat}>Añadir categoría</button>
      </div>
      {cats.map(c => (
        <div className="item" key={c.id}>
          <span>{c.name}</span>
          <button className="ed" onClick={() => renCat(c)}>Renombrar</button>
          <button className="x" onClick={() => delCat(c.id)}>Eliminar</button>
        </div>
      ))}

      <h3>Nueva temporada</h3>
      <div className="f">
        <select value={sc || cats[0]?.id || ''} onChange={e => setSc(e.target.value)}>
          {cats.length ? cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option value="">Crea una categoría primero</option>}
        </select>
        <input placeholder="Nombre (ej. Temporada 1)" value={sn} onChange={e => setSn(e.target.value)} />
        <input type="url" placeholder="URL de la carpeta en Internet Archive" value={su} onChange={e => setSu(e.target.value)} />
        <button className="btn" onClick={addSeason}>Añadir temporada</button>
      </div>
      <div className="note">Ejemplo: https://archive.org/details/mi-carpeta</div>

      <h3>Temporadas</h3>
      {seasons.length ? seasons.map(s => (
        <div className="item" key={s.id}>
          <span>{s.name}<small>{cats.find(c => c.id === s.categoryId)?.name || '—'} · {s.url}</small></span>
          <button className="ed" onClick={() => editSeason(s)}>Editar</button>
          <button className="x" onClick={() => delSeason(s.id)}>Eliminar</button>
        </div>
      )) : <div className="note">Aún no hay temporadas.</div>}

      <h3>Sesión</h3>
      <button className="btn g" onClick={async () => { if (useFirebase) await logout(); setAuthed(false); onClose() }}>Salir del admin</button>
      {!useFirebase && <div className="note">Modo local: los cambios se guardan solo en este navegador. Configura Firebase para que todos los vean.</div>}
    </div>
  )
}
