# La Rosa TV

Proyecto React + Vite, listo para desplegarse en GitHub Pages.

## Estructura

```
la-rosa-tv/
├── .github/workflows/deploy.yml   ← despliega automáticamente a Pages
├── index.html
├── vite.config.js                 ← aquí se define el "base" del sitio
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css                  ← paleta y estilos globales
    └── components/
        ├── Header.jsx / Header.module.css
        ├── Hero.jsx / Hero.module.css
        └── Footer.jsx / Footer.module.css
```

## Pasos para subirlo a GitHub y publicarlo (todo desde el navegador)

1. Crea (o ya tienes) el repositorio en GitHub llamado `Streaming-la-rosa`.
2. Sube TODOS estos archivos y carpetas manteniendo la misma estructura
   (incluida la carpeta oculta `.github/workflows/`).
3. `vite.config.js` ya está configurado con `base: '/Streaming-la-rosa/'`,
   así que no necesitas tocarlo mientras el repo se llame así.
4. En GitHub, ve a **Settings → Pages** y en "Build and deployment" elige
   la fuente **GitHub Actions** (no "Deploy from a branch").
5. Cada vez que subas cambios a la rama `main`, el workflow
   `.github/workflows/deploy.yml` compilará el proyecto y lo publicará
   automáticamente. Puedes ver el progreso en la pestaña **Actions**.
6. Cuando termine, tu sitio estará en:
   `https://TU-USUARIO.github.io/Streaming-la-rosa/`

## Desarrollo local (opcional)

```bash
npm install
npm run dev
```

## Configurar Firebase (necesario para el panel /admin)

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto
   (o usa uno que ya tengas).
2. **Firestore Database** → crear base de datos → modo producción.
3. **Authentication** → Sign-in method → habilita **Correo/contraseña**.
4. **Authentication → Users** → añade un usuario (ese correo/contraseña será
   tu acceso al panel admin).
5. En **Configuración del proyecto → Tus apps**, crea una app web y copia
   el objeto `firebaseConfig`.
6. Pega esos valores en `src/firebase.js` (reemplaza `TU_API_KEY`, etc).
7. En **Firestore → Reglas**, usa algo así para que solo usuarios logueados
   puedan escribir, pero cualquiera pueda leer (para mostrar episodios en
   el sitio más adelante):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /episodios/{doc} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## Panel de administración (/admin)

Una vez desplegado, entra a:
`https://TU-USUARIO.github.io/Streaming-la-rosa/admin`

Inicia sesión con el correo/contraseña que creaste en Firebase Authentication.
Desde ahí puedes:
- Añadir un episodio (nombre, URL de miniatura, URL del video, temporada, número).
- Ver la lista de episodios guardados en Firestore (colección `episodios`).
- Eliminar episodios.

> Nota: la protección de `/admin` depende de Firebase Authentication, no
> de que la URL sea "secreta". Sin haber iniciado sesión, nadie puede
> escribir en Firestore gracias a las reglas del paso anterior.
