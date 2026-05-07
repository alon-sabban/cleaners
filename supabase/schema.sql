-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'client' check (role in ('client', 'cleaner', 'admin')),
  created_at timestamptz default now()
);

-- Cleaner profiles
create table public.cleaner_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade unique not null,
  bio text,
  hourly_rate numeric(10,2) not null default 0,
  services text[] not null default '{}',
  location text not null,
  is_verified boolean default false,
  rating_avg numeric(3,2) default 0,
  total_reviews integer default 0,
  created_at timestamptz default now()
);

-- Bookings
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.profiles not null,
  cleaner_id uuid references public.profiles not null,
  service_type text not null,
  date date not null,
  time time not null,
  address text not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','in_progress','completed','cancelled')),
  price numeric(10,2) not null,
  notes text,
  created_at timestamptz default now()
);

-- Reviews
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings on delete cascade unique not null,
  client_id uuid references public.profiles not null,
  cleaner_id uuid references public.profiles not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update cleaner rating when review is added
create or replace function public.update_cleaner_rating()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  update public.cleaner_profiles
  set
    rating_avg = (select avg(rating) from public.reviews where cleaner_id = new.cleaner_id),
    total_reviews = (select count(*) from public.reviews where cleaner_id = new.cleaner_id)
  where user_id = new.cleaner_id;
  return new;
end;
$$;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_cleaner_rating();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.cleaner_profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Cleaner profiles are viewable by everyone" on public.cleaner_profiles
  for select using (true);

create policy "Cleaners can update own profile" on public.cleaner_profiles
  for all using (auth.uid() = user_id);

create policy "Users can view own bookings" on public.bookings
  for select using (auth.uid() = client_id or auth.uid() = cleaner_id);

create policy "Clients can create bookings" on public.bookings
  for insert with check (auth.uid() = client_id);

create policy "Parties can update booking status" on public.bookings
  for update using (auth.uid() = client_id or auth.uid() = cleaner_id);

create policy "Reviews are public" on public.reviews
  for select using (true);

create policy "Clients can create reviews" on public.reviews
  for insert with check (auth.uid() = client_id);
