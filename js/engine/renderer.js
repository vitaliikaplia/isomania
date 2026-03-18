/* ── Scene, Camera, Renderer ── */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1520);

const frustum = 10;
let aspect = window.innerWidth / window.innerHeight;
const cam = new THREE.OrthographicCamera(
  -frustum * aspect, frustum * aspect, frustum, -frustum, 0.1, 1000
);
cam.position.set(20, 20, 20);
cam.lookAt(0, 0, 0);
cam.zoom = 1;
cam.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('wrap').appendChild(renderer.domElement);

/* ── Lighting ── */

const ambLight = new THREE.AmbientLight(0x8899aa, 0.6);
scene.add(ambLight);

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 60;
scene.add(dirLight);
