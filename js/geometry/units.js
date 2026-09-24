// Unit conversion, formatting and parsing. The design is always stored in millimetres.

export const MM_PER_IN = 25.4;
export const MM_PER_FT = 304.8;
export const MM2_PER_FT2 = MM_PER_FT * MM_PER_FT;

/** Grid step used when dragging walls. */
export function snapStep(units) {
  return units === "imperial" ? MM_PER_IN / 2 : 10;
}

export function formatLength(mm, units) {
  if (units === "imperial") {
    let totalIn = Math.round((mm / MM_PER_IN) * 2) / 2;
    let ft = Math.floor(totalIn / 12);
    let inch = totalIn - ft * 12;
    if (inch >= 12) {
      ft += 1;
      inch -= 12;
    }
    const inStr = Number.isInteger(inch) ? `${inch}` : `${Math.floor(inch)}½`;
    if (ft === 0) return `${inStr}″`;
    return inch === 0 ? `${ft}′` : `${ft}′ ${inStr}″`;
  }
  if (mm < 1000) return `${Math.round(mm / 10)} cm`;
  return `${(mm / 1000).toFixed(2)} m`;
}

/** Plain text value for an input box (no fancy primes so users can edit it). */
export function lengthInputValue(mm, units) {
  if (units === "imperial") {
    const totalIn = Math.round((mm / MM_PER_IN) * 2) / 2;
    const ft = Math.floor(totalIn / 12);
    const inch = +(totalIn - ft * 12).toFixed(1);
    return inch ? `${ft}' ${inch}"` : `${ft}'`;
  }
  return mm < 1000 ? `${Math.round(mm / 10)} cm` : `${+(mm / 1000).toFixed(3)} m`;
}

export function formatArea(mm2, units) {
  if (units === "imperial") return `${(mm2 / MM2_PER_FT2).toFixed(1)} ft²`;
  return `${(mm2 / 1e6).toFixed(2)} m²`;
}

export function formatTileSize(pitchMm) {
  const inches = pitchMm / MM_PER_IN;
  return `${Math.round(pitchMm)} mm · ${+inches.toFixed(2)}″`;
}

/**
 * Parse free text into millimetres. Accepts:
 *   4.2 m · 420 cm · 4200 mm · 13' 9" · 13ft 9in · 13'9 · 165" · 165 in · 13 9 (ft in)
 * A bare number means metres (metric) or feet (imperial). Returns null if not understood.
 */
export function parseLength(input, units) {
  const s = String(input).trim().toLowerCase().replace(/,/g, ".").replace(/[′’]/g, "'").replace(/[″”]/g, '"');
  if (!s) return null;
  const num = "(\\d+(?:\\.\\d+)?|\\.\\d+)";
  let m;

  if ((m = s.match(new RegExp(`^${num}\\s*(mm|cm|m)$`)))) {
    const v = parseFloat(m[1]);
    return m[2] === "mm" ? v : m[2] === "cm" ? v * 10 : v * 1000;
  }
  if ((m = s.match(new RegExp(`^${num}\\s*(?:'|ft|feet|foot)\\s*(?:${num}\\s*(?:"|in|inch|inches|'')?)?$`)))) {
    return parseFloat(m[1]) * MM_PER_FT + (m[2] ? parseFloat(m[2]) * MM_PER_IN : 0);
  }
  if ((m = s.match(new RegExp(`^${num}\\s*(?:"|in|inch|inches|'')$`)))) {
    return parseFloat(m[1]) * MM_PER_IN;
  }
  if ((m = s.match(new RegExp(`^${num}\\s+${num}$`))) && units === "imperial") {
    return parseFloat(m[1]) * MM_PER_FT + parseFloat(m[2]) * MM_PER_IN;
  }
  if ((m = s.match(new RegExp(`^${num}$`)))) {
    const v = parseFloat(m[1]);
    return units === "imperial" ? v * MM_PER_FT : v * 1000;
  }
  return null;
}
