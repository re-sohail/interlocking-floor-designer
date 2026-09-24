// Unified mouse / pen / touch input for the plan canvas: routes events to the active tool,
// wheel + pinch zoom, middle-button or Space+drag panning.

export function attachPointer(canvas, { camera, tools, store, requestRender }) {
  const pointers = new Map();
  let pinch = null;
  let spaceDown = false;
  let tempPan = false;

  const toEvent = (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    return { sx, sy, world: camera.toWorld(sx, sy), shift: e.shiftKey };
  };

  const activeTool = () => (tempPan ? tools.pan : tools[store.ui.tool] || tools.select);

  function setCursor(ev) {
    canvas.style.cursor = spaceDown ? "grab" : activeTool().cursor(ev);
  }

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, toEvent(e));

    if (pointers.size === 2) {
      tools.cancel();
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.sx - b.sx, a.sy - b.sy), mid: { x: (a.sx + b.sx) / 2, y: (a.sy + b.sy) / 2 } };
      return;
    }
    tempPan = e.button === 1 || spaceDown;
    if (e.button === 2) return;
    activeTool().down(toEvent(e));
    e.preventDefault();
  });

  canvas.addEventListener("pointermove", (e) => {
    const ev = toEvent(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, ev);

    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.sx - b.sx, a.sy - b.sy);
      const mid = { x: (a.sx + b.sx) / 2, y: (a.sy + b.sy) / 2 };
      camera.pan(mid.x - pinch.mid.x, mid.y - pinch.mid.y);
      camera.zoomAt(mid.x, mid.y, dist / pinch.dist);
      pinch = { dist, mid };
      requestRender();
      return;
    }

    const tool = activeTool();
    if (pointers.size) tool.move(ev);
    else tool.hover(ev);
    setCursor(ev);
  });

  const end = (e) => {
    pointers.delete(e.pointerId);
    if (pinch) {
      if (pointers.size < 2) pinch = null;
      return;
    }
    activeTool().up(toEvent(e));
    tempPan = false;
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  canvas.addEventListener("pointerleave", () => {
    if (pointers.size) return;
    if (store.ui.hoverCell || store.ui.hoverWall >= 0) store.setUi({ hoverCell: null, hoverWall: -1 });
  });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      // Trackpad pinch arrives as ctrl+wheel with small deltas.
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      camera.zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
      requestRender();
    },
    { passive: false }
  );

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !spaceDown && e.target === document.body) {
      spaceDown = true;
      canvas.style.cursor = "grab";
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") spaceDown = false;
  });
}
