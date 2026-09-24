// Tile surfaces. `drawer` maps to a procedural renderer in render/surfaces.

export const SURFACES = [
  { id: "vented", name: "Vented", drawer: "vented", note: "Free-flow slots drain water and air" },
  { id: "smoothrib", name: "Smooth Rib", drawer: "rib", note: "Closed top with fine ribs" },
  { id: "coin", name: "Coin Top", drawer: "coin", note: "Raised discs for grip" },
  { id: "diamond", name: "Diamond Plate", drawer: "diamond", note: "Checker-plate tread" },
  { id: "ribdiamond", name: "Ribbed Diamond", drawer: "ribDiamond", note: "Ribs meeting in a centre diamond" },
  { id: "skin", name: "Smooth Textured", drawer: "skin", note: "Fine anti-slip stipple" },
  { id: "esd", name: "ESD Anti-static", drawer: "esd", note: "Conductive veined surface" },
  { id: "wood", name: "Vinyl Wood", drawer: "wood", note: "Wood-look vinyl inlay" },
  { id: "carbon", name: "Vinyl Carbon", drawer: "carbon", note: "Carbon-fibre twill inlay" },
  { id: "terrazzo", name: "Terrazzo Vinyl", drawer: "terrazzo", note: "Stone-chip vinyl inlay" },
  { id: "rubber", name: "Rubber Fleck", drawer: "rubber", note: "EPDM fleck gym rubber" },
  { id: "antifatigue", name: "Anti-fatigue", drawer: "softCoin", note: "Cushioned bubble top" },
  { id: "grass", name: "Grass", drawer: "grass", note: "Artificial turf top" },
  { id: "lattice", name: "Open Lattice", drawer: "lattice", note: "Decorative drainage lattice" },
  { id: "court", name: "Court Grid", drawer: "court", note: "Fine open grid for sports" },
];

const BY_ID = new Map(SURFACES.map((s) => [s.id, s]));

export const getSurface = (id) => BY_ID.get(id) || SURFACES[0];
