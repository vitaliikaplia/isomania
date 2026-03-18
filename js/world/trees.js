/* ── Trees ── */
/* Scale: 1 unit ≈ 2.5m, trees ~8-12m = ~3.5-5 units */

const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, 2.5, 6);
const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1E, transparent: true });
const foliageLayers = [
  { y: 2.0,  r: 1.1, color: 0x1A5C0A },
  { y: 2.5,  r: 0.95, color: 0x236614 },
  { y: 3.0,  r: 0.8, color: 0x2C7420 },
  { y: 3.5,  r: 0.6, color: 0x358228 },
  { y: 3.9,  r: 0.35, color: 0x3E9030 },
];

for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  if (MAP[r][c] !== 2) continue;
  const tx = c - MW / 2 + 0.5, tz = r - MH / 2 + 0.5;

  const treeGroup = new THREE.Group();
  treeGroup.userData.occludable = true;

  const trunk = new THREE.Mesh(trunkGeo, trunkMat.clone());
  trunk.position.set(tx, 1.25, tz);
  trunk.castShadow = true;
  treeGroup.add(trunk);

  for (const layer of foliageLayers) {
    const fGeo = new THREE.SphereGeometry(layer.r, 8, 6);
    const fMat = new THREE.MeshLambertMaterial({ color: layer.color, transparent: true });
    const foliage = new THREE.Mesh(fGeo, fMat);
    foliage.position.set(tx, layer.y, tz);
    foliage.castShadow = true;
    treeGroup.add(foliage);
  }

  scene.add(treeGroup);
  occludables.push(treeGroup);
}
