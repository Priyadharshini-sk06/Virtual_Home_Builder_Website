// ================================
// READ SQFT
// ================================
const selectedSqft = parseInt(localStorage.getItem("selectedSqft")) || 800;

function getCanvasDimensions(sqft) {
  if (sqft <= 600) return { width: 600, height: 600 };
  if (sqft <= 800) return { width: 800, height: 600 };
  if (sqft <= 1000) return { width: 1000, height: 700 };
  return { width: 1200, height: 800 };
}

const size = getCanvasDimensions(selectedSqft);

// ================================
// CONSTANTS
// ================================
const gridSize = 50;
const snapSize = 50;
const MIN_ROOM_WIDTH = 100;
const MIN_ROOM_HEIGHT = 100;

// ================================
// CANVAS INIT
// ================================
const canvas = new fabric.Canvas("floorCanvas", {
  width: size.width,
  height: size.height,
  backgroundColor: "#ffffff",
  selection: true,
  preserveObjectStacking: true
});

// ================================
// DRAW GRID (ONCE)
// ================================
function drawGrid() {
  for (let i = 0; i <= canvas.width / gridSize; i++) {
    canvas.add(new fabric.Line(
      [i * gridSize, 0, i * gridSize, canvas.height],
      { stroke: "#e5e9f2", selectable: false, evented: false }
    ));
  }

  for (let i = 0; i <= canvas.height / gridSize; i++) {
    canvas.add(new fabric.Line(
      [0, i * gridSize, canvas.width, i * gridSize],
      { stroke: "#e5e9f2", selectable: false, evented: false }
    ));
  }
}

drawGrid();

// ================================
// ROOM PRESETS
// ================================
const roomPresets = {
  Bedroom: { width: 200, height: 150, color: "#dbeafe", border: "#2563eb" },
  Kitchen: { width: 180, height: 140, color: "#dcfce7", border: "#16a34a" },
  "Living Room": { width: 260, height: 180, color: "#fef3c7", border: "#d97706" }
};

// ================================
// ADD ROOM
// ================================
function addRoomType(type) {
  const preset = roomPresets[type];

  const rect = new fabric.Rect({
    width: preset.width,
    height: preset.height,
    fill: preset.color,
    stroke: preset.border,
    strokeWidth: 2,
    rx: 6,
    ry: 6
  });

  const text = new fabric.Text(type, {
    fontSize: 16,
    originX: "center",
    originY: "center"
  });

  const group = new fabric.Group([rect, text], {
    left: 100,
    top: 100,
    cornerColor: preset.border,
    cornerSize: 10,
    transparentCorners: false,
    objectType: "room"
  });

  group.on("mousedblclick", () => {
    const newName = prompt("Rename room:", text.text);
    if (newName) {
      text.text = newName;
      group.addWithUpdate();
      canvas.requestRenderAll();
    }
  });

  canvas.add(group);
  canvas.setActiveObject(group);
}

// fallback Add Room button
function addRoom() {
  addRoomType("Bedroom");
}

// ================================
// INTERIOR MODE
// ================================
let interiorMode = false;

function enableInteriorMode() {
  interiorMode = true;

  canvas.getObjects().forEach(obj => {
    if (obj.objectType === "room") {
      obj.set({
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false
      });
    }
  });

  canvas.requestRenderAll();
}

// ================================
// FURNITURE
// ================================
const furniturePresets = {
  bed: { width: 80, height: 50, color: "#fecaca", label: "Bed" },
  sofa: { width: 90, height: 50, color: "#bfdbfe", label: "Sofa" },
  table: { width: 60, height: 40, color: "#fde68a", label: "Table" }
};

function addFurniture(type) {
  if (!interiorMode || !type) return;

  const preset = furniturePresets[type];

  const rect = new fabric.Rect({
    width: preset.width,
    height: preset.height,
    fill: preset.color,
    rx: 4,
    ry: 4
  });

  const text = new fabric.Text(preset.label, {
    fontSize: 12,
    originX: "center",
    originY: "center"
  });

  const group = new fabric.Group([rect, text], {
    left: 150,
    top: 150,
    cornerSize: 8,
    transparentCorners: false,
    objectType: "furniture"
  });

  canvas.add(group);
  canvas.setActiveObject(group);
}

// ================================
// SNAP LOGIC (ONE HANDLER)
// ================================
canvas.on("object:modified", e => {
  const obj = e.target;

  obj.set({
    left: Math.round(obj.left / snapSize) * snapSize,
    top: Math.round(obj.top / snapSize) * snapSize
  });

  if (obj.objectType === "room") {
    const rect = obj.item(0);
    const w = rect.width * obj.scaleX;
    const h = rect.height * obj.scaleY;

    if (w < MIN_ROOM_WIDTH) obj.scaleX = MIN_ROOM_WIDTH / rect.width;
    if (h < MIN_ROOM_HEIGHT) obj.scaleY = MIN_ROOM_HEIGHT / rect.height;
  }

  obj.setCoords();
  canvas.requestRenderAll();
});

// ================================
// DELETE KEY
// ================================
document.addEventListener("keydown", e => {
  if (e.key === "Delete" || e.key === "Backspace") {
    const obj = canvas.getActiveObject();
    if (obj) canvas.remove(obj);
  }
});

// ================================
// MODE SWITCH
// ================================
function handleModeChange(mode) {
  if (mode === "interior") {
    enableInteriorMode();
    document.getElementById("furnitureSelect").classList.remove("d-none");
  } else {
    document.getElementById("furnitureSelect").classList.add("d-none");
  }
}

// structure-3d.js connection 
function exportRoomsFor3D() {
  const rooms = [];

  canvas.getObjects().forEach(obj => {
    if (obj.objectType === "room") {
      const rect = obj.item(0);

      rooms.push({
        id: obj.__uid || (obj.__uid = Date.now() + Math.random()),
        width: rect.width * obj.scaleX,
        height: rect.height * obj.scaleY,
        left: obj.left,
        top: obj.top
      });
    }
  });

  if (window.syncRoomsFrom2D) {
    syncRoomsFrom2D(rooms);
  }
}

canvas.on("object:modified", () => {
  exportRoomsFor3D();
});

canvas.add(group);
canvas.setActiveObject(group);
exportRoomsFor3D();
