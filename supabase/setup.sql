-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Enum for roles, statuses, and leave types
drop type if exists public.user_role cascade;
create type public.user_role as enum ('employee', 'manager', 'admin');

drop type if exists public.leave_status cascade;
create type public.leave_status as enum ('pending', 'approved', 'rejected');

drop type if exists public.leave_type cascade;
create type public.leave_type as enum ('Annual', 'Sick', 'Maternity', 'Paternity', 'Court Case', 'Exam', 'Unpaid', 'Other');

-- Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text not null,
  role public.user_role default 'employee'::public.user_role not null,
  department text,
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Holidays Table
create table public.holidays (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  date date not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leave Balances Table
create table public.leave_balances (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  total_days integer not null default 0,
  used_days integer not null default 0,
  year integer not null default extract(year from current_date),
  unique(user_id, year)
);

-- Leave Requests Table
create table public.leave_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  leave_type public.leave_type not null,
  start_date date not null,
  end_date date not null,
  status public.leave_status default 'pending'::public.leave_status not null,
  reason text not null,
  manager_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.holidays enable row level security;
alter table public.leave_balances enable row level security;
alter table public.leave_requests enable row level security;

-- Admin Check Function (To prevent infinite recursion on the profiles table)
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- RLS: Profiles
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profiles" 
  on public.profiles for update 
  using ( auth.uid() = id );

create policy "Users can insert their own profiles" 
  on public.profiles for insert 
  with check ( auth.uid() = id );

-- Direct UID check to avoid nested subqueries on the same table
create policy "Managers can read team profiles"
  on public.profiles for select
  using (manager_id = auth.uid());

create policy "Admins have full access to profiles"
  on public.profiles for all
  using (public.is_admin());

-- RLS: Holidays
create policy "Everyone can read holidays"
  on public.holidays for select
  to authenticated
  using (true);

create policy "Admins can manage holidays"
  on public.holidays for all
  using (public.is_admin());

-- RLS: Leave Balances
create policy "Users can read own balances"
  on public.leave_balances for select
  using (auth.uid() = user_id);

create policy "Managers can read team balances"
  on public.leave_balances for select
  using (user_id IN (
    select id from public.profiles 
    where manager_id = auth.uid()
  ));

create policy "Admins have full access to balances"
  on public.leave_balances for all
  using (public.is_admin());

-- RLS: Leave Requests
create policy "Users can read own requests"
  on public.leave_requests for select
  using (auth.uid() = user_id);

create policy "Users can create own requests"
  on public.leave_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pending requests"
  on public.leave_requests for update
  using (auth.uid() = user_id and status = 'pending');

create policy "Managers can read team requests"
  on public.leave_requests for select
  using (user_id IN (
    select id from public.profiles 
    where manager_id = auth.uid()
  ));

create policy "Managers can update team requests"
  on public.leave_requests for update
  using (user_id IN (
    select id from public.profiles 
    where manager_id = auth.uid()
  ));

create policy "Admins have full access to requests"
  on public.leave_requests for all
  using (public.is_admin());

-- Profile Sync Logic (Automated)
-- This function is the SOLE creator of new profiles to avoid 500 errors
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    'employee'::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Ensure the trigger is clean and correctly linked to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Supabase Realtime for leave requests
alter publication supabase_realtime add table public.leave_requests;


