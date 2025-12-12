# Troubleshooting Guide

## "Failed to fetch" Error When Creating Clipboard

This error typically means the frontend cannot connect to the backend server. Here's how to fix it:

### 1. Check if Backend Server is Running

```bash
# Check if server is running
curl http://localhost:8080/healthz

# Should return: {"ok":true}
```

If this fails, start the backend:
```bash
npm run dev
# or
cd apps/server && npm run dev
```

### 2. Check Environment Variables

**Frontend** (`apps/web/.env`):
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

**Backend** (`apps/server/.env`):
```bash
PORT=8080
JWT_SECRET=<your-secret>
WEB_ORIGIN=http://localhost:5173
GOOGLE_APPLICATION_CREDENTIALS=./path/to/firebase-service-account.json
# OR
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
# OR
FIREBASE_PROJECT_ID=your-project-id
```

### 3. Check Firebase Configuration

The backend needs Firebase credentials. Make sure one of these is set:

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON file
- `FIREBASE_SERVICE_ACCOUNT` - Service account JSON as string
- `FIREBASE_PROJECT_ID` - For serverless deployments

**Test Firebase connection:**
```bash
# Check server logs when starting
# Should see: "[sharedclip] Firebase initialized successfully"
```

If you see Firebase errors, check `FIREBASE_SETUP.md` for setup instructions.

### 4. Check CORS Configuration

Make sure `WEB_ORIGIN` in backend matches your frontend URL exactly:

```bash
# Backend .env
WEB_ORIGIN=http://localhost:5173  # Must match exactly (including http/https)
```

### 5. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for CORS errors or network errors
- **Network tab**: Check if the request to `/api/clipboards` is being made
  - Status should be 200 (success) or 4xx/5xx (error with details)
  - If status is "failed" or "CORS error", it's a connection issue

### 6. Common Issues

#### Issue: "Failed to fetch" with no other errors
**Solution**: Backend server is not running or wrong URL
- Check `VITE_API_BASE_URL` matches backend port
- Verify backend is running: `curl http://localhost:8080/healthz`

#### Issue: CORS error in browser console
**Solution**: `WEB_ORIGIN` doesn't match frontend URL
- Check exact URL in browser address bar
- Update `WEB_ORIGIN` to match exactly (including port)

#### Issue: Firebase initialization error
**Solution**: Missing or invalid Firebase credentials
- Check `FIREBASE_SETUP.md` for setup
- Verify service account file exists and is valid JSON
- Check server logs for specific Firebase error

#### Issue: Port already in use
**Solution**: Another process is using port 8080
```bash
# Find process using port 8080
lsof -i :8080
# or
netstat -ano | findstr :8080  # Windows

# Kill the process or change PORT in .env
```

### 7. Quick Diagnostic Steps

1. **Start backend**:
   ```bash
   cd apps/server
   npm run dev
   ```
   Look for: `[sharedclip] server listening on :8080`

2. **Test health endpoint**:
   ```bash
   curl http://localhost:8080/healthz
   ```
   Should return: `{"ok":true}`

3. **Start frontend**:
   ```bash
   cd apps/web
   npm run dev
   ```
   Should open at `http://localhost:5173`

4. **Check browser console** for errors

5. **Try creating clipboard** and check Network tab for request details

### 8. Getting More Detailed Errors

The improved error handling will now show:
- Network errors: "Cannot connect to server at..."
- Firebase errors: Specific Firebase error message
- Validation errors: Detailed validation messages

Check the browser console and server logs for specific error messages.

## Still Having Issues?

1. Check server logs for errors
2. Check browser console for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure Firebase is properly configured (see `FIREBASE_SETUP.md`)
5. Make sure both frontend and backend are running
