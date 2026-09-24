// Deterministic pseudo-random numbers so procedural textures and
// "random mix" patterns look identical on every redraw and in exports.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash any number of integers / strings into a 32-bit seed. */
export function hashSeed(...parts) {
  let h = 2166136261;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x9e37;
  }
  return h >>> 0;
}

/** Stable value in [0, 1) for a grid cell. */
export function cellNoise(c, r, salt = 0) {
  return mulberry32(hashSeed(c, r, salt))();
}
