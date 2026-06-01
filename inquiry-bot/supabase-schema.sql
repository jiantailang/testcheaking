-- Run this SQL in Supabase SQL Editor to create the inquiries table
create table inquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  company text,
  email text not null,
  category text not null,
  body text not null,
  ai_reply text,
  ai_category text,
  urgency text,
  status text default 'pending', -- pending / approved / rejected
  approved_at timestamp with time zone
);

-- Enable Row Level Security (recommended)
alter table inquiries enable row level security;

-- Allow all operations for anon key (adjust for production)
create policy "Allow all" on inquiries for all using (true);
