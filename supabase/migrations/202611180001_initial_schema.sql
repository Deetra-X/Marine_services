create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  name text not null,
  part_number text not null,
  description text not null default '',
  specifications jsonb not null default '{}'::jsonb,
  selling_unit text not null default 'piece',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  published boolean not null default false,
  archived boolean not null default false,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(part_number)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

do $$ begin
  create type public.order_status as enum ('pending','confirmed','fulfilled','cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  idempotency_key text not null unique,
  customer_name text not null,
  email text not null,
  phone text not null,
  company_name text,
  delivery_address text not null,
  vessel_name text,
  port text,
  required_delivery_date date,
  customer_notes text,
  private_seller_notes text,
  status public.order_status not null default 'pending',
  stock_reduced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name_snapshot text not null,
  part_number_snapshot text not null,
  selling_unit_snapshot text not null,
  specifications_snapshot jsonb not null default '{}'::jsonb,
  quantity integer not null check (quantity > 0)
);

create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  admin_user_id uuid references public.admin_users(user_id),
  previous_quantity integer not null,
  adjustment integer not null,
  resulting_quantity integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.email_delivery_records (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid,
  recipient text not null,
  subject text not null,
  status text not null check (status in ('pending','sent','failed')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.products(category_id);
create index on public.products(published, archived);
create index on public.orders(status, created_at);
create index on public.order_items(order_id);
create index on public.stock_adjustments(product_id, created_at);

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.email_delivery_records enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and active = true
  );
$$;

create policy "public read active categories" on public.categories
  for select using (archived = false);
create policy "public read active products" on public.products
  for select using (published = true and archived = false);
create policy "public read product images" on public.product_images
  for select using (exists (
    select 1 from public.products p
    where p.id = product_id and p.published = true and p.archived = false
  ));

create policy "admin manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage stock" on public.stock_adjustments for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read inquiries" on public.contact_inquiries for select using (public.is_admin());
create policy "admin manage emails" on public.email_delivery_records for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('product-images','product-images',true)
on conflict (id) do nothing;

create policy "public read product images storage"
on storage.objects for select using (bucket_id = 'product-images');
create policy "admin upload product images"
on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin update product images"
on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
create policy "admin delete product images"
on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());
