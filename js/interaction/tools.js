// Canvas tools. Each tool gets pointer events already converted to screen + world coords:
//   ev = { sx, sy, world, shift }
// and returns nothing; they change the design through the store / actions.

import { derive } from "../state/derived.js";
import { cellKey } from "../geometry/tiling.js";
import { distanceToSegment, pointInPolygon, isHorizontal } from "../geometry/polygon.js";
import { moveWall, wallCoord, snap } from "../geometry/walls.js";
import { pointInObstacle } from "../geometry/obstacles.js";
import { snapStep } from "../geometry/units.js";

export const TOOL_LIST = [
  { id: "select", name: "Select & reshape", icon: "cursor-line", key: "V" },
  { id: "paint", name: "Paint tiles", icon: "brush-line", key: "P" },
  { id: "fill", name: "Fill area", icon: "paint-fill", key: "F" },
  { id: "pick", name: "Pick colour", icon: "sip-line", key: "I" },
  { id: "erase", name: "Erase paint", icon: "eraser-line", key: "E" },
  { id: "edge", name: "Toggle edge ramps", icon: "shape-line", key: "G" },
  { id: "pan", name: "Pan", icon: "hand", key: "H" },
];

export function createTools({ store, actions, camera, requestRender, getHits, openDimEditor }) {
  const design = () => store.design;

  // ---------- hit testing ----------
  function wallAt(world) {
    const tol = 10 / camera.scale;
    const room = design().room;
    let best = -1;
    let bestDist = tol;
    room.forEach((a, i) => {
      const dd = distanceToSegment(world, a, room[(i + 1) % room.length]);
      if (dd < bestDist) {
        bestDist = dd;
        best = i;
      }
    });
    return best;
  }

  function obstacleAt(world) {
    const list = design().obstacles;
    for (let i = list.length - 1; i >= 0; i--) if (pointInObstacle(world, list[i])) return list[i];
    return null;
  }

  function cellAt(world) {
    const d = design();
    if (!pointInPolygon(world, d.room) || obstacleAt(world)) return null;
    const { grid } = derive(d);
    const c = Math.floor((world.x - grid.origin.x) / grid.pitch);
    const r = Math.floor((world.y - grid.origin.y) / grid.pitch);
    return grid.index.get(cellKey(c, r)) || null;
  }

  function dimAt(ev) {
    return getHits().dims.find((h) => ev.sx >= h.x && ev.sx <= h.x + h.w && ev.sy >= h.y && ev.sy <= h.y + h.h);
  }

  function resizeHandleAt(ev) {
    const ob = design().obstacles.find((o) => o.id === store.ui.selectedObstacle);
    if (!ob) return null;
    const p = camera.toScreen({ x: ob.x + ob.w, y: ob.y + ob.h });
    return Math.hypot(ev.sx - p.x, ev.sy - p.y) < 10 ? ob : null;
  }

  const step = () => snapStep(design().units);

  // ---------- painting helpers ----------
  function paintCell(cell, erase) {
    const key = cellKey(cell.c, cell.r);
    const current = design().overrides[key];
    const { brushColor, brushSurface } = store.ui;
    if (erase) {
      if (!current) return;
      store.updateLive((d) => void delete d.overrides[key]);
      return;
    }
    if (current && current.color === brushColor && (current.surface || "") === brushSurface) return;
    store.updateLive((d) => {
      d.overrides[key] = brushSurface ? { color: brushColor, surface: brushSurface } : { color: brushColor };
    });
  }

  /** Paint along the segment between two world points so fast drags leave no gaps. */
  function paintStroke(from, to, erase) {
    const pitch = derive(design()).grid.pitch;
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(len / (pitch / 3)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const cell = cellAt({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
      if (cell) paintCell(cell, erase);
    }
  }

  function floodFill(start) {
    const { grid } = derive(design());
    const same = (c) => c && c.color === start.color && c.surface === start.surface;
    const { brushColor, brushSurface } = store.ui;
    const seen = new Set([cellKey(start.c, start.r)]);
    const queue = [start];
    for (let i = 0; i < queue.length; i++) {
      const { c, r } = queue[i];
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = cellKey(c + dc, r + dr);
        if (seen.has(k)) continue;
        seen.add(k);
        const next = grid.index.get(k);
        if (same(next)) queue.push(next);
      }
    }
    store.update((d) => {
      for (const cell of queue) {
        d.overrides[cellKey(cell.c, cell.r)] = brushSurface ? { color: brushColor, surface: brushSurface } : { color: brushColor };
      }
    });
  }

  // ---------- tools ----------
  let gesture = null;

  const panGesture = (ev) => ({ kind: "pan", lastX: ev.sx, lastY: ev.sy });
  function continuePan(ev) {
    camera.pan(ev.sx - gesture.lastX, ev.sy - gesture.lastY);
    gesture.lastX = ev.sx;
    gesture.lastY = ev.sy;
    requestRender();
  }

  const select = {
    cursor(ev) {
      if (wallAt(ev.world) < 0 && dimAt(ev)) return "text";
      if (resizeHandleAt(ev)) return "nwse-resize";
      if (obstacleAt(ev.world)) return "move";
      const w = wallAt(ev.world);
      if (w >= 0) {
        const room = design().room;
        return isHorizontal(room[w], room[(w + 1) % room.length]) ? "ns-resize" : "ew-resize";
      }
      return "grab";
    },
    hover(ev) {
      const w = obstacleAt(ev.world) ? -1 : wallAt(ev.world);
      if (w !== store.ui.hoverWall) store.setUi({ hoverWall: w });
    },
    down(ev) {
      const dim = wallAt(ev.world) < 0 && dimAt(ev);
      if (dim) {
        openDimEditor(dim.index, dim);
        return;
      }
      const resizing = resizeHandleAt(ev);
      if (resizing) {
        store.beginGesture();
        gesture = { kind: "resize", id: resizing.id, start: { ...resizing }, world: ev.world };
        return;
      }
      const ob = obstacleAt(ev.world);
      if (ob) {
        store.setUi({ selectedObstacle: ob.id });
        store.beginGesture();
        gesture = { kind: "move", id: ob.id, start: { ...ob }, world: ev.world };
        return;
      }
      const w = wallAt(ev.world);
      if (w >= 0) {
        const room = design().room;
        store.beginGesture();
        gesture = {
          kind: "wall",
          index: w,
          startPts: room,
          startCoord: wallCoord(room, w),
          horizontal: isHorizontal(room[w], room[(w + 1) % room.length]),
          world: ev.world,
        };
        return;
      }
      if (store.ui.selectedObstacle) store.setUi({ selectedObstacle: null });
      gesture = panGesture(ev);
    },
    move(ev) {
      if (!gesture) return;
      if (gesture.kind === "pan") return continuePan(ev);
      const dx = ev.world.x - gesture.world.x;
      const dy = ev.world.y - gesture.world.y;
      if (gesture.kind === "wall") {
        const d = design();
        const raw = gesture.startCoord + (gesture.horizontal ? dy : dx);
        const { grid } = derive(d);
        const target = d.snapToTiles
          ? snap(raw, grid.pitch, gesture.horizontal ? grid.origin.y : grid.origin.x)
          : snap(raw, step());
        const next = moveWall(gesture.startPts, gesture.index, target - gesture.startCoord);
        if (next) store.updateLive((draft) => void (draft.room = next));
      } else if (gesture.kind === "move") {
        const { id, start } = gesture;
        store.updateLive((d) => {
          const ob = d.obstacles.find((o) => o.id === id);
          if (ob) {
            ob.x = snap(start.x + dx, step());
            ob.y = snap(start.y + dy, step());
          }
        });
      } else if (gesture.kind === "resize") {
        const { id, start } = gesture;
        store.updateLive((d) => {
          const ob = d.obstacles.find((o) => o.id === id);
          if (ob) {
            ob.w = Math.max(100, snap(start.w + dx, step()));
            ob.h = Math.max(100, snap(start.h + dy, step()));
          }
        });
      }
    },
    up() {
      if (gesture && gesture.kind !== "pan") store.endGesture();
      gesture = null;
    },
  };

  const brushTool = (erase) => ({
    cursor: (ev) => (cellAt(ev.world) ? "crosshair" : "default"),
    hover(ev) {
      const cell = cellAt(ev.world);
      if (cell !== store.ui.hoverCell) store.setUi({ hoverCell: cell });
    },
    down(ev) {
      const cell = cellAt(ev.world);
      if (!cell) {
        gesture = panGesture(ev);
        return;
      }
      store.beginGesture();
      gesture = { kind: "paint", last: ev.world };
      paintCell(cell, erase);
    },
    move(ev) {
      if (!gesture) return;
      if (gesture.kind === "pan") return continuePan(ev);
      paintStroke(gesture.last, ev.world, erase);
      gesture.last = ev.world;
      this.hover(ev);
    },
    up() {
      if (gesture?.kind === "paint") store.endGesture();
      gesture = null;
    },
  });

  const clickTool = (onCell) => ({
    cursor: (ev) => (cellAt(ev.world) ? "crosshair" : "default"),
    hover(ev) {
      const cell = cellAt(ev.world);
      if (cell !== store.ui.hoverCell) store.setUi({ hoverCell: cell });
    },
    down(ev) {
      const cell = cellAt(ev.world);
      if (cell) onCell(cell);
      else gesture = panGesture(ev);
    },
    move(ev) {
      if (gesture?.kind === "pan") continuePan(ev);
    },
    up() {
      gesture = null;
    },
  });

  const edge = {
    cursor: (ev) => (wallAt(ev.world) >= 0 ? "pointer" : "grab"),
    hover(ev) {
      const w = wallAt(ev.world);
      if (w !== store.ui.hoverWall) store.setUi({ hoverWall: w });
    },
    down(ev) {
      const w = wallAt(ev.world);
      if (w >= 0) actions.toggleWall(w);
      else gesture = panGesture(ev);
    },
    move(ev) {
      if (gesture?.kind === "pan") continuePan(ev);
    },
    up() {
      gesture = null;
    },
  };

  const pan = {
    cursor: () => (gesture ? "grabbing" : "grab"),
    hover() {},
    down(ev) {
      gesture = panGesture(ev);
    },
    move(ev) {
      if (gesture) continuePan(ev);
    },
    up() {
      gesture = null;
    },
  };

  return {
    select,
    paint: brushTool(false),
    erase: brushTool(true),
    fill: clickTool(floodFill),
    pick: clickTool((cell) => {
      store.setUi({
        brushColor: cell.color,
        brushSurface: cell.surface !== design().surfaceId ? cell.surface : "",
        target: "brush",
        tool: "paint",
      });
    }),
    edge,
    pan,
    /** Abort any in-progress gesture (e.g. when a second finger lands). */
    cancel() {
      if (gesture && gesture.kind !== "pan") store.endGesture();
      gesture = null;
    },
  };
}
