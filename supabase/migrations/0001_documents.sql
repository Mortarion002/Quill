create table if not exists public.documents (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  content text not null default '',
  emoji text,
  favorite boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.documents enable row level security;

create policy "Users can read their own documents"
  on public.documents
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own documents"
  on public.documents
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents
  for delete
  using (auth.uid() = user_id);

create index if not exists documents_user_updated_idx
  on public.documents (user_id, updated_at desc);
