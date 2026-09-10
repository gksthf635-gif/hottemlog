import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeHttps,
  allowedMetadataPage,
  extractImage,
  isCatalogImage,
} from "../lib/remote-image";
import { retryRead } from "../lib/data/retry";
import { youtubeThumbnail } from "../lib/utils";
test("Pasted Coupang URLs normalize without a duplicated protocol", () => {
  assert.equal(
    normalizeHttps("link.coupang.com/a/abc"),
    "https://link.coupang.com/a/abc",
  );
  assert.equal(
    normalizeHttps("https://https://link.coupang.com/a/abc"),
    "https://link.coupang.com/a/abc",
  );
  assert.equal(
    youtubeThumbnail("https://youtube.com/shorts/XVBquFWFnXU"),
    "https://img.youtube.com/vi/XVBquFWFnXU/hqdefault.jpg",
  );
});
test("Metadata redirect allowlist rejects private and deceptive destinations", () => {
  for (const url of [
    "http://www.coupang.com",
    "https://127.0.0.1",
    "https://www.coupang.com.evil.test",
    "https://www.coupang.com:8443",
    "https://user@www.coupang.com",
  ])
    assert.equal(allowedMetadataPage(url, "product"), false);
  assert.ok(
    allowedMetadataPage("https://www.coupang.com/vp/products/123", "product"),
  );
  assert.ok(
    isCatalogImage(
      "https://thumbnail.coupangcdn.com/thumbnails/remote/test.jpg",
    ),
  );
  assert.equal(
    extractImage('<meta content="https://127.0.0.1/x" property="og:image">'),
    "",
  );
  assert.equal(
    extractImage(
      '<meta content="https://image1.coupangcdn.com/a.jpg?x=1&amp;y=2" property="og:image">',
    ),
    "https://image1.coupangcdn.com/a.jpg?x=1&y=2",
  );
});
test("Transient reads retry, permission errors do not", async () => {
  let n = 0;
  const r = await retryRead(async () => ({
    data: ++n,
    error: n === 1 ? { message: "Gateway Timeout" } : null,
  }));
  assert.equal(r.data, 2);
  n = 0;
  await retryRead(async () => {
    n++;
    return { error: { message: "permission denied" } };
  });
  assert.equal(n, 1);
});
