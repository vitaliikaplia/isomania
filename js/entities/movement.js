/* ── Player Movement & Animation ── */

const pl = { x: 25.5, y: 15.5, angle: 0, walkTime: 0, walking: false };

function updatePlayerPos() {
  playerGroup.position.set(pl.x - MW / 2 + 0.5, 0, pl.y - MH / 2 + 0.5);
  playerGroup.rotation.y = pl.angle;
}
updatePlayerPos();

function update(dt) {
  let dx = 0, dz = 0;
  if (keys['ArrowLeft']  || keys['a'] || keys['A']) { dx--; dz++; }
  if (keys['ArrowRight'] || keys['d'] || keys['D']) { dx++; dz--; }
  if (keys['ArrowUp']    || keys['w'] || keys['W']) { dx--; dz--; }
  if (keys['ArrowDown']  || keys['s'] || keys['S']) { dx++; dz++; }

  if (!dx && !dz) {
    pl.walking = false;
    armL.rotation.x += (0 - armL.rotation.x) * 8 * dt;
    armR.rotation.x += (0 - armR.rotation.x) * 8 * dt;
    legL.rotation.x += (0 - legL.rotation.x) * 8 * dt;
    legR.rotation.x += (0 - legR.rotation.x) * 8 * dt;
    return;
  }

  pl.walking = true;
  const len = Math.sqrt(dx * dx + dz * dz);
  dx = dx / len * 3.5 * dt;
  dz = dz / len * 3.5 * dt;

  const nx = pl.x + dx, ny = pl.y + dz;
  if (!isSolid(nx, pl.y)) pl.x = Math.max(0.5, Math.min(MW - 1.5, nx));
  if (!isSolid(pl.x, ny)) pl.y = Math.max(0.5, Math.min(MH - 1.5, ny));

  // Rotate toward movement direction
  const targetAngle = Math.atan2(dx, dz);
  let diff = targetAngle - pl.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  pl.angle += diff * Math.min(1, 10 * dt);

  // Walk animation
  pl.walkTime += dt * 8;
  const swing = Math.sin(pl.walkTime) * 0.4;
  armL.rotation.x = swing;
  armR.rotation.x = -swing;
  legL.rotation.x = -swing;
  legR.rotation.x = swing;

  updatePlayerPos();
}
