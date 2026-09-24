// Single source of truth.
//   design — the serialisable floor design (persisted + undoable)
//   ui     — transient editor state (active step, tool, brush, hover…)
// Every change produces a new design object, so derived data can be memoised by identity.

import { createHistory } from "./history.js";
import { HISTORY_LIMIT, STORAGE_KEY } from "../config.js";
import { getLayout } from "../data/layouts.js";
import { bbox } from "../geometry/polygon.js";
import { isValidRoom } from "../geometry/walls.js";

export function createDefaultDesign() {
  const room = getLayout("rectangle").build();
  return {
    version: 1,
    units: "metric",
    layoutId: "rectangle",
    room,
    exposed: room.map(() => true),
    gridOrigin: { x: 0, y: 0 },
    obstacles: [],
    collectionId: "garage-pro",
    surfaceId: "vented",
    sizeId: "400x19",
    patternId: "checker-border",
    slots: { A: "slate-grey", B: "pearl-grey", C: "jet-black" },
    text: "GARAGE",
    overrides: {},
    edgeColor: "jet-black",
    waste: 5,
    snapToTiles: false,
    showDims: true,
  };
}

/** Start the grid at the room's top-left corner. */
export function originFor(room) {
  const bb = bbox(room);
  return { x: bb.minX, y: bb.minY };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Array.isArray(data.room) || !isValidRoom(data.room)) return null;
    return { ...createDefaultDesign(), ...data };
  } catch {
    return null;
  }
}

let saveTimer = 0;
function save(design) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
    } catch {
      /* storage unavailable (private mode) — the app still works */
    }
  }, 300);
}

const clone = (v) => structuredClone(v);

export function createStore() {
  let design = load() || createDefaultDesign();
  let ui = {
    step: "room",
    tool: "select",
    target: "brush", // which colour the palette edits: "A" | "B" | "C" | "brush"
    brushColor: "racing-red",
    brushSurface: "", // "" = same as floor
    hoverWall: -1,
    hoverCell: null,
    selectedObstacle: null,
  };
  const history = createHistory(HISTORY_LIMIT);
  const listeners = new Set();
  let gestureStart = null;

  const notify = (kind) => listeners.forEach((fn) => fn({ design, ui, kind }));

  function apply(next, kind = "design") {
    design = next;
    save(design);
    notify(kind);
  }

  return {
    get design() {
      return design;
    },
    get ui() {
      return ui;
    },
    get canUndo() {
      return history.canUndo;
    },
    get canRedo() {
      return history.canRedo;
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    /** Recorded change: one undo step. `mutator` edits a draft copy. */
    update(mutator) {
      const draft = clone(design);
      mutator(draft);
      history.push(design);
      apply(draft);
    },

    /** Drag / paint strokes: many live updates, one undo step. */
    beginGesture() {
      gestureStart = design;
    },
    updateLive(mutator) {
      const draft = clone(design);
      mutator(draft);
      apply(draft);
    },
    endGesture() {
      if (gestureStart && gestureStart !== design) history.push(gestureStart);
      gestureStart = null;
      notify("design");
    },

    undo() {
      const prev = history.undo(design);
      if (prev) apply(prev);
    },
    redo() {
      const next = history.redo(design);
      if (next) apply(next);
    },

    setUi(patch) {
      ui = { ...ui, ...patch };
      notify("ui");
    },
  };
}
