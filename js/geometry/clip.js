// Sutherland–Hodgman clipping of an arbitrary polygon against an axis-aligned rectangle.
// The clipped polygon may contain degenerate edges for concave input, but its area is exact,
// which is all the tile-coverage maths needs.

import { area } from "./polygon.js";

function clipEdge(pts, inside, intersect) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const prev = pts[(i - 1 + pts.length) % pts.length];
    const curIn = inside(cur);
    const prevIn = inside(prev);
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur));
      out.push(cur);
    } else if (prevIn) {
      out.push(intersect(prev, cur));
    }
  }
  return out;
}

const atX = (x) => (a, b) => ({ x, y: a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x) });
const atY = (y) => (a, b) => ({ x: a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y), y });

/** rect = { x0, y0, x1, y1 } */
export function clipToRect(pts, rect) {
  let out = pts;
  out = clipEdge(out, (p) => p.x >= rect.x0, atX(rect.x0));
  if (!out.length) return out;
  out = clipEdge(out, (p) => p.x <= rect.x1, atX(rect.x1));
  if (!out.length) return out;
  out = clipEdge(out, (p) => p.y >= rect.y0, atY(rect.y0));
  if (!out.length) return out;
  out = clipEdge(out, (p) => p.y <= rect.y1, atY(rect.y1));
  return out;
}

export function clippedArea(pts, rect) {
  const clipped = clipToRect(pts, rect);
  return clipped.length < 3 ? 0 : area(clipped);
}

export function intersectRects(a, b) {
  const x0 = Math.max(a.x0, b.x0);
  const y0 = Math.max(a.y0, b.y0);
  const x1 = Math.min(a.x1, b.x1);
  const y1 = Math.min(a.y1, b.y1);
  return x1 > x0 && y1 > y0 ? { x0, y0, x1, y1 } : null;
}
