// Building blocks shared by the sidebar panels.

import { el, clear } from "../../utils/dom.js";

/**
 * Re-render `container` only when `keyOf(design, ui)` changes. Keeps panels cheap during
 * drags (the key ignores things the panel doesn't show).
 */
export function reactive(container, store, keyOf, render) {
  let lastKey = null;
  const run = () => {
    const key = keyOf(store.design, store.ui);
    if (key === lastKey) return;
    lastKey = key;
    clear(container);
    render(container, store.design, store.ui);
  };
  store.subscribe(run);
  run();
}

export function section(title, children, hint) {
  return el("section", { class: "panel-section" }, [
    el("h3", { class: "panel-title" }, title),
    hint ? el("p", { class: "panel-hint" }, hint) : null,
    ...[].concat(children),
  ]);
}

/** Selectable card with a preview canvas and label. */
export function optionCard({ preview, label, sub, active, onClick, title }) {
  return el(
    "button",
    { class: `option-card${active ? " is-active" : ""}`, type: "button", onclick: onClick, title: title || label, "aria-pressed": String(!!active) },
    [
      preview ? el("span", { class: "option-preview" }, preview) : null,
      el("span", { class: "option-label" }, label),
      sub ? el("span", { class: "option-sub" }, sub) : null,
    ]
  );
}

export function toggle(label, checked, onChange) {
  return el("label", { class: "switch" }, [
    el("input", { type: "checkbox", checked, onchange: (e) => onChange(e.target.checked) }),
    el("span", { class: "switch-track", "aria-hidden": "true" }),
    el("span", { class: "switch-label" }, label),
  ]);
}

export function segmented(options, value, onChange, ariaLabel) {
  return el(
    "div",
    { class: "segmented", role: "group", "aria-label": ariaLabel },
    options.map((o) =>
      el(
        "button",
        { type: "button", class: o.value === value ? "is-active" : "", "aria-pressed": String(o.value === value), onclick: () => onChange(o.value) },
        o.label
      )
    )
  );
}
