// Guided steps: a dark icon rail + one step panel with progress, Back / Next.

import { el, icon, $ } from "../utils/dom.js";
import { mountRoomPanel } from "./panels/room.js";
import { mountTilesPanel } from "./panels/tiles.js";
import { mountPatternPanel } from "./panels/pattern.js";
import { mountColorsPanel } from "./panels/colors.js";
import { mountEdgesPanel } from "./panels/edges.js";

export const STEPS = [
  { id: "room", title: "Room", sub: "Shape, size & obstacles", icon: "layout-4-line", mount: mountRoomPanel, tool: "select" },
  { id: "tiles", title: "Tiles", sub: "Collection, surface & size", icon: "layout-grid-line", mount: mountTilesPanel, tool: "select" },
  { id: "pattern", title: "Pattern", sub: "Layout presets", icon: "grid-line", mount: mountPatternPanel, tool: "select" },
  { id: "colors", title: "Colours", sub: "Recolour & paint tiles", icon: "palette-line", mount: mountColorsPanel, tool: "paint" },
  { id: "edges", title: "Edges", sub: "Ramps, corners & waste", icon: "shape-line", mount: mountEdgesPanel, tool: "edge" },
];

export function mountSidebar(root, ctx) {
  const { store } = ctx;

  const railItems = STEPS.map((step, i) =>
    el(
      "button",
      {
        type: "button",
        class: "rail-btn",
        title: `${i + 1}. ${step.title} — ${step.sub}`,
        "aria-controls": `step-${step.id}`,
        onclick: () => goTo(step.id),
      },
      [
        el("span", { class: "rail-icon" }, [icon(step.icon), el("span", { class: "rail-check" }, icon("check-line"))]),
        el("span", { class: "rail-label" }, step.title),
      ]
    )
  );

  const bodies = STEPS.map((step) => {
    const body = el("div", { class: "step-body", id: `step-${step.id}`, role: "region", "aria-label": step.title });
    step.mount(body, ctx);
    return body;
  });

  const eyebrow = el("span", { class: "panel-eyebrow" });
  const title = el("h2", { class: "panel-heading" });
  const sub = el("p", { class: "panel-sub" });
  const progress = el("span", { class: "progress-fill" });
  const scroller = el("div", { class: "step-scroll" }, bodies);

  const back = el("button", { type: "button", class: "btn btn-ghost", onclick: () => move(-1) }, [icon("arrow-left-line"), "Back"]);
  const next = el("button", { type: "button", class: "btn btn-primary", onclick: () => move(1) }, ["Next", icon("arrow-right-line")]);

  root.append(
    el("nav", { class: "step-rail", "aria-label": "Steps" }, [el("div", { class: "rail-track" }, railItems)]),
    el("div", { class: "step-panel" }, [
      el("header", { class: "panel-head" }, [
        eyebrow,
        title,
        sub,
        el("span", { class: "progress", "aria-hidden": "true" }, progress),
      ]),
      scroller,
      el("footer", { class: "sidebar-footer" }, [back, next]),
    ])
  );

  function goTo(id) {
    const step = STEPS.find((s) => s.id === id);
    store.setUi({ step: id, tool: step.tool, hoverWall: -1, hoverCell: null });
  }

  function move(delta) {
    const i = STEPS.findIndex((s) => s.id === store.ui.step);
    const target = STEPS[i + delta];
    if (target) goTo(target.id);
    else if (delta > 0) $("#downloadBtn")?.click();
  }

  let lastStep = null;
  store.subscribe(({ ui }) => {
    if (ui.step === lastStep) return;
    lastStep = ui.step;
    const i = STEPS.findIndex((s) => s.id === ui.step);
    const step = STEPS[i];
    railItems.forEach((btn, k) => {
      btn.classList.toggle("is-active", k === i);
      btn.classList.toggle("is-done", k < i);
      btn.setAttribute("aria-current", k === i ? "step" : "false");
    });
    bodies.forEach((body, k) => body.classList.toggle("is-open", k === i));
    eyebrow.textContent = `Step ${i + 1} of ${STEPS.length}`;
    title.textContent = step.title;
    sub.textContent = step.sub;
    progress.style.width = `${((i + 1) / STEPS.length) * 100}%`;
    root.style.setProperty("--rail-progress", String(i / (STEPS.length - 1)));
    back.disabled = i === 0;
    next.replaceChildren(...(i === STEPS.length - 1 ? [icon("download-2-line"), "Download design"] : ["Next", icon("arrow-right-line")]));
    scroller.scrollTop = 0;
  });
  goTo(store.ui.step);
}
