// // Canvas & Context
// const canvas = document.getElementById("designCanvas");
// const ctx = canvas.getContext("2d");
// const canvasContainer = document.getElementById("canvasContainer");

// // Dimension Labels
// const topDim = document.querySelector(".top-dim");
// const rightDim = document.querySelector(".right-dim");
// const bottomDim = document.querySelector(".bottom-dim");
// const leftDim = document.querySelector(".left-dim");

// // Controls
// const shapeSelect = document.getElementById("shapeSelect");
// const colorPicker = document.getElementById("colorPicker");
// const dimensionsDisplay = document.getElementById("dimensions");

// // Sidebar Items
// const sidebarItems = document.querySelectorAll(".sidebar-item");

// // Resize Handles
// const handles = document.querySelectorAll(".resize-handle");

// // Settings
// const cellSize = 20;
// const fillOpacity = 0.8;

// // State Variables
// let isDragging = false;
// let dragStartX, dragStartY;
// let paintColor = "#ff0000";
// let currentStep = 0;
// const steps = ["layouts", "patterns", "tileTypes", "edges", "colors"];
// let activeSidebarSection = "layouts";

// // Design Shape Object
// const designShape = {
//   x: canvas.width / 2 - 200,
//   y: canvas.height / 2 - 150,
//   width: 400,
//   height: 300,
//   legHeight: 50, // Added for double-legged-rectangle
//   type: "rectangle",
//   pattern: null,
//   tileType: "standard",
//   baseColor: "#000000",
// };

// // Painted Cells
// const paintedCells = [];

// // Data Arrays
// const layouts = [
//   { id: "rectangle", image: "./media/svg/layouts/layout1.svg" },
//   { id: "l-shape", image: "./media/svg/layouts/layout2.svg" },
//   { id: "u-shape", image: "./media/svg/layouts/layout3.svg" },
//   { id: "double-legged-rectangle", image: "./media/svg/layouts/layout4.svg" },
// ];

// const patterns = [
//   { id: "1", image: "./media/svg/patterns/patterns1.svg" },
//   { id: "2", image: "./media/svg/patterns/patterns2.svg" },
//   { id: "3", image: "./media/svg/patterns/patterns3.svg" },
//   { id: "4", image: "./media/svg/patterns/patterns4.svg" },
//   { id: "5", image: "./media/svg/patterns/patterns5.svg" },
//   { id: "6", image: "./media/svg/patterns/patterns6.svg" },
// ];

// const tileTypes = [
//   {
//     id: "standard",
//     name: "Standard Tile",
//     image: "/placeholder.svg?height=60&width=80",
//   },
//   {
//     id: "premium",
//     name: "Premium Tile",
//     image: "/placeholder.svg?height=60&width=80",
//   },
//   {
//     id: "ceramic",
//     name: "Ceramic Tile",
//     image: "/placeholder.svg?height=60&width=80",
//   },
//   {
//     id: "porcelain",
//     name: "Porcelain Tile",
//     image: "/placeholder.svg?height=60&width=80",
//   },
//   {
//     id: "vinyl",
//     name: "Vinyl Tile",
//     image: "/placeholder.svg?height=60&width=80",
//   },
// ];

// const colors = [
//   { id: "red", value: "#ff0000", name: "Red" },
//   { id: "blue", value: "#0000ff", name: "Blue" },
//   { id: "green", value: "#008000", name: "Green" },
//   { id: "purple", value: "#800080", name: "Purple" },
// ];

// // Utility: Convert Hex to RGBA
// function hexToRgba(hex, opacity) {
//   hex = hex.replace("#", "");
//   const r = parseInt(hex.substring(0, 2), 16);
//   const g = parseInt(hex.substring(2, 4), 16);
//   const b = parseInt(hex.substring(4, 6), 16);
//   return `rgba(${r}, ${g}, ${b}, ${opacity})`;
// }

// // Create Shape Path
// function getShapePath() {
//   const { x, y, width, height, type, legHeight } = designShape;
//   const path = new Path2D();

//   if (type === "rectangle" || type === "square") {
//     path.rect(x, y, width, height);
//   } else if (type === "l-shape") {
//     path.moveTo(x, y);
//     path.lineTo(x + width, y);
//     path.lineTo(x + width, y + height / 2);
//     path.lineTo(x + width / 2, y + height / 2);
//     path.lineTo(x + width / 2, y + height);
//     path.lineTo(x, y + height);
//     path.closePath();
//   } else if (type === "u-shape") {
//     path.moveTo(x, y);
//     path.lineTo(x + width / 4, y);
//     path.lineTo(x + width / 4, y + height / 2);
//     path.lineTo(x + (width * 3) / 4, y + height / 2);
//     path.lineTo(x + (width * 3) / 4, y);
//     path.lineTo(x + width, y);
//     path.lineTo(x + width, y + height);
//     path.lineTo(x, y + height);
//     path.closePath();
//   } else if (type === "double-legged-rectangle") {
//     const legWidth = width * 0.2;
//     path.moveTo(x, y);
//     path.lineTo(x + width, y);
//     path.lineTo(x + width, y + height);
//     path.lineTo(x + width - legWidth, y + height);
//     path.lineTo(x + width - legWidth, y + height + legHeight);
//     path.lineTo(x + legWidth, y + height + legHeight);
//     path.lineTo(x + legWidth, y + height);
//     path.lineTo(x, y + height);
//     path.closePath();
//   }

//   return path;
// }

// // Update Dimensions Display
// function updateDimensions() {
//   let width = designShape.width;
//   let height = designShape.height;
//   if (designShape.type === "double-legged-rectangle") {
//     height += designShape.legHeight; // Total height includes legs
//   }
//   const area = width * height; // Approximate for bounding box

//   const ftWidth = (width / 100).toFixed(1);
//   const ftHeight = (height / 100).toFixed(1);

//   topDim.textContent = `${ftWidth}ft`;
//   bottomDim.textContent = `${ftWidth}ft`;
//   leftDim.textContent = `${ftHeight}ft`;
//   rightDim.textContent = `${ftHeight}ft`;

//   const x = designShape.x;
//   const y = designShape.y;
//   const w = designShape.width;
//   const h =
//     designShape.type === "double-legged-rectangle"
//       ? designShape.height + designShape.legHeight
//       : designShape.height;

//   topDim.style.left = `${x + w / 2}px`;
//   topDim.style.top = `${y - 20}px`;
//   bottomDim.style.left = `${x + w / 2}px`;
//   bottomDim.style.top = `${y + h}px`;
//   leftDim.style.left = `${x - 45}px`;
//   leftDim.style.top = `${y + h / 2}px`;
//   rightDim.style.left = `${x + w}px`;
//   rightDim.style.top = `${y + h / 2}px`;

//   dimensionsDisplay.textContent = `Width: ${width}px | Height: ${height}px | Area: ${area} px²`;
// }

// // Draw Design Shape
// function drawDesignShape() {
//   ctx.save();
//   const path = getShapePath();
//   ctx.clip(path);
//   ctx.fillStyle = designShape.pattern || designShape.baseColor;
//   ctx.fill(path);
//   ctx.restore();
// }

// // Draw Grid (Clipped to Shape)
// function drawGrid() {
//   ctx.save();
//   const path = getShapePath();
//   ctx.clip(path);
//   ctx.beginPath();
//   ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
//   for (
//     let x = designShape.x;
//     x <= designShape.x + designShape.width;
//     x += cellSize
//   ) {
//     ctx.moveTo(x, designShape.y);
//     ctx.lineTo(
//       x,
//       designShape.y +
//         (designShape.type === "double-legged-rectangle"
//           ? designShape.height + designShape.legHeight
//           : designShape.height)
//     );
//   }
//   for (
//     let y = designShape.y;
//     y <=
//     designShape.y +
//       (designShape.type === "double-legged-rectangle"
//         ? designShape.height + designShape.legHeight
//         : designShape.height);
//     y += cellSize
//   ) {
//     ctx.moveTo(designShape.x, y);
//     ctx.lineTo(designShape.x + designShape.width, y);
//   }
//   ctx.stroke();
//   ctx.restore();
// }

// // Draw Painted Cells
// function drawPaintedCells() {
//   ctx.save();
//   const path = getShapePath();
//   ctx.clip(path);
//   paintedCells.forEach((cell) => {
//     ctx.fillStyle = hexToRgba(cell.color, fillOpacity);
//     ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
//   });
//   ctx.restore();
// }

// // Draw Shape Border
// function drawShapeBorder() {
//   ctx.save();
//   ctx.strokeStyle = "#ffcc00";
//   ctx.lineWidth = 2;
//   const path = getShapePath();
//   ctx.stroke(path);
//   ctx.restore();
// }

// // Redraw Canvas
// function redrawCanvas() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   drawDesignShape();
//   drawPaintedCells();
//   drawGrid();
//   drawShapeBorder();
// }

// // Update Resize Handles
// function updateHandles() {
//   let top, bottom;
//   if (designShape.type === "double-legged-rectangle") {
//     top = designShape.y;
//     bottom = designShape.y + designShape.height + designShape.legHeight;
//   } else {
//     top = designShape.y;
//     bottom = designShape.y + designShape.height;
//   }
//   const left = designShape.x;
//   const right = designShape.x + designShape.width;
//   const centerX = left + (right - left) / 2;
//   const centerY = top + (bottom - top) / 2;

//   document.querySelector(".handle-tl").style.left = left + "px";
//   document.querySelector(".handle-tl").style.top = top + "px";
//   document.querySelector(".handle-tm").style.left = centerX + "px";
//   document.querySelector(".handle-tm").style.top = top + "px";
//   document.querySelector(".handle-tr").style.left = right + "px";
//   document.querySelector(".handle-tr").style.top = top + "px";
//   document.querySelector(".handle-mr").style.left = right + "px";
//   document.querySelector(".handle-mr").style.top = centerY + "px";
//   document.querySelector(".handle-br").style.left = right + "px";
//   document.querySelector(".handle-br").style.top = bottom + "px";
//   document.querySelector(".handle-bm").style.left = centerX + "px";
//   document.querySelector(".handle-bm").style.top = bottom + "px";
//   document.querySelector(".handle-bl").style.left = left + "px";
//   document.querySelector(".handle-bl").style.top = bottom + "px";
//   document.querySelector(".handle-ml").style.left = left + "px";
//   document.querySelector(".handle-ml").style.top = centerY + "px";
// }

// // Create SVG Pattern with Scaling
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

// // Generate Layout Options
// function generateLayoutOptions() {
//   const layoutGrid = document.getElementById("layoutGrid");
//   layoutGrid.innerHTML = "";

//   layouts.forEach((layout) => {
//     const layoutOption = document.createElement("div");
//     layoutOption.className = "layout-option";
//     layoutOption.setAttribute("data-layout", layout.id);
//     if (layout.id === designShape.type) {
//       layoutOption.classList.add("active");
//     }

//     const layoutImage = document.createElement("img");
//     layoutImage.className = "layout-image";
//     layoutImage.src = layout.image;
//     layoutImage.alt = layout.id;

//     const layoutLabel = document.createElement("span");
//     layoutLabel.className = "layout-label";
//     layoutLabel.textContent = layout.id.replace(/-/g, " ");

//     layoutOption.appendChild(layoutImage);
//     layoutOption.appendChild(layoutLabel);
//     layoutGrid.appendChild(layoutOption);

//     layoutOption.addEventListener("click", () => {
//       document
//         .querySelectorAll(".layout-option")
//         .forEach((opt) => opt.classList.remove("active"));
//       layoutOption.classList.add("active");

//       designShape.type = layout.id;
//       switch (layout.id) {
//         case "rectangle":
//           designShape.width = 400;
//           designShape.height = 300;
//           delete designShape.legHeight;
//           break;
//         case "l-shape":
//           designShape.width = 500;
//           designShape.height = 400;
//           delete designShape.legHeight;
//           break;
//         case "u-shape":
//           designShape.width = 450;
//           designShape.height = 350;
//           delete designShape.legHeight;
//           break;
//         case "double-legged-rectangle":
//           designShape.width = 400;
//           designShape.height = 300;
//           designShape.legHeight = 50;
//           break;
//       }

//       designShape.x = canvas.width / 2 - designShape.width / 2;
//       designShape.y =
//         canvas.height / 2 -
//         (designShape.type === "double-legged-rectangle"
//           ? designShape.height + designShape.legHeight
//           : designShape.height) /
//           2;

//       redrawCanvas();
//       updateHandles();
//       updateDimensions();
//     });
//   });
// }

// // Generate Pattern Options
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

// // Generate Tile Type Options
// function generateTileTypeOptions() {
//   const tileTypeGrid = document.getElementById("tileTypeGrid");
//   tileTypeGrid.innerHTML = "";

//   tileTypes.forEach((tileType) => {
//     const tileTypeOption = document.createElement("div");
//     tileTypeOption.className = "tile-type-option";
//     tileTypeOption.setAttribute("data-tile-type", tileType.id);
//     if (tileType.id === designShape.tileType) {
//       tileTypeOption.classList.add("active");
//     }

//     const tileTypeImage = document.createElement("img");
//     tileTypeImage.className = "tile-type-image";
//     tileTypeImage.src = tileType.image;
//     tileTypeImage.alt = tileType.name;

//     const tileTypeLabel = document.createElement("span");
//     tileTypeLabel.className = "tile-type-label";
//     tileTypeLabel.textContent = tileType.name;

//     tileTypeOption.appendChild(tileTypeImage);
//     tileTypeOption.appendChild(tileTypeLabel);
//     tileTypeGrid.appendChild(tileTypeOption);

//     tileTypeOption.addEventListener("click", () => {
//       document
//         .querySelectorAll(".tile-type-option")
//         .forEach((opt) => opt.classList.remove("active"));
//       tileTypeOption.classList.add("active");
//       designShape.tileType = tileType.id;
//       redrawCanvas();
//     });
//   });
// }

// // Generate Color Swatches
// function generateColorSwatches() {
//   const colorSwatches = document.getElementById("colorSwatches");
//   colorSwatches.innerHTML = "";

//   colors.forEach((color) => {
//     const colorSwatch = document.createElement("div");
//     colorSwatch.className = "color-swatch";
//     colorSwatch.setAttribute("data-color", color.id);
//     colorSwatch.style.backgroundColor = color.value;
//     if (color.value === paintColor) {
//       colorSwatch.classList.add("active");
//     }

//     colorSwatches.appendChild(colorSwatch);

//     colorSwatch.addEventListener("click", () => {
//       document
//         .querySelectorAll(".color-swatch")
//         .forEach((swatch) => swatch.classList.remove("active"));
//       colorSwatch.classList.add("active");
//       paintColor = color.value;
//       colorPicker.value = color.value;
//     });
//   });
// }

// // Sidebar Interactions
// function setupSidebarInteractions() {
//   sidebarItems.forEach((item) => {
//     const header = item.querySelector(".sidebar-header");
//     header.addEventListener("click", () => {
//       const section = item.getAttribute("data-section");
//       if (item.classList.contains("active")) {
//         item.classList.remove("active");
//         const arrow = item.querySelector(".sidebar-arrow i");
//         if (arrow) arrow.className = "ri-arrow-down-s-line";
//         return;
//       }

//       sidebarItems.forEach((otherItem) => {
//         otherItem.classList.remove("active");
//         const arrow = otherItem.querySelector(".sidebar-arrow i");
//         if (arrow) arrow.className = "ri-arrow-down-s-line";
//       });

//       item.classList.add("active");
//       const arrow = item.querySelector(".sidebar-arrow i");
//       if (arrow) arrow.className = "ri-arrow-up-s-line";

//       activeSidebarSection = section;
//       currentStep = steps.indexOf(section);

//       canvasContainer.classList.toggle(
//         "resize-handles-hidden",
//         section !== "layouts"
//       );
//     });
//   });
// }

// // Update Active Step
// function updateActiveStep(step) {
//   sidebarItems.forEach((item) => {
//     item.classList.remove("active");
//     const arrow = item.querySelector(".sidebar-arrow i");
//     if (arrow) arrow.className = "ri-arrow-down-s-line";
//   });

//   const activeItem = document.querySelector(
//     `.sidebar-item[data-section="${steps[step]}"]`
//   );
//   if (activeItem) {
//     activeItem.classList.add("active");
//     const arrow = activeItem.querySelector(".sidebar-arrow i");
//     if (arrow) arrow.className = "ri-arrow-up-s-line";
//   }

//   canvasContainer.classList.toggle(
//     "resize-handles-hidden",
//     steps[step] !== "layouts"
//   );
//   activeSidebarSection = steps[step];
// }

// // Painting Functionality
// canvas.addEventListener("click", (e) => {
//   if (isDragging || activeSidebarSection !== "colors") return;

//   const rect = canvas.getBoundingClientRect();
//   const clickX = e.clientX - rect.left;
//   const clickY = e.clientY - rect.top;

//   const path = getShapePath();
//   if (!ctx.isPointInPath(path, clickX, clickY)) return;

//   const cellX =
//     Math.floor((clickX - designShape.x) / cellSize) * cellSize + designShape.x;
//   const cellY =
//     Math.floor((clickY - designShape.y) / cellSize) * cellSize + designShape.y;

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

// // Resize Functionality
// let activeHandle = null;
// let startMouseX, startMouseY;
// let startShape = {};

// handles.forEach((handle) => {
//   handle.addEventListener("mousedown", (e) => {
//     activeHandle = e.target.getAttribute("data-handle");
//     startMouseX = e.clientX;
//     startMouseY = e.clientY;
//     startShape = { ...designShape };
//     e.stopPropagation();
//     e.preventDefault();
//   });
// });

// document.addEventListener("mousemove", (e) => {
//   if (!activeHandle) return;
//   const dx = e.clientX - startMouseX;
//   const dy = e.clientY - startMouseY;

//   const minWidth = 50;
//   const minHeight = 50;

//   let newX = startShape.x;
//   let newY = startShape.y;
//   let newWidth = startShape.width;
//   let newHeight = startShape.height;
//   let newLegHeight = startShape.legHeight || 50;

//   if (designShape.type === "double-legged-rectangle") {
//     switch (activeHandle) {
//       case "tm":
//         newY = startShape.y + dy;
//         newY = Math.min(newY, startShape.y + startShape.height - minHeight);
//         newY = Math.max(newY, 0);
//         newHeight = startShape.y + startShape.height - newY;
//         break;
//       case "mr":
//         newWidth = startShape.width + dx;
//         newWidth = Math.max(newWidth, minWidth);
//         newWidth = Math.min(newWidth, canvas.width - startShape.x);
//         break;
//       case "bm":
//         newLegHeight = startShape.legHeight + dy;
//         newLegHeight = Math.max(newLegHeight, 0);
//         newLegHeight = Math.min(
//           newLegHeight,
//           canvas.height - startShape.y - startShape.height
//         );
//         break;
//       case "ml":
//         newX = startShape.x + dx;
//         newX = Math.min(newX, startShape.x + startShape.width - minWidth);
//         newX = Math.max(newX, 0);
//         newWidth = startShape.x + startShape.width - newX;
//         break;
//     }
//     designShape.x = newX;
//     designShape.y = newY;
//     designShape.width = newWidth;
//     designShape.height = newHeight;
//     designShape.legHeight = newLegHeight;
//   } else {
//     switch (activeHandle) {
//       case "tm":
//         newY = startShape.y + dy;
//         newY = Math.min(newY, startShape.y + startShape.height - minHeight);
//         newY = Math.max(newY, 0);
//         newHeight = startShape.y + startShape.height - newY;
//         break;
//       case "mr":
//         newWidth = startShape.width + dx;
//         newWidth = Math.max(newWidth, minWidth);
//         newWidth = Math.min(newWidth, canvas.width - startShape.x);
//         break;
//       case "bm":
//         newHeight = startShape.height + dy;
//         newHeight = Math.max(newHeight, minHeight);
//         newHeight = Math.min(newHeight, canvas.height - startShape.y);
//         break;
//       case "ml":
//         newX = startShape.x + dx;
//         newX = Math.min(newX, startShape.x + startShape.width - minWidth);
//         newX = Math.max(newX, 0);
//         newWidth = startShape.x + startShape.width - newX;
//         break;
//     }
//     designShape.x = newX;
//     designShape.y = newY;
//     designShape.width = newWidth;
//     designShape.height = newHeight;
//   }

//   redrawCanvas();
//   updateHandles();
//   updateDimensions();
// });

// document.addEventListener("mouseup", () => {
//   activeHandle = null;
// });

// // Navigation Buttons
// document.querySelector(".next-btn").addEventListener("click", () => {
//   if (currentStep < steps.length - 1) {
//     currentStep++;
//     updateActiveStep(currentStep);
//   }
// });

// document.querySelector(".back-btn").addEventListener("click", () => {
//   if (currentStep > 0) {
//     currentStep--;
//     updateActiveStep(currentStep);
//   }
// });

// // Initialize Application
// function init() {
//   paintColor = colorPicker.value;

//   generateLayoutOptions();
//   generatePatternOptions();
//   generateTileTypeOptions();
//   generateColorSwatches();

//   setupSidebarInteractions();
//   updateActiveStep(currentStep);

//   redrawCanvas();
//   updateHandles();
//   updateDimensions();
// }

// init();
