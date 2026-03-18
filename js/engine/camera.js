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

  updateOcclusion();
}

/* ── Zoom ── */

const ZOOM_MIN = 0.4, ZOOM_MAX = 10;
renderer.domElement.addEventListener('wheel', e => {
  e.preventDefault();
  cam.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
  cam.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom));
  cam.updateProjectionMatrix();
}, { passive: false });

/* ── Occlusion (PZ-style see-through) ── */

const occRaycaster = new THREE.Raycaster();
const occFadeSpeed = 6;
const occTargetAlpha = 0.05;
let occFaded = new Set();

function setGroupOpacity(group, alpha) {
  group.traverse(child => {
    if (child.isMesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        mat.opacity = alpha;
        mat.depthWrite = alpha > 0.9;
      }
    }
  });
}

function updateOcclusion() {
  const playerPos = playerGroup.position.clone();
  playerPos.y += 0.4; // Aim at chest height

  // Collect all meshes from occludable groups for raycasting
  const allMeshes = [];
  for (const group of occludables) {
    group.traverse(child => {
      if (child.isMesh) allMeshes.push(child);
    });
  }

  // Cast ray from camera to player
  const dir = playerPos.clone().sub(cam.position).normalize();
  const dist = cam.position.distanceTo(playerPos);
  occRaycaster.set(cam.position, dir);
  occRaycaster.far = dist;

  const hits = occRaycaster.intersectObjects(allMeshes, false);

  // Find which occludable groups are hit
  const nowBlocking = new Set();
  for (const hit of hits) {
    // Walk up to find parent occludable group
    let obj = hit.object;
    while (obj && !obj.userData.occludable) obj = obj.parent;
    if (obj && obj.userData.occludable) nowBlocking.add(obj);
  }

  // Fade in groups that are no longer blocking
  for (const group of occFaded) {
    if (!nowBlocking.has(group)) {
      group.userData.occAlpha = Math.min(1, (group.userData.occAlpha || 0.2) + occFadeSpeed * 0.016);
      setGroupOpacity(group, group.userData.occAlpha);
      if (group.userData.occAlpha >= 1) {
        setGroupOpacity(group, 1);
        occFaded.delete(group);
        delete group.userData.occAlpha;
      }
    }
  }

  // Fade out groups that are blocking
  for (const group of nowBlocking) {
    occFaded.add(group);
    group.userData.occAlpha = Math.max(occTargetAlpha, (group.userData.occAlpha || 1) - occFadeSpeed * 0.016);
    setGroupOpacity(group, group.userData.occAlpha);
  }
}
