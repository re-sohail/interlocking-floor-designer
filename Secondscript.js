// Canvas & Context
const canvas = document.getElementById("designCanvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvasContainer");

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

// Design Shape Object
const designShape = {
  type: "rectangle",
  vertices: [],
  pattern: null,
  tileType: "standard",
  baseColor: "#000000",
};

// Painted Cells
const paintedCells = [];

// Data Arrays (unchanged)
const layouts = [
  { id: "rectangle", image: "./media/svg/layouts/layout1.svg" },
  { id: "l-shape", image: "./media/svg/layouts/layout2.svg" },
  { id: "u-shape", image: "./media/svg/layouts/layout3.svg" },
  { id: "double-legged-rectangle", image: "./media/svg/layouts/layout4.svg" },
];
// const patterns = [
//   { id: "1", image: "./media/svg/patterns/patterns1.svg" },
//   { id: "2", image: "./media/svg/patterns/patterns2.svg" },
//   { id: "3", image: "./media/svg/patterns/patterns3.svg" },
//   { id: "4", image: "./media/svg/patterns/patterns4.svg" },
//   { id: "5", image: "./media/svg/patterns/patterns5.svg" },
//   { id: "6", image: "./media/svg/patterns/patterns6.svg" },
// ];
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
];

// ================ PATTERN SYSTEM ================
const patternLibrary = {
  herringbone: {
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      // Draw diagonal lines
      for (let i = -1; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size, 0);
        ctx.lineTo((i + 1) * size, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i * size, size);
        ctx.lineTo((i + 1) * size, 0);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  checkerboard: {
    draw: (ctx, x, y, size, color) => {
      ctx.fillStyle = color;
      const half = size / 2;
      ctx.fillRect(x, y, half, half);
      ctx.fillRect(x + half, y + half, half, half);
    },
  },
  stripes: {
    draw: (ctx, x, y, size, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size / 4);
      ctx.fillRect(x, y + size / 2, size, size / 4);
    },
  },
  dots: {
    draw: (ctx, x, y, size, color) => {
      ctx.fillStyle = color;
      const radius = size / 8;
      for (let i = 0.25; i < 1; i += 0.5) {
        for (let j = 0.25; j < 1; j += 0.5) {
          ctx.beginPath();
          ctx.arc(x + size * i, y + size * j, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
  },
  bricks: {
    draw: (ctx, x, y, size, color) => {
      ctx.fillStyle = color;
      const brickHeight = size / 3;
      ctx.fillRect(x, y, size, brickHeight);
      ctx.fillRect(x + size / 4, y + brickHeight, size / 2, brickHeight);
    },
  },
  waves: {
    draw: (ctx, x, y, size, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + size / 2);
      ctx.quadraticCurveTo(x + size / 4, y, x + size / 2, y + size / 2);
      ctx.quadraticCurveTo(
        x + (size * 3) / 4,
        y + size,
        x + size,
        y + size / 2
      );
      ctx.stroke();
    },
  },
};

const patterns = [
  { id: "herringbone", name: "Herringbone" },
  { id: "checkerboard", name: "Checkerboard" },
  { id: "stripes", name: "Stripes" },
  { id: "dots", name: "Dots" },
  { id: "bricks", name: "Bricks" },
  { id: "waves", name: "Waves" },
];

// Utility: Convert Hex to RGBA
function hexToRgba(hex, opacity) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Define Initial Vertices for Each Shape
function getInitialVertices(type) {
  const width = 400;
  const height = 300;
  const legWidth = width / 4;
  const legHeight = height / 2;
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;

  switch (type) {
    case "rectangle":
      return [
        { x: x, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height },
        { x: x, y: y + height },
      ];
    case "l-shape":
      return [
        { x: x, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + legHeight },
        { x: x + legWidth, y: y + legHeight },
        { x: x + legWidth, y: y + height },
        { x: x, y: y + height },
      ];
    case "u-shape":
      return [
        { x: x, y: y },
        { x: x + legWidth, y: y },
        { x: x + legWidth, y: y + legHeight },
        { x: x + width - legWidth, y: y + legHeight },
        { x: x + width - legWidth, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height },
        { x: x, y: y + height },
      ];
    case "double-legged-rectangle":
      const legHeightExtra = 50;
      return [
        { x: x, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height },
        { x: x + width - legWidth, y: y + height },
        { x: x + width - legWidth, y: y + height + legHeightExtra },
        { x: x + legWidth, y: y + height + legHeightExtra },
        { x: x + legWidth, y: y + height },
        { x: x, y: y + height },
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

// Update Dimensions Display
function updateDimensions() {
  if (designShape.vertices.length === 0) return;
  const xs = designShape.vertices.map((v) => v.x);
  const ys = designShape.vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;
  const ftWidth = (width / 100).toFixed(1);
  const ftHeight = (height / 100).toFixed(1);

  topDim.textContent = `${ftWidth}ft`;
  bottomDim.textContent = `${ftWidth}ft`;
  leftDim.textContent = `${ftHeight}ft`;
  rightDim.textContent = `${ftHeight}ft`;

  topDim.style.left = `${minX + width / 2}px`;
  topDim.style.top = `${minY - 20}px`;
  bottomDim.style.left = `${minX + width / 2}px`;
  bottomDim.style.top = `${maxY + 5}px`;
  leftDim.style.left = `${minX - 45}px`;
  leftDim.style.top = `${minY + height / 2}px`;
  rightDim.style.left = `${maxX + 5}px`;
  rightDim.style.top = `${minY + height / 2}px`;

  const area = width * height;
  dimensionsDisplay.textContent = `Width: ${width}px | Height: ${height}px | Area: ${area} px²`;
}

// Draw Design Shape
// function drawDesignShape() {
//   ctx.save();
//   const path = getShapePath();
//   ctx.clip(path);
//   ctx.fillStyle = designShape.pattern || designShape.baseColor;
//   ctx.fill(path);
//   ctx.restore();
// }

function drawDesignShape() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path); // Clip to the shape's boundaries

  if (designShape.pattern) {
    // Calculate the bounding box from vertices
    const xs = designShape.vertices.map((v) => v.x);
    const ys = designShape.vertices.map((v) => v.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const bbWidth = maxX - minX;
    const bbHeight = maxY - minY;

    // Draw the pattern image scaled to the bounding box
    ctx.drawImage(designShape.pattern, minX, minY, bbWidth, bbHeight);
  } else {
    // Fallback to base color if no pattern
    ctx.fillStyle = designShape.baseColor;
    ctx.fill(path);
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
function drawPaintedCells() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);
  paintedCells.forEach((cell) => {
    ctx.fillStyle = hexToRgba(cell.color, fillOpacity);
    ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
  });
  ctx.restore();
}

// Draw Shape Border
function drawShapeBorder() {
  ctx.save();
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 2;
  const path = getShapePath();
  ctx.stroke(path);
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

// Create and Update Resize Handles
// function createHandles() {
//   document
//     .querySelectorAll(".resize-handle")
//     .forEach((handle) => handle.remove());
//   designShape.vertices.forEach((vertex, index) => {
//     const handle = document.createElement("div");
//     handle.className = "resize-handle";
//     handle.setAttribute("data-index", index);
//     handle.style.left = vertex.x + "px";
//     handle.style.top = vertex.y + "px";
//     canvasContainer.appendChild(handle);
//   });
// }

function createHandles() {
  // Remove existing handles
  document
    .querySelectorAll(".resize-handle, .side-handle")
    .forEach((handle) => handle.remove());

  // Create vertex handles
  designShape.vertices.forEach((vertex, index) => {
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    handle.setAttribute("data-index", index);
    handle.style.left = vertex.x + "px";
    handle.style.top = vertex.y + "px";
    canvasContainer.appendChild(handle);
  });

  // Calculate bounding box
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

// function updateHandles() {
//   const handles = document.querySelectorAll(".resize-handle");
//   handles.forEach((handle, index) => {
//     handle.style.left = designShape.vertices[index].x + "px";
//     handle.style.top = designShape.vertices[index].y + "px";
//   });
// }

function updateHandles() {
  // Update vertex handles
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

// Create SVG Pattern with Scaling (unchanged)
// function createSVGPattern(imageUrl, patternSize = cellSize) {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.src = imageUrl;
//     img.onload = () => {
//       const tempCanvas = document.createElement("canvas");
//       tempCanvas.width = patternSize;
//       tempCanvas.height = patternSize;
//       const tempCtx = tempCanvas.getContext("2d");
//       tempCtx.drawImage(img, 0, 0, patternSize, patternSize);
//       const pattern = ctx.createPattern(tempCanvas, "repeat");
//       resolve(pattern);
//     };
//   });
// }

function loadPatternImage(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => resolve(img);
  });
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
      designShape.vertices = getInitialVertices(layout.id);
      createHandles();
      redrawCanvas();
      updateDimensions();
    });
  });
}

// Generate Pattern Options (unchanged)
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
//     patternImage.alt = pattern.id;

//     const patternLabel = document.createElement("span");
//     patternLabel.className = "pattern-label";
//     patternLabel.textContent = `Pattern ${pattern.id}`;

//     patternOption.appendChild(patternImage);
//     patternOption.appendChild(patternLabel);
//     patternGrid.appendChild(patternOption);

//     patternOption.addEventListener("click", async () => {
//       document
//         .querySelectorAll(".pattern-option")
//         .forEach((opt) => opt.classList.remove("active"));
//       patternOption.classList.add("active");
//       designShape.pattern = await createSVGPattern(pattern.image, cellSize);
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

    // Create thumbnail canvas
    const canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");

    // Draw pattern preview
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 80, 60);
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
      applyCanvasPattern(pattern.id);
    });
  });
}

function applyCanvasPattern(patternId) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize;
  patternCanvas.height = cellSize;
  const pctx = patternCanvas.getContext("2d");

  // Draw pattern with current color
  pctx.fillStyle = "#ffffff";
  pctx.fillRect(0, 0, cellSize, cellSize);
  patternLibrary[patternId].draw(pctx, 0, 0, cellSize, paintColor);

  designShape.pattern = ctx.createPattern(patternCanvas, "repeat");
  redrawCanvas();
}

// Update drawing function
function drawDesignShape() {
  ctx.save();
  const path = getShapePath();
  ctx.fillStyle = designShape.pattern || designShape.baseColor;
  ctx.fill(path);
  ctx.restore();
}

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
//     patternImage.alt = pattern.id;

//     const patternLabel = document.createElement("span");
//     patternLabel.className = "pattern-label";
//     patternLabel.textContent = `Pattern ${pattern.id}`;

//     patternOption.appendChild(patternImage);
//     patternOption.appendChild(patternLabel);
//     patternGrid.appendChild(patternOption);

//     patternOption.addEventListener("click", async () => {
//       document
//         .querySelectorAll(".pattern-option")
//         .forEach((opt) => opt.classList.remove("active"));
//       patternOption.classList.add("active");
//       const img = await loadPatternImage(pattern.image);
//       designShape.pattern = img; // Store the Image object
//       redrawCanvas();
//     });
//   });
// }

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

// Painting Functionality
// canvas.addEventListener("click", (e) => {
//   if (isDragging || activeSidebarSection !== "colors") return;
//   const rect = canvas.getBoundingClientRect();
//   const clickX = e.clientX - rect.left;
//   const clickY = e.clientY - rect.top;
//   const path = getShapePath();
//   if (!ctx.isPointInPath(path, clickX, clickY)) return;

//   const xs = designShape.vertices.map((v) => v.x);
//   const ys = designShape.vertices.map((v) => v.y);
//   const minX = Math.min(...xs);
//   const cellX = Math.floor((clickX - minX) / cellSize) * cellSize + minX;
//   const cellY = Math.floor(clickY / cellSize) * cellSize;

//   let cellFound = false;
//   for (const cell of paintedCells) {
//     if (cell.x === cellX && cell.y === cellY) {
//       cell.color = paintColor;
//       cellFound = true;
//       break;
//     }
//   }
//   if (!cellFound) {
//     paintedCells.push({ x: cellX, y: cellY, color: paintColor });
//   }
//   redrawCanvas();
// });

// Updated cell painting
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

  if (activeSidebarSection === "colors") {
    // Handle color painting
    paintedCells.push({ x: cellX, y: cellY, color: paintColor });
  } else {
    // Handle pattern painting
    const pattern = document.querySelector(".pattern-option.active")?.dataset
      .pattern;
    if (pattern) {
      applyPatternToCell(cellX, cellY, pattern);
    }
  }

  redrawCanvas();
});

function applyPatternToCell(x, y, patternId) {
  // Remove any existing color for this cell
  paintedCells = paintedCells.filter((c) => !(c.x === x && c.y === y));

  // Create pattern for cell
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = cellSize;
  patternCanvas.height = cellSize;
  const pctx = patternCanvas.getContext("2d");
  patternLibrary[patternId].draw(pctx, 0, 0, cellSize, paintColor);

  // Store pattern information
  paintedCells.push({
    x,
    y,
    pattern: patternId,
    color: paintColor,
    image: patternCanvas,
  });
}

// Resize Functionality with Vertices
// canvasContainer.addEventListener("mousedown", (e) => {
//   if (
//     e.target.classList.contains("resize-handle") &&
//     activeSidebarSection === "layouts"
//   ) {
//     activeHandle = e.target.getAttribute("data-index");
//     startMouseX = e.clientX;
//     startMouseY = e.clientY;
//     startShape = JSON.parse(JSON.stringify(designShape));
//     e.stopPropagation();
//     e.preventDefault();
//   }
// });

// document.addEventListener("mousemove", (e) => {
//   if (activeHandle === null) return;
//   const dx = e.clientX - startMouseX;
//   const dy = e.clientY - startMouseY;
//   const index = parseInt(activeHandle);

//   // Update only the dragged vertex
//   designShape.vertices[index].x = Math.max(
//     0,
//     Math.min(canvas.width, startShape.vertices[index].x + dx)
//   );
//   designShape.vertices[index].y = Math.max(
//     0,
//     Math.min(canvas.height, startShape.vertices[index].y + dy)
//   );

//   redrawCanvas();
//   updateHandles();
//   updateDimensions();
// });

// document.addEventListener("mouseup", () => {
//   activeHandle = null;
// });

canvasContainer.addEventListener("mousedown", (e) => {
  if (
    e.target.classList.contains("resize-handle") &&
    activeSidebarSection === "layouts"
  ) {
    activeHandle = parseInt(e.target.getAttribute("data-index"));
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startShape = JSON.parse(JSON.stringify(designShape));
    e.stopPropagation();
    e.preventDefault();
  } else if (
    e.target.classList.contains("side-handle") &&
    activeSidebarSection === "layouts"
  ) {
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

  if (typeof activeHandle === "number") {
    // Dragging a vertex handle (existing reshaping)
    const dx = e.clientX - startMouseX;
    const dy = e.clientY - startMouseY;
    const index = activeHandle;
    designShape.vertices[index].x = Math.max(
      0,
      Math.min(canvas.width, startShape.vertices[index].x + dx)
    );
    designShape.vertices[index].y = Math.max(
      0,
      Math.min(canvas.height, startShape.vertices[index].y + dy)
    );
  } else if (activeHandle.side) {
    // Dragging a side handle (new resizing)
    const side = activeHandle.side;
    const indices = activeHandle.indices;
    if (side === "left" || side === "right") {
      const dx = e.clientX - startMouseX;
      indices.forEach((index) => {
        designShape.vertices[index].x = Math.max(
          0,
          Math.min(canvas.width, startShape.vertices[index].x + dx)
        );
      });
    } else if (side === "top" || side === "bottom") {
      const dy = e.clientY - startMouseY;
      indices.forEach((index) => {
        designShape.vertices[index].y = Math.max(
          0,
          Math.min(canvas.height, startShape.vertices[index].y + dy)
        );
      });
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

// Add at top with other constants
const patternFunctions = {
  checkerboard: (row, col, color1, color2) =>
    (row + col) % 2 === 0 ? color1 : color2,
  stripesHorizontal: (row, col, color1, color2) =>
    row % 2 === 0 ? color1 : color2,
  stripesVertical: (row, col, color1, color2) =>
    col % 2 === 0 ? color1 : color2,
  crosshatch: (row, col, color1, color2) =>
    row % 2 === 0 || col % 2 === 0 ? color1 : color2,
};

const patternMapping = {
  1: "checkerboard",
  2: "stripesHorizontal",
  3: "stripesVertical",
  4: "crosshatch",
  5: "checkerboard",
  6: "stripesHorizontal",
};

// Add new function
function applyPattern(patternId, color1 = "#ff0000", color2 = "#000000") {
  paintedCells.length = 0;
  if (!patternFunctions[patternId]) {
    console.warn(`Pattern ${patternId} not found.`);
    return;
  }
  const xs = designShape.vertices.map((v) => v.x);
  const ys = designShape.vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const startCol = Math.floor(minX / cellSize);
  const endCol = Math.ceil(maxX / cellSize);
  const startRow = Math.floor(minY / cellSize);
  const endRow = Math.ceil(maxY / cellSize);
  const path = getShapePath();
  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      const centerX = x + cellSize / 2;
      const centerY = y + cellSize / 2;
      if (ctx.isPointInPath(path, centerX, centerY)) {
        const color = patternFunctions[patternId](row, col, color1, color2);
        paintedCells.push({ x, y, color });
      }
    }
  }
  redrawCanvas();
}

// Replace existing drawDesignShape
function drawDesignShape() {
  ctx.save();
  const path = getShapePath();
  ctx.clip(path);
  ctx.fillStyle = designShape.baseColor;
  ctx.fill(path);
  ctx.restore();
}

// Replace existing generatePatternOptions
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
    patternImage.alt = pattern.id;
    const patternLabel = document.createElement("span");
    patternLabel.className = "pattern-label";
    patternLabel.textContent = `Pattern ${pattern.id}`;
    patternOption.appendChild(patternImage);
    patternOption.appendChild(patternLabel);
    patternGrid.appendChild(patternOption);
    patternOption.addEventListener("click", () => {
      document
        .querySelectorAll(".pattern-option")
        .forEach((opt) => opt.classList.remove("active"));
      patternOption.classList.add("active");
      const patternId = patternMapping[pattern.id] || "checkerboard";
      applyPattern(patternId);
      designShape.pattern = null;
    });
  });
}

// Optional: Add for responsiveness
function resizeCanvas() {
  const container = canvasContainer;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  designShape.vertices = getInitialVertices(designShape.type);
  createHandles();
  redrawCanvas();
  updateDimensions();
}

window.addEventListener("resize", resizeCanvas);

// Update init to call resizeCanvas
function init() {
  designShape.vertices = getInitialVertices("rectangle");
  generateLayoutOptions();
  generatePatternOptions();
  generateTileTypeOptions();
  generateColorSwatches();
  setupSidebarInteractions();
  updateActiveStep(currentStep);
  createHandles();
  redrawCanvas();
  updateDimensions();
  resizeCanvas(); // Initial resize
}

// Initialize Application
function init() {
  designShape.vertices = getInitialVertices("rectangle");
  generateLayoutOptions();
  generatePatternOptions();
  generateTileTypeOptions();
  generateColorSwatches();
  setupSidebarInteractions();
  updateActiveStep(currentStep);
  createHandles();
  redrawCanvas();
  updateDimensions();
}

init();
