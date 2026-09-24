// Step 3 — pattern presets (previews are rendered by the same rule as the floor).

import { el } from "../../utils/dom.js";
import { PATTERNS } from "../../data/patterns.js";
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
        section(
          "Pattern",
          el(
            "div",
            { class: "card-grid" },
            PATTERNS.map((p) =>
              optionCard({
                preview: patternThumb(p, d.slots),
                label: p.name,
                active: d.patternId === p.id,
                onClick: () => actions.setPattern(p.id),
              })
            )
          ),
          "Colours for Main, Accent and Trim are set in the next step."
        ),
        textField
      );
    }
  );
}
