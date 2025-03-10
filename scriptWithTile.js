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
const cellSize = 25; // Fixed cell size
const fillOpacity = 0.6;
const tileOpacity = 0.5; // Default tile opacity
const patternOpacity = 0.3; // Low opacity for patterns over tiles
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
  { id: "1", image: "./media/svg/patterns/nopattern.svg", name: "Pattern 1" },
  {
    id: "2",
    image: "./media/svg/patterns/checkedpattern.svg",
    name: "Pattern 2",
  },
];

const tileTypes = [
  { id: "tile1", name: "Tile 1", image: "./media/img/tile.jpeg" },
];

const edgeColors = [
  { id: "black", value: "#000000", name: "Black" },
  { id: "red", value: "#ff0000", name: "Red" },
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

// Function to create the default grid pattern
function createGridPattern(ctx) {
  const gridCount = 10;
  const canvasSize = cellSize * gridCount;
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = canvasSize;
  patternCanvas.height = canvasSize;
  const patternCtx = patternCanvas.getContext("2d");

  patternCtx.fillStyle = "#FFFFFF";
  patternCtx.fillRect(0, 0, canvasSize, canvasSize);

  patternCtx.strokeStyle = "lightgray";
  patternCtx.lineWidth = 1;
  for (let i = 0; i <= gridCount; i++) {
    patternCtx.beginPath();
    patternCtx.moveTo(i * cellSize, 0);
    patternCtx.lineTo(i * cellSize, canvasSize);
    patternCtx.stroke();

    patternCtx.beginPath();
    patternCtx.moveTo(0, i * cellSize);
    patternCtx.lineTo(canvasSize, i * cellSize);
    patternCtx.stroke();
  }

  const redBorderWidth = 25;
  patternCtx.strokeStyle = "red";
  patternCtx.lineWidth = redBorderWidth;
  patternCtx.strokeRect(
    redBorderWidth / 2,
    redBorderWidth / 2,
    canvasSize - redBorderWidth,
    canvasSize - redBorderWidth
  );

  const yellowBorderWidth = 25;
  patternCtx.strokeStyle = "yellow";
  patternCtx.lineWidth = yellowBorderWidth;
  patternCtx.strokeRect(
    2 * cellSize + yellowBorderWidth / 2,
    2 * cellSize + yellowBorderWidth / 2,
    (gridCount - 4) * cellSize - yellowBorderWidth,
    (gridCount - 4) * cellSize - yellowBorderWidth
  );

  return ctx.createPattern(patternCanvas, "repeat");
}

// Define Initial Areas for Each Shape
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

  // Calculate bounding box
  const xs = designShape.vertices.map((v) => v.x);
  const ys = designShape.vertices.map((v) => v.y);
  const minX = Math.floor(Math.min(...xs) / cellSize) * cellSize;
  const maxX = Math.ceil(Math.max(...xs) / cellSize) * cellSize;
  const minY = Math.floor(Math.min(...ys) / cellSize) * cellSize;
  const maxY = Math.ceil(Math.max(...ys) / cellSize) * cellSize;

  // Check multiple points per cell
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      const cellPoints = [
        { x: x + cellSize / 2, y: y + cellSize / 2 }, // Center
        { x: x, y: y }, // Top-left
        { x: x + cellSize, y: y }, // Top-right
        { x: x, y: y + cellSize }, // Bottom-left
        { x: x + cellSize, y: y + cellSize }, // Bottom-right
      ];

      // Check if any point is inside the shape
      const isInside = cellPoints.some((p) =>
        ctx.isPointInPath(path, p.x, p.y)
      );
      if (isInside) {
        paintedCells.push({ x, y, tileId: designShape.currentTileId });
      }
    }
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
  if (designShape.patternImage) {
    ctx.save();
    ctx.globalAlpha = patternOpacity;
    const xs = designShape.vertices.map((v) => v.x);
    const ys = designShape.vertices.map((v) => v.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    ctx.drawImage(designShape.patternImage, minX, minY, width, height);
    ctx.restore();
  } else if (designShape.pattern) {
    ctx.save();
    ctx.globalAlpha = patternOpacity;
    ctx.fillStyle = designShape.pattern;
    ctx.fill(path);
    ctx.restore();
  }

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
        designShape.pattern = createGridPattern(ctx);
        designShape.patternImage = null;
        designShape.activePatternName = pattern.name;
      } else if (pattern.name === "Pattern 2") {
        designShape.pattern = createCheckerboardPattern(ctx);
        designShape.patternImage = null;
        designShape.activePatternName = pattern.name;
      } else {
        const img = await loadPatternImage(pattern.image);
        designShape.patternImage = img;
        designShape.pattern = null;
        designShape.activePatternName = pattern.name;
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
  if (activeSidebarSection !== "colors") return; // Tiles are applied automatically, not via click

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const path = getShapePath();

  if (!ctx.isPointInPath(path, clickX, clickY)) return;

  const cellX = Math.floor(clickX / cellSize) * cellSize;
  const cellY = Math.floor(clickY / cellSize) * cellSize;

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
