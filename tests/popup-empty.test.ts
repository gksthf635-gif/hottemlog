import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductQuickLinks } from "../components/product/quick-links";
test("Empty catalog renders an honest empty state without product placeholders", () => {
  const html = renderToStaticMarkup(
    createElement(ProductQuickLinks, {
      products: [],
      categories: [],
      filter: true,
    }),
  );
  assert.ok(html.includes("아직 등록된 핫템이 없어요."));
  assert.ok(!html.includes('class="quick-product"'));
  assert.ok(!html.includes("/go/"));
  assert.ok(!html.includes("popup-image"));
});
