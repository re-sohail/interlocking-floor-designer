// Vented / free-flow: rows of through-slots split by cross ribs.

import { shade } from "../../utils/color.js";
import { holeColor, roundRect } from "./shared.js";

export function vented(ctx, s, hex, rng, detail) {
  const m = s * 0.07;
  const inner = s - 2 * m;
  const rows = detail ? 11 : 5;
  const band = inner / rows;
  const slotH = band * 0.5;
  const segs = 4;
  const gap = inner * 0.04;
  const segW = (inner - gap * (segs - 1)) / segs;
  const hole = holeColor(hex);
  const lip = shade(hex, 0.2);

  for (let i = 0; i < rows; i++) {
    const y = m + i * band + (band - slotH) / 2;
    for (let j = 0; j < segs; j++) {
      const x = m + j * (segW + gap);
      ctx.fillStyle = hole;
      roundRect(ctx, x, y, segW, slotH, slotH / 2);
      ctx.fill();
      if (detail) {
        ctx.fillStyle = lip;
        ctx.fillRect(x + slotH / 2, y + slotH, segW - slotH, Math.max(1, s * 0.006));
      }
    }
  }
}
