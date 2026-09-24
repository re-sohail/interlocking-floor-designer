// Soft surfaces: EPDM-fleck rubber and artificial grass.

import { shade } from "../../utils/color.js";
import { speckle } from "./shared.js";

export function rubber(ctx, s, hex, rng, detail) {
  const count = Math.round((s * s) / (detail ? 30 : 80));
  const flecks = ["#e9e9e9", "#8f8f8f", "#111111", shade(hex, 0.35)];
  speckle(ctx, s, rng, count, flecks, Math.max(0.8, s * 0.005), Math.max(1.2, s * 0.016), 0.85);
}

export function grass(ctx, s, hex, rng, detail) {
  ctx.fillStyle = shade(hex, -0.3);
  ctx.fillRect(0, 0, s, s);
  const count = Math.min(24000, Math.round((s * s) / (detail ? 4 : 10)));
  ctx.lineWidth = Math.max(0.8, s * 0.006);
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const x = rng() * s;
    const y = rng() * s;
    const len = s * (0.02 + rng() * 0.03);
    const a = -Math.PI / 2 + (rng() - 0.5) * 1.1;
    ctx.strokeStyle = shade(hex, rng() * 0.45 - 0.2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
}
