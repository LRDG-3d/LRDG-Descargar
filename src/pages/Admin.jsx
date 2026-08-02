import { useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase.js'
import styles from './Admin.module.css'

const episodiosRef = collection(db, 'episodios')

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Acceso admin</h1>
        <input
          className={styles.input}
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

function EpisodeForm() {
  const [titulo, setTitulo] = useState('')
  const [miniatura, setMiniatura] = useState('')
  const [video, setVideo] = useState('')
  const [temporada, setTemporada] = useState('')
  const [numero, setNumero] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await addDoc(episodiosRef, {
        titulo,
        miniatura,
        video,
        temporada: temporada || null,
        numero: numero || null,
        createdAt: serverTimestamp(),
      })
      setTitulo('')
      setMiniatura('')
      setVideo('')
      setTemporada('')
      setNumero('')
      setMsg('Episodio guardado ✅')
    } catch (err) {
      setMsg('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.sectionTitle}>Añadir episodio</h2>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Nombre del episodio</span>
          <input
            className={styles.input}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="El regalo inesperado"
            required
          />
        </label>
        <label className={styles.field}>
          <span>URL de la miniatura</span>
          <input
            className={styles.input}
            value={miniatura}
            onChange={(e) => setMiniatura(e.target.value)}
            placeholder="https://…/miniatura.jpg"
            required
          />
        </label>
        <label className={styles.field}>
          <span>URL del episodio (video)</span>
          <input
            className={styles.input}
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://…/episodio.mp4"
            required
          />
        </label>
        <label className={styles.field}>
          <span>Temporada</span>
          <input
            className={styles.input}
            value={temporada}
            onChange={(e) => setTemporada(e.target.value)}
            placeholder="31"
          />
        </label>
        <label className={styles.field}>
          <span>Número de capítulo</span>
          <input
            className={styles.input}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="2431"
          />
        </label>
      </div>
      <button className={styles.btn} type="submit" disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar episodio'}
      </button>
      {msg && <p className={styles.msg}>{msg}</p>}
    </form>
  )
}

function EpisodeList() {
  const [episodios, setEpisodios] = useState([])

  useEffect(() => {
    const q = query(episodiosRef, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setEpisodios(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este episodio?')) return
    await deleteDoc(doc(db, 'episodios', id))
  }

  return (
    <div className={styles.listWrap}>
      <h2 className={styles.sectionTitle}>Episodios ({episodios.length})</h2>
      {episodios.length === 0 && (
        <p className={styles.empty}>Aún no hay episodios.</p>
      )}
      <div className={styles.list}>
        {episodios.map((ep) => (
          <div className={styles.row} key={ep.id}>
            <img
              className={styles.thumb}
              src={ep.miniatura}
              alt={ep.titulo}
              onError={(e) => (e.target.style.opacity = 0.2)}
            />
            <div className={styles.rowInfo}>
              <strong>{ep.titulo}</strong>
              <span>
                {ep.temporada ? `T${ep.temporada} · ` : ''}
                {ep.numero ? `Cap. ${ep.numero}` : ''}
              </span>
            </div>
            <button className={styles.deleteBtn} onClick={() => handleDelete(ep.id)}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Admin() {
  const [user, setUser] = useState(undefined) // undefined = cargando, null = sin sesión

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u))
  }, [])

  if (user === undefined) {
    return <div className={styles.loading}>Cargando…</div>
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <span>Panel de administración · La Rosa TV</span>
        <button className={styles.logoutBtn} onClick={() => signOut(auth)}>
          Cerrar sesión
        </button>
      </div>
      <div className={styles.content}>
        <EpisodeForm />
        <EpisodeList />
      </div>
    </div>
  )
}

export default Admin
