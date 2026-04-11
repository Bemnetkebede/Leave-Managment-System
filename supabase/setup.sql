
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
  user_dpt text,
  manager_id uuid references public.profiles(id) on delete set null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
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
  total_days integer not null default 20, -- User's screenshot shows 20
  used_days integer not null default 0,
  "Balance" integer generated always as (total_days - used_days) stored, -- Use case-sensitive "Balance"
  year integer not null default extract(year from current_date),
  unique(user_id, year)
);

-- Update RPC to fetch from the specific column "Balance"
create or replace function public.get_user_leave_stats(p_user_id uuid, p_year integer default extract(year from current_date))
returns json as $$
declare
  v_total integer;
  v_used integer;
  v_balance integer;
  v_pending integer;
  v_distribution json;
begin
  -- Ensure balance record exists
  insert into public.leave_balances (user_id, total_days, used_days, year)
  values (p_user_id, 20, 0, p_year)
  on conflict (user_id, year) do nothing;

  -- Sync specific user balance before fetching
  update public.leave_balances b
  set used_days = coalesce((
    select sum(days) 
    from public.leave_requests r 
    where r.user_id = p_user_id 
      and r.status = 'approved' 
      and extract(year from r.start_date) = p_year
  ), 0)
  where b.user_id = p_user_id and b.year = p_year;

  -- Get balances directly from columns (Note the quoted "Balance")
  select total_days, used_days, "Balance"
  into v_total, v_used, v_balance
  from public.leave_balances
  where user_id = p_user_id and year = p_year;
  
  -- Count pending
  select count(*) into v_pending
  from public.leave_requests
  where user_id = p_user_id and status = 'pending' and extract(year from start_date) = p_year;
  
  -- Get distribution by type
  select json_agg(t) into v_distribution
  from (
    select leave_type as name, sum(days) as value
    from public.leave_requests
    where user_id = p_user_id and status = 'approved' and extract(year from start_date) = p_year
    group by leave_type
  ) t;

  return json_build_object(
    'total', coalesce(v_total, 20),
    'used', coalesce(v_used, 0),
    'balance', coalesce(v_balance, 20),
    'pending', v_pending,
    'distribution', coalesce(v_distribution, '[]'::json)
  );
end;
$$ language plpgsql security definer;

 

-- Leave Requests Table
create table public.leave_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  leave_type public.leave_type not null,
  start_date date not null,
  end_date date not null,
  days integer not null default 1,
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

  -- Automatically initialize leave balance for the current year
  insert into public.leave_balances (user_id, total_days, used_days, year)
  values (new.id, 21, 0, extract(year from current_date))
  on conflict (user_id, year) do nothing;

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

-- ==========================================
-- AUTOMATED CALCULATIONS & TRIGGERS
-- ==========================================

-- 1. Working Days Calculation Function
-- Excludes weekends and dates found in public.holidays
create or replace function public.calculate_working_days(p_start_date date, p_end_date date)
returns integer
language plpgsql
as $$
declare
  v_count integer := 0;
  v_curr date := p_start_date;
begin
  while v_curr <= p_end_date loop
    -- 0: Sunday, 6: Saturday
    if extract(dow from v_curr) not in (0, 6) then
      -- Check if it's a holiday
      if not exists (select 1 from public.holidays where date = v_curr) then
        v_count := v_count + 1;
      end if;
    end if;
    v_curr := v_curr + 1;
  end loop;
  return v_count;
end;
$$;

-- 2. Trigger to calculate 'days' before inserting/updating a leave request
create or replace function public.fn_calculate_request_days()
returns trigger as $$
begin
  new.days := public.calculate_working_days(new.start_date, new.end_date);
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_calculate_request_days on public.leave_requests;
create trigger tr_calculate_request_days
  before insert or update of start_date, end_date on public.leave_requests
  for each row execute procedure public.fn_calculate_request_days();

-- 3. Trigger to sync leave_balances.used_days when a request is approved
create or replace function public.fn_sync_leave_balance()
returns trigger as $$
declare
  v_year integer;
begin
  v_year := extract(year from coalesce(new.start_date, old.start_date));
  
  -- Handle INSERT (though usually requests start as pending, but just in case)
  if (TG_OP = 'INSERT' and new.status = 'approved') then
    update public.leave_balances 
    set used_days = used_days + new.days
    where user_id = new.user_id and year = v_year;
  
  -- Handle UPDATE (Status change to approved)
  elsif (TG_OP = 'UPDATE') then
    if (old.status != 'approved' and new.status = 'approved') then
      update public.leave_balances 
      set used_days = used_days + new.days
      where user_id = new.user_id and year = v_year;
    elsif (old.status = 'approved' and new.status != 'approved') then
      update public.leave_balances 
      set used_days = used_days - old.days
      where user_id = new.user_id and year = v_year;
    elsif (old.status = 'approved' and new.status = 'approved' and old.days != new.days) then
      update public.leave_balances 
      set used_days = used_days - old.days + new.days
      where user_id = new.user_id and year = v_year;
    end if;
    
  -- Handle DELETE
  elsif (TG_OP = 'DELETE' and old.status = 'approved') then
    update public.leave_balances 
    set used_days = used_days - old.days
    where user_id = old.user_id and year = v_year;
  end if;
  
  return null;
end;
$$ language plpgsql;

drop trigger if exists tr_sync_leave_balance on public.leave_requests;
create trigger tr_sync_leave_balance
  after insert or update or delete on public.leave_requests
  for each row execute procedure public.fn_sync_leave_balance();

-- 5. Data Synchronization Utility
-- Call this once to fix any existing data inconsistencies
create or replace function public.sync_all_leave_balances()
returns void as $$
begin
  -- 1. Create missing balance records
  insert into public.leave_balances (user_id, total_days, used_days, year)
  select id, 21, 0, extract(year from current_date)
  from public.profiles
  on conflict (user_id, year) do nothing;

  -- 2. Recalculate used_days from approved requests
  update public.leave_balances b
  set used_days = coalesce((
    select sum(days) 
    from public.leave_requests r 
    where r.user_id = b.user_id 
      and r.status = 'approved' 
      and extract(year from r.start_date) = b.year
  ), 0);
end;
$$ language plpgsql;

-- Automatically run sync on stats fetch to ensure data is always fresh
-- (Safe but slightly slower; alternatively call once manually)
-- Modified RPC:
create or replace function public.get_user_leave_stats(p_user_id uuid, p_year integer default extract(year from current_date))
returns json as $$
declare
  v_total integer;
  v_used integer;
  v_balance integer;
  v_pending integer;
  v_distribution json;
begin
  -- Ensure balance record exists
  insert into public.leave_balances (user_id, total_days, used_days, year)
  values (p_user_id, 21, 0, p_year)
  on conflict (user_id, year) do nothing;

  -- Sync specific user balance before fetching
  update public.leave_balances b
  set used_days = coalesce((
    select sum(days) 
    from public.leave_requests r 
    where r.user_id = p_user_id 
      and r.status = 'approved' 
      and extract(year from r.start_date) = p_year
  ), 0)
  where b.user_id = p_user_id and b.year = p_year;

  -- Get balances directly from columns
  select total_days, used_days, balance 
  into v_total, v_used, v_balance
  from public.leave_balances
  where user_id = p_user_id and year = p_year;
  
  -- Count pending
  select count(*) into v_pending
  from public.leave_requests
  where user_id = p_user_id and status = 'pending' and extract(year from start_date) = p_year;
  
  -- Get distribution by type
  select json_agg(t) into v_distribution
  from (
    select leave_type as name, sum(days) as value
    from public.leave_requests
    where user_id = p_user_id and status = 'approved' and extract(year from start_date) = p_year
    group by leave_type
  ) t;

  return json_build_object(
    'total', coalesce(v_total, 21),
    'used', coalesce(v_used, 0),
    'balance', coalesce(v_balance, coalesce(v_total, 21) - coalesce(v_used, 0)),
    'pending', v_pending,
    'distribution', coalesce(v_distribution, '[]'::json)
  );
end;
$$ language plpgsql security definer;


