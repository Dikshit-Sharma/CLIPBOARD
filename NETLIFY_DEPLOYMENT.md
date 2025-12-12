# Netlify Deployment Guide for SharedClip with Firebase

This guide covers deploying SharedClip to Netlify with Firebase as the backend.

## Architecture Overview

Since Netlify is optimized for static sites and serverless functions, and Socket.IO requires persistent WebSocket connections, the deployment uses a hybrid approach:

- **Frontend**: Deployed to Netlify (static hosting)
- **Backend API + Socket.IO**: Deployed to a service that supports WebSockets (Render, Fly.io, Railway, or similar)

## Prerequisites

1. **Firebase Project Setup**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database (Storage NOT needed - text-only)
   - Create a service account key (Firebase Console > Project Settings > Service Accounts > Generate New Private Key)

2. **Netlify Account**: Sign up at https://www.netlify.com

3. **Backend Hosting Account**: Choose one:
   - Render (https://render.com) - Recommended
   - Fly.io (https://fly.io)
   - Railway (https://railway.app)
   - DigitalOcean App Platform

## Step 1: Firebase Setup

### 1.1 Create Firestore Database

1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Start in **production mode** (we'll handle security via backend)
4. Choose a location close to your users

### 1.2 Configure Firestore Security Rules

Go to Firestore Database > Rules and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow server-side access
    // Client access is handled via your backend API
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Note**: Storage rules are not needed since we use text-only storage.

### 1.3 Get Service Account Key

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely (you'll need it for backend deployment)

## Step 2: Deploy Backend (Render/Fly.io/Railway)

The backend needs to run on a service that supports WebSockets. Here's how to deploy to **Render**:

### 2.1 Prepare Backend for Deployment

1. Ensure your backend code is committed to Git
2. The backend will use the service account JSON for Firebase authentication

### 2.2 Deploy to Render

1. Sign up/login at https://render.com
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `sharedclip-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd apps/server && npm install && npm run build`
   - **Start Command**: `cd apps/server && npm start`
   - **Root Directory**: Leave empty (or set to repo root)

5. **Environment Variables**:
   ```
   PORT=10000
   JWT_SECRET=<generate-with-openssl-rand-hex-32>
   WEB_ORIGIN=https://your-netlify-site.netlify.app
   PUBLIC_BASE_URL=https://your-backend.onrender.com
   FIREBASE_SERVICE_ACCOUNT=<paste-entire-json-here>
   ```

6. Click "Create Web Service"
7. Note your backend URL (e.g., `https://sharedclip-backend.onrender.com`)

### Alternative: Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
fly launch --name sharedclip-backend

# Set secrets
fly secrets set JWT_SECRET="$(openssl rand -hex 32)"
fly secrets set WEB_ORIGIN="https://your-netlify-site.netlify.app"
fly secrets set PUBLIC_BASE_URL="https://sharedclip-backend.fly.dev"
fly secrets set FIREBASE_SERVICE_ACCOUNT="$(cat path/to/service-account.json)"

# Deploy
fly deploy
```


## Step 3: Deploy Frontend to Netlify

### 3.1 Via Netlify Dashboard

1. Go to https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: Leave empty
   - **Build command**: `cd apps/web && npm install && npm run build`
   - **Publish directory**: `apps/web/dist`

5. **Environment Variables** (Site settings > Environment variables):
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

6. Click "Deploy site"

### 3.2 Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize (if not already done)
netlify init

# Set environment variables
netlify env:set VITE_API_BASE_URL "https://your-backend.onrender.com"
netlify env:set VITE_SOCKET_URL "https://your-backend.onrender.com"

# Deploy
netlify deploy --prod
```

### 3.3 Update netlify.toml

The `netlify.toml` file is already configured. Make sure your environment variables are set in the Netlify dashboard.

## Step 4: Update CORS Settings

After deploying both frontend and backend:

1. Go to your backend hosting dashboard (Render/Fly.io)
2. Update `WEB_ORIGIN` environment variable to your Netlify site URL:
   ```
   WEB_ORIGIN=https://your-site.netlify.app
   ```
3. Redeploy the backend

## Step 5: Test Deployment

1. **Health Check**: Visit `https://your-backend.onrender.com/healthz` - should return `{"ok":true}`

2. **Frontend**: Visit your Netlify site URL

3. **Create Clipboard**: Test creating a new clipboard

4. **Real-time Sync**: Open the same clipboard in two browser tabs and verify real-time updates work

5. **Text Content**: Test adding rich text content and verify it syncs

## Environment Variables Summary

### Backend (Render/Fly.io/Railway)
```
PORT=10000 (or auto-provided)
JWT_SECRET=<strong-random-secret>
WEB_ORIGIN=https://your-netlify-site.netlify.app
PUBLIC_BASE_URL=https://your-backend.onrender.com
FIREBASE_SERVICE_ACCOUNT=<full-json-string>
```

### Frontend (Netlify)
```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

## Troubleshooting

### Issue: CORS Errors
- Verify `WEB_ORIGIN` in backend matches your Netlify site URL exactly (including `https://`)
- Check browser console for specific CORS error messages

### Issue: Socket.IO Connection Failed
- Verify `VITE_SOCKET_URL` is set correctly in Netlify
- Check that your backend hosting supports WebSockets (Render does, but verify)
- Check browser console for WebSocket errors

### Issue: Firebase Authentication Failed
- Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly (entire JSON as string)
- Check Firebase project ID matches
- Verify Storage bucket name is correct


### Issue: Database Operations Failing
- Verify Firestore is enabled in Firebase Console
- Check Firestore security rules (should deny client access, allow server)
- Verify service account has Firestore permissions
- Note: Storage is NOT needed - this is text-only

## Cost Considerations

### Firebase (Free Tier Limits)
- **Firestore**: 50K reads/day, 20K writes/day, 20K deletes/day
- **Storage**: NOT USED (text-only to stay free)
- **Upgrade**: Blaze plan (pay-as-you-go) only if you exceed free tier

### Netlify
- **Free Tier**: 100GB bandwidth/month, 300 build minutes/month
- **Pro**: $19/month for more bandwidth and build minutes

### Render
- **Free Tier**: Spins down after 15min inactivity (not ideal for Socket.IO)
- **Starter**: $7/month for always-on service

### Recommended Setup for Production
- **Firebase**: Free tier (should be sufficient for text-only)
- **Netlify**: Free tier (100GB bandwidth/month)
- **Render**: Free tier (spins down after inactivity) or Starter ($7/month for always-on)

## Security Checklist

- [ ] Strong `JWT_SECRET` set (32+ characters, random)
- [ ] `WEB_ORIGIN` restricted to your Netlify domain
- [ ] Firebase service account key kept secure (never commit to Git)
- [ ] Firestore security rules deny all client access
- [ ] HTTPS enabled on both frontend and backend
- [ ] Text-only storage (no file uploads) to stay within free tier
- [ ] Environment variables set in hosting dashboards (not in code)

## Monitoring

### Firebase Console
- Monitor Firestore usage and reads/writes
- Set up alerts for quota limits (50K reads/day free tier)

### Netlify Dashboard
- Monitor build times and success rates
- Check function logs (if using Netlify Functions)
- Monitor bandwidth usage

### Backend Hosting Dashboard
- Monitor server logs
- Check error rates
- Monitor WebSocket connections

## Next Steps

1. Set up custom domain for Netlify site
2. Set up custom domain for backend (if supported)
3. Configure Firebase TTL policies for expired clipboards
4. Set up monitoring and alerts
5. Configure backup strategy for Firestore
6. Set up CI/CD for automatic deployments
