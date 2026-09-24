// Draws the whole plan: backdrop, tiles, edge ramps, obstacles, dimensions and handles.
// Used both for the live editor canvas and for the high-resolution export.

import { getTileSprite } from "./tileRenderer.js";
import { colorHex } from "../data/colors.js";
import { obstacleType } from "../geometry/obstacles.js";
import { formatLength, MM_PER_FT } from "../geometry/units.js";
import { shade } from "../utils/color.js";

const THEME = {
  backdrop: "#eceef1",
  backdropLine: "rgba(30, 41, 59, 0.06)",
  subfloor: "#2a2c30",
  outline: "rgba(17, 18, 20, 0.6)",
  wall: "#3f434a",
  dim: "#5b6270",
  accent: "#b08a57",
  obstacle: "#d9dce1",
};

/**
 * @returns hit areas in screen px: { dims: [{ index, x, y, w, h }] }
 */
export function renderScene(ctx, opts) {
  const { design, derived, camera, width, height, dpr = 1, ui = {}, exporting = false, fontScale = 1 } = opts;
  const hits = { dims: [] };
  const room = design.room.map((p) => camera.toScreen(p));
  const roomPath = polygonPath(room);

  ctx.save();
  ctx.fillStyle = exporting ? "#ffffff" : THEME.backdrop;
  ctx.fillRect(0, 0, width, height);
  if (!exporting) drawBackdropGrid(ctx, camera, width, height, design.units);

  // Soft drop shadow gives the floor some depth.
  ctx.save();
  ctx.shadowColor = "rgba(15, 20, 30, 0.28)";
  ctx.shadowBlur = 28 * fontScale;
  ctx.shadowOffsetY = 10 * fontScale;
  ctx.fillStyle = THEME.subfloor;
  ctx.fill(roomPath);
  ctx.restore();

  drawRamps(ctx, design, derived, camera);
  drawTiles(ctx, design, derived, camera, roomPath, width, height, dpr);
  if (!exporting && ui.hoverCell) drawHoverCell(ctx, ui.hoverCell, camera);
  drawObstacles(ctx, design, camera, ui, exporting, fontScale);
  drawWalls(ctx, design, derived, room);

  ctx.lineWidth = 1.25 * fontScale;
  ctx.strokeStyle = THEME.outline;
  ctx.stroke(roomPath);

  if (!exporting && ui.hoverWall >= 0 && ui.hoverWall < room.length) {
    const a = room[ui.hoverWall];
    const b = room[(ui.hoverWall + 1) % room.length];
    ctx.strokeStyle = THEME.accent;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  if (design.showDims !== false || exporting) {
    hits.dims = drawDimensions(ctx, design, derived, camera, room, fontScale);
  }
  if (!exporting && ui.tool === "select") drawWallHandles(ctx, room, ui.hoverWall);
  ctx.restore();
  return hits;
}

function polygonPath(pts) {
  const path = new Path2D();
  pts.forEach((p, i) => (i ? path.lineTo(p.x, p.y) : path.moveTo(p.x, p.y)));
  path.closePath();
  return path;
}

function drawBackdropGrid(ctx, camera, width, height, units) {
  let step = units === "imperial" ? MM_PER_FT : 1000;
  while (step * camera.scale < 14) step *= 5;
  const start = camera.toWorld(0, 0);
  const end = camera.toWorld(width, height);
  ctx.strokeStyle = THEME.backdropLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.floor(start.x / step) * step; x <= end.x; x += step) {
    const sx = Math.round(x * camera.scale + camera.x) + 0.5;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
  }
  for (let y = Math.floor(start.y / step) * step; y <= end.y; y += step) {
    const sy = Math.round(y * camera.scale + camera.y) + 0.5;
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
  }
  ctx.stroke();
}

function drawTiles(ctx, design, derived, camera, roomPath, width, height, dpr) {
  const { grid } = derived;
  const clip = new Path2D();
  clip.addPath(roomPath);
  for (const ob of design.obstacles) {
    const p = camera.toScreen({ x: ob.x, y: ob.y });
    clip.rect(p.x, p.y, ob.w * camera.scale, ob.h * camera.scale);
  }
  ctx.save();
  ctx.clip(clip, "evenodd");
  const { scale, x: ox, y: oy } = camera;
  for (const cell of grid.cells) {
    const x0 = Math.round(cell.x0 * scale + ox);
    const y0 = Math.round(cell.y0 * scale + oy);
    const x1 = Math.round(cell.x1 * scale + ox);
    const y1 = Math.round(cell.y1 * scale + oy);
    if (x1 < 0 || y1 < 0 || x0 > width || y0 > height) continue;
    const sprite = getTileSprite(cell.surface, colorHex(cell.color), (x1 - x0) * dpr);
    ctx.drawImage(sprite, x0, y0, x1 - x0, y1 - y0);
  }
  ctx.restore();
}

function drawHoverCell(ctx, cell, camera) {
  const p = camera.toScreen({ x: cell.x0, y: cell.y0 });
  const s = (cell.x1 - cell.x0) * camera.scale;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(p.x + 1, p.y + 1, s - 2, s - 2);
  ctx.strokeStyle = THEME.accent;
  ctx.lineWidth = 1;
  ctx.strokeRect(p.x + 2.5, p.y + 2.5, s - 5, s - 5);
}

function drawRamps(ctx, design, derived, camera) {
  const { edges, size, edgeHex } = derived;
  const depth = size.rampDepthMm * camera.scale;
  const pitch = size.pitchMm * camera.scale;
  const n = design.room.length;

  for (const w of edges.walls) {
    if (!w.exposed) continue;
    const a = camera.toScreen(w.a);
    const b = camera.toScreen(w.b);
    const nx = w.normal.x * depth;
    const ny = w.normal.y * depth;
    const g = ctx.createLinearGradient(a.x, a.y, a.x + nx, a.y + ny);
    g.addColorStop(0, shade(edgeHex, 0.12));
    g.addColorStop(1, shade(edgeHex, -0.25));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(b.x + nx, b.y + ny);
    ctx.lineTo(a.x + nx, a.y + ny);
    ctx.closePath();
    ctx.fill();

    // Joints between individual ramp pieces.
    if (pitch > 6) {
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      ctx.strokeStyle = shade(edgeHex, -0.45);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let t = pitch; t < len - 1; t += pitch) {
        ctx.moveTo(a.x + ux * t, a.y + uy * t);
        ctx.lineTo(a.x + ux * t + nx, a.y + uy * t + ny);
      }
      ctx.stroke();
    }
  }

  for (const i of edges.corners) {
    const v = camera.toScreen(design.room[i]);
    const n1 = edges.walls[(i - 1 + n) % n].normal;
    const n2 = edges.walls[i].normal;
    ctx.fillStyle = shade(edgeHex, -0.12);
    ctx.beginPath();
    ctx.moveTo(v.x + n1.x * depth, v.y + n1.y * depth);
    ctx.lineTo(v.x + (n1.x + n2.x) * depth, v.y + (n1.y + n2.y) * depth);
    ctx.lineTo(v.x + n2.x * depth, v.y + n2.y * depth);
    ctx.lineTo(v.x, v.y);
    ctx.closePath();
    ctx.fill();
  }
}

/** Walls marked "against wall" (no ramp) are drawn as a solid wall line. */
function drawWalls(ctx, design, derived, room) {
  ctx.strokeStyle = THEME.wall;
  ctx.lineWidth = 7;
  ctx.lineCap = "square";
  for (const w of derived.edges.walls) {
    if (w.exposed) continue;
    const a = room[w.index];
    const b = room[(w.index + 1) % room.length];
    const ox = w.normal.x * 3.5;
    const oy = w.normal.y * 3.5;
    ctx.beginPath();
    ctx.moveTo(a.x + ox, a.y + oy);
    ctx.lineTo(b.x + ox, b.y + oy);
    ctx.stroke();
  }
}

const hatches = new WeakMap();
function hatchPattern(ctx) {
  if (hatches.has(ctx)) return hatches.get(ctx);
  const c = document.createElement("canvas");
  c.width = c.height = 10;
  const h = c.getContext("2d");
  h.fillStyle = THEME.obstacle;
  h.fillRect(0, 0, 10, 10);
  h.strokeStyle = "rgba(60, 66, 76, 0.35)";
  h.lineWidth = 1.2;
  h.beginPath();
  h.moveTo(-2, 12);
  h.lineTo(12, -2);
  h.stroke();
  const pattern = ctx.createPattern(c, "repeat");
  hatches.set(ctx, pattern);
  return pattern;
}

function drawObstacles(ctx, design, camera, ui, exporting, fontScale) {
  for (const ob of design.obstacles) {
    const p = camera.toScreen({ x: ob.x, y: ob.y });
    const w = ob.w * camera.scale;
    const h = ob.h * camera.scale;
    ctx.fillStyle = hatchPattern(ctx);
    ctx.fillRect(p.x, p.y, w, h);
    const selected = !exporting && ui.selectedObstacle === ob.id;
    ctx.strokeStyle = selected ? THEME.accent : "#6b7280";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(p.x + 0.5, p.y + 0.5, w - 1, h - 1);

    const label = obstacleType(ob.type).name;
    ctx.font = `600 ${11 * fontScale}px Inter, system-ui, sans-serif`;
    if (ctx.measureText(label).width + 8 < w && h > 16 * fontScale) {
      ctx.fillStyle = "#374151";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, p.x + w / 2, p.y + h / 2);
    }
    if (selected) {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = THEME.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x + w, p.y + h, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

function drawDimensions(ctx, design, derived, camera, room, fontScale) {
  const hits = [];
  const rampPx = derived.size.rampDepthMm * camera.scale;
  ctx.font = `600 ${12 * fontScale}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const w of derived.edges.walls) {
    const a = room[w.index];
    const b = room[(w.index + 1) % room.length];
    const screenLen = Math.hypot(b.x - a.x, b.y - a.y);
    if (screenLen < 36 * fontScale) continue;
    const text = formatLength(w.length, design.units);
    const tw = ctx.measureText(text).width + 14 * fontScale;
    const th = 20 * fontScale;
    // Keep the label clear of the wall: vertical walls need half the label width.
    const off = (w.exposed ? rampPx : 4) + 10 * fontScale + (w.horizontal ? th / 2 : tw / 2);
    const nx = w.normal.x;
    const ny = w.normal.y;
    const a2 = { x: a.x + nx * off, y: a.y + ny * off };
    const b2 = { x: b.x + nx * off, y: b.y + ny * off };

    ctx.strokeStyle = THEME.dim;
    ctx.lineWidth = 1 * fontScale;
    ctx.beginPath();
    ctx.moveTo(a2.x, a2.y);
    ctx.lineTo(b2.x, b2.y);
    const t = 5 * fontScale;
    for (const p of [a2, b2]) {
      ctx.moveTo(p.x - nx * t, p.y - ny * t);
      ctx.lineTo(p.x + nx * t, p.y + ny * t);
    }
    ctx.stroke();

    const cx = (a2.x + b2.x) / 2;
    const cy = (a2.y + b2.y) / 2;
    const rect = { index: w.index, x: cx - tw / 2, y: cy - th / 2, w: tw, h: th };
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(17, 18, 20, 0.14)";
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.w, rect.h, th / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1f2328";
    ctx.fillText(text, cx, cy + 0.5);
    hits.push(rect);
  }
  return hits;
}

function drawWallHandles(ctx, room, hoverWall) {
  for (let i = 0; i < room.length; i++) {
    const a = room[i];
    const b = room[(i + 1) % room.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < 30) continue;
    const horizontal = Math.abs(a.y - b.y) < 0.5;
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    const w = horizontal ? 26 : 10;
    const h = horizontal ? 10 : 26;
    ctx.fillStyle = i === hoverWall ? THEME.accent : "#ffffff";
    ctx.strokeStyle = THEME.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 5);
    ctx.fill();
    ctx.stroke();
  }
}
