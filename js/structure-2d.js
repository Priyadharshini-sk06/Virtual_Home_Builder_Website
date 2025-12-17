// Initialize Fabric Canvas
const canvas = new fabric.Canvas('floorCanvas', {
  selection: true,
  preserveObjectStacking: true
});


// canvas.on('object:moving', (e) => {
//   snapToGrid(e.target);
// });

canvas.on('object:scaling', (e) => {
  const obj = e.target;

  const newWidth = Math.round((obj.width * obj.scaleX) / snapSize) * snapSize;
  const newHeight = Math.round((obj.height * obj.scaleY) / snapSize) * snapSize;

  obj.set({
    scaleX: newWidth / obj.width,
    scaleY: newHeight / obj.height
  });
});


// Resize canvas to fit container
function resizeCanvas() {
  const wrapper = document.querySelector('.canvas-wrapper');
  canvas.setWidth(wrapper.clientWidth - 20);
  canvas.setHeight(wrapper.clientHeight - 20);
  canvas.renderAll();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Draw grid
const gridSize = 50;
for (let i = 0; i < canvas.width / gridSize; i++) {
  canvas.add(new fabric.Line([ i * gridSize, 0, i * gridSize, canvas.height], {
    stroke: '#e5e9f2',
    selectable: false,
    evented: false
  }));
}

const snapSize = 50;

// Snap object to grid
function snapToGrid(target) {
  target.set({
    left: Math.round(target.left / snapSize) * snapSize,
    top: Math.round(target.top / snapSize) * snapSize
  });
}


for (let i = 0; i < canvas.height / gridSize; i++) {
  canvas.add(new fabric.Line([ 0, i * gridSize, canvas.width, i * gridSize], {
    stroke: '#e5e9f2',
    selectable: false,
    evented: false
  }));
}

// Add room function
// function addRoom() {
//   const room = new fabric.Rect({
//     left: 100,
//     top: 100,
//     width: 200,
//     height: 150,
//     fill: '#dbeafe',
//     stroke: '#2563eb',
//     strokeWidth: 2,
//     cornerColor: '#2563eb',
//     cornerSize: 10,
//     transparentCorners: false
//   });

//   canvas.add(room);
//   canvas.setActiveObject(room);
// }

function addRoom() {
  const rect = new fabric.Rect({
    width: 200,
    height: 150,
    fill: '#dbeafe',
    stroke: '#2563eb',
    strokeWidth: 2,
    rx: 6,
    ry: 6
  });

  const text = new fabric.Text('Room', {
    fontSize: 16,
    fill: '#1e3a8a',
    originX: 'center',
    originY: 'center'
  });

  const group = new fabric.Group([rect, text], {
    left: 100,
    top: 100,
    cornerColor: '#2563eb',
    cornerSize: 10,
    transparentCorners: false
  });

  // Enable text editing on double click
//   group.on('mousedblclick', () => {
//     const newName = prompt('Enter room name:', text.text);
//     if (newName) {
//       text.text = newName;
//       canvas.renderAll();
//     }
//   });

group.on('mousedblclick', () => {
  const newName = prompt('Enter room name:', text.text);

  if (newName && newName.trim() !== '') {
    text.text = newName;

    // 🔑 IMPORTANT FIX
    group._objects[1].set({ text: newName });
    group.addWithUpdate();

    canvas.requestRenderAll();
  }
});


  canvas.add(group);
  canvas.setActiveObject(group);
}


// canvas.on('object:modified', () => {
//   canvas.requestRenderAll();
// });

canvas.on('object:modified', (e) => {
  const obj = e.target;

  obj.set({
    left: Math.round(obj.left / snapSize) * snapSize,
    top: Math.round(obj.top / snapSize) * snapSize
  });

  canvas.requestRenderAll();
});

canvas.on('object:modified', () => {
  saveLayout();
});


// Keyboard delete support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const obj = canvas.getActiveObject();
    if (obj) canvas.remove(obj);
  }
});

// TEMP: add first room automatically
// addRoom();


function saveLayout() {
  const rooms = [];

  canvas.getObjects().forEach(obj => {
    if (obj.type === 'group') {
      const rect = obj.item(0);
      const text = obj.item(1);

      rooms.push({
        name: text.text,
        left: obj.left,
        top: obj.top,
        width: rect.width * obj.scaleX,
        height: rect.height * obj.scaleY
      });
    }
  });

  localStorage.setItem('houseStructure', JSON.stringify(rooms));
}


function loadLayout() {
  const saved = localStorage.getItem('houseStructure');
  if (!saved) return;

  const rooms = JSON.parse(saved);

  rooms.forEach(room => {
    const rect = new fabric.Rect({
      width: room.width,
      height: room.height,
      fill: '#dbeafe',
      stroke: '#2563eb',
      strokeWidth: 2,
      rx: 6,
      ry: 6
    });

    const text = new fabric.Text(room.name, {
      fontSize: 16,
      fill: '#1e3a8a',
      originX: 'center',
      originY: 'center'
    });

    const group = new fabric.Group([rect, text], {
      left: room.left,
      top: room.top,
      cornerColor: '#2563eb',
      cornerSize: 10,
      transparentCorners: false
    });

    canvas.add(group);
  });

  canvas.renderAll();
}


loadLayout();
