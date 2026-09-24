// Live quantities panel: tiles to order, floor stats, colour breakdown, edges and tile spec.

import { el, icon } from "../utils/dom.js";
import { derive } from "../state/derived.js";
import { getColor } from "../data/colors.js";
import { getSurface } from "../data/tiles.js";
import { formatLength, formatArea, formatTileSize } from "../geometry/units.js";
import { tileSwatch, surfaceThumb } from "../render/thumbnails.js";
import { reactive } from "./panels/shared.js";

export function mountSummary(root, { store }) {
  reactive(root, store, (d) => d, (container, d) => {
    const q = derive(d);
    const u = d.units;
    const total = Math.max(1, q.tiles.total);

    const pill = (label, value) => el("span", { class: "hero-pill" }, [el("strong", {}, value), el("small", {}, label)]);
    const stat = (iconName, label, value) =>
      el("div", { class: "stat" }, [
        el("span", { class: "stat-icon" }, icon(iconName)),
        el("strong", { class: "stat-value" }, value),
        el("span", { class: "stat-label" }, label),
      ]);
    const row = (label, value) => el("div", { class: "kv" }, [el("span", {}, label), el("strong", {}, value)]);

    container.append(
      el("div", { class: "summary-head" }, [
        el("h2", {}, "Summary"),
        el("span", { class: "live-badge" }, [el("span", { class: "live-dot" }), "Live"]),
      ]),

      el("div", { class: "summary-hero" }, [
        el("span", { class: "hero-label" }, "Tiles to order"),
        el("span", { class: "hero-value" }, q.tiles.order.toLocaleString()),
        el("div", { class: "hero-pills" }, [
          pill("Full", String(q.tiles.full)),
          pill("Cut", String(q.tiles.cut)),
          pill("Waste", `+${d.waste}%`),
        ]),
      ]),

      card("Floor", "ruler-2-line", [
        el("div", { class: "stat-grid" }, [
          stat("drag-move-2-line", "Size", `${formatLength(q.bbox.width, u)} × ${formatLength(q.bbox.height, u)}`),
          stat("square-line", "Tiled area", formatArea(q.area, u)),
          stat("shape-line", "Perimeter", formatLength(q.perimeter, u)),
        ]),
      ]),

      card("Tiles by colour", "palette-line", [
        el(
          "ul",
          { class: "breakdown" },
          q.tiles.byGroup.map((g) => {
            const hex = getColor(g.color).hex;
            return el("li", {}, [
              tileSwatch(g.surface, g.color, 32),
              el("span", { class: "bd-text" }, [
                el("span", { class: "bd-line" }, [
                  el("strong", {}, getColor(g.color).name),
                  el("span", { class: "bd-qty" }, g.order.toLocaleString()),
                ]),
                el("small", {}, `${getSurface(g.surface).name} · ${Math.round((g.count / total) * 100)}%`),
                el("span", { class: "bd-bar" }, el("span", { style: { width: `${(g.count / total) * 100}%`, background: hex } })),
              ]),
            ]);
          })
        ),
      ]),

      card("Edges & corners", "shape-2-line", [
        el("div", { class: "stat-grid stat-grid-3" }, [
          stat("arrow-left-right-line", "Loop", String(q.edges.loop)),
          stat("arrow-up-down-line", "Peg", String(q.edges.peg)),
          stat("corner-down-right-line", "Corners", String(q.edges.corners.length)),
        ]),
        el("div", { class: "kv kv-color" }, [
          el("span", {}, "Ramp colour"),
          el("strong", {}, [el("span", { class: "color-dot", style: { background: q.edgeHex } }), getColor(q.edgeColorId).name]),
        ]),
      ]),

      card("Tile spec", "layout-grid-line", [
        el("div", { class: "spec-head" }, [
          surfaceThumb(d.surfaceId, d.slots.A, 52),
          el("span", { class: "spec-title" }, [el("strong", {}, q.collection.name), el("small", {}, getSurface(d.surfaceId).name)]),
        ]),
        row("Size", formatTileSize(q.size.pitchMm)),
        row("Thickness", `${q.size.thicknessMm} mm`),
      ]),

      el("p", { class: "summary-note" }, [icon("information-line"), "Cut tiles are counted as whole tiles."])
    );
  });
}

function card(title, iconName, children) {
  return el("section", { class: "summary-card" }, [
    el("h3", { class: "card-title" }, [icon(iconName), title]),
    ...children,
  ]);
}
