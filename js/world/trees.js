/* ── Trees & Bushes ── */
/* Scale: 1 unit ≈ 2.5m, trees ~6-12m with mixed silhouettes */

const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, 2.5, 6);
const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1E, transparent: true });
const TREE_VARIANTS = [
  {
    trunkScale: [1, 1, 1],
    crownScale: 1,
    layers: [
      { y: 2.0, r: 1.1, color: 0x1A5C0A },
      { y: 2.5, r: 0.95, color: 0x236614 },
      { y: 3.0, r: 0.8, color: 0x2C7420 },
      { y: 3.5, r: 0.6, color: 0x358228 },
      { y: 3.9, r: 0.35, color: 0x3E9030 },
    ],
  },
  {
    trunkScale: [0.92, 0.82, 0.92],
    crownScale: 0.72,
    layers: [
      { y: 1.55, r: 0.82, color: 0x214f11 },
      { y: 1.95, r: 0.7, color: 0x2a611a },
      { y: 2.28, r: 0.56, color: 0x337223 },
      { y: 2.58, r: 0.4, color: 0x3d812d },
    ],
  },
  {
    trunkScale: [1.06, 1.08, 1.06],
    crownScale: 0.88,
    layers: [
      { y: 1.9, r: 1.0, color: 0x2e5f19 },
      { y: 2.35, r: 0.86, color: 0x376f24 },
      { y: 2.82, r: 0.7, color: 0x447f31 },
      { y: 3.22, r: 0.5, color: 0x538f3e },
    ],
  },
];
const TREE_FOLIAGE_CACHE = TREE_VARIANTS.map(variant => variant.layers.map(layer => ({
  y: layer.y,
  geometry: new THREE.SphereGeometry(layer.r, 8, 6),
  material: new THREE.MeshLambertMaterial({ color: layer.color, transparent: true }),
})));
const BUSH_COLORS = CONFIG.world.bushColors;
const bushSphereGeo = new THREE.SphereGeometry(0.34, 7, 6);
const bushSphereGeoSmall = new THREE.SphereGeometry(0.26, 7, 6);
const bushMats = BUSH_COLORS.map(color => new THREE.MeshLambertMaterial({ color, transparent: true }));

function createTree(tx, tz, variantIndex) {
  const variant = TREE_VARIANTS[variantIndex % TREE_VARIANTS.length];
  const foliageLayers = TREE_FOLIAGE_CACHE[variantIndex % TREE_FOLIAGE_CACHE.length];
  const treeGroup = new THREE.Group();

  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(tx, 1.25 * variant.trunkScale[1], tz);
  trunk.scale.set(...variant.trunkScale);
  trunk.castShadow = true;
  treeGroup.add(trunk);

  for (const layer of foliageLayers) {
    const foliage = new THREE.Mesh(layer.geometry, layer.material);
    foliage.position.set(tx, layer.y, tz);
    foliage.scale.setScalar(variant.crownScale);
    foliage.castShadow = true;
    treeGroup.add(foliage);
  }

  return treeGroup;
}

function createBush(tx, tz, variantIndex) {
  const bushGroup = new THREE.Group();
  const mat = bushMats[variantIndex % bushMats.length];

  const main = new THREE.Mesh(bushSphereGeo, mat);
  main.position.set(tx, 0.24, tz);
  main.scale.set(1.15, 0.88, 1.08);
  main.castShadow = true;
  bushGroup.add(main);

  const left = new THREE.Mesh(bushSphereGeoSmall, mat);
  left.position.set(tx - 0.18, 0.18, tz + 0.07);
  left.scale.set(1, 0.78, 0.92);
  bushGroup.add(left);

  const right = new THREE.Mesh(bushSphereGeoSmall, mat);
  right.position.set(tx + 0.2, 0.16, tz - 0.06);
  right.scale.set(0.94, 0.72, 0.9);
  bushGroup.add(right);

  return bushGroup;
}

for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  const tile = MAP[r][c];
  if (tile !== WORLD.tiles.tree && tile !== WORLD.tiles.structure) continue;

  const tx = worldXFromCol(c);
  const tz = worldZFromRow(r);
  const variantIndex = (c * 5 + r * 11) % TREE_VARIANTS.length;
  const group = tile === WORLD.tiles.tree
    ? createTree(tx, tz, variantIndex)
    : createBush(tx, tz, (c * 7 + r * 3) % BUSH_COLORS.length);

  scene.add(group);
  registerOccludable(group);
}
