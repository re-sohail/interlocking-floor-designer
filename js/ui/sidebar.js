// Canva-style navigation: a light icon rail + one detail panel that can collapse.

import { el, icon } from "../utils/dom.js";
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
  let collapsed = false;

  const railItems = STEPS.map((step) =>
    el(
      "button",
      {
        type: "button",
        class: "rail-btn",
        title: step.sub,
        "aria-controls": `step-${step.id}`,
        onclick: () => {
          if (store.ui.step === step.id) setCollapsed(!collapsed);
          else {
            setCollapsed(false);
            goTo(step.id);
          }
        },
      },
      [el("span", { class: "rail-icon" }, icon(step.icon)), el("span", { class: "rail-label" }, step.title)]
    )
  );

  const bodies = STEPS.map((step) => {
    const body = el("div", { class: "step-body", id: `step-${step.id}`, role: "region", "aria-label": step.title });
    step.mount(body, ctx);
    return body;
  });

  const title = el("h2", { class: "panel-heading" });
  const sub = el("p", { class: "panel-sub" });
  const scroller = el("div", { class: "step-scroll" }, bodies);
  const collapseTab = el(
    "button",
    { type: "button", class: "collapse-tab", "aria-label": "Hide panel", title: "Hide panel", onclick: () => setCollapsed(!collapsed) },
    icon("arrow-left-s-line")
  );

  root.append(
    el("nav", { class: "step-rail", "aria-label": "Design tools" }, railItems),
    el("div", { class: "step-panel" }, [el("header", { class: "panel-head" }, [title, sub]), scroller]),
    collapseTab
  );

  function goTo(id) {
    const step = STEPS.find((s) => s.id === id);
    store.setUi({ step: id, tool: step.tool, hoverWall: -1, hoverCell: null });
  }

  function setCollapsed(value) {
    collapsed = value;
    document.body.classList.toggle("panel-collapsed", value);
    collapseTab.setAttribute("aria-label", value ? "Show panel" : "Hide panel");
    collapseTab.title = value ? "Show panel" : "Hide panel";
    railItems.forEach((btn) => btn.setAttribute("aria-expanded", String(!value && btn.classList.contains("is-active"))));
  }

  let lastStep = null;
  store.subscribe(({ ui }) => {
    if (ui.step === lastStep) return;
    lastStep = ui.step;
    const i = STEPS.findIndex((s) => s.id === ui.step);
    railItems.forEach((btn, k) => {
      btn.classList.toggle("is-active", k === i);
      btn.setAttribute("aria-current", k === i ? "page" : "false");
    });
    bodies.forEach((body, k) => body.classList.toggle("is-open", k === i));
    title.textContent = STEPS[i].title;
    sub.textContent = STEPS[i].sub;
    scroller.scrollTop = 0;
  });
  goTo(store.ui.step);
}
