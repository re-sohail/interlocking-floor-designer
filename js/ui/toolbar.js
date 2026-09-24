// Top bar (units, undo/redo, zoom, dimensions, download) and the floating canvas tool dock.

import { el, icon } from "../utils/dom.js";
import { TOOL_LIST } from "../interaction/tools.js";
import { segmented } from "./panels/shared.js";
import { ZOOM } from "../config.js";

export function mountTopbar(root, { store, actions, view, onDownload }) {
  const units = el("div");
  const undo = iconButton("arrow-go-back-line", "Undo (Ctrl+Z)", () => store.undo());
  const redo = iconButton("arrow-go-forward-line", "Redo (Ctrl+Shift+Z)", () => store.redo());
  const zoomLabel = el("span", { class: "zoom-label", "aria-live": "polite" }, "100%");
  const dims = iconButton("ruler-line", "Show dimensions", () => actions.setShowDims(store.design.showDims === false));
  const summaryToggle = iconButton("file-list-3-line", "Show summary", () => document.body.classList.toggle("summary-open"));
  summaryToggle.classList.add("only-mobile");

  const download = el("button", { type: "button", class: "btn btn-primary", id: "downloadBtn", onclick: onDownload }, [
    icon("download-2-line"),
    el("span", { class: "hide-sm" }, "Download"),
  ]);

  root.append(
    el("div", { class: "brand" }, [el("span", { class: "brand-mark" }, icon("layout-grid-fill")), el("span", {}, "Floor Designer")]),
    el("div", { class: "topbar-group" }, [undo, redo]),
    el("div", { class: "topbar-group hide-sm" }, [
      iconButton("zoom-out-line", "Zoom out (−)", () => view.zoom(1 / ZOOM.step)),
      zoomLabel,
      iconButton("zoom-in-line", "Zoom in (+)", () => view.zoom(ZOOM.step)),
      iconButton("fullscreen-line", "Fit to screen (0)", () => view.fit()),
    ]),
    el("div", { class: "topbar-group" }, [dims]),
    el("div", { class: "topbar-spacer" }),
    units,
    summaryToggle,
    download
  );

  let lastUnits = null;
  store.subscribe(({ design }) => {
    undo.disabled = !store.canUndo;
    redo.disabled = !store.canRedo;
    dims.classList.toggle("is-active", design.showDims !== false);
    dims.setAttribute("aria-pressed", String(design.showDims !== false));
    if (design.units !== lastUnits) {
      lastUnits = design.units;
      units.replaceChildren(
        segmented(
          [
            { value: "metric", label: "m" },
            { value: "imperial", label: "ft" },
          ],
          design.units,
          (v) => actions.setUnits(v),
          "Units"
        )
      );
    }
  });

  return {
    setZoom(pct) {
      zoomLabel.textContent = `${Math.round(pct)}%`;
    },
  };
}

export function mountToolDock(root, { store }) {
  const buttons = TOOL_LIST.map((t) => {
    const b = iconButton(t.icon, `${t.name} (${t.key})`, () => store.setUi({ tool: t.id, target: t.id === "select" || t.id === "edge" || t.id === "pan" ? store.ui.target : "brush" }));
    b.dataset.tool = t.id;
    return b;
  });
  root.append(...buttons);
  store.subscribe(({ ui }) => {
    for (const b of buttons) {
      const on = b.dataset.tool === ui.tool;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    }
  });
}

function iconButton(name, label, onClick) {
  return el("button", { type: "button", class: "icon-btn", title: label, "aria-label": label, onclick: onClick }, icon(name));
}
