import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'
import { collection, getFirestore } from 'firebase/firestore'

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyBN9S58IVuZuQwezIYxMI80QMRxAJKxZ_Q',
  authDomain: 'keyboard-speed-trainer.firebaseapp.com',
  projectId: 'keyboard-speed-trainer',
  storageBucket: 'keyboard-speed-trainer.appspot.com',
  messagingSenderId: '549225906484',
  appId: '1:549225906484:web:3b52af894ce13b02112561',
  measurementId: 'G-EQCFL53LGG'
})
export const analytics = getAnalytics(firebaseApp)
export const auth = getAuth()

setPersistence(auth, browserLocalPersistence)

const db = getFirestore(firebaseApp)
export const resultsCollection = collection(db, 'results')
