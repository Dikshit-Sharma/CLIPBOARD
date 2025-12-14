import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not found. File uploads will fail.')
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '')
const BUCKET = 'clipboard-files'

export async function generateUploadUrl(fileName: string, contentType: string) {
  const fileId = nanoid(10)
  // Path: clipboard_id/timestamp-random-filename
  // We can't know clipboard_id here easily without passing it, but strictly broadly unique is fine.
  // Better: <timestamp>-<id>-<name>
  const path = `${Date.now()}-${fileId}-${fileName}`.replace(/[^a-zA-Z0-9-._]/g, '_')

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path)

  if (error) {
    throw error
  }

  // Calculate public URL for download
  const { data: publicData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return {
    url: data.signedUrl,
    path: path, // We store the path to delete it later
    publicUrl: publicData.publicUrl,
    token: data.token,
    fileId
  }
}

export async function deleteFileFromStorage(path: string) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path])

  if (error) {
    console.error('Error deleting file from Supabase:', error)
  }
}
