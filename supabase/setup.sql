-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Enum for roles and statuses
create type public.user_role as enum ('employee', 'manager', 'admin');
create type public.leave_status as enum ('pending', 'approved', 'rejected');
create type public.leave_type as enum ('Anual', 'sick', 'Maternity' , 'paternity' , 'Court Case' ,'Exam' , 'unpaid','other');

-- Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role public.user_role default 'employee'::public.user_role not null,
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leave Balances Table
create table public.leave_balances (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  leave_type public.leave_type not null,
  balance integer not null default 0,
  year integer not null default extract(year from current_date),
  unique(user_id, leave_type, year)
);

-- Leave Requests Table
create table public.leave_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  leave_type public.leave_type not null,
  reason text not null,
  status public.leave_status default 'pending'::public.leave_status not null,
  manager_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.leave_balances enable row level security;
alter table public.leave_requests enable row level security;

-- RLS: Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Managers can view team profiles"
  on public.profiles for select
  using (auth.uid() = manager_id);

create policy "Admins have full access to profiles"
  on public.profiles for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- RLS: Leave Balances
create policy "Users can view their own balances"
  on public.leave_balances for select
  using (auth.uid() = user_id);

create policy "Managers can view team balances"
  on public.leave_balances for select
  using (exists (select 1 from public.profiles where id = public.leave_balances.user_id and manager_id = auth.uid()));

create policy "Admins have full access to balances"
  on public.leave_balances for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- RLS: Leave Requests
create policy "Users can view own requests"
  on public.leave_requests for select
  using (auth.uid() = user_id);

create policy "Users can create own requests"
  on public.leave_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pending requests"
  on public.leave_requests for update
  using (auth.uid() = user_id and status = 'pending');

create policy "Managers can view team requests"
  on public.leave_requests for select
  using (exists (select 1 from public.profiles where id = public.leave_requests.user_id and manager_id = auth.uid()));

create policy "Managers can update team requests (status/notes)"
  on public.leave_requests for update
  using (exists (select 1 from public.profiles where id = public.leave_requests.user_id and manager_id = auth.uid()));

create policy "Admins have full access to requests"
  on public.leave_requests for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Trigger: Automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'employee'::public.user_role);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Supabase Realtime for leave_requests
alter publication supabase_realtime add table public.leave_requests;
