// Living Christmas Elf 2.3 — hierarchical state machine (2.3: natural tap variants with anti-repeat).
//
//   Level 1  personality   CURIOUS | PLAYFUL | SLEEPY   (min dwell, weighted target shares 50/30/20)
//   Level 2  action slot   one action at a time, priority-ordered:
//              reaction (click 4 · hover/tap 3) > bridge 2 > special 1 > idle 0
//   Level 3  micro layer   blinks, gaze, breathing, posture … (engine/micro.js), always on
//
// Transitions between personalities always go through a bridge action, so the
// face and body morph naturally (e.g. CURIOUS → "readsFunny" → PLAYFUL).
import { ACTIONS, PERSONALITIES, BRIDGES, expressionAction, compile } from './actions.js';

export function rng(seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

const PRIO = { idle: 0, special: 1, expression: 1, bridge: 2, reaction: 3 };
const MIN_DWELL = 6; // seconds — a personality is never left earlier (unless forced from debug)

// tap variants: a quick reaction chosen among natural expressions
const VARIANTS = { tap: ['tapElf', 'tapCurious', 'tapWink', 'tapShy'], doubleTap: ['doubleTap', 'doubleTapConfused'] };

export class Brain {
  constructor({ seed = Date.now(), mobile = false, onEvent = () => {} } = {}) {
    this.r = rng(seed);
    this.mobile = mobile;
    this.onEvent = onEvent;
    this.p = 'CURIOUS';
    this.enteredAt = 0;
    this.dwell = this.planDwell('CURIOUS', 0);
    this.action = null;     // { def, t0, prio, firedEv:Set }
    this.fading = [];       // interrupted actions blending out: { def, tFrozen, w0, tStart }
    this.queue = [];
    this.cool = {};         // actionId -> time when allowed again
    this.nextSpecialAt = 1.2;
    this.history = [];
    this.timeIn = { CURIOUS: 0, PLAYFUL: 0, SLEEPY: 0 };
    this.lastNonCurious = [];
    this.locked = null;     // forced personality (debug)
    this.auto = true;
    this.pending = null;    // reaction waiting for a lock window to end
    this.reactCool = {};
    this.lastVariant = {};
    this.stats = { actions: {}, transitions: 0, overlaps: 0 };
  }

  // ------------------------------------------------------------ helpers
  rand(a, b) { return a + (b - a) * this.r(); }
  total() { return this.timeIn.CURIOUS + this.timeIn.PLAYFUL + this.timeIn.SLEEPY || 1; }
  share(p) { return this.timeIn[p] / this.total(); }

  planDwell(p, t) {
    const P = PERSONALITIES[p];
    let d = this.rand(P.dwell[0], P.dwell[1]);
    if (t > 30) {
      // steer the long-run distribution toward the target shares
      const err = P.share - this.share(p);
      d *= 1 + Math.max(-0.45, Math.min(0.9, err * 3));
    }
    return Math.max(MIN_DWELL, d);
  }

  canInterrupt(t) {
    if (!this.action) return true;
    const lt = t - this.action.t0;
    return !this.action.def.lock.some(([a, b]) => lt >= a && lt <= b);
  }

  start(def, t, prio) {
    if (this.action) {
      // never two actions at once: the current one is frozen and blended out
      this.fading.push({ def: this.action.def, tFrozen: t - this.action.t0, w0: this.weightOf(this.action, t), tStart: t });
    }
    this.action = { def, t0: t, prio, fired: new Set() };
    if (def.id) {
      this.history.push(def.id);
      if (this.history.length > 8) this.history.shift();
      this.stats.actions[def.id] = (this.stats.actions[def.id] || 0) + 1;
    }
    this.onEvent({ type: 'action', id: def.id || def.label, t });
  }

  weightOf(a, t) {
    const lt = t - a.t0, d = a.def;
    const wi = Math.min(1, lt / d.fadeIn), wo = Math.min(1, (d.dur - lt) / d.fadeOut);
    const w = Math.max(0, Math.min(wi, wo));
    return w * w * (3 - 2 * w);
  }

  setPersonality(p, t) {
    if (p === this.p) return;
    this.p = p;
    this.enteredAt = t;
    this.dwell = this.planDwell(p, t);
    this.stats.transitions++;
    if (p !== 'CURIOUS') { this.lastNonCurious.push(p); if (this.lastNonCurious.length > 4) this.lastNonCurious.shift(); }
    this.onEvent({ type: 'personality', p, t });
  }

  choosePersonality() {
    if (this.p !== 'CURIOUS') return 'CURIOUS';
    // from CURIOUS: PLAYFUL or SLEEPY by deficit vs target share, with randomness + anti-repetition
    const tot = this.total();
    const score = (p) => {
      const deficit = PERSONALITIES[p].share * tot - this.timeIn[p];
      let s = PERSONALITIES[p].share + deficit / Math.max(20, tot) * 2 + this.r() * 0.25;
      const ln = this.lastNonCurious;
      if (ln.length >= 2 && ln[ln.length - 1] === p && ln[ln.length - 2] === p) s -= 0.6; // no 3 in a row
      return s;
    };
    return score('PLAYFUL') >= score('SLEEPY') ? 'PLAYFUL' : 'SLEEPY';
  }

  pickSpecial(t) {
    const pool = Object.values(ACTIONS).filter((a) => a.kind === 'special' && a.p === this.p);
    const last = this.history[this.history.length - 1];
    const recent = this.history.slice(-4);
    let tot = 0;
    const cand = [];
    for (const a of pool) {
      if ((this.cool[a.id] || 0) > t) continue;
      if (a.id === last) continue;
      let w = a.w;
      if (recent.includes(a.id)) w *= 0.3;
      if (this.mobile && ['glanceVisitor', 'smileWave', 'pointCTA'].includes(a.id)) w *= 1.6; // no hover on touch: invite more often
      cand.push([a, w]); tot += w;
    }
    if (!cand.length) return null;
    let x = this.r() * tot;
    for (const [a, w] of cand) { if ((x -= w) <= 0) return a; }
    return cand[cand.length - 1][0];
  }

  // ------------------------------------------------------------ external triggers
  react(kind, t) {
    // kind: 'hover' | 'focus' | 'click' | 'tap' | 'doubleTap' | 'tripleTap' | 'longPress' | 'secret'
    if (kind === 'focus') kind = 'hover';
    const ids = { hover: this.p === 'SLEEPY' ? 'hoverSleepy' : 'hover', click: 'click', tap: 'tapElf',
      doubleTap: 'doubleTap', tripleTap: 'tripleTap', longPress: 'longPress', secret: 'secret' };
    let id = ids[kind];
    // single and double taps pick a natural variant (seeded, never the same one twice in a row)
    const pool = VARIANTS[kind];
    if (pool) {
      const last = this.lastVariant[kind];
      const opts = pool.filter((v) => v !== last);
      id = opts[Math.floor(this.r() * opts.length)];
    }
    if (!id) return false;
    const prio = kind === 'click' || kind === 'secret' ? 4 : 3;
    if ((this.reactCool[kind] || 0) > t && kind !== 'click') return false;
    // a direct touch on the elf may replace a hover reaction; nothing interrupts the secret
    if (this.action && this.action.def.kind === 'reaction' && (this.action.prio > prio || (this.action.prio === prio && kind === 'hover'))) return false;
    if (kind === 'hover' && !this.canInterrupt(t)) { this.pending = { id, prio, until: t + 1.5, kind }; return true; }
    this.fire(id, prio, t, kind);
    if (pool) this.lastVariant[kind] = id;
    return true;
  }

  fire(id, prio, t, kind) {
    const cur = this.action;
    // an interrupted bridge still completes its personality change
    if (cur && cur.def.kind === 'bridge' && !cur.fired.has('switch')) this.setPersonality(cur.def.to, t);
    this.queue.length = 0;
    this.start(ACTIONS[id], t, prio);
    this.reactCool[kind] = t + (kind === 'hover' ? 4.5 : kind === 'click' ? 1.2 : 0.4);
    this.pending = null;
  }

  force(p, t, { lock = true } = {}) {
    // debug: go to personality p (through the proper bridge when there is one)
    this.locked = lock ? p : null;
    if (p === this.p) return;
    this.queue.length = 0;
    const path = this.p !== 'CURIOUS' && p !== 'CURIOUS' ? [this.p + '>CURIOUS', 'CURIOUS>' + p] : [this.p + '>' + p];
    for (const k of path) this.queue.push({ def: ACTIONS[BRIDGES[k]], prio: 2 });
    if (this.action && this.action.prio <= 1) this.start(this.queue.shift().def, t, 2);
  }

  play(id, t) {
    // debug: run one action now (switching personality first if needed)
    const def = ACTIONS[id];
    if (!def) return;
    this.queue.length = 0;
    if (def.kind === 'special' && def.p !== this.p) {
      this.force(def.p, t, { lock: !!this.locked });
      this.queue.push({ def, prio: 1 });
      return;
    }
    this.start(def, t, def.kind === 'reaction' ? 3 : def.kind === 'bridge' ? 2 : 1);
  }

  expression(name, t, dur) {
    this.queue.length = 0;
    this.start(compile(expressionAction(name, dur)), t, 1);
  }

  // ------------------------------------------------------------ tick
  update(t, dt) {
    this.timeIn[this.p] += dt;
    // events of the running action
    if (this.action) {
      const a = this.action, lt = t - a.t0;
      a.def.ev.forEach((e, i) => {
        if (lt >= e[0] && !a.fired.has(i)) {
          a.fired.add(i);
          if (e[1] === 'switch') { a.fired.add('switch'); this.setPersonality(a.def.to, t); }
          else this.onEvent({ type: 'fx', kind: e[2], opts: e[3] || {}, t });
        }
      });
      if (lt >= a.def.dur) {
        if (a.def.kind === 'bridge' && !a.fired.has('switch')) this.setPersonality(a.def.to, t);
        this.action = null;
        if (a.def.id) this.cool[a.def.id] = t + (a.def.cd || 0);
        const g = PERSONALITIES[this.p].gap;
        this.nextSpecialAt = t + this.rand(g[0], g[1]) * (this.mobile ? 1.3 : 1);
      }
    }
    this.fading = this.fading.filter((f) => t - f.tStart < 0.4);
    // pending hover (was blocked by a lock window)
    if (this.pending) {
      if (t > this.pending.until) this.pending = null;
      else if (this.canInterrupt(t)) this.fire(this.pending.id, this.pending.prio, t, this.pending.kind);
    }
    if (this.action) return;
    if (this.queue.length) { const q = this.queue.shift(); this.start(q.def, t, q.prio); return; }
    if (!this.auto) return;
    // personality transition?
    const want = this.locked;
    if (want && want !== this.p) { this.force(want, t); return; }
    if (!want && t - this.enteredAt >= this.dwell) {
      const next = this.choosePersonality();
      const def = ACTIONS[BRIDGES[this.p + '>' + next]];
      this.start(def, t, 2);
      return;
    }
    if (t >= this.nextSpecialAt) {
      const a = this.pickSpecial(t);
      if (a) this.start(a, t, 1);
      else this.nextSpecialAt = t + 1;
    }
  }

  // Sample all active layers. Returns list of [def, localTime, weight].
  layers(t) {
    const out = [];
    for (const f of this.fading) {
      const w = f.w0 * (1 - (t - f.tStart) / 0.4);
      if (w > 0.001) out.push([f.def, f.tFrozen, w]);
    }
    if (this.action) out.push([this.action.def, t - this.action.t0, this.weightOf(this.action, t)]);
    return out;
  }

  debug(t) {
    const a = this.action;
    return {
      personality: this.p, label: PERSONALITIES[this.p].label, locked: this.locked,
      action: a ? (a.def.id || a.def.label) : '—', actionLabel: a ? a.def.label : 'leitura (micro)',
      actionKind: a ? a.def.kind : 'idle', inState: t - this.enteredAt, dwell: this.dwell,
      shares: { CURIOUS: this.share('CURIOUS'), PLAYFUL: this.share('PLAYFUL'), SLEEPY: this.share('SLEEPY') },
      stats: this.stats, fading: this.fading.length,
    };
  }
}
