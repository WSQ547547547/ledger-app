-- 极简记账 · Supabase 初始结构
-- 在 Supabase Dashboard → SQL Editor 中粘贴执行，或使用 CLI：supabase db push

-- ---------------------------------------------------------------------------
-- 枚举：收支类型（与前端 TxKind 一致）
-- ---------------------------------------------------------------------------
create type public.transaction_kind as enum ('income', 'expense');

-- ---------------------------------------------------------------------------
-- 1. 用户表 profiles（与 auth.users 1:1，扩展用户信息）
--    认证账号仍由 Supabase Auth 管理；业务侧通过 user_id = auth.uid() 关联。
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is '用户扩展表（与 auth.users 一对一）';

-- ---------------------------------------------------------------------------
-- 2. 分类表 categories（每个用户一套分类）
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  kind public.transaction_kind not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint categories_user_name_kind_unique unique (user_id, name, kind)
);

comment on table public.categories is '账单分类（收入/支出）';

create index categories_user_id_idx on public.categories (user_id);

-- ---------------------------------------------------------------------------
-- 3. 账单表 bills（每笔记账）
-- ---------------------------------------------------------------------------
create table public.bills (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  kind public.transaction_kind not null,
  amount numeric(14, 2) not null check (amount > 0),
  note text not null default '',
  occurred_on date not null,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

comment on table public.bills is '账单明细';

create index bills_user_occurred_idx on public.bills (user_id, occurred_on desc);
create index bills_category_id_idx on public.bills (category_id);

-- ---------------------------------------------------------------------------
-- updated_at 自动刷新
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at ();

create trigger bills_set_updated_at
  before update on public.bills
  for each row
  execute function public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- 注册后自动插入 profiles（无需客户端再 insert）
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1),
      '用户'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user ();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.bills enable row level security;

-- profiles：只能读/改自己的行（插入由触发器完成）
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid () = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid () = id)
  with check (auth.uid () = id);

-- categories：CRUD 仅限本人数据
create policy "categories_select_own"
  on public.categories for select
  using (auth.uid () = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid () = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid () = user_id);

-- bills：CRUD 仅限本人数据
create policy "bills_select_own"
  on public.bills for select
  using (auth.uid () = user_id);

create policy "bills_insert_own"
  on public.bills for insert
  with check (auth.uid () = user_id);

create policy "bills_update_own"
  on public.bills for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);

create policy "bills_delete_own"
  on public.bills for delete
  using (auth.uid () = user_id);
