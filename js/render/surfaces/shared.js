// Helpers shared by the surface drawers.

import { mix, shade } from "../../utils/color.js";

/** Colour seen through a drainage hole: mostly dark sub-floor, tinted by the tile. */
export const holeColor = (hex) => mix(hex, "#08090a", 0.8);

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Vinyl-top tiles: a plastic frame around an inlay. Returns the inlay rect. */
export function inlayFrame(ctx, s, hex, frameHex = shade(hex, -0.5)) {
  const m = s * 0.05;
  ctx.fillStyle = frameHex;
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = hex;
  ctx.fillRect(m, m, s - 2 * m, s - 2 * m);
  return { x: m, y: m, w: s - 2 * m, h: s - 2 * m };
}

/** Random speckle used by several textured surfaces. */
export function speckle(ctx, s, rng, count, colors, minSize, maxSize, alpha = 1) {
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
    const size = minSize + rng() * (maxSize - minSize);
    ctx.fillRect(rng() * s, rng() * s, size, size);
  }
  ctx.globalAlpha = 1;
}
