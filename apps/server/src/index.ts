import 'dotenv/config';
import http from 'node:http';
import { createApp } from './app.js';
import { attachSocket } from './socket.js';
import { startCleanupScheduler } from './cleanup.js';

// PORT: Render assigns automatically
const port = Number(process.env.PORT || 8080);

// Firebase must load BEFORE server starts
try {
  await import('./firebase.js');
  console.log('[sharedclip] Firebase initialized successfully');
} catch (err) {
  console.error('[sharedclip] Firebase initialization FAILED:', err);
  process.exit(1);
}

const app = createApp();
const server = http.createServer(app);

attachSocket(server);

// Start automatic cleanup
startCleanupScheduler();

server.listen(port, () => {
  console.log(`[sharedclip] Server running on port: ${port}`);
  console.log(`[sharedclip] Web origin: ${process.env.WEB_ORIGIN}`);
  console.log(`[sharedclip] Public backend URL: ${process.env.PUBLIC_BASE_URL}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
    console.error('[sharedclip] Server error:', error);

    if (error.code === 'EADDRINUSE') {
      console.error(`[sharedclip] Port ${port} already in use`);
    }
  });
