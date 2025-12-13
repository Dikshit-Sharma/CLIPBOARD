import { AlertTriangle, Github, Hammer } from 'lucide-react'

export function DevelopmentBanner() {
  const messages = [
    { icon: AlertTriangle, text: "SITE UNDER ACTIVE DEVELOPMENT" },
    { icon: Hammer, text: "FEATURES MAY CHANGE" },
    { icon: Github, text: "REPORT BUGS ON ISSUES", link: "https://github.com/Dikshit-Sharma/CLIPBOARD/issues" },
  ]

  // Create enough duplicates to ensure seamless scrolling
  // We repeat the base message set multiple times
  const repeatedMessages = Array(20).fill(messages).flat()

  return (
    <div className="relative z-50 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-md overflow-hidden h-9 flex items-center">
      {/*
        We use two identical tracks for seamless looping if we were using CSS animation manually.
        But assuming 'animate-marquee' is configured in tailwind (linear infinite scroll):
        We just need enough content width > screen width.
      */}
      <div className="animate-marquee whitespace-nowrap flex items-center gap-0 w-max">
        {repeatedMessages.map((msg, i) => (
          <div key={i} className="flex items-center gap-3 px-8 text-[11px] font-bold tracking-widest text-yellow-500/90 font-mono uppercase">
            <msg.icon className="h-3.5 w-3.5" />
            {msg.link ? (
              <a
                href={msg.link}
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow-300 transition-colors underline decoration-yellow-500/30 underline-offset-2"
              >
                {msg.text}
              </a>
            ) : (
              <span>{msg.text}</span>
            )}
            <span className="text-yellow-500/20 ml-6">•</span>
          </div>
        ))}
      </div>

      {/* Optional: Add gradient masks to sides for fade effect */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-surface-900 via-surface-900/50 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface-900 via-surface-900/50 to-transparent pointer-events-none" />
    </div>
  )
}
