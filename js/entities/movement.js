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
  moving: false, running: false,
  crouching: false,
  crouchBlend: 0,
  groundY: 0,
};

const ANIM = {
  walk: ANIM_CFG.walk,
  run: ANIM_CFG.run
};
const EMOTE_CFG = CONFIG.player.emotes;
const EMOTE_HALF_TURN = Math.PI;
const RIG_DEFAULTS = {
  armPivotL: armPivotL.position.clone(),
  armPivotR: armPivotR.position.clone(),
  upperBodyY: ANIM_CFG.upperBodyY,
  headY: ANIM_CFG.headY,
};
let crouchTogglePressed = false;
const emoteState = {
  active: false,
  id: '',
  time: 0,
  duration: 0,
};

function updatePlayerPos() {
  playerGroup.position.set(
    pl.x - MW / 2 + 0.5,
    CONFIG.player.groundOffset + pl.groundY,
    pl.y - MH / 2 + 0.5
  );
  playerGroup.rotation.y = pl.angle;
}
updatePlayerPos();

function lerpTo(current, target, rate, dt) {
  return current + (target - current) * Math.min(1, rate * dt);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeOutSine(value) {
  return Math.sin((clamp01(value) * Math.PI) / 2);
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * clamp01(value)) - 1) * 0.5;
}

function startPlayerEmote(id) {
  const config = EMOTE_CFG[id];
  if (!config) return false;

  emoteState.active = true;
  emoteState.id = id;
  emoteState.time = 0;
  emoteState.duration = config.duration;
  pl.moving = false;
  pl.running = false;
  pl.targetSpeed = 0;
  return true;
}

function isPlayerEmoting() {
  return emoteState.active;
}

function resetEmoteArmAxes() {
  armPivotL.rotation.y = 0;
  armPivotR.rotation.y = 0;
  elbowPivotL.rotation.z = 0;
  elbowPivotR.rotation.z = 0;
  armPivotL.position.z = RIG_DEFAULTS.armPivotL.z;
  armPivotR.position.z = RIG_DEFAULTS.armPivotR.z;
}

function gaitLift(phase) {
  return clamp01((-Math.sin(phase) + 1) * 0.5);
}

function gaitDrive(phase) {
  return Math.sin(phase);
}

function update(dt) {
  const emoteActive = emoteState.active;

  if (!emoteActive && keys['KeyC'] && !crouchTogglePressed) {
    pl.crouching = !pl.crouching;
  }
  crouchTogglePressed = !!keys['KeyC'];

  let dx = 0, dz = 0;
  if (!emoteActive) {
    if (keys['ArrowLeft']  || keys['KeyA']) { dx--; dz++; }
    if (keys['ArrowRight'] || keys['KeyD']) { dx++; dz--; }
    if (keys['ArrowUp']    || keys['KeyW']) { dx--; dz--; }
    if (keys['ArrowDown']  || keys['KeyS']) { dx++; dz++; }
  }

  pl.running = !emoteActive && !pl.crouching && !!(keys['ShiftLeft'] || keys['ShiftRight']);
  pl.moving = dx !== 0 || dz !== 0;

  // ── Speed with acceleration/deceleration ──
  if (pl.moving) {
    pl.targetSpeed = pl.crouching
      ? MOVE_CFG.crouchSpeed
      : (pl.running ? RUN_SPEED : WALK_SPEED);
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

  pl.crouchBlend = lerpTo(
    pl.crouchBlend,
    pl.crouching ? 1 : 0,
    ANIM_CFG.crouch.blendRate,
    dt
  );

  const isRunAnim = pl.speed > WALK_SPEED * ANIM_CFG.runThreshold;
  const a = isRunAnim ? ANIM.run : ANIM.walk;

  const intensity = Math.min(1, pl.speed / WALK_SPEED);
  const movementHeadingX = pl.moving ? dx : 0;
  const movementHeadingZ = pl.moving ? dz : 0;

  if (pl.speed > MOVE_CFG.minSpeed) {
    pl.walkTime += dt * a.freq * (pl.speed / (isRunAnim ? RUN_SPEED : WALK_SPEED));
  }

  const phase = pl.walkTime;
  const sinP = Math.sin(phase);
  const sinDouble = Math.sin(phase * 2);
  const strafeAmount = Math.max(-1, Math.min(1, movementHeadingX * 1.8));
  const leftDrive = gaitDrive(phase);
  const rightDrive = gaitDrive(phase + Math.PI);
  const leftLift = gaitLift(phase);
  const rightLift = gaitLift(phase + Math.PI);
  const strideBlend = 0.72 + pl.crouchBlend * 0.18;

  const crouchLegBend = ANIM_CFG.crouch.legBend * pl.crouchBlend;
  const crouchKneeBend = ANIM_CFG.crouch.kneeBend * pl.crouchBlend;
  const crouchAnkleBend = ANIM_CFG.crouch.ankleBend * pl.crouchBlend;
  const crouchArmForward = ANIM_CFG.crouch.armForward * pl.crouchBlend;
  const crouchElbowBend = ANIM_CFG.crouch.elbowBend * pl.crouchBlend;
  const crouchLean = ANIM_CFG.crouch.torsoLean * pl.crouchBlend;

  const leftStride = leftDrive * a.legAmp * intensity * strideBlend;
  const rightStride = rightDrive * a.legAmp * intensity * strideBlend;
  const leftStepSettle = Math.max(0, leftDrive) * a.stepSnap * intensity;
  const rightStepSettle = Math.max(0, rightDrive) * a.stepSnap * intensity;

  legPivotL.rotation.x = leftStride + leftStepSettle + crouchLegBend;
  legPivotR.rotation.x = rightStride + rightStepSettle + crouchLegBend;

  const armSwing = leftDrive * a.armAmp * intensity;
  armPivotL.rotation.x = -armSwing + crouchArmForward;
  armPivotR.rotation.x = armSwing + crouchArmForward;
  elbowPivotL.rotation.x = -Math.max(0, -armSwing) * a.elbowAmp * intensity + crouchElbowBend;
  elbowPivotR.rotation.x = -Math.max(0, armSwing) * a.elbowAmp * intensity + crouchElbowBend;

  kneePivotL.rotation.x = leftLift * a.kneeAmp * intensity + crouchKneeBend;
  kneePivotR.rotation.x = rightLift * a.kneeAmp * intensity + crouchKneeBend;

  const leftFootLevel = -(legPivotL.rotation.x + kneePivotL.rotation.x) * a.ankleLevel;
  const rightFootLevel = -(legPivotR.rotation.x + kneePivotR.rotation.x) * a.ankleLevel;
  anklePivotL.rotation.x = leftFootLevel + (leftLift * a.ankleLift * intensity) + crouchAnkleBend;
  anklePivotR.rotation.x = rightFootLevel + (rightLift * a.ankleLift * intensity) + crouchAnkleBend;

  armPivotL.rotation.z = 0.08 * intensity + strafeAmount * 0.04 + pl.crouchBlend * 0.05;
  armPivotR.rotation.z = -0.08 * intensity + strafeAmount * 0.04 - pl.crouchBlend * 0.05;
  armPivotL.position.x = lerpTo(armPivotL.position.x, RIG_DEFAULTS.armPivotL.x, ANIM_CFG.idleReturnRate, dt);
  armPivotR.position.x = lerpTo(armPivotR.position.x, RIG_DEFAULTS.armPivotR.x, ANIM_CFG.idleReturnRate, dt);
  armPivotL.position.y = lerpTo(armPivotL.position.y, RIG_DEFAULTS.armPivotL.y, ANIM_CFG.idleReturnRate, dt);
  armPivotR.position.y = lerpTo(armPivotR.position.y, RIG_DEFAULTS.armPivotR.y, ANIM_CFG.idleReturnRate, dt);
  armPivotL.position.z = lerpTo(armPivotL.position.z, RIG_DEFAULTS.armPivotL.z, ANIM_CFG.idleReturnRate, dt);
  armPivotR.position.z = lerpTo(armPivotR.position.z, RIG_DEFAULTS.armPivotR.z, ANIM_CFG.idleReturnRate, dt);
  armPivotL.rotation.y = lerpTo(armPivotL.rotation.y, 0, ANIM_CFG.idleReturnRate, dt);
  armPivotR.rotation.y = lerpTo(armPivotR.rotation.y, 0, ANIM_CFG.idleReturnRate, dt);
  elbowPivotL.rotation.z = lerpTo(elbowPivotL.rotation.z, 0, ANIM_CFG.idleReturnRate, dt);
  elbowPivotR.rotation.z = lerpTo(elbowPivotR.rotation.z, 0, ANIM_CFG.idleReturnRate, dt);

  upperBody.position.y =
    ANIM_CFG.upperBodyY +
    (ANIM_CFG.crouch.upperBodyY - ANIM_CFG.upperBodyY) * pl.crouchBlend +
    Math.abs(sinP) * a.bob * intensity;
  headGroup.position.y =
    ANIM_CFG.headY +
    (ANIM_CFG.crouch.headY - ANIM_CFG.headY) * pl.crouchBlend +
    Math.abs(sinP) * a.headBob * intensity;

  const leanTarget = isRunAnim ? a.leanFwd * intensity : 0;
  upperBody.rotation.x = lerpTo(
    upperBody.rotation.x,
    leanTarget + crouchLean,
    ANIM_CFG.bodyReturnRate,
    dt
  );

  upperBody.rotation.y = lerpTo(
    upperBody.rotation.y,
    (-leftDrive * a.bodyYaw * intensity) + (pl.crouchBlend * ANIM_CFG.crouch.bodyYaw * strafeAmount),
    ANIM_CFG.bodyReturnRate,
    dt
  );
  upperBody.rotation.z = lerpTo(
    upperBody.rotation.z,
    (sinDouble * a.bodyRoll * intensity * 0.75) + (strafeAmount * a.strafeSway * intensity) + (pl.crouchBlend * ANIM_CFG.crouch.bodyRoll * strafeAmount),
    ANIM_CFG.bodyReturnRate,
    dt
  );

  headGroup.rotation.x = lerpTo(
    headGroup.rotation.x,
    (-Math.abs(sinP) * a.headBob * 0.45 * intensity) + (pl.crouchBlend * ANIM_CFG.crouch.headPitch),
    ANIM_CFG.bodyReturnRate,
    dt
  );
  headGroup.rotation.z = lerpTo(
    headGroup.rotation.z,
    (sinDouble * a.bodyRoll * 0.5 * intensity) + (pl.crouchBlend * ANIM_CFG.crouch.headRoll * strafeAmount),
    ANIM_CFG.bodyReturnRate,
    dt
  );
  headGroup.rotation.y = lerpTo(headGroup.rotation.y, 0, ANIM_CFG.bodyReturnRate, dt);

  legPivotL.position.z = -leftDrive * a.hipSwing * intensity;
  legPivotR.position.z = -rightDrive * a.hipSwing * intensity;
  legPivotL.position.x = -0.08 + (rightLift - leftLift) * 0.012 * intensity;
  legPivotR.position.x = 0.08 + (leftLift - rightLift) * 0.012 * intensity;

  if (pl.speed < MOVE_CFG.minSpeed) {
    legPivotL.rotation.x = lerpTo(legPivotL.rotation.x, crouchLegBend, ANIM_CFG.idleReturnRate, dt);
    legPivotR.rotation.x = lerpTo(legPivotR.rotation.x, crouchLegBend, ANIM_CFG.idleReturnRate, dt);
    kneePivotL.rotation.x = lerpTo(kneePivotL.rotation.x, crouchKneeBend, ANIM_CFG.idleReturnRate, dt);
    kneePivotR.rotation.x = lerpTo(kneePivotR.rotation.x, crouchKneeBend, ANIM_CFG.idleReturnRate, dt);
    elbowPivotL.rotation.x = lerpTo(elbowPivotL.rotation.x, crouchElbowBend, ANIM_CFG.idleReturnRate, dt);
    elbowPivotR.rotation.x = lerpTo(elbowPivotR.rotation.x, crouchElbowBend, ANIM_CFG.idleReturnRate, dt);
    anklePivotL.rotation.x = lerpTo(
      anklePivotL.rotation.x,
      (-(crouchLegBend + crouchKneeBend) * ANIM_CFG.walk.ankleLevel) + crouchAnkleBend,
      ANIM_CFG.idleReturnRate,
      dt
    );
    anklePivotR.rotation.x = lerpTo(
      anklePivotR.rotation.x,
      (-(crouchLegBend + crouchKneeBend) * ANIM_CFG.walk.ankleLevel) + crouchAnkleBend,
      ANIM_CFG.idleReturnRate,
      dt
    );
    armPivotL.rotation.x = lerpTo(armPivotL.rotation.x, crouchArmForward, ANIM_CFG.idleReturnRate, dt);
    armPivotR.rotation.x = lerpTo(armPivotR.rotation.x, crouchArmForward, ANIM_CFG.idleReturnRate, dt);
    armPivotL.rotation.z = lerpTo(armPivotL.rotation.z, pl.crouchBlend * 0.05, ANIM_CFG.idleReturnRate, dt);
    armPivotR.rotation.z = lerpTo(armPivotR.rotation.z, -pl.crouchBlend * 0.05, ANIM_CFG.idleReturnRate, dt);
    upperBody.rotation.x = lerpTo(upperBody.rotation.x, crouchLean, ANIM_CFG.bodyReturnRate, dt);
    upperBody.rotation.y = lerpTo(upperBody.rotation.y, 0, ANIM_CFG.bodyReturnRate, dt);
    upperBody.rotation.z = lerpTo(upperBody.rotation.z, 0, ANIM_CFG.bodyReturnRate, dt);
    headGroup.rotation.x = lerpTo(headGroup.rotation.x, pl.crouchBlend * ANIM_CFG.crouch.headPitch, ANIM_CFG.bodyReturnRate, dt);
    headGroup.rotation.y = lerpTo(headGroup.rotation.y, 0, ANIM_CFG.bodyReturnRate, dt);
    headGroup.rotation.z = lerpTo(headGroup.rotation.z, 0, ANIM_CFG.bodyReturnRate, dt);
    legPivotL.position.z = lerpTo(legPivotL.position.z, 0, ANIM_CFG.idleReturnRate, dt);
    legPivotR.position.z = lerpTo(legPivotR.position.z, 0, ANIM_CFG.idleReturnRate, dt);
    legPivotL.position.x = lerpTo(legPivotL.position.x, -0.08, ANIM_CFG.idleReturnRate, dt);
    legPivotR.position.x = lerpTo(legPivotR.position.x, 0.08, ANIM_CFG.idleReturnRate, dt);
  }

  if (emoteState.active) {
    emoteState.time = Math.min(emoteState.duration, emoteState.time + dt);
    const t = clamp01(emoteState.time / emoteState.duration);
    const hello = emoteState.id === 'hello';
    const victory = emoteState.id === 'victory';
    const surprise = emoteState.id === 'surprise';
    const scream = emoteState.id === 'scream';

    if (hello) {
      const helloCfg = EMOTE_CFG.hello;
      const lift = easeOutSine(Math.min(1, t * 1.75));
      const settle = 1 - easeInOutSine(Math.max(0, (t - 0.68) / 0.32));
      const wave = Math.sin(t * Math.PI * 2 * helloCfg.waveCycles);
      const waveMix = lift * settle;

      armPivotL.rotation.x = -0.06 * waveMix;
      armPivotL.rotation.z = helloCfg.armOpen * waveMix;
      armPivotL.rotation.y = EMOTE_HALF_TURN - (wave * 0.24 * waveMix);
      elbowPivotL.rotation.x = helloCfg.elbowBend * waveMix;
      elbowPivotL.rotation.z = -wave * 0.18 * waveMix;
      armPivotL.position.y = RIG_DEFAULTS.armPivotL.y + helloCfg.shoulderRaise * waveMix;
      armPivotL.position.z = RIG_DEFAULTS.armPivotL.z;
      upperBody.rotation.y += 0.1 * waveMix;
      headGroup.rotation.y = lerpTo(headGroup.rotation.y, 0.18 * waveMix, ANIM_CFG.bodyReturnRate, dt);
    }

    if (surprise) {
      const surpriseCfg = EMOTE_CFG.surprise;
      const snap = easeOutSine(Math.min(1, t * 3.5));
      const release = 1 - Math.max(0, (t - 0.5) / 0.5);
      const shock = snap * release;

      armPivotL.rotation.x = -0.04 * shock;
      armPivotR.rotation.x = -0.04 * shock;
      armPivotL.rotation.z = surpriseCfg.armOpen * shock;
      armPivotR.rotation.z = -surpriseCfg.armOpen * shock;
      elbowPivotL.rotation.x = surpriseCfg.elbowBend * shock;
      elbowPivotR.rotation.x = surpriseCfg.elbowBend * shock;
      armPivotL.position.y = RIG_DEFAULTS.armPivotL.y + surpriseCfg.shoulderRaise * shock;
      armPivotR.position.y = RIG_DEFAULTS.armPivotR.y + surpriseCfg.shoulderRaise * shock;
      armPivotL.position.z = RIG_DEFAULTS.armPivotL.z;
      armPivotR.position.z = RIG_DEFAULTS.armPivotR.z;
      armPivotL.rotation.y = EMOTE_HALF_TURN;
      armPivotR.rotation.y = EMOTE_HALF_TURN;
      upperBody.position.y += surpriseCfg.bodyLift * shock;
      upperBody.rotation.x += surpriseCfg.torsoLean * shock;
      headGroup.rotation.x = lerpTo(headGroup.rotation.x, -0.08 * shock, ANIM_CFG.bodyReturnRate, dt);
    }

    if (victory) {
      const victoryCfg = EMOTE_CFG.victory;
      const rise = easeOutSine(Math.min(1, t * 2.4));
      const hold = 1 - Math.max(0, (t - 0.82) / 0.18);
      const salute = rise * hold;

      armPivotL.rotation.x = lerpTo(armPivotL.rotation.x, 0, ANIM_CFG.bodyReturnRate, dt);
      armPivotL.rotation.y = lerpTo(armPivotL.rotation.y, 0, ANIM_CFG.bodyReturnRate, dt);
      armPivotL.rotation.z = lerpTo(armPivotL.rotation.z, 0.02, ANIM_CFG.bodyReturnRate, dt);
      elbowPivotL.rotation.x = lerpTo(elbowPivotL.rotation.x, 0.08, ANIM_CFG.bodyReturnRate, dt);

      armPivotR.rotation.x = -victoryCfg.saluteLift * salute;
      armPivotR.rotation.z = victoryCfg.saluteOpen * salute;
      armPivotR.rotation.y = -victoryCfg.saluteYaw * salute;
      elbowPivotR.rotation.x = -victoryCfg.elbowBend * salute;
      elbowPivotR.rotation.z = 0.12 * salute;
      armPivotR.position.x = RIG_DEFAULTS.armPivotR.x + victoryCfg.shoulderOut * salute;
      armPivotR.position.y = RIG_DEFAULTS.armPivotR.y + victoryCfg.shoulderRaise * salute;

      upperBody.position.y += victoryCfg.torsoLift * salute;
      upperBody.rotation.x = lerpTo(upperBody.rotation.x, -0.03 * salute, ANIM_CFG.bodyReturnRate, dt);
      upperBody.rotation.y = lerpTo(upperBody.rotation.y, 0, ANIM_CFG.bodyReturnRate, dt);
      upperBody.rotation.z = lerpTo(upperBody.rotation.z, 0, ANIM_CFG.bodyReturnRate, dt);

      headGroup.rotation.x = lerpTo(headGroup.rotation.x, victoryCfg.chinUp * salute, ANIM_CFG.bodyReturnRate, dt);
      headGroup.rotation.y = lerpTo(headGroup.rotation.y, 0, ANIM_CFG.bodyReturnRate, dt);
      headGroup.rotation.z = lerpTo(headGroup.rotation.z, 0, ANIM_CFG.bodyReturnRate, dt);

      legPivotL.rotation.x = lerpTo(legPivotL.rotation.x, 0, ANIM_CFG.idleReturnRate, dt);
      legPivotR.rotation.x = lerpTo(legPivotR.rotation.x, 0, ANIM_CFG.idleReturnRate, dt);
      kneePivotL.rotation.x = lerpTo(kneePivotL.rotation.x, 0.02, ANIM_CFG.idleReturnRate, dt);
      kneePivotR.rotation.x = lerpTo(kneePivotR.rotation.x, 0.02, ANIM_CFG.idleReturnRate, dt);
      anklePivotL.rotation.x = lerpTo(anklePivotL.rotation.x, 0, ANIM_CFG.idleReturnRate, dt);
      anklePivotR.rotation.x = lerpTo(anklePivotR.rotation.x, 0, ANIM_CFG.idleReturnRate, dt);
      legPivotL.position.z = lerpTo(legPivotL.position.z, 0, ANIM_CFG.idleReturnRate, dt);
      legPivotR.position.z = lerpTo(legPivotR.position.z, 0, ANIM_CFG.idleReturnRate, dt);
      legPivotL.position.x = lerpTo(legPivotL.position.x, -0.08, ANIM_CFG.idleReturnRate, dt);
      legPivotR.position.x = lerpTo(legPivotR.position.x, 0.08, ANIM_CFG.idleReturnRate, dt);
    }

    if (scream) {
      const screamCfg = EMOTE_CFG.scream;
      const reach = easeOutSine(Math.min(1, t * 2.4));
      const jitter = Math.sin(emoteState.time * 28) * 0.5 + Math.sin(emoteState.time * 43) * 0.5;

      armPivotL.rotation.x = -0.08 * reach;
      armPivotR.rotation.x = -0.08 * reach;
      armPivotL.rotation.z = screamCfg.armSideLift * reach;
      armPivotR.rotation.z = -screamCfg.armSideLift * reach;
      armPivotL.rotation.y = EMOTE_HALF_TURN - (screamCfg.armInwardYaw * reach);
      armPivotR.rotation.y = EMOTE_HALF_TURN + (screamCfg.armInwardYaw * reach);
      elbowPivotL.rotation.x = screamCfg.elbowBend * reach;
      elbowPivotR.rotation.x = screamCfg.elbowBend * reach;
      armPivotL.position.x = RIG_DEFAULTS.armPivotL.x + screamCfg.shoulderInset * reach;
      armPivotR.position.x = RIG_DEFAULTS.armPivotR.x - screamCfg.shoulderInset * reach;
      armPivotL.position.y = RIG_DEFAULTS.armPivotL.y + screamCfg.shoulderLift * reach;
      armPivotR.position.y = RIG_DEFAULTS.armPivotR.y + screamCfg.shoulderLift * reach;
      armPivotL.position.z = RIG_DEFAULTS.armPivotL.z;
      armPivotR.position.z = RIG_DEFAULTS.armPivotR.z;
      headGroup.rotation.x = lerpTo(headGroup.rotation.x, 0.16 * reach, ANIM_CFG.bodyReturnRate, dt);
      upperBody.rotation.x += 0.06 * reach;
      upperBody.rotation.y += jitter * screamCfg.shakeYaw;
      upperBody.rotation.z += jitter * screamCfg.shakeRoll;
      headGroup.rotation.z = lerpTo(headGroup.rotation.z, jitter * screamCfg.shakePitch, ANIM_CFG.bodyReturnRate, dt);
    }

    if (emoteState.time >= emoteState.duration) {
      emoteState.active = false;
      emoteState.id = '';
      resetEmoteArmAxes();
    }
  }

  pl.groundY = lerpTo(pl.groundY, getGroundHeightAt(pl.x, pl.y), 14, dt);
  updatePlayerPos();
}
