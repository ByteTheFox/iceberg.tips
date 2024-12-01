-- Businesses table
create table businesses (
  id uuid primary key default uuid_generate_v4(),
  hash text not null unique,
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  country text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on businesses table
alter table businesses enable row level security;

-- Allow anyone to read businesses
create policy "Anyone can view businesses"
  on businesses for select
  to anon, authenticated
  using (true);

-- Allow only authenticated users to create/update businesses
create policy "Authenticated users can create businesses"
  on businesses for insert
  to authenticated
  with check (true);

-- Reports table
create table reports (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  user_id uuid references auth.users(id),  -- Reference to Supabase auth user
  tip_practice text not null,
  suggested_tips integer[] default null,
  service_charge_percentage numeric default null,
  details text,
  created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table reports enable row level security;

-- Allow authenticated users to create reports
create policy "Users can create reports"
  on reports for insert
  to authenticated
  with check (true);

-- Allow users to read all reports
create policy "Anyone can view reports"
  on reports for select
  to anon, authenticated
  using (true);

-- Allow users to update their own reports
create policy "Users can update own reports"
  on reports for update
  to authenticated
  using (auth.uid() = user_id);

-- Allow users to delete their own reports
create policy "Users can delete own reports"
  on reports for delete
  to authenticated
  using (auth.uid() = user_id);