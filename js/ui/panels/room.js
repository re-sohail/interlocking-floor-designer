// Step 1 — room shape, exact wall lengths and obstacles.

import { el, icon } from "../../utils/dom.js";
import { LAYOUTS } from "../../data/layouts.js";
import { walls } from "../../geometry/polygon.js";
import { OBSTACLE_TYPES, obstacleType } from "../../geometry/obstacles.js";
import { lengthInputValue, parseLength } from "../../geometry/units.js";
import { layoutThumb } from "../../render/thumbnails.js";
import { reactive, section, optionCard, toggle } from "./shared.js";

export function mountRoomPanel(container, { store, actions }) {
  const shapes = el("div");
  const sizes = el("div");
  const obstacles = el("div");
  container.append(shapes, sizes, obstacles);

  reactive(shapes, store, (d) => d.layoutId, (root, d) => {
    root.append(
      section(
        "Room shape",
        el(
          "div",
          { class: "card-grid" },
          LAYOUTS.map((l) =>
            optionCard({
              preview: layoutThumb(l.id),
              label: l.name,
              active: d.layoutId === l.id,
              onClick: () => actions.setLayout(l.id),
            })
          )
        ),
        "Pick the closest shape, then drag any wall on the plan."
      )
    );
  });

  reactive(sizes, store, (d) => JSON.stringify([d.room, d.units, d.snapToTiles]), (root, d) => {
    root.append(
      section("Wall lengths", [
        el("div", { class: "wall-list" }, walls(d.room).map((w) => wallRow(w, d, store, actions))),
        toggle("Snap walls to whole tiles", d.snapToTiles, (on) => actions.setSnapToTiles(on)),
      ], "Type an exact size, e.g. 4.2 m, 420 cm or 13' 9\".")
    );
  });

  reactive(obstacles, store, (d, ui) => JSON.stringify([d.obstacles, d.units, ui.selectedObstacle]), (root, d, ui) => {
    root.append(
      section("Obstacles", [
        el(
          "div",
          { class: "chip-row" },
          OBSTACLE_TYPES.map((t) =>
            el("button", { class: "chip", type: "button", onclick: () => actions.addObstacle(t.id) }, [icon(t.icon), t.name])
          )
        ),
        d.obstacles.length
          ? el("div", { class: "obstacle-list" }, d.obstacles.map((o) => obstacleRow(o, d, ui, store, actions)))
          : null,
      ], "Tiles are cut around pillars, cabinets and drains. Drag them on the plan.")
    );
  });
}

function wallRow(w, d, store, actions) {
  const input = el("input", {
    class: "input",
    value: lengthInputValue(w.length, d.units),
    "aria-label": `Wall ${w.index + 1} length`,
    onchange: (e) => {
      const mm = parseLength(e.target.value, d.units);
      if (mm === null || !actions.setWallLength(w.index, mm)) {
        e.target.classList.add("is-invalid");
        e.target.title = "That length doesn't fit this shape";
      }
    },
    onkeydown: (e) => e.key === "Enter" && e.target.blur(),
  });
  return el(
    "div",
    {
      class: "wall-row",
      onmouseenter: () => store.setUi({ hoverWall: w.index }),
      onmouseleave: () => store.setUi({ hoverWall: -1 }),
    },
    [el("span", { class: "wall-badge" }, String(w.index + 1)), el("span", { class: "wall-dir" }, w.horizontal ? "Horizontal" : "Vertical"), input]
  );
}

function obstacleRow(o, d, ui, store, actions) {
  const sizeInput = (key, label) =>
    el("input", {
      class: "input input-sm",
      value: lengthInputValue(o[key], d.units),
      "aria-label": `${obstacleType(o.type).name} ${label}`,
      onclick: (e) => e.stopPropagation(),
      onchange: (e) => {
        const mm = parseLength(e.target.value, d.units);
        if (mm && mm >= 100) actions.updateObstacle(o.id, { [key]: Math.round(mm) });
        else e.target.classList.add("is-invalid");
      },
      onkeydown: (e) => e.key === "Enter" && e.target.blur(),
    });
  return el(
    "div",
    {
      class: `obstacle-row${ui.selectedObstacle === o.id ? " is-active" : ""}`,
      onclick: () => store.setUi({ selectedObstacle: o.id }),
    },
    [
      el("span", { class: "obstacle-name" }, [icon(obstacleType(o.type).icon), obstacleType(o.type).name]),
      sizeInput("w", "width"),
      el("span", { class: "times" }, "×"),
      sizeInput("h", "depth"),
      el("button", { class: "icon-btn", type: "button", title: "Remove", "aria-label": "Remove obstacle", onclick: (e) => {
        e.stopPropagation();
        actions.removeObstacle(o.id);
      } }, icon("delete-bin-line")),
    ]
  );
}
