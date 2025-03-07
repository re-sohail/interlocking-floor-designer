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
const pixelsPerFoot = 100; // Scale factor for dimensions

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
  areas: [], // Store separate areas for complex shapes
  pattern: null,
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

// Pattern Library - Enhanced with proper implementations
const patternLibrary = {
  herringbone: {
    name: "Herringbone",
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1;

      // Draw diagonal lines for herringbone pattern
      const halfSize = size / 2;
      const quarterSize = size / 4;

      // First rectangle
      ctx.beginPath();
      ctx.rect(0, quarterSize, halfSize, halfSize);
      ctx.fill();

      // Second rectangle
      ctx.beginPath();
      ctx.rect(halfSize, 0, halfSize, halfSize);
      ctx.fill();

      // Add detail lines
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, quarterSize + halfSize);
      ctx.lineTo(halfSize, quarterSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(halfSize, halfSize);
      ctx.lineTo(size, 0);
      ctx.stroke();

      ctx.restore();
    },
  },
  checkerboard: {
    name: "Checkerboard",
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.fillStyle = color;
      const half = size / 2;

      // Draw two squares in diagonal positions
      ctx.fillRect(x, y, half, half);
      ctx.fillRect(x + half, y + half, half, half);

      // Draw contrasting squares
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + half, y, half, half);
      ctx.fillRect(x, y + half, half, half);

      ctx.restore();
    },
  },
  stripes: {
    name: "Stripes",
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.fillStyle = color;

      // Draw horizontal stripes
      const stripeHeight = size / 5;
      for (let i = 0; i < size; i += stripeHeight * 2) {
        ctx.fillRect(x, y + i, size, stripeHeight);
      }

      ctx.restore();
    },
  },
  diamonds: {
    name: "Diamonds",
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.fillStyle = color;

      // Draw diamond pattern
      const center = size / 2;
      ctx.beginPath();
      ctx.moveTo(x + center, y);
      ctx.lineTo(x + size, y + center);
      ctx.lineTo(x + center, y + size);
      ctx.lineTo(x, y + center);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
  },
  basketweave: {
    name: "Basketweave",
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.fillStyle = color;
      const third = size / 3;

      // Draw basketweave pattern
      ctx.fillRect(x, y, third * 2, third);
      ctx.fillRect(x, y + third, third, third * 2);
      ctx.fillRect(x + third * 2, y + third, third, third);
      ctx.fillRect(x + third, y + third * 2, third * 2, third);

      ctx.restore();
    },
  },
  hexagon: {
    name: "Hexagon",
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.fillStyle = color;

      // Draw hexagon pattern
      const center = size / 2;
      const radius = size * 0.4;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const pointX = x + center + radius * Math.cos(angle);
        const pointY = y + center + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(pointX, pointY);
        } else {
          ctx.lineTo(pointX, pointY);
        }
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
  },
};

// Patterns array based on the library
const patterns = Object.keys(patternLibrary).map((key) => ({
  id: key,
  name: patternLibrary[key].name,
}));

// Tile Types
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

// Colors
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
            { x: x, y: y }, // 0: top-left
            { x: x + width, y: y }, // 1: top-right
            { x: x + width, y: y + legHeight }, // 2: right-top-inner
            { x: x + legWidth, y: y + legHeight }, // 3: left-top-inner
            { x: x + legWidth, y: y + height }, // 4: bottom-inner
            { x: x, y: y + height }, // 5: bottom-left
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
          areas: [
            {
              id: "top",
              x: x,
              y: y,
              width: width,
              height: legHeight,
            },
            {
              id: "left",
              x: x,
              y: y + legHeight,
              width: legWidth,
              height: height - legHeight,
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
            { x: x, y: y }, // 0: top-left
            { x: x + uLegWidth, y: y }, // 1: top-left-inner
            { x: x + uLegWidth, y: y + height / 2 }, // 2: left-inner-bottom
            { x: x + width - uLegWidth, y: y + height / 2 }, // 3: right-inner-bottom
            { x: x + width - uLegWidth, y: y }, // 4: top-right-inner
            { x: x + width, y: y }, // 5: top-right
            { x: x + width, y: y + height }, // 6: bottom-right
            { x: x, y: y + height }, // 7: bottom-left
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
          areas: [
            {
              id: "left-leg",
              x: x,
              y: y,
              width: uLegWidth,
              height: height,
            },
            {
              id: "bottom",
              x: x + uLegWidth,
              y: y + height / 2,
              width: width - 2 * uLegWidth,
              height: height / 2,
            },
            {
              id: "right-leg",
              x: x + width - uLegWidth,
              y: y,
              width: uLegWidth,
              height: height,
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
            { x: x, y: y }, // 0: top-left
            { x: x + width, y: y }, // 1: top-right
            { x: x + width, y: y + height }, // 2: right-bottom
            { x: x + width - dlrLegWidth, y: y + height }, // 3: right-bottom-inner
            { x: x + width - dlrLegWidth, y: y + height + dlrLegHeight }, // 4: right-extension
            { x: x + dlrLegWidth, y: y + height + dlrLegHeight }, // 5: left-extension
            { x: x + dlrLegWidth, y: y + height }, // 6: left-bottom-inner
            { x: x, y: y + height }, // 7: bottom-left
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
          areas: [
            {
              id: "main-body",
              x: x,
              y: y,
              width: width,
              height: height,
            },
            {
              id: "bottom-extension",
              x: x + dlrLegWidth,
              y: y + height,
              width: width - 2 * dlrLegWidth,
              height: dlrLegHeight,
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
    // If it's a rectangular area
    path.rect(area.x, area.y, area.width, area.height);
  }
  return path;
}

// Calculate midpoint between two points
function getMidpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
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
// function updateDimensions() {
//   // Clear existing dimension labels
//   document
//     .querySelectorAll(".dimension-label")
//     .forEach((label) => label.remove());

//   if (!designShape.areas || designShape.areas.length === 0) return;

//   const mainArea = designShape.areas[0];
//   if (!mainArea.segments) return;

//   mainArea.segments.forEach((segment) => {
//     const startPoint = mainArea.vertices[segment.start];
//     const endPoint = mainArea.vertices[segment.end];
//     const length = Math.sqrt(
//       Math.pow(endPoint.x - startPoint.x, 2) +
//         Math.pow(endPoint.y - startPoint.y, 2)
//     );
//     const dimensionText = formatDimension(length);

//     // Create new dimension label element
//     const dimensionLabel = document.createElement("div");
//     dimensionLabel.className = `dimension-label ${segment.direction}`;
//     dimensionLabel.textContent = dimensionText;

//     // Calculate midpoint for positioning
//     const midX = (startPoint.x + endPoint.x) / 2;
//     const midY = (startPoint.y + endPoint.y) / 2;

//     // Position based on segment direction
//     if (segment.direction === "horizontal") {
//       dimensionLabel.style.left = `${midX - 20}px`;
//       dimensionLabel.style.top = `${midY - 15}px`;
//     } else {
//       dimensionLabel.style.left = `${midX + 15}px`;
//       dimensionLabel.style.top = `${midY - 10}px`;
//     }

//     // Add to canvas container
//     canvasContainer.appendChild(dimensionLabel);
//   });

//   // Update area display
//   const xs = mainArea.vertices.map((v) => v.x);
//   const ys = mainArea.vertices.map((v) => v.y);
//   const width = Math.max(...xs) - Math.min(...xs);
//   const height = Math.max(...ys) - Math.min(...ys);
//   const areaFt = (width * height) / pixelsPerFoot ** 2;
//   dimensionsDisplay.textContent = `Total Area: ${areaFt.toFixed(2)} ft²`;
// }

function updateDimensions() {
  // Clear existing dimension labels
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

    // Create dimension label element
    const dimensionLabel = document.createElement("div");
    dimensionLabel.className = "dimension-label";
    dimensionLabel.textContent = dimensionText;
    dimensionLabel.style.position = "absolute";

    const M = {
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2,
    };

    const D = {
      x: endPoint.x - startPoint.x,
      y: endPoint.y - startPoint.y,
    };

    const N = {
      x: D.y,
      y: -D.x,
    };

    const magN = Math.sqrt(N.x * N.x + N.y * N.y);
    if (magN === 0) return;
    const U = {
      x: N.x / magN,
      y: N.y / magN,
    };

    const k = 20;

    const P = {
      x: M.x + k * U.x,
      y: M.y + k * U.y,
    };

    canvasContainer.appendChild(dimensionLabel);
    const width = dimensionLabel.offsetWidth;
    const height = dimensionLabel.offsetHeight;

    const adjustedK = Math.max(k, height / 2 + 5);
    const finalP = {
      x: M.x + adjustedK * U.x,
      y: M.y + adjustedK * U.y,
    };

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
  // Clear previous area dimensions
  areaDimensionsContainer.innerHTML = "";

  // If we have areas defined, show their dimensions
  if (designShape.areas && designShape.areas.length > 0) {
    const mainArea = designShape.areas[0];

    // If we have segments defined, show their dimensions
    if (mainArea.segments) {
      mainArea.segments.forEach((segment, index) => {
        // Get segment endpoints
        let startPoint, endPoint;

        if (segment.start !== undefined && segment.end !== undefined) {
          startPoint = mainArea.vertices[segment.start];
          endPoint = mainArea.vertices[segment.end];
        } else {
          // Fallback if start/end indices aren't defined
          return;
        }

        // Calculate midpoint for label placement
        const midpoint = getMidpoint(startPoint, endPoint);

        // Calculate actual length
        const actualLength = getSegmentLength(startPoint, endPoint);

        // Format dimension as feet and inches
        const dimensionText = formatDimension(actualLength);

        // Create dimension label
        const dimensionLabel = document.createElement("div");
        dimensionLabel.className = "area-dimension";
        dimensionLabel.textContent = dimensionText;

        // Position label at midpoint, with offset based on direction
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

    // Also show dimensions for rectangular areas
    if (mainArea.areas) {
      mainArea.areas.forEach((area) => {
        if (area.width && area.height) {
          const ftWidth = formatDimension(area.width);
          const ftHeight = formatDimension(area.height);

          // Create dimension label for this area
          const dimensionLabel = document.createElement("div");
          dimensionLabel.className = "area-dimension area-size";
          dimensionLabel.textContent = `${ftWidth} × ${ftHeight}`;

          // Position in the center of the area
          dimensionLabel.style.left = `${area.x + area.width / 2 - 30}px`;
          dimensionLabel.style.top = `${area.y + area.height / 2 - 10}px`;

          areaDimensionsContainer.appendChild(dimensionLabel);
        }
      });
    }
  }
}

// Draw Design Shape
function drawDesignShape() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);

  // Fill with base color
  ctx.fillStyle = designShape.baseColor;
  ctx.fill(path);

  // If we have a pattern, apply it
  if (designShape.pattern) {
    // Calculate the bounding box
    const xs = designShape.vertices.map((v) => v.x);
    const ys = designShape.vertices.map((v) => v.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Apply pattern across the shape
    for (let x = minX; x < maxX; x += cellSize) {
      for (let y = minY; y < maxY; y += cellSize) {
        // Check if this cell is within the shape
        if (ctx.isPointInPath(path, x + cellSize / 2, y + cellSize / 2)) {
          patternLibrary[designShape.pattern].draw(
            ctx,
            x,
            y,
            cellSize,
            paintColor
          );
        }
      }
    }
  }

  ctx.restore();
}

// Draw Grid (Clipped to Shape)
function drawGrid() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";

  // Calculate grid boundaries
  const xs = designShape.vertices.map((v) => v.x);
  const ys = designShape.vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Draw vertical grid lines
  for (let x = minX; x <= maxX; x += cellSize) {
    ctx.moveTo(x, minY);
    ctx.lineTo(x, maxY);
  }

  // Draw horizontal grid lines
  for (let y = minY; y <= maxY; y += cellSize) {
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
  }

  ctx.stroke();
  ctx.restore();
}

// Draw Painted Cells
function drawPaintedCells() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);

  paintedCells.forEach((cell) => {
    if (cell.pattern) {
      // Draw pattern for this cell
      patternLibrary[cell.pattern].draw(
        ctx,
        cell.x,
        cell.y,
        cellSize,
        cell.color
      );
    } else {
      // Draw solid color
      ctx.fillStyle = hexToRgba(cell.color, fillOpacity);
      ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
    }
  });

  ctx.restore();
}

// Draw Shape Border
function drawShapeBorder() {
  ctx.save();
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 3;
  const path = getShapePath();
  ctx.stroke(path);

  // Draw area borders if in layout mode
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

  // If we're using the area-based approach with segments
  if (designShape.areas && designShape.areas.length > 0) {
    const mainArea = designShape.areas[0];

    // Create vertex handles (corner points)
    if (mainArea.vertices) {
      mainArea.vertices.forEach((vertex, vertexIndex) => {
        const handle = document.createElement("div");
        handle.className = "reshape-handle corner-handle";
        handle.setAttribute("data-vertex-index", vertexIndex);
        handle.style.left = vertex.x + "px";
        handle.style.top = vertex.y + "px";
        canvasContainer.appendChild(handle);
      });

      // Create midpoint handles for each segment
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
  } else {
    // Fallback to original vertex handles
    designShape.vertices.forEach((vertex, index) => {
      const handle = document.createElement("div");
      handle.className = "resize-handle";
      handle.setAttribute("data-index", index);
      handle.style.left = vertex.x + "px";
      handle.style.top = vertex.y + "px";
      canvasContainer.appendChild(handle);
    });

    // Calculate bounding box for side handles
    const xs = designShape.vertices.map((v) => v.x);
    const ys = designShape.vertices.map((v) => v.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Define side handle positions
    const sidePositions = {
      left: { x: minX, y: (minY + maxY) / 2 },
      right: { x: maxX, y: (minY + maxY) / 2 },
      top: { x: (minX + maxX) / 2, y: minY },
      bottom: { x: (minX + maxX) / 2, y: maxY },
    };

    // Create side handles
    for (const [side, pos] of Object.entries(sidePositions)) {
      const handle = document.createElement("div");
      handle.className = "side-handle";
      handle.setAttribute("data-side", side);
      handle.style.left = pos.x + "px";
      handle.style.top = pos.y + "px";
      canvasContainer.appendChild(handle);
    }
  }
}

// Update Handles
function updateHandles() {
  // If we're using the area-based approach with segments
  if (designShape.areas && designShape.areas.length > 0) {
    const mainArea = designShape.areas[0];

    // Update vertex handles (corner points)
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
              handle.style.left = midpoint.x + "px";
              handle.style.top = midpoint.y + "px";
            }
          }
        });
      }
    }
  } else {
    // Fallback to original vertex handles
    document.querySelectorAll(".resize-handle").forEach((handle, index) => {
      handle.style.left = designShape.vertices[index].x + "px";
      handle.style.top = designShape.vertices[index].y + "px";
    });

    // Update side handles
    const xs = designShape.vertices.map((v) => v.x);
    const ys = designShape.vertices.map((v) => v.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const sidePositions = {
      left: { x: minX, y: (minY + maxY) / 2 },
      right: { x: maxX, y: (minY + maxY) / 2 },
      top: { x: (minX + maxX) / 2, y: minY },
      bottom: { x: (minX + maxX) / 2, y: maxY },
    };

    document.querySelectorAll(".side-handle").forEach((handle) => {
      const side = handle.getAttribute("data-side");
      const pos = sidePositions[side];
      handle.style.left = pos.x + "px";
      handle.style.top = pos.y + "px";
    });
  }
}

// Get Vertices on Side
function getVerticesOnSide(side) {
  const xs = designShape.vertices.map((v) => v.x);
  const ys = designShape.vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const indices = [];
  designShape.vertices.forEach((vertex, index) => {
    if (side === "left" && vertex.x === minX) {
      indices.push(index);
    } else if (side === "right" && vertex.x === maxX) {
      indices.push(index);
    } else if (side === "top" && vertex.y === minY) {
      indices.push(index);
    } else if (side === "bottom" && vertex.y === maxY) {
      indices.push(index);
    }
  });
  return indices;
}

// Apply Pattern to Shape
function applyPatternToShape(patternId) {
  designShape.pattern = patternId;
  redrawCanvas();
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

      // Update shape type
      designShape.type = layout.id;

      // Get initial areas for this shape
      const areas = getInitialAreas(layout.id);

      // Update shape data
      if (areas.length > 0 && areas[0].vertices) {
        designShape.vertices = [...areas[0].vertices];
        designShape.areas = areas;
      }

      // Update UI
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

    // Create thumbnail canvas
    const canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");

    // Draw pattern preview
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 80, 60);

    // Draw pattern in the preview
    const cellSize = 20;
    for (let x = 0; x < 80; x += cellSize) {
      for (let y = 0; y < 60; y += cellSize) {
        patternLibrary[pattern.id].draw(ctx, x, y, cellSize, "#333");
      }
    }

    const patternImage = document.createElement("img");
    patternImage.className = "pattern-image";
    patternImage.src = canvas.toDataURL();

    const patternLabel = document.createElement("span");
    patternLabel.className = "pattern-label";
    patternLabel.textContent = pattern.name;

    patternOption.appendChild(patternImage);
    patternOption.appendChild(patternLabel);
    patternGrid.appendChild(patternOption);

    patternOption.addEventListener("click", () => {
      document
        .querySelectorAll(".pattern-option")
        .forEach((opt) => opt.classList.remove("active"));
      patternOption.classList.add("active");
      applyPatternToShape(pattern.id);
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

// Cell Painting Functionality
canvas.addEventListener("click", (e) => {
  if (activeSidebarSection !== "colors" && activeSidebarSection !== "patterns")
    return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const path = getShapePath();

  if (!ctx.isPointInPath(path, clickX, clickY)) return;

  const cellX = Math.floor(clickX / cellSize) * cellSize;
  const cellY = Math.floor(clickY / cellSize) * cellSize;

  // Remove any existing cell at this position
  const existingCellIndex = paintedCells.findIndex(
    (cell) => cell.x === cellX && cell.y === cellY
  );
  if (existingCellIndex !== -1) {
    paintedCells.splice(existingCellIndex, 1);
  }

  if (activeSidebarSection === "colors") {
    // Handle color painting
    paintedCells.push({ x: cellX, y: cellY, color: paintColor });
  } else if (activeSidebarSection === "patterns") {
    // Handle pattern painting
    const pattern = document.querySelector(".pattern-option.active")?.dataset
      .pattern;
    if (pattern) {
      paintedCells.push({ x: cellX, y: cellY, pattern, color: paintColor });
    }
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
      const startVertex = mainArea.vertices[segment.start];
      const endVertex = mainArea.vertices[segment.end];
      const midpoint = getMidpoint(startVertex, endVertex);

      // Otherwise, drag the segment
      activeHandle = { type: "segment", segmentIndex };
    }

    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startShape = JSON.parse(JSON.stringify(designShape));
    e.stopPropagation();
    e.preventDefault();
  }
  // Handle original vertex resizing (fallback)
  else if (e.target.classList.contains("resize-handle")) {
    activeHandle = parseInt(e.target.getAttribute("data-index"));
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startShape = JSON.parse(JSON.stringify(designShape));
    e.stopPropagation();
    e.preventDefault();
  }
  // Handle side resizing (fallback)
  else if (e.target.classList.contains("side-handle")) {
    const side = e.target.getAttribute("data-side");
    const indices = getVerticesOnSide(side);
    activeHandle = { side, indices };
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

  if (typeof activeHandle === "object") {
    if (activeHandle.type === "vertex") {
      // Moving a corner vertex
      const vertexIndex = activeHandle.vertexIndex;
      const mainArea = designShape.areas[0];
      if (mainArea && mainArea.vertices && mainArea.vertices[vertexIndex]) {
        mainArea.vertices[vertexIndex].x = Math.max(
          0,
          Math.min(
            canvas.width,
            startShape.areas[0].vertices[vertexIndex].x + dx
          )
        );
        mainArea.vertices[vertexIndex].y = Math.max(
          0,
          Math.min(
            canvas.height, // Already correct
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
          // Fixed: Use canvas.height for y
          startVertex.y = Math.max(
            0,
            Math.min(
              canvas.height, // Corrected from canvas.width
              startShape.areas[0].vertices[segment.start].y + dy
            )
          );
          endVertex.y = Math.max(
            0,
            Math.min(
              canvas.height, // Corrected from canvas.width
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
    } else if (activeHandle.side) {
      // Fallback: Side handle resizing
      const side = activeHandle.side;
      const indices = activeHandle.indices;

      if (side === "left" || side === "right") {
        indices.forEach((index) => {
          designShape.vertices[index].x = Math.max(
            0,
            Math.min(canvas.width, startShape.vertices[index].x + dx)
          );
        });
      } else if (side === "top" || side === "bottom") {
        indices.forEach((index) => {
          designShape.vertices[index].y = Math.max(
            0,
            Math.min(canvas.height, startShape.vertices[index].y + dy)
          );
        });
      }
    }
  } else if (typeof activeHandle === "number") {
    // Fallback: Original vertex resizing
    const index = activeHandle;
    designShape.vertices[index].x = Math.max(
      0,
      Math.min(canvas.width, startShape.vertices[index].x + dx)
    );
    designShape.vertices[index].y = Math.max(
      0,
      Math.min(canvas.height, startShape.vertices[index].y + dy)
    );
  }

  // Update the UI
  redrawCanvas();
  updateHandles();
  updateDimensions();
});

document.addEventListener("mouseup", () => {
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

// Apply Pattern to Entire Shape
function applyPattern(patternId, color1 = paintColor, color2 = "#ffffff") {
  // Clear existing painted cells
  paintedCells.length = 0;

  // Set the pattern for the entire shape
  designShape.pattern = patternId;

  redrawCanvas();
}

// Resize Canvas for Responsiveness
function resizeCanvas() {
  const container = canvasContainer;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // Only resize if dimensions have changed significantly
  if (
    Math.abs(canvas.width - containerWidth) > 50 ||
    Math.abs(canvas.height - containerHeight) > 50
  ) {
    // Save current shape proportions
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    // Update canvas size
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Scale vertices proportionally
    if (designShape.vertices.length > 0) {
      const scaleX = containerWidth / oldWidth;
      const scaleY = containerHeight / oldHeight;

      designShape.vertices.forEach((vertex) => {
        vertex.x *= scaleX;
        vertex.y *= scaleY;
      });

      // Scale areas if they exist
      if (designShape.areas) {
        designShape.areas.forEach((area) => {
          if (area.vertices) {
            area.vertices.forEach((vertex) => {
              vertex.x *= scaleX;
              vertex.y *= scaleY;
            });
          } else if (area.x !== undefined) {
            area.x *= scaleX;
            area.y *= scaleY;
            area.width *= scaleX;
            area.height *= scaleY;
          }
        });
      }
    } else {
      // If no shape exists yet, initialize with default
      designShape.vertices = getInitialVertices(designShape.type);
    }

    createHandles();
    redrawCanvas();
    updateDimensions();
  }
}

// Add window resize event listener
window.addEventListener("resize", resizeCanvas);

// Initialize Application
function init() {
  // Set initial shape
  const areas = getInitialAreas("rectangle");
  if (areas.length > 0 && areas[0].vertices) {
    designShape.vertices = [...areas[0].vertices];
    designShape.areas = areas;
  }

  // Generate UI components
  generateLayoutOptions();
  generatePatternOptions();
  generateTileTypeOptions();
  generateColorSwatches();
  setupSidebarInteractions();

  // Set initial UI state
  updateActiveStep(currentStep);
  createHandles();
  redrawCanvas();
  updateDimensions();

  // Initial resize
  resizeCanvas();
}

// Start the application
init();
