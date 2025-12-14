import { ArrowLeft, Database, Globe, Lock, Server } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { AdUnit } from '../components/AdUnit'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-bg-950">
      <SEO
        title="How SharedClip Works - The Technical Deep Dive"
        description="Understand the architecture behind SharedClip: React, Socket.io, Redis, and Supabase. Learn how we achieve sub-100ms latency and secure file transfers."
        canonical="https://sharedclip.netlify.app/how-it-works"
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12">
          <Link to="/">
            <Button variant="ghost" className="mb-6 hover:bg-surface-800">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-text-primary mb-4">How It Works</h1>
          <p className="text-xl text-text-muted">A look under the hood of our real-time synchronization engine.</p>
        </header>

        {/* AdSense Top */}
        <div className="mb-12 flex justify-center">
             <AdUnit slot="9527620124" format="horizontal" className="w-full rounded-xl bg-surface-800/30 p-4 min-h-[100px]" />
        </div>

        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">The High-Level Flow</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
               {[
                 { step: 1, title: "Create", desc: "You open SharedClip and get a unique ID." },
                 { step: 2, title: "Connect", desc: "Your browser connects via WebSocket." },
                 { step: 3, title: "Share", desc: "You send the URL to another device." },
                 { step: 4, title: "Sync", desc: "Changes propagate instantly." }
               ].map((s) => (
                 <div key={s.step} className="relative rounded-xl bg-surface-800/50 p-6 ring-1 ring-white/5">
                    <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 font-bold text-white shadow-lg">
                      {s.step}
                    </div>
                    <h3 className="mt-2 font-semibold text-text-primary">{s.title}</h3>
                    <p className="mt-2 text-sm text-text-muted">{s.desc}</p>
                 </div>
               ))}
            </div>
          </section>

          <section>
             <h2 className="text-2xl font-semibold text-text-primary mb-6">The Architecture</h2>
             <div className="space-y-4">
                <ArchitectureItem
                  icon={Globe}
                  title="Frontend"
                  tech="React, Vite, TailwindCSS"
                  desc="A lightweight SPA hosted on global CDN (Netlify). It uses optimistic UI updates to ensure the interface feels instant, even on slow connections."
                />
                <ArchitectureItem
                  icon={Server}
                  title="Real-Time Engine"
                  tech="Node.js, Socket.io"
                  desc="Our WebSocket server handles the 'hot' state—cursor positions, live typing, and presence. It broadcasts changes to all connected peers in milliseconds."
                />
                <ArchitectureItem
                  icon={Database}
                  title="Persistence"
                  tech="Firebase"
                  desc="Metadata (titles, settings, history) is stored in Firebase. This allows you to close the tab and come back later without losing your clipboard setup."
                />
                <ArchitectureItem
                  icon={Lock}
                  title="File Storage"
                  tech="Supabase Storage"
                  desc="Files are uploaded directly to secure buckets using signed URLs. We enforce strict size limits and ownership checks to prevent abuse."
                />
             </div>
          </section>

           <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Security Model</h2>
            <div className="prose prose-invert max-w-none text-text-muted">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Transport Encryption:</strong> All data is encrypted in transit using TLS 1.3.</li>
                <li><strong>Token-Based Access:</strong> URLs contain a cryptographic token. Without it, the server rejects the connection.</li>
                <li><strong>Auto-Expiry:</strong> Data is transient by default. We run aggressive cleanup jobs to delete expired clipboards and files.</li>
              </ul>
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

function ArchitectureItem({ icon: Icon, title, tech, desc }: { icon: any, title: string, tech: string, desc: string }) {
  return (
    <div className="flex gap-4 rounded-xl bg-surface-800/30 p-6 ring-1 ring-white/5 transition-all hover:bg-surface-800/50">
      <div className="flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-700/50 text-accent-400">
           <Icon className="h-6 w-6" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{title} <span className="ml-2 text-xs font-normal text-accent-400 border border-accent-500/20 rounded-full px-2 py-0.5 bg-accent-500/10">{tech}</span></h3>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
