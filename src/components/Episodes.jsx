import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import styles from './Episodes.module.css'

const episodiosRef = collection(db, 'episodios')

function Episodes() {
  const [episodios, setEpisodios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(episodiosRef, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEpisodios(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [])

  if (loading) return null

  return (
    <section className={`container ${styles.section}`}>
      <h2 className={styles.title}>Episodios</h2>

      {episodios.length === 0 ? (
        <p className={styles.empty}>No hay episodios.</p>
      ) : (
        <div className={styles.grid}>
          {episodios.map((ep) => (
            <a
              key={ep.id}
              href={ep.video}
              target="_blank"
              rel="noreferrer"
              className={styles.card}
            >
              <div
                className={styles.thumb}
                style={{ backgroundImage: `url(${ep.miniatura})` }}
              />
              <div className={styles.info}>
                <span className={styles.name}>{ep.titulo}</span>
                {(ep.temporada || ep.numero) && (
                  <span className={styles.meta}>
                    {ep.temporada ? `T${ep.temporada} · ` : ''}
                    {ep.numero ? `Cap. ${ep.numero}` : ''}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

export default Episodes
