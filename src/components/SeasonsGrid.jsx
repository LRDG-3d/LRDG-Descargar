export default function SeasonsGrid({ seasons, activeSeason, onSelect }) {
  if (!seasons.length) {
    return <p className="empty-note">Aún no hay temporadas cargadas.</p>
  }

  return (
    <div className="seasons">
      {seasons
        .slice()
        .sort((a, b) => a.number - b.number)
        .map((season) => (
          <button
            key={season.id}
            className={`season-btn ${activeSeason === season.id ? 'active' : ''}`}
            onClick={() => onSelect(season.id)}
          >
            <span className="season-dot"></span>
            {season.title || `Temporada ${season.number}`}
          </button>
        ))}
    </div>
  )
}
