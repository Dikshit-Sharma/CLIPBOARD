# Quick Start Guide

Get SharedClip running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Firebase account (free)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Firebase (5 minutes)

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → Enter name → Continue
3. **Enable Firestore Database**:
   - Go to **Firestore Database**
   - Click **"Create database"**
   - Choose **Production mode**
   - Select location → **Enable**
4. **Get Service Account Key**:
   - Go to **Project Settings** (gear icon)
   - **Service Accounts** tab
   - Click **"Generate new private key"**
   - Click **"Generate key"**
   - **Save the JSON file** as `firebase-service-account.json`

## Step 3: Configure Backend

### 3.1 Create Environment File

```bash
cd apps/server
touch .env
```

### 3.2 Add Configuration

Open `apps/server/.env` and fill in this template (replace `YOUR_*` values):

```bash
PORT=8080
JWT_SECRET=YOUR_JWT_SECRET_HERE
WEB_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:8080
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

**What to fill in**:
- **JWT_SECRET**: Run `openssl rand -hex 32` and paste the output
- **GOOGLE_APPLICATION_CREDENTIALS**: Use `./firebase-service-account.json` (file should be in `apps/server/` directory)

### 3.3 Generate JWT Secret

```bash
openssl rand -hex 32
```

Copy the output and replace `YOUR_JWT_SECRET_HERE` in `.env` with it.

## Step 4: Configure Frontend

```bash
cd apps/web
touch .env
```

Open `apps/web/.env` and add:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

## Step 5: Start the Application

From project root:

```bash
npm run dev
```

This starts both frontend and backend.

## Step 6: Verify It Works

1. **Check backend**: Open http://localhost:8080/healthz
   - Should show: `{"ok":true}`

2. **Check frontend**: Open http://localhost:5173
   - Should show the SharedClip homepage

3. **Test creation**: Click "Create New Clipboard"
   - Should create successfully without errors

## Troubleshooting

### "Failed to fetch" Error

1. **Check backend is running**:
   ```bash
   curl http://localhost:8080/healthz
   ```

2. **Check Firebase configuration**:
   - Verify `firebase-service-account.json` is in `apps/server/`
   - Check `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`
   - Look for Firebase errors in server logs

3. **Check environment variables**:
   - Backend: `apps/server/.env` exists and has correct values
   - Frontend: `apps/web/.env` exists and has correct values

### Firebase Errors

- **"Firebase not configured"**: Check `.env` has one of:
  - `GOOGLE_APPLICATION_CREDENTIALS`
  - `FIREBASE_SERVICE_ACCOUNT`
  - `FIREBASE_PROJECT_ID`

- **"Permission denied"**: Verify Firestore is enabled in Firebase Console

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080
# Kill it or change PORT in .env
```

## File Structure Checklist

After setup, you should have:

```
CLIPBOARD/
├── apps/
│   ├── server/
│   │   ├── .env                              ✅ Created
│   │   ├── firebase-service-account.json     ✅ Copied here
│   │   └── ...
│   └── web/
│       ├── .env                              ✅ Created
│       └── ...
└── ...
```

## Next Steps

- ✅ Application running locally
- 📖 See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed backend config
- 📖 See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase details
- 📖 See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for deployment

## Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Check server logs for error messages
- Check browser console (F12) for frontend errors
