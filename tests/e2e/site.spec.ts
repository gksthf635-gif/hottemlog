import { test, expect } from "@playwright/test";
for (const [label, width, height] of [
  ["small-mobile", 360, 800],
  ["iphone", 390, 844],
  ["android", 412, 915],
  ["tablet", 768, 1024],
  ["desktop", 1440, 1000],
] as const) {
  test(`${label}: home content and responsive layout`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "영상에서 본 핫템",
    );
    await expect(
      page.getByPlaceholder("어떤 제품을 찾고 계세요?"),
    ).toBeVisible();
    const latest = page.locator("#latest");
    await expect(latest).toBeVisible();
    expect((await latest.boundingBox())!.y).toBeLessThan(height);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page.locator(".video-image img").first().waitFor();
    await page.screenshot({
      path: testInfo.outputPath(`${label}.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}
test("Search, category, detail and video affiliate attribution", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByPlaceholder("어떤 제품을 찾고 계세요?").fill("청소기");
  await page.getByRole("button", { name: "검색하기" }).click();
  await expect(page).toHaveURL(/search\?q=/);
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.locator(".product-card h3").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "무선 미니 청소기",
  );
  await expect(
    page.getByRole("link", { name: "쿠팡에서 보기" }).first(),
  ).toHaveAttribute("rel", "sponsored noopener noreferrer");
  await page.goto("/products?category=beauty");
  await expect(page.locator(".product-card")).toHaveCount(3);
  await page.goto("/video/log-01");
  const affiliate = page.getByRole("link", { name: "쿠팡에서 보기" }).first();
  await expect(affiliate).toHaveAttribute("href", /\/go\/.+\?video=/);
  await expect(
    page.getByRole("heading", { name: "이 영상에 나온 제품" }),
  ).toBeVisible();
});
test("No results and 404 are useful", async ({ page }) => {
  await page.goto("/search?q=존재하지않는검색어xyz");
  await expect(
    page.getByRole("heading", { name: "찾으시는 핫템이 아직 없어요." }),
  ).toBeVisible();
  const response = await page.goto("/product/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "이 핫템은 찾을 수 없어요." }),
  ).toBeVisible();
});
test("Admin route and upload API are protected without a session", async ({
  page,
  request,
}) => {
  for (const path of [
    "/admin",
    "/admin/products/new",
    "/admin/videos",
    "/admin/categories",
    "/admin/settings",
    "/admin/analytics",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
  await expect(
    page.getByRole("button", { name: "관리자 로그인" }),
  ).toBeDisabled();
  const upload = await request.post("/api/admin/upload");
  expect(upload.status()).toBe(401);
});
test("SEO, policies and redirect validation", async ({ page, request }) => {
  await page.goto("/product/item-01");
  await expect(page).toHaveTitle(/무선 미니 청소기/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/product\/item-01$/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "무선 미니 청소기",
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    1,
  );
  for (const path of ["/privacy", "/terms", "/contact"]) {
    expect((await request.get(path)).status()).toBe(200);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/video/log-01");
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /admin",
  );
  expect((await request.get("/go/not-a-uuid")).status()).toBe(404);
  expect(
    (await request.get("/go/00000002-0000-4000-8000-000000000001")).status(),
  ).toBe(503);
});
