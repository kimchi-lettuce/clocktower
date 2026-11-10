/*
 * Seeded randomness. The engine never calls Math.random(), so the same seed
 * always produces the same game: a bug reported once can be reproduced, and a
 * replay is exact.
 *
 * mulberry32 is used because it is a dozen lines, has no dependencies, and is
 * good enough for shuffling a cast of 22.
 */

export type Rng = {
  /** Uniform in [0, 1). */
  next(): number;
  /** Uniform integer in [0, maxExclusive). */
  int(maxExclusive: number): number;
};

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (maxExclusive) => Math.floor(next() * maxExclusive),
  };
}

/** Fisher-Yates on a copy; the input is never mutated. */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

export function pick<T>(rng: Rng, items: readonly T[]): T | null {
  if (items.length === 0) return null;
  return items[rng.int(items.length)]!;
}
