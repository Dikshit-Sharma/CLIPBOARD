# SharedClip
SharedClip is a sleek, dark-themed, real-time shareable clipboard for rich text and files.

It’s designed for “paste a code / open a link → instantly collaborate”.

## Features
- Create / open clipboards via short code (8 chars)
- Shareable links
  - Read-only and read/write tokens (links carry `?token=...`)
- Rich text editing (TipTap)
  - Bold, italic, inline code, code blocks
  - Up to 500KB of text content per clipboard
- Realtime sync
  - Socket.IO rooms per clipboard
  - Presence indicator (online count)
- Clipboard search
  - Home: search recent clipboards
- Optional password protection
- Optional expiration (`1h`, `1d`, `never`)
- **100% Free** - Uses Firebase Firestore free tier (text-only, no file storage)
- Tests
  - Unit/integration: Vitest
  - E2E: Playwright (realtime sync test)
- CI/CD ready
  - GitHub Actions workflow in `.github/workflows/ci.yml`

## Tech stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Realtime: Socket.IO
- Backend: Node.js (Express) + Socket.IO
- Database: Firebase Firestore (text-only, stays within free tier)

## Repo layout
- `apps/web`: React frontend
- `apps/server`: Express + Socket.IO backend
- `tests/e2e`: Playwright tests

## Prereqs
- Node.js 18+
- npm 9+

## Quickstart (local)
### 1) Install
```bash
npm install
```

### 2) Set up Firebase
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase project setup.

Quick steps:
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database (Storage not needed - text-only)
3. Create a service account key (Project Settings > Service Accounts)
4. Download the service account JSON file

### 3) Configure Backend
**📘 See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for complete step-by-step guide!**

Quick setup - Create `apps/server/.env`:

```bash
PORT=8080
JWT_SECRET=YOUR_JWT_SECRET_HERE              # Run: openssl rand -hex 32
WEB_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:8080
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

**Fill in**:
- Replace `YOUR_JWT_SECRET_HERE` with output from `openssl rand -hex 32`
- Place `firebase-service-account.json` in `apps/server/` directory

### 4) Configure Frontend
```bash
# Create apps/web/.env
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

Defaults are:
- Web: `http://localhost:5173`
- API/Socket server: `http://localhost:8080`

### 3) Run dev
```bash
npm run dev
```
- Web: `http://localhost:5173`
- Server health: `http://localhost:8080/healthz`

## Testing
Unit/integration:
```bash
npm run test --prefix apps/server
npm run test --prefix apps/web
```

E2E (starts both dev servers automatically via Playwright webServer):
```bash
npm run test:e2e
```

## Build
```bash
npm run build
```

## Deployment

### Netlify Deployment (Recommended)
See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for a complete guide to deploying on Netlify with Firebase.

**Quick Overview:**
1. **Frontend**: Deploy to Netlify (static hosting)
2. **Backend**: Deploy to Render/Fly.io/Railway (supports WebSockets)
3. **Database & Storage**: Firebase (Firestore + Storage)

### Other Deployment Options

**Option A: Vercel/Netlify (web) + Render/Fly (server)**
1. Deploy `apps/server` (Node service)
   - Set Firebase environment variables (see FIREBASE_SETUP.md)
   - Set `JWT_SECRET` to a strong random secret
   - Set `WEB_ORIGIN` to your deployed frontend origin
2. Deploy `apps/web`
   - Set `VITE_API_BASE_URL` to your server URL
   - Set `VITE_SOCKET_URL` to your server URL

**Option B: Single host (reverse proxy)**
Serve `apps/web/dist` behind Nginx and reverse-proxy `/api` + Socket.IO to the Node server.

## Security notes
- Token links (`?token=...`) act as bearer secrets; treat them like passwords.
- For production:
  - Use a strong `JWT_SECRET`
  - Restrict `WEB_ORIGIN`
  - Add rate limiting
  - Configure Firebase security rules (deny all client access)
  - Never commit Firebase service account keys to Git
  - Use environment variables for all sensitive configuration

## Demo link
This repository includes everything needed to run and deploy SharedClip, but a hosted demo depends on your infrastructure.

- Demo (fill in after deployment): `<YOUR_DEMO_LINK>`

## License
MIT
