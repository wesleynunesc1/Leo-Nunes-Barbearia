// Living Christmas Elf 2.3 — engine: one rAF loop, micro-expressions, layer blending,
// springs, pausing (viewport / hidden tab / reduced motion), mobile limits.
// Nothing here touches React state; the DOM is written directly by rig.apply().
import { defaults, SpringBank, NAMES, clamp, lerp, smooth } from './channels.js';
import { buildRig } from './rig3d.js';
import { Brain, rng } from './brain.js';
import { PERSONALITIES, ACTIONS, EXPRESSIONS, sample } from './actions.js';

const TAU = Math.PI * 2;
const mm = (q) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener() {}, removeEventListener() {} });

export class ElfEngine {
  constructor(host, opts = {}) {
    this.host = host;
    this.opts = opts;
    const seed = opts.seed ?? ((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    this.r = rng(seed + 7);
    this.mobile = opts.mobile ?? (mm('(hover: none), (pointer: coarse)').matches || window.innerWidth < 640);
    this.reduceMQ = mm('(prefers-reduced-motion: reduce)');
    this.reduced = opts.reducedMotion ?? this.reduceMQ.matches;
    this.timeScale = opts.timeScale ?? 1;
    this.fps = opts.fps ?? (this.mobile ? 30 : 60);
    this.rig = buildRig(host, { shadowSize: this.mobile ? 512 : 1024 });
    this.rig.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.lost = true; this.updateRunning(); host.classList.add('lce-lost'); });
    this.brain = new Brain({ seed, mobile: this.mobile, onEvent: (e) => this.onBrainEvent(e) });
    this.target = defaults();
    this.springs = new SpringBank(this.composeBase());
    this.t = 0;
    this.frames = 0;
    this.hovering = false;
    this.visible = true;
    this.hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    this.running = false;
    this.lastDebug = 0;
    this.out = {};
    this.initMicro();
    this.loop = this.loop.bind(this);

    // pause outside the viewport
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver((ents) => {
        this.visible = ents.some((e) => e.isIntersecting);
        this.updateRunning();
      }, { rootMargin: '80px' });
      this.io.observe(host);
    }
    this.onVis = () => { this.hidden = document.visibilityState === 'hidden'; this.updateRunning(); };
    document.addEventListener('visibilitychange', this.onVis);
    this.onRM = (e) => { this.reduced = e.matches; this.renderStatic(); this.updateRunning(); };
    this.reduceMQ.addEventListener && this.reduceMQ.addEventListener('change', this.onRM);

    this.renderStatic();
    this.updateRunning();
  }

  // ---------------------------------------------------------------- lifecycle
  updateRunning() {
    const should = this.visible && !this.hidden && !this.reduced && !this.manualPause && !this.lost;
    if (should && !this.running) { this.running = true; this.last = null; this.raf = requestAnimationFrame(this.loop); }
    else if (!should && this.running) { this.running = false; cancelAnimationFrame(this.raf); }
    this.emitDebug(true);
  }
  pause() { this.manualPause = true; this.updateRunning(); }
  resume() { this.manualPause = false; this.updateRunning(); }
  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.io && this.io.disconnect();
    document.removeEventListener('visibilitychange', this.onVis);
    this.reduceMQ.removeEventListener && this.reduceMQ.removeEventListener('change', this.onRM);
    clearTimeout(this.rmTimer);
    this.rig.destroy();
  }

  loop(now) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.last == null) { this.last = now; return; }
    const minStep = 1000 / this.fps - 1.5;
    if (now - this.last < minStep) return;
    const dt = Math.min(0.066, (now - this.last) / 1000) * this.timeScale;
    this.last = now;
    this.tick(dt);
  }

  // advance simulation by dt seconds (also used by tests / fast-forward)
  tick(dt) {
    const steps = Math.max(1, Math.ceil(dt / 0.034));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) this.step(h, i === steps - 1);
  }

  step(dt, draw = true) {
    this.t += dt;
    const t = this.t;
    this.brain.update(t, dt);
    const T = this.compose(t, dt);
    const x = this.springs.step(T, dt);
    if (!draw) return;
    const ex = this.extras(t, dt, x);
    this.out = this.rig.apply(x, ex, this.noRender);
    this.rig.stepFx(dt);
    this.frames++;
    this.emitDebug(false);
  }

  // ---------------------------------------------------------------- composition
  composeBase() {
    const T = defaults();
    Object.assign(T, PERSONALITIES[this.brain ? this.brain.p : 'CURIOUS'].base);
    return T;
  }

  compose(t, dt) {
    const T = this.target;
    const d = defaults();
    for (const k of NAMES) T[k] = d[k];
    Object.assign(T, PERSONALITIES[this.brain.p].base);
    this.micro(T, t, dt);
    for (const [def, lt, w] of this.brain.layers(t)) {
      for (const [ch, keys] of def.abs) T[ch] = lerp(T[ch], sample(keys, lt), w);
      for (const [ch, keys] of def.add) T[ch] += sample(keys, lt) * w;
    }
    if (this.mobile) { T.legSwing *= 0.7; T.shake *= 0.65; }
    return T;
  }

  // ---------------------------------------------------------------- micro-expressions (always on)
  initMicro() {
    const r = this.r;
    this.m = {
      ph: Array.from({ length: 12 }, () => r() * TAU),
      nextBlink: 1.2, blinkT0: -10, blinkDur: 0.16,
      line: 0, lineT0: 0, lineDur: 1.7,
      leg: 0, legPause: 0, nextLegPause: 6, legMul: 1,
      breath: 0, lean: 0, leanTarget: 0, nextLean: 4,
      brow: null, nextBrow: 3, mouth: null, nextMouth: 5,
      glance: null, nextGlance: 1,
    };
  }

  micro(T, t, dt) {
    const m = this.m, r = this.r, P = PERSONALITIES[this.brain.p];
    const amt = T.micro * (this.mobile ? 0.75 : 1);
    const n = (i, f) => Math.sin(t * f + m.ph[i]) * 0.6 + Math.sin(t * f * 2.3 + m.ph[i + 1]) * 0.4;

    // blinking (personality sets rhythm; sleepy blinks are slow)
    if (t >= m.nextBlink) {
      m.blinkT0 = t; m.blinkDur = P.blink.dur * (0.85 + r() * 0.3);
      const dbl = r() < 0.16;
      m.nextBlink = t + (dbl ? m.blinkDur + 0.12 : P.blink.every[0] + r() * (P.blink.every[1] - P.blink.every[0]));
    }
    const bu = (t - m.blinkT0) / m.blinkDur;
    m.blink = bu < 0 || bu > 1 ? 0 : bu < 0.42 ? smooth(bu / 0.42) : 1 - smooth((bu - 0.42) / 0.58);

    // reading: eyes follow the lines in small saccades, line by line
    const lineDur = m.lineDur * (this.brain.p === 'SLEEPY' ? 1.5 : 1);
    // reading pauses: every few seconds the eyes rest on a word and the brows react a little
    if (!m.rp && t > (m.nextRp ?? 6)) m.rp = { t0: t, d: 0.8 + r() * 0.7, k: r() < 0.5 ? 'browKnit' : 'brow' };
    if (m.rp) {
      const u = (t - m.rp.t0) / m.rp.d;
      if (u > 1) { m.rp = null; m.nextRp = t + 6 + r() * 6; }
      else {
        m.lineT0 += dt; // freeze the scan
        const e = Math.sin(u * Math.PI) * clamp(T.read) * amt;
        if (m.rp.k === 'browKnit') { T.browKnit += e * 0.25; T.squint += e * 0.12; } else { T.browL += e * 0.18; T.browR += e * 0.24; }
      }
    }
    let lu = (t - m.lineT0) / lineDur;
    if (lu >= 1) { m.line = (m.line + 1) % 7; m.lineT0 = t; m.lineDur = 1.35 + r() * 0.8; lu = 0; }
    const fix = Math.min(4, Math.floor(lu * 5.2)) / 4;
    const scanX = lu > 0.93 ? -0.5 : -0.55 + 1.1 * fix;
    const scanY = 0.42 + m.line * 0.065;
    let read = clamp(T.read);
    // sustained hover (desktop): glance at the visitor every few seconds
    if (this.hovering && !this.mobile) {
      if (!m.glance && t > m.nextGlance) m.glance = { t0: t, d: 0.9 + r() * 0.6 };
      if (m.glance) {
        const g = (t - m.glance.t0) / m.glance.d;
        if (g > 1) { m.glance = null; m.nextGlance = t + 1.6 + r() * 1.8; }
        else { const e = Math.sin(g * Math.PI); read *= 1 - e; T.lookY = lerp(T.lookY, -0.2, e); T.lookX = lerp(T.lookX, 0, e); T.headNod = lerp(T.headNod, -0.25, e); }
      }
    }
    T.lookX = lerp(T.lookX, scanX, read);
    T.lookY = lerp(T.lookY, scanY, read);
    T.lookX += n(0, 0.9) * 0.05 * amt;
    // the head follows the reading a little (not only the eyes) and dips slightly line by line
    T.headTurn += scanX * 0.05 * read;
    T.headNod += (m.line * 0.02 - 0.05) * read;

    // head / book / body drift (never identical twice)
    T.headTilt += n(1, 0.23) * 1.7 * amt;
    T.headTurn += n(2, 0.17) * 0.07 * amt;
    T.headNod += n(3, 0.29) * 0.07 * amt;
    T.bookRot += n(4, 0.31) * 0.9 * amt;
    T.bookY += n(5, 0.37) * 0.7 * amt;
    T.smile += n(6, 0.2) * 0.04 * amt;
    T.browL += n(7, 0.19) * 0.04 * amt;
    T.browR += n(8, 0.21) * 0.04 * amt;

    // posture: weight shifts every few seconds
    if (t > m.nextLean) { m.leanTarget = (r() * 2 - 1) * 1.6; m.nextLean = t + 5 + r() * 5; }
    m.lean += (m.leanTarget - m.lean) * Math.min(1, dt * 0.8);
    T.torsoLean += m.lean * amt;

    // brow flicks
    if (!m.brow && t > m.nextBrow) m.brow = { t0: t, side: r() < 0.5 ? 'L' : r() < 0.5 ? 'R' : 'B', a: 0.14 + r() * 0.16 };
    if (m.brow) {
      const u = (t - m.brow.t0) / 0.7;
      if (u > 1) { m.brow = null; m.nextBrow = t + 3 + r() * 4.5; }
      else { const e = Math.sin(u * Math.PI) * m.brow.a * amt; if (m.brow.side !== 'R') T.browL += e; if (m.brow.side !== 'L') T.browR += e; }
    }
    // mouth micro (small purse / press)
    if (!m.mouth && t > m.nextMouth) m.mouth = { t0: t, k: r() < 0.5 ? 'pucker' : 'lipPress' };
    if (m.mouth) {
      const u = (t - m.mouth.t0) / 0.9;
      if (u > 1) { m.mouth = null; m.nextMouth = t + 4 + r() * 6; }
      else T[m.mouth.k] += Math.sin(u * Math.PI) * 0.16 * amt;
    }
    // legs: personality tempo, occasional rests
    if (!m.legPause && t > m.nextLegPause) m.legPause = t + 1.5 + r() * 2;
    if (m.legPause && t > m.legPause) { m.legPause = 0; m.nextLegPause = t + 6 + r() * 7; }
    const lm = m.legPause ? 0.15 : 1;
    m.legMul += (lm - m.legMul) * Math.min(1, dt * 2);
    T.legSwing *= m.legMul;
    m.leg += dt * P.legRate * 2.1 * (0.85 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.13)));
    m.breath += dt * TAU * P.breathRate;
  }

  extras(t, dt, x) {
    const m = this.m;
    const mot = this.mobile ? 0.7 : 1;
    const v = this.springs.v;
    // secondary motion (2.3): hat tip and ears are damped springs pushed by the head's angular
    // velocity → follow-through and a soft settle instead of a fixed sine.
    if (!m.hat) m.hat = { a: 0, va: 0, b: 0, vb: 0 }, m.ear = { a: 0, va: 0 };
    if (dt > 0) {
      const h = Math.min(dt, 1 / 30);
      const pushA = -(v.headTilt * 0.55 + v.torsoLean * 0.9) - v.headTurn * 9 + x.shake * Math.sin(t * 24) * 4;
      const pushB = v.headNod * 7 + v.headDrop * 12 + v.squash * 6;
      const wa = 6.5, za = 0.32, wb = 8, zb = 0.4;
      m.hat.va += (wa * wa * (Math.sin(t * 1.1 + m.ph[9]) * 1.6 - m.hat.a) - 2 * za * wa * m.hat.va + pushA * 3) * h; m.hat.a += m.hat.va * h;
      m.hat.vb += (wb * wb * (0 - m.hat.b) - 2 * zb * wb * m.hat.vb + pushB * 3) * h; m.hat.b += m.hat.vb * h;
      const we = 13, ze = 0.28;
      m.ear.va += (we * we * (0 - m.ear.a) - 2 * ze * we * m.ear.va - (v.headTilt * 0.6 + v.headNod * 6 + v.squash * 8) * 4) * h; m.ear.a += m.ear.va * h;
    }
    return {
      time: t,
      blink: m.blink,
      breathV: Math.sin(m.breath) * clamp(x.breath, 0, 2),
      legPhase: m.leg,
      hatSway: clamp(m.hat.a, -16, 16),
      hatBend: clamp(m.hat.b, -10, 10),
      earSway: clamp(m.ear.a, -9, 9),
      shakeX: x.shake * Math.sin(t * 23) * 0.5 * mot,
      shakeY: x.shake * Math.sin(t * 31) * 1.5 * mot,
    };
  }

  // ---------------------------------------------------------------- events
  onBrainEvent(e) {
    if (e.type === 'fx') this.rig.spawnFx(e.kind, e.opts);
    if ((e.type === 'action' || e.type === 'personality') && this.r() < 0.35 && this.m) this.m.nextBlink = Math.min(this.m.nextBlink, this.t + 0.05);
    this.opts.onEvent && this.opts.onEvent(e);
  }

  // reduced motion: a single calm pose; reactions swap expression without animation
  renderStatic(expr) {
    if (!this.reduced) return;
    const T = this.composeBase();
    if (expr) Object.assign(T, EXPRESSIONS[expr]);
    this.springs.snap(T);
    this.rig.clearFx();
    this.out = this.rig.apply(this.springs.x, { blink: 0, breathV: 0, legPhase: 0.6, hatSway: 0, hatBend: 0, earSway: 0, shakeX: 0, shakeY: 0, time: 0 });
  }

  // ---------------------------------------------------------------- public API
  react(kind) {
    if (kind === 'hoverStart') { this.hovering = true; kind = 'hover'; }
    if (kind === 'hoverEnd') { this.hovering = false; return; }
    if (this.reduced) {
      this.renderStatic(kind === 'click' || kind === 'tap' ? 'alegria' : 'feliz');
      clearTimeout(this.rmTimer);
      this.rmTimer = setTimeout(() => this.renderStatic(), 1800);
      return;
    }
    this.brain.react(kind, this.t);
  }
  setPersonality(p) {
    if (p === 'AUTO') { this.brain.locked = null; return; }
    this.brain.force(p, this.t, { lock: true });
  }
  play(id) { this.brain.play(id, this.t); }
  expression(name, dur) { this.brain.expression(name, this.t, dur); }
  setAuto(on) { this.brain.auto = on; }
  setTimeScale(s) { this.timeScale = s; }
  // re-render the current pose once (after a resize while paused, or for reduced motion)
  redraw() {
    if (this.reduced) return this.renderStatic();
    this.out = this.rig.apply(this.springs.x, this.extras(this.t, 0, this.springs.x));
  }
  setReducedMotion(on) { this.reduced = on; if (on) this.renderStatic(); this.updateRunning(); }
  setMobile(on) { this.mobile = on; this.brain.mobile = on; this.fps = this.opts.fps ?? (on ? 30 : 60); }

  emitDebug(force) {
    if (!this.opts.onDebug) return;
    const now = performance.now();
    if (!force && now - this.lastDebug < 200) return;
    this.lastDebug = now;
    this.opts.onDebug({ ...this.brain.debug(this.t), t: this.t, frames: this.frames, running: this.running,
      reduced: this.reduced, mobile: this.mobile, visible: this.visible, hidden: this.hidden, draws: this.out && this.out.draws });
  }
}

export { ACTIONS, PERSONALITIES, EXPRESSIONS };
