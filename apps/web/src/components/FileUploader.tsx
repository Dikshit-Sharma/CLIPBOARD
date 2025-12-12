import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud } from 'lucide-react'
import clsx from 'clsx'

export function FileUploader(props: { disabled: boolean; busy: boolean; onFiles: (files: File[]) => void }) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (props.disabled) return
      props.onFiles(acceptedFiles)
    },
    [props]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: props.disabled,
    maxSize: 25 * 1024 * 1024
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-surface-900 px-3 py-6 text-sm text-text-muted',
        isDragActive && 'border-accent-500/60 bg-accent-500/5',
        props.disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <input {...getInputProps()} aria-label="Upload files" />
      <UploadCloud className="h-4 w-4" />
      <span>{props.busy ? 'Uploading…' : props.disabled ? 'Uploads disabled' : 'Drag & drop or click to upload'}</span>
    </div>
  )
}
