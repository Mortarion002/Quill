# Quill — Quiet Writing Space

A premium, local-first writing environment built for focused thinking. Quill works entirely offline out of the box and optionally syncs to the cloud when you sign in.

---

## Overview

Quill is a block-based document editor inspired by Notion and iA Writer. It combines a distraction-free writing experience with optional Supabase cloud sync, making it useful as both a personal scratchpad and a cloud-backed workspace.

**Core philosophy:**

- **Local-first** — everything works in the browser without an account
- **Cloud-optional** — sign in to back up and sync across devices
- **Quiet UI** — minimal chrome, focused on the writing surface

---

## Features

### Editor

- Block-based rich text via TipTap (ProseMirror)
- Slash command menu (`/`) — headings, lists, blockquotes, code blocks, dividers
- Selection toolbar — appears on text selection for bold, italic, alignment, and links
- Drag-to-reorder blocks via floating drag handle
- Real-time document stats (word count, character count, block count)
- Configurable font: Inter, Georgia (serif), or system monospace
- Adjustable line spacing (1.25 – 2.25)
- Spell check toggle
- Emoji icon picker per document

### Workspace

- Sidebar navigation: Pages, Favorites, Templates, Search, Settings, Help, Trash
- New Page button with auto-focus on title
- Soft delete with restore from Trash
- Inspector panel (right sidebar) for per-block formatting controls

### Auth & Cloud Sync

- Email/password sign up and sign in via Supabase Auth
- Debounced auto-save to Supabase Postgres (900ms, non-blocking)
- Local-first merge: newer `updatedAt` wins per document
- Sync status indicator in the top bar (Local / Syncing / Cloud saved / Sync issue)
- RLS-enforced: users can only access their own documents

### Landing Page

- Full marketing site at `/`
- Hero, Features, Workflow tabs, Pricing, FAQ, CTA, and Footer sections
- Framer Motion scroll animations and floating UI mockup

---

## Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Next.js App Router | 16.2.4 |
| UI Runtime | React | 19.2.4 |
| Language | TypeScript | 5 |
| Editor | TipTap (ProseMirror) | 3.22.4 |
| State | Zustand | 5.0.12 |
| Animation | Framer Motion | 12.38.0 |
| Styling | Tailwind CSS | v4 |
| Auth | Supabase Auth | 2.105.0 |
| Database | Supabase Postgres | — |
| SSR sessions | @supabase/ssr | 0.10.2 |
| Fonts | Next.js Google Fonts (Inter, Plus Jakarta Sans) | — |

---

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx              # Root layout, font setup
│   ├── page.tsx                # Marketing landing page
│   └── editor/
│       └── page.tsx            # Editor workspace shell
│
├── components/
│   ├── auth/
│   │   └── SupabaseAuthControl.tsx   # Auth modal + user button
│   ├── editor/
│   │   ├── Editor.tsx                # TipTap editor (core)
│   │   ├── DocumentTitle.tsx         # Title + emoji picker
│   │   ├── SlashMenu.tsx             # / command palette
│   │   ├── SelectionToolbar.tsx      # Inline formatting toolbar
│   │   ├── EmojiPicker.tsx           # Emoji panel
│   │   └── EmptyState.tsx            # New document prompt
│   ├── layout/
│   │   ├── Sidebar.tsx               # Left nav
│   │   ├── TopBar.tsx                # Header bar
│   │   ├── Inspector.tsx             # Right panel
│   │   └── WorkspacePanel.tsx        # Pages / Settings / Trash views
│   ├── sync/
│   │   └── CloudDocumentSync.tsx     # Background sync orchestrator
│   └── ui/
│       └── Icon.tsx                  # Icon wrapper
│
├── lib/
│   ├── documents/
│   │   └── cloudDocuments.ts         # Supabase CRUD + merge logic
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client
│       ├── server.ts                 # Server-side Supabase client
│       ├── config.ts                 # Env var validation
│       └── proxy.ts                  # Session refresh middleware helper
│
├── store/
│   ├── useDocumentStore.ts           # Pages, sync status, CRUD actions
│   ├── useUIStore.ts                 # Active view, inspector, editor ref, doc stats
│   └── useSettingsStore.ts           # Font, line spacing, spell check
│
└── types/
    └── index.ts                      # Page, Block, BlockType interfaces
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (only required for cloud sync — the app works fully offline without it)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd quill
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Find your values in the Supabase dashboard under **Project Settings → API**.

> If you skip this step the app still works — you just won't have cloud sync or auth.

### 3. Set up the database

In the Supabase dashboard, open the **SQL Editor** and run:

```sql
-- Documents table
create table public.documents (
  id           text primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null default 'Untitled',
  content      text not null default '',
  emoji        text,
  favorite     boolean not null default false,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for fast user-scoped queries
create index documents_user_updated_idx
  on public.documents (user_id, updated_at desc);

-- Row Level Security
alter table public.documents enable row level security;

create policy "Users manage own documents"
  on public.documents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page or [http://localhost:3000/editor](http://localhost:3000/editor) to go straight to the editor.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## State Management

Quill uses three Zustand stores:

**`useDocumentStore`** *(persisted to localStorage)*

- All pages (including soft-deleted)
- Active page ID
- Cloud sync status and timestamp
- Pending cloud deletes queue
- CRUD actions: `createPage`, `updatePage`, `deletePage`, `restorePage`, `permanentlyDeletePage`, `toggleFavorite`

**`useUIStore`** *(in-memory)*

- Current workspace view (`editor | search | pages | favorites | templates | settings | help | trash`)
- Inspector panel open/closed
- Active TipTap editor reference (used by Inspector to apply formatting)
- Live document stats (words, characters, blocks)

**`useSettingsStore`** *(persisted to localStorage)*

- Editor font (`inter | serif | mono`)
- Line spacing (1.25 – 2.25)
- Spell check enabled

---

## Cloud Sync Architecture

```text
User types
    ↓
useDocumentStore.updatePage()    ← debounced 900ms
    ↓
CloudDocumentSync (background component)
    ↓
  Fetch cloud pages
  Merge: newer updatedAt wins per document
  Upsert changed pages to Supabase
  Delete permanently deleted pages
    ↓
setCloudSynced() → "Cloud saved" in TopBar
```

- **Non-blocking** — sync runs entirely in the background, never pauses the editor
- **Conflict resolution** — last-write-wins per document (by `updatedAt` timestamp)
- **Soft deletes** — documents marked with `deleted_at`, restorable from Trash
- **Permanent deletes** — removed from local store, queued for Supabase deletion on next sync
- **RLS enforced** — Supabase only returns rows where `auth.uid() = user_id`

---

## Tailwind v4 — Important Note

This project uses **Tailwind CSS v4** with custom `@theme` spacing variables in `globals.css`:

```css
@theme {
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 48px;
  --spacing-xl: 80px;
}
```

These override Tailwind's named size utilities. `max-w-sm`, `max-w-md`, `max-w-lg`, `max-w-xl` resolve to **8–80px** instead of their usual rem values.

**Always use numeric or arbitrary values instead:**

```tsx
// Broken — resolves to 16px in this project
<div className="max-w-sm">

// Correct
<div className="max-w-96">     // 24rem (Tailwind numeric scale)
<div className="max-w-128">    // 32rem (Tailwind numeric scale)
<div className="max-w-2xl">    // Tailwind numeric scale (unaffected)
```

---

## Deployment

The app is configured for Vercel.

1. Push to GitHub and import the repo in [Vercel](https://vercel.com)
2. Add the three environment variables in Vercel project settings
3. Update `NEXT_PUBLIC_SITE_URL` to your production domain
4. Add your production domain to **Supabase → Auth → URL Configuration → Redirect URLs**

See `docs/deployment.md` for the full checklist.

---

## Design System

| Token | Value |
| --- | --- |
| Primary | Violet — `#7c3aed` / `violet-600` |
| Background (light) | `#ececf4` |
| Background (dark) | `#0b0b0f` |
| Editor font | Inter (configurable) |
| Landing font | Plus Jakarta Sans |
| Icon set | Material Symbols Outlined |
| Dark mode | `data-theme="dark"` on `<html>` |

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
