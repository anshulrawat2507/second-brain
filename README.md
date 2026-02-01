# 🧠 Second Brain

> Your personal knowledge base. Modern design. Forever free.

A full-stack personal knowledge management and note-taking web application with beautiful dark UI, Supabase backend, and comprehensive productivity features.

```
  ╔═══════════════════════════════════════════════════════╗
  ║   ███████╗███████╗ ██████╗ ██████╗ ███╗   ██╗██████╗  ║
  ║   ██╔════╝██╔════╝██╔════╝██╔═══██╗████╗  ██║██╔══██╗ ║
  ║   ███████╗█████╗  ██║     ██║   ██║██╔██╗ ██║██║  ██║ ║
  ║   ╚════██║██╔══╝  ██║     ██║   ██║██║╚██╗██║██║  ██║ ║
  ║   ███████║███████╗╚██████╗╚██████╔╝██║ ╚████║██████╔╝ ║
  ║   ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ║
  ║                    SECOND BRAIN                       ║
  ╚═══════════════════════════════════════════════════════╝
```

## ✨ Features

### 🔐 Authentication
- Email & password registration/login
- Secure session management with Supabase Auth
- Password reset via email
- Protected routes with middleware

### 📝 Note Editor
- Markdown editor with live preview
- Multiple editor modes:
  - **Edit Mode** - Pure writing
  - **Preview Mode** - Rendered markdown
  - **Split Mode** - Side-by-side edit + preview
  - **Focus Mode** - Distraction-free writing
  - **Zen Mode** - Minimal interface
  - **Typewriter Mode** - Centered cursor
  - **Reading Mode** - Optimized for reading
- Auto-save with debouncing
- Save status indicator
- Word & character count
- Reading time estimate

### 📁 Organization
- Create folders and subfolders
- Drag & drop notes between folders
- Tag extraction from content (#tags)
- Favorites/starred notes
- Quick notes panel

### 🔖 Bookmarks / Saved Links
- Save links from YouTube, Twitter/X, Instagram, Reddit, GitHub
- Auto-detect platform from URL
- Platform-specific icons and colors
- Filter bookmarks by platform
- Search across all bookmarks
- Copy link to clipboard
- Export as JSON or HTML

### ✅ Todo System
- Create todos with priorities (low, medium, high, critical)
- Set due dates
- Mark as complete
- Filter by status and priority
- Keyboard shortcuts for quick entry

### 📊 Graph View
- Interactive 3D knowledge graph
- Visualize connections between notes
- Navigate by clicking nodes
- Beautiful particle effects

### 🎨 UI/UX
- Beautiful dark theme with purple accents
- Glassmorphism effects
- Smooth animations
- 3D animated background
- Responsive design
- Command palette (Ctrl+K)
- Keyboard shortcuts

### 📋 Templates
- Quick-start templates for common note types
- Create custom templates
- Apply templates to new notes

### 📰 Daily Journal
- Daily journaling with mood tracking
- Date-based entries
- Markdown support

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New note |
| `Ctrl+S` | Save note |
| `Ctrl+K` | Command palette |
| `Ctrl+B` | Bold text |
| `Ctrl+I` | Italic text |
| `Ctrl+/` | Toggle sidebar |
| `Ctrl+L` | Open bookmarks |
| `Ctrl+1` | Edit mode |
| `Ctrl+2` | Split mode |
| `Ctrl+3` | Preview mode |

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (React)
- **Styling**: Tailwind CSS v4
- **3D Graphics**: Three.js + React Three Fiber
- **Markdown**: marked.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: Zustand
- **Icons**: Lucide React
- **Notifications**: react-hot-toast

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/anshulrawat2507/second-brain.git
cd second-brain
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

Copy the environment file (Supabase credentials are pre-configured):

```bash
cp .env.example .env.local
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
second-brain/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── notes/         # Notes CRUD
│   │   │   ├── folders/       # Folders CRUD
│   │   │   ├── todos/         # Todos CRUD
│   │   │   └── bookmarks/     # Bookmarks CRUD
│   │   ├── auth/              # Auth callback
│   │   ├── dashboard/         # Main app
│   │   │   ├── bookmarks/     # Bookmarks page
│   │   │   ├── graph/         # Graph view
│   │   │   ├── tags/          # Tags page
│   │   │   └── todos/         # Todos page
│   │   ├── login/             # Login page
│   │   └── register/          # Register page
│   ├── components/
│   │   ├── auth/              # Auth forms
│   │   ├── bookmarks/         # Bookmark components
│   │   ├── editor/            # Markdown editor
│   │   ├── embeds/            # Link embeds
│   │   ├── graph/             # 3D graph view
│   │   ├── journal/           # Daily journal
│   │   ├── layout/            # Header, Sidebar
│   │   ├── quick-notes/       # Quick notes panel
│   │   ├── search/            # Search components
│   │   ├── templates/         # Note templates
│   │   ├── three/             # 3D backgrounds
│   │   ├── todos/             # Todo components
│   │   └── ui/                # Reusable UI components
│   └── lib/
│       ├── hooks/             # Custom React hooks
│       ├── store/             # Zustand store
│       ├── supabase/          # Supabase clients
│       └── utils/             # Utility functions
├── supabase/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🙏 Acknowledgments

- Inspired by Obsidian, Notion, and modern note-taking apps
- Built with Next.js, Supabase, and Tailwind CSS
- 3D effects powered by Three.js

---

**Second Brain** - Your personal knowledge base. Modern design. Forever free. 🧠
