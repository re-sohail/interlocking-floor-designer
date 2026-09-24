// Everything computed from the design: tile grid, resolved cell looks, and quantities.
// Memoised on the design object's identity (the store never mutates in place).

import { buildGrid, edgeQuantities, netArea, cellKey } from "../geometry/tiling.js";
import { perimeter, bbox } from "../geometry/polygon.js";
import { getCollection, getSize } from "../data/collections.js";
import { getPattern, normalizeResult } from "../data/patterns.js";
import { edgeGender, MATCH_FLOOR } from "../data/edges.js";
import { colorHex } from "../data/colors.js";

let last = { design: null, value: null };

export function derive(design) {
  if (last.design === design) return last.value;
  const value = compute(design);
  last = { design, value };
  return value;
}

/** What a single cell looks like: pattern first, then user paint on top. */
export function resolveCell(design, grid, cell) {
  const pattern = getPattern(design.patternId);
  const res = normalizeResult(
    pattern.rule(cell.c - grid.c0, cell.r - grid.r0, grid.cols, grid.rows, {
      d: cell.d,
      pitch: grid.pitch,
      text: design.text,
    })
  );
  let color = res.color || design.slots[res.slot || "A"];
  let surface = res.surface || design.surfaceId;
  const paint = design.overrides[cellKey(cell.c, cell.r)];
  if (paint) {
    if (paint.color) color = paint.color;
    if (paint.surface) surface = paint.surface;
  }
  return { color, surface };
}

function compute(design) {
  const collection = getCollection(design.collectionId);
  const size = getSize(collection, design.sizeId);
  const grid = buildGrid(design.room, design.obstacles, size.pitchMm, design.gridOrigin);

  const groups = new Map();
  let full = 0;
  let cut = 0;
  for (const cell of grid.cells) {
    const look = resolveCell(design, grid, cell);
    cell.color = look.color;
    cell.surface = look.surface;
    const key = `${look.surface}|${look.color}`;
    if (!groups.has(key)) groups.set(key, { surface: look.surface, color: look.color, full: 0, cut: 0 });
    const g = groups.get(key);
    if (cell.full) {
      g.full++;
      full++;
    } else {
      g.cut++;
      cut++;
    }
  }

  const wasteFactor = 1 + design.waste / 100;
  const byGroup = [...groups.values()]
    .map((g) => ({ ...g, count: g.full + g.cut, order: Math.ceil((g.full + g.cut) * wasteFactor) }))
    .sort((a, b) => b.count - a.count);

  const edges = edgeQuantities(design.room, design.exposed, size.pitchMm, edgeGender);
  const edgeColorId = design.edgeColor === MATCH_FLOOR ? design.slots.A : design.edgeColor;

  return {
    collection,
    size,
    grid,
    bbox: bbox(design.room),
    area: netArea(design.room, design.obstacles),
    perimeter: perimeter(design.room),
    tiles: {
      full,
      cut,
      total: full + cut,
      order: byGroup.reduce((s, g) => s + g.order, 0),
      byGroup,
    },
    edges,
    edgeColorId,
    edgeHex: colorHex(edgeColorId),
  };
}
