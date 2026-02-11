-- Ensure the users table exists and has a JSONB column for the soul
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text,
  soul_data jsonb, -- This stores the entire analysis JSON
  soul_level int default 0, -- Stores synchronization.level
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Allow users to read/update their own data
create policy "Users can see own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own data" on public.users
  for insert with check (auth.uid() = id);

-- =============================================
-- Phase 5: Soul Vectorization (pgvector)
-- =============================================

-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add a vector column to the users table
-- 384-dimensional vector (standard for all-MiniLM-L6-v2)
alter table public.users add column if not exists soul_vector vector(384);

-- Create an index for faster cosine similarity queries
create index if not exists users_soul_vector_idx
  on public.users using ivfflat (soul_vector vector_cosine_ops)
  with (lists = 100);
