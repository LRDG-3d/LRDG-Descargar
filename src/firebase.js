import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Configuración del proyecto "la-rosa-de-tv" en Firebase.
// (measurementId/analytics no se incluye porque no lo usamos aquí)
const firebaseConfig = {
  apiKey: 'AIzaSyDnk-jFcAq-0Jc-_dNMkqXZvEabYynX3Hw',
  authDomain: 'la-rosa-de-tv.firebaseapp.com',
  projectId: 'la-rosa-de-tv',
  storageBucket: 'la-rosa-de-tv.firebasestorage.app',
  messagingSenderId: '1076285527289',
  appId: '1:1076285527289:web:8c96b633c21a56ad333e28',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
