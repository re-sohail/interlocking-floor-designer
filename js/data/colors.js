// Real-world tile colours (names from vendor ranges; hex values are close approximations).
// group: "core" is offered on every surface, "extended" on premium ranges, "wood" for vinyl-wood tops.

export const COLORS = [
  // Core 8
  { id: "jet-black", name: "Jet Black", hex: "#1c1c1e", group: "core" },
  { id: "graphite", name: "Graphite", hex: "#3b3f44", group: "core" },
  { id: "slate-grey", name: "Slate Grey", hex: "#5e6468", group: "core" },
  { id: "pearl-grey", name: "Pearl Grey", hex: "#a7abae", group: "core" },
  { id: "alloy-silver", name: "Alloy Silver", hex: "#c4c7ca", group: "core" },
  { id: "racing-red", name: "Racing Red", hex: "#c8102e", group: "core" },
  { id: "royal-blue", name: "Royal Blue", hex: "#1f4fa3", group: "core" },
  { id: "citrus-yellow", name: "Citrus Yellow", hex: "#f2c200", group: "core" },
  // Extended
  { id: "stone-grey", name: "Stone Grey", hex: "#8a8d8f", group: "extended" },
  { id: "arctic-white", name: "Arctic White", hex: "#f2f3f2", group: "extended" },
  { id: "sand", name: "Sand", hex: "#cdbb98", group: "extended" },
  { id: "mocha", name: "Mocha", hex: "#8c6b4f", group: "extended" },
  { id: "chocolate", name: "Chocolate", hex: "#4a2f23", group: "extended" },
  { id: "terra-cotta", name: "Terra Cotta", hex: "#b5563a", group: "extended" },
  { id: "tropical-orange", name: "Tropical Orange", hex: "#f26b1d", group: "extended" },
  { id: "island-blue", name: "Island Blue", hex: "#2e8bd8", group: "extended" },
  { id: "steel-blue", name: "Steel Blue", hex: "#4f6d8a", group: "extended" },
  { id: "teal", name: "Teal", hex: "#16827f", group: "extended" },
  { id: "boxwood-green", name: "Boxwood Green", hex: "#2f5d3a", group: "extended" },
  { id: "techno-lime", name: "Techno Lime", hex: "#7ac143", group: "extended" },
  { id: "turf-green", name: "Turf Green", hex: "#3e8e3a", group: "extended" },
  { id: "cosmic-purple", name: "Cosmic Purple", hex: "#5b3a8c", group: "extended" },
  { id: "carnival-pink", name: "Carnival Pink", hex: "#e0478a", group: "extended" },
  // Wood tones
  { id: "light-maple", name: "Light Maple", hex: "#c9a477", group: "wood" },
  { id: "natural-oak", name: "Natural Oak", hex: "#a57c52", group: "wood" },
  { id: "smoked-oak", name: "Smoked Oak", hex: "#6b5a4a", group: "wood" },
  { id: "black-oak", name: "Black Oak", hex: "#3a2e27", group: "wood" },
];

export const COLOR_GROUPS = [
  { id: "core", name: "Core colours" },
  { id: "extended", name: "Designer colours" },
  { id: "wood", name: "Wood tones" },
];

const BY_ID = new Map(COLORS.map((c) => [c.id, c]));

export const getColor = (id) => BY_ID.get(id) || COLORS[0];
export const colorHex = (id) => getColor(id).hex;
