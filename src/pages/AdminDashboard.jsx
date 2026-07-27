import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  useCategories, useSeasons, useEpisodes,
  addCategory, deleteCategory,
  addSeason, deleteSeason,
  addEpisode, deleteEpisode, setEpisodeOrder,
} from '../data/db.js'

const TABS = ['Episodios', 'Temporadas', 'Categorías']

export default function AdminDashboard() {
  const { logout } = useAuth()
  const categories = useCategories()
  const seasons = useSeasons()
  const episodes = useEpisodes()

  const [tab, setTab] = useState('Episodios')
  const [saveError, setSaveError] = useState('')

  return (
    <div className="admin-wrap">
      <div className="admin-topbar">
        <h1>Panel de admin</h1>
        <button className="dl-btn" onClick={logout}>Cerrar sesión</button>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {saveError && <p className="admin-error" style={{ margin: '12px 0' }}>{saveError}</p>}

      {tab === 'Episodios' && (
        <EpisodesTab
          seasons={seasons}
          episodes={episodes}
          setSaveError={setSaveError}
        />
      )}

      {tab === 'Temporadas' && (
        <SeasonsTab
          seasons={seasons}
          categories={categories}
          setSaveError={setSaveError}
        />
      )}

      {tab === 'Categorías' && (
        <CategoriesTab categories={categories} setSaveError={setSaveError} />
      )}
    </div>
  )
}

function EpisodesTab({ seasons, episodes, setSaveError }) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.id || '')
  const [epTitle, setEpTitle] = useState('')
  const [epUrl, setEpUrl] = useState('')

  const seasonId = selectedSeason || seasons[0]?.id || ''
  const list = episodes
    .filter((ep) => ep.seasonId === seasonId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  async function handleAddEpisode(e) {
    e.preventDefault()
    if (!seasonId || !epTitle.trim() || !epUrl.trim()) return
    try {
      setSaveError('')
      await addEpisode(seasonId, epTitle.trim(), epUrl.trim(), list.length)
      setEpTitle('')
      setEpUrl('')
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo guardar el episodio: ' + err.message)
    }
  }

  async function move(index, direction) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= list.length) return
    const a = list[index]
    const b = list[targetIndex]
    try {
      setSaveError('')
      await Promise.all([
        setEpisodeOrder(a.id, b.order ?? targetIndex),
        setEpisodeOrder(b.id, a.order ?? index),
      ])
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo reordenar: ' + err.message)
    }
  }

  return (
    <section className="admin-section">
      {seasons.length === 0 ? (
        <p className="empty-note">Primero crea una temporada en la pestaña "Temporadas".</p>
      ) : (
        <>
          <div className="admin-season-bar">
            {seasons
              .slice()
              .sort((a, b) => a.number - b.number)
              .map((s) => (
                <button
                  key={s.id}
                  className={`season-btn ${seasonId === s.id ? 'active' : ''}`}
                  onClick={() => setSelectedSeason(s.id)}
                >
                  {s.title || `Temporada ${s.number}`}
                </button>
              ))}
          </div>

          <form className="admin-form" onSubmit={handleAddEpisode}>
            <input
              placeholder="Título del episodio"
              value={epTitle}
              onChange={(e) => setEpTitle(e.target.value)}
            />
            <input
              placeholder="Link de descarga"
              value={epUrl}
              onChange={(e) => setEpUrl(e.target.value)}
            />
            <button type="submit" className="dl-btn">Añadir</button>
          </form>

          <ul className="admin-list">
            {list.length === 0 && (
              <p className="empty-note">No hay episodios en esta temporada todavía.</p>
            )}
            {list.map((ep, i) => (
              <li key={ep.id}>
                <span className="admin-order-controls">
                  <button
                    className="order-btn"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label="Mover arriba"
                  >
                    ↑
                  </button>
                  <button
                    className="order-btn"
                    disabled={i === list.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label="Mover abajo"
                  >
                    ↓
                  </button>
                </span>
                {ep.title}
                <button className="admin-delete" onClick={() => deleteEpisode(ep.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function SeasonsTab({ seasons, categories, setSaveError }) {
  const [seasonNumber, setSeasonNumber] = useState('')
  const [seasonTitle, setSeasonTitle] = useState('')
  const [seasonCategory, setSeasonCategory] = useState('')

  async function handleAddSeason(e) {
    e.preventDefault()
    if (!seasonNumber) return
    try {
      setSaveError('')
      await addSeason(Number(seasonNumber), seasonTitle.trim(), seasonCategory || null)
      setSeasonNumber('')
      setSeasonTitle('')
      setSeasonCategory('')
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo guardar la temporada: ' + err.message)
    }
  }

  return (
    <section className="admin-section">
      <form className="admin-form" onSubmit={handleAddSeason}>
        <input
          type="number"
          placeholder="Número"
          value={seasonNumber}
          onChange={(e) => setSeasonNumber(e.target.value)}
        />
        <input
          placeholder="Título (opcional)"
          value={seasonTitle}
          onChange={(e) => setSeasonTitle(e.target.value)}
        />
        <select value={seasonCategory} onChange={(e) => setSeasonCategory(e.target.value)}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="dl-btn">Añadir</button>
      </form>
      <ul className="admin-list">
        {seasons.map((s) => (
          <li key={s.id}>
            {s.title || `Temporada ${s.number}`}
            <button className="admin-delete" onClick={() => deleteSeason(s.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CategoriesTab({ categories, setSaveError }) {
  const [categoryName, setCategoryName] = useState('')

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!categoryName.trim()) return
    try {
      setSaveError('')
      await addCategory(categoryName.trim())
      setCategoryName('')
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo guardar la categoría: ' + err.message)
    }
  }

  return (
    <section className="admin-section">
      <form className="admin-form" onSubmit={handleAddCategory}>
        <input
          placeholder="Nombre de la categoría"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <button type="submit" className="dl-btn">Añadir</button>
      </form>
      <ul className="admin-list">
        {categories.map((c) => (
          <li key={c.id}>
            {c.name}
            <button className="admin-delete" onClick={() => deleteCategory(c.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
