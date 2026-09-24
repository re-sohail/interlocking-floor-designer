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
    const row = (label, value) => el("div", { class: "kv" }, [el("span", {}, label), el("strong", {}, value)]);
    const stat = (label, value) => el("div", { class: "stat" }, [el("strong", {}, value), el("span", {}, label)]);

    container.append(
      el("h2", { class: "summary-title" }, "Summary"),

      block(null, [
        el("span", { class: "total-label" }, "Tiles to order"),
        el("span", { class: "total-value" }, q.tiles.order.toLocaleString()),
        el("span", { class: "total-sub" }, `${q.tiles.full} full · ${q.tiles.cut} cut · +${d.waste}% waste`),
      ]),

      block("Floor", [
        row("Size", `${formatLength(q.bbox.width, u)} × ${formatLength(q.bbox.height, u)}`),
        row("Tiled area", formatArea(q.area, u)),
        row("Perimeter", formatLength(q.perimeter, u)),
      ]),

      block("Tiles by colour", [
        el(
          "ul",
          { class: "breakdown" },
          q.tiles.byGroup.map((g) =>
            el("li", {}, [
              tileSwatch(g.surface, g.color, 32),
              el("span", { class: "bd-text" }, [
                el("span", { class: "bd-line" }, [
                  el("strong", {}, getColor(g.color).name),
                  el("span", { class: "bd-qty" }, g.order.toLocaleString()),
                ]),
                el("small", {}, `${getSurface(g.surface).name} · ${Math.round((g.count / total) * 100)}%`),
                el("span", { class: "bd-bar" }, el("span", { style: { width: `${(g.count / total) * 100}%`, background: getColor(g.color).hex } })),
              ]),
            ])
          )
        ),
      ]),

      block("Edges & corners", [
        el("div", { class: "stat-grid" }, [
          stat("Loop edges", String(q.edges.loop)),
          stat("Peg edges", String(q.edges.peg)),
          stat("Corners", String(q.edges.corners.length)),
        ]),
        el("div", { class: "kv" }, [
          el("span", {}, "Ramp colour"),
          el("strong", {}, [el("span", { class: "color-dot", style: { background: q.edgeHex } }), getColor(q.edgeColorId).name]),
        ]),
      ]),

      block("Tile spec", [
        el("div", { class: "spec-head" }, [
          surfaceThumb(d.surfaceId, d.slots.A, 44),
          el("span", { class: "spec-title" }, [el("strong", {}, q.collection.name), el("small", {}, getSurface(d.surfaceId).name)]),
        ]),
        row("Size", formatTileSize(q.size.pitchMm)),
        row("Thickness", `${q.size.thicknessMm} mm`),
      ]),

      el("p", { class: "summary-note" }, [icon("information-line"), "Cut tiles are counted as whole tiles."])
    );
  });
}

function block(title, children) {
  return el("section", { class: "summary-block" }, [title ? el("h3", { class: "block-title" }, title) : null, ...children]);
}
