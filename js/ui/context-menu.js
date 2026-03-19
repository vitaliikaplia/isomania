/* ── Context Menu ── */

const CONTEXT_MENU_CFG = CONFIG.ui.contextMenu;
const contextMenuWrap = document.getElementById('wrap');
const contextMenuVector = new THREE.Vector3();

const CONTEXT_MENU = {
  root: null,
  items: [],
  visible: false,
};

const CONTEXT_ACTIONS = {
  hello: {
    trigger() {
      playVoiceLine('hello');
      startPlayerEmote('hello');
    },
  },
  history: {
    trigger() {
      playVoiceLine('history');
      startPlayerEmote('history');
    },
  },
  victory: {
    trigger() {
      playVoiceLine('victory');
      startPlayerEmote('victory');
    },
  },
  surprise: {
    trigger() {
      playVoiceLine('surprise');
      startPlayerEmote('surprise');
    },
  },
  scream: {
    trigger() {
      playVoiceLine('scream');
      startPlayerEmote('scream');
    },
  },
};

function createContextMenu() {
  if (CONTEXT_MENU.root) return;

  const root = document.createElement('div');
  root.className = 'context-menu';

  CONTEXT_MENU_CFG.items.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'context-menu-item';
    button.dataset.actionId = item.id;
    button.innerHTML = `<strong>${item.label}</strong><span>${item.hint}</span>`;
    button.addEventListener('click', () => activateContextAction(item.id));
    root.appendChild(button);
    CONTEXT_MENU.items.push(button);
  });

  contextMenuWrap.appendChild(root);
  CONTEXT_MENU.root = root;
}

function isContextMenuAvailable() {
  return typeof gameStarted !== 'undefined' && gameStarted && !loaderEl?.offsetParent;
}

function showContextMenu() {
  createContextMenu();
  if (!isContextMenuAvailable()) return;
  CONTEXT_MENU.visible = true;
  CONTEXT_MENU.root.classList.add('is-visible');
  layoutContextMenu();
}

function hideContextMenu() {
  if (!CONTEXT_MENU.root) return;
  CONTEXT_MENU.visible = false;
  CONTEXT_MENU.root.classList.remove('is-visible');
}

function toggleContextMenu() {
  if (CONTEXT_MENU.visible) {
    hideContextMenu();
  } else {
    showContextMenu();
  }
}

function activateContextAction(actionId) {
  const action = CONTEXT_ACTIONS[actionId];
  hideContextMenu();
  if (!action) return;
  action.trigger();
}

function layoutContextMenu() {
  if (!CONTEXT_MENU.visible || !CONTEXT_MENU.root) return;

  const buttonCount = CONTEXT_MENU.items.length;
  if (buttonCount === 0) return;

  let maxButtonWidth = 0;
  let maxButtonHeight = 0;
  for (const button of CONTEXT_MENU.items) {
    maxButtonWidth = Math.max(maxButtonWidth, button.offsetWidth);
    maxButtonHeight = Math.max(maxButtonHeight, button.offsetHeight);
  }

  const spacing = Math.max(maxButtonWidth + 24, maxButtonHeight * 1.6, 132);
  const radius = buttonCount === 1
    ? CONTEXT_MENU_CFG.radius
    : Math.max(
      CONTEXT_MENU_CFG.radius,
      (spacing * buttonCount) / (2 * Math.PI),
      maxButtonHeight * 1.35
    );
  const step = (Math.PI * 2) / buttonCount;
  const startAngle = -Math.PI / 2;

  CONTEXT_MENU.items.forEach((button, index) => {
    const angle = startAngle + (step * index);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    button.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  });
}

function updateContextMenu() {
  if (!CONTEXT_MENU.visible || !CONTEXT_MENU.root) return;
  if (!isContextMenuAvailable() || isPlayerEmoting()) {
    hideContextMenu();
    return;
  }

  contextMenuVector.set(
    playerGroup.position.x,
    playerGroup.position.y + CONTEXT_MENU_CFG.anchorHeight,
    playerGroup.position.z
  );
  contextMenuVector.project(cam);

  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;
  const screenX = (contextMenuVector.x * 0.5 + 0.5) * width;
  const screenY = (-contextMenuVector.y * 0.5 + 0.5) * height;

  CONTEXT_MENU.root.style.left = `${screenX}px`;
  CONTEXT_MENU.root.style.top = `${screenY}px`;
}

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.code !== 'KeyQ') return;
  if (!isContextMenuAvailable()) return;
  e.preventDefault();
  toggleContextMenu();
});

document.addEventListener('pointerdown', e => {
  if (!CONTEXT_MENU.visible || !CONTEXT_MENU.root) return;
  if (CONTEXT_MENU.root.contains(e.target)) return;
  hideContextMenu();
});
