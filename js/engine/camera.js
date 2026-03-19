/* ── Camera ── */

const camOffset = new THREE.Vector3(...CONFIG.camera.offset);
const lightOffset = new THREE.Vector3(...CONFIG.camera.lightOffset);
const camTarget = new THREE.Vector3();
const occPlayerPos = new THREE.Vector3();
const occDir = new THREE.Vector3();
const occNowBlocking = new Set();
const CAMERA_ZOOM_STORAGE_KEY = CONFIG.ui.cameraZoomStorageKey;

function clampCameraZoom(value) {
  const normalized = Number.parseFloat(value);
  if (!Number.isFinite(normalized)) return CONFIG.camera.zoom.initial;
  return Math.max(CONFIG.camera.zoom.min, Math.min(CONFIG.camera.zoom.max, normalized));
}

function loadStoredCameraZoom() {
  try {
    const raw = localStorage.getItem(CAMERA_ZOOM_STORAGE_KEY);
    if (!raw) return CONFIG.camera.zoom.initial;
    return clampCameraZoom(raw);
  } catch (error) {
    return CONFIG.camera.zoom.initial;
  }
}

function saveCameraZoom() {
  try {
    localStorage.setItem(CAMERA_ZOOM_STORAGE_KEY, String(Number(cam.zoom.toFixed(4))));
  } catch (error) {
    // Ignore storage failures so zoom persistence never blocks gameplay.
  }
}

function updateCamera() {
  camTarget.copy(playerGroup.position);
  cam.position.copy(camTarget).add(camOffset);
  cam.lookAt(camTarget);
  cam.updateProjectionMatrix();
  dirLight.position.copy(camTarget).add(lightOffset);
  dirLight.target.position.copy(camTarget);
  dirLight.target.updateMatrixWorld();

  updateOcclusion();
}

/* ── Zoom ── */

const ZOOM_MIN = CONFIG.camera.zoom.min;
const ZOOM_MAX = CONFIG.camera.zoom.max;
cam.zoom = loadStoredCameraZoom();
cam.updateProjectionMatrix();
renderer.domElement.addEventListener('wheel', e => {
  e.preventDefault();
  cam.zoom *= e.deltaY > 0 ? CONFIG.camera.zoom.wheelStepOut : CONFIG.camera.zoom.wheelStepIn;
  cam.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom));
  cam.updateProjectionMatrix();
  saveCameraZoom();
}, { passive: false });

window.addEventListener('pagehide', saveCameraZoom);
window.addEventListener('beforeunload', saveCameraZoom);

/* ── Occlusion (PZ-style see-through) ── */

const occRaycaster = new THREE.Raycaster();
const occFadeSpeed = CONFIG.occlusion.fadeSpeed;
const occTargetAlpha = CONFIG.occlusion.targetAlpha;
let occFaded = new Set();

function setGroupOpacity(group, alpha) {
  for (const child of group.userData.occlusionMeshes || []) {
    if (!child.material) continue;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      mat.opacity = alpha;
      mat.depthWrite = alpha > 0.9;
    }
  }
}

function updateOcclusion() {
  occPlayerPos.copy(playerGroup.position);
  occPlayerPos.y += CONFIG.occlusion.playerHeightOffset;

  occDir.copy(occPlayerPos).sub(cam.position).normalize();
  const dist = cam.position.distanceTo(occPlayerPos);
  occRaycaster.set(cam.position, occDir);
  occRaycaster.far = dist;

  const hits = occRaycaster.intersectObjects(GAME.occlusionMeshes, false);

  occNowBlocking.clear();
  for (const hit of hits) {
    const group = hit.object.userData.occludableGroup;
    if (group) occNowBlocking.add(group);
  }

  for (const group of occFaded) {
    if (!occNowBlocking.has(group)) {
      group.userData.occAlpha = Math.min(1, (group.userData.occAlpha || 0.2) + occFadeSpeed * 0.016);
      setGroupOpacity(group, group.userData.occAlpha);
      if (group.userData.occAlpha >= 1) {
        setGroupOpacity(group, 1);
        occFaded.delete(group);
        delete group.userData.occAlpha;
      }
    }
  }

  for (const group of occNowBlocking) {
    occFaded.add(group);
    group.userData.occAlpha = Math.max(occTargetAlpha, (group.userData.occAlpha || 1) - occFadeSpeed * 0.016);
    setGroupOpacity(group, group.userData.occAlpha);
  }
}
