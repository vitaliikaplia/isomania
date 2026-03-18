/* ── Scene, Camera, Renderer ── */

const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.renderer.backgroundColor);

const frustum = CONFIG.camera.frustum;
let aspect = window.innerWidth / window.innerHeight;
const cam = new THREE.OrthographicCamera(
  -frustum * aspect,
  frustum * aspect,
  frustum,
  -frustum,
  CONFIG.camera.near,
  CONFIG.camera.far
);
cam.position.set(...CONFIG.camera.startPosition);
cam.lookAt(0, 0, 0);
cam.zoom = CONFIG.camera.zoom.initial;
cam.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({ antialias: CONFIG.renderer.antialias });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.renderer.pixelRatioMax));
renderer.shadowMap.enabled = CONFIG.renderer.shadows.enabled;
renderer.shadowMap.type = CONFIG.renderer.shadows.type;
document.getElementById('wrap').appendChild(renderer.domElement);

const GAME = {
  scene,
  camera: cam,
  renderer,
  occludables: [],
  occlusionMeshes: [],
};

function registerOccludable(group) {
  group.userData.occludable = true;
  group.userData.occlusionMeshes = [];

  group.traverse(child => {
    if (!child.isMesh) return;
    child.userData.occludableGroup = group;
    group.userData.occlusionMeshes.push(child);
    GAME.occlusionMeshes.push(child);
  });

  GAME.occludables.push(group);
}

/* ── Lighting ── */

const ambLight = new THREE.AmbientLight(
  CONFIG.renderer.ambient.color,
  CONFIG.renderer.ambient.intensity
);
scene.add(ambLight);

const dirLight = new THREE.DirectionalLight(
  CONFIG.renderer.directional.color,
  CONFIG.renderer.directional.intensity
);
dirLight.position.set(...CONFIG.renderer.directional.startPosition);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(CONFIG.renderer.shadows.mapSize, CONFIG.renderer.shadows.mapSize);
dirLight.shadow.camera.left = -CONFIG.renderer.shadows.cameraBounds;
dirLight.shadow.camera.right = CONFIG.renderer.shadows.cameraBounds;
dirLight.shadow.camera.top = CONFIG.renderer.shadows.cameraBounds;
dirLight.shadow.camera.bottom = -CONFIG.renderer.shadows.cameraBounds;
dirLight.shadow.camera.near = CONFIG.renderer.shadows.near;
dirLight.shadow.camera.far = CONFIG.renderer.shadows.far;
scene.add(dirLight);
