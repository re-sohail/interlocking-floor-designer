// World (mm) ↔ screen (CSS px) transform with zoom-to-cursor and fit-to-view.

import { ZOOM } from "../config.js";

export class Camera {
  constructor() {
    this.scale = 0.1; // CSS px per mm
    this.x = 0; // screen position of world origin
    this.y = 0;
  }

  toScreen(p) {
    return { x: p.x * this.scale + this.x, y: p.y * this.scale + this.y };
  }

  toWorld(sx, sy) {
    return { x: (sx - this.x) / this.scale, y: (sy - this.y) / this.scale };
  }

  /** Fit a world bbox into a viewport, leaving `pad` px around it. */
  fit(bb, width, height, pad = 80) {
    const w = Math.max(bb.maxX - bb.minX, 1);
    const h = Math.max(bb.maxY - bb.minY, 1);
    this.scale = clamp(Math.min((width - pad * 2) / w, (height - pad * 2) / h), ZOOM.min, ZOOM.max);
    this.x = (width - w * this.scale) / 2 - bb.minX * this.scale;
    this.y = (height - h * this.scale) / 2 - bb.minY * this.scale;
  }

  zoomAt(sx, sy, factor) {
    const next = clamp(this.scale * factor, ZOOM.min, ZOOM.max);
    const k = next / this.scale;
    this.x = sx - (sx - this.x) * k;
    this.y = sy - (sy - this.y) * k;
    this.scale = next;
  }

  pan(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
