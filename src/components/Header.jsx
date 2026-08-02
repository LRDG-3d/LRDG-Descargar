import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo} />
        La Rosa TV
      </div>
      <nav className={styles.nav}>
        <a href="#" className={styles.active}>Inicio</a>
        <a href="#">Nosotros</a>
        <a href="#">Contacto</a>
      </nav>
      <div className={styles.actions}>
        <div className={styles.searchIcon}>⌕</div>
        <div className={styles.avatar} />
      </div>
    </header>
  )
}

export default Header
