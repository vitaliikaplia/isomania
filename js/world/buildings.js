/* ── Buildings ── */
/* Scale: 1 unit ≈ 2.5m, houses ~6-10m = 2.5-4 units */

const occludables = [];

for (let i = 0; i < gInfo.length; i++) {
  const g = gInfo[i];
  const pal = g.pal;
  const h = g.h;
  const bw = g.w;
  const bd = g.d;
  const cx = (g.minC + g.maxC) / 2 - MW / 2 + 0.5;
  const cz = (g.minR + g.maxR) / 2 - MH / 2 + 0.5;

  // Group all parts of this building
  const bldGroup = new THREE.Group();
  bldGroup.userData.occludable = true;

  const topMat = new THREE.MeshLambertMaterial({ color: pal.t, transparent: true });
  const leftMat = new THREE.MeshLambertMaterial({ color: pal.l, transparent: true });
  const rightMat = new THREE.MeshLambertMaterial({ color: pal.r, transparent: true });
  const mats = [rightMat, leftMat, topMat, topMat, rightMat, leftMat];

  // Main body
  const geo = new THREE.BoxGeometry(bw - 0.05, h, bd - 0.05);
  const bld = new THREE.Mesh(geo, mats);
  bld.position.set(cx, h / 2, cz);
  bld.castShadow = true;
  bld.receiveShadow = true;
  bldGroup.add(bld);

  // Roof
  const roofMat = new THREE.MeshLambertMaterial({ color: pal.t, transparent: true });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.15, 0.1, bd + 0.15), roofMat);
  roof.position.set(cx, h + 0.05, cz);
  roof.castShadow = true;
  bldGroup.add(roof);

  // Windows
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffdc64, transparent: true, opacity: 0.5 });
  const winH = 0.4, winW = 0.35, winY = h * 0.5;

  const winCountZ = Math.max(1, Math.floor(bd / 1.2));
  const winSpacingZ = bd / (winCountZ + 1);
  for (let wi = 1; wi <= winCountZ; wi++) {
    const wz = g.minR - MH / 2 + 0.5 + wi * winSpacingZ - 0.5;
    for (const side of [-1, 1]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), winMat);
      win.position.set(cx + side * (bw / 2 + 0.001), winY, wz);
      win.rotation.y = Math.PI / 2;
      bldGroup.add(win);
    }
  }

  const winCountX = Math.max(1, Math.floor(bw / 1.2));
  const winSpacingX = bw / (winCountX + 1);
  for (let wi = 1; wi <= winCountX; wi++) {
    const wx = g.minC - MW / 2 + 0.5 + wi * winSpacingX - 0.5;
    for (const side of [-1, 1]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), winMat);
      win.position.set(wx, winY, cz + side * (bd / 2 + 0.001));
      bldGroup.add(win);
    }
  }

  // Door
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x3A2815, transparent: true });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.8), doorMat);
  door.position.set(cx, 0.4, cz + bd / 2 + 0.001);
  bldGroup.add(door);

  scene.add(bldGroup);
  occludables.push(bldGroup);
}

// Small structures (type 3)
const smallPals = [0x8B7355, 0x6B6B6B, 0x7A6040, 0x556B55];
for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  if (MAP[r][c] !== 3) continue;
  const sx = c - MW / 2 + 0.5;
  const sz = r - MH / 2 + 0.5;
  const sh = 0.35 + ((c * 7 + r * 3) % 5) * 0.06;
  const col = smallPals[(c * 7 + r * 3) % smallPals.length];

  const sGroup = new THREE.Group();
  sGroup.userData.occludable = true;
  const sMat = new THREE.MeshLambertMaterial({ color: col, transparent: true });
  const sMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, sh, 0.45), sMat);
  sMesh.position.set(sx, sh / 2, sz);
  sMesh.castShadow = true;
  sMesh.receiveShadow = true;
  sGroup.add(sMesh);
  scene.add(sGroup);
  occludables.push(sGroup);
}
