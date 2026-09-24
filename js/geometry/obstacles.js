// Rectangular cut-outs inside the room (pillars, cabinets, drains, stairs).
// Tiles are not laid under them, so they reduce area and tile counts.

export const OBSTACLE_TYPES = [
  { id: "pillar", name: "Pillar", icon: "checkbox-blank-line", w: 400, h: 400 },
  { id: "cabinet", name: "Cabinet", icon: "archive-drawer-line", w: 1800, h: 600 },
  { id: "drain", name: "Drain", icon: "drop-line", w: 300, h: 300 },
  { id: "stairs", name: "Stairs", icon: "stairs-line", w: 1000, h: 900 },
];

export const obstacleType = (id) => OBSTACLE_TYPES.find((t) => t.id === id) || OBSTACLE_TYPES[0];

export function createObstacle(typeId, center) {
  const t = obstacleType(typeId);
  return {
    id: `ob-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
    type: t.id,
    x: Math.round(center.x - t.w / 2),
    y: Math.round(center.y - t.h / 2),
    w: t.w,
    h: t.h,
  };
}

export const obstacleRect = (o) => ({ x0: o.x, y0: o.y, x1: o.x + o.w, y1: o.y + o.h });

export function pointInObstacle(p, o) {
  return p.x >= o.x && p.x <= o.x + o.w && p.y >= o.y && p.y <= o.y + o.h;
}
