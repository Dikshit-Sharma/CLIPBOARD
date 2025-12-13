# 📋 SharedClip

> A modern, real-time collaborative clipboard for rich text and notes. Share content instantly with a simple code or link.

**🌐 Live Demo:** [sharedclip.netlify.app](https://sharedclip.netlify.app)

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)

---

## ✨ Features

### 🎨 Rich Text Editing
- **Full-featured editor** powered by TipTap
- **Formatting options**: Bold, Italic, Underline, Strikethrough
- **Headings**: H1, H2, H3 support
- **Lists**: Bullet lists and ordered lists
- **Code blocks**: Syntax-highlighted code blocks with multiple language support
- **Inline code**: Highlighted inline code snippets
- **Blockquotes**: For quotes and callouts
- **Links**: Clickable links that open in new tabs
- **Word & character count**: Real-time statistics
- **Export options**: Copy content as plain text or HTML

### 🔄 Real-Time Collaboration
- **Live sync**: Changes appear instantly for all users
- **Presence indicators**: See who's online on each clipboard
- **Activity feed**: Track all changes and updates
- **Socket.IO powered**: Fast, reliable real-time communication
- **Citrix compatible**: Optimized for enterprise environments with polling fallback

### 🔐 Security & Privacy
- **Password protection**: Optional password for sensitive content
- **Token-based access**: Secure read-only and read/write tokens
- **Expiration settings**: Auto-expire after 1 hour, 1 day, or never
- **Session management**: Secure JWT-based authentication

### 🚀 User Experience
- **Short codes**: 8-character clipboard IDs for easy sharing
- **Shareable links**: Generate read-only or read/write links
- **Recent clipboards**: Quick access to recently opened clipboards
- **Search functionality**: Find clipboards by code
- **Delete management**: Remove individual or all recent clipboards
- **Modern UI**: Beautiful dark theme with smooth animations
- **Responsive design**: Works perfectly on desktop, tablet, and mobile
- **Fast loading**: REST API pre-loading for instant content display

### 💾 Data Management
- **500KB content limit**: Sufficient for most use cases
- **Activity tracking**: Complete history of clipboard changes
- **Local caching**: Faster subsequent loads
- **Auto-cleanup**: Expired clipboards automatically removed

### 🎯 Additional Features
- **Copy to clipboard**: One-click copy for IDs and links
- **Settings management**: Update expiration and password
- **Error handling**: Graceful error messages and recovery
- **Loading states**: Clear feedback during operations
- **Keyboard shortcuts**: Efficient editing experience

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **TipTap** - Rich text editor
- **Socket.IO Client** - Real-time communication
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **TypeScript** - Type safety
- **Firebase Admin SDK** - Database operations
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Database & Infrastructure
- **Firebase Firestore** - NoSQL database (free tier)
- **Netlify** - Frontend hosting
- **Render/Railway** - Backend hosting (recommended)

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm 9+
- Firebase account (free tier)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sharedclip.git
   cd sharedclip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Create a service account key (Project Settings > Service Accounts)
   - Download the service account JSON file
   - See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions

4. **Configure Backend**

   Create `apps/server/.env`:
   ```bash
   PORT=8080
   JWT_SECRET=your_jwt_secret_here  # Generate with: openssl rand -hex 32
   WEB_ORIGIN=http://localhost:5173
   PUBLIC_BASE_URL=http://localhost:8080
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   ```

   Place your Firebase service account JSON file in `apps/server/` directory.

5. **Configure Frontend**

   Create `apps/web/.env`:
   ```bash
   VITE_API_BASE_URL=http://localhost:8080
   VITE_SOCKET_URL=http://localhost:8080
   ```

6. **Run development servers**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080

---

## 📖 Usage

### Creating a Clipboard

1. Click **"Create New Clipboard"** on the home page
2. Choose expiration time (1 hour, 1 day, or never)
3. Optionally set a password for protection
4. Click **"Create"** to generate a new clipboard

### Sharing a Clipboard

1. **Share the clipboard ID**: The 8-character code (e.g., `ABC12345`)
2. **Share a link**:
   - **Read-only link**: For viewing only
   - **Read/write link**: For full editing access
3. Links include tokens in the URL: `https://sharedclip.netlify.app/c/ABC12345?token=...`

### Editing Content

- **Rich formatting**: Use the toolbar to format text
- **Real-time sync**: Changes appear instantly for all users
- **Export**: Copy content as text or HTML
- **Word count**: Monitor content length

### Managing Clipboards

- **Recent clipboards**: Access from the home page
- **Search**: Filter recent clipboards by code
- **Delete**: Remove individual or all recent clipboards
- **Settings**: Update expiration and password (write access required)

---

## 🚀 Deployment

### Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify)

1. **Connect repository** to Netlify
2. **Build settings**:
   - Base directory: `apps/web`
   - Build command: `npm run build`
   - Publish directory: `apps/web/dist`
3. **Environment variables**:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

#### Backend Deployment (Render)

1. **Create a new Web Service**
2. **Connect repository**
3. **Build settings**:
   - Build command: `npm install && npm run build --prefix apps/server`
   - Start command: `node apps/server/dist/index.js`
4. **Environment variables**:
   ```
   PORT=10000
   JWT_SECRET=your_jwt_secret_here
   WEB_ORIGIN=https://sharedclip.netlify.app
   PUBLIC_BASE_URL=https://your-backend.onrender.com
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   ```
5. **Upload Firebase service account JSON** as a secret file

See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides.

---

## 🧪 Testing

### Unit Tests
```bash
npm run test --prefix apps/server
npm run test --prefix apps/web
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

---

## 📁 Project Structure

```
sharedclip/
├── apps/
│   ├── web/              # React frontend
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── pages/        # Page components
│   │   │   ├── services/     # API and Socket.IO clients
│   │   │   └── lib/           # Utilities
│   │   └── package.json
│   └── server/           # Express backend
│       ├── src/
│       │   ├── routes/       # API routes
│       │   ├── socket.ts      # Socket.IO handlers
│       │   ├── db.ts          # Firestore operations
│       │   └── auth.ts        # JWT authentication
│       └── package.json
├── tests/
│   └── e2e/              # Playwright E2E tests
├── netlify.toml          # Netlify configuration
└── package.json          # Root package.json
```

---

## 🔒 Security

- **Token-based authentication**: Secure JWT tokens for sessions
- **Password hashing**: bcrypt for password protection
- **CORS protection**: Configured origin restrictions
- **Input validation**: Zod schemas for request validation
- **Rate limiting**: Recommended for production
- **Firebase security rules**: Deny all client access (server-only)

**⚠️ Important**: Token links act as bearer secrets. Treat them like passwords and never share publicly.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Dikshit Sharma**

- 🌐 Website: [sharedclip.netlify.app](https://sharedclip.netlify.app)
- 📧 For questions or support, please open an issue on GitHub

---

## 🙏 Acknowledgments

- [TipTap](https://tiptap.dev/) - Amazing rich text editor
- [Socket.IO](https://socket.io/) - Real-time communication
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

## 📊 Project Status

✅ **Production Ready** - Fully functional and deployed

- ✅ Real-time collaboration
- ✅ Rich text editing
- ✅ Security features
- ✅ Modern UI/UX
- ✅ Mobile responsive
- ✅ Enterprise compatible (Citrix)

---

## 🐛 Known Issues

None at the moment. If you find any issues, please [open an issue](https://github.com/Dikshit-Sharma/sharedclip/issues).

---

## 🔮 Future Enhancements

- [ ] Markdown import/export
- [ ] Collaborative cursors
- [ ] Version history
- [ ] Templates
- [ ] Themes customization
- [ ] Mobile app

---

**⭐ If you find this project useful, please consider giving it a star!**
