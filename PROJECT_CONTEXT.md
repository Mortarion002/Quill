# Quill Project Context

## Purpose

Quill is a frontend-first writing workspace. The product goal is to showcase UI and UX skill through a polished document editor, workspace navigation, contextual inspector, and cloud-backed persistence. It is not intended to feel like a generic CRUD dashboard.

The core experience is a quiet writing environment with minimal interface noise, local-first editing, and optional cloud sync after authentication.

## Current Product Surface

- Workspace shell with fixed sidebar, top bar, editor canvas, and optional inspector panel.
- Block-style writing editor powered by TipTap.
- Local document creation, editing, favoriting, trashing, restoring, and permanent deletion.
- Workspace views for search, pages, favorites, templates, settings, help, and trash.
- Slash command menu for editor block commands.
- Selection toolbar for formatting.
- Inspector panel for block design/config/meta controls.
- Settings panel for editor font, line spacing, and spell check.
- Supabase email/password authentication.
- Supabase document persistence with local-first sync.
- Cloud sync status UI in the top bar and settings panel.

## Design Direction

Design language:

- Light glass workspace shell.
- Soft borders, low-contrast shadows, and restrained violet accent.
- Spacious editor canvas.
- UI should recede during writing and become visible during interaction.
- Avoid generic SaaS density.
- Avoid decorative elements that do not support the writing workflow.

Brand:

- Product name: Quill.
- Subtitle: Quiet writing space.
- Custom feather-style mark is defined inline in `Sidebar.tsx`.

## Tech Stack

- Next.js 16 App Router.
- React 19.
- TypeScript.
- Tailwind CSS v4.
- TipTap editor.
- Zustand for client state.
- Framer Motion for subtle UI transitions.
- Supabase Auth.
- Supabase Postgres for document persistence.
- `@supabase/ssr` for App Router auth/session helpers.
- `@supabase/supabase-js` for browser-side auth and data operations.

## Important Next.js Note

This project uses Next.js 16. Read local docs in `node_modules/next/dist/docs/` before changing App Router, proxy, caching, or server/client patterns. In Next.js 16, middleware is represented by `proxy.ts`.

Current proxy file:

- `src/proxy.ts`

It calls:

- `src/lib/supabase/proxy.ts`

## Branch Context

Current backend branch:

- `codex/subase-backend`

Recent phase commits:

- `e34dd7e Replace Clerk with Supabase auth`
- `e742e23 Add Supabase document persistence`
- `eb1db85 Add cloud sync workspace states`
- `a2574f3 Polish cloud workspace experience`
- `28414ae Prepare workspace for Vercel deployment`

## Key Directories

```text
src/app
  layout.tsx
  page.tsx
  editor/page.tsx

src/components
  auth/SupabaseAuthControl.tsx
  editor/
  layout/
  sync/CloudDocumentSync.tsx
  ui/Icon.tsx

src/lib
  documents/cloudDocuments.ts
  supabase/client.ts
  supabase/config.ts
  supabase/proxy.ts
  supabase/server.ts
  utils.ts

src/store
  useDocumentStore.ts
  useSettingsStore.ts
  useUIStore.ts

src/types
  index.ts

supabase/migrations
  0001_documents.sql

docs
  deployment.md
```

## Runtime Routes

- `/` redirects to `/editor`.
- `/editor` is the main workspace.

## State Architecture

### `useDocumentStore`

File:

- `src/store/useDocumentStore.ts`

Responsibilities:

- Local page array.
- Active page ID.
- Hydration status.
- Cloud sync status.
- Pending cloud hard-delete IDs.
- Page CRUD operations.
- Local persistence via Zustand `persist`.

Important state fields:

- `pages`
- `activePageId`
- `hasHydrated`
- `cloudStatus`
- `cloudMessage`
- `lastSyncedAt`
- `pendingCloudDeleteIds`

Cloud statuses:

- `local`
- `loading`
- `syncing`
- `synced`
- `error`
- `setup`

### `useUIStore`

File:

- `src/store/useUIStore.ts`

Responsibilities:

- Active workspace view.
- Inspector open state.
- Active TipTap editor reference.
- Active block ID.
- Document stats.

### `useSettingsStore`

File:

- `src/store/useSettingsStore.ts`

Responsibilities:

- Editor font.
- Editor line spacing.
- Spell check setting.

Settings are persisted locally.

## Document Model

Client type:

```ts
interface Page {
  id: string;
  title: string;
  content: string;
  emoji?: string;
  favorite?: boolean;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}
```

Supabase table:

- `public.documents`

Migration:

- `supabase/migrations/0001_documents.sql`

Columns:

- `id text primary key`
- `user_id uuid references auth.users(id) on delete cascade`
- `title text`
- `content text`
- `emoji text`
- `favorite boolean`
- `deleted_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

RLS policies:

- Users can read their own documents.
- Users can create their own documents.
- Users can update their own documents.
- Users can delete their own documents.

The migration must be run in Supabase SQL Editor before cloud sync can work.

## Supabase Integration

Environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

Older Supabase projects can use:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Do not add a service role key to the frontend app.

Client helper:

- `src/lib/supabase/client.ts`

Server helper:

- `src/lib/supabase/server.ts`

Proxy session refresh:

- `src/lib/supabase/proxy.ts`
- `src/proxy.ts`

Auth UI:

- `src/components/auth/SupabaseAuthControl.tsx`

Document sync:

- `src/components/sync/CloudDocumentSync.tsx`

Document persistence helpers:

- `src/lib/documents/cloudDocuments.ts`

## Sync Behavior

The editor remains local-first.

When signed out:

- Documents are stored locally through Zustand persistence.
- Top bar shows local mode.

When signed in:

- Local pages are merged with Supabase pages.
- Newer `updatedAt` wins for matching IDs.
- Merged pages are written back to Supabase.
- Subsequent changes are debounced before upload.
- Permanent deletes are tracked in `pendingCloudDeleteIds` and deleted from Supabase on sync.

The sync layer does not block typing.

## Auth Behavior

Supabase email/password auth is used.

Current auth UI:

- Top bar sign in button.
- Sidebar sign in/sign up buttons.
- Custom modal dialog.

Sign-up redirect:

- `${window.location.origin}/editor`

For Vercel, configure Supabase auth redirect URLs in the dashboard.

## Editor Behavior

Editor file:

- `src/components/editor/Editor.tsx`

Libraries:

- TipTap React.
- StarterKit.
- Placeholder.
- TextAlign.

Features:

- Paragraphs and headings.
- Lists.
- Blockquotes.
- Code blocks.
- Horizontal rules.
- Slash command menu.
- Selection toolbar.
- Drag-to-reorder block behavior.
- Document stats sent to `useUIStore`.

## Settings Behavior

Settings view is implemented in:

- `src/components/layout/WorkspacePanel.tsx`

Controls:

- Font: Inter, Georgia, System mono.
- Line spacing.
- Spell check.

Applied through:

- CSS custom properties in `src/app/editor/page.tsx`.
- `.tiptap` rules in `src/app/globals.css`.
- Document title font and spellcheck in `DocumentTitle.tsx`.

## Deployment Notes

Deployment doc:

- `docs/deployment.md`

Deployment checklist:

- Add Supabase env vars to Vercel.
- Run `supabase/migrations/0001_documents.sql`.
- Add Supabase redirect URL for local and Vercel domains.
- Run `npm run lint`.
- Run `npm run build`.

## Verification Commands

```bash
npm run lint
npm run build
npm run dev
```

## Current Limitations

- No realtime collaborative editing.
- No media upload.
- No server-side document API layer yet.
- No conflict resolution beyond latest `updatedAt` per document.
- No workspace/team model.
- No dedicated route protection; the app supports signed-out local mode intentionally.
- Supabase document sync requires the SQL migration to be applied manually.

## Future Work

Likely next implementation steps:

- Add explicit sync retry action for `cloudStatus === "error"`.
- Add onboarding state when Supabase table is missing.
- Add document-level loading skeleton after sign-in.
- Add Supabase storage for images/media.
- Add workspace/team support only if the UI direction needs it.
- Add production analytics only if it does not compromise the quiet writing experience.

## Agent Instructions

- Preserve the UI-first product direction.
- Avoid large visual rewrites unless explicitly requested.
- Keep the editor local-first and non-blocking.
- Do not introduce a second auth provider.
- Do not add `SUPABASE_SERVICE_ROLE_KEY` to client code.
- Prefer Supabase RLS over privileged API routes for normal document CRUD.
- Keep changes phaseable and pushable.
- Run lint and build before finalizing code changes.
