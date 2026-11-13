// Living Christmas Elf 2.3 — animation channels.
// Every visible degree of freedom of the elf is one numeric channel.
// Layers (personality base → micro → action → reaction) write target values;
// a critically-damped spring per channel turns targets into smooth motion.

// [default, spring frequency (rad/s)] — higher = snappier.
export const CHANNELS = {
  // head
  headTilt: [-3, 9], headTurn: [0, 9], headNod: [0.25, 9], headDrop: [0, 6],
  // body
  torsoLean: [0, 6], bodyY: [0, 7], shoulders: [0, 9], breath: [1, 4], shake: [0, 30],
  // eyes
  eyeOpen: [1, 26], winkL: [0, 26], winkR: [0, 26], squint: [0.1, 16], lidHappy: [0, 14],
  lookX: [0, 22], lookY: [0.55, 22], cross: [0, 12], pupil: [1, 12], blinkMask: [1, 30],
  // brows
  browL: [0.05, 13], browR: [0.05, 13], browKnit: [0, 12], browSad: [0, 12],
  // mouth & cheeks
  smile: [0.18, 12], mouthOpen: [0, 16], mouthW: [1, 12], pucker: [0, 12], skew: [0, 10],
  teeth: [0, 14], tongueOut: [0, 12], lipPress: [0, 14], cheekPuff: [0, 12], blush: [0.35, 4],
  tear: [0, 6],
  // hat
  hatSlip: [0, 10], hatTilt: [0, 8],
  // book (body space)
  bookX: [100, 9], bookY: [129, 9], bookRot: [0, 9], bookScale: [1, 9], bookFlip: [0, 10],
  bookOpen: [1, 10], pageTurn: [0, 14],
  // hands: w = detach from book (0 holds book, 1 free at x/y)
  hLw: [0, 10], hLx: [70, 12], hLy: [130, 12], hLpoint: [0, 12],
  hRw: [0, 10], hRx: [130, 12], hRy: [130, 12], hRpoint: [0, 12],
  // fingers: curl 0 open … 1 fist (holding the book ≈ .85); palm −1 toward the body … +1 toward the visitor
  hLcurl: [0.85, 14], hRcurl: [0.85, 14], hLpalm: [-1, 10], hRpalm: [-1, 10],
  bookZ: [0, 9],
  // legs
  legSwing: [0.6, 3], legCross: [0, 7], legKick: [0, 14],
  // props
  flakeY: [-1, 7], flakeA: [0, 12], hatPop: [0, 9], squash: [0, 16],
  // behaviour weights
  read: [1, 5], micro: [1, 3],
};

export const NAMES = Object.keys(CHANNELS);

// 2.3 — damping ratio per channel (1 = critically damped, < 1 = overshoot / follow-through).
// Different joints get different curves: the head settles a bit loosely, hands and book carry
// a small overshoot, the face stays crisp (no wobbly eyelids), squash/kick bounce.
export const ZETA = {
  headTilt: 0.62, headTurn: 0.7, headNod: 0.66, headDrop: 0.8, torsoLean: 0.55, shoulders: 0.6, bodyY: 0.7,
  bookX: 0.72, bookY: 0.7, bookRot: 0.66, bookZ: 0.75, hLx: 0.74, hLy: 0.72, hRx: 0.74, hRy: 0.72,
  legKick: 0.42, legCross: 0.78, hatTilt: 0.5, hatSlip: 0.72, squash: 0.35, cheekPuff: 0.72, hatPop: 0.85,
  browL: 0.86, browR: 0.86, browKnit: 0.9, smile: 0.88, mouthOpen: 0.86,
};

export function defaults() {
  const o = {};
  for (const k of NAMES) o[k] = CHANNELS[k][0];
  return o;
}

// Spring state for all channels.
export class SpringBank {
  constructor(initial) {
    this.x = { ...initial };
    this.v = {};
    for (const k of NAMES) this.v[k] = 0;
  }
  snap(target) {
    for (const k of NAMES) { this.x[k] = target[k]; this.v[k] = 0; }
  }
  step(target, dt) {
    // sub-step for stability with stiff channels
    const n = dt > 1 / 45 ? 2 : 1;
    const h = dt / n;
    for (const k of NAMES) {
      const w = CHANNELS[k][1], z = ZETA[k] ?? 1;
      let x = this.x[k], v = this.v[k];
      const t = target[k];
      for (let i = 0; i < n; i++) {
        const a = w * w * (t - x) - 2 * z * w * v;
        v += a * h;
        x += v * h;
      }
      this.x[k] = x; this.v[k] = v;
    }
    return this.x;
  }
}

export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
