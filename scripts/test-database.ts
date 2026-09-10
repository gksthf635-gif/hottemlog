import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import seed from "../lib/data/seed.json";
async function main() {
  const db = new PGlite();
  let passed = 0;
  const check = (name: string) => {
    passed++;
    console.log(`✓ ${name}`);
  };
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema storage;
 create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated,service_role; grant execute on function auth.uid() to anon,authenticated,service_role;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
 alter table storage.objects enable row level security; grant usage on schema storage to anon,authenticated; grant select,insert,update,delete on storage.objects to anon,authenticated;`);
    for (const file of ["202609100001_schema.sql", "202609100002_seed.sql"])
      await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
    const count = async (table: string) =>
      Number(
        (
          await db.query<{ n: string }>(
            `select count(*) n from public.${table}`,
          )
        ).rows[0].n,
      );
    assert.equal(await count("products"), 15);
    assert.equal(await count("videos"), 6);
    assert.equal(await count("categories"), 8);
    check("Migrations + 15 products / 6 videos / 8 categories");
    await db.exec(
      await readFile("supabase/migrations/202609100002_seed.sql", "utf8"),
    );
    assert.equal(await count("products"), 15);
    check("Seed can be reapplied without duplication");
    const admin = "aaaaaaaa-0000-4000-8000-000000000001",
      viewer = "aaaaaaaa-0000-4000-8000-000000000002";
    await db.query("insert into auth.users values ($1),($2)", [admin, viewer]);
    await db.query(
      "insert into public.profiles(id,role) values($1,'admin'),($2,'viewer')",
      [admin, viewer],
    );
    await db.query("update public.products set published=false where id=$1", [
      seed.products[0].id,
    ]);
    await db.query("update public.videos set published=false where id=$1", [
      seed.videos[0].id,
    ]);
    await db.exec("set role anon");
    assert.equal(await count("products"), 14);
    assert.equal(await count("videos"), 5);
    assert.equal(
      (
        await db.query(
          "select * from public.video_products where product_id=$1 or video_id=$2",
          [seed.products[0].id, seed.videos[0].id],
        )
      ).rows.length,
      0,
    );
    await assert.rejects(() => db.exec("select * from public.clicks"));
    await assert.rejects(() => db.exec("select public.admin_analytics(null)"));
    await assert.rejects(() =>
      db.exec("insert into public.categories(name,slug) values('hack','hack')"),
    );
    await assert.rejects(() =>
      db.exec(
        "insert into storage.objects(bucket_id,name) values('site-images','hack.webp')",
      ),
    );
    check(
      "Anonymous: drafts/links hidden, writes/raw clicks/analytics/uploads denied",
    );
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      viewer,
    ]);
    await db.exec("set role authenticated");
    assert.equal(await count("products"), 14);
    assert.equal(await count("clicks"), 0);
    await assert.rejects(() =>
      db.query("update public.profiles set role='admin' where id=$1", [viewer]),
    );
    await assert.rejects(() => db.exec("select public.admin_analytics(null)"));
    await assert.rejects(() =>
      db.query("select public.save_product($1::jsonb,$2::uuid[])", [
        JSON.stringify(seed.products[0]),
        [],
      ]),
    );
    check("Non-admin: role escalation and mutations denied");
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      admin,
    ]);
    await db.exec("set role authenticated");
    assert.equal(await count("products"), 15);
    assert.equal(await count("videos"), 6);
    const payload = {
      ...seed.products[0],
      name: "원자적 저장 검증",
      published: true,
    };
    await db.query("select public.save_product($1::jsonb,$2::uuid[])", [
      JSON.stringify(payload),
      [seed.videos[1].id],
    ]);
    assert.equal(
      (
        await db.query<{ name: string }>(
          "select name from public.products where id=$1",
          [payload.id],
        )
      ).rows[0].name,
      payload.name,
    );
    await assert.rejects(() =>
      db.query("select public.save_product($1::jsonb,$2::uuid[])", [
        JSON.stringify({ ...payload, name: "롤백되어야 함" }),
        ["bbbbbbbb-0000-4000-8000-000000000001"],
      ]),
    );
    assert.equal(
      (
        await db.query<{ name: string }>(
          "select name from public.products where id=$1",
          [payload.id],
        )
      ).rows[0].name,
      payload.name,
    );
    check("Admin CRUD and content/link transaction rollback");
    await db.query("select public.save_video($1::jsonb,$2::uuid[])", [
      JSON.stringify({ ...seed.videos[0], published: true }),
      [seed.products[2].id, seed.products[1].id],
    ]);
    const links = (
      await db.query<{ product_id: string }>(
        "select product_id from public.video_products where video_id=$1 order by sort_order",
        [seed.videos[0].id],
      )
    ).rows;
    assert.deepEqual(
      links.map((x) => x.product_id),
      [seed.products[2].id, seed.products[1].id],
    );
    await db.exec(
      "insert into storage.objects(bucket_id,name) values('site-images','admin.webp')",
    );
    check("Ordered video associations and admin Storage policy");
    await db.exec("reset role");
    await db.query(
      "insert into public.clicks(product_id,video_id) select $1::uuid,$2::uuid from generate_series(1,1205)",
      [seed.products[1].id, seed.videos[0].id],
    );
    await db.exec("set role authenticated");
    const analytics = (
      await db.query<{
        data: { total: number; today: number; products: { count: number }[] };
      }>("select public.admin_analytics(null) data")
    ).rows[0].data;
    assert.equal(analytics.total, 1205);
    assert.equal(analytics.today, 1205);
    assert.equal(analytics.products[0].count, 1205);
    check("SQL analytics aggregates beyond PostgREST 1,000-row limit");
    const catId = seed.categories[1].id;
    await db.query("delete from public.categories where id=$1", [catId]);
    assert.equal(
      (
        await db.query<{ category_id: string | null }>(
          "select category_id from public.products where id=$1",
          [seed.products[1].id],
        )
      ).rows[0].category_id,
      null,
    );
    await db.query("delete from public.products where id=$1", [
      seed.products[1].id,
    ]);
    assert.equal(await count("clicks"), 1205);
    check("Deletes preserve clicks and uncategorized products");
    await db.exec("reset role");
    await db.exec("set role anon");
    const popularity = (
      await db.query<{ data: { products: unknown[]; videos: unknown[] } }>(
        "select public.public_popularity() data",
      )
    ).rows[0].data;
    assert.ok(Array.isArray(popularity.products));
    assert.ok(popularity.videos.length > 0);
    check("Public popularity returns only safe aggregates");
    console.log(
      `Database checks passed: ${passed}. PostgreSQL via PGlite; auth/storage schemas are test fixtures.`,
    );
  } finally {
    await db.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
