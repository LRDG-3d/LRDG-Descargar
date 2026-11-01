# LRDG-DESCARGAS

Página de descargas (React + Vite) que lista los archivos de carpetas de Internet Archive.
El admin (engranaje) crea categorías y temporadas; cada temporada lleva la URL de su carpeta.

## Uso en Termux
```
npm install
npm run dev      # desarrollo
npm run build    # genera dist/
```

## Publicar en GitHub Pages
1. Sube el proyecto a un repo (rama `main`).
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Cada push a `main` despliega solo (`.github/workflows/deploy.yml`).

## Datos compartidos (opcional)
Sin configurar nada, los datos se guardan en el navegador (localStorage) y el admin usa un PIN.
Para que todos vean lo que añades:
1. Crea un proyecto Firebase con Firestore y Auth (correo/contraseña) y un usuario admin.
2. Repo → Settings → Secrets and variables → Actions → New secret:
   `VITE_FIREBASE_CONFIG` = `{"apiKey":"...","authDomain":"...","projectId":"...","appId":"..."}`
3. Reglas de Firestore:
```
match /config/{doc} {
  allow read: if true;
  allow write: if request.auth != null;
}
```
Modo local: define `VITE_ADMIN_PIN` (secret o `.env`) para cambiar el PIN por defecto `1234`.
