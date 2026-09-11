import { test, expect } from "@playwright/test";
// Only existing published records are inspected; no database writes or seed data.
for (const width of [390, 412, 768])
  test(`home layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "영상에서 본 핫템",
    );
    await expect(
      page.getByRole("heading", { name: "핫템 바로가기", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("No search result and missing detail are useful", async ({ page }) => {
  await page.goto("/search?q=존재하지않는검색어xyz");
  await expect(
    page.getByRole("heading", { name: "찾으시는 핫템이 아직 없어요." }),
  ).toBeVisible();
  const response = await page.goto("/product/does-not-exist");
  expect(response?.status()).toBe(404);
});
test("Existing admin paths remain protected", async ({ page }) => {
  for (const path of [
    "/admin/contents",
    "/admin/contents/new",
    "/admin/products",
    "/admin/videos",
    "/admin/settings",
    "/admin/analytics",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
});
test("Public SEO and existing video attribution", async ({ page, request }) => {
  for (const path of [
    "/privacy",
    "/terms",
    "/contact",
    "/sitemap.xml",
    "/robots.txt",
  ])
    expect((await request.get(path)).status()).toBe(200);
  await page.goto("/");
  const video = page.locator("#latest .video-card").first();
  if (!(await video.count())) return;
  await video.click();
  await expect(
    page.getByRole("heading", { name: "이 영상에 나온 제품" }),
  ).toBeVisible();
  const product = page.locator(".quick-product").first();
  if (!(await product.count())) return;
  await product.click();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "쿠팡에서 보기" }),
  ).toHaveAttribute("href", /^\/go\/[\w-]+\?video=[\w-]+$/);
});
