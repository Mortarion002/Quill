import type { Page } from "../types";

export function resolveActivePageId(
  pages: Page[],
  currentActivePageId: string | null,
  nextActivePageId?: string | null
) {
  if (nextActivePageId !== undefined) {
    return nextActivePageId;
  }

  const livePages = pages.filter((page) => !page.deletedAt);

  return currentActivePageId &&
    livePages.some((page) => page.id === currentActivePageId)
    ? currentActivePageId
    : livePages[0]?.id ?? null;
}

export function markPageDeleted(page: Page, timestamp = Date.now()): Page {
  return { ...page, deletedAt: timestamp, updatedAt: timestamp };
}

export function markPageRestored(page: Page, timestamp = Date.now()): Page {
  return { ...page, deletedAt: undefined, updatedAt: timestamp };
}
