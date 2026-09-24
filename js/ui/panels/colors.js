// Step 4 — pattern colours, brush colour/surface and painting tools.

import { el, icon } from "../../utils/dom.js";
import { COLORS, COLOR_GROUPS, getColor } from "../../data/colors.js";
import { getPattern, SLOT_LABELS } from "../../data/patterns.js";
import { SURFACES, getSurface } from "../../data/tiles.js";
import { getCollection } from "../../data/collections.js";
import { TOOL_LIST } from "../../interaction/tools.js";
import { reactive, section } from "./shared.js";

const PAINT_TOOLS = ["paint", "fill", "pick", "erase"];

export function mountColorsPanel(container, { store, actions }) {
  reactive(
    container,
    store,
    (d, ui) =>
      JSON.stringify([d.patternId, d.slots, d.collectionId, Object.keys(d.overrides).length, ui.target, ui.brushColor, ui.brushSurface, ui.tool]),
    (root, d, ui) => {
      const slots = getPattern(d.patternId).slots;
      const target = ui.target === "brush" || slots.includes(ui.target) ? ui.target : "brush";
      const currentId = target === "brush" ? ui.brushColor : d.slots[target];

      const targetChip = (id, label, colorId) =>
        el(
          "button",
          {
            type: "button",
            class: `target-chip${target === id ? " is-active" : ""}`,
            "aria-pressed": String(target === id),
            onclick: () => store.setUi({ target: id }),
          },
          [
            el("span", { class: "dot", style: { background: getColor(colorId).hex } }),
            el("span", { class: "target-text" }, [el("strong", {}, label), el("small", {}, getColor(colorId).name)]),
          ]
        );

      const pick = (colorId) => {
        if (target === "brush") {
          store.setUi({ brushColor: colorId, tool: PAINT_TOOLS.includes(ui.tool) ? ui.tool : "paint" });
        } else {
          actions.setSlot(target, colorId);
        }
      };

      const palette = COLOR_GROUPS.map((g) =>
        el("div", { class: "palette-group" }, [
          el("span", { class: "palette-name" }, g.name),
          el(
            "div",
            { class: "palette" },
            COLORS.filter((c) => c.group === g.id).map((c) =>
              el("button", {
                type: "button",
                class: `swatch${c.id === currentId ? " is-active" : ""}`,
                style: { background: c.hex },
                title: c.name,
                "aria-label": c.name,
                "aria-pressed": String(c.id === currentId),
                onclick: () => pick(c.id),
              })
            )
          ),
        ])
      );

      const col = getCollection(d.collectionId);
      const others = SURFACES.filter((s) => !col.surfaces.includes(s.id));
      const surfaceSelect = el(
        "select",
        { class: "input", "aria-label": "Brush surface", onchange: (e) => store.setUi({ brushSurface: e.target.value }) },
        [
          el("option", { value: "", selected: !ui.brushSurface }, `Same as floor (${getSurface(d.surfaceId).name})`),
          el("optgroup", { label: col.name }, col.surfaces.map((id) => el("option", { value: id, selected: ui.brushSurface === id }, getSurface(id).name))),
          el("optgroup", { label: "Other surfaces" }, others.map((s) => el("option", { value: s.id, selected: ui.brushSurface === s.id }, s.name))),
        ]
      );

      const paintCount = Object.keys(d.overrides).length;
      root.append(
        section(
          "What are you colouring?",
          el("div", { class: "target-list" }, [
            ...slots.map((s) => targetChip(s, `${SLOT_LABELS[s]} colour`, d.slots[s])),
            targetChip("brush", "Paint brush", ui.brushColor),
          ]),
          target === "brush" ? "Choose a colour, then click or drag on the floor to paint single tiles." : "Choose a colour to recolour the whole pattern."
        ),
        section("Colours", palette),
        section("Brush", [
          el(
            "div",
            { class: "tool-row" },
            TOOL_LIST.filter((t) => PAINT_TOOLS.includes(t.id)).map((t) =>
              el(
                "button",
                {
                  type: "button",
                  class: `tool-btn${ui.tool === t.id ? " is-active" : ""}`,
                  title: `${t.name} (${t.key})`,
                  "aria-pressed": String(ui.tool === t.id),
                  onclick: () => store.setUi({ tool: t.id, target: "brush" }),
                },
                [icon(t.icon), el("span", {}, t.name.split(" ")[0])]
              )
            )
          ),
          el("label", { class: "field" }, [el("span", {}, "Brush surface"), surfaceSelect]),
          el(
            "button",
            { type: "button", class: "btn btn-ghost", disabled: !paintCount, onclick: () => actions.clearPaint() },
            [icon("refresh-line"), `Clear painted tiles${paintCount ? ` (${paintCount})` : ""}`]
          ),
        ])
      );
    }
  );
}
