// Sidebar previews rendered from the same data the floor uses — no image assets,
// so a preview always matches what the design will look like.

import { getLayout } from "../data/layouts.js";
import { normalizeResult } from "../data/patterns.js";
import { colorHex } from "../data/colors.js";
import { getTileSprite } from "./tileRenderer.js";

const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

/** Create a crisp canvas of CSS size w×h. */
export function thumbCanvas(w, h, className = "thumb") {
  const c = document.createElement("canvas");
  const dpr = DPR();
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  c.style.width = `${w}px`;
  c.style.height = `${h}px`;
  c.className = className;
  c.getContext("2d").scale(dpr, dpr);
  return c;
}

export function layoutThumb(layoutId, w = 96, h = 64) {
  const canvas = thumbCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const pts = getLayout(layoutId).build();
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const bw = Math.max(...xs) - minX;
  const bh = Math.max(...ys) - minY;
  const pad = 8;
  const k = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
  const ox = (w - bw * k) / 2 - minX * k;
  const oy = (h - bh * k) / 2 - minY * k;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(ox + p.x * k, oy + p.y * k) : ctx.moveTo(ox + p.x * k, oy + p.y * k)));
  ctx.closePath();
  ctx.fillStyle = "#e7ddd0";
  ctx.fill();
  ctx.strokeStyle = "#8a6d45";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  return canvas;
}

/** Pattern preview on a 12 × 8 rectangle using the design's current slot colours. */
export function patternThumb(pattern, slots, w = 96, h = 64) {
  const canvas = thumbCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const W = 12;
  const H = 8;
  const cell = Math.min(w / W, h / H);
  const ox = (w - cell * W) / 2;
  const oy = (h - cell * H) / 2;
  for (let c = 0; c < W; c++) {
    for (let r = 0; r < H; r++) {
      const d = Math.min(c, r, W - 1 - c, H - 1 - r);
      const res = normalizeResult(pattern.rule(c, r, W, H, { d, pitch: 400, text: "AB" }));
      ctx.fillStyle = colorHex(res.color || slots[res.slot || "A"]);
      ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
    }
  }
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let c = 0; c <= W; c++) {
    ctx.moveTo(ox + c * cell, oy);
    ctx.lineTo(ox + c * cell, oy + H * cell);
  }
  for (let r = 0; r <= H; r++) {
    ctx.moveTo(ox, oy + r * cell);
    ctx.lineTo(ox + W * cell, oy + r * cell);
  }
  ctx.stroke();
  return canvas;
}

/** 2 × 2 block of real tile sprites. */
export function surfaceThumb(surfaceId, colorId, size = 72) {
  const canvas = thumbCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const half = size / 2;
  const sprite = getTileSprite(surfaceId, colorHex(colorId), half * DPR());
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) ctx.drawImage(sprite, i * half, j * half, half, half);
  }
  return canvas;
}

/** Single tile swatch (used in the summary list). */
export function tileSwatch(surfaceId, colorId, size = 28) {
  const canvas = thumbCanvas(size, size, "swatch-tile");
  canvas.getContext("2d").drawImage(getTileSprite(surfaceId, colorHex(colorId), size * DPR()), 0, 0, size, size);
  return canvas;
}
