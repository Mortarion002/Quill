# Quill

Quiet writing space for focused documents.

Quill is a local-first block editor built with Next.js, TipTap, Zustand, and Supabase. It works offline in the browser by default, then adds authentication and cloud sync when Supabase environment variables are configured.

Live app: https://quill-tau-eight.vercel.app

## Product Intent

Quill is not a CRUD dashboard. It is a writing environment designed to feel calm, clear, and responsive.

The interface prioritizes:

- A minimal editor surface
- Fast writing feedback
- Local-first document ownership
- Optional cloud backup and sync
- A polished UI/UX showcase suitable for Vercel hosting

## Current Features

### Editor

- Block-based rich text editor powered by TipTap and ProseMirror
- Slash command menu for headings, lists, blockquotes, code blocks, and dividers
- Selection toolbar for formatting text
- Drag-to-reorder editor blocks
- Editable document title and emoji icon
- Live document statistics
- Configurable editor font
- Adjustable line spacing
- Spell check toggle

### Workspace

- Sidebar navigation for Search, Pages, Favorites, Templates, Settings, Help, and Trash
- New Page flow with title focus
- Favorites view
- Soft delete and restore from Trash
- Dedicated main-surface views for workspace sections
- Inspector panel for block-level design controls

### Auth And Sync

- Email/password authentication with Supabase Auth
- Local-first Zustand document store persisted to localStorage
- Debounced cloud sync to Supabase Postgres
- Last-write-wins merge based on `updatedAt`
- Sync status in the top bar
- Row Level Security for user-owned documents

### Landing Page

- Marketing page at `/`
- Hero, workflow, pricing, FAQ, and CTA sections
- Framer Motion interactions
- Lucide React icons for landing page UI details

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI Runtime | React 19 |
| Language | TypeScript |
| Editor | TipTap 3 / ProseMirror |
| State | Zustand |
| Animation | Framer Motion |
| Styling | Tailwind CSS v4 |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| SSR Sessions | `@supabase/ssr` |
| Icons | Custom inline editor icons, Lucide React on landing page |
| Hosting | Vercel |

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    editor/
      page.tsx
  components/
    auth/
      SupabaseAuthControl.tsx
    editor/
      DocumentTitle.tsx
      Editor.tsx
      EmojiPicker.tsx
      EmptyState.tsx
      SelectionToolbar.tsx
      SlashMenu.tsx
    layout/
      Inspector.tsx
      Sidebar.tsx
      TopBar.tsx
      WorkspacePanel.tsx
    sync/
      CloudDocumentSync.tsx
    ui/
      Icon.tsx
  lib/
    documents/
      cloudDocuments.ts
    supabase/
      client.ts
      config.ts
      proxy.ts
      server.ts
  store/
    useDocumentStore.ts
    useSettingsStore.ts
    useUIStore.ts
  types/
    index.ts

supabase/
  migrations/
    0001_documents.sql
```

## Getting Started

### Requirements

- Node.js 20 or newer recommended
- npm
- A Supabase project for auth and cloud sync

The app can run without Supabase keys, but auth and cloud sync will stay disabled.

### Install

```bash
npm install
```

### Environment

Create a local `.env` file from the example file:

```bash
cp .env.example .env
```

Set these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, set `NEXT_PUBLIC_SITE_URL` to the deployed Vercel URL or custom domain.

Do not put a Supabase service role key in this frontend app.

### Database

Run the migration in Supabase SQL Editor:

```sql
supabase/migrations/0001_documents.sql
```

The migration creates the `public.documents` table, enables Row Level Security, and adds user-scoped policies.

### Development

```bash
npm run dev
```

Open:

- Landing page: http://localhost:3000
- Editor: http://localhost:3000/editor

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js dev server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

## Deployment

The project is deployed on Vercel from the `main` branch.

Production URL:

```text
https://quill-tau-eight.vercel.app
```

Vercel should use:

- Framework Preset: Next.js
- Build Command: auto-detected (`npm run build`)
- Output Directory: Next.js default
- Install Command: auto-detected (`npm install`)

Required Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
NEXT_PUBLIC_SITE_URL=https://quill-tau-eight.vercel.app
```

In Supabase, add the production URL to Auth URL Configuration so sign-in redirects work correctly.

## State Architecture

Quill uses three Zustand stores.

`useDocumentStore` persists document data and sync metadata:

- Pages
- Active page ID
- Cloud sync status
- Pending cloud deletes
- Create, update, delete, restore, permanent delete, and favorite actions

`useUIStore` manages interface state:

- Active workspace view
- Inspector visibility
- Active TipTap editor reference
- Live document stats

`useSettingsStore` persists editor preferences:

- Editor font
- Line spacing
- Spell check enabled

## Cloud Sync Model

```text
User edits document
  -> Zustand updates local document immediately
  -> CloudDocumentSync debounces changes
  -> Supabase documents are fetched
  -> Local and cloud documents merge by updatedAt
  -> Changed documents are upserted
  -> Pending permanent deletes are applied
  -> Top bar reports sync status
```

Sync is intentionally non-blocking. Local writing should continue even if the network or Supabase is unavailable.

## Tailwind CSS v4 Note

This project defines custom `@theme` spacing variables in `src/app/globals.css`:

```css
@theme {
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 48px;
  --spacing-xl: 80px;
}
```

Because of this, named utilities such as `max-w-sm`, `max-w-md`, `max-w-lg`, and `max-w-xl` resolve to the custom spacing scale. Prefer numeric or arbitrary width utilities when editing layout code.

```tsx
// Avoid for large containers in this project
<div className="max-w-sm">

// Prefer
<div className="max-w-96">
<div className="max-w-2xl">
<div className="max-w-[720px]">
```

## Repository Hygiene

These files and directories are local-only and should not be committed:

- `.env`
- `.vercel/`
- `.clerk/`
- `.claude/`
- `docs/`
- `AGENTS.md`
- `CLAUDE.md`
- `PROJECT_CONTEXT.md`

## License

This project is licensed under the MIT License. See `LICENSE` for details.
