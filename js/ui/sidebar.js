// Guided step accordion with Back / Next.

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
  const items = STEPS.map((step, i) => {
    const body = el("div", { class: "step-body", id: `step-${step.id}`, role: "region" });
    step.mount(body, ctx);
    const header = el(
      "button",
      {
        type: "button",
        class: "step-header",
        "aria-controls": `step-${step.id}`,
        onclick: () => goTo(step.id),
      },
      [
        el("span", { class: "step-num" }, String(i + 1)),
        el("span", { class: "step-icon" }, icon(step.icon)),
        el("span", { class: "step-text" }, [el("strong", {}, step.title), el("small", {}, step.sub)]),
        el("span", { class: "step-arrow" }, icon("arrow-down-s-line")),
      ]
    );
    const item = el("div", { class: "step", dataset: { step: step.id } }, [header, body]);
    return { step, item, header };
  });

  const back = el("button", { type: "button", class: "btn btn-ghost", onclick: () => move(-1) }, [icon("arrow-left-line"), "Back"]);
  const next = el("button", { type: "button", class: "btn btn-primary", onclick: () => move(1) }, ["Next", icon("arrow-right-line")]);

  root.append(el("div", { class: "steps" }, items.map((x) => x.item)), el("div", { class: "sidebar-footer" }, [back, next]));

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
    items.forEach(({ step, item, header }) => {
      const open = step.id === ui.step;
      item.classList.toggle("is-open", open);
      item.classList.toggle("is-done", STEPS.indexOf(step) < i);
      header.setAttribute("aria-expanded", String(open));
    });
    back.disabled = i === 0;
    next.replaceChildren(...(i === STEPS.length - 1 ? [icon("download-2-line"), "Download design"] : ["Next", icon("arrow-right-line")]));
    items[i]?.item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  goTo(store.ui.step);
}
