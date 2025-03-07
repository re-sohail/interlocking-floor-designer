// Canvas & Context
const canvas = document.getElementById("designCanvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvasContainer");
const areaDimensionsContainer = document.getElementById("areaDimensions");

// Dimension Labels
const topDim = document.querySelector(".top-dim");
const rightDim = document.querySelector(".right-dim");
const bottomDim = document.querySelector(".bottom-dim");
const leftDim = document.querySelector(".left-dim");

// Controls
const dimensionsDisplay = document.getElementById("dimensions");

// Sidebar Items
const sidebarItems = document.querySelectorAll(".sidebar-item");

// Settings
const cellSize = 30;
const fillOpacity = 0.8;
const pixelsPerFoot = 100;

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
  patternImage: null, // Store the loaded image instead of a pattern
  tileType: "standard",
  baseColor: "#000000",
};

// Painted Cells
const paintedCells = [];

// Data Arrays
const layouts = [
  { id: "rectangle", image: "./media/svg/layouts/layout1.svg" },
  { id: "l-shape", image: "./media/svg/layouts/layout2.svg" },
  { id: "u-shape", image: "./media/svg/layouts/layout3.svg" },
  { id: "double-legged-rectangle", image: "./media/svg/layouts/layout4.svg" },
];

// Patterns array with images (including custom ones)
const patterns = [
  { id: "1", image: "./media/svg/patterns/nopattern.svg", name: "Pattern 1" },
  {
    id: "1",
    image: "./media/svg/patterns/checkedpattern.svg",
    name: "Pattern 2",
  },
];

const tileTypes = [
  {
    id: "standard",
    name: "Standard Tile",
    image: "/placeholder.svg?height=60&width=80",
  },
  {
    id: "premium",
    name: "Premium Tile",
    image: "/placeholder.svg?height=60&width=80",
  },
  {
    id: "ceramic",
    name: "Ceramic Tile",
    image: "/placeholder.svg?height=60&width=80",
  },
  {
    id: "porcelain",
    name: "Porcelain Tile",
    image: "/placeholder.svg?height=60&width=80",
  },
  {
    id: "vinyl",
    name: "Vinyl Tile",
    image: "/placeholder.svg?height=60&width=80",
  },
];

const colors = [
  { id: "red", value: "#ff0000", name: "Red" },
  { id: "blue", value: "#0000ff", name: "Blue" },
  { id: "green", value: "#008000", name: "Green" },
  { id: "purple", value: "#800080", name: "Purple" },
  { id: "black", value: "#000000", name: "Black" },
  { id: "gray", value: "#808080", name: "Gray" },
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

// Function to create a checkerboard pattern
function createCheckerboardPattern(ctx) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize * 2;
  patternCanvas.height = cellSize * 2;
  const patternCtx = patternCanvas.getContext("2d");

  patternCtx.fillStyle = "#CCCCCC";
  patternCtx.fillRect(0, 0, cellSize * 2, cellSize * 2);
  patternCtx.fillStyle = "red";
  patternCtx.fillRect(0, 0, cellSize, cellSize);
  patternCtx.fillRect(cellSize, cellSize, cellSize, cellSize);

  return ctx.createPattern(patternCanvas, "repeat");
}

// Function to create a color checkerboard pattern
function createColoredCheckerboardPattern(ctx, color) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize * 2;
  patternCanvas.height = cellSize * 2;
  const patternCtx = patternCanvas.getContext("2d");

  patternCtx.fillStyle = color;
  patternCtx.fillRect(0, 0, cellSize * 2, cellSize * 2);
  patternCtx.fillStyle = color;
  patternCtx.fillRect(0, 0, cellSize, cellSize);
  patternCtx.fillRect(cellSize, cellSize, cellSize, cellSize);

  return ctx.createPattern(patternCanvas, "repeat");
}

// Function to create the default grid pattern with a yellow inner square
function createGridPattern(ctx) {
  const gridCount = 10;
  const canvasSize = cellSize * gridCount;

  console.log("Creating grid pattern", cellSize, gridCount, canvasSize);
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = canvasSize;
  patternCanvas.height = canvasSize;
  const patternCtx = patternCanvas.getContext("2d");

  // Fill the background with white
  patternCtx.fillStyle = "#FFFFFF";
  patternCtx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw light gray grid lines
  patternCtx.strokeStyle = "lightgray";
  patternCtx.lineWidth = 1;
  for (let i = 0; i <= gridCount; i++) {
    // Vertical grid lines
    patternCtx.beginPath();
    patternCtx.moveTo(i * cellSize, 0);
    patternCtx.lineTo(i * cellSize, canvasSize);
    patternCtx.stroke();

    // Horizontal grid lines
    patternCtx.beginPath();
    patternCtx.moveTo(0, i * cellSize);
    patternCtx.lineTo(canvasSize, i * cellSize);
    patternCtx.stroke();
  }

  // Draw the thick red border around the entire grid
  const redBorderWidth = 20;
  patternCtx.strokeStyle = "red";
  patternCtx.lineWidth = redBorderWidth;
  // Stroke rectangle is offset by half the border width
  patternCtx.strokeRect(
    redBorderWidth / 2,
    redBorderWidth / 2,
    canvasSize - redBorderWidth,
    canvasSize - redBorderWidth
  );

  // Draw the bold yellow inner square (inset by two cells from each side)
  const yellowBorderWidth = 30;
  patternCtx.strokeStyle = "yellow";
  patternCtx.lineWidth = yellowBorderWidth;
  // The inner square spans from the 3rd cell to the 8th cell (1-indexed)
  patternCtx.strokeRect(
    2 * cellSize + yellowBorderWidth / 2,
    2 * cellSize + yellowBorderWidth / 2,
    (gridCount - 4) * cellSize - yellowBorderWidth,
    (gridCount - 4) * cellSize - yellowBorderWidth
  );

  return ctx.createPattern(patternCanvas, "repeat");
}

// replacing the yellow inner square with the selected color.
function createColoredGridPattern(ctx, color) {
  const gridCount = 10;
  const canvasSize = cellSize * gridCount;
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = canvasSize;
  patternCanvas.height = canvasSize;
  const patternCtx = patternCanvas.getContext("2d");

  // White background
  patternCtx.fillStyle = color;
  patternCtx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw light gray grid lines
  patternCtx.strokeStyle = "lightgray";
  patternCtx.lineWidth = 1;
  for (let i = 0; i <= gridCount; i++) {
    // Vertical grid lines
    patternCtx.beginPath();
    patternCtx.moveTo(i * cellSize, 0);
    patternCtx.lineTo(i * cellSize, canvasSize);
    patternCtx.stroke();

    // Horizontal grid lines
    patternCtx.beginPath();
    patternCtx.moveTo(0, i * cellSize);
    patternCtx.lineTo(canvasSize, i * cellSize);
    patternCtx.stroke();
  }

  // Draw the thick red border around the entire grid (unchanged)
  const redBorderWidth = 30;
  patternCtx.strokeStyle = "red";
  patternCtx.lineWidth = redBorderWidth;
  patternCtx.strokeRect(
    redBorderWidth / 2,
    redBorderWidth / 2,
    canvasSize - redBorderWidth,
    canvasSize - redBorderWidth
  );

  // Draw the inner square with the selected color (replacing yellow)
  const innerBorderWidth = 30;
  patternCtx.strokeStyle = color;
  patternCtx.lineWidth = innerBorderWidth;
  patternCtx.strokeRect(
    2 * cellSize + innerBorderWidth / 2,
    2 * cellSize + innerBorderWidth / 2,
    (gridCount - 4) * cellSize - innerBorderWidth,
    (gridCount - 4) * cellSize - innerBorderWidth
  );

  return ctx.createPattern(patternCanvas, "repeat");
}

// Function to create a striped pattern
function createStripedPattern(
  ctx,
  stripeColor = "#000000",
  backgroundColor = "#FFFFFF"
) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize;
  patternCanvas.height = cellSize;
  const patternCtx = patternCanvas.getContext("2d");

  patternCtx.fillStyle = backgroundColor;
  patternCtx.fillRect(0, 0, cellSize, cellSize);
  patternCtx.fillStyle = stripeColor;
  patternCtx.fillRect(0, 0, cellSize, cellSize / 2);

  return ctx.createPattern(patternCanvas, "repeat");
}

// Function to create a dotted pattern
function createDottedPattern(
  ctx,
  dotColor = "#000000",
  backgroundColor = "#FFFFFF"
) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize;
  patternCanvas.height = cellSize;
  const patternCtx = patternCanvas.getContext("2d");

  patternCtx.fillStyle = backgroundColor;
  patternCtx.fillRect(0, 0, cellSize, cellSize);
  patternCtx.fillStyle = dotColor;
  patternCtx.beginPath();
  patternCtx.arc(cellSize / 2, cellSize / 2, cellSize / 4, 0, Math.PI * 2);
  patternCtx.fill();

  return ctx.createPattern(patternCanvas, "repeat");
}

// Define Initial Areas for Each Shape (unchanged)
function getInitialAreas(type) {
  const width = 400;
  const height = 300;
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;

  switch (type) {
    case "rectangle":
      return [
        {
          id: "main",
          vertices: [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x + width, y: y + height },
            { x: x, y: y + height },
          ],
          width: width,
          height: height,
          x: x,
          y: y,
          segments: [
            {
              id: "top",
              start: 0,
              end: 1,
              length: width,
              direction: "horizontal",
            },
            {
              id: "right",
              start: 1,
              end: 2,
              length: height,
              direction: "vertical",
            },
            {
              id: "bottom",
              start: 2,
              end: 3,
              length: width,
              direction: "horizontal",
            },
            {
              id: "left",
              start: 3,
              end: 0,
              length: height,
              direction: "vertical",
            },
          ],
        },
      ];
    case "l-shape":
      const legWidth = width / 2;
      const legHeight = height / 2;
      return [
        {
          id: "main",
          vertices: [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x + width, y: y + legHeight },
            { x: x + legWidth, y: y + legHeight },
            { x: x + legWidth, y: y + height },
            { x: x, y: y + height },
          ],
          segments: [
            {
              id: "top",
              start: 0,
              end: 1,
              length: width,
              direction: "horizontal",
            },
            {
              id: "right-top",
              start: 1,
              end: 2,
              length: legHeight,
              direction: "vertical",
            },
            {
              id: "inner-top",
              start: 2,
              end: 3,
              length: width - legWidth,
              direction: "horizontal",
            },
            {
              id: "inner-left",
              start: 3,
              end: 4,
              length: height - legHeight,
              direction: "vertical",
            },
            {
              id: "bottom",
              start: 4,
              end: 5,
              length: legWidth,
              direction: "horizontal",
            },
            {
              id: "left",
              start: 5,
              end: 0,
              length: height,
              direction: "vertical",
            },
          ],
        },
      ];
    case "u-shape":
      const uLegWidth = width / 4;
      return [
        {
          id: "main",
          vertices: [
            { x: x, y: y },
            { x: x + uLegWidth, y: y },
            { x: x + uLegWidth, y: y + height / 2 },
            { x: x + width - uLegWidth, y: y + height / 2 },
            { x: x + width - uLegWidth, y: y },
            { x: x + width, y: y },
            { x: x + width, y: y + height },
            { x: x, y: y + height },
          ],
          segments: [
            {
              id: "top-left",
              start: 0,
              end: 1,
              length: uLegWidth,
              direction: "horizontal",
            },
            {
              id: "inner-left-vertical",
              start: 1,
              end: 2,
              length: height / 2,
              direction: "vertical",
            },
            {
              id: "inner-bottom",
              start: 2,
              end: 3,
              length: width - 2 * uLegWidth,
              direction: "horizontal",
            },
            {
              id: "inner-right-vertical",
              start: 3,
              end: 4,
              length: height / 2,
              direction: "vertical",
            },
            {
              id: "top-right",
              start: 4,
              end: 5,
              length: uLegWidth,
              direction: "horizontal",
            },
            {
              id: "right",
              start: 5,
              end: 6,
              length: height,
              direction: "vertical",
            },
            {
              id: "bottom",
              start: 6,
              end: 7,
              length: width,
              direction: "horizontal",
            },
            {
              id: "left",
              start: 7,
              end: 0,
              length: height,
              direction: "vertical",
            },
          ],
        },
      ];
    case "double-legged-rectangle":
      const dlrLegWidth = width / 4;
      const dlrLegHeight = height / 4;
      return [
        {
          id: "main",
          vertices: [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x + width, y: y + height },
            { x: x + width - dlrLegWidth, y: y + height },
            { x: x + width - dlrLegWidth, y: y + height + dlrLegHeight },
            { x: x + dlrLegWidth, y: y + height + dlrLegHeight },
            { x: x + dlrLegWidth, y: y + height },
            { x: x, y: y + height },
          ],
          segments: [
            {
              id: "top",
              start: 0,
              end: 1,
              length: width,
              direction: "horizontal",
            },
            {
              id: "right",
              start: 1,
              end: 2,
              length: height,
              direction: "vertical",
            },
            {
              id: "bottom-right",
              start: 2,
              end: 3,
              length: dlrLegWidth,
              direction: "horizontal",
            },
            {
              id: "right-extension",
              start: 3,
              end: 4,
              length: dlrLegHeight,
              direction: "vertical",
            },
            {
              id: "bottom-extension",
              start: 4,
              end: 5,
              length: width - 2 * dlrLegWidth,
              direction: "horizontal",
            },
            {
              id: "left-extension",
              start: 5,
              end: 6,
              length: dlrLegHeight,
              direction: "vertical",
            },
            {
              id: "bottom-left",
              start: 6,
              end: 7,
              length: dlrLegWidth,
              direction: "horizontal",
            },
            {
              id: "left",
              start: 7,
              end: 0,
              length: height,
              direction: "vertical",
            },
          ],
        },
      ];
    default:
      return [];
  }
}

// Create Shape Path from Vertices (unchanged)
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

// Get Area Path (unchanged)
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

// Calculate midpoint between two points (unchanged)
function getMidpoint(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

// Calculate segment length (unchanged)
function getSegmentLength(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Format dimension as feet and inches (unchanged)
function formatDimension(pixels) {
  const totalInches = (pixels / pixelsPerFoot) * 12;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

// Update Dimensions Display (unchanged)
function updateDimensions() {
  document
    .querySelectorAll(".dimension-label")
    .forEach((label) => label.remove());
  if (!designShape.areas || designShape.areas.length === 0) return;
  const mainArea = designShape.areas[0];
  if (!mainArea.segments) return;

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

    const M = {
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2,
    };
    const D = { x: endPoint.x - startPoint.x, y: endPoint.y - startPoint.y };
    const N = { x: D.y, y: -D.x };
    const magN = Math.sqrt(N.x * N.x + N.y * N.y);
    if (magN === 0) return;
    const U = { x: N.x / magN, y: N.y / magN };
    const k = 20;
    const P = { x: M.x + k * U.x, y: M.y + k * U.y };

    canvasContainer.appendChild(dimensionLabel);
    const width = dimensionLabel.offsetWidth;
    const height = dimensionLabel.offsetHeight;
    const adjustedK = Math.max(k, height / 2 + 5);
    const finalP = { x: M.x + adjustedK * U.x, y: M.y + adjustedK * U.y };

    dimensionLabel.style.left = `${finalP.x - width / 2}px`;
    dimensionLabel.style.top = `${finalP.y - height / 2}px`;
  });

  const xs = mainArea.vertices.map((v) => v.x);
  const ys = mainArea.vertices.map((v) => v.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const areaFt = (width * height) / pixelsPerFoot ** 2;
  dimensionsDisplay.textContent = `Total Area: ${areaFt.toFixed(2)} ft²`;
}

// Update Area Dimensions (unchanged)
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

// Draw Design Shape with Pattern
function drawDesignShape() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);

  // Fill with base color first.
  ctx.fillStyle = designShape.baseColor;
  ctx.fill(path);

  // If a code-based pattern is selected, use it.
  if (designShape.pattern) {
    ctx.fillStyle = designShape.pattern;
    ctx.fill(path);
  }
  // Else, if an SVG image pattern is selected, draw it.
  else if (designShape.patternImage) {
    const img = designShape.patternImage;
    // Calculate the bounding box of the shape.
    const xs = designShape.vertices.map((v) => v.x);
    const ys = designShape.vertices.map((v) => v.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    ctx.drawImage(img, minX, minY, width, height);
  }

  ctx.restore();
}

// Draw Grid (Clipped to Shape) (unchanged)
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

// Draw Painted Cells
// function drawPaintedCells() {
//   ctx.save();
//   const path = getShapePath();
//   ctx.clip(path);

//   paintedCells.forEach((cell) => {
//     // Draw the pattern if the cell is within a patterned area
//     if (designShape.pattern && !cell.color) {
//       const tempCanvas = document.createElement("canvas");
//       tempCanvas.width = cellSize;
//       tempCanvas.height = cellSize;
//       const tempCtx = tempCanvas.getContext("2d");
//       tempCtx.fillStyle = designShape.pattern;
//       tempCtx.fillRect(0, 0, cellSize, cellSize);
//       ctx.drawImage(tempCanvas, cell.x, cell.y);
//     }
//     // Overlay with painted color if present
//     if (cell.color) {
//       ctx.fillStyle = hexToRgba(cell.color, fillOpacity);
//       ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
//     }
//   });

//   ctx.restore();
// }

function drawPaintedCells() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);

  paintedCells.forEach((cell) => {
    // If no paint override exists, draw the global pattern.
    if (designShape.pattern && !cell.color) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = cellSize;
      tempCanvas.height = cellSize;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.fillStyle = designShape.pattern;
      tempCtx.fillRect(0, 0, cellSize, cellSize);
      ctx.drawImage(tempCanvas, cell.x, cell.y);
    }
    // If a cell is painted, update its pattern.
    if (cell.color) {
      if (designShape.activePatternName === "Pattern 1") {
        // Draw the pattern if the cell is within a patterned area
        const coloredPattern = createColoredGridPattern(ctx, cell.color);
        ctx.fillStyle = coloredPattern;
        ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
      } else if (designShape.activePatternName === "Pattern 2") {
        // Generate a colored version of the checkerboard.
        const coloredPattern = createColoredCheckerboardPattern(
          ctx,
          cell.color
        );
        ctx.fillStyle = coloredPattern;
        ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
      } else {
        // For other patterns, override with a solid fill.
        ctx.fillStyle = hexToRgba(cell.color, fillOpacity);
        ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
      }
    }
  });

  ctx.restore();
}

// Draw Shape Border (unchanged)
function drawShapeBorder() {
  ctx.save();
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 3;
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

// Create and Update Reshape Handles (unchanged)
function createHandles() {
  document
    .querySelectorAll(
      ".resize-handle, .side-handle, .area-handle, .reshape-handle"
    )
    .forEach((handle) => handle.remove());
  if (designShape.areas && designShape.areas.length > 0) {
    const mainArea = designShape.areas[0];
    if (mainArea.vertices) {
      mainArea.vertices.forEach((vertex, vertexIndex) => {
        const handle = document.createElement("div");
        handle.className = "reshape-handle corner-handle";
        handle.setAttribute("data-vertex-index", vertexIndex);
        handle.style.left = vertex.x + "px";
        handle.style.top = vertex.y + "px";
        canvasContainer.appendChild(handle);
      });
      if (mainArea.segments) {
        mainArea.segments.forEach((segment, segmentIndex) => {
          if (segment.start !== undefined && segment.end !== undefined) {
            const startPoint = mainArea.vertices[segment.start];
            const endPoint = mainArea.vertices[segment.end];
            const midpoint = getMidpoint(startPoint, endPoint);
            const handle = document.createElement("div");
            handle.className = "reshape-handle midpoint-handle";
            handle.setAttribute("data-segment-index", segmentIndex);
            handle.style.left = midpoint.x + "px";
            handle.style.top = midpoint.y + "px";
            canvasContainer.appendChild(handle);
          }
        });
      }
    }
  }
}

function updateHandles() {
  if (designShape.areas && designShape.areas.length > 0) {
    const mainArea = designShape.areas[0];
    if (mainArea.vertices) {
      mainArea.vertices.forEach((vertex, vertexIndex) => {
        const handle = document.querySelector(
          `.reshape-handle[data-vertex-index="${vertexIndex}"]`
        );
        if (handle) {
          handle.style.left = vertex.x + "px";
          handle.style.top = vertex.y + "px";
        }
      });
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
              handle.style.left = midpoint.x + "px";
              handle.style.top = midpoint.y + "px";
            }
          }
        });
      }
    }
  }
}

// Generate Layout Options (unchanged)
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
      createHandles();
      redrawCanvas();
      updateDimensions();
    });
  });
}

// Generate Pattern Options
// function generatePatternOptions() {
//   const patternGrid = document.getElementById("patternGrid");
//   patternGrid.innerHTML = "";
//   patterns.forEach((pattern) => {
//     const patternOption = document.createElement("div");
//     patternOption.className = "pattern-option";
//     patternOption.setAttribute("data-pattern", pattern.id);

//     const patternImage = document.createElement("img");
//     patternImage.className = "pattern-image";
//     patternImage.src = pattern.image;
//     patternImage.alt = pattern.name;

//     const patternLabel = document.createElement("span");
//     patternLabel.className = "pattern-label";
//     patternLabel.textContent = pattern.name;

//     patternOption.appendChild(patternImage);
//     patternOption.appendChild(patternLabel);
//     patternGrid.appendChild(patternOption);

//     patternOption.addEventListener("click", async () => {
//       document
//         .querySelectorAll(".pattern-option")
//         .forEach((opt) => opt.classList.remove("active"));
//       patternOption.classList.add("active");

//       // Check if this is the Checkerboard (code-based) pattern.
//       if (pattern.name === "Pattern 2") {
//         // Using code-based checkerboard pattern.
//         designShape.pattern = createCheckerboardPattern(ctx);
//         designShape.patternImage = null; // Comment out SVG-based approach.
//         // console.log("Using code-based checkerboard pattern");
//       } else {
//         // For other patterns, use the SVG image.
//         const img = await loadPatternImage(pattern.image);
//         designShape.patternImage = img;
//         designShape.pattern = null;
//       }
//       redrawCanvas();
//     });
//   });
// }

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
        // Use the custom grid pattern.
        designShape.pattern = createGridPattern(ctx);
        designShape.patternImage = null; // Disable SVG-based approach.
        designShape.activePatternName = pattern.name;
      } else if (pattern.name === "Pattern 2") {
        // Use the code-based checkerboard pattern.
        designShape.pattern = createCheckerboardPattern(ctx);
        designShape.patternImage = null; // Disable SVG-based approach.
        designShape.activePatternName = pattern.name;
      } else {
        // For other patterns, use the SVG image.
        const img = await loadPatternImage(pattern.image);
        designShape.patternImage = img;
        designShape.pattern = null;
        designShape.activePatternName = pattern.name;
      }
      redrawCanvas();
    });
  });
}

// Generate Tile Type Options (unchanged)
function generateTileTypeOptions() {
  const tileTypeGrid = document.getElementById("tileTypeGrid");
  tileTypeGrid.innerHTML = "";
  tileTypes.forEach((tileType) => {
    const tileTypeOption = document.createElement("div");
    tileTypeOption.className = "tile-type-option";
    tileTypeOption.setAttribute("data-tile-type", tileType.id);
    if (tileType.id === designShape.tileType)
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
      designShape.tileType = tileType.id;
      redrawCanvas();
    });
  });
}

// Generate Color Swatches (unchanged)
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

// Sidebar Interactions (unchanged)
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

// Update Active Step (unchanged)
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

// Cell Painting Functionality
canvas.addEventListener("click", (e) => {
  if (activeSidebarSection !== "colors") return; // Only paint in colors section

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const path = getShapePath();

  if (!ctx.isPointInPath(path, clickX, clickY)) return;

  const cellX = Math.floor(clickX / cellSize) * cellSize;
  const cellY = Math.floor(clickY / cellSize) * cellSize;

  // Check for existing cell
  const existingCellIndex = paintedCells.findIndex(
    (cell) => cell.x === cellX && cell.y === cellY
  );
  if (existingCellIndex !== -1) {
    paintedCells[existingCellIndex].color = paintColor;
  } else {
    paintedCells.push({ x: cellX, y: cellY, color: paintColor });
  }

  redrawCanvas();
});

// Handle Reshape Functionality (unchanged)
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
  const dx = e.clientX - startMouseX;
  const dy = e.clientY - startMouseY;

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
  activeHandle = null;
});

// Navigation Buttons (unchanged)
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
  const container = canvasContainer;
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

      // Recompute the pattern after resizing
      if (designShape.pattern) {
        const activePattern = patterns.find((p) =>
          document
            .querySelector(`.pattern-option[data-pattern="${p.id}"]`)
            ?.classList.contains("active")
        );
        if (activePattern) {
          createSVGPattern(activePattern.image, cellSize).then((pattern) => {
            designShape.pattern = pattern;
            redrawCanvas();
          });
        }
      }
    } else {
      designShape.vertices = getInitialVertices(designShape.type);
    }

    createHandles();
    redrawCanvas();
    updateDimensions();
  }
}

window.addEventListener("resize", resizeCanvas);

// Initialize Application
function init() {
  const areas = getInitialAreas("rectangle");
  if (areas.length > 0 && areas[0].vertices) {
    designShape.vertices = [...areas[0].vertices];
    designShape.areas = areas;
  }
  generateLayoutOptions();
  generatePatternOptions();
  generateTileTypeOptions();
  generateColorSwatches();
  setupSidebarInteractions();
  updateActiveStep(currentStep);
  createHandles();
  redrawCanvas();
  updateDimensions();
  resizeCanvas();
}

init();
