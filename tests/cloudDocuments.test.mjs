import assert from "node:assert/strict";
import test from "node:test";

import {
  documentRowToPage,
  mergePages,
  pageToDocumentRow,
} from "../src/lib/documents/cloudDocuments.ts";

function page(overrides = {}) {
  return {
    id: "page-1",
    title: "Draft",
    content: "<p>Hello</p>",
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    ...overrides,
  };
}

test("mergePages keeps the newest version for matching ids", () => {
  const local = page({ title: "Local", updatedAt: 300 });
  const cloud = page({ title: "Cloud", updatedAt: 200 });

  assert.deepEqual(mergePages([local], [cloud]), [local]);
});

test("mergePages keeps newer cloud soft-delete state", () => {
  const local = page({ updatedAt: 200 });
  const cloud = page({ deletedAt: 350, updatedAt: 350 });

  assert.deepEqual(mergePages([local], [cloud]), [cloud]);
});

test("pageToDocumentRow and documentRowToPage round-trip optional fields", () => {
  const source = page({
    emoji: "Q",
    favorite: true,
    deletedAt: 1_700_000_100_000,
    updatedAt: 1_700_000_200_000,
  });

  const row = pageToDocumentRow(source, "user-1");
  const restored = documentRowToPage(row);

  assert.equal(row.user_id, "user-1");
  assert.equal(row.deleted_at, "2023-11-14T22:15:00.000Z");
  assert.deepEqual(restored, source);
});
