import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getSeasonGradient } from '../seasonColors.js'
import {
  useCategories, useSeasons, useEpisodes,
  addCategory, deleteCategory,
  addSeason, deleteSeason,
  addEpisode, deleteEpisode, updateEpisode, setEpisodeOrder,
} from '../data/db.js'

const TABS = ['Episodios', 'Temporadas', 'Categorías']
const ALL_CATS = 'ALL_CATS'

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
          categories={categories}
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

function CategoryFilterBar({ categories, value, onChange }) {
  if (categories.length === 0) return null
  return (
    <div className="admin-season-bar">
      <button
        className={`category-btn ${value === ALL_CATS ? 'active' : ''}`}
        onClick={() => onChange(ALL_CATS)}
      >
        Todas las categorías
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={`category-btn ${value === c.id ? 'active' : ''}`}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  )
}

function EpisodesTab({ seasons, episodes, categories, setSaveError }) {
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATS)
  const [selectedSeason, setSelectedSeason] = useState('')
  const [epNumber, setEpNumber] = useState('')
  const [epTitle, setEpTitle] = useState('')
  const [epUrl, setEpUrl] = useState('')

  const filteredSeasons = (
    categoryFilter === ALL_CATS
      ? seasons
      : seasons.filter((s) => s.categoryId === categoryFilter)
  )
    .slice()
    .sort((a, b) => a.number - b.number)

  const seasonId = filteredSeasons.some((s) => s.id === selectedSeason)
    ? selectedSeason
    : filteredSeasons[0]?.id || ''

  const list = episodes
    .filter((ep) => ep.seasonId === seasonId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  function handleCategoryChange(catId) {
    setCategoryFilter(catId)
    setSelectedSeason('')
  }

  async function handleAddEpisode(e) {
    e.preventDefault()
    if (!seasonId || !epTitle.trim() || !epUrl.trim()) return
    try {
      setSaveError('')
      await addEpisode(
        seasonId,
        epTitle.trim(),
        epUrl.trim(),
        list.length,
        epNumber ? Number(epNumber) : null
      )
      setEpNumber('')
      setEpTitle('')
      setEpUrl('')
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo guardar el episodio: ' + err.message)
    }
  }

  const [editingId, setEditingId] = useState(null)
  const [editNumber, setEditNumber] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')

  function startEdit(ep) {
    setEditingId(ep.id)
    setEditNumber(ep.number ?? '')
    setEditTitle(ep.title ?? '')
    setEditUrl(ep.url ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id) {
    if (!editTitle.trim() || !editUrl.trim()) return
    try {
      setSaveError('')
      await updateEpisode(id, {
        number: editNumber ? Number(editNumber) : null,
        title: editTitle.trim(),
        url: editUrl.trim(),
      })
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo actualizar el episodio: ' + err.message)
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
      <CategoryFilterBar categories={categories} value={categoryFilter} onChange={handleCategoryChange} />

      {filteredSeasons.length === 0 ? (
        <p className="empty-note">No hay temporadas en esta categoría. Crea una en la pestaña "Temporadas".</p>
      ) : (
        <>
          <div className="admin-season-bar">
            {filteredSeasons.map((s) => (
              <button
                key={s.id}
                className={`season-btn ${seasonId === s.id ? 'active' : ''}`}
                style={{ '--season-grad': getSeasonGradient(s.number) }}
                onClick={() => setSelectedSeason(s.id)}
              >
                {s.title || `Temporada ${s.number}`}
              </button>
            ))}
          </div>

          <form className="admin-form" onSubmit={handleAddEpisode}>
            <input
              type="number"
              placeholder="N.º episodio"
              value={epNumber}
              onChange={(e) => setEpNumber(e.target.value)}
              style={{ maxWidth: 110 }}
            />
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
              <li key={ep.id} className={editingId === ep.id ? 'admin-list-editing' : ''}>
                {editingId === ep.id ? (
                  <div className="admin-edit-row">
                    <input
                      type="number"
                      placeholder="N.º"
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      style={{ maxWidth: 70 }}
                    />
                    <input
                      placeholder="Título"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      placeholder="Link"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                    />
                    <button className="dl-btn" onClick={() => saveEdit(ep.id)}>Guardar</button>
                    <button className="admin-delete" onClick={cancelEdit}>Cancelar</button>
                  </div>
                ) : (
                  <>
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
                    <span style={{ flex: 1 }}>
                      {ep.number != null ? `Ep. ${ep.number} — ${ep.title}` : ep.title}
                    </span>
                    <button className="admin-edit-btn" onClick={() => startEdit(ep)}>Editar</button>
                    <button className="admin-delete" onClick={() => deleteEpisode(ep.id)}>Eliminar</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function SeasonsTab({ seasons, categories, setSaveError }) {
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATS)
  const [seasonNumber, setSeasonNumber] = useState('')
  const [seasonTitle, setSeasonTitle] = useState('')
  const [seasonCategory, setSeasonCategory] = useState('')

  const visibleSeasons = (
    categoryFilter === ALL_CATS
      ? seasons
      : seasons.filter((s) => s.categoryId === categoryFilter)
  )
    .slice()
    .sort((a, b) => a.number - b.number)

  function handleCategoryChange(catId) {
    setCategoryFilter(catId)
    setSeasonCategory(catId === ALL_CATS ? '' : catId)
  }

  async function handleAddSeason(e) {
    e.preventDefault()
    if (!seasonNumber) return
    try {
      setSaveError('')
      await addSeason(Number(seasonNumber), seasonTitle.trim(), seasonCategory || null)
      setSeasonNumber('')
      setSeasonTitle('')
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo guardar la temporada: ' + err.message)
    }
  }

  return (
    <section className="admin-section">
      <CategoryFilterBar categories={categories} value={categoryFilter} onChange={handleCategoryChange} />

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
        {visibleSeasons.length === 0 && (
          <p className="empty-note">No hay temporadas en esta categoría.</p>
        )}
        {visibleSeasons.map((s) => (
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
