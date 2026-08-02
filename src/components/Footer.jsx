import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.row}`}>
        <div className={styles.brand}>
          <span className={styles.logo} />
          La Rosa TV
        </div>
        <div>Proyecto de fan · contenido ilustrativo · no oficial</div>
      </div>
    </footer>
  )
}

export default Footer
