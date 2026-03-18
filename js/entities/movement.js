/* ── Player Movement & Animation ── */

const MOVE_CFG = CONFIG.player.movement;
const ANIM_CFG = CONFIG.player.animation;
const WALK_SPEED = MOVE_CFG.walkSpeed;
const RUN_SPEED = MOVE_CFG.runSpeed;
const ACCEL = MOVE_CFG.accel;
const DECEL = MOVE_CFG.decel;

const pl = {
  x: CONFIG.player.spawn.x, y: CONFIG.player.spawn.y, angle: 0,
  walkTime: 0, speed: 0, targetSpeed: 0,
  moving: false, running: false
};

const ANIM = {
  walk: ANIM_CFG.walk,
  run: ANIM_CFG.run
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
    if (pl.speed < MOVE_CFG.minSpeed) pl.speed = 0;
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
    pl.angle += diff * Math.min(1, MOVE_CFG.turnSpeed * dt);
  }

  const isRunAnim = pl.speed > WALK_SPEED * ANIM_CFG.runThreshold;
  const a = isRunAnim ? ANIM.run : ANIM.walk;

  const intensity = Math.min(1, pl.speed / WALK_SPEED);

  if (pl.speed > MOVE_CFG.minSpeed) {
    pl.walkTime += dt * a.freq * (pl.speed / (isRunAnim ? RUN_SPEED : WALK_SPEED));
  }

  const phase = pl.walkTime;
  const sinP = Math.sin(phase);

  const legSwing = sinP * a.legAmp * intensity;
  legPivotL.rotation.x = legSwing;
  legPivotR.rotation.x = -legSwing;

  const armSwing = sinP * a.armAmp * intensity;
  armPivotL.rotation.x = -armSwing;
  armPivotR.rotation.x = armSwing;

  upperBody.position.y = ANIM_CFG.upperBodyY;
  headGroup.position.y = ANIM_CFG.headY;

  const leanTarget = isRunAnim ? a.leanFwd * intensity : 0;
  upperBody.rotation.x = lerpTo(upperBody.rotation.x, leanTarget, ANIM_CFG.bodyReturnRate, dt);

  if (pl.speed < MOVE_CFG.minSpeed) {
    legPivotL.rotation.x = lerpTo(legPivotL.rotation.x, 0, ANIM_CFG.idleReturnRate, dt);
    legPivotR.rotation.x = lerpTo(legPivotR.rotation.x, 0, ANIM_CFG.idleReturnRate, dt);
    armPivotL.rotation.x = lerpTo(armPivotL.rotation.x, 0, ANIM_CFG.idleReturnRate, dt);
    armPivotR.rotation.x = lerpTo(armPivotR.rotation.x, 0, ANIM_CFG.idleReturnRate, dt);
    upperBody.rotation.x = lerpTo(upperBody.rotation.x, 0, ANIM_CFG.bodyReturnRate, dt);
  }

  updatePlayerPos();
}
