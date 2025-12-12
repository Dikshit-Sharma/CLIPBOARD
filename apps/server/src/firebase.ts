import admin from 'firebase-admin'
import type { Clipboard } from './types.js'

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const projectId = process.env.FIREBASE_PROJECT_ID

  try {
    if (serviceAccountJson) {
      // Service account provided as JSON string
      const serviceAccount = JSON.parse(serviceAccountJson)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
      })
    } else if (serviceAccountPath) {
      // Service account provided as file path
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      })
    } else if (projectId) {
      // For serverless environments (Netlify Functions, etc.)
      admin.initializeApp({
        projectId: projectId
      })
    } else {
      // Try default credentials (for local development with gcloud auth)
      admin.initializeApp()
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw new Error(
      'Firebase not configured. Set one of: FIREBASE_SERVICE_ACCOUNT (JSON string), ' +
      'GOOGLE_APPLICATION_CREDENTIALS (file path), or FIREBASE_PROJECT_ID'
    )
  }
}

export const db = admin.firestore()

// Firestore collections
export const CLIPBOARDS_COLLECTION = 'clipboards'

// Helper to convert Firestore document to Clipboard
export function docToClipboard(doc: admin.firestore.DocumentSnapshot): Clipboard | null {
  if (!doc.exists) return null
  const data = doc.data()
  return {
    id: doc.id,
    ...data
  } as Clipboard
}

// Helper to convert Clipboard to Firestore data (exclude id)
export function clipboardToData(cb: Clipboard): Omit<Clipboard, 'id'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = cb
  return data
}
