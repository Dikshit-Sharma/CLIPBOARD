import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/auth'
import type { Clipboard } from '../types'

export type Folder = {
  id: string
  name: string
  color?: string
}

export type ClipboardWithMeta = Clipboard & {
  isFavorite?: boolean
  isArchived?: boolean
}

export function useClipboards() {
  const { user } = useAuth()
  const [clipboards, setClipboards] = useState<Clipboard[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [archived, setArchived] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !db) {
      setClipboards([])
      setFolders([])
      setFavorites(new Set())
      setArchived(new Set())
      setLoading(false)
      return
    }

    setLoading(true)

    // 1. Subscribe to My Clipboards
    const q = query(
      collection(db, 'clipboards'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubClipboards = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Clipboard))
        console.log("Found clipboards:", data.length)
        setClipboards(data)
      },
      (error) => {
        console.error("Error fetching clipboards:", error)
      }
    )

    // 2. Subscribe to Folders
    const unsubFolders = onSnapshot(
      collection(db, `users/${user.uid}/folders`),
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Folder))
        console.log("Found folders:", data.length)
        setFolders(data)
      },
      (error) => {
        console.error("Error fetching folders:", error)
      }
    )

    // 3. Subscribe to Favorites (Collection of docs with clipboardId as ID)
    const unsubFavorites = onSnapshot(
      collection(db, `users/${user.uid}/favorites`),
      (snapshot) => {
        console.log("Found favorites:", snapshot.size)
        setFavorites(new Set(snapshot.docs.map(d => d.id)))
      },
      (error) => {
        console.error("Error fetching favorites:", error)
      }
    )

    // 4. Subscribe to Archived
    const unsubArchived = onSnapshot(
      collection(db, `users/${user.uid}/archived`),
      (snapshot) => {
        console.log("Found archived:", snapshot.size)
        setArchived(new Set(snapshot.docs.map(d => d.id)))
      },
      (error) => {
        console.error("Error fetching archived:", error)
      }
    )

    setLoading(false)

    return () => {
      unsubClipboards()
      unsubFolders()
      unsubFavorites()
      unsubArchived()
    }
  }, [user])

  // Actions
  const createFolder = async (name: string, color?: string) => {
    if (!user || !db) return
    const payload: any = { name }
    if (color) payload.color = color
    await addDoc(collection(db, `users/${user.uid}/folders`), payload)
  }

  const deleteFolder = async (folderId: string) => {
    if (!user || !db) return
    await deleteDoc(doc(db, `users/${user.uid}/folders`, folderId))
  }

  const toggleFavorite = async (clipboardId: string) => {
    if (!user || !db) return
    const ref = doc(db, `users/${user.uid}/favorites`, clipboardId)
    if (favorites.has(clipboardId)) {
      await deleteDoc(ref)
    } else {
      await setDoc(ref, { at: new Date().toISOString() })
    }
  }

  const toggleArchive = async (clipboardId: string) => {
    if (!user || !db) return
    const ref = doc(db, `users/${user.uid}/archived`, clipboardId)
    if (archived.has(clipboardId)) {
      await deleteDoc(ref)
    } else {
      await setDoc(ref, { at: new Date().toISOString() })
    }
  }

  const updateClipboard = async (clipboardId: string, updates: Partial<Clipboard>) => {
    if (!user || !db) return
    const ref = doc(db, 'clipboards', clipboardId)
    await updateDoc(ref, updates)
  }

  const deleteClipboard = async (clipboardId: string) => {
    if (!user || !db) return
    // Soft delete via API or hard delete via Firestore?
    // Let's use Firestore delete if owner
    const ref = doc(db, 'clipboards', clipboardId)
    await deleteDoc(ref)
  }

  return {
    clipboards,
    folders,
    favorites,
    archived,
    loading,
    createFolder,
    deleteFolder,
    toggleFavorite,
    toggleArchive,
    updateClipboard,
    deleteClipboard
  }
}
