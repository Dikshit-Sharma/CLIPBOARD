import 'dotenv/config'
import http from 'node:http'
import { createApp } from './app.js'
import { attachSocket } from './socket.js'
import { startCleanupScheduler } from './cleanup.js'

const port = Number(process.env.PORT || 8080)

// Check Firebase configuration before starting
// Import firebase to trigger initialization and catch errors early
import './firebase.js'
console.log('[sharedclip] Firebase initialized successfully')

const app = createApp()
const server = http.createServer(app)
attachSocket(server)

// Start automatic cleanup of expired clipboards
startCleanupScheduler()

server.listen(port, () => {
  console.log(`[sharedclip] server listening on :${port}`)
  console.log(`[sharedclip] Health check: http://localhost:${port}/healthz`)
  console.log(`[sharedclip] Web origin: ${process.env.WEB_ORIGIN || 'http://localhost:5173'}`)
})

server.on('error', (error) => {
  console.error('[sharedclip] Server error:', error)
  if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
    console.error(`[sharedclip] Port ${port} is already in use`)
  }
})
