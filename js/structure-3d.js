// ================================
// THREE.JS BASIC SETUP
// ================================
const canvas3d = document.getElementById("threeCanvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8fafc);

const camera = new THREE.PerspectiveCamera(
  45,
  canvas3d.clientWidth / canvas3d.clientHeight,
  0.1,
  2000
);

camera.position.set(0, 500, 500);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(300, 400, 200);
scene.add(dirLight);

// Grid floor
const grid = new THREE.GridHelper(1000, 20);
scene.add(grid);

// Store 3D rooms
const roomMeshes = new Map();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

function syncRoomsFrom2D(rooms) {

  rooms.forEach(room => {
    let mesh = roomMeshes.get(room.id);

    if (!mesh) {
      // Create new room
      const geometry = new THREE.BoxGeometry(
        room.width,
        100,
        room.height
      );

      const material = new THREE.MeshStandardMaterial({
        color: 0x93c5fd
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      roomMeshes.set(room.id, mesh);
    }

    // mesh.position.set(
    //   room.left - 400,
    //   50,
    //   room.top - 300
    // );
    
    // Update position
    mesh.position.set(
      room.left - canvas.width / 2,
      50,
      room.top - canvas.height / 2
    );
  });
  console.log("Syncing rooms:", rooms);
}
