// Canvas & Context
const canvas = document.getElementById("designCanvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvasContainer");
const areaDimensionsContainer = document.getElementById("areaDimensions");

// Controls
const dimensionsDisplay = document.getElementById("dimensions");

// Sidebar Items
const sidebarItems = document.querySelectorAll(".sidebar-item");

// Settings
// Settings
const pixelsPerFoot = 25; // Reduced from 35 to 25 for a smaller visual size
const tileWidthInches = 15.75; // Physical tile width
const tileWidthFt = tileWidthInches / 12; // Convert to feet: 1.3125 ft
const cellSize = tileWidthFt * pixelsPerFoot; // ≈32.8125 pixels, matches tile size

// Rest of your existing settings remain unchanged
const fillOpacity = 0.8;
const tileOpacity = 0.4;
const patternOpacity = 0.4;

// State Variables
let isDragging = false;
let dragStartX, dragStartY;
let paintColor = "#ff0000";
let currentStep = 0;
const steps = ["layouts", "patterns", "tileTypes", "edges", "colors"];
let activeSidebarSection = "layouts";
let activeHandle = null;
let startMouseX, startMouseY;
let startShape = {};
let activeArea = null;

// Design Shape Object
const designShape = {
  type: "rectangle",
  vertices: [],
  areas: [],
  patternImage: null,
  tileType: "standard",
  baseColor: "#CCCCCC",
  borderColor: "",
  currentTileId: "tile1", // Default tile ID
};

// Painted Cells (for tiles and colors)
const paintedCells = [];

const tileImages = {};

// Data Arrays
const layouts = [
  { id: "rectangle", image: "./media/svg/layouts/layout1.svg" },
  { id: "l-shape", image: "./media/svg/layouts/layout2.svg" },
  { id: "u-shape", image: "./media/svg/layouts/layout3.svg" },
  { id: "double-legged-rectangle", image: "./media/svg/layouts/layout4.svg" },
];

const patterns = [
  { id: "1", image: "./media/svg/patterns/patterns1.svg", name: "Pattern 1" },
  {
    id: "2",
    image: "./media/svg/patterns/patterns2.svg",
    name: "Pattern 2",
  },
  {
    id: "3",
    image: "./media/svg/patterns/patterns3.svg",
    name: "Pattern 3",
  },
  {
    id: "4",
    image: "./media/svg/patterns/patterns4.svg",
    name: "Pattern 4",
  },
  {
    id: "5",
    image: "./media/svg/patterns/patterns5.svg",
    name: "Pattern 5",
  },
  {
    id: "6",
    image: "./media/svg/patterns/patterns6.svg",
    name: "Pattern 6",
  },
];

const tileTypes = [
  { id: "tile1", name: "Tile 1", image: "./media/img/tile.jpeg" },
];

const edgeColors = [
  // { id: "black", value: "#000000", name: "Black" },
  // { id: "red", value: "#ff0000", name: "Red" },
  { id: "gray", value: "#CCCCCC", name: "Gray" },
];

const colors = [
  { id: "red", value: "#ff0000", name: "Red" },
  { id: "black", value: "#000000", name: "Black" },
  { id: "blue", value: "#0000ff", name: "Blue" },
  { id: "gray", value: "#808080", name: "Gray" },
  // { id: "green", value: "#008000", name: "Green" },
  // { id: "purple", value: "#800080", name: "Purple" },
];

// Utility: Convert Hex to RGBA
function hexToRgba(hex, opacity) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Load Pattern Image
function loadPatternImage(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => resolve(img);
  });
}

// Patterns
function createPattern1(ctx) {
  const rows = 10;
  const cols = 10;
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize * cols;
  patternCanvas.height = cellSize * rows;
  const pCtx = patternCanvas.getContext("2d");

  // Fill every cell with the empty cell color "#CCCCCC"
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      pCtx.fillStyle = "#CCCCCC";
      pCtx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }

  // Create and return the repeating pattern
  return ctx.createPattern(patternCanvas, "repeat");
}

function createPattern2(ctx) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize * 2;
  patternCanvas.height = cellSize * 2;
  const patternCtx = patternCanvas.getContext("2d");

  patternCtx.fillStyle = "#CCCCCC";
  patternCtx.fillRect(0, 0, cellSize * 2, cellSize * 2);
  patternCtx.fillStyle = "black";
  patternCtx.fillRect(0, 0, cellSize, cellSize);
  patternCtx.fillRect(cellSize, cellSize, cellSize, cellSize);

  return ctx.createPattern(patternCanvas, "repeat");
}

function createPattern3(ctx) {
  // Example: 12 rows x 16 columns
  const rows = 12;
  const cols = 16;
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize * cols;
  patternCanvas.height = cellSize * rows;
  const patternCtx = patternCanvas.getContext("2d");

  // Loop through each cell in the grid
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      let fillColor;

      // Outer ring (top row, bottom row, left column, right column)
      if (i === 1 || i === rows || j === 1 || j === cols) {
        fillColor = "black";
      }
      // Inner ring (second row, second-last row, second column, second-last column)
      else if (i === 2 || i === rows - 1 || j === 2 || j === cols - 1) {
        fillColor = "red";
      }
      // Everything else in the center
      else {
        fillColor = "#CCCCCC";
      }

      patternCtx.fillStyle = fillColor;
      patternCtx.fillRect(
        (j - 1) * cellSize,
        (i - 1) * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  // Return a repeating pattern
  return ctx.createPattern(patternCanvas, "repeat");
}

function createPattern4(ctx) {
  const rows = 12; // number of rows in our grid pattern
  const cols = 16; // number of columns in our grid pattern
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize * cols;
  patternCanvas.height = cellSize * rows;
  const pCtx = patternCanvas.getContext("2d");

  // Loop through each cell in the grid
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      let fillColor;
      if (i === 1 || i === rows) {
        // First and last row: empty cell color (#CCCCCC)
        fillColor = "#CCCCCC";
      } else if (i === 2 || i === rows - 1) {
        // Second and second-to-last row:
        // first and last columns remain empty, rest become hard cells (yellow)
        fillColor = j === 1 || j === cols ? "#CCCCCC" : "black";
      } else {
        // Rows 3 to 8:
        // first and last columns are empty,
        // second and second-to-last are hard cells,
        // the rest remain empty
        if (j === 1 || j === cols) {
          fillColor = "#CCCCCC";
        } else if (j === 2 || j === cols - 1) {
          fillColor = "black";
        } else {
          fillColor = "#CCCCCC";
        }
      }
      pCtx.fillStyle = fillColor;
      pCtx.fillRect((j - 1) * cellSize, (i - 1) * cellSize, cellSize, cellSize);
    }
  }
  return ctx.createPattern(patternCanvas, "repeat");
}

function createPattern5(ctx) {
  const rows = 12; // number of rows in our grid pattern
  const cols = 16; // number of columns in our grid pattern
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize * cols;
  patternCanvas.height = cellSize * rows;
  const pCtx = patternCanvas.getContext("2d");

  // Loop through each cell in the grid
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      let fillColor;
      if (i === 1 || i === rows) {
        // First and last row: empty cell color (#CCCCCC)
        fillColor = "red";
      } else if (i === 2 || i === rows - 1) {
        // Second and second-to-last row:
        // first and last columns remain empty, rest become hard cells (yellow)
        fillColor = j === 1 || j === cols ? "red" : "black";
      } else {
        // Rows 3 to 8:
        // first and last columns are empty,
        // second and second-to-last are hard cells,
        // the rest remain empty
        if (j === 1 || j === cols) {
          fillColor = "red";
        } else if (j === 2 || j === cols - 1) {
          fillColor = "black";
        } else {
          fillColor = "black";
        }
      }
      pCtx.fillStyle = fillColor;
      pCtx.fillRect((j - 1) * cellSize, (i - 1) * cellSize, cellSize, cellSize);
    }
  }
  return ctx.createPattern(patternCanvas, "repeat");
}

function createPattern6(ctx) {
  const rows = 12; // number of rows in our grid pattern
  const cols = 16; // number of columns in our grid pattern
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize * cols;
  patternCanvas.height = cellSize * rows;
  const pCtx = patternCanvas.getContext("2d");

  // Loop through each cell in the grid
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      let fillColor;
      if (i === 1 || i === rows) {
        // First and last row: empty cell color (#CCCCCC)
        fillColor = "black";
      } else if (i === 2 || i === rows - 1) {
        // Second and second-to-last row:
        // first and last columns remain empty, rest become hard cells (yellow)
        fillColor = j === 1 || j === cols ? "black" : "red";
      } else {
        // Rows 3 to 8:
        // first and last columns are empty,
        // second and second-to-last are hard cells,
        // the rest remain empty
        if (j === 1 || j === cols) {
          fillColor = "black";
        } else if (j === 2 || j === cols - 1) {
          fillColor = "red";
        } else {
          fillColor = "#CCCCCC";
        }
      }
      pCtx.fillStyle = fillColor;
      pCtx.fillRect((j - 1) * cellSize, (i - 1) * cellSize, cellSize, cellSize);
    }
  }
  return ctx.createPattern(patternCanvas, "repeat");
}

// Define Initial Areas for Each Shape
function getInitialAreas(type) {
  // Use global pixelsPerFoot (now 25)
  const width = 20 * pixelsPerFoot; // 20 ft * 25 = 500px
  const height = 15 * pixelsPerFoot; // 15 ft * 25 = 375px
  const x = (canvas.width - width) / 2; // Center on 800px canvas: (800 - 500) / 2 = 150px
  const y = (canvas.height - height) / 2; // Center on 600px canvas: (600 - 375) / 2 = 112.5px

  switch (type) {
    case "rectangle":
      return [
        {
          id: "main",
          vertices: [
            { x: x, y: y }, // Top-left: (150, 112.5)
            { x: x + width, y: y }, // Top-right: (650, 112.5)
            { x: x + width, y: y + height }, // Bottom-right: (650, 487.5)
            { x: x, y: y + height }, // Bottom-left: (150, 487.5)
          ],
          segments: [
            {
              id: "top",
              start: 0,
              end: 1,
              length: width,
              direction: "horizontal",
            }, // 500px
            {
              id: "right",
              start: 1,
              end: 2,
              length: height,
              direction: "vertical",
            }, // 375px
            {
              id: "bottom",
              start: 2,
              end: 3,
              length: width,
              direction: "horizontal",
            }, // 500px
            {
              id: "left",
              start: 3,
              end: 0,
              length: height,
              direction: "vertical",
            }, // 375px
          ],
        },
      ];
    case "l-shape":
      const legWidth = width / 2; // 500px / 2 = 250px (10 ft)
      const legHeight = height / 2; // 375px / 2 = 187.5px (7.5 ft)
      return [
        {
          id: "main",
          vertices: [
            { x: x, y: y }, // Top-left: (150, 112.5)
            { x: x + width, y: y }, // Top-right: (650, 112.5)
            { x: x + width, y: y + legHeight }, // Right-middle: (650, 300)
            { x: x + legWidth, y: y + legHeight }, // Inner-middle: (400, 300)
            { x: x + legWidth, y: y + height }, // Inner-bottom: (400, 487.5)
            { x: x, y: y + height }, // Bottom-left: (150, 487.5)
          ],
          segments: [
            {
              id: "top",
              start: 0,
              end: 1,
              length: width,
              direction: "horizontal",
            }, // 500px
            {
              id: "right-top",
              start: 1,
              end: 2,
              length: legHeight,
              direction: "vertical",
            }, // 187.5px
            {
              id: "inner-top",
              start: 2,
              end: 3,
              length: width - legWidth,
              direction: "horizontal",
            }, // 250px
            {
              id: "inner-left",
              start: 3,
              end: 4,
              length: height - legHeight,
              direction: "vertical",
            }, // 187.5px
            {
              id: "bottom",
              start: 4,
              end: 5,
              length: legWidth,
              direction: "horizontal",
            }, // 250px
            {
              id: "left",
              start: 5,
              end: 0,
              length: height,
              direction: "vertical",
            }, // 375px
          ],
        },
      ];
    case "u-shape":
      const uLegWidth = width / 4; // 500px / 4 = 125px (5 ft)
      return [
        {
          id: "main",
          vertices: [
            { x: x, y: y }, // Top-left: (150, 112.5)
            { x: x + uLegWidth, y: y }, // Left-inner-top: (275, 112.5)
            { x: x + uLegWidth, y: y + height / 2 }, // Left-inner-middle: (275, 300)
            { x: x + width - uLegWidth, y: y + height / 2 }, // Right-inner-middle: (525, 300)
            { x: x + width - uLegWidth, y: y }, // Right-inner-top: (525, 112.5)
            { x: x + width, y: y }, // Top-right: (650, 112.5)
            { x: x + width, y: y + height }, // Bottom-right: (650, 487.5)
            { x: x, y: y + height }, // Bottom-left: (150, 487.5)
          ],
          segments: [
            {
              id: "top-left",
              start: 0,
              end: 1,
              length: uLegWidth,
              direction: "horizontal",
            }, // 125px
            {
              id: "inner-left-vertical",
              start: 1,
              end: 2,
              length: height / 2,
              direction: "vertical",
            }, // 187.5px
            {
              id: "inner-bottom",
              start: 2,
              end: 3,
              length: width - 2 * uLegWidth,
              direction: "horizontal",
            }, // 250px
            {
              id: "inner-right-vertical",
              start: 3,
              end: 4,
              length: height / 2,
              direction: "vertical",
            }, // 187.5px
            {
              id: "top-right",
              start: 4,
              end: 5,
              length: uLegWidth,
              direction: "horizontal",
            }, // 125px
            {
              id: "right",
              start: 5,
              end: 6,
              length: height,
              direction: "vertical",
            }, // 375px
            {
              id: "bottom",
              start: 6,
              end: 7,
              length: width,
              direction: "horizontal",
            }, // 500px
            {
              id: "left",
              start: 7,
              end: 0,
              length: height,
              direction: "vertical",
            }, // 375px
          ],
        },
      ];
    case "double-legged-rectangle":
      const dlrLegWidth = width / 4; // 500px / 4 = 125px (5 ft)
      const dlrLegHeight = height / 4; // 375px / 4 = 93.75px (3.75 ft)
      return [
        {
          id: "main",
          vertices: [
            { x: x, y: y }, // Top-left: (150, 112.5)
            { x: x + width, y: y }, // Top-right: (650, 112.5)
            { x: x + width, y: y + height }, // Bottom-right: (650, 487.5)
            { x: x + width - dlrLegWidth, y: y + height }, // Right-leg-top: (525, 487.5)
            { x: x + width - dlrLegWidth, y: y + height + dlrLegHeight }, // Right-leg-bottom: (525, 581.25)
            { x: x + dlrLegWidth, y: y + height + dlrLegHeight }, // Left-leg-bottom: (275, 581.25)
            { x: x + dlrLegWidth, y: y + height }, // Left-leg-top: (275, 487.5)
            { x: x, y: y + height }, // Bottom-left: (150, 487.5)
          ],
          segments: [
            {
              id: "top",
              start: 0,
              end: 1,
              length: width,
              direction: "horizontal",
            }, // 500px
            {
              id: "right",
              start: 1,
              end: 2,
              length: height,
              direction: "vertical",
            }, // 375px
            {
              id: "bottom-right",
              start: 2,
              end: 3,
              length: dlrLegWidth,
              direction: "horizontal",
            }, // 125px
            {
              id: "right-extension",
              start: 3,
              end: 4,
              length: dlrLegHeight,
              direction: "vertical",
            }, // 93.75px
            {
              id: "bottom-extension",
              start: 4,
              end: 5,
              length: width - 2 * dlrLegWidth,
              direction: "horizontal",
            }, // 250px
            {
              id: "left-extension",
              start: 5,
              end: 6,
              length: dlrLegHeight,
              direction: "vertical",
            }, // 93.75px
            {
              id: "bottom-left",
              start: 6,
              end: 7,
              length: dlrLegWidth,
              direction: "horizontal",
            }, // 125px
            {
              id: "left",
              start: 7,
              end: 0,
              length: height,
              direction: "vertical",
            }, // 375px
          ],
        },
      ];
    default:
      return [];
  }
}

function getPatternColor(patternName, i, j) {
  switch (patternName) {
    case "Pattern 1":
      return "#CCCCCC";
    case "Pattern 2":
      return (i + j) % 2 === 0 ? "black" : "#CCCCCC";
    case "Pattern 3":
      const row = i % 12; // Pattern repeats every 12 rows
      const col = j % 16; // Pattern repeats every 16 columns
      if (row === 0 || row === 11 || col === 0 || col === 15) return "black";
      if (row === 1 || row === 10 || col === 1 || col === 14) return "red";
      return "#CCCCCC";
    case "Pattern 4":
      const r4 = i % 12;
      const c4 = j % 16;
      if (r4 === 0 || r4 === 11) return "#CCCCCC";
      if (r4 === 1 || r4 === 10)
        return c4 === 0 || c4 === 15 ? "#CCCCCC" : "black";
      return c4 === 0 || c4 === 15 || (c4 !== 1 && c4 !== 14)
        ? "#CCCCCC"
        : "black";
    case "Pattern 5":
      const r5 = i % 12;
      const c5 = j % 16;
      if (r5 === 0 || r5 === 11) return "red";
      if (r5 === 1 || r5 === 10) return c5 === 0 || c5 === 15 ? "red" : "black";
      return c5 === 0 || c5 === 15 ? "red" : "black";
    case "Pattern 6":
      const r6 = i % 12;
      const c6 = j % 16;
      if (r6 === 0 || r6 === 11) return "black";
      if (r6 === 1 || r6 === 10) return c6 === 0 || c6 === 15 ? "black" : "red";
      return c6 === 0 || c6 === 15 || (c6 !== 1 && c6 !== 14) ? "black" : "red";
    default:
      return "#CCCCCC";
  }
}

// Create Shape Path from Vertices
function getShapePath() {
  const path = new Path2D();
  const vertices = designShape.vertices;
  if (vertices.length > 0) {
    path.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      path.lineTo(vertices[i].x, vertices[i].y);
    }
    path.closePath();
  }
  return path;
}

// Get Area Path
function getAreaPath(area) {
  const path = new Path2D();
  const vertices = area.vertices;
  if (vertices && vertices.length > 0) {
    path.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      path.lineTo(vertices[i].x, vertices[i].y);
    }
    path.closePath();
  } else if (area.x !== undefined) {
    path.rect(area.x, area.y, area.width, area.height);
  }
  return path;
}

// Calculate midpoint between two points
function getMidpoint(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

// Calculate segment length
function getSegmentLength(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Format dimension as feet and inches
function formatDimension(pixels) {
  const totalInches = (pixels / pixelsPerFoot) * 12;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

// Update Dimensions Display
function updateDimensions() {
  // Remove existing dimension labels
  document
    .querySelectorAll(".dimension-label")
    .forEach((label) => label.remove());
  if (!designShape.areas || designShape.areas.length === 0) return;
  const mainArea = designShape.areas[0];
  if (!mainArea.segments) return;

  // Calculate scaling factors for display
  const scaleX = canvas.clientWidth / canvas.width;
  const scaleY = canvas.clientHeight / canvas.height;

  // Update segment dimensions
  mainArea.segments.forEach((segment) => {
    const startPoint = mainArea.vertices[segment.start];
    const endPoint = mainArea.vertices[segment.end];
    const length = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) +
        Math.pow(endPoint.y - startPoint.y, 2)
    );
    const dimensionText = formatDimension(length);

    const dimensionLabel = document.createElement("div");
    dimensionLabel.className = "dimension-label";
    dimensionLabel.textContent = dimensionText;
    dimensionLabel.style.position = "absolute";

    // Calculate midpoint of the segment
    const M = {
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2,
    };

    // Calculate direction vector and perpendicular vector
    const D = { x: endPoint.x - startPoint.x, y: endPoint.y - startPoint.y };
    const N = { x: D.y, y: -D.x }; // Perpendicular to the segment
    const magN = Math.sqrt(N.x * N.x + N.y * N.y);
    if (magN === 0) return; // Avoid division by zero

    // Normalize the perpendicular vector and offset the label
    const U = { x: N.x / magN, y: N.y / magN };
    const k = 20; // Initial offset distance in pixels
    const P = { x: M.x + k * U.x, y: M.y + k * U.y };

    // Append label to the canvas container and adjust position based on label size
    canvasContainer.appendChild(dimensionLabel);
    const width = dimensionLabel.offsetWidth;
    const height = dimensionLabel.offsetHeight;
    const adjustedK = Math.max(k, height / 2 + 5); // Ensure label doesn't overlap segment
    const finalP = { x: M.x + adjustedK * U.x, y: M.y + adjustedK * U.y };

    // Position the label with scaling, centered at finalP
    dimensionLabel.style.left = `${finalP.x * scaleX - width / 2}px`;
    dimensionLabel.style.top = `${finalP.y * scaleY - height / 2}px`;
  });

  // Without extral 10%

  // // Calculate total area using the shoelace formula
  // const areaPixels = calculateArea(mainArea.vertices);
  // const areaFt = areaPixels / pixelsPerFoot ** 2;

  // // Calculate number of tiles needed with a 10% buffer
  // const tileArea = 1.72; // Square feet per tile
  // const totalAreaWithBuffer = areaFt * 1.1;
  // const tilesNeeded = Math.ceil(totalAreaWithBuffer / tileArea);

  // // Price calculations
  // const pricePerTile = 6.25; // Example price per tile
  // const totalPrice = tilesNeeded * pricePerTile;

  // // Update UI elements with new price-info structure
  // const priceExcVat = document.querySelector(".price-exc-vat");
  // const priceIncVat = document.querySelector(".price-inc-vat");
  // const pricePerUnit = document.querySelector(".price-per-unit");

  // if (priceExcVat) {
  //   priceExcVat.textContent = `Total Area: ${areaFt.toFixed(2)} sqft`;
  // }
  // if (priceIncVat) {
  //   priceIncVat.textContent = `Tiles Needed: ${tilesNeeded}`;
  // }
  // if (pricePerUnit) {
  //   pricePerUnit.textContent = `Price Per Tile: £${pricePerTile.toFixed(
  //     2
  //   )} | Total: £${totalPrice.toFixed(2)}`;
  // }

  // // Calculate total area using the shoelace formula
  // const areaPixels = calculateArea(mainArea.vertices);
  // const areaFt = areaPixels / pixelsPerFoot ** 2;

  // // Calculate buffer and total area
  // const bufferPercentage = 10;
  // const bufferAmount = areaFt * (bufferPercentage / 100);
  // const totalAreaWithBuffer = areaFt + bufferAmount;

  // // Calculate number of tiles needed
  // const tileArea = 1.72; // Square feet per tile
  // const tilesNeeded = Math.ceil(totalAreaWithBuffer / tileArea);

  // // Price calculations
  // const pricePerTile = 6.25;
  // const totalPrice = tilesNeeded * pricePerTile;

  // // Update UI elements
  // const priceExcVat = document.querySelector(".price-exc-vat");
  // const priceIncVat = document.querySelector(".price-inc-vat");
  // const pricePerUnit = document.querySelector(".price-per-unit");

  // if (priceExcVat) {
  //   priceExcVat.innerHTML = `
  //   Base Area: ${areaFt.toFixed(2)} sqft<br>
  //   +10% Extra: ${bufferAmount.toFixed(2)} sqft<br>
  //   <strong>Total Area: ${totalAreaWithBuffer.toFixed(2)} sqft</strong>
  // `;
  // }

  // if (priceIncVat) {
  //   priceIncVat.textContent = `Tiles Required: ${tilesNeeded} (${tileArea} sqft each)`;
  // }

  // if (pricePerUnit) {
  //   pricePerUnit.innerHTML = `
  //   Price per tile: £${pricePerTile.toFixed(2)}<br>
  //   <strong>Total Price: £${totalPrice.toFixed(2)}</strong>
  // `;
  // }

  // Calculate total area using the shoelace formula
  const areaPixels = calculateArea(mainArea.vertices);
  const areaFt = areaPixels / pixelsPerFoot ** 2;

  // Calculate number of tiles needed without a buffer
  const tileArea = 1.72; // Square feet per tile
  const tilesWithoutBuffer = Math.ceil(areaFt / tileArea);

  // Increase tile count by 10% and round up to ensure whole tiles
  const tilesNeeded = Math.ceil(tilesWithoutBuffer * 1.1);

  // Price calculations
  const pricePerTile = 6.25; // Example price per tile
  const totalPrice = tilesNeeded * pricePerTile;

  // Update UI elements with new price-info structure
  const priceExcVat = document.querySelector(".price-exc-vat");
  const priceIncVat = document.querySelector(".price-inc-vat");
  const pricePerUnit = document.querySelector(".price-per-unit");

  if (priceExcVat) {
    priceExcVat.textContent = `Total Area: ${areaFt.toFixed(2)} sqft`;
  }
  if (priceIncVat) {
    priceIncVat.textContent = `Tiles Needed (incl. 10% extra): ${tilesNeeded}`;
  }
  if (pricePerUnit) {
    pricePerUnit.textContent = `Price Per Tile: £${pricePerTile.toFixed(
      2
    )} | Total: £${totalPrice.toFixed(2)}`;
  }
}

// Update Area Dimensions
function updateAreaDimensions() {
  areaDimensionsContainer.innerHTML = "";
  if (designShape.areas && designShape.areas.length > 0) {
    const mainArea = designShape.areas[0];
    if (mainArea.segments) {
      mainArea.segments.forEach((segment) => {
        let startPoint = mainArea.vertices[segment.start];
        let endPoint = mainArea.vertices[segment.end];
        const actualLength = getSegmentLength(startPoint, endPoint);
        const dimensionText = formatDimension(actualLength);
        const midpoint = getMidpoint(startPoint, endPoint);

        const dimensionLabel = document.createElement("div");
        dimensionLabel.className = "area-dimension";
        dimensionLabel.textContent = dimensionText;

        if (segment.direction === "horizontal") {
          dimensionLabel.style.left = `${midpoint.x - 20}px`;
          dimensionLabel.style.top = `${midpoint.y - 20}px`;
        } else {
          dimensionLabel.style.left = `${midpoint.x + 10}px`;
          dimensionLabel.style.top = `${midpoint.y - 10}px`;
        }
        areaDimensionsContainer.appendChild(dimensionLabel);
      });
    }
  }
}

// Function to apply tiles dynamically to the shape, adjusting for remaining space
function applyTilesToShape() {
  paintedCells.length = 0;
  const path = getShapePath();
  const xs = designShape.vertices.map((v) => v.x);
  const ys = designShape.vertices.map((v) => v.y);
  const minX = Math.floor(Math.min(...xs) / cellSize) * cellSize;
  const maxX = Math.ceil(Math.max(...xs) / cellSize) * cellSize;
  const minY = Math.floor(Math.min(...ys) / cellSize) * cellSize;
  const maxY = Math.ceil(Math.max(...ys) / cellSize) * cellSize;

  let j = 0;
  for (let x = minX; x < maxX; x += cellSize) {
    let i = 0;
    for (let y = minY; y < maxY; y += cellSize) {
      const cellPoints = [
        { x: x + cellSize / 2, y: y + cellSize / 2 },
        { x: x, y: y },
        { x: x + cellSize, y: y },
        { x: x, y: y + cellSize },
        { x: x + cellSize, y: y + cellSize },
      ];
      const isInside = cellPoints.some((p) =>
        ctx.isPointInPath(path, p.x, p.y)
      );
      if (isInside) {
        paintedCells.push({ x, y, i, j, tileId: designShape.currentTileId });
      }
      i++;
    }
    j++;
  }
}

// Draw Design Shape with Base Color
function drawDesignShape() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);

  ctx.fillStyle = designShape.baseColor;
  ctx.fill(path);

  ctx.restore();
}

// Draw Tiles and Painted Cells with Clipping
function drawPaintedCells() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);

  // Draw tiles
  paintedCells.forEach((cell) => {
    if (cell.tileId) {
      const img = tileImages[cell.tileId];
      if (img && img.complete) {
        ctx.save();
        ctx.globalAlpha = tileOpacity;
        const cellPath = new Path2D();
        cellPath.rect(cell.x, cell.y, cellSize, cellSize);
        ctx.clip(cellPath);
        ctx.drawImage(img, cell.x, cell.y, cellSize, cellSize);
        ctx.restore();
      }
    }
  });

  // Draw patterns over tiles
  if (designShape.pattern) {
    ctx.save();
    ctx.globalAlpha = patternOpacity;
    ctx.clip(path);

    // Calculate current min coordinates of the shape
    const xs = designShape.vertices.map((v) => v.x);
    const ys = designShape.vertices.map((v) => v.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    // Update pattern transform to align with the shape's position
    designShape.pattern.setTransform(new DOMMatrix().translate(minX, minY));

    ctx.fillStyle = designShape.pattern;
    ctx.fill(path);
    ctx.restore();
  } else if (designShape.pattern) {
    ctx.save();
    ctx.globalAlpha = patternOpacity;
    ctx.clip(path);

    // For all canvas-based patterns, anchor the pattern using the stored offset (if available)
    if (
      typeof designShape.pattern.setTransform === "function" &&
      designShape.initialPatternOffset
    ) {
      designShape.pattern.setTransform(
        new DOMMatrix().translate(
          designShape.initialPatternOffset.x,
          designShape.initialPatternOffset.y
        )
      );
    }

    ctx.fillStyle = designShape.pattern;
    ctx.fill(path);
    ctx.restore();
  }

  // } else if (designShape.pattern) {
  //   ctx.save();
  //   ctx.globalAlpha = patternOpacity;

  //   // 1) Clip to the shape
  //   ctx.clip(path);

  //   // 2) Calculate the bounding box of the shape
  //   const xs = designShape.vertices.map((v) => v.x);
  //   const ys = designShape.vertices.map((v) => v.y);
  //   const minX = Math.min(...xs);
  //   const maxX = Math.max(...xs);
  //   const minY = Math.min(...ys);
  //   const maxY = Math.max(...ys);
  //   const width = maxX - minX;
  //   const height = maxY - minY;

  //   // 3) Translate the context so the pattern starts at (minX, minY)
  //   ctx.translate(minX, minY);

  //   // 4) Fill the bounding box with the repeating pattern
  //   ctx.fillStyle = designShape.pattern;
  //   ctx.fillRect(0, 0, width, height);

  //   ctx.restore();
  // }

  // Draw colors on top of patterns
  paintedCells.forEach((cell) => {
    if (cell.color) {
      ctx.save();
      ctx.globalAlpha = fillOpacity;
      ctx.fillStyle = cell.color;
      ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
      ctx.restore();
    }
  });

  ctx.restore();
}

// Draw Grid (Clipped to Shape)
function drawGrid() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  const xs = designShape.vertices.map((v) => v.x);
  const ys = designShape.vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  for (let x = minX; x <= maxX; x += cellSize) {
    ctx.moveTo(x, minY);
    ctx.lineTo(x, maxY);
  }
  for (let y = minY; y <= maxY; y += cellSize) {
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
  }
  ctx.stroke();
  ctx.restore();
}

// Draw Shape Border
function drawShapeBorder() {
  ctx.save();
  ctx.strokeStyle = designShape.borderColor || "#0000"; // Default to black if not set
  ctx.lineWidth = 10;
  const path = getShapePath();
  ctx.stroke(path);
  if (activeSidebarSection === "layouts" && designShape.areas) {
    designShape.areas.forEach((area) => {
      if (area.vertices || area.x !== undefined) {
        ctx.strokeStyle = "#0066cc";
        ctx.lineWidth = 1.5;
        const areaPath = getAreaPath(area);
        ctx.stroke(areaPath);
      }
    });
  }
  ctx.restore();
}

// Redraw Canvas
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawDesignShape();
  drawPaintedCells();
  drawGrid();
  drawShapeBorder();
}

// Create and Update Reshape Handles
function createHandles() {
  // Remove existing handles
  document
    .querySelectorAll(
      ".resize-handle, .side-handle, .area-handle, .reshape-handle"
    )
    .forEach((handle) => handle.remove());

  if (!designShape.areas || designShape.areas.length === 0) return;

  const mainArea = designShape.areas[0];
  if (!mainArea.vertices) return;

  // Calculate scaling factors
  const scaleX = canvas.clientWidth / canvas.width;
  const scaleY = canvas.clientHeight / canvas.height;

  // Vertex (corner) handles
  mainArea.vertices.forEach((vertex, vertexIndex) => {
    const handle = document.createElement("div");
    handle.className = "reshape-handle corner-handle";
    handle.setAttribute("data-vertex-index", vertexIndex);
    // Position in display coordinates
    handle.style.left = vertex.x * scaleX + "px";
    handle.style.top = vertex.y * scaleY + "px";
    canvasContainer.appendChild(handle);
  });

  // Midpoint (segment) handles
  if (mainArea.segments) {
    mainArea.segments.forEach((segment, segmentIndex) => {
      if (segment.start !== undefined && segment.end !== undefined) {
        const startPoint = mainArea.vertices[segment.start];
        const endPoint = mainArea.vertices[segment.end];
        const midpoint = getMidpoint(startPoint, endPoint);
        const handle = document.createElement("div");
        handle.className = "reshape-handle midpoint-handle";
        handle.setAttribute("data-segment-index", segmentIndex);
        // Position in display coordinates
        handle.style.left = midpoint.x * scaleX + "px";
        handle.style.top = midpoint.y * scaleY + "px";
        canvasContainer.appendChild(handle);
      }
    });
  }
}

function updateHandles() {
  if (!designShape.areas || designShape.areas.length === 0) return;

  const mainArea = designShape.areas[0];
  if (!mainArea.vertices) return;

  // Calculate scaling factors
  const scaleX = canvas.clientWidth / canvas.width;
  const scaleY = canvas.clientHeight / canvas.height;

  // Update vertex handles
  mainArea.vertices.forEach((vertex, vertexIndex) => {
    const handle = document.querySelector(
      `.reshape-handle[data-vertex-index="${vertexIndex}"]`
    );
    if (handle) {
      handle.style.left = vertex.x * scaleX + "px";
      handle.style.top = vertex.y * scaleY + "px";
    }
  });

  // Update midpoint handles
  if (mainArea.segments) {
    mainArea.segments.forEach((segment, segmentIndex) => {
      if (segment.start !== undefined && segment.end !== undefined) {
        const startPoint = mainArea.vertices[segment.start];
        const endPoint = mainArea.vertices[segment.end];
        const midpoint = getMidpoint(startPoint, endPoint);
        const handle = document.querySelector(
          `.reshape-handle[data-segment-index="${segmentIndex}"]`
        );
        if (handle) {
          handle.style.left = midpoint.x * scaleX + "px";
          handle.style.top = midpoint.y * scaleY + "px";
        }
      }
    });
  }
}

// Generate Layout Options
function generateLayoutOptions() {
  const layoutGrid = document.getElementById("layoutGrid");
  layoutGrid.innerHTML = "";
  layouts.forEach((layout) => {
    const layoutOption = document.createElement("div");
    layoutOption.className = "layout-option";
    layoutOption.setAttribute("data-layout", layout.id);
    if (layout.id === designShape.type) layoutOption.classList.add("active");

    const layoutImage = document.createElement("img");
    layoutImage.className = "layout-image";
    layoutImage.src = layout.image;
    layoutImage.alt = layout.id;

    const layoutLabel = document.createElement("span");
    layoutLabel.className = "layout-label";
    layoutLabel.textContent = layout.id.replace(/-/g, " ");

    layoutOption.appendChild(layoutImage);
    layoutOption.appendChild(layoutLabel);
    layoutGrid.appendChild(layoutOption);

    layoutOption.addEventListener("click", () => {
      document
        .querySelectorAll(".layout-option")
        .forEach((opt) => opt.classList.remove("active"));
      layoutOption.classList.add("active");
      designShape.type = layout.id;
      const areas = getInitialAreas(layout.id);
      if (areas.length > 0 && areas[0].vertices) {
        designShape.vertices = [...areas[0].vertices];
        designShape.areas = areas;
      }
      applyTilesToShape(); // Apply tiles after layout change
      createHandles();
      redrawCanvas();
      updateDimensions();
    });
  });
}

// Generate Pattern Options
function generatePatternOptions() {
  const patternGrid = document.getElementById("patternGrid");
  patternGrid.innerHTML = "";
  patterns.forEach((pattern) => {
    const patternOption = document.createElement("div");
    patternOption.className = "pattern-option";
    patternOption.setAttribute("data-pattern", pattern.id);

    const patternImage = document.createElement("img");
    patternImage.className = "pattern-image";
    patternImage.src = pattern.image;
    patternImage.alt = pattern.name;

    const patternLabel = document.createElement("span");
    patternLabel.className = "pattern-label";
    patternLabel.textContent = pattern.name;

    patternOption.appendChild(patternImage);
    patternOption.appendChild(patternLabel);
    patternGrid.appendChild(patternOption);

    patternOption.addEventListener("click", async () => {
      document
        .querySelectorAll(".pattern-option")
        .forEach((opt) => opt.classList.remove("active"));
      patternOption.classList.add("active");

      if (pattern.name === "Pattern 1") {
        designShape.pattern = createPattern1(ctx);
        designShape.patternImage = null;
        designShape.activePatternName = pattern.name;
      } else if (pattern.name === "Pattern 2") {
        designShape.pattern = createPattern2(ctx);
        designShape.patternImage = null;
        designShape.activePatternName = pattern.name;
      } else if (pattern.name === "Pattern 3") {
        designShape.pattern = createPattern3(ctx);
        designShape.patternImage = null;
        designShape.activePatternName = pattern.name;
      } else if (pattern.name === "Pattern 4") {
        designShape.pattern = createPattern4(ctx);
        designShape.patternImage = null;
        designShape.activePatternName = pattern.name;
      } else if (pattern.name === "Pattern 5") {
        designShape.pattern = createPattern5(ctx);
        designShape.patternImage = null;
        designShape.activePatternName = pattern.name;
      } else if (pattern.name === "Pattern 6") {
        designShape.pattern = createPattern6(ctx);
        designShape.patternImage = null;
        designShape.activePatternName = pattern.name;
      } else {
        const img = await loadPatternImage(pattern.image);
        // Create a repeating pattern from the image
        designShape.pattern = ctx.createPattern(img, "repeat");
        designShape.patternImage = null;

        // Align pattern with the shape's position
        const xs = designShape.vertices.map((v) => v.x);
        const ys = designShape.vertices.map((v) => v.y);
        designShape.initialPatternOffset = {
          x: Math.min(...xs),
          y: Math.min(...ys),
        };
      }

      // For all non-image patterns, store the initial offset (anchor)
      if (
        designShape.pattern &&
        typeof designShape.pattern.setTransform === "function"
      ) {
        const xs = designShape.vertices.map((v) => v.x);
        const ys = designShape.vertices.map((v) => v.y);
        designShape.initialPatternOffset = {
          x: Math.min(...xs),
          y: Math.min(...ys),
        };
      }

      redrawCanvas();
    });
  });
}

// Generate Tile Type Options
function generateTileTypeOptions() {
  const tileTypeGrid = document.getElementById("tileTypeGrid");
  tileTypeGrid.innerHTML = "";
  tileTypes.forEach((tileType) => {
    const tileTypeOption = document.createElement("div");
    tileTypeOption.className = "tile-type-option";
    tileTypeOption.setAttribute("data-tile-type", tileType.id);
    if (tileType.id === designShape.currentTileId)
      tileTypeOption.classList.add("active");

    const tileTypeImage = document.createElement("img");
    tileTypeImage.className = "tile-type-image";
    tileTypeImage.src = tileType.image;
    tileTypeImage.alt = tileType.name;

    const tileTypeLabel = document.createElement("span");
    tileTypeLabel.className = "tile-type-label";
    tileTypeLabel.textContent = tileType.name;

    tileTypeOption.appendChild(tileTypeImage);
    tileTypeOption.appendChild(tileTypeLabel);
    tileTypeGrid.appendChild(tileTypeOption);

    tileTypeOption.addEventListener("click", () => {
      document
        .querySelectorAll(".tile-type-option")
        .forEach((opt) => opt.classList.remove("active"));
      tileTypeOption.classList.add("active");
      designShape.currentTileId = tileType.id;
      applyTilesToShape(); // Apply new tile type
      redrawCanvas();
    });
  });
}

// Generate Color Swatches
function generateColorSwatches() {
  const colorSwatches = document.getElementById("colorSwatches");
  colorSwatches.innerHTML = "";
  colors.forEach((color) => {
    const colorSwatch = document.createElement("div");
    colorSwatch.className = "color-swatch";
    colorSwatch.setAttribute("data-color", color.id);
    colorSwatch.style.backgroundColor = color.value;
    if (color.value === paintColor) colorSwatch.classList.add("active");

    colorSwatches.appendChild(colorSwatch);

    colorSwatch.addEventListener("click", () => {
      document
        .querySelectorAll(".color-swatch")
        .forEach((swatch) => swatch.classList.remove("active"));
      colorSwatch.classList.add("active");
      paintColor = color.value;
    });
  });
}

// Generate Edge Color Options
function generateEdgeColorOptions() {
  const edgeColorGrid = document.getElementById("edgeColorGrid");
  edgeColorGrid.innerHTML = "";
  edgeColors.forEach((color) => {
    const colorSwatch = document.createElement("div");
    colorSwatch.className = "edge-color-swatch";
    colorSwatch.setAttribute("data-color", color.id);
    colorSwatch.style.backgroundColor = color.value;
    if (color.value === designShape.borderColor)
      colorSwatch.classList.add("active");

    edgeColorGrid.appendChild(colorSwatch);

    colorSwatch.addEventListener("click", () => {
      document
        .querySelectorAll(".edge-color-swatch")
        .forEach((swatch) => swatch.classList.remove("active"));
      colorSwatch.classList.add("active");
      designShape.borderColor = color.value;
      redrawCanvas();
    });
  });
}

// Sidebar Interactions
function setupSidebarInteractions() {
  sidebarItems.forEach((item) => {
    const header = item.querySelector(".sidebar-header");
    header.addEventListener("click", () => {
      const section = item.getAttribute("data-section");
      if (item.classList.contains("active")) {
        item.classList.remove("active");
        const arrow = item.querySelector(".sidebar-arrow i");
        if (arrow) arrow.className = "ri-arrow-down-s-line";
        return;
      }
      sidebarItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
        const arrow = otherItem.querySelector(".sidebar-arrow i");
        if (arrow) arrow.className = "ri-arrow-down-s-line";
      });
      item.classList.add("active");
      const arrow = item.querySelector(".sidebar-arrow i");
      if (arrow) arrow.className = "ri-arrow-up-s-line";
      activeSidebarSection = section;
      currentStep = steps.indexOf(section);
      canvasContainer.classList.toggle(
        "resize-handles-hidden",
        section !== "layouts"
      );
    });
  });
}

// Update Active Step
function updateActiveStep(step) {
  sidebarItems.forEach((item) => {
    item.classList.remove("active");
    const arrow = item.querySelector(".sidebar-arrow i");
    if (arrow) arrow.className = "ri-arrow-down-s-line";
  });
  const activeItem = document.querySelector(
    `.sidebar-item[data-section="${steps[step]}"]`
  );
  if (activeItem) {
    activeItem.classList.add("active");
    const arrow = activeItem.querySelector(".sidebar-arrow i");
    if (arrow) arrow.className = "ri-arrow-up-s-line";
  }
  canvasContainer.classList.toggle(
    "resize-handles-hidden",
    steps[step] !== "layouts"
  );
  activeSidebarSection = steps[step];
}

// Cell Painting Functionality (Only for Colors)
canvas.addEventListener("click", (e) => {
  if (activeSidebarSection !== "colors") return;

  const rect = canvas.getBoundingClientRect();
  // Calculate scaling factors
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  // Convert to canvas internal coordinates
  const clickX = (e.clientX - rect.left) * scaleX;
  const clickY = (e.clientY - rect.top) * scaleY;

  const path = getShapePath();

  if (!ctx.isPointInPath(path, clickX, clickY)) return;

  // Calculate grid origin based on current shape vertices
  const xs = designShape.vertices.map((v) => v.x);
  const ys = designShape.vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  // Adjust click coordinates to grid origin and calculate cell indices
  const gridX = clickX - minX;
  const gridY = clickY - minY;
  const cellI = Math.floor(gridX / cellSize);
  const cellJ = Math.floor(gridY / cellSize);

  // Compute cell coordinates relative to the grid's origin
  const cellX = minX + cellI * cellSize;
  const cellY = minY + cellJ * cellSize;

  const existingCellIndex = paintedCells.findIndex(
    (cell) => cell.x === cellX && cell.y === cellY
  );
  let cell;
  if (existingCellIndex !== -1) {
    cell = paintedCells[existingCellIndex];
  } else {
    cell = { x: cellX, y: cellY, tileId: designShape.currentTileId }; // Include tile by default
    paintedCells.push(cell);
  }

  if (activeSidebarSection === "colors") {
    cell.color = paintColor; // Apply color, keep tile
  }

  redrawCanvas();
});

// Handle Reshape Functionality
canvasContainer.addEventListener("mousedown", (e) => {
  if (activeSidebarSection !== "layouts") return;
  if (e.target.classList.contains("reshape-handle")) {
    if (e.target.classList.contains("corner-handle")) {
      const vertexIndex = parseInt(e.target.getAttribute("data-vertex-index"));
      activeHandle = { type: "vertex", vertexIndex };
    } else if (e.target.classList.contains("midpoint-handle")) {
      const segmentIndex = parseInt(
        e.target.getAttribute("data-segment-index")
      );
      const mainArea = designShape.areas[0];
      const segment = mainArea.segments[segmentIndex];
      activeHandle = { type: "segment", segmentIndex };
    }
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startShape = JSON.parse(JSON.stringify(designShape));
    e.stopPropagation();
    e.preventDefault();
  }
});

document.addEventListener("mousemove", (e) => {
  if (activeHandle === null) return;

  // Calculate scaling factors
  const scaleX = canvas.width / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;

  // Movement in screen coordinates
  const dxScreen = e.clientX - startMouseX;
  const dyScreen = e.clientY - startMouseY;

  // Convert to canvas coordinates
  const dx = dxScreen * scaleX;
  const dy = dyScreen * scaleY;

  if (activeHandle.type === "vertex") {
    const vertexIndex = activeHandle.vertexIndex;
    const mainArea = designShape.areas[0];
    if (mainArea && mainArea.vertices && mainArea.vertices[vertexIndex]) {
      mainArea.vertices[vertexIndex].x = Math.max(
        0,
        Math.min(canvas.width, startShape.areas[0].vertices[vertexIndex].x + dx)
      );
      mainArea.vertices[vertexIndex].y = Math.max(
        0,
        Math.min(
          canvas.height,
          startShape.areas[0].vertices[vertexIndex].y + dy
        )
      );
      designShape.vertices = [...mainArea.vertices];
      if (mainArea.segments) {
        mainArea.segments.forEach((segment) => {
          if (segment.start === vertexIndex || segment.end === vertexIndex) {
            const startPoint = mainArea.vertices[segment.start];
            const endPoint = mainArea.vertices[segment.end];
            segment.length = getSegmentLength(startPoint, endPoint);
          }
        });
      }
    }
  } else if (activeHandle.type === "segment") {
    const segmentIndex = activeHandle.segmentIndex;
    const mainArea = designShape.areas[0];
    if (mainArea && mainArea.segments && mainArea.segments[segmentIndex]) {
      const segment = mainArea.segments[segmentIndex];
      const startVertex = mainArea.vertices[segment.start];
      const endVertex = mainArea.vertices[segment.end];
      if (segment.direction === "horizontal") {
        // Move vertically
        startVertex.y = Math.max(
          0,
          Math.min(
            canvas.height,
            startShape.areas[0].vertices[segment.start].y + dy
          )
        );
        endVertex.y = Math.max(
          0,
          Math.min(
            canvas.height,
            startShape.areas[0].vertices[segment.end].y + dy
          )
        );
      } else {
        // Move horizontally
        startVertex.x = Math.max(
          0,
          Math.min(
            canvas.width,
            startShape.areas[0].vertices[segment.start].x + dx
          )
        );
        endVertex.x = Math.max(
          0,
          Math.min(
            canvas.width,
            startShape.areas[0].vertices[segment.end].x + dx
          )
        );
      }
      designShape.vertices = [...mainArea.vertices];
      segment.length = getSegmentLength(startVertex, endVertex);
    }
  }

  redrawCanvas();
  updateHandles();
  updateDimensions();
});

document.addEventListener("mouseup", () => {
  if (activeHandle !== null) {
    applyTilesToShape(); // Reapply tiles after reshaping
    redrawCanvas();
  }
  activeHandle = null;
});

// Navigation Buttons
document.querySelector(".next-btn").addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    currentStep++;
    updateActiveStep(currentStep);
  }
});

document.querySelector(".back-btn").addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updateActiveStep(currentStep);
  }
});

// Resize Canvas for Responsiveness
function resizeCanvas() {
  // Make sure canvasContainer is correctly referenced (or use document.getElementById)
  const container = document.getElementById("canvasContainer");

  // These values are now defined by the CSS calc() values.
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  if (
    Math.abs(canvas.width - containerWidth) > 50 ||
    Math.abs(canvas.height - containerHeight) > 50
  ) {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    if (designShape.vertices.length > 0) {
      const scaleX = containerWidth / oldWidth;
      const scaleY = containerHeight / oldHeight;

      designShape.vertices.forEach((vertex) => {
        vertex.x *= scaleX;
        vertex.y *= scaleY;
      });

      if (designShape.areas) {
        designShape.areas.forEach((area) => {
          if (area.vertices) {
            area.vertices.forEach((vertex) => {
              vertex.x *= scaleX;
              vertex.y *= scaleY;
            });
            area.segments.forEach((segment) => {
              const startPoint = area.vertices[segment.start];
              const endPoint = area.vertices[segment.end];
              segment.length = getSegmentLength(startPoint, endPoint);
            });
          }
        });
      }

      applyTilesToShape(); // Reapply tiles after resize
    } else {
      designShape.vertices = getInitialAreas(designShape.type)[0].vertices;
    }

    createHandles();
    redrawCanvas();
    updateDimensions();
  }
}

window.addEventListener("resize", resizeCanvas);

function calculateArea(vertices) {
  let area = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  area = Math.abs(area) / 2;
  return area; // Area in pixels
}

// Initialize Application
function init() {
  // Preload tile images
  tileTypes.forEach((tile) => {
    const img = new Image();
    img.src = tile.image;
    tileImages[tile.id] = img;
  });

  const areas = getInitialAreas("rectangle");
  if (areas.length > 0 && areas[0].vertices) {
    designShape.vertices = [...areas[0].vertices];
    designShape.areas = areas;
  }
  applyTilesToShape(); // Apply tiles on initial load
  generateLayoutOptions();
  generatePatternOptions();
  generateTileTypeOptions();
  generateColorSwatches();
  generateEdgeColorOptions();
  setupSidebarInteractions();
  updateActiveStep(currentStep);
  createHandles();
  redrawCanvas();
  updateDimensions();
  resizeCanvas();
}

init();

// window.addEventListener("load", init);
