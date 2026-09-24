// Diamond plate: raised 3:1 lozenges at ±45°, alternating like steel tread plate.

import { shade } from "../../utils/color.js";

export function diamond(ctx, s, hex, rng, detail) {
  const n = detail ? 8 : 4;
  const p = s / n;
  const rx = p * 0.36;
  const ry = p * 0.11;
  const off = Math.max(0.6, ry * 0.45);
  const shadow = shade(hex, -0.35);
  const face = shade(hex, 0.16);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cx = (i + 0.5) * p;
      const cy = (j + 0.5) * p;
      const angle = ((i + j) % 2 ? 1 : -1) * (Math.PI / 4);
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(cx + off, cy + off, rx, ry, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = face;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
