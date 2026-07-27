import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  useCategories, useSeasons, useEpisodes,
  addCategory, deleteCategory,
  addSeason, deleteSeason,
  addEpisode, deleteEpisode,
} from '../data/db.js'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const categories = useCategories()
  const seasons = useSeasons()
  const episodes = useEpisodes()

  const [categoryName, setCategoryName] = useState('')
  const [seasonNumber, setSeasonNumber] = useState('')
  const [seasonTitle, setSeasonTitle] = useState('')
  const [seasonCategory, setSeasonCategory] = useState('')
  const [epSeason, setEpSeason] = useState('')
  const [epTitle, setEpTitle] = useState('')
  const [epUrl, setEpUrl] = useState('')

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!categoryName.trim()) return
    await addCategory(categoryName.trim())
    setCategoryName('')
  }

  async function handleAddSeason(e) {
    e.preventDefault()
    if (!seasonNumber) return
    await addSeason(Number(seasonNumber), seasonTitle.trim(), seasonCategory || null)
    setSeasonNumber('')
    setSeasonTitle('')
    setSeasonCategory('')
  }

  async function handleAddEpisode(e) {
    e.preventDefault()
    if (!epSeason || !epTitle.trim() || !epUrl.trim()) return
    await addEpisode(epSeason, epTitle.trim(), epUrl.trim())
    setEpTitle('')
    setEpUrl('')
  }

  return (
    <div className="admin-wrap">
      <div className="admin-topbar">
        <h1>Panel de admin</h1>
        <button className="dl-btn" onClick={logout}>Cerrar sesión</button>
      </div>

      {/* Categorías */}
      <section className="admin-section">
        <h2>Categorías</h2>
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

      {/* Temporadas */}
      <section className="admin-section">
        <h2>Temporadas</h2>
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

      {/* Episodios */}
      <section className="admin-section">
        <h2>Episodios</h2>
        <form className="admin-form" onSubmit={handleAddEpisode}>
          <select value={epSeason} onChange={(e) => setEpSeason(e.target.value)}>
            <option value="">Selecciona temporada</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.title || `Temporada ${s.number}`}</option>
            ))}
          </select>
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
          {episodes.map((ep) => (
            <li key={ep.id}>
              {ep.title}
              <button className="admin-delete" onClick={() => deleteEpisode(ep.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
