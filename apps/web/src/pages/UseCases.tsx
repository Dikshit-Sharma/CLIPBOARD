import { ArrowLeft, Code, Laptop, Smartphone, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { AdUnit } from '../components/AdUnit'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'

export function UseCases() {
  return (
    <div className="min-h-screen bg-bg-950">
      <SEO
        title="SharedClip Use Cases - VMs, Remote Work, & Mobile"
        description="Discover how to use SharedClip for transferring text to VMs, sharing files between iOS and Android, and collaborating on code snippets."
        canonical="https://sharedclip.netlify.app/use-cases"
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12">
          <Link to="/">
            <Button variant="ghost" className="mb-6 hover:bg-surface-800">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Use Cases</h1>
          <p className="text-xl text-text-muted">One tool, infinite workflows. Here is how our community uses SharedClip.</p>
        </header>

         {/* AdSense Top */}
        <div className="mb-12 flex justify-center">
             <AdUnit slot="9527620124" format="horizontal" className="w-full rounded-xl bg-surface-800/30 p-4 min-h-[100px]" />
        </div>

        <div className="grid gap-8">
          <UseCase
            icon={Terminal}
            title="The 'Air-Gapped' VM"
            tag="Most Popular"
            problem="You are working on a remote Linux server or a VM console that doesn't support shared clipboard. You need to paste a 50-character API key."
            solution="Open SharedClip on your host machine, paste the key. Open the Short Link on your VM's browser. Done."
          />

          <UseCase
            icon={Smartphone}
            title="Cross-OS File Transfer"
            tag="Mobile"
            problem="You have a photo on your iPhone and need it on your Windows PC. You don't want to email it to yourself or use a cloud drive login."
            solution="Create a clipboard on your PC. Scan the QR code with your iPhone. Upload the photo. It appears on your PC instantly."
          />

           <UseCase
            icon={Code}
            title="Code Snippet Sharing"
            tag="Dev"
            problem="You are pair programming with a colleague who isn't on the same network. You want to share a block of JSON without Slack formatting messing it up."
            solution="Paste the JSON into SharedClip. It preserves syntax highlighting. Your colleague sees it in real-time."
          />

          <UseCase
            icon={Laptop}
            title="Temporary Config Transfer"
            tag="DevOps"
            problem="You need to move a sensitive `.env` file to a server, but you don't want to commit it to Git or leave it on a permanent file server."
            solution="Drag the file to SharedClip. Download it on the server. Delete the clipboard. The file is wiped from our storage forever."
          />
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-r from-accent-500/10 to-accent-600/10 p-8 text-center ring-1 ring-accent-500/20">
           <h2 className="text-2xl font-bold text-text-primary mb-4">Have a unique use case?</h2>
           <p className="text-text-muted mb-6">We love hearing how you use SharedClip. Open a PR on GitHub or let us know!</p>
           <a
             href="https://github.com/Dikshit-Sharma/CLIPBOARD"
             target="_blank"
             rel="noopener noreferrer"
           >
             <Button>Share Your Story</Button>
           </a>
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

function UseCase({ icon: Icon, title, tag, problem, solution }: { icon: any, title: string, tag: string, problem: string, solution: string }) {
  return (
    <div className="group rounded-2xl bg-surface-800/30 p-1 ring-1 ring-white/5 transition-all hover:bg-surface-800/50 hover:ring-accent-500/30">
      <div className="rounded-xl bg-bg-950/50 p-6 h-full">
        <div className="flex items-start justify-between mb-4">
           <div className="flex items-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-800 text-accent-400 group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-text-primary">{title}</h3>
               <span className="inline-flex items-center rounded-md bg-accent-500/10 px-2 py-1 text-xs font-medium text-accent-400 ring-1 ring-inset ring-accent-500/20 mt-1">
                 {tag}
               </span>
             </div>
           </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
           <div className="rounded-lg bg-surface-800/30 p-4">
             <div className="text-xs font-semibold text-red-300 uppercase tracking-wider mb-2">The Problem</div>
             <p className="text-sm text-text-muted leading-relaxed">{problem}</p>
           </div>
           <div className="rounded-lg bg-accent-500/5 p-4 ring-1 ring-accent-500/10">
             <div className="text-xs font-semibold text-accent-300 uppercase tracking-wider mb-2">Our Solution</div>
             <p className="text-sm text-text-muted leading-relaxed">{solution}</p>
           </div>
        </div>
      </div>
    </div>
  )
}
