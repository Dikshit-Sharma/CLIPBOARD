# Deployment Guide for SharedClip

## Current Status: Deployment Ready (with configuration)

The project is **deployment-ready** but requires proper environment configuration. There's also a bug in local development that needs fixing.

## Issue Found: Token Not Being Passed After Creation

**Problem**: After creating a new clipboard, when navigating to it, the token might not be properly extracted from the URL, causing authentication failures.

**Root Cause**: The navigation uses relative URLs when `PUBLIC_BASE_URL` is not set, and the token extraction from URL params might not work correctly in all cases.

## Data Storage

### Current Setup (Development)
- **Clipboard data**: Stored in `apps/server/data/db.json` (JSON file database)
- **File uploads**: Stored in `apps/server/uploads/` directory (local filesystem)

### Production Recommendations
The README recommends:
- **Database**: Replace JSON file DB with PostgreSQL or SQLite
- **File storage**: Move uploads to object storage (S3/GCS) with signed URLs and lifecycle rules
- **Persistence**: Ensure `DATA_DIR` and `UPLOADS_DIR` are persisted if using file-based storage

## Deployment Options

### Option A: Separate Services (Recommended)

#### 1. Deploy Backend (`apps/server`)

**Platforms**: Render, Fly.io, Railway, Heroku, DigitalOcean App Platform

**Environment Variables**:
```bash
PORT=8080                    # Usually auto-provided by platform
JWT_SECRET=<strong-random-secret>  # Generate: openssl rand -hex 32
WEB_ORIGIN=https://your-frontend-domain.com
PUBLIC_BASE_URL=https://your-backend-domain.com  # For generating share URLs
DATA_DIR=/app/data           # Persist this directory
UPLOADS_DIR=/app/uploads     # Persist this directory
MAX_UPLOAD_MB=25             # Optional: max file size
```

**Build & Start Commands**:
```bash
# Build
npm install
npm run build --prefix apps/server

# Start
npm start --prefix apps/server
```

**Important**: Configure persistent volumes for `DATA_DIR` and `UPLOADS_DIR` on your platform, or migrate to a database and object storage.

#### 2. Deploy Frontend (`apps/web`)

**Platforms**: Vercel, Netlify, Cloudflare Pages

**Environment Variables**:
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

**Build Command**:
```bash
npm install
npm run build --prefix apps/web
```

**Output Directory**: `apps/web/dist`

### Option B: Single Host (Reverse Proxy)

Deploy both services on the same server using Nginx:

1. **Build both**:
   ```bash
   npm run build
   ```

2. **Serve frontend** from `apps/web/dist` via Nginx

3. **Run backend** as a Node service

4. **Nginx config** (example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/apps/web/dist;
           try_files $uri $uri/ /index.html;
       }

       # API
       location /api {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Socket.IO
       location /socket.io {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
       }
   }
   ```

## Production Checklist

- [ ] Set strong `JWT_SECRET` (use `openssl rand -hex 32`)
- [ ] Configure `WEB_ORIGIN` to restrict CORS
- [ ] Set `PUBLIC_BASE_URL` for proper share URL generation
- [ ] Add rate limiting (use express-rate-limit)
- [ ] Replace JSON DB with PostgreSQL/SQLite
- [ ] Move file uploads to S3/GCS with signed URLs
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Set up file lifecycle policies (auto-delete expired files)

## Environment Variables Reference

### Server (`apps/server`)
- `PORT` - Server port (default: 8080)
- `JWT_SECRET` - Secret for signing JWT tokens (REQUIRED)
- `WEB_ORIGIN` - Allowed CORS origin (default: http://localhost:5173)
- `PUBLIC_BASE_URL` - Base URL for generating share links
- `DATA_DIR` - Directory for JSON database (default: ./data)
- `UPLOADS_DIR` - Directory for file uploads (default: ./uploads)
- `MAX_UPLOAD_MB` - Max file size in MB (default: 25)

### Web (`apps/web`)
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8080)
- `VITE_SOCKET_URL` - Socket.IO server URL (default: same as API_BASE_URL)

## Testing Deployment

1. **Health check**: `GET https://your-backend/healthz` should return `{"ok":true}`

2. **Create clipboard**: Test creating a new clipboard via frontend

3. **Access clipboard**: Verify you can access it using the generated link

4. **File upload**: Test file upload functionality

5. **Real-time sync**: Open the same clipboard in two browsers and verify sync works

## Troubleshooting

### Issue: Can't fetch clipboard after creation
- Check that `PUBLIC_BASE_URL` is set correctly
- Verify token is in URL query params
- Check browser console for CORS errors
- Verify `WEB_ORIGIN` matches your frontend domain exactly

### Issue: Files not persisting
- Ensure `UPLOADS_DIR` is on a persistent volume
- Check file permissions
- Consider migrating to object storage

### Issue: Data lost on restart
- Ensure `DATA_DIR` is persisted
- Migrate to a proper database (PostgreSQL/SQLite)

### Issue: Socket.IO not connecting
- Verify `VITE_SOCKET_URL` matches backend URL
- Check CORS configuration
- Ensure WebSocket upgrade is allowed in proxy/load balancer
