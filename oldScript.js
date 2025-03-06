// // Canvas & Context
// const canvas = document.getElementById("designCanvas");
// const ctx = canvas.getContext("2d");
// const canvasContainer = document.getElementById("canvasContainer");

// // References to dimension labels
// const topDim = document.querySelector(".top-dim");
// const rightDim = document.querySelector(".right-dim");
// const bottomDim = document.querySelector(".bottom-dim");
// const leftDim = document.querySelector(".left-dim");

// // Controls
// const shapeSelect = document.getElementById("shapeSelect");
// const colorPicker = document.getElementById("colorPicker");
// const colorSelect = document.getElementById("colorSelect");
// const tileTypeSelect = document.getElementById("tileTypeSelect");
// const dimensionsDisplay = document.getElementById("dimensions");

// // Sidebar items
// const sidebarItems = document.querySelectorAll(".sidebar-item");

// // Resize handles
// const handles = document.querySelectorAll(".resize-handle");

// // Settings (Grid Size)
// const cellSize = 20;
// const fillOpacity = 0.8;

// // Add these variables at the top of the file, after other variable declarations
// let isDragging = false;
// let dragStartX, dragStartY;
// let paintColor = "#ff0000"; // Added paintColor variable

// // Initialize the floor layout centered in the canvas
// const designShape = {
//   x: canvas.width / 2 - 200,
//   y: canvas.height / 2 - 150,
//   width: 400,
//   height: 300,
//   type: "rectangle",
//   pattern: null,
//   tileType: "standard",
//   baseColor: "#000000", // This is for the shape's base color
// };

// // Painted cells
// const paintedCells = [];

// // Active sidebar section
// let activeSidebarSection = "layouts";

// // Convert hex color to RGBA string.
// function hexToRgba(hex, opacity) {
//   hex = hex.replace("#", "");
//   const r = Number.parseInt(hex.substring(0, 2), 16);
//   const g = Number.parseInt(hex.substring(2, 4), 16);
//   const b = Number.parseInt(hex.substring(4, 6), 16);
//   return `rgba(${r}, ${g}, ${b}, ${opacity})`;
// }

// // Create a Path2D for the current design shape.
// function getShapePath() {
//   const { x, y, width, height, type } = designShape;
//   const path = new Path2D();

//   if (type === "rectangle" || type === "square") {
//     path.rect(x, y, width, height);
//   } else if (type === "l-shape") {
//     // Create an L-shape path
//     path.moveTo(x, y);
//     path.lineTo(x + width, y);
//     path.lineTo(x + width, y + height / 2);
//     path.lineTo(x + width / 2, y + height / 2);
//     path.lineTo(x + width / 2, y + height);
//     path.lineTo(x, y + height);
//     path.closePath();
//   } else if (type === "u-shape") {
//     // Create a U-shape path
//     path.moveTo(x, y);
//     path.lineTo(x + width / 4, y);
//     path.lineTo(x + width / 4, y + height / 2);
//     path.lineTo(x + (width * 3) / 4, y + height / 2);
//     path.lineTo(x + (width * 3) / 4, y);
//     path.lineTo(x + width, y);
//     path.lineTo(x + width, y + height);
//     path.lineTo(x, y + height);
//     path.closePath();
//   } else if (type === "circle") {
//     const centerX = x + width / 2;
//     const centerY = y + height / 2;
//     const radius = width / 2;
//     path.arc(centerX, centerY, radius, 0, 2 * Math.PI);
//   }

//   return path;
// }

// // Update dimensions display.
// function updateDimensions() {
//   const { width, height, x, y } = designShape;
//   const area = width * height;

//   // Update dimension labels
//   const ftWidth = (width / 100).toFixed(1);
//   const ftHeight = (height / 100).toFixed(1);

//   topDim.textContent = `${ftWidth}ft`;
//   bottomDim.textContent = `${ftWidth}ft`;
//   leftDim.textContent = `${ftHeight}ft`;
//   rightDim.textContent = `${ftHeight}ft`;

//   // Position dimension labels along the shape sides
//   // Top dimension - centered on top edge
//   topDim.style.left = `${x + width / 2}px`;
//   topDim.style.top = `${y - 20}px`;

//   // Bottom dimension - centered on bottom edge
//   bottomDim.style.left = `${x + width / 2}px`;
//   bottomDim.style.top = `${y + height}px`;

//   // Left dimension - centered on left edge
//   leftDim.style.left = `${x - 45}px`;
//   leftDim.style.top = `${y + height / 2}px`;

//   // Right dimension - centered on right edge
//   rightDim.style.left = `${x + width}px`;
//   rightDim.style.top = `${y + height / 2}px`;

//   // Update dimensions display in control panel
//   dimensionsDisplay.textContent = `Width: ${width}px | Height: ${height}px | Area: ${area} px²`;
// }

// // Draw the design shape background using clipping.
// function drawDesignShape() {
//   ctx.save();
//   const path = getShapePath();
//   ctx.clip(path);
//   ctx.fillStyle = designShape.pattern
//     ? designShape.pattern
//     : designShape.baseColor; // Updated to use baseColor
//   ctx.fill(path);
//   ctx.restore();
// }

// // Draw grid lines clipped to the shape.
// function drawGrid() {
//   ctx.save();
//   const path = getShapePath();
//   ctx.clip(path);
//   ctx.beginPath();
//   ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
//   // Use the bounding box of the designShape.
//   for (
//     let x = designShape.x;
//     x <= designShape.x + designShape.width;
//     x += cellSize
//   ) {
//     ctx.moveTo(x, designShape.y);
//     ctx.lineTo(x, designShape.y + designShape.height);
//   }
//   for (
//     let y = designShape.y;
//     y <= designShape.y + designShape.height;
//     y += cellSize
//   ) {
//     ctx.moveTo(designShape.x, y);
//     ctx.lineTo(designShape.x + designShape.width, y);
//   }
//   ctx.stroke();
//   ctx.restore();
// }

// // Draw painted cells clipped to the shape
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

// // Draw the border of the shape.
// function drawShapeBorder() {
//   ctx.save();
//   ctx.strokeStyle = "#ffcc00";
//   ctx.lineWidth = 2;
//   const path = getShapePath();
//   ctx.stroke(path);
//   ctx.restore();
// }

// // Redraw the entire canvas.
// function redrawCanvas() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   drawDesignShape();
//   drawPaintedCells();
//   drawGrid();
//   drawShapeBorder();
// }

// // Update positions of the eight resize handles
// function updateHandles() {
//   const hs = 1;
//   const left = designShape.x - hs / 2;
//   const right = designShape.x + designShape.width - hs / 2;
//   const top = designShape.y - hs / 2;
//   const bottom = designShape.y + designShape.height - hs / 2;
//   const centerX = designShape.x + designShape.width / 2 - hs / 2;
//   const centerY = designShape.y + designShape.height / 2 - hs / 2;

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

// // Pattern Functions
// function createDiagonalLinesPattern() {
//   const patternCanvas = document.createElement("canvas");
//   patternCanvas.width = 20;
//   patternCanvas.height = 20;
//   const pctx = patternCanvas.getContext("2d");
//   pctx.fillStyle = "#222";
//   pctx.fillRect(0, 0, 20, 20);
//   pctx.strokeStyle = "#444";
//   pctx.lineWidth = 2;
//   pctx.beginPath();
//   pctx.moveTo(0, 20);
//   pctx.lineTo(20, 0);
//   pctx.stroke();
//   return ctx.createPattern(patternCanvas, "repeat");
// }

// function createCheckerboardPattern() {
//   const patternCanvas = document.createElement("canvas");
//   patternCanvas.width = 20;
//   patternCanvas.height = 20;
//   const pctx = patternCanvas.getContext("2d");
//   pctx.fillStyle = "#111";
//   pctx.fillRect(0, 0, 20, 20);
//   pctx.fillStyle = "#333";
//   pctx.fillRect(0, 0, 10, 10);
//   pctx.fillRect(10, 10, 10, 10);
//   return ctx.createPattern(patternCanvas, "repeat");
// }

// function createHerringbonePattern() {
//   const patternCanvas = document.createElement("canvas");
//   patternCanvas.width = 30;
//   patternCanvas.height = 30;
//   const pctx = patternCanvas.getContext("2d");
//   pctx.fillStyle = "#222";
//   pctx.fillRect(0, 0, 30, 30);

//   // Draw herringbone pattern
//   pctx.fillStyle = "#444";
//   pctx.beginPath();
//   pctx.moveTo(0, 0);
//   pctx.lineTo(15, 15);
//   pctx.lineTo(0, 30);
//   pctx.fill();

//   pctx.beginPath();
//   pctx.moveTo(30, 0);
//   pctx.lineTo(15, 15);
//   pctx.lineTo(30, 30);
//   pctx.fill();

//   return ctx.createPattern(patternCanvas, "repeat");
// }

// function createBasketweavePattern() {
//   const patternCanvas = document.createElement("canvas");
//   patternCanvas.width = 40;
//   patternCanvas.height = 40;
//   const pctx = patternCanvas.getContext("2d");
//   pctx.fillStyle = "#222";
//   pctx.fillRect(0, 0, 40, 40);

//   // Draw basketweave pattern
//   pctx.fillStyle = "#444";
//   pctx.fillRect(0, 0, 20, 20);
//   pctx.fillRect(20, 20, 20, 20);

//   return ctx.createPattern(patternCanvas, "repeat");
// }

// // Setup dragging functionality
// // function setupDragging() {
// //   canvas.addEventListener("mousedown", startDragging);
// //   canvas.addEventListener("mousemove", drag);
// //   canvas.addEventListener("mouseup", stopDragging);
// //   canvas.addEventListener("mouseleave", stopDragging);
// // }

// // function startDragging(e) {
// //   const rect = canvas.getBoundingClientRect();
// //   const clickX = e.clientX - rect.left;
// //   const clickY = e.clientY - rect.top;

// //   // Check if the click is inside the shape
// //   const path = getShapePath();
// //   if (ctx.isPointInPath(path, clickX, clickY)) {
// //     isDragging = true;
// //     dragStartX = clickX - designShape.x;
// //     dragStartY = clickY - designShape.y;
// //   }
// // }

// // function drag(e) {
// //   if (!isDragging) return;

// //   const rect = canvas.getBoundingClientRect();
// //   const mouseX = e.clientX - rect.left;
// //   const mouseY = e.clientY - rect.top;

// //   designShape.x = mouseX - dragStartX;
// //   designShape.y = mouseY - dragStartY;

// //   // Constrain the shape within the canvas
// //   designShape.x = Math.max(
// //     0,
// //     Math.min(designShape.x, canvas.width - designShape.width)
// //   );
// //   designShape.y = Math.max(
// //     0,
// //     Math.min(designShape.y, canvas.height - designShape.height)
// //   );

// //   redrawCanvas();
// //   updateHandles();
// //   updateDimensions();
// // }

// // function stopDragging() {
// //   isDragging = false;
// // }

// // Initialize canvas and interface
// function init() {
//   // Set initial paint color to match the color picker
//   paintColor = colorPicker.value;

//   redrawCanvas();
//   updateHandles();
//   updateDimensions();

//   // Set event handlers for sidebar
//   setupSidebarInteractions();

//   // Set up pattern options
//   setupPatternOptions();

//   // Set up layout options
//   setupLayoutOptions();

//   // Set up color options
//   setupColorOptions();

//   // Set up tile type options
//   setupTileTypeOptions();

//   // Enable dragging
//   setupDragging();
// }

// // Handle sidebar interactions
// function setupSidebarInteractions() {
//   sidebarItems.forEach((item) => {
//     const header = item.querySelector(".sidebar-header");
//     header.addEventListener("click", () => {
//       // Get sidebar title
//       const title = item
//         .querySelector(".sidebar-title")
//         .textContent.toLowerCase();

//       // Toggle the active state for this sidebar item
//       item.classList.toggle("active");
//       const arrow = item.querySelector(".sidebar-arrow");
//       if (arrow) {
//         arrow.textContent = item.classList.contains("active") ? "▲" : "▼";
//       }

//       if (title === "layout size") {
//         // Enable resize mode
//         activeSidebarSection = "size";
//       } else if (title === "color") {
//         // Show color picker
//         activeSidebarSection = "color";
//       }
//     });
//   });
// }

// // Set up pattern options
// function setupPatternOptions() {
//   const patternOptions = document.querySelectorAll(".pattern-option");
//   patternOptions.forEach((option) => {
//     option.addEventListener("click", () => {
//       const patternType = option.getAttribute("data-pattern");

//       switch (patternType) {
//         case "diagonal-lines":
//           designShape.pattern = createDiagonalLinesPattern();
//           break;
//         case "checkerboard":
//           designShape.pattern = createCheckerboardPattern();
//           break;
//         case "herringbone":
//           designShape.pattern = createHerringbonePattern();
//           break;
//         case "basketweave":
//           designShape.pattern = createBasketweavePattern();
//           break;
//       }

//       redrawCanvas();
//     });
//   });
// }

// // Set up color options
// function setupColorOptions() {
//   // Color picker event
//   colorPicker.addEventListener("input", (e) => {
//     paintColor = e.target.value; // Updated to set paintColor
//     colorSelect.value = e.target.value;
//   });

//   // Color dropdown event
//   colorSelect.addEventListener("change", (e) => {
//     paintColor = e.target.value; // Updated to set paintColor
//     colorPicker.value = e.target.value;
//   });
// }

// // Set up tile type options
// function setupTileTypeOptions() {
//   tileTypeSelect.addEventListener("change", (e) => {
//     designShape.tileType = e.target.value;
//     // You could add additional logic here to change appearance based on tile type
//     redrawCanvas();
//   });
// }

// // Set up layout options
// function setupLayoutOptions() {
//   const layoutOptions = document.querySelectorAll(".layout-option");
//   layoutOptions.forEach((option) => {
//     option.addEventListener("click", () => {
//       const layoutType = option.getAttribute("data-layout");

//       switch (layoutType) {
//         case "rectangle":
//           designShape.type = "rectangle";
//           designShape.width = 400;
//           designShape.height = 300;
//           break;
//         case "l-shape":
//           designShape.type = "l-shape";
//           designShape.width = 500;
//           designShape.height = 400;
//           break;
//         case "u-shape":
//           designShape.type = "u-shape";
//           designShape.width = 450;
//           designShape.height = 350;
//           break;
//         case "square":
//           designShape.type = "square";
//           designShape.width = 400;
//           designShape.height = 400;
//           break;
//       }

//       // Center the design in the canvas
//       designShape.x = canvas.width / 2 - designShape.width / 2;
//       designShape.y = canvas.height / 2 - designShape.height / 2;

//       redrawCanvas();
//       updateHandles();
//       updateDimensions();
//     });
//   });
// }

// // Painting Functionality
// canvas.addEventListener("click", (e) => {
//   if (isDragging) return; // Prevent painting when dragging

//   const rect = canvas.getBoundingClientRect();
//   const clickX = e.clientX - rect.left;
//   const clickY = e.clientY - rect.top;

//   // Only enable painting when color section is active
//   if (activeSidebarSection !== "color") return;

//   // Use the shape path to determine if the click is inside.
//   const path = getShapePath();
//   if (!ctx.isPointInPath(path, clickX, clickY)) return;

//   // Click to grid inside the design shape bounding box.
//   const cellX =
//     Math.floor((clickX - designShape.x) / cellSize) * cellSize + designShape.x;
//   const cellY =
//     Math.floor((clickY - designShape.y) / cellSize) * cellSize + designShape.y;

//   // Update cell if it exists; otherwise add a new one.
//   let cellFound = false;
//   for (const cell of paintedCells) {
//     if (cell.x === cellX && cell.y === cellY) {
//       cell.color = paintColor; // Use paintColor instead of colorPicker.value
//       cellFound = true;
//       break;
//     }
//   }
//   if (!cellFound) {
//     paintedCells.push({ x: cellX, y: cellY, color: paintColor }); // Use paintColor
//   }
//   redrawCanvas();
// });

// // Shape Selection
// shapeSelect.addEventListener("change", (e) => {
//   designShape.type = e.target.value;
//   // For non-rectangle shapes, enforce a square bounding box.
//   if (designShape.type !== "rectangle") {
//     const size = Math.min(designShape.width, designShape.height);
//     designShape.width = size;
//     designShape.height = size;
//   }
//   redrawCanvas();
//   updateHandles();
//   updateDimensions();
// });

// // --- Resize / Reshape Functionality ---
// let activeHandle = null;
// let startMouseX, startMouseY;
// let startShape = {};

// // Add mousedown listener to each handle.
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

//   // Store original values to check if we're at canvas boundaries
//   const originalX = designShape.x;
//   const originalY = designShape.y;
//   const originalWidth = designShape.width;
//   const originalHeight = designShape.height;

//   if (designShape.type === "rectangle") {
//     // Free resizing for rectangle.
//     switch (activeHandle) {
//       case "tl":
//         designShape.x = startShape.x + dx;
//         designShape.y = startShape.y + dy;
//         designShape.width = startShape.width - dx;
//         designShape.height = startShape.height - dy;
//         break;
//       case "tm":
//         designShape.y = startShape.y + dy;
//         designShape.height = startShape.height - dy;
//         break;
//       case "tr":
//         designShape.y = startShape.y + dy;
//         designShape.width = startShape.width + dx;
//         designShape.height = startShape.height - dy;
//         break;
//       case "mr":
//         designShape.width = startShape.width + dx;
//         break;
//       case "br":
//         designShape.width = startShape.width + dx;
//         designShape.height = startShape.height + dy;
//         break;
//       case "bm":
//         designShape.height = startShape.height + dy;
//         break;
//       case "bl":
//         designShape.x = startShape.x + dx;
//         designShape.width = startShape.width - dx;
//         designShape.height = startShape.height + dy;
//         break;
//       case "ml":
//         designShape.x = startShape.x + dx;
//         designShape.width = startShape.width - dx;
//         break;
//     }
//   } else {
//     // For non-rectangle shapes (square, circle, triangle, pentagon), enforce a square.
//     switch (activeHandle) {
//       case "tl": {
//         const newWidth = startShape.width - dx;
//         const newHeight = startShape.height - dy;
//         const newSize = Math.min(newWidth, newHeight);
//         designShape.x = startShape.x + (startShape.width - newSize);
//         designShape.y = startShape.y + (startShape.height - newSize);
//         designShape.width = newSize;
//         designShape.height = newSize;
//         break;
//       }
//       case "tm": {
//         const newSize = startShape.height - dy;
//         designShape.y = startShape.y + (startShape.height - newSize);
//         designShape.width = newSize;
//         designShape.height = newSize;
//         break;
//       }
//       case "tr": {
//         const newWidth = startShape.width + dx;
//         const newHeight = startShape.height - dy;
//         const newSize = Math.min(newWidth, newHeight);
//         designShape.y = startShape.y + (startShape.height - newSize);
//         designShape.width = newSize;
//         designShape.height = newSize;
//         break;
//       }
//       case "mr": {
//         const newSize = startShape.width + dx;
//         designShape.width = newSize;
//         designShape.height = newSize;
//         break;
//       }
//       case "br": {
//         const newWidth = startShape.width + dx;
//         const newHeight = startShape.height + dy;
//         const newSize = Math.min(newWidth, newHeight);
//         designShape.width = newSize;
//         designShape.height = newSize;
//         break;
//       }
//       case "bm": {
//         const newSize = startShape.height + dy;
//         designShape.width = newSize;
//         designShape.height = newSize;
//         break;
//       }
//       case "bl": {
//         const newWidth = startShape.width - dx;
//         const newHeight = startShape.height + dy;
//         const newSize = Math.min(newWidth, newHeight);
//         designShape.x = startShape.x + (startShape.width - newSize);
//         designShape.width = newSize;
//         designShape.height = newSize;
//         break;
//       }
//       case "ml": {
//         const newSize = startShape.width - dx;
//         designShape.x = startShape.x + (startShape.width - newSize);
//         designShape.width = newSize;
//         designShape.height = newSize;
//         break;
//       }
//     }
//   }

//   // Enforce a minimum size of 50px.
//   if (designShape.width < 50) {
//     designShape.width = 50;
//     // If we're resizing from the left, maintain the right edge position
//     if (activeHandle.includes("l")) {
//       designShape.x = originalX + originalWidth - 50;
//     }
//     if (designShape.type !== "rectangle") designShape.height = 50;
//   }

//   if (designShape.height < 50) {
//     designShape.height = 50;
//     // If we're resizing from the top, maintain the bottom edge position
//     if (activeHandle.includes("t")) {
//       designShape.y = originalY + originalHeight - 50;
//     }
//     if (designShape.type !== "rectangle") designShape.width = 50;
//   }

//   // Enforce canvas boundaries so shape stays within canvas dimensions
//   // Left boundary
//   if (designShape.x < 0) {
//     // Only adjust width if we're resizing from the left
//     if (activeHandle.includes("l")) {
//       designShape.width += designShape.x; // Reduce width by the amount we're out of bounds
//       designShape.x = 0;
//     } else {
//       designShape.x = 0;
//     }
//   }

//   // Top boundary
//   if (designShape.y < 0) {
//     // Only adjust height if we're resizing from the top
//     if (activeHandle.includes("t")) {
//       designShape.height += designShape.y; // Reduce height by the amount we're out of bounds
//       designShape.y = 0;
//     } else {
//       designShape.y = 0;
//     }
//   }

//   // Right boundary
//   if (designShape.x + designShape.width > canvas.width) {
//     // Only adjust width if we're resizing from the right
//     if (activeHandle.includes("r")) {
//       designShape.width = canvas.width - designShape.x;
//     } else {
//       // If we're resizing from the left, adjust x position to keep right edge in place
//       designShape.x = canvas.width - designShape.width;
//     }
//   }

//   // Bottom boundary
//   if (designShape.y + designShape.height > canvas.height) {
//     // Only adjust height if we're resizing from the bottom
//     if (activeHandle.includes("b")) {
//       designShape.height = canvas.height - designShape.y;
//     } else {
//       // If we're resizing from the top, adjust y position to keep bottom edge in place
//       designShape.y = canvas.height - designShape.height;
//     }
//   }

//   redrawCanvas();
//   updateHandles();
//   updateDimensions();
// });

// document.addEventListener("mouseup", () => {
//   activeHandle = null;
// });

// // Next and Back button functionality
// document.querySelector(".next-btn").addEventListener("click", () => {
//   alert("Design completed! Moving to next step...");
// });

// document.querySelector(".back-btn").addEventListener("click", () => {
//   alert("Going back to previous step...");
// });

// // Call init() to set up the application
// init();
