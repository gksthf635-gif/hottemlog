begin;
-- One transaction: video, editable products and ordered relationships.
create or replace function public.save_content_bundle(video_data jsonb, product_data jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v uuid; p uuid; item jsonb; ids uuid[] := '{}'; i integer := 0;
begin
 if not public.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
 if jsonb_typeof(product_data) <> 'array' or jsonb_array_length(product_data) not between 1 and 100 then
  raise exception 'At least one product required' using errcode='22023';
 end if;
 v := coalesce((video_data->>'id')::uuid, gen_random_uuid());
 if nullif(trim(video_data->>'title'),'') is null then raise exception 'Title required'; end if;
 if video_data->>'id' is not null and not exists(select 1 from public.videos where id=v) then raise exception 'Video missing' using errcode='23503'; end if;
 insert into public.videos(id,title,slug,platform,video_url,thumbnail_url,published,featured,published_at)
 values(v,video_data->>'title',coalesce(video_data->>'slug','content-'||v::text),video_data->>'platform',video_data->>'video_url',coalesce(video_data->>'thumbnail_url',''),coalesce((video_data->>'published')::boolean,false),coalesce((video_data->>'featured')::boolean,false),coalesce((video_data->>'published_at')::timestamptz,now()))
 on conflict(id) do update set title=excluded.title,platform=excluded.platform,video_url=excluded.video_url,thumbnail_url=excluded.thumbnail_url,published=excluded.published,featured=excluded.featured,published_at=excluded.published_at;
 for item in select value from jsonb_array_elements(product_data) loop
  p := coalesce((item->>'id')::uuid,gen_random_uuid());
  if p=any(ids) then raise exception 'Duplicate product' using errcode='22023'; end if;
  if item->>'id' is not null and not exists(select 1 from public.products where id=p) then raise exception 'Product missing' using errcode='23503'; end if;
  if nullif(trim(item->>'name'),'') is null then raise exception 'Product name required'; end if;
  insert into public.products(id,name,slug,affiliate_url,image_url,category_id,short_description,published)
  values(p,item->>'name','item-'||p::text,item->>'affiliate_url',coalesce(item->>'image_url',''),(item->>'category_id')::uuid,coalesce(item->>'short_description',''),coalesce((video_data->>'published')::boolean,false))
  on conflict(id) do update set name=excluded.name,affiliate_url=excluded.affiliate_url,image_url=excluded.image_url,category_id=excluded.category_id,short_description=excluded.short_description,published=public.products.published or excluded.published;
  ids := array_append(ids,p);
 end loop;
 delete from public.video_products where video_id=v;
 foreach p in array ids loop
  insert into public.video_products(video_id,product_id,sort_order) values(v,p,i); i:=i+1;
 end loop;
 return v;
end $$;
revoke all on function public.save_content_bundle(jsonb,jsonb) from public,anon;
grant execute on function public.save_content_bundle(jsonb,jsonb) to authenticated;
create or replace function public.set_content_publication(content_id uuid, is_published boolean)
returns void language plpgsql security invoker set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
 perform 1 from public.videos where id=content_id for update;
 if not found then raise exception 'Video missing' using errcode='23503'; end if;
 update public.videos set published=is_published where id=content_id;
 if is_published then
  update public.products set published=true where id in (select product_id from public.video_products where video_id=content_id);
 end if;
end $$;
revoke all on function public.set_content_publication(uuid,boolean) from public,anon;
grant execute on function public.set_content_publication(uuid,boolean) to authenticated;
commit;
