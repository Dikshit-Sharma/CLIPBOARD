# Backend Setup Guide - After Firebase Configuration

This guide walks you through configuring the backend server to connect to Firebase after you've completed Firebase setup.

## Prerequisites

- ✅ Firebase project created
- ✅ Firestore Database enabled
- ✅ Service account key downloaded

If you haven't done these steps, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) first.

## Step 1: Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the **gear icon** ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Click **"Generate key"** in the confirmation dialog
7. **Save the JSON file** (e.g., `firebase-service-account.json`)
8. **IMPORTANT**: Never commit this file to Git! Add it to `.gitignore`

## Step 2: Create Backend Environment File

Create the environment file by copying the example:

```bash
cd apps/server
cp .env.example .env
```

Then edit `.env` and fill in your values (see Step 3).

## Step 3: Configure Environment Variables

Open `apps/server/.env` and fill in the template below. **Replace all `YOUR_*` placeholders with your actual values:**

```bash
# ============================================
# Server Configuration
# ============================================
PORT=8080

# ============================================
# Security
# ============================================
# Generate with: openssl rand -hex 32
JWT_SECRET=YOUR_JWT_SECRET_HERE

# ============================================
# CORS & URLs
# ============================================
# Frontend URL (must match exactly, including http/https and port)
WEB_ORIGIN=http://localhost:5173

# Public base URL for generating share links
PUBLIC_BASE_URL=http://localhost:8080

# ============================================
# Firebase Configuration
# ============================================
# Choose ONE of the following options:

# Option 1: Service Account File Path (Recommended for Local Development)
# Place firebase-service-account.json in apps/server/ directory
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json

# Option 2: Service Account JSON String (For Production/Deployment)
# Uncomment and paste your entire service account JSON here
# FIREBASE_SERVICE_ACCOUNT=YOUR_SERVICE_ACCOUNT_JSON_HERE

# Option 3: Project ID Only (Requires gcloud CLI authentication)
# Uncomment and set your Firebase project ID
# FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

### What to Fill In:

1. **JWT_SECRET**: Run `openssl rand -hex 32` and paste the output
2. **GOOGLE_APPLICATION_CREDENTIALS**: Path to your `firebase-service-account.json` file
   - Use `./firebase-service-account.json` if file is in `apps/server/` directory
   - Or use absolute path: `/full/path/to/firebase-service-account.json`
3. **WEB_ORIGIN**: Usually `http://localhost:5173` (matches your frontend URL)
4. **PUBLIC_BASE_URL**: Usually `http://localhost:8080` (matches your backend URL)

**Important**:
- Place `firebase-service-account.json` in the `apps/server/` directory
- Or use an absolute path to the file
- Make sure the path is correct relative to where you run the server

### Option B: Using Service Account JSON String (For Production/Deployment)

If you prefer to use the JSON as an environment variable:

```bash
# Server Configuration
PORT=8080
JWT_SECRET=your-generated-secret-here
WEB_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:8080

# Firebase Configuration - Option 2: JSON String
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**Note**:
- Replace the entire JSON string with your actual service account JSON
- Keep it on a single line or use proper escaping
- For production, use your platform's environment variable system

### Option C: Using Project ID Only (For Serverless/Netlify Functions)

```bash
# Server Configuration
PORT=8080
JWT_SECRET=your-generated-secret-here
WEB_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:8080

# Firebase Configuration - Option 3: Project ID (requires gcloud auth)
FIREBASE_PROJECT_ID=your-project-id
```

**Note**: This requires `gcloud` CLI to be authenticated locally.

## Step 4: Generate JWT Secret

Generate a strong random secret for JWT:

```bash
# On Linux/Mac
openssl rand -hex 32

# On Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use online generator: https://randomkeygen.com/
```

Copy the generated secret and paste it as `JWT_SECRET` in your `.env` file.

## Step 5: Verify File Structure

Your `apps/server/` directory should look like this:

```
apps/server/
├── .env                          # Your environment variables
├── firebase-service-account.json # Your Firebase credentials (if using Option A)
├── package.json
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── firebase.ts
│   └── ...
└── ...
```

## Step 6: Install Dependencies

Make sure all dependencies are installed:

```bash
# From project root
npm install

# Or from server directory
cd apps/server
npm install
```

## Step 7: Test Backend Connection

### 7.1 Start the Backend Server

```bash
# From project root
npm run dev

# Or from server directory
cd apps/server
npm run dev
```

You should see:
```
[sharedclip] Firebase initialized successfully
[sharedclip] server listening on :8080
[sharedclip] Health check: http://localhost:8080/healthz
[sharedclip] Web origin: http://localhost:5173
```

### 7.2 Test Health Endpoint

In another terminal:

```bash
curl http://localhost:8080/healthz
```

Should return:
```json
{"ok":true}
```

### 7.3 Test Firebase Connection

Try creating a clipboard via the frontend. If Firebase is configured correctly, it should work.

## Step 8: Configure Frontend (If Not Already Done)

Make sure `apps/web/.env` exists:

```bash
cd apps/web
touch .env
```

Add to `apps/web/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

## Troubleshooting

### Error: "Firebase not configured"

**Solution**: Check that one of these is set in `apps/server/.env`:
- `GOOGLE_APPLICATION_CREDENTIALS` (file path)
- `FIREBASE_SERVICE_ACCOUNT` (JSON string)
- `FIREBASE_PROJECT_ID` (with gcloud auth)

### Error: "Cannot find module" or file path issues

**Solution**:
- Check the path to `firebase-service-account.json`
- Use absolute path if relative path doesn't work
- Make sure the file exists and is readable

### Error: "Permission denied" or Firebase auth errors

**Solution**:
- Verify the service account JSON is valid
- Check that Firestore is enabled in Firebase Console
- Ensure the service account has proper permissions

### Error: Port 8080 already in use

**Solution**:
```bash
# Find what's using the port
lsof -i :8080
# Kill it or change PORT in .env
```

### Error: CORS errors

**Solution**:
- Make sure `WEB_ORIGIN` in backend matches your frontend URL exactly
- Check browser console for specific CORS error
- Verify both frontend and backend are running

## Quick Reference: Complete .env Example

Here's a complete example of `apps/server/.env`:

```bash
# ============================================
# Server Configuration
# ============================================
PORT=8080

# ============================================
# Security
# ============================================
# Generate with: openssl rand -hex 32
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# ============================================
# CORS & URLs
# ============================================
WEB_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:8080

# ============================================
# Firebase Configuration
# ============================================
# Option 1: File path (recommended for local dev)
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json

# Option 2: JSON string (for production)
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Option 3: Project ID only (requires gcloud auth)
# FIREBASE_PROJECT_ID=your-project-id
```

## Next Steps

1. ✅ Backend configured
2. ✅ Frontend configured (`apps/web/.env`)
3. ✅ Both servers running (`npm run dev`)
4. ✅ Test creating a clipboard

If everything is set up correctly, you should be able to create clipboards without errors!

## Production Deployment

For production deployment, see:
- [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) - For Netlify deployment
- [DEPLOYMENT.md](./DEPLOYMENT.md) - For other platforms

In production, use environment variables provided by your hosting platform instead of `.env` files.
