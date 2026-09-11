import { test, expect } from "@playwright/test";
// Read-only QA against the existing catalog. No seed, inserted rows or affiliate clicks.
for (const width of [360, 1440])
  test(`real catalog popup at ${width}px`, async ({ page, context }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const calls: string[] = [];
    await context.route("**/go/**", (route) => {
      calls.push(route.request().url());
      return route.abort();
    });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "핫템 바로가기", exact: true }),
    ).toBeVisible();
    for (const title of [
      "요즘 많이 보는 핫템",
      "Instagram에서 소개한 제품",
      "YouTube에서 소개한 제품",
    ])
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const buttons = page.locator(".quick-product");
    if ((await buttons.count()) === 0) {
      await expect(page.getByText("아직 등록된 핫템이 없어요.")).toBeVisible();
      return;
    }
    const names = await page.locator(".quick-name").allTextContents();
    const ids = await buttons.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-product-id")),
    );
    expect(new Set(ids).size).toBe(ids.length);
    const first = buttons.first();
    await first.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    expect(calls).toHaveLength(0);
    await expect(
      dialog.getByRole("button", { name: "상품 팝업 닫기" }),
    ).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(
      "hidden",
    );
    const cta = dialog.getByRole("link", { name: "쿠팡에서 보기" });
    await expect(cta).toHaveAttribute("href", /^\/go\/[\w-]+$/);
    await expect(cta).toHaveAttribute("rel", "sponsored noopener noreferrer");
    const bounds = (await dialog.boundingBox())!;
    if (width === 360) {
      expect(bounds.x).toBe(0);
      expect(Math.abs(bounds.y + bounds.height - 900)).toBeLessThan(2);
    } else expect(bounds.width).toBeLessThanOrEqual(500);
    await page.screenshot({
      path: info.outputPath(`popup-${width}.png`),
      fullPage: false,
    });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(first).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      "hidden",
    );
    await first.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toBeVisible();
    await first.click();
    await dialog.getByRole("button", { name: "상품 팝업 닫기" }).click();
    await expect(dialog).not.toBeVisible();
    const filters = page.locator(".quick-categories button");
    if ((await filters.count()) > 1) {
      await filters.nth(1).click();
      await expect(filters.nth(1)).toHaveAttribute("aria-pressed", "true");
      expect(calls).toHaveLength(0);
      await filters.first().click();
      await expect(buttons).toHaveCount(names.length);
    }
    expect(calls).toHaveLength(0);
    await first.click();
    const opened = context.waitForEvent("page");
    await dialog.getByRole("link", { name: "쿠팡에서 보기" }).click();
    const external = await opened;
    await expect.poll(() => calls.length).toBe(1);
    await external.close();
    // Intercepted before network: clicking the CTA initiates /go, without inserting a test click.
  });
test("existing real product search reuses popup", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".quick-name").first();
  if (!(await first.count())) return;
  const name = await first.innerText();
  await page.goto("/search?q=" + encodeURIComponent(name));
  await page.locator(".quick-product").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
