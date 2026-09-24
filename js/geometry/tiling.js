// Tile grid maths: which cells the room covers, how much of each, and edge/corner counts.

import { bbox, walls, outwardNormal, convexVertices, area } from "./polygon.js";
import { clippedArea, intersectRects } from "./clip.js";
import { obstacleRect } from "./obstacles.js";
import { FULL_TILE_COVERAGE, SLIVER_COVERAGE } from "../config.js";

export const cellKey = (c, r) => `${c},${r}`;

/**
 * Lay a grid of `pitch` mm tiles anchored at `origin` over the room.
 * Coverage of each cell = area(room ∩ cell) − area(room ∩ cell ∩ obstacles), divided by the cell area.
 */
export function buildGrid(room, obstacles, pitch, origin) {
  const bb = bbox(room);
  const c0 = Math.floor((bb.minX - origin.x) / pitch + 1e-9);
  const r0 = Math.floor((bb.minY - origin.y) / pitch + 1e-9);
  const c1 = Math.ceil((bb.maxX - origin.x) / pitch - 1e-9);
  const r1 = Math.ceil((bb.maxY - origin.y) / pitch - 1e-9);
  const cellArea = pitch * pitch;
  const obRects = obstacles.map(obstacleRect);

  const cells = [];
  const index = new Map();
  for (let c = c0; c < c1; c++) {
    for (let r = r0; r < r1; r++) {
      const rect = {
        x0: origin.x + c * pitch,
        y0: origin.y + r * pitch,
        x1: origin.x + (c + 1) * pitch,
        y1: origin.y + (r + 1) * pitch,
      };
      let covered = clippedArea(room, rect);
      if (covered <= 0) continue;
      for (const ob of obRects) {
        const overlap = intersectRects(ob, rect);
        if (overlap) covered -= clippedArea(room, overlap);
      }
      const coverage = covered / cellArea;
      if (coverage < SLIVER_COVERAGE) continue;
      const cell = { c, r, ...rect, coverage, full: coverage >= FULL_TILE_COVERAGE, d: 0 };
      cells.push(cell);
      index.set(cellKey(c, r), cell);
    }
  }

  const grid = { pitch, origin, c0, r0, cols: c1 - c0, rows: r1 - r0, cells, index };
  computeEdgeDistances(grid);
  return grid;
}

/**
 * Multi-source BFS (8-neighbour, i.e. Chebyshev distance) from every grid position that is not
 * floor. d = 0 for cells touching the outside, 1 for the next ring in, and so on.
 */
function computeEdgeDistances(grid) {
  const { c0, r0, cols, rows, index } = grid;
  const queue = [];
  const seen = new Set();
  for (let c = c0 - 1; c <= c0 + cols; c++) {
    for (let r = r0 - 1; r <= r0 + rows; r++) {
      const k = cellKey(c, r);
      if (!index.has(k)) {
        queue.push([c, r, -1]);
        seen.add(k);
      }
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const [c, r, d] = queue[head];
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        const k = cellKey(c + dc, r + dr);
        if (seen.has(k)) continue;
        const cell = index.get(k);
        if (!cell) continue;
        seen.add(k);
        cell.d = d + 1;
        queue.push([c + dc, r + dr, d + 1]);
      }
    }
  }
}

/** Net floor area in mm²: room minus the part of each obstacle that lies inside it. */
export function netArea(room, obstacles) {
  let total = area(room);
  for (const ob of obstacles) total -= clippedArea(room, obstacleRect(ob));
  return Math.max(0, total);
}

/**
 * Edge ramps: exposed walls only. Pieces per wall = ceil(length / pitch).
 * Corners: convex corners where both adjoining walls are exposed.
 */
export function edgeQuantities(room, exposed, pitch, genderOf) {
  const list = walls(room).map((w) => {
    const normal = outwardNormal(room, w.index);
    const isExposed = exposed[w.index] !== false;
    return {
      ...w,
      normal,
      exposed: isExposed,
      gender: genderOf(normal),
      pieces: isExposed ? Math.ceil(w.length / pitch - 1e-6) : 0,
    };
  });
  const n = room.length;
  const corners = convexVertices(room).filter((i) => list[i].exposed && list[(i - 1 + n) % n].exposed);
  const loop = list.filter((w) => w.gender === "loop").reduce((s, w) => s + w.pieces, 0);
  const peg = list.filter((w) => w.gender === "peg").reduce((s, w) => s + w.pieces, 0);
  return { walls: list, corners, loop, peg };
}
