// Registry of surface drawers, keyed by `drawer` in data/tiles.js.
// Each drawer: (ctx, sizePx, hex, rng, detail) → paints the tile face.

import { vented } from "./vented.js";
import { rib, ribDiamond } from "./rib.js";
import { coin, softCoin } from "./coin.js";
import { diamond } from "./diamond.js";
import { skin, esd, terrazzo } from "./flat.js";
import { wood, carbon } from "./vinyl.js";
import { rubber, grass } from "./soft.js";
import { lattice, court } from "./grid.js";

export const DRAWERS = {
  vented, rib, ribDiamond, coin, softCoin, diamond, skin, esd, terrazzo,
  wood, carbon, rubber, grass, lattice, court,
};
