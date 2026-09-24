// Procedural tile sprites. Each (surface, colour, pixel size) is drawn once onto an
// offscreen canvas and cached, so the floor renders with plain drawImage calls.

import { getSurface } from "../data/tiles.js";
import { shade } from "../utils/color.js";
import { mulberry32, hashSeed } from "../utils/rng.js";
import { DRAWERS } from "./surfaces/index.js";

const MAX_ENTRIES = 400;
const cache = new Map();

export function getTileSprite(surfaceId, hex, px) {
  const size = Math.max(4, Math.min(320, Math.round(px)));
  const key = `${surfaceId}|${hex}|${size}`;
  let sprite = cache.get(key);
  if (sprite) {
    cache.delete(key); // refresh LRU order
    cache.set(key, sprite);
    return sprite;
  }
  sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  drawTile(sprite.getContext("2d"), size, surfaceId, hex);
  cache.set(key, sprite);
  if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value);
  return sprite;
}

export function drawTile(ctx, s, surfaceId, hex) {
  const surface = getSurface(surfaceId);
  const rng = mulberry32(hashSeed(surfaceId, hex));
  const detail = s >= 22;

  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, s, s);

  // Soft top-left light falloff gives the plastic a moulded look.
  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, "rgba(255,255,255,0.07)");
  g.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);

  const drawer = DRAWERS[surface.drawer];
  if (drawer) {
    ctx.save();
    drawer(ctx, s, hex, rng, detail);
    ctx.restore();
  }
  bevel(ctx, s, hex);
}

/** Raised rim: light on the top/left, shadow on the bottom/right, dark seam outside. */
function bevel(ctx, s, hex) {
  const w = Math.max(1, s * 0.035);
  ctx.fillStyle = shade(hex, 0.22);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(s, 0);
  ctx.lineTo(s - w, w);
  ctx.lineTo(w, w);
  ctx.lineTo(w, s - w);
  ctx.lineTo(0, s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = shade(hex, -0.3);
  ctx.beginPath();
  ctx.moveTo(s, s);
  ctx.lineTo(0, s);
  ctx.lineTo(w, s - w);
  ctx.lineTo(s - w, s - w);
  ctx.lineTo(s - w, w);
  ctx.lineTo(s, 0);
  ctx.closePath();
  ctx.fill();

  if (s >= 12) {
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, s - 1, s - 1);
  }
}
