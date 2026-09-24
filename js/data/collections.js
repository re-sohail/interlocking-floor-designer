// Product collections → surfaces and sizes.
// pitchMm is the laid size used for all maths; rampDepthMm sizes the edge ramps and corners.

export const COLLECTIONS = [
  {
    id: "garage-pro",
    name: "Garage Pro",
    tagline: "Vented heavy-duty garage tiles",
    icon: "car-line",
    surfaces: ["vented", "smoothrib", "diamond"],
    sizes: [{ id: "400x19", pitchMm: 400, thicknessMm: 19, rampDepthMm: 64 }],
  },
  {
    id: "garage-classic",
    name: "Garage Classic",
    tagline: "12″ tiles for garages & workshops",
    icon: "tools-line",
    surfaces: ["coin", "diamond", "ribdiamond"],
    sizes: [{ id: "305x13", pitchMm: 304.8, thicknessMm: 12.7, rampDepthMm: 60 }],
  },
  {
    id: "industrial",
    name: "Heavy Duty",
    tagline: "PVC tiles for industry & warehouses",
    icon: "building-2-line",
    surfaces: ["skin", "coin", "diamond", "esd"],
    sizes: [
      { id: "500x7", pitchMm: 500, thicknessMm: 7, rampDepthMm: 125 },
      { id: "500x10", pitchMm: 500, thicknessMm: 10, rampDepthMm: 125 },
    ],
  },
  {
    id: "showroom",
    name: "Showroom",
    tagline: "Premium looks for display floors",
    icon: "store-2-line",
    surfaces: ["smoothrib", "wood", "carbon", "terrazzo"],
    sizes: [
      { id: "400x19", pitchMm: 400, thicknessMm: 19, rampDepthMm: 64 },
      { id: "457x19", pitchMm: 457.2, thicknessMm: 19, rampDepthMm: 64 },
    ],
  },
  {
    id: "gym",
    name: "Gym & Fitness",
    tagline: "Rubber, cushioned and turf zones",
    icon: "boxing-line",
    surfaces: ["rubber", "antifatigue", "grass"],
    sizes: [{ id: "500x20", pitchMm: 500, thicknessMm: 20, rampDepthMm: 125 }],
  },
  {
    id: "outdoor",
    name: "Outdoor & Patio",
    tagline: "Drainage decking for patios & balconies",
    icon: "sun-line",
    surfaces: ["lattice", "grass", "vented"],
    sizes: [
      { id: "380x10", pitchMm: 380, thicknessMm: 10, rampDepthMm: 60 },
      { id: "300x20", pitchMm: 300, thicknessMm: 20, rampDepthMm: 60 },
    ],
  },
  {
    id: "court",
    name: "Sports Court",
    tagline: "Open-grid court tiles",
    icon: "basketball-line",
    surfaces: ["court"],
    sizes: [{ id: "305x13", pitchMm: 304.8, thicknessMm: 12.7, rampDepthMm: 60 }],
  },
];

export const getCollection = (id) => COLLECTIONS.find((c) => c.id === id) || COLLECTIONS[0];

export function getSize(collection, sizeId) {
  return collection.sizes.find((s) => s.id === sizeId) || collection.sizes[0];
}
