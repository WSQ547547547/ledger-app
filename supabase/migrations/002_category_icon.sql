-- 分类 emoji / 自定义图标（存任意短文本，建议单 emoji）
alter table public.categories
  add column if not exists icon text;

comment on column public.categories.icon is '分类展示图标（建议单个 emoji），可为空则前端按名称映射默认图标';
