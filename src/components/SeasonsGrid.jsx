const TOTAL_SEASONS = 9

export default function SeasonsGrid({ activeSeason, onSelect }) {
  return (
    <div className="seasons">
      {Array.from({ length: TOTAL_SEASONS }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          className={`season-btn ${activeSeason === num ? 'active' : ''}`}
          onClick={() => onSelect(num)}
        >
          <span className="season-dot"></span>
          Temporada {num}
        </button>
      ))}
    </div>
  )
}
