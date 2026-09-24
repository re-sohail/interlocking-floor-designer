// Polygon maths. All coordinates are in millimetres, y axis points down (screen convention).

const EPS = 1e-6;

export function bbox(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Shoelace formula. Positive = clockwise on screen (y down). */
export function signedArea(pts) {
  let sum = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

export const area = (pts) => Math.abs(signedArea(pts));

export function perimeter(pts) {
  let sum = 0;
  for (let i = 0, n = pts.length; i < n; i++) sum += dist(pts[i], pts[(i + 1) % n]);
  return sum;
}

export const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(p, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

export function isHorizontal(a, b) {
  return Math.abs(a.y - b.y) < EPS;
}

export function isRectilinear(pts) {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (Math.abs(a.x - b.x) > EPS && Math.abs(a.y - b.y) > EPS) return false;
  }
  return true;
}

/** Wall list: one entry per polygon edge. */
export function walls(pts) {
  return pts.map((a, i) => {
    const b = pts[(i + 1) % pts.length];
    return { index: i, a, b, horizontal: isHorizontal(a, b), length: dist(a, b) };
  });
}

/** Unit normal of edge i pointing out of the polygon. */
export function outwardNormal(pts, i) {
  const a = pts[i];
  const b = pts[(i + 1) % pts.length];
  const len = dist(a, b) || 1;
  const s = Math.sign(signedArea(pts)) || 1;
  return { x: (s * (b.y - a.y)) / len, y: (s * -(b.x - a.x)) / len };
}

/** Indices of convex (outside) corners. */
export function convexVertices(pts) {
  const s = Math.sign(signedArea(pts));
  const out = [];
  for (let i = 0, n = pts.length; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const cross = (cur.x - prev.x) * (next.y - cur.y) - (cur.y - prev.y) * (next.x - cur.x);
    if (Math.sign(cross) === s) out.push(i);
  }
  return out;
}

function orient(a, b, c) {
  const v = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return Math.abs(v) < EPS ? 0 : Math.sign(v);
}

function onSegment(a, b, p) {
  return (
    Math.min(a.x, b.x) - EPS <= p.x && p.x <= Math.max(a.x, b.x) + EPS &&
    Math.min(a.y, b.y) - EPS <= p.y && p.y <= Math.max(a.y, b.y) + EPS
  );
}

export function segmentsIntersect(p1, p2, p3, p4) {
  const d1 = orient(p3, p4, p1);
  const d2 = orient(p3, p4, p2);
  const d3 = orient(p1, p2, p3);
  const d4 = orient(p1, p2, p4);
  if (d1 !== d2 && d3 !== d4) return true;
  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;
  return false;
}

/** True if no two non-adjacent edges touch or cross. */
export function isSimple(pts) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      if (segmentsIntersect(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return false;
    }
  }
  return true;
}

/** Shortest distance from point p to segment ab. */
export function distanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function translate(pts, dx, dy) {
  return pts.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}
