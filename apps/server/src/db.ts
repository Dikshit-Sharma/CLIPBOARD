import type { Clipboard } from './types.js'
import { db, CLIPBOARDS_COLLECTION, docToClipboard, clipboardToData } from './firebase.js'

export type DbShape = {
  clipboards: Record<string, Clipboard>
}

// Legacy interface for backward compatibility
export async function readDb(): Promise<DbShape> {
  const snapshot = await db.collection(CLIPBOARDS_COLLECTION).get()
  const clipboards: Record<string, Clipboard> = {}

  snapshot.forEach((doc) => {
    const cb = docToClipboard(doc)
    if (cb) {
      clipboards[cb.id] = cb
    }
  })

  return { clipboards }
}

export async function writeDb(next: DbShape): Promise<void> {
  const batch = db.batch()

  // Get all existing clipboards
  const existingSnapshot = await db.collection(CLIPBOARDS_COLLECTION).get()
  const existingIds = new Set(existingSnapshot.docs.map(doc => doc.id))

  // Update or create clipboards
  for (const [id, clipboard] of Object.entries(next.clipboards)) {
    const ref = db.collection(CLIPBOARDS_COLLECTION).doc(id)
    const data = clipboardToData(clipboard)
    batch.set(ref, data, { merge: true })
  }

  // Delete clipboards that are no longer in the new state
  for (const id of existingIds) {
    if (!(id in next.clipboards)) {
      const ref = db.collection(CLIPBOARDS_COLLECTION).doc(id)
      batch.delete(ref)
    }
  }

  await batch.commit()
}

// New Firestore-specific functions for better performance
export async function getClipboard(id: string): Promise<Clipboard | null> {
  const doc = await db.collection(CLIPBOARDS_COLLECTION).doc(id).get()
  return docToClipboard(doc)
}

export async function createClipboard(clipboard: Clipboard): Promise<void> {
  const ref = db.collection(CLIPBOARDS_COLLECTION).doc(clipboard.id)
  const data = clipboardToData(clipboard)
  await ref.set(data)
}

export async function updateClipboard(id: string, updates: Partial<Clipboard>): Promise<void> {
  const ref = db.collection(CLIPBOARDS_COLLECTION).doc(id)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, ...updateData } = updates
  await ref.update(updateData)
}

export async function deleteClipboard(id: string): Promise<void> {
  const ref = db.collection(CLIPBOARDS_COLLECTION).doc(id)
  await ref.delete()
}
