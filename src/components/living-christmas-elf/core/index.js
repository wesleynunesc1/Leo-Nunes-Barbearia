// Living Christmas Elf 2.3 — framework-free entry point.
//
//   const elf = createElf(wrapperEl, buttonEl, options)
//     wrapperEl : position:relative element that contains the button (React wrapper / .lce-wrap)
//     buttonEl  : the existing CTA ("Agendar meu horário"). It is NOT modified — we only listen to it.
//   mountElf(buttonEl, options) — plain HTML convenience (wraps the button in <span class="lce-wrap">).
//
// Options: inset (px from the button's right edge to the seat; default 0.24 × elf height),
//          size (CSS length for the elf height), seat (px fine-tune), seed, mobile, onDebug, onEvent,
//          interactiveElf (default true), forceFallback (static picture, for tests)
import { ElfEngine, ACTIONS, PERSONALITIES, EXPRESSIONS } from './engine.js';

export function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch (e) { return false; }
}

export function createElf(wrapper, button, options = {}) {
  const layer = document.createElement('div');
  layer.className = 'lce-layer';
  if (options.size) layer.style.setProperty('--lce-size', options.size);
  wrapper.appendChild(layer);
  let engine = null;
  if (!options.forceFallback && webglAvailable()) {
    try { engine = new ElfEngine(layer, options); } catch (e) { engine = null; layer.textContent = ''; } // e.g. shader rejected by an old GPU
  }
  if (!engine) {
    // graceful fallback: static picture rendered from the same 3D elf (no animation, nothing to break)
    layer.classList.add('lce-fallback');
    const place = () => {
      const br = button.getBoundingClientRect(), wr = wrapper.getBoundingClientRect(), h = layer.offsetHeight || 150, w = h / 1.2;
      layer.style.width = w + 'px';
      layer.style.left = br.left - wr.left + br.width - (options.inset ?? h * 0.24) - w * 0.452 + 'px';
      layer.style.top = br.top - wr.top + (options.seat ?? 1) - h * 0.715 + 'px';
    };
    place(); window.addEventListener('resize', place, { passive: true });
    return { engine: null, layer, destroy() { window.removeEventListener('resize', place); layer.remove(); }, setPersonality() {}, play() {}, expression() {}, react() {}, setAuto() {}, setTimeScale() {}, setMobile() {}, setReducedMotion() {}, pause() {}, resume() {}, relayout() {} };
  }
  const rig = engine.rig;
  const hit = document.createElement('div');
  hit.className = 'lce-hit';
  hit.setAttribute('aria-hidden', 'true');
  layer.appendChild(hit);

  // ---- layout: seat the elf on the top-right corner of the real button
  let lastKey = '';
  function relayout() {
    const br = button.getBoundingClientRect(), wr = wrapper.getBoundingClientRect();
    const h = layer.offsetHeight || 140;
    const w = Math.round(h / 1.2);
    const dpr = Math.min(window.devicePixelRatio || 1, engine.mobile ? 1.75 : 2);
    const key = [br.width, br.height, br.left - wr.left, br.top - wr.top, h, dpr].map((v) => Math.round(v * 10)).join(',');
    if (key === lastKey) return;
    lastKey = key;
    const seat = rig.setSize(w, h, dpr);
    const inset = options.inset ?? h * 0.24;
    const bx = br.left - wr.left, by = br.top - wr.top;
    const tx = bx + br.width - inset, ty = by + (options.seat ?? 1);
    const L = tx - seat[0], T = ty - seat[1];
    layer.style.width = w + 'px';
    layer.style.left = L + 'px';
    layer.style.top = T + 'px';
    rig.setCatcher(bx - L, by - T, bx + br.width - L, by + br.height - T);
    const hc = rig.hitCircle();
    Object.assign(hit.style, { left: hc.x - hc.r + 'px', top: hc.y - hc.r + 'px', width: hc.r * 2 + 'px', height: hc.r * 2 + 'px' });
    engine.redraw();
  }
  relayout();
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => relayout()) : null;
  ro && (ro.observe(button), ro.observe(wrapper), ro.observe(layer));
  const onResize = () => relayout();
  window.addEventListener('resize', onResize, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { lastKey = ''; relayout(); });

  // ---- visitor interactions (passive: the button keeps working exactly as before)
  const off = [];
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); off.push(() => el.removeEventListener(ev, fn, o)); };
  const isMouse = (e) => e.pointerType === 'mouse' || e.pointerType === 'pen';
  if (button) {
    on(button, 'pointerenter', (e) => { if (isMouse(e)) engine.react('hoverStart'); }, { passive: true });
    on(button, 'pointerleave', (e) => { if (isMouse(e)) engine.react('hoverEnd'); }, { passive: true });
    on(button, 'focus', () => { if (!button.matches || button.matches(':focus-visible')) engine.react('focus'); }, { passive: true });
    on(button, 'click', () => engine.react('click'), { passive: true }); // never preventDefault → scheduling opens at once
  }
  // ---- direct interaction with the elf: tap, double, triple, long press, secret (5 taps)
  // timestamps decide (not only timers): a busy main thread may delay timers behind input events
  const LONG = 600, WINDOW = 340;
  let taps = 0, tapTimer = 0, pressTimer = 0, pressed = false, longFired = false, downAt = null, downT = 0, lastTapT = -1e9;
  const resolveTaps = () => {
    const n = taps; taps = 0;
    if (n > 0) engine.react(n >= 5 ? 'secret' : n >= 3 ? 'tripleTap' : n === 2 ? 'doubleTap' : 'tap');
  };
  const fireLong = () => { if (longFired) return; longFired = true; taps = 0; clearTimeout(tapTimer); engine.react('longPress'); };
  if (options.interactiveElf !== false) {
    on(hit, 'pointerenter', (e) => { if (isMouse(e)) engine.react('hoverStart'); }, { passive: true });
    on(hit, 'pointerleave', (e) => { if (isMouse(e)) engine.react('hoverEnd'); clearTimeout(pressTimer); pressed = false; }, { passive: true });
    on(hit, 'pointerdown', (e) => {
      pressed = true; longFired = false; downAt = [e.clientX, e.clientY]; downT = performance.now();
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => { if (pressed) fireLong(); }, LONG);
    });
    on(hit, 'pointermove', (e) => { if (pressed && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 12) { pressed = false; clearTimeout(pressTimer); } }, { passive: true });
    on(hit, 'pointerup', () => {
      clearTimeout(pressTimer);
      const now = performance.now();
      if (!pressed) return;
      pressed = false;
      if (longFired) return;
      if (now - downT >= LONG) { fireLong(); return; }
      if (now - lastTapT > WINDOW && taps > 0) resolveTaps();
      taps++; lastTapT = now;
      clearTimeout(tapTimer);
      if (taps >= 5) resolveTaps(); else tapTimer = setTimeout(resolveTaps, WINDOW);
    });
    on(hit, 'pointercancel', () => { pressed = false; clearTimeout(pressTimer); });
    on(hit, 'contextmenu', (e) => e.preventDefault()); // long press on touch must not open the menu
  } else hit.style.pointerEvents = 'none';

  return {
    engine, layer, relayout,
    setPersonality: (p) => engine.setPersonality(p),
    play: (id) => engine.play(id),
    expression: (n, d) => engine.expression(n, d),
    react: (k) => engine.react(k),
    setAuto: (b) => engine.setAuto(b),
    setTimeScale: (s) => engine.setTimeScale(s),
    setMobile: (b) => { engine.setMobile(b); lastKey = ''; relayout(); },
    setReducedMotion: (b) => engine.setReducedMotion(b),
    pause: () => engine.pause(),
    resume: () => engine.resume(),
    destroy() { off.forEach((f) => f()); ro && ro.disconnect(); window.removeEventListener('resize', onResize); clearTimeout(tapTimer); clearTimeout(pressTimer); engine.destroy(); layer.remove(); },
  };
}

export function mountElf(button, options = {}) {
  const wrap = document.createElement('span');
  wrap.className = 'lce-wrap';
  button.parentNode.insertBefore(wrap, button);
  wrap.appendChild(button);
  const elf = createElf(wrap, button, options);
  const destroy = elf.destroy;
  elf.destroy = () => { destroy(); wrap.parentNode.insertBefore(button, wrap); wrap.remove(); };
  return elf;
}

export { ACTIONS, PERSONALITIES, EXPRESSIONS };
