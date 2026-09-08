// The shortlist ("basket"): item ids collected on the compound page and consumed on the
// planner page. Lives in localStorage so it survives navigation and reloads.
const KEY = 'stardrift.basket.v1';
const EVT = 'stardrift:basket';

export function readBasket() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
export function writeBasket(ids) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  try { window.dispatchEvent(new Event(EVT)); } catch {}
}
export function toggleBasket(id) {
  const b = readBasket();
  const next = b.includes(id) ? b.filter((x) => x !== id) : [...b, id];
  writeBasket(next);
  return next;
}
export function subscribeBasket(cb) {
  const on = () => cb(readBasket());
  window.addEventListener(EVT, on);
  window.addEventListener('storage', on);
  return () => { window.removeEventListener(EVT, on); window.removeEventListener('storage', on); };
}
