import type { LaunchBundle } from "./types";

const g = globalThis as unknown as { __launchBundles?: Map<string, LaunchBundle[]> };
g.__launchBundles ??= new Map<string, LaunchBundle[]>();
const store = g.__launchBundles;

function bucket(sourceId: string): LaunchBundle[] {
  let arr = store.get(sourceId);
  if (!arr) {
    arr = [];
    store.set(sourceId, arr);
  }
  return arr;
}

export function saveBundle(bundle: LaunchBundle): void {
  const arr = bucket(bundle.sourceId);
  arr.unshift(bundle);
  if (arr.length > 10) arr.length = 10;
}

export function latestBundle(sourceId: string): LaunchBundle | null {
  return bucket(sourceId)[0] ?? null;
}

export function bundleHistory(sourceId: string): LaunchBundle[] {
  return [...bucket(sourceId)];
}

export function bundleByHash(sourceId: string, hash: string): LaunchBundle | null {
  return bucket(sourceId).find((b) => b.sourceHash === hash) ?? null;
}
