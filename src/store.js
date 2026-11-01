// Guarda categorías y temporadas: Firestore si hay config, si no localStorage
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

let cfg = null
try { cfg = import.meta.env.VITE_FIREBASE_CONFIG ? JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG) : null } catch { cfg = null }

export const useFirebase = !!cfg
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

const app = cfg ? initializeApp(cfg) : null
const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null
const ref = db ? doc(db, 'config', 'descargas') : null
const KEY = 'lrdg-descargas'

export async function loadData() {
  let d = { categories: [], seasons: [] }
  try {
    if (ref) { const s = await getDoc(ref); if (s.exists()) d = s.data() }
    else d = JSON.parse(localStorage.getItem(KEY)) || d
  } catch (e) { console.error(e) }
  return { categories: d.categories || [], seasons: d.seasons || [] }
}

export async function saveData(d) {
  if (ref) await setDoc(ref, d)
  else localStorage.setItem(KEY, JSON.stringify(d))
}

export const login = (email, pass) => signInWithEmailAndPassword(auth, email, pass)
export const logout = () => signOut(auth)
export const watchAuth = cb => (auth ? onAuthStateChanged(auth, u => cb(!!u)) : () => {})
