import { Github } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-surface-900/30 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">SharedClip</h3>
            <p className="text-sm text-text-muted">
              Real-time collaborative clipboard for seamless text and file sharing across devices.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/how-it-works" className="hover:text-accent-400 transition-colors">How it Works</Link></li>
              <li><Link to="/use-cases" className="hover:text-accent-400 transition-colors">Use Cases</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/about" className="hover:text-accent-400 transition-colors">About</Link></li>
              <li>
                <a
                  href="https://github.com/Dikshit-Sharma/CLIPBOARD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>


        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} SharedClip. Developed by Dikshit Sharma.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Dikshit-Sharma/CLIPBOARD"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
