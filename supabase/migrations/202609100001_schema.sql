begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'viewer' check (role in ('viewer','admin')),
 display_name text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null unique check(length(name) between 1 and 40), slug text not null unique, sort_order integer not null default 0, created_at timestamptz not null default now());
create table public.products (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, image_url text not null default '', short_description text not null default '', description text not null default '', recommendation text not null default '', recommend_points text[] not null default '{}', affiliate_url text not null check (affiliate_url ~ '^https://([a-zA-Z0-9-]+\.)*coupang\.com(/|$)'), category_id uuid references public.categories(id) on delete set null, published boolean not null default false, featured boolean not null default false, tags text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.videos (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, platform text not null, video_url text not null check (video_url ~ '^https://'), thumbnail_url text not null default '', description text not null default '', published boolean not null default false, featured boolean not null default false, sort_order integer not null default 0, tags text[] not null default '{}', published_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.video_products (id uuid primary key default gen_random_uuid(), video_id uuid not null references public.videos(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade, sort_order integer not null default 0, unique(video_id,product_id));
create table public.clicks (id bigint generated always as identity primary key, product_id uuid references public.products(id) on delete set null, video_id uuid references public.videos(id) on delete set null, referrer text, user_agent text, created_at timestamptz not null default now());
create table public.settings (id integer primary key default 1 check(id=1), site_name text not null, site_description text not null default '', instagram_url text not null default '', youtube_url text not null default '', affiliate_disclosure text not null, footer_text text not null default '', default_seo_title text not null, default_seo_description text not null default '', logo_url text not null default '', contact_email text not null default '');
create index products_public_created on public.products(published,created_at desc);
create index products_category on public.products(category_id);
create index videos_public_sort on public.videos(published,sort_order,published_at desc);
create index video_products_product on public.video_products(product_id);
create index clicks_created on public.clicks(created_at desc);
create index clicks_product_created on public.clicks(product_id,created_at desc);
create index clicks_video_created on public.clicks(video_id,created_at desc);
create index products_tags on public.products using gin(tags);
create index videos_tags on public.videos using gin(tags);
create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at=now(); return new; end; $$;
create trigger products_updated before update on public.products for each row execute function public.touch_updated_at();
create trigger videos_updated before update on public.videos for each row execute function public.touch_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.videos enable row level security;
alter table public.video_products enable row level security;
alter table public.clicks enable row level security;
alter table public.settings enable row level security;
-- Profile roles can only be assigned by a trusted SQL operator, never by signing up.
create policy profiles_read on public.profiles for select to authenticated using (id=(select auth.uid()) or (select public.is_admin()));
create policy categories_read on public.categories for select to anon,authenticated using (true);
create policy settings_read on public.settings for select to anon,authenticated using (true);
create policy products_read on public.products for select to anon,authenticated using (published or (select public.is_admin()));
create policy videos_read on public.videos for select to anon,authenticated using (published or (select public.is_admin()));
create policy links_read on public.video_products for select to anon,authenticated using ((select public.is_admin()) or (exists(select 1 from public.videos v where v.id=video_id and v.published) and exists(select 1 from public.products p where p.id=product_id and p.published)));
create policy clicks_read on public.clicks for select to authenticated using ((select public.is_admin()));
create policy categories_admin on public.categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy products_admin on public.products for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy videos_admin on public.videos for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy links_admin on public.video_products for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy settings_admin on public.settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant usage on schema public to anon,authenticated,service_role;
grant select on public.categories,public.products,public.videos,public.video_products,public.settings to anon,authenticated;
grant select on public.profiles,public.clicks to authenticated;
grant insert,update,delete on public.categories,public.products,public.videos,public.video_products,public.settings to authenticated;
revoke all on public.clicks from anon;
revoke insert,update,delete on public.profiles from anon,authenticated;
grant all on all tables in schema public to service_role;
grant usage,select on all sequences in schema public to service_role;

-- Atomic content + association updates. Invoker rights retain RLS enforcement.
create function public.save_product(payload jsonb, linked_ids uuid[]) returns uuid language plpgsql security invoker set search_path = '' as $$
declare item public.products; begin
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 item=jsonb_populate_record(null::public.products,payload); item.id=coalesce(item.id,gen_random_uuid());
 insert into public.products(id,name,slug,image_url,short_description,description,recommendation,recommend_points,affiliate_url,category_id,published,featured,tags)
 values(item.id,item.name,item.slug,item.image_url,item.short_description,item.description,item.recommendation,item.recommend_points,item.affiliate_url,item.category_id,item.published,item.featured,item.tags)
 on conflict(id) do update set name=excluded.name,slug=excluded.slug,image_url=excluded.image_url,short_description=excluded.short_description,description=excluded.description,recommendation=excluded.recommendation,recommend_points=excluded.recommend_points,affiliate_url=excluded.affiliate_url,category_id=excluded.category_id,published=excluded.published,featured=excluded.featured,tags=excluded.tags;
 delete from public.video_products where product_id=item.id and not(video_id=any(linked_ids));
 insert into public.video_products(video_id,product_id,sort_order) select x,item.id,coalesce((select max(vp.sort_order)+1 from public.video_products vp where vp.video_id=x),0) from unnest(linked_ids) as x on conflict(video_id,product_id) do nothing;
 return item.id;
end; $$;
create function public.save_video(payload jsonb, linked_ids uuid[]) returns uuid language plpgsql security invoker set search_path = '' as $$
declare item public.videos; begin
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 item=jsonb_populate_record(null::public.videos,payload); item.id=coalesce(item.id,gen_random_uuid());
 insert into public.videos(id,title,slug,platform,video_url,thumbnail_url,description,published,featured,sort_order,tags,published_at)
 values(item.id,item.title,item.slug,item.platform,item.video_url,item.thumbnail_url,item.description,item.published,item.featured,item.sort_order,item.tags,item.published_at)
 on conflict(id) do update set title=excluded.title,slug=excluded.slug,platform=excluded.platform,video_url=excluded.video_url,thumbnail_url=excluded.thumbnail_url,description=excluded.description,published=excluded.published,featured=excluded.featured,sort_order=excluded.sort_order,tags=excluded.tags,published_at=excluded.published_at;
 delete from public.video_products where video_id=item.id;
 insert into public.video_products(video_id,product_id,sort_order) select item.id,x.id,(x.ord-1)::integer from unnest(linked_ids) with ordinality x(id,ord);
 return item.id;
end; $$;
revoke all on function public.save_product(jsonb,uuid[]),public.save_video(jsonb,uuid[]) from public;
grant execute on function public.save_product(jsonb,uuid[]),public.save_video(jsonb,uuid[]) to authenticated;

create function public.admin_analytics(since timestamptz default null) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb; begin
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 with filtered as (select * from public.clicks where (since is null or created_at>=since) and created_at<=now()),
 daily as (select to_char(created_at at time zone 'Asia/Seoul','YYYY-MM-DD') date,count(*) count from filtered group by 1 order by 1),
 ps as (select coalesce(p.id::text,'deleted') id,coalesce(p.name,'삭제된 상품') name,count(*) count from filtered c left join public.products p on p.id=c.product_id group by 1,2 order by 3 desc,2),
 vs as (select coalesce(v.id::text,'deleted') id,coalesce(v.title,'삭제된 영상') name,count(*) count from filtered c left join public.videos v on v.id=c.video_id where c.video_id is not null group by 1,2 order by 3 desc,2),
 cs as (select coalesce(cat.id::text,'none') id,coalesce(cat.name,'미분류 / 삭제됨') name,count(*) count from filtered c left join public.products p on p.id=c.product_id left join public.categories cat on cat.id=p.category_id group by 1,2 order by 3 desc,2)
 select jsonb_build_object('total',(select count(*) from filtered),'today',(select count(*) from public.clicks where created_at >= date_trunc('day',now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'),'daily',coalesce((select jsonb_agg(daily) from daily),'[]'),'products',coalesce((select jsonb_agg(ps) from ps),'[]'),'videos',coalesce((select jsonb_agg(vs) from vs),'[]'),'categories',coalesce((select jsonb_agg(cs) from cs),'[]')) into result;
 return result;
end; $$;
revoke all on function public.admin_analytics(timestamptz) from public;
grant execute on function public.admin_analytics(timestamptz) to authenticated;
create function public.public_popularity() returns jsonb language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('products',coalesce((select jsonb_agg(p) from (select p.id,count(c.id) count from public.products p join public.clicks c on c.product_id=p.id where p.published and c.created_at>=now()-interval '30 days' group by p.id order by count desc,p.id limit 12) p),'[]'), 'videos',coalesce((select jsonb_agg(v) from (select v.id,count(c.id) count from public.videos v join public.clicks c on c.video_id=v.id where v.published and c.created_at>=now()-interval '30 days' group by v.id order by count desc,v.id limit 10) v),'[]'));
$$;
revoke all on function public.public_popularity() from public;
grant execute on function public.public_popularity() to anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('site-images','site-images',true,5242880,ARRAY['image/webp','image/jpeg','image/png']) on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create policy site_images_read on storage.objects for select to anon,authenticated using(bucket_id='site-images');
create policy site_images_insert on storage.objects for insert to authenticated with check(bucket_id='site-images' and (select public.is_admin()));
create policy site_images_update on storage.objects for update to authenticated using(bucket_id='site-images' and (select public.is_admin())) with check(bucket_id='site-images' and (select public.is_admin()));
create policy site_images_delete on storage.objects for delete to authenticated using(bucket_id='site-images' and (select public.is_admin()));
commit;
