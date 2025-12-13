# Firebase Setup Guide for SharedClip Features

This guide details all Firebase configuration changes needed for the new features.

---

## 1. Enable Firebase Authentication

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your SharedClip project
3. Click **Authentication** in the left sidebar
4. Click **Get started** if not already enabled

### Step 2: Enable Sign-in Providers

#### Google Sign-In (Recommended - Free)
1. Go to **Sign-in method** tab
2. Click **Google**
3. Toggle **Enable**
4. Set a **Project support email** (your email)
5. Click **Save**

#### Email/Password (Optional - Free)
1. Click **Email/Password**
2. Toggle **Enable**
3. Optionally enable **Email link (passwordless sign-in)**
4. Click **Save**

#### GitHub Sign-In (Optional - Free)
1. Click **GitHub**
2. Toggle **Enable**
3. You'll need to create a GitHub OAuth App:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Set Authorization callback URL: `https://YOUR-PROJECT.firebaseapp.com/__/auth/handler`
   - Copy Client ID and Client Secret to Firebase
4. Click **Save**

### Step 3: Configure Authorized Domains
1. Go to **Settings** tab in Authentication
2. Under **Authorized domains**, add:
   - `localhost`
   - Your Netlify domain (e.g., `sharedclip.netlify.app`)
   - Any custom domains

---

## 2. Update Firestore Security Rules

Replace your current rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user owns the clipboard
    function isOwner(clipboardData) {
      return request.auth != null &&
             clipboardData.ownerId == request.auth.uid;
    }

    // Helper function to check if clipboard is public
    function isPublicClipboard(clipboardData) {
      return clipboardData.ownerId == null;
    }

    // Clipboards collection
    match /clipboards/{clipboardId} {
      // Anyone can read clipboards (with valid session token - checked by server)
      allow read: if true;

      // Server handles all writes through Admin SDK
      allow write: if false;
    }

    // Users collection (new)
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User's clipboard references (new)
    match /users/{userId}/clipboards/{clipboardId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Folders collection (new)
    match /users/{userId}/folders/{folderId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Tags collection (new)
    match /users/{userId}/tags/{tagId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### How to Update Rules:
1. Go to Firebase Console → Firestore Database
2. Click **Rules** tab
3. Replace existing rules with above
4. Click **Publish**

---

## 3. Update Firestore Indexes

Add these composite indexes for efficient queries:

### Index 1: User's Clipboards by Date
```
Collection: clipboards
Fields:
  - ownerId (Ascending)
  - createdAt (Descending)
```

### Index 2: User's Clipboards by Folder
```
Collection: clipboards
Fields:
  - ownerId (Ascending)
  - folderId (Ascending)
  - createdAt (Descending)
```

### Index 3: Clipboards with Tags
```
Collection: clipboards
Fields:
  - ownerId (Ascending)
  - tags (Array contains)
  - createdAt (Descending)
```

### How to Add Indexes:
1. Go to Firebase Console → Firestore Database
2. Click **Indexes** tab
3. Click **Create index**
4. Fill in the fields as shown above
5. Click **Create**

> **Note:** Indexes may take a few minutes to build. You'll see a "Building" status.

---

## 4. New Firestore Collections Schema

### `users` Collection (New)
```javascript
{
  id: "firebase-auth-uid",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  createdAt: "2024-01-01T00:00:00.000Z",
  settings: {
    theme: "dark" | "light" | "system",
    accentColor: "#8b5cf6",
    defaultExpiry: "never" | "1h" | "1d" | "1w",
    keyboardShortcuts: true
  },
  stats: {
    clipboardsCreated: 0,
    totalViews: 0
  }
}
```

### Updated `clipboards` Collection
```javascript
{
  // Existing fields remain unchanged
  id: "abc123",
  contentHtml: "<p>Content</p>",
  contentUpdatedAt: "2024-01-01T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  expiresAt: "2024-01-02T00:00:00.000Z" | null,
  passwordHash: "...",
  readTokenHash: "...",
  writeTokenHash: "...",
  settings: { /* ... */ },
  activity: [ /* ... */ ],

  // NEW fields
  ownerId: "firebase-auth-uid" | null,  // null = anonymous clipboard
  folderId: "folder-id" | null,
  tags: ["tag1", "tag2"],
  isFavorite: false,
  isArchived: false,
  viewCount: 0,
  versions: [
    {
      contentHtml: "<p>Previous content</p>",
      savedAt: "2024-01-01T00:00:00.000Z"
    }
    // Keep last 10 versions
  ],
  isEncrypted: false,
  viewOnce: false,
  maxViews: null  // null = unlimited
}
```

### `users/{userId}/folders` Subcollection (New)
```javascript
{
  id: "folder-id",
  name: "Work",
  color: "#3b82f6",
  createdAt: "2024-01-01T00:00:00.000Z",
  clipboardCount: 5
}
```

---

## 5. Environment Variables

Add these to your `.env` files:

### Server (.env)
```bash
# Existing variables remain unchanged

# No new server-side variables needed for auth
# Firebase Admin SDK handles auth verification
```

### Web (.env)
```bash
# Existing variables remain unchanged
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# These should already exist, but verify:
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Netlify Environment Variables
Add the same `VITE_` variables in Netlify:
1. Go to Netlify Dashboard → Your Site → Site settings
2. Click **Environment variables**
3. Add each variable

---

## 6. Firebase Auth Configuration in Code

The web app will need to initialize Firebase Auth. This will be handled in a new file:

**`apps/web/src/lib/auth.ts`** (Will be created by implementation)

Key initialization:
```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
}

const app = initializeApp(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
```

---

## 7. Server-Side Auth Verification

The server will verify Firebase ID tokens using Admin SDK:

```typescript
import { getAuth } from 'firebase-admin/auth'

async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken)
    return decodedToken.uid
  } catch (error) {
    return null
  }
}
```

---

## Summary Checklist

- [ ] Enable Google Sign-In in Firebase Console
- [ ] Enable Email/Password Sign-In (optional)
- [ ] Add authorized domains
- [ ] Update Firestore security rules
- [ ] Create composite indexes
- [ ] Verify environment variables in Netlify
- [ ] Deploy and test authentication flow

---

## Estimated Costs

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| Firebase Auth | 50K MAU | Under 50K | **$0** |
| Firestore Reads | 50K/day | Under limit | **$0** |
| Firestore Writes | 20K/day | Under limit | **$0** |
| Firestore Storage | 1 GiB | Text only | **$0** |

> **All features are designed to stay within Firebase free tier!**
