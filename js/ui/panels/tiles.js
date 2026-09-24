// Step 2 — collection, surface and tile size.

import { el, icon } from "../../utils/dom.js";
import { COLLECTIONS, getCollection } from "../../data/collections.js";
import { getSurface } from "../../data/tiles.js";
import { formatTileSize } from "../../geometry/units.js";
import { surfaceThumb } from "../../render/thumbnails.js";
import { reactive, section, optionCard } from "./shared.js";

export function mountTilesPanel(container, { store, actions }) {
  reactive(
    container,
    store,
    (d) => [d.collectionId, d.surfaceId, d.sizeId, d.slots.A].join("|"),
    (root, d) => {
      const col = getCollection(d.collectionId);
      root.append(
        section(
          "Collection",
          el(
            "div",
            { class: "collection-list" },
            COLLECTIONS.map((c) =>
              el(
                "button",
                {
                  type: "button",
                  class: `collection-item${c.id === col.id ? " is-active" : ""}`,
                  "aria-pressed": String(c.id === col.id),
                  onclick: () => actions.setCollection(c.id),
                },
                [
                  el("span", { class: "collection-icon" }, icon(c.icon)),
                  el("span", { class: "collection-text" }, [
                    el("strong", {}, c.name),
                    el("small", {}, c.tagline),
                  ]),
                ]
              )
            )
          )
        ),
        section(
          "Surface",
          el(
            "div",
            { class: "card-grid" },
            col.surfaces.map((id) => {
              const s = getSurface(id);
              return optionCard({
                preview: surfaceThumb(id, d.slots.A, 60),
                label: s.name,
                sub: s.note,
                active: d.surfaceId === id,
                onClick: () => actions.setSurface(id),
              });
            })
          )
        ),
        section(
          "Tile size",
          el(
            "div",
            { class: "chip-row" },
            col.sizes.map((sz) =>
              el(
                "button",
                {
                  type: "button",
                  class: `chip${sz.id === d.sizeId ? " is-active" : ""}`,
                  "aria-pressed": String(sz.id === d.sizeId),
                  onclick: () => actions.setSize(sz.id),
                },
                `${formatTileSize(sz.pitchMm)} · ${sz.thicknessMm} mm thick`
              )
            )
          ),
          col.sizes.length > 1 ? "Changing tile size clears painted tiles." : null
        )
      );
    }
  );
}
