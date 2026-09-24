// Flat-topped surfaces: textured skin, ESD (conductive veins) and terrazzo vinyl.

import { shade } from "../../utils/color.js";
import { inlayFrame, speckle } from "./shared.js";

export function skin(ctx, s, hex, rng, detail) {
  const count = Math.round((s * s) / (detail ? 9 : 28));
  speckle(ctx, s, rng, count, [shade(hex, 0.12), shade(hex, -0.14)], 0.8, Math.max(1, s * 0.008), 0.55);
}

export function esd(ctx, s, hex, rng, detail) {
  skin(ctx, s, hex, rng, detail);
  ctx.strokeStyle = shade(hex, -0.4);
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(0.7, s * 0.004);
  for (let i = 0; i < (detail ? 7 : 3); i++) {
    ctx.beginPath();
    ctx.moveTo(rng() * s, 0);
    ctx.bezierCurveTo(rng() * s, s * 0.33, rng() * s, s * 0.66, rng() * s, s);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function terrazzo(ctx, s, hex, rng, detail) {
  const box = inlayFrame(ctx, s, hex);
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  const chips = ["#f4f1ea", "#1d1d1d", "#8a8a8a", shade(hex, 0.4), shade(hex, -0.4)];
  const count = Math.round((s * s) / (detail ? 70 : 180));
  for (let i = 0; i < count; i++) {
    const cx = rng() * s;
    const cy = rng() * s;
    const rad = s * (0.008 + rng() * 0.022);
    const sides = 3 + Math.floor(rng() * 3);
    ctx.fillStyle = chips[Math.floor(rng() * chips.length)];
    ctx.beginPath();
    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2 + rng();
      const rr = rad * (0.6 + rng() * 0.4);
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
}
