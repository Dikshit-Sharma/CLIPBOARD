# Environment Variables Template

Copy these templates and fill in your values.

## Backend (`apps/server/.env`)

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

## Frontend (`apps/web/.env`)

```bash
# ============================================
# API Configuration
# ============================================
# Backend API URL (where your server is running)
VITE_API_BASE_URL=http://localhost:8080

# Socket.IO server URL (usually same as API_BASE_URL)
VITE_SOCKET_URL=http://localhost:8080

# ============================================
# Firebase Analytics (Optional)
# ============================================
# Get these from Firebase Console > Project Settings > General > Your apps
# Add Firebase web app to your project to get these values
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## How to Fill In

### Backend Values:

1. **JWT_SECRET**:
   ```bash
   openssl rand -hex 32
   ```
   Copy the output and replace `YOUR_JWT_SECRET_HERE`

2. **GOOGLE_APPLICATION_CREDENTIALS**:
   - Download service account JSON from Firebase Console
   - Save as `firebase-service-account.json`
   - Place in `apps/server/` directory
   - Use path: `./firebase-service-account.json`

3. **WEB_ORIGIN**:
   - Usually: `http://localhost:5173` (your frontend URL)
   - Must match exactly (including http/https and port)

4. **PUBLIC_BASE_URL**:
   - Usually: `http://localhost:8080` (your backend URL)

### Frontend Values:

1. **VITE_API_BASE_URL**:
   - Usually: `http://localhost:8080` (your backend URL)

2. **VITE_SOCKET_URL**:
   - Usually: `http://localhost:8080` (same as API_BASE_URL)

3. **Firebase Analytics** (Optional):
   - Go to Firebase Console > Project Settings > General
   - Add a web app to your project (if not already added)
   - Copy the Firebase configuration values
   - Enable Google Analytics in Firebase Console
   - Get Measurement ID from Analytics settings
   - Paste all values into your `.env` file

## Quick Copy-Paste Commands

```bash
# Create backend .env
cd apps/server
cat > .env << 'EOF'
PORT=8080
JWT_SECRET=YOUR_JWT_SECRET_HERE
WEB_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:8080
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
EOF

# Create frontend .env
cd ../web
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
EOF
```

Then edit the files and replace `YOUR_JWT_SECRET_HERE` with your generated secret.
