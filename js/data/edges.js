// Edge ramps & corners. Ramps are one tile pitch long; depth comes from the tile size
// (see collections.js). Only exposed walls get ramps.

export const EDGE_COLORS = [
  "jet-black", "graphite", "slate-grey", "pearl-grey",
  "citrus-yellow", "racing-red", "royal-blue", "tropical-orange",
];

/** Special value meaning "same colour as the main floor colour". */
export const MATCH_FLOOR = "match";

/**
 * Interlocking edges come in two genders. Following the common vendor rule, walls whose
 * outward side faces left/up take looped (female) edges, right/down take pegged (male) edges.
 */
export function edgeGender(normal) {
  return normal.x < 0 || normal.y < 0 ? "loop" : "peg";
}
