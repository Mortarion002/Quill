# Deployment Checklist

## Supabase

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/migrations/0001_documents.sql`.
3. Confirm Row Level Security is enabled on `public.documents`.
4. In Authentication settings, add these redirect URLs:

```text
http://localhost:3000/editor
https://YOUR-VERCEL-DOMAIN.vercel.app/editor
```

## Environment Variables

Use these locally and in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
```

The publishable key can be the Supabase anon key for older projects. Do not add a service role key to the frontend app.

## Vercel

1. Import the GitHub repository into Vercel.
2. Add the environment variables above.
3. Deploy from the Supabase backend branch or merge it into your main branch first.
4. After deploy, create a test account from the app and verify:

- Sign up opens the Quill auth dialog.
- Email confirmation returns to `/editor`.
- A new page saves locally immediately.
- The status pill changes to `Cloud saved` after sign-in.
- Refreshing the app restores cloud documents.

## Local Verification

```bash
npm run lint
npm run build
npm run dev
```
