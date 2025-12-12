// Automatic cleanup of expired clipboards from Firestore
import { db, CLIPBOARDS_COLLECTION } from './firebase.js'
import { deleteClipboard } from './db.js'
import type { Clipboard } from './types.js'

const CLEANUP_INTERVAL = 60 * 60 * 1000 // Run every hour
const BATCH_SIZE = 500 // Firestore batch limit

function isExpired(cb: Clipboard): boolean {
  return cb.expiresAt ? Date.now() > new Date(cb.expiresAt).getTime() : false
}

async function cleanupExpiredClipboards(): Promise<void> {
  try {
    console.log('[cleanup] Starting expired clipboard cleanup...')
    const now = Date.now()
    let deletedCount = 0

    // Query clipboards with expiration dates
    const snapshot = await db
      .collection(CLIPBOARDS_COLLECTION)
      .where('expiresAt', '!=', null)
      .get()

    const expired: string[] = []

    snapshot.forEach((doc) => {
      const data = doc.data() as Clipboard
      if (data.expiresAt && now > new Date(data.expiresAt).getTime()) {
        expired.push(doc.id)
      }
    })

    if (expired.length === 0) {
      console.log('[cleanup] No expired clipboards found')
      return
    }

    console.log(`[cleanup] Found ${expired.length} expired clipboards`)

    // Delete in batches (Firestore batch limit is 500)
    for (let i = 0; i < expired.length; i += BATCH_SIZE) {
      const batch = db.batch()
      const batchIds = expired.slice(i, i + BATCH_SIZE)

      for (const id of batchIds) {
        const ref = db.collection(CLIPBOARDS_COLLECTION).doc(id)
        batch.delete(ref)
      }

      await batch.commit()
      deletedCount += batchIds.length
      console.log(`[cleanup] Deleted batch: ${batchIds.length} clipboards (${deletedCount}/${expired.length})`)
    }

    console.log(`[cleanup] Cleanup complete: deleted ${deletedCount} expired clipboards`)
  } catch (error) {
    console.error('[cleanup] Error cleaning up expired clipboards:', error)
  }
}

export function startCleanupScheduler(): void {
  // Run cleanup immediately on startup
  cleanupExpiredClipboards().catch(console.error)

  // Then run periodically
  setInterval(() => {
    cleanupExpiredClipboards().catch(console.error)
  }, CLEANUP_INTERVAL)

  console.log(`[cleanup] Scheduler started (runs every ${CLEANUP_INTERVAL / 1000 / 60} minutes)`)
}
