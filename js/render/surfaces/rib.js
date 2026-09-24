// Smooth rib (closed top with parallel ribs) and ribbed diamond (concentric diamond ribs).

import { shade } from "../../utils/color.js";

export function rib(ctx, s, hex, rng, detail) {
  const m = s * 0.06;
  const n = detail ? 18 : 8;
  const step = (s - 2 * m) / n;
  const lw = Math.max(1, step * 0.18);
  for (let i = 0; i < n; i++) {
    const y = m + (i + 0.5) * step;
    ctx.fillStyle = shade(hex, 0.14);
    ctx.fillRect(m, y - lw, s - 2 * m, lw);
    ctx.fillStyle = shade(hex, -0.22);
    ctx.fillRect(m, y, s - 2 * m, lw);
  }
}

export function ribDiamond(ctx, s, hex, rng, detail) {
  const m = s * 0.06;
  ctx.beginPath();
  ctx.rect(m, m, s - 2 * m, s - 2 * m);
  ctx.clip();
  const c = s / 2;
  const step = s / (detail ? 16 : 8);
  const lw = Math.max(1, step * 0.2);
  for (let r = step / 2; r < s; r += step) {
    diamondPath(ctx, c + lw * 0.6, c + lw * 0.6, r);
    ctx.strokeStyle = shade(hex, -0.25);
    ctx.lineWidth = lw;
    ctx.stroke();
    diamondPath(ctx, c, c, r);
    ctx.strokeStyle = shade(hex, 0.14);
    ctx.stroke();
  }
}

function diamondPath(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
}
