// Parametric room templates in millimetres. Points go clockwise on screen, starting top-left.
// Default footprint is 6.0 × 4.8 m (≈ 20 × 16 ft).

const W = 6000;
const H = 4800;

const rect = (w, h) => [
  { x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h },
];

export const LAYOUTS = [
  { id: "rectangle", name: "Rectangle", build: () => rect(W, H) },
  { id: "square", name: "Square", build: () => rect(H, H) },
  {
    id: "l-shape",
    name: "L-shape",
    build: () => [
      { x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H / 2 },
      { x: W / 2, y: H / 2 }, { x: W / 2, y: H }, { x: 0, y: H },
    ],
  },
  {
    id: "u-shape",
    name: "U-shape",
    build: () => [
      { x: 0, y: 0 }, { x: W / 4, y: 0 }, { x: W / 4, y: H / 2 },
      { x: (3 * W) / 4, y: H / 2 }, { x: (3 * W) / 4, y: 0 }, { x: W, y: 0 },
      { x: W, y: H }, { x: 0, y: H },
    ],
  },
  {
    id: "t-shape",
    name: "T-shape",
    build: () => [
      { x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H / 2.5 },
      { x: (2 * W) / 3, y: H / 2.5 }, { x: (2 * W) / 3, y: H }, { x: W / 3, y: H },
      { x: W / 3, y: H / 2.5 }, { x: 0, y: H / 2.5 },
    ],
  },
  {
    id: "double-leg",
    name: "Double leg",
    build: () => [
      { x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H * 0.75 },
      { x: W * 0.75, y: H * 0.75 }, { x: W * 0.75, y: H }, { x: W * 0.25, y: H },
      { x: W * 0.25, y: H * 0.75 }, { x: 0, y: H * 0.75 },
    ],
  },
  {
    id: "notched",
    name: "Notched corner",
    build: () => [
      { x: 0, y: 0 }, { x: W * 0.7, y: 0 }, { x: W * 0.7, y: H * 0.3 },
      { x: W, y: H * 0.3 }, { x: W, y: H }, { x: 0, y: H },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    build: () => {
      const a = W / 3;
      const b = H / 3;
      return [
        { x: a, y: 0 }, { x: 2 * a, y: 0 }, { x: 2 * a, y: b }, { x: W, y: b },
        { x: W, y: 2 * b }, { x: 2 * a, y: 2 * b }, { x: 2 * a, y: H }, { x: a, y: H },
        { x: a, y: 2 * b }, { x: 0, y: 2 * b }, { x: 0, y: b }, { x: a, y: b },
      ];
    },
  },
];

export const getLayout = (id) => LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
