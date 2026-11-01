import { useState } from 'react'
import { parseIA } from './ia.js'
import { useFirebase, ADMIN_PIN, login, logout } from './store.js'
import './admin.css'

const uid = () => Math.random().toString(36).slice(2, 9)

function Login({ setAuthed }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const enter = async () => {
    setBusy(true); setErr('')
    try {
      if (useFirebase) await login(email.trim(), pass)
      else if (pass !== ADMIN_PIN) throw new Error('pin')
      setAuthed(true)
    } catch (e) {
      setErr(e.message === 'pin' ? 'PIN incorrecto.' : 'No se pudo iniciar sesión. Revisa tu correo y contraseña.')
    }
    setBusy(false)
  }

  return (
    <div className="wrap">
      <div className="page-top"><a className="back" href="#/">← Volver a descargas</a></div>
      <div className="card login">
        <h2>Iniciar sesión</h2>
        <p className="hint">{useFirebase ? 'Entra con tu cuenta de administrador.' : 'Escribe el PIN de administrador.'}</p>
        <div className="f">
          {useFirebase && <input type="email" placeholder="Correo" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />}
          <input type="password" placeholder={useFirebase ? 'Contraseña' : 'PIN'} autoComplete="current-password" value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && enter()} />
          {err && <p className="err" style={{ margin: 0 }}>{err}</p>}
          <button className="btn" onClick={enter} disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Admin({ data, setData, authed, setAuthed }) {
  const [cn, setCn] = useState('')
  const [sn, setSn] = useState('')
  const [su, setSu] = useState('')
  const [sc, setSc] = useState('')

  if (!authed) return <Login setAuthed={setAuthed} />

  const { categories: cats, seasons } = data
  const catId = sc || cats[0]?.id || ''

  const addCat = () => {
    const n = cn.trim(); if (!n) return
    setData({ ...data, categories: [...cats, { id: uid(), name: n }] }); setCn('')
  }
  const addSeason = () => {
    if (!catId || !sn.trim() || !su.trim()) return alert('Completa categoría, nombre y URL.')
    if (!parseIA(su)) return alert('La URL debe ser de archive.org (details o download).')
    setData({ ...data, seasons: [...seasons, { id: uid(), categoryId: catId, name: sn.trim(), url: su.trim() }] }, catId)
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
  const salir = async () => { if (useFirebase) await logout(); setAuthed(false); location.hash = '#/' }

  return (
    <div className="wrap">
      <div className="page-top">
        <h1>Admin</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <a className="back" href="#/">Ver descargas</a>
          <button className="back" onClick={salir}>Salir</button>
        </div>
      </div>

      <div className="card">
        <h2>Categorías</h2>
        <p className="hint">Agrupan tus temporadas (ej. Episodios, Extras).</p>
        <div className="f">
          <input placeholder="Nombre de la categoría" value={cn} onChange={e => setCn(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} />
          <button className="btn" onClick={addCat}>Añadir categoría</button>
        </div>
        {cats.map(c => (
          <div className="item" key={c.id}>
            <span>{c.name}<span className="pill">{seasons.filter(s => s.categoryId === c.id).length} temporadas</span></span>
            <button className="ed" onClick={() => renCat(c)}>Renombrar</button>
            <button className="x" onClick={() => delCat(c.id)}>Eliminar</button>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Temporadas</h2>
        <p className="hint">Cada temporada apunta a una carpeta de Internet Archive.</p>
        <div className="f">
          <select value={catId} onChange={e => setSc(e.target.value)}>
            {cats.length ? cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option value="">Crea una categoría primero</option>}
          </select>
          <input placeholder="Nombre (ej. Temporada 1)" value={sn} onChange={e => setSn(e.target.value)} />
          <input type="url" placeholder="https://archive.org/details/mi-carpeta" value={su} onChange={e => setSu(e.target.value)} />
          <button className="btn" onClick={addSeason}>Añadir temporada</button>
        </div>
        {cats.map(c => {
          const list = seasons.filter(s => s.categoryId === c.id)
          if (!list.length) return null
          return (
            <div key={c.id}>
              <div className="grp">{c.name}</div>
              {list.map(s => (
                <div className="item" key={s.id}>
                  <span>{s.name}<small>{s.url}</small></span>
                  <button className="ed" onClick={() => editSeason(s)}>Editar</button>
                  <button className="x" onClick={() => delSeason(s.id)}>Eliminar</button>
                </div>
              ))}
            </div>
          )
        })}
        {!seasons.length && <div className="note">Aún no hay temporadas.</div>}
      </div>

      {!useFirebase && <div className="note">Modo local: los cambios se guardan solo en este navegador. Configura Firebase para que todos los vean.</div>}
    </div>
  )
}
