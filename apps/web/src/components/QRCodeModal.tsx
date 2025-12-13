import { useState, useEffect } from 'react'
import { QrCode, Copy, Check, Download } from 'lucide-react'
import { Button, Modal } from './ui'

interface QRCodeModalProps {
  open: boolean
  onClose: () => void
  url: string
  title?: string
}

export function QRCodeModal({ open, onClose, url, title = 'Share Clipboard' }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    // Generate QR code using a simple canvas-based approach
    generateQRCode(url).then(setQrDataUrl)
  }, [open, url])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = 'sharedclip-qr.png'
    link.href = qrDataUrl
    link.click()
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-6 bg-white rounded-xl">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
              <QrCode className="h-12 w-12 text-gray-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* URL Display */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-3 py-2 bg-surface-800 rounded-lg text-sm text-text-primary border border-white/10"
          />
          <Button variant="ghost" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleDownload} className="flex-1" disabled={!qrDataUrl}>
            <Download className="h-4 w-4" />
            Download QR
          </Button>
          <Button onClick={onClose} className="flex-1">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Simple QR code generator using a free API (no dependencies needed)
async function generateQRCode(text: string): Promise<string> {
  // Use a free, reliable QR code API
  const encoded = encodeURIComponent(text)
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`

  try {
    const response = await fetch(apiUrl)
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    // Fallback: return a placeholder
    return ''
  }
}
