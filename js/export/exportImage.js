// High-resolution PNG: the plan with dimensions on the left, a spec sheet on the right.

import { EXPORT } from "../config.js";
import { derive } from "../state/derived.js";
import { Camera } from "../render/camera.js";
import { renderScene } from "../render/scene.js";
import { getTileSprite } from "../render/tileRenderer.js";
import { getColor } from "../data/colors.js";
import { getSurface } from "../data/tiles.js";
import { getPattern } from "../data/patterns.js";
import { formatLength, formatArea, formatTileSize } from "../geometry/units.js";

const FONT = "Inter, system-ui, sans-serif";
const INK = "#16181c";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";
const ACCENT = "#b08a57";

export async function downloadDesign(design) {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = renderExport(design);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `floor-design-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function renderExport(design) {
  const { width: W, height: H } = EXPORT;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const q = derive(design);
  const u = design.units;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Plan area
  const plan = { x: 0, y: 150, w: 1640, h: H - 150 };
  const camera = new Camera();
  const pad = q.size.rampDepthMm;
  const bb = { minX: q.bbox.minX - pad, minY: q.bbox.minY - pad, maxX: q.bbox.maxX + pad, maxY: q.bbox.maxY + pad };
  camera.fit(bb, plan.w, plan.h, 150);
  camera.x += plan.x;
  camera.y += plan.y;
  ctx.save();
  ctx.beginPath();
  ctx.rect(plan.x, plan.y, plan.w, plan.h);
  ctx.clip();
  renderScene(ctx, { design, derived: q, camera, width: W, height: H, dpr: 1, exporting: true, fontScale: 1.6 });
  ctx.restore();

  // Header
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `700 46px ${FONT}`;
  ctx.fillText("Floor design", 60, 84);
  ctx.fillStyle = MUTED;
  ctx.font = `500 24px ${FONT}`;
  ctx.fillText(
    `${q.collection.name} · ${getSurface(design.surfaceId).name} · ${getPattern(design.patternId).name} · ${new Date().toLocaleDateString()}`,
    60,
    122
  );
  ctx.fillStyle = LINE;
  ctx.fillRect(60, 146, W - 120, 2);

  // Spec sheet
  const x = 1700;
  const colW = W - x - 60;
  let y = 210;

  const heading = (text) => {
    ctx.fillStyle = MUTED;
    ctx.font = `700 18px ${FONT}`;
    ctx.fillText(text.toUpperCase(), x, y);
    y += 16;
    ctx.fillStyle = LINE;
    ctx.fillRect(x, y, colW, 2);
    y += 38;
  };
  const kv = (label, value) => {
    ctx.font = `500 24px ${FONT}`;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "left";
    ctx.fillText(label, x, y);
    ctx.fillStyle = INK;
    ctx.font = `600 24px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(value, x + colW, y);
    ctx.textAlign = "left";
    y += 40;
  };

  // Hero number
  ctx.fillStyle = "#f6f1ea";
  roundRect(ctx, x, y - 40, colW, 150, 18);
  ctx.fill();
  ctx.fillStyle = ACCENT;
  ctx.font = `700 20px ${FONT}`;
  ctx.fillText("TILES TO ORDER", x + 28, y);
  ctx.fillStyle = INK;
  ctx.font = `800 64px ${FONT}`;
  ctx.fillText(q.tiles.order.toLocaleString(), x + 28, y + 70);
  ctx.fillStyle = MUTED;
  ctx.font = `500 20px ${FONT}`;
  ctx.fillText(`${q.tiles.full} full · ${q.tiles.cut} cut · +${design.waste}% waste`, x + 28, y + 98);
  y += 170;

  heading("Floor");
  kv("Size", `${formatLength(q.bbox.width, u)} × ${formatLength(q.bbox.height, u)}`);
  kv("Tiled area", formatArea(q.area, u));
  kv("Perimeter", formatLength(q.perimeter, u));
  y += 14;

  heading("Tiles by colour");
  const maxRows = 6;
  q.tiles.byGroup.slice(0, maxRows).forEach((g) => {
    const sprite = getTileSprite(g.surface, getColor(g.color).hex, 44);
    ctx.drawImage(sprite, x, y - 32, 44, 44);
    ctx.fillStyle = INK;
    ctx.font = `600 24px ${FONT}`;
    ctx.fillText(getColor(g.color).name, x + 60, y - 8);
    ctx.fillStyle = MUTED;
    ctx.font = `500 18px ${FONT}`;
    ctx.fillText(getSurface(g.surface).name, x + 60, y + 14);
    ctx.fillStyle = INK;
    ctx.font = `700 26px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(g.order.toLocaleString(), x + colW, y);
    ctx.textAlign = "left";
    y += 60;
  });
  if (q.tiles.byGroup.length > maxRows) {
    ctx.fillStyle = MUTED;
    ctx.font = `500 20px ${FONT}`;
    ctx.fillText(`+ ${q.tiles.byGroup.length - maxRows} more colours`, x, y);
    y += 36;
  }
  y += 10;

  heading("Edges & corners");
  kv("Loop edges", String(q.edges.loop));
  kv("Peg edges", String(q.edges.peg));
  kv("Corners", String(q.edges.corners.length));
  kv("Ramp colour", getColor(q.edgeColorId).name);
  y += 14;

  heading("Tile spec");
  kv("Size", formatTileSize(q.size.pitchMm));
  kv("Thickness", `${q.size.thicknessMm} mm`);

  ctx.fillStyle = MUTED;
  ctx.font = `500 16px ${FONT}`;
  ctx.fillText("Cut tiles are counted as whole tiles. Quantities are estimates; confirm on site.", 60, H - 30);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
