/* ── Player Movement & Animation ── */

const WALK_SPEED = 2.8;
const RUN_SPEED = 5.5;
const ACCEL = 8;
const DECEL = 6;

const pl = {
  x: 25.5, y: 15.5, angle: 0,
  walkTime: 0, speed: 0, targetSpeed: 0,
  moving: false, running: false
};

// Animation params: walk vs run
const ANIM = {
  walk: { legAmp: 0.5, armAmp: 0.35, bob: 0.03, freq: 7, leanFwd: 0 },
  run:  { legAmp: 0.75, armAmp: 0.55, bob: 0.06, freq: 11, leanFwd: 0.08 }
};

function updatePlayerPos() {
  playerGroup.position.set(pl.x - MW / 2 + 0.5, 0, pl.y - MH / 2 + 0.5);
  playerGroup.rotation.y = pl.angle;
}
updatePlayerPos();

function lerpTo(current, target, rate, dt) {
  return current + (target - current) * Math.min(1, rate * dt);
}

function update(dt) {
  let dx = 0, dz = 0;
  if (keys['ArrowLeft']  || keys['KeyA']) { dx--; dz++; }
  if (keys['ArrowRight'] || keys['KeyD']) { dx++; dz--; }
  if (keys['ArrowUp']    || keys['KeyW']) { dx--; dz--; }
  if (keys['ArrowDown']  || keys['KeyS']) { dx++; dz++; }

  pl.running = !!(keys['ShiftLeft'] || keys['ShiftRight']);
  pl.moving = dx !== 0 || dz !== 0;

  // ── Speed with acceleration/deceleration ──
  if (pl.moving) {
    pl.targetSpeed = pl.running ? RUN_SPEED : WALK_SPEED;
    pl.speed = lerpTo(pl.speed, pl.targetSpeed, ACCEL, dt);
  } else {
    pl.speed = lerpTo(pl.speed, 0, DECEL, dt);
    if (pl.speed < 0.05) pl.speed = 0;
  }

  // ── Movement ──
  if (pl.moving) {
    const len = Math.sqrt(dx * dx + dz * dz);
    dx = dx / len * pl.speed * dt;
    dz = dz / len * pl.speed * dt;

    const nx = pl.x + dx, ny = pl.y + dz;
    if (!isSolid(nx, pl.y)) pl.x = Math.max(0.5, Math.min(MW - 1.5, nx));
    if (!isSolid(pl.x, ny)) pl.y = Math.max(0.5, Math.min(MH - 1.5, ny));

    // Rotate toward movement direction
    const targetAngle = Math.atan2(dx, dz);
    let diff = targetAngle - pl.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    pl.angle += diff * Math.min(1, 10 * dt);
  }

  // ── Animation ──
  const speedRatio = pl.speed / RUN_SPEED; // 0..1
  const isRunAnim = pl.speed > WALK_SPEED * 1.2;
  const a = isRunAnim ? ANIM.run : ANIM.walk;

  // Blend animation intensity by speed
  const intensity = Math.min(1, pl.speed / WALK_SPEED);

  if (pl.speed > 0.05) {
    pl.walkTime += dt * a.freq * (pl.speed / (isRunAnim ? RUN_SPEED : WALK_SPEED));
  }

  const phase = pl.walkTime;
  const sinP = Math.sin(phase);
  const cosP = Math.cos(phase);

  // Legs — pivot rotation from hip (X axis = forward/back swing)
  const legSwing = sinP * a.legAmp * intensity;
  legPivotL.rotation.x = legSwing;
  legPivotR.rotation.x = -legSwing;

  // Arms — opposite to legs, pivot from shoulder
  const armSwing = sinP * a.armAmp * intensity;
  armPivotL.rotation.x = -armSwing;
  armPivotR.rotation.x = armSwing;

  // No vertical bob — keep body steady
  upperBody.position.y = 0.46;
  headGroup.position.y = 0.62;

  // Forward lean when running
  const leanTarget = isRunAnim ? a.leanFwd * intensity : 0;
  upperBody.rotation.x = lerpTo(upperBody.rotation.x, leanTarget, 6, dt);

  // ── Idle: smoothly return to neutral ──
  if (pl.speed < 0.05) {
    legPivotL.rotation.x = lerpTo(legPivotL.rotation.x, 0, 8, dt);
    legPivotR.rotation.x = lerpTo(legPivotR.rotation.x, 0, 8, dt);
    armPivotL.rotation.x = lerpTo(armPivotL.rotation.x, 0, 8, dt);
    armPivotR.rotation.x = lerpTo(armPivotR.rotation.x, 0, 8, dt);
    upperBody.rotation.x = lerpTo(upperBody.rotation.x, 0, 6, dt);
  }

  updatePlayerPos();
}
