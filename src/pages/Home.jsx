import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import SideMenu from '../components/SideMenu.jsx'
import SeasonsGrid from '../components/SeasonsGrid.jsx'
import { useSeasons, useEpisodes } from '../data/db.js'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSeasonId, setActiveSeasonId] = useState(null)

  const seasons = useSeasons()
  const episodes = useEpisodes()

  const currentSeasonId = activeSeasonId || seasons[0]?.id || null
  const seasonEpisodes = episodes
    .filter((ep) => ep.seasonId === currentSeasonId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <TopBar onMenuClick={() => setMenuOpen(true)} />

      <header className="page-header">
        <h1>Descargas</h1>
        <p>Selecciona una temporada</p>
      </header>

      <SeasonsGrid
        seasons={seasons}
        activeSeason={currentSeasonId}
        onSelect={setActiveSeasonId}
      />

      <div className="list">
        {seasonEpisodes.length === 0 && (
          <p className="empty-note">No hay episodios en esta temporada todavía.</p>
        )}
        {seasonEpisodes.map((ep) => (
          <div className="episode" key={ep.id}>
            <div className="ep-info">
              <div className="ep-title">{ep.title}</div>
            </div>
            <a className="dl-btn" href={ep.url} download target="_blank" rel="noopener noreferrer">
              Descargar
            </a>
          </div>
        ))}
      </div>
    </>
  )
}
