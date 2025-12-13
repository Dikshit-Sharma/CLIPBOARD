# Firebase Analytics Setup Guide

This guide will help you set up Firebase Analytics for SharedClip to track user interactions and app usage.

## Prerequisites

- A Firebase project (same one used for Firestore)
- Firebase project with Analytics enabled

## Step 1: Enable Google Analytics in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click on the gear icon ⚙️ next to "Project Overview"
4. Select **Project Settings**
5. Scroll down to the **Your apps** section
6. If you don't have a web app yet:
   - Click **Add app** > **Web** (</> icon)
   - Register your app with a nickname (e.g., "SharedClip Web")
   - Click **Register app**

## Step 2: Get Firebase Configuration

1. In **Project Settings** > **Your apps** section
2. Find your web app
3. You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 3: Enable Google Analytics

1. In Firebase Console, go to **Analytics** in the left sidebar
2. If not already enabled, click **Get started**
3. Select or create a Google Analytics account
4. Choose your Analytics account settings
5. Click **Enable Google Analytics**

## Step 4: Get Measurement ID

1. Go to **Analytics** > **Events** in Firebase Console
2. Or go to **Project Settings** > **General** tab
3. Scroll to **Your apps** section
4. Find your web app
5. The **Measurement ID** will be shown (format: `G-XXXXXXXXXX`)

## Step 5: Add Environment Variables

Add the following to your `apps/web/.env` file:

```bash
# Firebase Analytics Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace all values with the ones from your Firebase configuration.

## Step 6: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. Perform some actions (create clipboard, edit content, etc.)
4. Go to Firebase Console > **Analytics** > **Events**
5. You should see events appearing (may take a few minutes)

## Tracked Events

The following events are automatically tracked:

### Page Views
- `page_view` - Tracks when users navigate to different pages

### Clipboard Events
- `clipboard_created` - When a new clipboard is created
- `clipboard_opened` - When a clipboard is opened (with source: code/link/recent)
- `clipboard_shared` - When a clipboard link is shared (read/write/current)
- `clipboard_deleted` - When a clipboard is deleted

### Content Events
- `content_updated` - When clipboard content is updated
- `settings_updated` - When clipboard settings are changed

### User Engagement
- `user_engagement` - Tracks user interactions

## Viewing Analytics Data

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Analytics** in the left sidebar
4. View:
   - **Events**: All tracked events
   - **Dashboard**: Overview of user activity
   - **User engagement**: User interaction metrics

## Production Deployment

For production (Netlify), add the same environment variables:

1. Go to Netlify Dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add all `VITE_FIREBASE_*` variables
5. Redeploy your site

## Troubleshooting

### Analytics not working?

1. **Check environment variables**: Make sure all `VITE_FIREBASE_*` variables are set
2. **Check browser console**: Look for Firebase initialization errors
3. **Verify Measurement ID**: Ensure `VITE_FIREBASE_MEASUREMENT_ID` starts with `G-`
4. **Check Firebase Console**: Verify Analytics is enabled in your project
5. **Wait a few minutes**: Analytics data may take a few minutes to appear

### Events not showing up?

- Analytics events are batched and sent periodically
- It may take 24-48 hours for some reports to appear
- Real-time events appear in Firebase Console > Analytics > Events within a few minutes

## Privacy Considerations

- Firebase Analytics is GDPR compliant
- No personally identifiable information (PII) is collected by default
- Clipboard IDs are tracked but are random and not linked to users
- Consider adding a privacy policy if required by your jurisdiction

## Additional Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
