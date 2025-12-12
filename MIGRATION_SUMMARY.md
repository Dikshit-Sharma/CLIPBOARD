# Firebase Migration Summary

This document summarizes the changes made to migrate SharedClip from JSON file storage to Firebase.

## What Changed

### Database
- **Before**: JSON file database (`apps/server/data/db.json`)
- **After**: Firebase Firestore
- **Files Modified**:
  - `apps/server/src/db.ts` - Complete rewrite to use Firestore
  - `apps/server/src/routes/clipboards.ts` - Updated to use new Firestore functions
  - `apps/server/src/socket.ts` - Updated to use Firestore

### File Storage
- **Before**: Local filesystem (`apps/server/uploads/`)
- **After**: Firebase Storage
- **Files Modified**:
  - `apps/server/src/routes/clipboards.ts` - File upload/download now uses Firebase Storage

### New Files
- `apps/server/src/firebase.ts` - Firebase initialization and helpers
- `FIREBASE_SETUP.md` - Firebase setup guide
- `NETLIFY_DEPLOYMENT.md` - Netlify deployment guide
- `netlify.toml` - Netlify configuration

### Dependencies Added
- `firebase-admin` - Firebase Admin SDK for Node.js

## Migration Steps for Existing Deployments

If you have an existing deployment using JSON file storage:

1. **Export existing data**:
   ```bash
   # Read apps/server/data/db.json
   # Copy clipboard data
   ```

2. **Set up Firebase** (see `FIREBASE_SETUP.md`)

3. **Import data to Firestore**:
   - Use Firebase Console or write a migration script
   - Import each clipboard as a document in the `clipboards` collection

4. **Migrate files**:
   - Upload files from `apps/server/uploads/` to Firebase Storage
   - Update file paths in Firestore documents to match Firebase Storage paths

5. **Update environment variables**:
   - Add Firebase configuration
   - Remove `DATA_DIR` and `UPLOADS_DIR` (no longer needed)

6. **Deploy updated code**

## Breaking Changes

1. **Environment Variables**:
   - New required: `FIREBASE_SERVICE_ACCOUNT` or `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_PROJECT_ID`
   - New required: `FIREBASE_STORAGE_BUCKET`
   - Removed: `DATA_DIR` (no longer used)
   - Removed: `UPLOADS_DIR` (no longer used)

2. **File URLs**:
   - File download URLs now proxy through the backend (for security)
   - Files are stored in Firebase Storage, not local filesystem

3. **Database Operations**:
   - All database operations now go through Firestore
   - No more file-based atomic writes

## Benefits

1. **Scalability**: Firestore scales automatically
2. **Reliability**: Firebase handles backups and replication
3. **Performance**: Firestore is optimized for read/write operations
4. **File Storage**: Firebase Storage handles large files efficiently
5. **Deployment**: No need to manage persistent volumes for data/files

## Testing

After migration, test:
- [ ] Creating a new clipboard
- [ ] Opening an existing clipboard
- [ ] Real-time content updates (Socket.IO)
- [ ] File uploads
- [ ] File downloads
- [ ] Clipboard expiration
- [ ] Password protection
- [ ] Settings updates

## Rollback Plan

If you need to rollback to JSON file storage:

1. Revert the following files to their previous versions:
   - `apps/server/src/db.ts`
   - `apps/server/src/routes/clipboards.ts`
   - `apps/server/src/socket.ts`
   - Remove `apps/server/src/firebase.ts`

2. Remove `firebase-admin` from `package.json`

3. Restore environment variables:
   - Remove Firebase-related env vars
   - Add back `DATA_DIR` and `UPLOADS_DIR`

4. Restore data from Firebase (if needed):
   - Export from Firestore
   - Convert back to JSON format
   - Save to `apps/server/data/db.json`

## Support

For issues or questions:
- See `FIREBASE_SETUP.md` for Firebase configuration
- See `NETLIFY_DEPLOYMENT.md` for deployment help
- Check Firebase Console for database/storage issues
