# Firebase Setup Guide

This guide will help you set up Firebase for SharedClip.

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "sharedclip")
4. Follow the setup wizard
5. Note your **Project ID** (you'll need this) sharedclip-dlbpr02929

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Production mode** (we handle security via backend)
4. Select a location (choose closest to your users)
5. Click "Enable"

## Step 3: Create Service Account

**Note**: Firebase Storage is NOT needed - SharedClip is text-only to stay within the free tier.

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Service Accounts** tab
3. Click "Generate new private key"
4. Click "Generate key" in the dialog
5. Save the JSON file securely (e.g., `firebase-service-account.json`)
6. **IMPORTANT**: Never commit this file to Git!

## Step 4: Configure Security Rules

### Firestore Rules

Go to **Firestore Database** > **Rules** and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all client access - backend handles all operations
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click "Publish"

**Note**: Storage rules are not needed since we don't use Firebase Storage.

## Step 5: Configure Backend Environment Variables

**📘 See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed step-by-step instructions!**

This guide covers:
- How to create the `.env` file
- How to configure Firebase credentials
- How to generate JWT secret
- How to test the connection
- Troubleshooting tips

Quick reference - Create `apps/server/.env`:

```bash
PORT=8080
JWT_SECRET=<generate-with-openssl-rand-hex-32>  # Run: openssl rand -hex 32
WEB_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:8080

# Option 1: Use service account file path (recommended)
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json

# Option 2: Use service account JSON string
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}

# Option 3: Use project ID (requires gcloud auth)
# FIREBASE_PROJECT_ID=your-project-id
```

**Important**:
- Place `firebase-service-account.json` in `apps/server/` directory
- See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for complete guide

### For Production Deployment

See `NETLIFY_DEPLOYMENT.md` for production environment variable setup.

## Step 6: Test Firebase Connection

1. Start your server: `npm run dev`
2. Create a clipboard via the frontend
3. Check Firebase Console > Firestore Database - you should see a `clipboards` collection
4. Add some text content - verify it syncs in real-time

## Troubleshooting

### Error: "Firebase not configured"
- Make sure `FIREBASE_SERVICE_ACCOUNT` or `GOOGLE_APPLICATION_CREDENTIALS` is set
- Verify the service account JSON is valid
- Check that Firebase Admin SDK is installed: `npm install firebase-admin`

### Error: "Permission denied" in Firestore
- Verify Firestore security rules are set correctly
- Check that the service account has proper permissions
- Ensure you're using the correct project ID


## Security Best Practices

1. **Never commit service account keys to Git**
   - Add `firebase-service-account.json` to `.gitignore`
   - Use environment variables in production

2. **Restrict Firestore/Storage access**
   - Keep security rules denying all client access
   - All operations should go through your backend API

3. **Rotate service account keys periodically**
   - Generate new keys every 90 days
   - Update environment variables in production

4. **Monitor Firebase usage**
   - Set up billing alerts
   - Monitor quota usage in Firebase Console

## Cost Optimization

### Free Tier Limits
- **Firestore**: 50K reads/day, 20K writes/day, 20K deletes/day
- **Storage**: Not used (text-only)

### Tips to Stay Within Free Tier
- Implement client-side caching to reduce reads
- Use batch writes when possible
- Clean up expired clipboards regularly
- Text-only storage means you'll likely stay within free tier limits

### Upgrade to Blaze Plan (if needed)
- Pay-as-you-go pricing
- $0.06 per 100K document reads
- $0.18 per 100K document writes
- $0.02 per 100K document deletes
- Most small-to-medium deployments will stay free!

## Next Steps

- See `NETLIFY_DEPLOYMENT.md` for production deployment
- Set up Firebase TTL policies for automatic cleanup
- Configure monitoring and alerts
