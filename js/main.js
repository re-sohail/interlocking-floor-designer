// App bootstrap: store → canvas renderer → interaction → UI.

import { createStore } from "./state/store.js";
import { createActions } from "./state/actions.js";
import { derive } from "./state/derived.js";
import { Camera } from "./render/camera.js";
import { renderScene } from "./render/scene.js";
import { createTools, TOOL_LIST } from "./interaction/tools.js";
import { attachPointer } from "./interaction/pointer.js";
import { mountSidebar } from "./ui/sidebar.js";
import { mountSummary } from "./ui/summary.js";
import { mountTopbar, mountToolDock } from "./ui/toolbar.js";
import { createDimensionEditor } from "./ui/dimensionEditor.js";
import { downloadDesign } from "./export/exportImage.js";
import { ZOOM } from "./config.js";
import { $, isTyping } from "./utils/dom.js";

const store = createStore();
const camera = new Camera();
const stage = $("#stage");
const canvas = $("#plan");
const ctx = canvas.getContext("2d");
let viewport = { w: 0, h: 0, dpr: 1 };
let hits = { dims: [] };
let queued = false;

const view = {
  fit() {
    camera.fit(derive(store.design).bbox, viewport.w, viewport.h, Math.min(110, viewport.w * 0.12));
    requestRender();
  },
  zoom(factor) {
    camera.zoomAt(viewport.w / 2, viewport.h / 2, factor);
    requestRender();
  },
};

function requestRender() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(draw);
}

function draw() {
  queued = false;
  if (!viewport.w) return;
  ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
  hits = renderScene(ctx, {
    design: store.design,
    derived: derive(store.design),
    camera,
    width: viewport.w,
    height: viewport.h,
    dpr: viewport.dpr,
    ui: store.ui,
  });
  // 100% ≈ the size that fits the room on screen.
  topbar.setZoom(camera.scale * 1000);
}

// Keep the canvas backing store matched to its CSS size × devicePixelRatio (crisp on Retina).
let fitted = false;
new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  viewport = { w: width, h: height, dpr };
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  if (!fitted && width > 0) {
    fitted = true;
    view.fit();
  }
  requestRender();
}).observe(stage);

const actions = createActions(store, { onRoomReplaced: () => requestAnimationFrame(() => view.fit()) });
const dimEditor = createDimensionEditor(stage, { store, actions });
const tools = createTools({
  store,
  actions,
  camera,
  requestRender,
  getHits: () => hits,
  openDimEditor: (index, rect) => dimEditor.open(index, rect),
});
attachPointer(canvas, { camera, tools, store, requestRender });

let downloading = false;
async function onDownload() {
  if (downloading) return;
  downloading = true;
  document.body.classList.add("is-busy");
  try {
    await downloadDesign(store.design);
  } finally {
    downloading = false;
    document.body.classList.remove("is-busy");
  }
}

const topbar = mountTopbar($("#topbar"), { store, actions, view, onDownload });
mountToolDock($("#toolDock"), { store });
mountSidebar($("#sidebar"), { store, actions });
mountSummary($("#summary"), { store });

store.subscribe(({ ui }) => {
  document.body.dataset.tool = ui.tool;
  requestRender();
});

// Keyboard shortcuts
window.addEventListener("keydown", (e) => {
  if (isTyping(e)) return;
  const mod = e.metaKey || e.ctrlKey;
  const key = e.key.toLowerCase();
  if (mod && key === "z") {
    e.preventDefault();
    e.shiftKey ? store.redo() : store.undo();
    return;
  }
  if (mod && key === "y") {
    e.preventDefault();
    store.redo();
    return;
  }
  if (mod) return;
  if (key === "+" || key === "=") view.zoom(ZOOM.step);
  else if (key === "-" || key === "_") view.zoom(1 / ZOOM.step);
  else if (key === "0") view.fit();
  else if ((key === "delete" || key === "backspace") && store.ui.selectedObstacle) {
    actions.removeObstacle(store.ui.selectedObstacle);
  } else if (key === "escape") {
    store.setUi({ selectedObstacle: null });
  } else {
    const tool = TOOL_LIST.find((t) => t.key.toLowerCase() === key);
    if (tool) store.setUi({ tool: tool.id });
  }
});

requestRender();
