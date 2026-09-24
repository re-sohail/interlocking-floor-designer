// Inline editor that opens over a dimension label so users can type an exact wall length.

import { el } from "../utils/dom.js";
import { dist } from "../geometry/polygon.js";
import { lengthInputValue, parseLength } from "../geometry/units.js";

export function createDimensionEditor(stage, { store, actions }) {
  const input = el("input", { class: "dim-editor", "aria-label": "Wall length", spellcheck: "false" });
  let wallIndex = -1;

  function close() {
    wallIndex = -1;
    input.remove();
  }

  function commit() {
    if (wallIndex < 0) return;
    const mm = parseLength(input.value, store.design.units);
    if (mm !== null && actions.setWallLength(wallIndex, mm)) {
      close();
    } else {
      input.classList.add("is-invalid");
      input.title = "Enter a length that fits this shape, e.g. 4.2 m or 13' 9\"";
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") close();
    e.stopPropagation();
  });
  input.addEventListener("blur", () => {
    if (wallIndex >= 0) commit();
    if (wallIndex >= 0) close();
  });

  return {
    open(index, rect) {
      const room = store.design.room;
      wallIndex = index;
      input.value = lengthInputValue(dist(room[index], room[(index + 1) % room.length]), store.design.units);
      input.classList.remove("is-invalid");
      const width = Math.max(110, rect.w + 20);
      Object.assign(input.style, {
        left: `${rect.x + rect.w / 2 - width / 2}px`,
        top: `${rect.y + rect.h / 2 - 16}px`,
        width: `${width}px`,
      });
      stage.append(input);
      input.focus();
      input.select();
    },
    close,
  };
}
