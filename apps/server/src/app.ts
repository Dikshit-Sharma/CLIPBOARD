import express from 'express'
import cors from 'cors'
import { clipboardsRouter } from './routes/clipboards.js'

export function createApp() {
  const app = express()

  // 🔥 Allow *all* origins (for development / testing)
  app.use(
    cors({
      origin: true, // reflect request origin
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.use('/api/clipboards', clipboardsRouter);

  // Basic error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}
