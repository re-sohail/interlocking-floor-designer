// Step 5 — edge ramps per wall, ramp colour and waste allowance.

import { el } from "../../utils/dom.js";
import { luminance } from "../../utils/color.js";
import { getColor } from "../../data/colors.js";
import { EDGE_COLORS, MATCH_FLOOR } from "../../data/edges.js";
import { walls } from "../../geometry/polygon.js";
import { formatLength } from "../../geometry/units.js";
import { WASTE_OPTIONS } from "../../config.js";
import { reactive, section, toggle, segmented } from "./shared.js";

export function mountEdgesPanel(container, { store, actions }) {
  reactive(
    container,
    store,
    (d) => JSON.stringify([d.room, d.exposed, d.edgeColor, d.slots.A, d.waste, d.units]),
    (root, d) => {
      const swatch = (id, label, hex) =>
        el("button", {
          type: "button",
          class: `swatch${d.edgeColor === id ? " is-active" : ""}${luminance(hex) > 0.45 ? " is-light" : ""}`,
          style: { background: hex },
          title: label,
          "aria-label": label,
          "aria-pressed": String(d.edgeColor === id),
          onclick: () => actions.setEdgeColor(id),
        });

      root.append(
        section(
          "Edge ramps",
          [
            el("div", { class: "btn-row" }, [
              el("button", { type: "button", class: "btn btn-ghost", onclick: () => actions.setAllWalls(true) }, "All walls"),
              el("button", { type: "button", class: "btn btn-ghost", onclick: () => actions.setAllWalls(false) }, "None"),
            ]),
            el(
              "div",
              { class: "wall-list" },
              walls(d.room).map((w) =>
                el(
                  "div",
                  {
                    class: "wall-row",
                    onmouseenter: () => store.setUi({ hoverWall: w.index }),
                    onmouseleave: () => store.setUi({ hoverWall: -1 }),
                  },
                  [
                    el("span", { class: "wall-badge" }, String(w.index + 1)),
                    el("span", { class: "wall-dir" }, formatLength(w.length, d.units)),
                    toggle(d.exposed[w.index] !== false ? "Ramp" : "Wall", d.exposed[w.index] !== false, () => actions.toggleWall(w.index)),
                  ]
                )
              )
            ),
          ],
          "Open sides need a ramp. Sides against a wall don't. You can also click a wall on the plan."
        ),
        section(
          "Ramp colour",
          el("div", { class: "palette" }, [
            el("button", {
              type: "button",
              class: `swatch swatch-match${d.edgeColor === MATCH_FLOOR ? " is-active" : ""}`,
              style: { background: getColor(d.slots.A).hex },
              title: "Match main colour",
              "aria-label": "Match main colour",
              onclick: () => actions.setEdgeColor(MATCH_FLOOR),
            }),
            ...EDGE_COLORS.map((id) => swatch(id, getColor(id).name, getColor(id).hex)),
          ])
        ),
        section(
          "Waste allowance",
          segmented(
            WASTE_OPTIONS.map((v) => ({ value: v, label: `${v}%` })),
            d.waste,
            (v) => actions.setWaste(v),
            "Waste allowance"
          ),
          "Extra tiles for cutting mistakes and future repairs."
        )
      );
    }
  );
}
