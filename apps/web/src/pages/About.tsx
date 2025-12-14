import { ArrowLeft, Shield, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { AdUnit } from '../components/AdUnit'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'

export function About() {
  return (
    <div className="min-h-screen bg-bg-950">
      <SEO
        title="About SharedClip - The Developer's Real-Time Clipboard"
        description="Learn about the mission behind SharedClip: solving the 'air-gap' problem for developers, ensuring secure and fast cross-device sharing."
        canonical="https://sharedclip.netlify.app/about"
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12">
          <Link to="/">
            <Button variant="ghost" className="mb-6 hover:bg-surface-800">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-text-primary mb-4">About SharedClip</h1>
          <p className="text-xl text-text-muted">Currently, moving text across devices is harder than it should be. We fixed that.</p>
        </header>

        {/* AdSense Top */}
        <div className="mb-12 flex justify-center">
            <AdUnit slot="9527620124" format="horizontal" className="w-full rounded-xl bg-surface-800/30 p-4 min-h-[100px]" />
        </div>

        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Our Mission</h2>
            <div className="prose prose-invert max-w-none text-text-muted">
              <p>
                In a world of seamless connectivity, the simple act of copying text from one screen and pasting it on another
                is surprisingly broken. If you aren't locked into a single ecosystem (like Apple's Universal Clipboard),
                you're stuck emailing yourself links or typing out API keys manually.
              </p>
              <p className="mt-4">
                SharedClip was built to be the <strong>universal connector</strong>. A browser-based "wormhole" that connects
                your VM to your host, your phone to your laptop, or you to your colleague—instantly, securely, and without login.
              </p>
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-3">
             <div className="rounded-xl bg-surface-800/50 p-6 ring-1 ring-white/5">
                <Zap className="h-8 w-8 text-accent-400 mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">Instant Sync</h3>
                <p className="text-sm text-text-muted">Powered by WebSockets for sub-100ms latency. See typing as it happens.</p>
             </div>
             <div className="rounded-xl bg-surface-800/50 p-6 ring-1 ring-white/5">
                <Shield className="h-8 w-8 text-accent-400 mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">Secure & Private</h3>
                <p className="text-sm text-text-muted">Data is encrypted in transit. Auto-expiry ensures your data doesn't linger.</p>
             </div>
             <div className="rounded-xl bg-surface-800/50 p-6 ring-1 ring-white/5">
                <Users className="h-8 w-8 text-accent-400 mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">Developer First</h3>
                <p className="text-sm text-text-muted">Built for code snippets, logs, and config files with syntax highlighting.</p>
             </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">The Story</h2>
            <div className="rounded-2xl bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 p-8 ring-1 ring-white/10">
               <p className="text-text-muted leading-relaxed">
                 I'm <strong>Dikshit Sharma</strong>, an indie developer. I built SharedClip out of frustration.
                 I was working with a remote Linux VM and needed to copy a long SSH key. The VM's shared clipboard driver
                 was broken. I spent 15 minutes typing it manually and made a typo.
               </p>
               <p className="text-text-muted mt-4 leading-relaxed">
                 That weekend, I built the first prototype of SharedClip. Since then, it has evolved into a robust tool
                 handling real-time presence, file uploads, and secure sharing. It's the tool I wish I had years ago.
               </p>
            </div>
          </section>
        </div>

        {/* AdSense Bottom */}
        <div className="mt-16 flex justify-center">
             <AdUnit slot="9527620124" format="horizontal" className="w-full rounded-xl bg-surface-800/30 p-4 min-h-[100px]" />
        </div>
      </div>

      <Footer />
    </div>
  )
}
