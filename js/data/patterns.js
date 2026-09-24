// Pattern presets as pure functions of the tile grid.
//
//   rule(c, r, W, H, p) → "A" | "B" | "C" | { slot?, color?, surface? }
//
// c, r   column/row inside the room's tile grid (0-based)
// W, H   grid size in tiles
// p.d    distance (in tiles) to the nearest room edge — 0 on the perimeter row.
//        It follows L/U shapes and obstacles, so borders wrap around them.
// p.pitch tile size in mm, p.text for the Text preset.
// Slots A/B/C are recoloured by the user (Main / Accent / Trim).

import { cellNoise } from "../utils/rng.js";
import { rasterizeText } from "./font5x7.js";

const checker = (c, r) => ((c + r) % 2 ? "B" : "A");

let textCache = { text: null, bitmap: null };
function bitmapFor(text) {
  if (textCache.text !== text) textCache = { text, bitmap: rasterizeText(text) };
  return textCache.bitmap;
}

export const PATTERNS = [
  { id: "solid", name: "Solid", slots: ["A"], rule: () => "A" },
  { id: "checker", name: "Checkerboard", slots: ["A", "B"], rule: checker },
  {
    id: "big-checker",
    name: "Big checker",
    slots: ["A", "B"],
    rule: (c, r) => ((Math.floor(c / 2) + Math.floor(r / 2)) % 2 ? "B" : "A"),
  },
  { id: "border", name: "Border", slots: ["A", "B"], rule: (c, r, W, H, p) => (p.d < 1 ? "B" : "A") },
  {
    id: "double-border",
    name: "Double border",
    slots: ["A", "B", "C"],
    rule: (c, r, W, H, p) => (p.d === 0 ? "B" : p.d === 1 ? "C" : "A"),
  },
  {
    id: "checker-border",
    name: "Checker + border",
    slots: ["A", "B", "C"],
    rule: (c, r, W, H, p) => (p.d < 1 ? "C" : checker(c, r)),
  },
  {
    id: "racing-stripes",
    name: "Racing stripes",
    slots: ["A", "B"],
    rule: (c, r, W) => {
      const m = Math.floor((W - 1) / 2);
      return c === m - 1 || c === m + 1 ? "B" : "A";
    },
  },
  {
    id: "parking-bays",
    name: "Parking bays",
    slots: ["A", "B"],
    rule: (c, r, W, H, p) => {
      const bay = Math.max(3, Math.round(2600 / p.pitch));
      if (r >= H - 2) return "A"; // drive lane at the front
      return c % (bay + 1) === bay && c < W - 1 ? "B" : "A";
    },
  },
  {
    id: "walkway",
    name: "Centre walkway",
    slots: ["A", "B", "C"],
    rule: (c, r, W, H, p) => {
      const half = Math.max(1, Math.round(1200 / p.pitch)) / 2;
      const off = Math.abs(c - (W - 1) / 2);
      return off < half ? "B" : off < half + 1 ? "C" : "A";
    },
  },
  {
    id: "showroom-pad",
    name: "Showroom pad",
    slots: ["A", "B", "C"],
    rule: (c, r, W, H) => {
      const k = Math.max(1, Math.floor(Math.min(W, H) / 4));
      const ch = Math.max(Math.abs(c - (W - 1) / 2), Math.abs(r - (H - 1) / 2));
      return ch <= k ? "B" : ch <= k + 1 ? "C" : "A";
    },
  },
  {
    id: "rings",
    name: "Graded rings",
    slots: ["A", "B", "C"],
    rule: (c, r, W, H, p) => ["C", "B", "A"][p.d % 3],
  },
  {
    id: "diagonal",
    name: "Diagonal stripes",
    slots: ["A", "B"],
    rule: (c, r) => ((c + r) % 4 === 0 ? "B" : "A"),
  },
  {
    id: "diamond",
    name: "Diamonds",
    slots: ["A", "B", "C"],
    rule: (c, r) => {
      const v = Math.abs((c % 6) - 2.5) + Math.abs((r % 6) - 2.5);
      return v <= 2 ? "B" : v === 3 ? "C" : "A";
    },
  },
  {
    id: "hazard",
    name: "Hazard ring",
    slots: ["A", "B", "C"],
    rule: (c, r, W, H, p) => (p.d === 1 ? ((c + r) % 2 ? "B" : "C") : "A"),
  },
  {
    id: "gym-zones",
    name: "Gym zones",
    slots: ["A", "B"],
    rule: (c, r, W, H) => {
      if (c < Math.round(W * 0.4)) return { slot: "B", surface: "rubber" };
      if (r >= H - 2) return { color: "turf-green", surface: "grass" };
      return "A";
    },
  },
  {
    id: "wash-bay",
    name: "Wash-bay drain",
    slots: ["A", "B"],
    rule: (c, r, W) => (c === Math.floor((W - 1) / 2) ? { slot: "B", surface: "vented" } : "A"),
  },
  {
    id: "random-mix",
    name: "Random mix",
    slots: ["A", "B", "C"],
    rule: (c, r) => {
      const v = cellNoise(c, r, 7);
      return v < 0.7 ? "A" : v < 0.9 ? "B" : "C";
    },
  },
  {
    id: "text",
    name: "Text / logo",
    slots: ["A", "B"],
    rule: (c, r, W, H, p) => {
      const bmp = bitmapFor(p.text || "");
      const x = c - Math.floor((W - bmp.width) / 2);
      const y = r - Math.floor((H - bmp.height) / 2);
      return bmp.rows[y] && bmp.rows[y][x] ? "B" : "A";
    },
  },
];

export const getPattern = (id) => PATTERNS.find((p) => p.id === id) || PATTERNS[0];

export const SLOT_LABELS = { A: "Main", B: "Accent", C: "Trim" };

/** Normalise a rule result to { slot, color, surface }. */
export function normalizeResult(result) {
  return typeof result === "string" ? { slot: result } : result || { slot: "A" };
}
