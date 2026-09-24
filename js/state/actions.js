// Named design operations used by both the sidebar panels and the canvas tools.

import { getLayout } from "../data/layouts.js";
import { getCollection, getSize } from "../data/collections.js";
import { setWallLength as resizeWall } from "../geometry/walls.js";
import { createObstacle } from "../geometry/obstacles.js";
import { bbox } from "../geometry/polygon.js";
import { originFor, createDefaultDesign } from "./store.js";

export function createActions(store, { onRoomReplaced = () => {} } = {}) {
  const pitchOf = (d) => getSize(getCollection(d.collectionId), d.sizeId).pitchMm;

  return {
    setLayout(id) {
      const room = getLayout(id).build();
      store.update((d) => {
        d.layoutId = id;
        d.room = room;
        d.exposed = room.map(() => true);
        d.gridOrigin = originFor(room);
        d.overrides = {};
        d.obstacles = [];
      });
      store.setUi({ selectedObstacle: null, hoverWall: -1 });
      onRoomReplaced();
    },

    /** Returns false if the new length would make an invalid room. */
    setWallLength(index, mm) {
      if (!(mm > 0)) return false;
      const next = resizeWall(store.design.room, index, mm);
      if (!next) return false;
      store.update((d) => {
        d.room = next;
      });
      return true;
    },

    toggleWall(index) {
      store.update((d) => {
        d.exposed[index] = d.exposed[index] === false;
      });
    },

    setAllWalls(exposed) {
      store.update((d) => {
        d.exposed = d.room.map(() => exposed);
      });
    },

    setUnits(units) {
      if (store.design.units !== units) store.update((d) => void (d.units = units));
    },

    setCollection(id) {
      const col = getCollection(id);
      store.update((d) => {
        const before = pitchOf(d);
        d.collectionId = col.id;
        if (!col.surfaces.includes(d.surfaceId)) d.surfaceId = col.surfaces[0];
        d.sizeId = col.sizes[0].id;
        if (pitchOf(d) !== before) d.overrides = {};
      });
    },

    setSurface(id) {
      store.update((d) => void (d.surfaceId = id));
    },

    setSize(id) {
      store.update((d) => {
        const before = pitchOf(d);
        d.sizeId = id;
        if (pitchOf(d) !== before) d.overrides = {};
      });
    },

    setPattern(id) {
      store.update((d) => void (d.patternId = id));
    },

    setText(text) {
      store.update((d) => void (d.text = text.toUpperCase()));
    },

    setSlot(slot, colorId) {
      store.update((d) => void (d.slots[slot] = colorId));
    },

    setEdgeColor(id) {
      store.update((d) => void (d.edgeColor = id));
    },

    setWaste(pct) {
      store.update((d) => void (d.waste = pct));
    },

    setSnapToTiles(on) {
      store.update((d) => void (d.snapToTiles = on));
    },

    setShowDims(on) {
      store.update((d) => void (d.showDims = on));
    },

    clearPaint() {
      store.update((d) => void (d.overrides = {}));
    },

    addObstacle(type) {
      const bb = bbox(store.design.room);
      const ob = createObstacle(type, { x: (bb.minX + bb.maxX) / 2, y: (bb.minY + bb.maxY) / 2 });
      store.update((d) => void d.obstacles.push(ob));
      store.setUi({ selectedObstacle: ob.id });
    },

    updateObstacle(id, patch) {
      store.update((d) => {
        const ob = d.obstacles.find((o) => o.id === id);
        if (ob) Object.assign(ob, patch);
      });
    },

    removeObstacle(id) {
      store.update((d) => void (d.obstacles = d.obstacles.filter((o) => o.id !== id)));
      if (store.ui.selectedObstacle === id) store.setUi({ selectedObstacle: null });
    },

    resetDesign() {
      const fresh = createDefaultDesign();
      fresh.units = store.design.units;
      store.update((d) => Object.assign(d, fresh));
      onRoomReplaced();
    },
  };
}
