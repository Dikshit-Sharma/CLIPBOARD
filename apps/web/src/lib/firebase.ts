import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'

// Firebase configuration - these should be set as environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
let app: FirebaseApp | undefined
let analytics: Analytics | null = null

if (typeof window !== 'undefined') {
  // Only initialize if we have the required config
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    // Initialize Firebase app if not already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    // Initialize Analytics (only in browser and if supported)
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app)
      }
    })
  }
}

export { app, analytics }
export default app
