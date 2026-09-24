// Vinyl-top inlays: wood planks and carbon-fibre twill.

import { shade } from "../../utils/color.js";
import { inlayFrame } from "./shared.js";

export function wood(ctx, s, hex, rng, detail) {
  const box = inlayFrame(ctx, s, hex, shade(hex, -0.55));
  const planks = 4;
  const ph = box.h / planks;
  for (let i = 0; i < planks; i++) {
    const y = box.y + i * ph;
    const tone = shade(hex, (rng() - 0.5) * 0.18);
    ctx.fillStyle = tone;
    ctx.fillRect(box.x, y, box.w, ph);

    if (detail) {
      ctx.strokeStyle = shade(tone, -0.2);
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = Math.max(0.6, s * 0.003);
      for (let g = 0; g < 6; g++) {
        const gy = y + ph * (0.12 + rng() * 0.76);
        ctx.beginPath();
        ctx.moveTo(box.x, gy);
        ctx.bezierCurveTo(
          box.x + box.w * 0.3, gy + (rng() - 0.5) * ph * 0.3,
          box.x + box.w * 0.7, gy + (rng() - 0.5) * ph * 0.3,
          box.x + box.w, gy
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Plank seams and a staggered end joint.
    ctx.fillStyle = shade(hex, -0.45);
    ctx.fillRect(box.x, y, box.w, Math.max(1, s * 0.006));
    const jx = box.x + box.w * (0.2 + rng() * 0.6);
    ctx.fillRect(jx, y, Math.max(1, s * 0.006), ph);
  }
}

export function carbon(ctx, s, hex, rng, detail) {
  const box = inlayFrame(ctx, s, hex, shade(hex, -0.55));
  const n = detail ? 14 : 7;
  const cw = box.w / n;
  const light = shade(hex, 0.16);
  const dark = shade(hex, -0.2);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = box.x + i * cw;
      const y = box.y + j * cw;
      const horizontal = (i + j) % 4 < 2;
      const g = horizontal ? ctx.createLinearGradient(x, y, x + cw, y) : ctx.createLinearGradient(x, y, x, y + cw);
      g.addColorStop(0, dark);
      g.addColorStop(0.5, light);
      g.addColorStop(1, dark);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, cw + 0.5, cw + 0.5);
    }
  }
  const sheen = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
  sheen.addColorStop(0, "rgba(255,255,255,0.12)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(255,255,255,0.08)");
  ctx.fillStyle = sheen;
  ctx.fillRect(box.x, box.y, box.w, box.h);
}
