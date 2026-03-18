/* ── Input ── */

const keys = {};
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
document.addEventListener('contextmenu', e => e.preventDefault());

// Clear all keys when window loses focus
function clearKeys() { for (const k in keys) delete keys[k]; }
window.addEventListener('blur', clearKeys);
window.addEventListener('focus', clearKeys);
document.addEventListener('visibilitychange', () => { if (document.hidden) clearKeys(); });
