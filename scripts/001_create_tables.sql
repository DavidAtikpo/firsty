-- Create users table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('ADMIN', 'MERCHANT', 'CUSTOMER')),
  name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  stock integer not null default 0,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  merchant_id uuid references public.users(id) on delete set null,
  total decimal(10, 2) not null,
  status text not null check (status in ('PENDING', 'COMPLETED', 'CANCELLED')) default 'PENDING',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create order_items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null,
  price decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Create commissions table
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  amount decimal(10, 2) not null,
  status text not null check (status in ('PENDING', 'PAID')) default 'PENDING',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.commissions enable row level security;

-- RLS Policies for users table
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Allow user creation on signup"
  on public.users for insert
  with check (auth.uid() = id);

-- RLS Policies for products table (public read, admin write)
create policy "Anyone can view products"
  on public.products for select
  to authenticated
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'ADMIN'
    )
  );

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'ADMIN'
    )
  );

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- RLS Policies for orders table
create policy "Users can view their own orders"
  on public.orders for select
  to authenticated
  using (
    auth.uid() = customer_id or
    auth.uid() = merchant_id or
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'ADMIN'
    )
  );

create policy "Customers can create orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = customer_id);

create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- RLS Policies for order_items table
create policy "Users can view order items for their orders"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders
      where id = order_id and (
        customer_id = auth.uid() or
        merchant_id = auth.uid() or
        exists (
          select 1 from public.users
          where id = auth.uid() and role = 'ADMIN'
        )
      )
    )
  );

create policy "Users can insert order items for their orders"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and customer_id = auth.uid()
    )
  );

-- RLS Policies for commissions table
create policy "Merchants can view their own commissions"
  on public.commissions for select
  to authenticated
  using (
    auth.uid() = merchant_id or
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'ADMIN'
    )
  );

create policy "System can create commissions"
  on public.commissions for insert
  to authenticated
  with check (true);

create policy "Admins can update commissions"
  on public.commissions for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- Create indexes for better performance
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_merchant_id on public.orders(merchant_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_commissions_merchant_id on public.commissions(merchant_id);
create index if not exists idx_users_role on public.users(role);
