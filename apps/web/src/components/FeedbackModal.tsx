import { useState } from 'react'
import { Modal, Button, Input } from './ui'
import { Github, Star, Send } from 'lucide-react'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const handleSubmit = () => {
    const subject = `SharedClip Feedback: ${firstName} ${lastName}`
    const body = `Name: ${firstName} ${lastName}
Email: ${email}
Rating: ${rating}/5

Message:
${message}
`
    const mailtoLink = `mailto:dikshit.sharma2580@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="We'd Love Your Feedback! 💛">
      <div className="space-y-6">
        <p className="text-sm text-text-muted">
          Please let us know how you like our product and what we can improve.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-xs font-medium text-text-muted">First Name:</span>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-medium text-text-muted">Last Name:</span>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-xs font-medium text-text-muted">Email:</span>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            type="email"
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-xs font-medium text-text-muted">Message:</span>
          <textarea
            className="w-full rounded-xl bg-surface-800 px-4 py-3 text-sm text-text-primary ring-1 ring-white/10 focus:ring-2 focus:ring-accent-500/50 outline-none transition-all placeholder:text-text-muted/50 min-h-[120px] resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you think..."
          />
        </label>

        <div className="space-y-2">
          <span className="text-xs font-medium text-text-muted">Rate Experience:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-surface-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button onClick={handleSubmit} className="w-full justify-center shadow-lg shadow-accent-500/20" disabled={!message || !rating}>
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>

          <a
            href="https://github.com/Dikshit-Sharma/CLIPBOARD/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-surface-800/50 px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-700 transition-all border border-dashed border-white/10 hover:border-white/20"
          >
            <Github className="h-4 w-4" />
            Report an Issue on GitHub
          </a>
        </div>
      </div>
    </Modal>
  )
}
