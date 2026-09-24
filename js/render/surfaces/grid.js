// Open-grid surfaces: decorative outdoor lattice and fine sports-court grid.

import { holeColor, roundRect } from "./shared.js";

function openings(ctx, s, hex, n, ratio, radius, offsetRows) {
  const m = s * 0.05;
  const p = (s - 2 * m) / n;
  const size = p * ratio;
  ctx.fillStyle = holeColor(hex);
  for (let j = 0; j < n; j++) {
    const shift = offsetRows && j % 2 ? p / 2 : 0;
    for (let i = 0; i < n; i++) {
      const x = m + i * p + (p - size) / 2 + shift;
      if (x + size > s - m) continue;
      roundRect(ctx, x, m + j * p + (p - size) / 2, size, size, size * radius);
      ctx.fill();
    }
  }
}

export function lattice(ctx, s, hex, rng, detail) {
  openings(ctx, s, hex, detail ? 9 : 5, 0.5, 0.3, true);
}

export function court(ctx, s, hex, rng, detail) {
  openings(ctx, s, hex, detail ? 18 : 8, 0.45, 0.1, false);
}
