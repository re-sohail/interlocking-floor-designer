// Coin top (raised discs) and its softer anti-fatigue variant.

import { shade } from "../../utils/color.js";

function discs(ctx, s, hex, n, radiusRatio, contrast) {
  const p = s / n;
  const rad = p * radiusRatio;
  const off = Math.max(0.6, rad * 0.18);
  const shadow = shade(hex, -0.35 * contrast);
  const face = shade(hex, 0.06 * contrast);
  const light = shade(hex, 0.3 * contrast);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cx = (i + 0.5) * p;
      const cy = (j + 0.5) * p;
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(cx + off, cy + off, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = face;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      if (rad > 2) {
        ctx.strokeStyle = light;
        ctx.lineWidth = Math.max(0.8, rad * 0.16);
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 0.78, Math.PI * 1.05, Math.PI * 1.55);
        ctx.stroke();
      }
    }
  }
}

export function coin(ctx, s, hex, rng, detail) {
  discs(ctx, s, hex, detail ? 10 : 5, 0.25, 1);
}

export function softCoin(ctx, s, hex, rng, detail) {
  discs(ctx, s, hex, detail ? 7 : 4, 0.33, 0.55);
}
