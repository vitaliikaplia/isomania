/* ── Buildings ── */
/* Scale: 1 unit ≈ 2.5m, houses ~6-10m = 2.5-4 units */

for (let i = 0; i < gInfo.length; i++) {
  const g = gInfo[i];
  const pal = g.pal;
  const h = g.h;
  const bw = g.w;
  const bd = g.d;
  const cx = (g.minC + g.maxC) / 2 - MW / 2 + 0.5;
  const cz = (g.minR + g.maxR) / 2 - MH / 2 + 0.5;

  const topMat = new THREE.MeshLambertMaterial({ color: pal.t });
  const leftMat = new THREE.MeshLambertMaterial({ color: pal.l });
  const rightMat = new THREE.MeshLambertMaterial({ color: pal.r });
  const mats = [rightMat, leftMat, topMat, topMat, rightMat, leftMat];

  // Main building body
  const geo = new THREE.BoxGeometry(bw - 0.05, h, bd - 0.05);
  const bld = new THREE.Mesh(geo, mats);
  bld.position.set(cx, h / 2, cz);
  bld.castShadow = true;
  bld.receiveShadow = true;
  scene.add(bld);

  // Roof overhang
  const roofGeo = new THREE.BoxGeometry(bw + 0.15, 0.1, bd + 0.15);
  const roofMat = new THREE.MeshLambertMaterial({ color: pal.t });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(cx, h + 0.05, cz);
  roof.castShadow = true;
  scene.add(roof);

  // Windows — proportional to wall
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffdc64, transparent: true, opacity: 0.5 });
  const winH = 0.4;
  const winW = 0.35;
  const winY = h * 0.5;

  // Side walls (along Z)
  const winCountZ = Math.max(1, Math.floor(bd / 1.2));
  const winSpacingZ = bd / (winCountZ + 1);
  for (let wi = 1; wi <= winCountZ; wi++) {
    const wz = g.minR - MH / 2 + 0.5 + wi * winSpacingZ - 0.5;
    for (const side of [-1, 1]) {
      const wGeo = new THREE.PlaneGeometry(winW, winH);
      const win = new THREE.Mesh(wGeo, winMat);
      win.position.set(cx + side * (bw / 2 + 0.001), winY, wz);
      win.rotation.y = Math.PI / 2;
      scene.add(win);
    }
  }

  // Front/back walls (along X)
  const winCountX = Math.max(1, Math.floor(bw / 1.2));
  const winSpacingX = bw / (winCountX + 1);
  for (let wi = 1; wi <= winCountX; wi++) {
    const wx = g.minC - MW / 2 + 0.5 + wi * winSpacingX - 0.5;
    for (const side of [-1, 1]) {
      const wGeo = new THREE.PlaneGeometry(winW, winH);
      const win = new THREE.Mesh(wGeo, winMat);
      win.position.set(wx, winY, cz + side * (bd / 2 + 0.001));
      scene.add(win);
    }
  }

  // Door (~2m = 0.8 units)
  const doorGeo = new THREE.PlaneGeometry(0.4, 0.8);
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x3A2815 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(cx, 0.4, cz + bd / 2 + 0.001);
  scene.add(door);
}

// Small structures (type 3) — crates, sheds, barrels
const smallPals = [0x8B7355, 0x6B6B6B, 0x7A6040, 0x556B55];
for (let r = 0; r < MH; r++) for (let c = 0; c < MW; c++) {
  if (MAP[r][c] !== 3) continue;
  const sx = c - MW / 2 + 0.5;
  const sz = r - MH / 2 + 0.5;
  const sh = 0.35 + ((c * 7 + r * 3) % 5) * 0.06;
  const col = smallPals[(c * 7 + r * 3) % smallPals.length];

  const sGeo = new THREE.BoxGeometry(0.45, sh, 0.45);
  const sMat = new THREE.MeshLambertMaterial({ color: col });
  const sMesh = new THREE.Mesh(sGeo, sMat);
  sMesh.position.set(sx, sh / 2, sz);
  sMesh.castShadow = true;
  sMesh.receiveShadow = true;
  scene.add(sMesh);
}
