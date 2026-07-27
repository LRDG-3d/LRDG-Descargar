# La Rosa TV

Página de descargas con barra superior, menú lateral y selector de 9 temporadas. React + Vite.

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy a GitHub Pages

### Opción A: automático con GitHub Actions (recomendado)

1. Sube este proyecto a un repo de GitHub (`LRDG-Descargar`).
2. En **Settings → Pages**, en "Build and deployment" selecciona **GitHub Actions** como fuente.
3. Cada `push` a `main` va a construir y publicar el sitio solo (el workflow ya está en `.github/workflows/deploy.yml`).
4. El proyecto ya está configurado con `base: '/LRDG-Descargar/'` en `vite.config.js`, así que si no cambias el nombre del repo no necesitas tocar nada más.

### Opción B: manual con gh-pages

```bash
npm install
npm run build
npm run deploy
```

Esto publica la carpeta `dist` en la rama `gh-pages`. Luego en **Settings → Pages** selecciona la rama `gh-pages` como fuente.

## Estructura

```
la-rosa-tv/
├── .github/workflows/deploy.yml   # Deploy automático a GitHub Pages
├── src/
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── SideMenu.jsx
│   │   └── SeasonsGrid.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Próximos pasos

- Conectar cada temporada con su lista real de episodios y links de descarga.
- El menú lateral (`SideMenu.jsx`) está listo para agregar más opciones.
