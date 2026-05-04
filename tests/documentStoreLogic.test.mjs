import assert from "node:assert/strict";
import test from "node:test";

import {
  markPageDeleted,
  markPageRestored,
  resolveActivePageId,
} from "../src/store/documentStoreLogic.ts";

function page(overrides = {}) {
  return {
    id: "page-1",
    title: "Draft",
    content: "",
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  };
}

test("resolveActivePageId keeps the current active page when it is live", () => {
  assert.equal(resolveActivePageId([page()], "page-1"), "page-1");
});

test("resolveActivePageId skips deleted active pages", () => {
  const deletedActive = page({ id: "page-1", deletedAt: 200 });
  const liveFallback = page({ id: "page-2" });

  assert.equal(
    resolveActivePageId([deletedActive, liveFallback], "page-1"),
    "page-2"
  );
});

test("resolveActivePageId honors an explicit next active page id", () => {
  assert.equal(resolveActivePageId([page()], "page-1", null), null);
  assert.equal(resolveActivePageId([page()], "page-1", "page-2"), "page-2");
});

test("markPageDeleted records deletedAt and updatedAt with the same timestamp", () => {
  const deleted = markPageDeleted(page(), 500);

  assert.equal(deleted.deletedAt, 500);
  assert.equal(deleted.updatedAt, 500);
});

test("markPageRestored clears deletedAt and refreshes updatedAt", () => {
  const restored = markPageRestored(page({ deletedAt: 400, updatedAt: 400 }), 600);

  assert.equal(restored.deletedAt, undefined);
  assert.equal(restored.updatedAt, 600);
});
