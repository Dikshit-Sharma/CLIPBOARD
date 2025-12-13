import { AlertTriangle } from 'lucide-react'

export function DevelopmentBanner() {
  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap py-2 flex items-center gap-8 text-xs font-medium text-yellow-500 font-mono">
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-3 w-3" />
          SITE IS UNDER DEVELOPMENT. USERS MAY EXPERIENCE ISSUES.
        </span>
        <span className="flex items-center gap-2">
          REPORT BUGS ON <a href="https://github.com/Dikshit-Sharma/CLIPBOARD/issues" target="_blank" rel="noreferrer" className="underline hover:text-yellow-400">GITHUB ISSUES</a>
        </span>
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-3 w-3" />
          SITE IS UNDER DEVELOPMENT. USERS MAY EXPERIENCE ISSUES.
        </span>
        <span className="flex items-center gap-2">
          REPORT BUGS ON <a href="https://github.com/Dikshit-Sharma/CLIPBOARD/issues" target="_blank" rel="noreferrer" className="underline hover:text-yellow-400">GITHUB ISSUES</a>
        </span>
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-3 w-3" />
          SITE IS UNDER DEVELOPMENT. USERS MAY EXPERIENCE ISSUES.
        </span>
         <span className="flex items-center gap-2">
          REPORT BUGS ON <a href="https://github.com/Dikshit-Sharma/CLIPBOARD/issues" target="_blank" rel="noreferrer" className="underline hover:text-yellow-400">GITHUB ISSUES</a>
        </span>
      </div>
    </div>
  )
}
