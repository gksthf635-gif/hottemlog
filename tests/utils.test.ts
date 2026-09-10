import { test } from "node:test";
import assert from "node:assert/strict";
import {
  youtubeId,
  youtubeThumbnail,
  isAffiliateUrl,
  isSocialUrl,
  safeReferrer,
  rangeStart,
  matchesSearch,
  slugify,
} from "../lib/utils";
import {
  productSchema,
  videoSchema,
  linksSchema,
  settingsSchema,
} from "../lib/validation";
import seed from "../lib/data/seed.json";
test("YouTube supported URLs and hostile hosts", () => {
  const id = "dQw4w9WgXcQ";
  for (const url of [
    `https://youtube.com/shorts/${id}`,
    `https://www.youtube.com/watch?v=${id}&t=3`,
    `https://youtu.be/${id}`,
  ])
    assert.equal(youtubeId(url), id);
  for (const url of [
    "https://youtube.com.evil.test/watch?v=" + id,
    "javascript:alert(1)",
    "https://youtu.be/short",
    "http://youtu.be/" + id,
  ])
    assert.equal(youtubeId(url), null);
  assert.equal(
    youtubeThumbnail(`https://youtu.be/${id}`),
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  );
});
test("Affiliate redirects cannot escape approved HTTPS Coupang hosts", () => {
  for (const url of [
    "https://link.coupang.com/a/abc",
    "https://www.coupang.com/vp/products/123",
  ])
    assert.ok(isAffiliateUrl(url));
  for (const url of [
    "https://coupang.com.evil.test/a",
    "https://evil.test/?url=coupang.com",
    "javascript:alert(1)",
    "http://coupang.com",
    "https://user:secret@coupang.com",
    "//coupang.com",
  ])
    assert.equal(isAffiliateUrl(url), false);
});
test("Social hosts and referrer redaction", () => {
  assert.ok(isSocialUrl("https://www.instagram.com/reel/abc/", "instagram"));
  assert.equal(
    isSocialUrl("https://instagram.com.evil.test", "instagram"),
    false,
  );
  assert.equal(
    safeReferrer("https://example.com/private?email=person@test.com#secret"),
    "https://example.com",
  );
  assert.equal(safeReferrer("javascript:alert(1)"), null);
});
test("Korean search and KST date boundaries", () => {
  assert.ok(matchesSearch("주방 정리", "주방 실리콘 정리함"));
  assert.ok(matchesSearch("뷰티", ["뷰티", "보습"]));
  assert.ok(!matchesSearch("없는말", "주방"));
  assert.equal(
    rangeStart("today", new Date("2026-09-09T15:01:00Z")),
    "2026-09-09T15:00:00.000Z",
  );
  assert.equal(
    rangeStart("7", new Date("2026-09-09T15:01:00Z")),
    "2026-09-03T15:00:00.000Z",
  );
  assert.equal(rangeStart("all"), null);
  assert.equal(slugify(" 핫템 정리 01! "), "핫템-정리-01");
});
test("Server validation rejects tampered payloads", () => {
  assert.ok(productSchema.safeParse(seed.products[0]).success);
  assert.equal(
    productSchema.safeParse({
      ...seed.products[0],
      affiliate_url: "https://evil.test",
    }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({
      ...seed.products[0],
      image_url: "https://localhost/private",
    }).success,
    false,
  );
  assert.equal(
    videoSchema.safeParse({
      ...seed.videos[0],
      video_url: "https://youtube.com/",
    }).success,
    false,
  );
  assert.equal(
    linksSchema.safeParse([seed.products[0].id, seed.products[0].id]).success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({
      ...seed.settings,
      logo_url: "javascript:alert(1)",
    }).success,
    false,
  );
});
