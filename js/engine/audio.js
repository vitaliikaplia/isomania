/* ── Audio ── */

const AUDIO_CFG = CONFIG.audio;
const AUDIO = {
  context: null,
  masterGain: null,
  ambientGain: null,
  sfxGain: null,
  enabled: AUDIO_CFG.enabled,
  unlocked: false,
  ambientStarted: false,
  ambientIndex: -1,
  ambientBuffers: [],
  ambientLoadPromise: null,
  ambientSlots: [],
  ambientSlotIndex: 0,
  ambientScheduleTimer: null,
  ambientRetryTimer: null,
  footstepBuffers: [],
  footstepLoadPromise: null,
  footstepDistance: 0,
  lastPlayerX: CONFIG.player.spawn.x,
  lastPlayerY: CONFIG.player.spawn.y,
  lastFootstepIndex: -1,
  recentFootstepIndexes: [],
  volumes: {
    master: AUDIO_CFG.defaults.masterVolume,
    ambient: AUDIO_CFG.defaults.ambientVolume,
    sfx: AUDIO_CFG.defaults.sfxVolume,
  },
  muted: AUDIO_CFG.defaults.muted,
};

function clampAudioVolume(value, fallback) {
  const normalized = Number.parseFloat(value);
  if (!Number.isFinite(normalized)) return fallback;
  return Math.max(0, Math.min(1, normalized));
}

function loadAudioPreferences() {
  AUDIO.volumes.master = clampAudioVolume(
    localStorage.getItem(AUDIO_CFG.storageKeys.masterVolume),
    AUDIO_CFG.defaults.masterVolume
  );
  AUDIO.volumes.ambient = clampAudioVolume(
    localStorage.getItem(AUDIO_CFG.storageKeys.ambientVolume),
    AUDIO_CFG.defaults.ambientVolume
  );
  AUDIO.volumes.sfx = clampAudioVolume(
    localStorage.getItem(AUDIO_CFG.storageKeys.sfxVolume),
    AUDIO_CFG.defaults.sfxVolume
  );
  AUDIO.muted = localStorage.getItem(AUDIO_CFG.storageKeys.muted) === 'true';
}

function updateAudioBusVolumes() {
  if (!AUDIO.masterGain || !AUDIO.ambientGain || !AUDIO.sfxGain) return;

  const master = AUDIO.muted ? 0 : AUDIO.volumes.master;
  AUDIO.masterGain.gain.value = master;
  AUDIO.ambientGain.gain.value = AUDIO.volumes.ambient;
  AUDIO.sfxGain.gain.value = AUDIO.volumes.sfx;
}

function ensureAudioContext() {
  if (!AUDIO.enabled) return null;
  if (AUDIO.context) return AUDIO.context;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    AUDIO.enabled = false;
    return null;
  }

  AUDIO.context = new AudioContextClass();
  AUDIO.masterGain = AUDIO.context.createGain();
  AUDIO.ambientGain = AUDIO.context.createGain();
  AUDIO.sfxGain = AUDIO.context.createGain();

  AUDIO.ambientGain.connect(AUDIO.masterGain);
  AUDIO.sfxGain.connect(AUDIO.masterGain);
  AUDIO.masterGain.connect(AUDIO.context.destination);
  updateAudioBusVolumes();

  return AUDIO.context;
}

function clearAmbientRetry() {
  if (!AUDIO.ambientRetryTimer) return;
  clearTimeout(AUDIO.ambientRetryTimer);
  AUDIO.ambientRetryTimer = null;
}

function clearAmbientSchedule() {
  if (!AUDIO.ambientScheduleTimer) return;
  clearTimeout(AUDIO.ambientScheduleTimer);
  AUDIO.ambientScheduleTimer = null;
}

function scheduleAmbientRetry() {
  clearAmbientRetry();
  AUDIO.ambientRetryTimer = setTimeout(() => {
    AUDIO.ambientRetryTimer = null;
    startAmbientLoop();
  }, AUDIO_CFG.ambient.retryDelayMs);
}

function decodeAudioBuffer(arrayBuffer) {
  const context = ensureAudioContext();
  if (!context) return Promise.resolve(null);

  return context.decodeAudioData(arrayBuffer.slice(0))
    .catch(() => null);
}

function preloadAmbient() {
  if (!AUDIO.enabled || AUDIO.ambientLoadPromise) return AUDIO.ambientLoadPromise;

  AUDIO.ambientLoadPromise = Promise.all(
    AUDIO_CFG.ambient.files.map(async file => {
      try {
        const response = await fetch(`${AUDIO_CFG.ambient.basePath}/${file}`);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        return decodeAudioBuffer(buffer);
      } catch (error) {
        return null;
      }
    })
  ).then(buffers => {
    AUDIO.ambientBuffers = buffers.filter(Boolean);
    return AUDIO.ambientBuffers;
  });

  return AUDIO.ambientLoadPromise;
}

function preloadFootsteps() {
  if (!AUDIO.enabled || AUDIO.footstepLoadPromise) return AUDIO.footstepLoadPromise;

  AUDIO.footstepLoadPromise = Promise.all(
    AUDIO_CFG.footsteps.files.map(async file => {
      try {
        const response = await fetch(`${AUDIO_CFG.footsteps.basePath}/${file}`);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        return decodeAudioBuffer(buffer);
      } catch (error) {
        return null;
      }
    })
  ).then(buffers => {
    AUDIO.footstepBuffers = buffers.filter(Boolean);
    return AUDIO.footstepBuffers;
  });

  return AUDIO.footstepLoadPromise;
}

function getNextAmbientTrackIndex() {
  const total = AUDIO.ambientBuffers.length;
  if (total === 0) return -1;
  if (total === 1) return 0;

  let nextIndex = Math.floor(Math.random() * total);
  if (nextIndex === AUDIO.ambientIndex) {
    nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (total - 1))) % total;
  }
  return nextIndex;
}

function getAmbientTargetVolume() {
  return AUDIO.muted ? 0 : 1;
}

function fadeGainNode(gainNode, fromValue, toValue, durationSeconds) {
  const context = ensureAudioContext();
  if (!context || !gainNode) return;

  const now = context.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(fromValue, now);
  gainNode.gain.linearRampToValueAtTime(toValue, now + Math.max(0.01, durationSeconds));
}

function getAmbientSlot(index) {
  if (!AUDIO.ambientSlots[index]) {
    AUDIO.ambientSlots[index] = { source: null, gainNode: null, trackIndex: -1 };
  }
  return AUDIO.ambientSlots[index];
}

function cleanupAmbientSlot(slot) {
  if (!slot) return;
  if (slot.source) {
    try {
      slot.source.stop();
    } catch (error) {
      // Ignore stop errors for already-finished sources.
    }
    slot.source.disconnect();
  }
  if (slot.gainNode) {
    slot.gainNode.disconnect();
  }
  slot.source = null;
  slot.gainNode = null;
  slot.trackIndex = -1;
}

function scheduleNextAmbientCrossfade(buffer) {
  clearAmbientSchedule();

  const duration = buffer ? buffer.duration : 0;
  const crossfadeSeconds = Math.max(1, AUDIO_CFG.ambient.crossfadeSeconds);

  if (!duration) {
    scheduleAmbientRetry();
    return;
  }

  const delaySeconds = duration > crossfadeSeconds + 0.25
    ? duration - crossfadeSeconds
    : Math.max(0.25, duration * 0.5);

  AUDIO.ambientScheduleTimer = setTimeout(() => {
    AUDIO.ambientScheduleTimer = null;
    startAmbientLoop();
  }, delaySeconds * 1000);
}

function startAmbientLoop() {
  if (!AUDIO.enabled || !AUDIO.unlocked) return;

  const context = ensureAudioContext();
  if (!context) return;
  if (AUDIO.ambientBuffers.length === 0) {
    preloadAmbient().then(buffers => {
      if (buffers && buffers.length) startAmbientLoop();
    });
    return;
  }

  const nextIndex = getNextAmbientTrackIndex();
  if (nextIndex === -1) return;

  AUDIO.ambientIndex = nextIndex;
  const buffer = AUDIO.ambientBuffers[nextIndex];
  const nextSlotIndex = AUDIO.ambientSlotIndex;
  const prevSlotIndex = (nextSlotIndex + 1) % 2;
  const nextSlot = getAmbientSlot(nextSlotIndex);
  const prevSlot = getAmbientSlot(prevSlotIndex);
  cleanupAmbientSlot(nextSlot);

  const source = context.createBufferSource();
  const gainNode = context.createGain();
  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(AUDIO.ambientGain);
  gainNode.gain.value = 0;

  nextSlot.source = source;
  nextSlot.gainNode = gainNode;
  nextSlot.trackIndex = nextIndex;
  AUDIO.ambientSlotIndex = prevSlotIndex;

  source.onended = () => {
    if (nextSlot.source === source) {
      cleanupAmbientSlot(nextSlot);
    }
  };

  source.start();
  AUDIO.ambientStarted = true;
  fadeGainNode(gainNode, 0, getAmbientTargetVolume(), AUDIO_CFG.ambient.fadeInSeconds);
  scheduleNextAmbientCrossfade(buffer);

  if (prevSlot.gainNode) {
    fadeGainNode(
      prevSlot.gainNode,
      prevSlot.gainNode.gain.value,
      0,
      AUDIO_CFG.ambient.crossfadeSeconds
    );
    setTimeout(() => cleanupAmbientSlot(prevSlot), AUDIO_CFG.ambient.crossfadeSeconds * 1000 + 100);
  }
}

function unlockAudio() {
  const context = ensureAudioContext();
  if (!context) return Promise.resolve(false);

  loadAudioPreferences();
  updateAudioBusVolumes();
  AUDIO.unlocked = true;

  return context.resume()
    .then(() => Promise.all([preloadAmbient(), preloadFootsteps()]))
    .then(([ambientBuffers]) => {
      if (!AUDIO.ambientStarted && ambientBuffers && ambientBuffers.length) {
        startAmbientLoop();
      }
      return true;
    })
    .catch(() => false);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getNextFootstepIndex() {
  const total = AUDIO.footstepBuffers.length;
  if (total === 0) return -1;
  if (total === 1) return 0;

  const blockedIndexes = new Set(AUDIO.recentFootstepIndexes);
  let availableIndexes = [];

  for (let index = 0; index < total; index++) {
    if (!blockedIndexes.has(index)) {
      availableIndexes.push(index);
    }
  }

  if (availableIndexes.length === 0) {
    availableIndexes = Array.from({ length: total }, (_, index) => index)
      .filter(index => index !== AUDIO.lastFootstepIndex);
  }

  const nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  AUDIO.lastFootstepIndex = nextIndex;
  AUDIO.recentFootstepIndexes.push(nextIndex);

  const historySize = Math.max(1, AUDIO_CFG.footsteps.recentHistorySize || 1);
  while (AUDIO.recentFootstepIndexes.length > historySize) {
    AUDIO.recentFootstepIndexes.shift();
  }

  return nextIndex;
}

function playRandomFootstep(stepProfile) {
  if (!AUDIO.enabled || !AUDIO.unlocked || AUDIO.footstepBuffers.length === 0) return;
  const context = ensureAudioContext();
  if (!context) return;

  const nextIndex = getNextFootstepIndex();
  if (nextIndex === -1) return;

  const source = context.createBufferSource();
  source.buffer = AUDIO.footstepBuffers[nextIndex];
  source.playbackRate.value = randomBetween(stepProfile.rateMin, stepProfile.rateMax);

  const gain = context.createGain();
  gain.gain.value = stepProfile.baseVolume * randomBetween(
    1 - AUDIO_CFG.footsteps.volumeJitter,
    1 + AUDIO_CFG.footsteps.volumeJitter
  );

  source.connect(gain);
  gain.connect(AUDIO.sfxGain);
  source.start(0);
}

function resetFootstepTracking() {
  AUDIO.footstepDistance = 0;
  AUDIO.lastPlayerX = pl ? pl.x : CONFIG.player.spawn.x;
  AUDIO.lastPlayerY = pl ? pl.y : CONFIG.player.spawn.y;
  AUDIO.recentFootstepIndexes = [];
}

function getFootstepProfile() {
  if (pl.crouching) {
    return {
      distance: AUDIO_CFG.footsteps.crouchDistance,
      rateMin: AUDIO_CFG.footsteps.playbackRate.crouchMin,
      rateMax: AUDIO_CFG.footsteps.playbackRate.crouchMax,
      baseVolume: AUDIO_CFG.footsteps.volume.crouch,
    };
  }

  if (pl.running) {
    return {
      distance: AUDIO_CFG.footsteps.runDistance,
      rateMin: AUDIO_CFG.footsteps.playbackRate.runMin,
      rateMax: AUDIO_CFG.footsteps.playbackRate.runMax,
      baseVolume: AUDIO_CFG.footsteps.volume.run,
    };
  }

  return {
    distance: AUDIO_CFG.footsteps.walkDistance,
    rateMin: AUDIO_CFG.footsteps.playbackRate.walkMin,
    rateMax: AUDIO_CFG.footsteps.playbackRate.walkMax,
    baseVolume: AUDIO_CFG.footsteps.volume.walk,
  };
}

function updateFootstepAudio() {
  if (!AUDIO.enabled || !AUDIO.unlocked) return;

  const dx = pl.x - AUDIO.lastPlayerX;
  const dy = pl.y - AUDIO.lastPlayerY;
  AUDIO.lastPlayerX = pl.x;
  AUDIO.lastPlayerY = pl.y;

  if (!pl.moving || pl.speed <= MOVE_CFG.minSpeed) {
    AUDIO.footstepDistance = 0;
    return;
  }

  AUDIO.footstepDistance += Math.sqrt(dx * dx + dy * dy);
  const stepProfile = getFootstepProfile();
  const stepDistance = stepProfile.distance;

  while (AUDIO.footstepDistance >= stepDistance) {
    AUDIO.footstepDistance -= stepDistance;
    playRandomFootstep(stepProfile);
  }
}

function updateAudio() {
  updateFootstepAudio();
}

loadAudioPreferences();
