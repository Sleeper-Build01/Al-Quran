# 🕌 Al-Noor — Quran Web App

A fully functional, beautiful Quran web application built with React + Firebase.

## ✨ Features
- 📖 Full Quran Reader (114 Surahs, 6236 Ayaat)
- 🔊 Audio recitation with 3 reciters
- 🌐 English + Urdu translations
- 🔐 Email & Google login
- 🔖 Bookmark ayaat
- 📊 Reading stats & streaks
- 🔍 Search by keyword
- ⚙️ Settings & security
- 📱 Fully responsive

---

## 🚀 Setup Instructions

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Setup Firebase
1. Go to https://console.firebase.google.com
2. Click **Add Project** → name it `al-noor-quran`
3. Go to **Project Settings** → **General** → scroll down → **Add App** → Web
4. Copy your Firebase config
5. Open `src/firebase.js` and replace the placeholder values with your config
6. In Firebase Console → **Authentication** → **Sign-in method**:
   - Enable **Email/Password**
   - Enable **Google**
7. In Firebase Console → **Firestore Database** → **Create database** → Start in **test mode**

### Step 3 — Run locally
```bash
npm run dev
```
Open http://localhost:5173

### Step 4 — Deploy to Vercel
1. Push code to GitHub
2. Go to https://vercel.com → **New Project** → Import your repo
3. Click **Deploy** — done! ✅

---

## 📁 Project Structure
```
src/
├── components/
│   └── Layout.jsx          # Sidebar + bottom nav
├── context/
│   └── AuthContext.jsx     # Firebase auth state
├── pages/
│   ├── Landing.jsx         # Home/marketing page
│   ├── Login.jsx           # Login + Signup
│   ├── Dashboard.jsx       # User dashboard
│   ├── SurahList.jsx       # All 114 surahs
│   ├── Reader.jsx          # Quran reader + audio
│   ├── Bookmarks.jsx       # Saved ayaat
│   ├── Search.jsx          # Search quran
│   ├── Stats.jsx           # Reading statistics
│   └── Settings.jsx        # Account settings
├── utils/
│   └── quranApi.js         # Quran API helpers
├── firebase.js             # Firebase config
├── App.jsx                 # Router
├── main.jsx                # Entry point
└── index.css               # Global styles
```

## 🔑 Tech Stack
- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Auth + DB**: Firebase v10
- **Quran Data**: Al-Quran Cloud API (free)
- **Audio**: Islamic Network CDN (free)
- **Icons**: Lucide React
- **Hosting**: Vercel (free)

## 🎨 Design
- Deep Forest Green + Antique Gold palette
- Glassmorphism UI
- Islamic geometric patterns
- Amiri font for Arabic text
- Cormorant Garamond for headings
- Dark mode by default
