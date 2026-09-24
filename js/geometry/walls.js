// Editing a rectilinear room: walls only ever move perpendicular to themselves,
// so every corner stays at 90°.

import { isHorizontal, isRectilinear, isSimple, walls, dist } from "./polygon.js";
import { MIN_WALL_MM } from "../config.js";

export function isValidRoom(pts) {
  if (pts.length < 4 || !isRectilinear(pts) || !isSimple(pts)) return false;
  return walls(pts).every((w) => w.length >= MIN_WALL_MM - 1e-6);
}

/**
 * Move wall i perpendicular to itself by `delta` mm
 * (y for a horizontal wall, x for a vertical one). Returns new points, or null if invalid.
 */
export function moveWall(pts, i, delta) {
  const n = pts.length;
  const a = i;
  const b = (i + 1) % n;
  const horizontal = isHorizontal(pts[a], pts[b]);
  const next = pts.map((p) => ({ ...p }));
  if (horizontal) {
    next[a].y += delta;
    next[b].y += delta;
  } else {
    next[a].x += delta;
    next[b].x += delta;
  }
  return isValidRoom(next) ? next : null;
}

/** Axis coordinate a wall sits on. */
export function wallCoord(pts, i) {
  const a = pts[i];
  const b = pts[(i + 1) % pts.length];
  return isHorizontal(a, b) ? a.y : a.x;
}

/** Change wall i's length by sliding the following wall. Returns new points or null. */
export function setWallLength(pts, i, length) {
  const n = pts.length;
  const a = pts[i];
  const b = pts[(i + 1) % n];
  const current = dist(a, b);
  const sign = isHorizontal(a, b) ? Math.sign(b.x - a.x) : Math.sign(b.y - a.y);
  return moveWall(pts, (i + 1) % n, sign * (length - current));
}

export function snap(value, step, origin = 0) {
  return origin + Math.round((value - origin) / step) * step;
}
