/* ── Camera ── */

const camOffset = new THREE.Vector3(20, 20, 20);

function updateCamera() {
  const target = playerGroup.position.clone();
  cam.position.copy(target).add(camOffset);
  cam.lookAt(target);
  cam.updateProjectionMatrix();
  dirLight.position.copy(target).add(new THREE.Vector3(10, 20, 10));
  dirLight.target.position.copy(target);
  dirLight.target.updateMatrixWorld();
}

/* ── Zoom ── */

const ZOOM_MIN = 0.4, ZOOM_MAX = 10;
renderer.domElement.addEventListener('wheel', e => {
  e.preventDefault();
  cam.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
  cam.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom));
  cam.updateProjectionMatrix();
}, { passive: false });
