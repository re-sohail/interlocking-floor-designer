// Live quantities panel: floor size, tiles to order (per colour/surface), edges and spec.

import { el } from "../utils/dom.js";
import { derive } from "../state/derived.js";
import { getColor } from "../data/colors.js";
import { getSurface } from "../data/tiles.js";
import { formatLength, formatArea, formatTileSize } from "../geometry/units.js";
import { tileSwatch } from "../render/thumbnails.js";
import { reactive } from "./panels/shared.js";

export function mountSummary(root, { store }) {
  reactive(root, store, (d) => d, (container, d) => {
    const q = derive(d);
    const u = d.units;
    const row = (label, value) => el("div", { class: "kv" }, [el("span", {}, label), el("strong", {}, value)]);

    container.append(
      el("div", { class: "summary-hero" }, [
        el("span", { class: "hero-label" }, "Tiles to order"),
        el("span", { class: "hero-value" }, q.tiles.order.toLocaleString()),
        el("span", { class: "hero-sub" }, `${q.tiles.full} full · ${q.tiles.cut} cut · +${d.waste}% waste`),
      ]),
      block("Floor", [
        row("Size", `${formatLength(q.bbox.width, u)} × ${formatLength(q.bbox.height, u)}`),
        row("Tiled area", formatArea(q.area, u)),
        row("Perimeter", formatLength(q.perimeter, u)),
      ]),
      block(
        "Tiles by colour",
        el(
          "ul",
          { class: "breakdown" },
          q.tiles.byGroup.map((g) =>
            el("li", {}, [
              tileSwatch(g.surface, g.color, 28),
              el("span", { class: "bd-text" }, [el("strong", {}, getColor(g.color).name), el("small", {}, getSurface(g.surface).name)]),
              el("span", { class: "bd-qty" }, g.order.toLocaleString()),
            ])
          )
        )
      ),
      block("Edges & corners", [
        row("Loop edges", String(q.edges.loop)),
        row("Peg edges", String(q.edges.peg)),
        row("Corners", String(q.edges.corners.length)),
        row("Ramp colour", getColor(q.edgeColorId).name),
      ]),
      block("Tile spec", [
        row("Collection", q.collection.name),
        row("Surface", getSurface(d.surfaceId).name),
        row("Size", formatTileSize(q.size.pitchMm)),
        row("Thickness", `${q.size.thicknessMm} mm`),
      ])
    );
  });
}

function block(title, children) {
  return el("section", { class: "summary-block" }, [el("h3", { class: "panel-title" }, title), ...[].concat(children)]);
}
