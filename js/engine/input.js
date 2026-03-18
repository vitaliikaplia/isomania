/* ── Input ── */

const keys = {};
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  keys[e.key] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.key] = false; });
document.addEventListener('contextmenu', e => e.preventDefault());

// Clear all keys when window loses focus to prevent stuck keys
function clearKeys() { for (const k in keys) keys[k] = false; }
window.addEventListener('blur', clearKeys);
document.addEventListener('visibilitychange', () => { if (document.hidden) clearKeys(); });
