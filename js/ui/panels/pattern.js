// Step 3 — pattern presets (previews are rendered by the same rule as the floor).

import { el } from "../../utils/dom.js";
import { PATTERN_GROUPS, getPattern } from "../../data/patterns.js";
import { patternThumb } from "../../render/thumbnails.js";
import { reactive, section, optionCard } from "./shared.js";

export function mountPatternPanel(container, { store, actions }) {
  reactive(
    container,
    store,
    (d) => JSON.stringify([d.patternId, d.slots]),
    (root, d) => {
      const textField =
        d.patternId === "text"
          ? section("Text", [
              el("input", {
                class: "input",
                value: d.text,
                maxlength: 12,
                placeholder: "e.g. GARAGE",
                "aria-label": "Floor text",
                onchange: (e) => actions.setText(e.target.value),
                onkeydown: (e) => e.key === "Enter" && e.target.blur(),
              }),
            ], "Letters are 5 × 7 tiles each. Use a big room for long words.")
          : null;

      root.append(
        ...(textField ? [textField] : []),
        ...PATTERN_GROUPS.map((g, i) =>
          section(
            g.name,
            el(
              "div",
              { class: "card-grid card-grid-3" },
              g.ids.map(getPattern).map((p) =>
                optionCard({
                  preview: patternThumb(p, d.slots, 76, 50),
                  label: p.name,
                  active: d.patternId === p.id,
                  onClick: () => actions.setPattern(p.id),
                })
              )
            ),
            i === 0 ? "Colours for Main, Accent and Trim are set in Colours." : null
          )
        )
      );
    }
  );
}
