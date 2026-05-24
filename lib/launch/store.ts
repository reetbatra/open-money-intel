import type { LaunchBundle } from "./types";

const g = globalThis as unknown as { __launchBundles?: LaunchBundle[] };
g.__launchBundles ??= [];
const store = g.__launchBundles;

export function saveBundle(bundle: LaunchBundle): void {
  store.unshift(bundle);
  if (store.length > 10) store.length = 10;
}

export function latestBundle(): LaunchBundle | null {
  return store[0] ?? null;
}

export function bundleByHash(hash: string): LaunchBundle | null {
  return store.find((b) => b.sourceHash === hash) ?? null;
}
