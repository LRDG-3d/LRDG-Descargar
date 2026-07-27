import { useState } from 'react'
import TopBar from './components/TopBar.jsx'
import SideMenu from './components/SideMenu.jsx'
import SeasonsGrid from './components/SeasonsGrid.jsx'
import './App.css'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSeason, setActiveSeason] = useState(1)

  return (
    <>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <TopBar onMenuClick={() => setMenuOpen(true)} />

      <header className="page-header">
        <h1>Descargas</h1>
        <p>Selecciona una temporada</p>
      </header>

      <SeasonsGrid activeSeason={activeSeason} onSelect={setActiveSeason} />
    </>
  )
}
