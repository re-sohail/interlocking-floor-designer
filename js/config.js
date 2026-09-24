// App-wide defaults. Change these to tune behaviour without touching logic.

export const STORAGE_KEY = "floor-designer.design.v1";

/** Tile coverage (0–1) at or above which a cell counts as a full tile. */
export const FULL_TILE_COVERAGE = 0.99;
/** Cells covered less than this are ignored (thin slivers are filled by the edge ramp). */
export const SLIVER_COVERAGE = 0.02;

export const MIN_WALL_MM = 100;
export const HISTORY_LIMIT = 100;

export const WASTE_OPTIONS = [0, 5, 10, 15];

export const ZOOM = { min: 0.01, max: 2.5, step: 1.2 };

/** Export image size in pixels. */
export const EXPORT = { width: 2400, height: 1500 };
