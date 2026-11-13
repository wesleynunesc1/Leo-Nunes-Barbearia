// Living Christmas Elf 2.3 — the elf as a real-time 3D model (WebGL2).
// 2.3: sculpted head (cheeks, jaw, cranium), neck, deeper eyes, thicker ears with secondary
// motion, merged finger meshes (1 draw per hand), tapered limbs, brown leather boots,
// red/green hat with bend, thicker book with page groups, fabric folds/seams.
//
// Procedural geometry + hierarchical rig (rigid joints, 2-bone IK for arms,
// articulated fingers, legs, bendable hat) + facial rig (eyeballs that rotate,
// eyelid shells, brow tubes, a mouth mesh rebuilt every frame on the face surface,
// cheeks, tongue). Same channel contract as 2.1: rig.apply(c, extras).
//
// Body space units: 1 unit ≈ 200 "design units" of the 2.1 layout, so every action
// authored in 2.1 coordinates (book (100,129), mouth (100,88) …) keeps working:
//   X = (x2 − 100) · S,  Y = (170 − y2) · S   (seat = origin, Y up, Z toward the visitor)
import { M4, V, Geo, Renderer, segM, tubeInto, tubeSize } from './gl3d.js';
import { clamp, lerp } from './channels.js';

const S = 0.005;
function invert4(m) {
  const a = m, o = new Float32Array(16);
  const b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5],
    b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6], b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12],
    b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
  const det = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
  o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * det; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * det;
  o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * det; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * det;
  o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * det; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * det;
  o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * det; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * det;
  o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * det; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * det;
  o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * det; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * det;
  o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * det; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * det;
  o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * det; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * det;
  return o;
}
export const to3 = (x2, y2) => [(x2 - 100) * S, (170 - y2) * S];
const D2R = Math.PI / 180;
const srgb = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

// ------------------------------------------------------------------ palette / materials
const C = {
  skin: srgb('#f4bf9f'), skinDeep: srgb('#ee9f86'), nose: srgb('#ef8a7c'), hair: srgb('#a9461f'),
  tunic: srgb('#1f8a48'), tunic2: srgb('#16683a'), hat: srgb('#c8172a'), fur: srgb('#f4f6fa'),
  belt: srgb('#3a2215'), gold: srgb('#e8b443'), red: srgb('#d21f33'), white: srgb('#f7f4f0'),
  boot: srgb('#7b4a2b'), cover: srgb('#9e1622'), page: srgb('#f8efd8'), iris: srgb('#7a9a3a'), iris2: srgb('#3b2a12'),
  mouth: srgb('#5a1520'), lip: srgb('#c4666a'), teeth: srgb('#f4efe6'), tongue: srgb('#d45d6e'), brow: srgb('#8e4520'),
  tear: srgb('#a9e4ff'), flake: srgb('#ffffff'),
};
const MAT = {
  skin: { c1: C.skin, sss: 1, rough: 0.55, spec: 0.22, rim: 0.18, mode: 0 },
  head: { c1: C.skin, sss: 1, rough: 0.55, spec: 0.24, rim: 0.16, mode: 6 },
  nose: { c1: C.nose, sss: 0.8, rough: 0.32, spec: 0.5, rim: 0.12 },
  ear: { c1: C.skin, sss: 1, rough: 0.6, spec: 0.18, rim: 0.2 },
  earIn: { c1: srgb('#f0a091'), sss: 1, rough: 0.7, spec: 0.1, rim: 0.2 },
  hair: { c1: C.hair, rough: 0.5, spec: 0.45, rim: 0.4, mode: 3, freq: 18 },
  tunic: { c1: C.tunic, rough: 0.85, spec: 0.1, rim: 0.32, mode: 2, freq: 14, p3: [0.35, 2, 0.12, 26] },
  sleeve: { c1: C.tunic, rough: 0.85, spec: 0.1, rim: 0.32, mode: 2, freq: 8, p3: [0.22, 0, 0.12, 12] },
  hat: { c1: C.hat, rough: 0.8, spec: 0.14, rim: 0.3, mode: 2, freq: 10, p3: [0.55, 0, 0.32, 34] },
  fur: { c1: C.fur, rough: 1, spec: 0.05, rim: 0.22, mode: 3, freq: 26 },
  belt: { c1: C.belt, rough: 0.35, spec: 0.5, rim: 0.3 },
  gold: { c1: C.gold, mode: 7, rough: 0.25, rim: 0.3 },
  tights: { c1: C.red, c2: C.white, mode: 1, freq: 5, rough: 0.75, spec: 0.12, rim: 0.25 },
  boot: { c1: C.boot, mode: 10, rough: 0.4, spec: 0.45, rim: 0.28 },
  cover: { c1: C.cover, rough: 0.6, spec: 0.2, rim: 0.25, mode: 2, freq: 6, p3: [0, 0, 0.1, 0] },
  page: { c1: C.page, mode: 9, freq: 14, rough: 0.9, spec: 0.1, two: true },
  eye: { c1: C.iris, c2: C.iris2, mode: 4, p0: [0.52, 0.24, 0, 0] },
  lid: { c1: C.skin, mode: 5 },
  mouth: { c1: C.mouth, rough: 0.6, spec: 0.2, rim: 0 },
  lip: { c1: C.lip, sss: 0.8, rough: 0.42, spec: 0.3, rim: 0.1 },
  teeth: { c1: C.teeth, rough: 0.3, spec: 0.5, rim: 0 },
  tongue: { c1: C.tongue, sss: 0.6, rough: 0.35, spec: 0.5 },
  brow: { c1: C.brow, rough: 0.8, spec: 0.1, rim: 0.2, mode: 3, freq: 40 },
  tear: { c1: C.tear, rough: 0.05, spec: 1.6, rim: 1, alpha: 0.85 },
  flake: { c1: C.flake, rough: 0.2, spec: 1.2, rim: 0.8 },
  catcher: { c1: [0, 0, 0], mode: 8, alpha: 0.42 },
  piping: { c1: srgb('#c41f30'), rough: 0.7, spec: 0.18, rim: 0.3, mode: 2, freq: 30 },
  band: { c1: srgb('#1d7d43'), rough: 0.85, spec: 0.12, rim: 0.3, mode: 2, freq: 22, p3: [0, 0, 0.3, 0] },
  mouthIn: { c1: srgb('#6a1a26'), rough: 0.5, spec: 0.25, rim: 0, mode: 11 },
};

// ------------------------------------------------------------------ geometry constants (body space)
const HEAD = { r: [0.2, 0.2, 0.185] };
const NECK = [0, 0.335, 0];
const HEAD_OFF = [0, 0.21, 0.012];
const EYE_R = 0.055;
const EYE_S = [0.92, 1.14, 0.88]; // slightly tall cartoon eyeballs
const EYES = { L: [-0.067, -0.003, 0.141], R: [0.067, -0.003, 0.141] }; // socket shading (shader) gives the depth
const SHOULDER = { L: [-0.128, 0.3, 0.0], R: [0.128, 0.3, 0.0] };
const ARM = { l1: 0.107, l2: 0.104 };
const HIP = { L: [-0.058, 0.062, 0.03], R: [0.058, 0.062, 0.03] };
const THIGH = 0.175, SHIN = 0.14;
const BOOK = { w: 0.158, h: 0.218, t: 0.0105, tilt: -22 * D2R, z: 0.175 };
export const EDGE_Z = 0.07; // front edge of the button top surface (body/world z)

// sculpted head (unit space): soft cheeks, rounded chin, forehead and a fuller cranium.
// The same function builds the mesh AND places brows/mouth on it, so features never float or sink.
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function headFn(d) {
  const [x, y, z] = d;
  const front = ss(-0.25, 0.55, z);
  const cheek = Math.exp(-(((y + 0.36) / 0.3) ** 2)) * front;
  const chin = ss(-0.5, -1, y);
  const sx = 1 + 0.075 * cheek - 0.13 * chin * (0.4 + 0.6 * front) + 0.025 * ss(0.2, 0.9, y) * (1 - front);
  const sy = 1 - 0.035 * chin + 0.02 * ss(0.3, 1, y);
  const sz = 1 + 0.06 * cheek + 0.035 * Math.exp(-(((y - 0.42) / 0.28) ** 2)) * front + 0.08 * ss(0.1, -0.9, z) * ss(-0.6, 0.3, y)
    + 0.05 * Math.exp(-(((y + 0.62) / 0.22) ** 2)) * front;
  return [x * sx, y * sy, z * sz];
}
// project a face point (head-local x,y) onto the sculpted head, offset along the normal
function onFace(x, y, off) {
  const [a, b, c] = HEAD.r;
  const X = x / a, Y = y / b;
  let dx = X, dy = Y, dz = 0;
  for (let i = 0; i < 4; i++) {
    const q = dx * dx + dy * dy; if (q > 0.985) { const k = Math.sqrt(0.985 / q); dx *= k; dy *= k; }
    dz = Math.sqrt(Math.max(0.015, 1 - dx * dx - dy * dy));
    const p = headFn([dx, dy, dz]); dx += X - p[0]; dy += Y - p[1];
  }
  const d = [dx, dy, dz], p = headFn(d);
  const t1 = V.norm(V.cross(d, [0, 1, 0])), t2 = V.cross(t1, d), e = 0.004;
  const g1 = V.sub(headFn(V.norm(V.add(d, V.mul(t1, e)))), headFn(V.norm(V.sub(d, V.mul(t1, e)))));
  const g2 = V.sub(headFn(V.norm(V.add(d, V.mul(t2, e)))), headFn(V.norm(V.sub(d, V.mul(t2, e)))));
  let nu = V.norm(V.cross(g1, g2)); if (V.dot(nu, d) < 0) nu = V.mul(nu, -1);
  const n = V.norm([nu[0] / a, nu[1] / b, nu[2] / c]);
  const P = [p[0] * a, p[1] * b, p[2] * c];
  return [P[0] + n[0] * off, P[1] + n[1] * off, P[2] + n[2] * off, n];
}
// 2.1 design units on the face → head-local
const F = (X, Y) => [(X - 100) * S, (61 - Y) * S];

function bez3(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
}

export function buildRig(host, opts = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'lce-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const R = new Renderer(canvas, { shadowSize: opts.shadowSize });
  const mk = (g) => R.mesh(g);
  const G = {
    sphere: mk(Geo.sphere(36, 26)), sphereLo: mk(Geo.sphere(14, 10)), cyl: mk(Geo.cylinder(22, 4)), box: mk(Geo.box()),
    torus: mk(Geo.torus(1, 0.22, 48, 16)), torusThin: mk(Geo.torus(1, 0.12, 48, 10)), star: mk(Geo.star(5, 0.45)), flake: mk(Geo.star(6, 0.32)),
    torso: mk(Geo.lathe([[0.0, 0.0], [0.09, 0.004], [0.129, 0.026], [0.145, 0.066], [0.147, 0.118], [0.14, 0.168], [0.127, 0.214], [0.113, 0.252], [0.097, 0.284], [0.074, 0.31], [0.044, 0.33], [0.0, 0.338]], 44)),
    ear: mk(Geo.lathe([[0.0, -0.01], [0.04, -0.004], [0.047, 0.03], [0.043, 0.07], [0.033, 0.11], [0.019, 0.15], [0.007, 0.182], [0.0, 0.194]], 24)),
    head: mk(Geo.deformed(headFn, 48, 36)),
    limb: mk(Geo.cylinder(20, 6, 0.86, 0.05)), shin: mk(Geo.cylinder(20, 8, 0.8, 0.09)), sleeveT: mk(Geo.cylinder(20, 6, 0.9, 0.06)),
    hairCap: mk(Geo.lathe([[0.164, 0.06], [0.15, 0.1], [0.125, 0.14], [0.09, 0.175], [0.05, 0.195], [0.0, 0.205]], 36)),
  };
  // dynamic meshes
  const dyn = (n, seg) => { const s = tubeSize(n, seg); return mk(Geo.dynamic(s.v, s.i)); };
  const D = {
    hat: dyn(18, 28), browL: dyn(9, 10), browR: dyn(9, 10), lip: dyn(42, 8),
    handL: mk(Geo.dynamic(5 * 7 * 9, 5 * 6 * 8 * 6)), handR: mk(Geo.dynamic(5 * 7 * 9, 5 * 6 * 8 * 6)), page2: mk(Geo.dynamic(11 * 7, 10 * 6 * 6)),
    mouth: mk(Geo.dynamic(200, 66 * 15)), teeth: mk(Geo.dynamic(200, 66 * 15)), tongue: mk(Geo.dynamic(200, 66 * 15)),
    page: mk(Geo.dynamic(11 * 7, 10 * 6 * 6)),
    bootL: dyn(9, 16), bootR: dyn(9, 16),
  };
  // hair: tapered, slightly curled locks merged into ONE static mesh (head-local)
  const hairLocks = (() => {
    const defs = [];
    for (const sd of [-1, 1]) {
      // sideburn locks in front of the ears + a few behind; they hug the head and curl at the tips
      defs.push([[sd * 0.158, 0.1, 0.08], [sd * 0.182, 0.04, 0.1], [sd * 0.168, -0.022, 0.112], 0.017, sd * 0.25]);
      defs.push([[sd * 0.166, 0.1, 0.05], [sd * 0.188, 0.035, 0.068], [sd * 0.178, -0.008, 0.085], 0.015, sd * 0.4]);
      defs.push([[sd * 0.17, 0.1, 0.01], [sd * 0.193, 0.03, 0.006], [sd * 0.186, -0.02, 0.02], 0.018, sd * 0.15]);
      defs.push([[sd * 0.164, 0.1, -0.05], [sd * 0.188, 0.04, -0.07], [sd * 0.178, -0.006, -0.062], 0.017, -sd * 0.25]);
      defs.push([[sd * 0.13, 0.11, -0.11], [sd * 0.153, 0.05, -0.145], [sd * 0.143, 0.004, -0.142], 0.02, 0]);
    }
    defs.push([[0.0, 0.12, -0.15], [0.0, 0.05, -0.192], [0.025, 0.004, -0.18], 0.026, 0.3]);
    defs.push([[-0.06, 0.12, -0.14], [-0.068, 0.05, -0.182], [-0.045, 0.004, -0.172], 0.022, -0.3]);
    defs.push([[0.06, 0.12, -0.14], [0.076, 0.05, -0.182], [0.065, 0.004, -0.172], 0.022, 0.3]);
    const NP = 7, SEG = 9, ts = tubeSize(NP, SEG);
    const g = Geo.dynamic(ts.v * defs.length, ts.i * defs.length), base = { v: 0, i: 0 };
    for (const [a, b, c, r, curl] of defs) {
      const pts = [], rad = [];
      for (let i = 0; i < NP; i++) {
        const t = i / (NP - 1);
        const p = V.add(V.add(V.mul(a, (1 - t) * (1 - t)), V.mul(b, 2 * (1 - t) * t)), V.mul(c, t * t));
        p[2] += curl * 0.02 * t * t; // the tips curl
        pts.push(p); rad.push(r * Math.pow(1 - t, 0.8) * (0.85 + 0.25 * Math.sin(t * Math.PI)) + 0.0015);
      }
      tubeInto(g, pts, rad, SEG, 0.78, true, base);
    }
    g.count = base.i; g.dynamic = false;
    return mk(g);
  })();

  // FX overlay (2D, projected anchors): z, !, ?, sparkles, puffs, notes, hearts, text bubble
  const SVGNS = 'http://www.w3.org/2000/svg';
  const fxSvg = document.createElementNS(SVGNS, 'svg');
  fxSvg.setAttribute('class', 'lce-fx'); fxSvg.setAttribute('aria-hidden', 'true');
  host.appendChild(fxSvg);
  const fxPool = [];
  for (let i = 0; i < 12; i++) {
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('opacity', '0');
    g.innerHTML = `<text text-anchor="middle" font-family="'Trebuchet MS',Arial,sans-serif" font-weight="800" font-size="16" fill="#fff" stroke="#123a24" stroke-width="3" paint-order="stroke"></text>
      <path fill="#fff7c2" stroke="#e9b949" stroke-width=".8" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z"/>
      <circle r="6" fill="#ffffff" opacity=".85"/>
      <path fill="#ff5f7a" d="M0 5 C-9 -2 -6 -9 0 -4 C6 -9 9 -2 0 5Z"/>`;
    fxSvg.appendChild(g);
    fxPool.push({ g, text: g.children[0], star: g.children[1], puff: g.children[2], heart: g.children[3], busy: false });
  }
  const fxLive = [];

  // ---------------------------------------------------------------- camera / layout
  const cam = { fov: 24 * D2R, dist: 3.2, elev: 11 * D2R, target: [0.02, 0.3, 0.05], aspect: 1 / 1.2 };
  let cssW = 100, cssH = 120, dpr = 1;
  let catcher = { right: 0.3, bottom: -0.42, left: -1.2 };
  function camera() {
    const eye = [cam.target[0], cam.target[1] + Math.sin(cam.elev) * cam.dist, cam.target[2] + Math.cos(cam.elev) * cam.dist];
    const Vw = M4.lookAt(eye, cam.target, [0, 1, 0]);
    const P = M4.perspective(cam.fov, cam.aspect, 0.5, 8);
    return { eye, VP: M4.mul(P, Vw) };
  }
  const yaw = -30 * D2R;
  const ROOT = M4.Ry(yaw);
  function project(p) { // world → css px inside the canvas
    const c = camera();
    const m = c.VP, x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    return [(x / w * 0.5 + 0.5) * cssW, (1 - (y / w * 0.5 + 0.5)) * cssH];
  }
  const lightVP = (() => {
    const c = [0, 0.3, 0.05];
    const kd = R.light.keyD;
    const view = M4.lookAt(V.sub(c, V.mul(kd, 3)), c, [0, 1, 0]);
    return M4.mul(M4.ortho(-0.75, 0.75, -0.75, 0.75, 1, 6), view);
  })();

  // ---------------------------------------------------------------- per-frame build
  let list = [];
  const add = (m, M, mat, cast = true) => list.push({ m, M, mat, cast });
  const out = {};

  // fingers + thumb are tubes merged into ONE dynamic mesh per hand (2.2 used ~20 draw calls per hand)
  function hand(Mb, W, fx, fn, curl, point, side, matSkin, mesh) {
    // W wrist (body space), fx finger direction, fn palm normal; side +1 right hand, −1 left hand
    fx = V.norm(fx); fn = V.norm(V.sub(fn, V.mul(fx, V.dot(fn, fx))));
    const fs = V.cross(fn, fx);              // for a right hand the thumb sits on −fs
    const thumbSide = V.mul(fs, -side);
    const rot = (v, axis, a) => { const c = Math.cos(a), s = Math.sin(a), d = V.dot(axis, v), cr = V.cross(axis, v);
      return V.add(V.add(V.mul(v, c), V.mul(cr, s)), V.mul(axis, d * (1 - c))); };
    // palm: slightly cupped, thicker at the heel
    add(G.sphere, M4.mul(Mb, M4.basis(V.mul(fx, 0.031), V.mul(fn, 0.017), V.mul(fs, 0.028), V.add(W, V.add(V.mul(fx, 0.021), V.mul(fn, -0.002))))), matSkin);
    const g = mesh.geo, base = { v: 0, i: 0 };
    const finger = (p, d, lens, r0, bend, spread) => {
      const pts = [V.sub(p, V.mul(d, 0.012))], rad = [r0 * 0.95];
      pts.push(p); rad.push(r0);
      for (let j = 0; j < lens.length; j++) {
        const q = V.add(p, V.mul(d, lens[j]));
        pts.push(V.lerp(p, q, 0.5)); rad.push(r0 * (1 - 0.08 * (j + 0.5)) * (j === 0 ? 1.04 : 1)); // knuckle swell
        p = q; d = rot(d, fs, -bend);
      }
      const r1 = r0 * 0.82;
      pts.push(p); rad.push(r1);
      pts.push(V.add(p, V.mul(d, r1 * 0.6))); rad.push(r1 * 0.72);
      pts.push(V.add(p, V.mul(d, r1 * 0.95))); rad.push(r1 * 0.12);
      while (pts.length < 7) { pts.splice(1, 0, V.lerp(pts[0], pts[1], 0.5)); rad.splice(1, 0, r0 * 0.95); }
      tubeInto(g, pts.slice(0, 7), rad.slice(0, 7), 8, 0.86, true, base);
    };
    for (let i = 0; i < 4; i++) {
      const k = i === 0 ? curl * (1 - point) : Math.min(1, curl + point * 0.7);
      const off = (1.5 - i) * 0.0108;        // index finger nearest the thumb
      const p = V.add(V.add(W, V.mul(fx, 0.044 - Math.abs(i - 1.2) * 0.002)), V.add(V.mul(thumbSide, off), V.mul(fn, 0.002)));
      let d = rot(fx, fs, k * 1.2); d = rot(d, fs, -k * 2.25);
      d = V.norm(V.add(d, V.mul(thumbSide, (1.5 - i) * 0.06 * (1 - k))));   // relaxed fingers fan out a little
      finger(p, d, i === 3 ? [0.016, 0.012] : [0.021, 0.016], 0.0081 - (i === 3 ? 0.0008 : 0), k * 1.35);
    }
    const tb = V.add(V.add(W, V.mul(fx, 0.014)), V.add(V.mul(thumbSide, 0.024), V.mul(fn, 0.006)));
    const td = V.norm(V.add(V.add(V.mul(fx, 0.75), V.mul(thumbSide, 0.55)), V.mul(fn, 0.25 + curl * 0.5)));
    finger(tb, td, [0.019, 0.017], 0.0095, 0.5 * curl);
    g.count = base.i; R.update(mesh);
    add(mesh, Mb, matSkin);
  }

  function apply(c, x, noRender = false) {
    list = [];
    const t = x.time || 0;
    // ---------------- body
    const squash = clamp(c.squash, -1, 1);
    const sy = 1 + x.breathV * 0.012 - c.bodyY * 0.009 - x.shakeY * 0.011 - squash * 0.06;
    const sxz = 1 + x.breathV * 0.004 + squash * 0.03;
    const lean = (c.torsoLean + x.shakeX * 0.9) * D2R;
    const Mroot = ROOT;
    const Mb = M4.chain(Mroot, M4.Rz(-lean), M4.Rx(4 * D2R), M4.S(sxz, sy, sxz)); // upper body (pivot = seat)
    const shY = c.shoulders * 0.012;
    // torso & clothes
    add(G.torso, M4.mul(Mb, M4.S(1, 1, 0.84)), MAT.tunic);
    add(G.torus, M4.chain(Mb, M4.T(0, 0.033, 0.004), M4.S(0.142, 0.11, 0.122)), MAT.fur);
    add(G.torusThin, M4.chain(Mb, M4.T(0, 0.064, 0.002), M4.S(0.1465, 0.09, 0.125)), MAT.piping); // red piping
    add(G.torusThin, M4.chain(Mb, M4.T(0, 0.138, 0.0), M4.S(0.147, 0.14, 0.126)), MAT.belt);
    add(G.box, M4.chain(Mb, M4.T(0, 0.138, 0.124), M4.Rx(-6 * D2R), M4.S(0.024, 0.019, 0.005)), MAT.gold);
    add(G.box, M4.chain(Mb, M4.T(0, 0.138, 0.129), M4.Rx(-6 * D2R), M4.S(0.011, 0.008, 0.002)), MAT.belt, false);
    add(G.sphereLo, M4.chain(Mb, M4.T(0, 0.205, 0.118), M4.S(0.011, 0.011, 0.008)), MAT.gold);
    add(G.sphereLo, M4.chain(Mb, M4.T(0, 0.252, 0.098), M4.S(0.01, 0.01, 0.007)), MAT.gold);
    add(G.torus, M4.chain(Mb, M4.T(0, 0.318 + shY * 0.5, 0.0), M4.S(0.088, 0.13, 0.08)), MAT.fur);

    // ---------------- legs (sitting: thighs forward over the edge, shins hanging)
    const cr = clamp(c.legCross);
    for (const s of ['L', 'R']) {
      const sgn = s === 'L' ? -1 : 1;
      const ph = s === 'L' ? x.legPhase : x.legPhase + 2.3;
      const swing = (Math.sin(ph) * 22 * c.legSwing + c.legKick * (s === 'L' ? 34 : 22)) * D2R;
      const hip = HIP[s];
      let knee = [hip[0] + sgn * 0.012, 0.052, hip[2] + THIGH];
      let shinDir = V.norm([sgn * 0.08, -Math.cos(swing), Math.sin(swing) + 0.12]);
      if (s === 'R' && cr > 0) {
        knee = V.lerp(knee, [-0.005, 0.098, hip[2] + THIGH * 0.98], cr);
        shinDir = V.norm(V.lerp(shinDir, [-0.62, -0.72, 0.32], cr));
      }
      if (s === 'L' && cr > 0) shinDir = V.norm(V.lerp(shinDir, [-0.12, -0.98, 0.1], cr));
      const Mr = Mroot;
      add(G.limb, M4.mul(Mr, segM(hip, knee, 0.047, 0.044, [0, 1, 0])), { ...MAT.tights, freq: 4 });
      add(G.sphere, M4.mul(Mr, M4.chain(M4.T(...knee), M4.S(0.042, 0.041, 0.042))), MAT.tights);
      const ankle = V.add(knee, V.mul(shinDir, SHIN));
      add(G.shin, M4.mul(Mr, segM(knee, ankle, 0.039, 0.039, [1, 0, 0])), { ...MAT.tights, freq: 3.5 });
      // boot: curled elf toe
      const fdir = [sgn * 0.75, 0, 1], down = shinDir, fwd0 = V.norm(V.sub(fdir, V.mul(down, V.dot(fdir, down))));
      const P = (a, b) => V.add(ankle, V.add(V.mul(down, a), V.mul(fwd0, b)));
      // the curled toe lags behind the swing (follow-through) — soft leather, not a rigid block
      const lag = Math.cos(ph - 0.5) * c.legSwing * 0.012 + c.legKick * 0.006;
      const pts = [P(-0.022, 0), P(0.018, 0.0), P(0.05, 0.012), P(0.068, 0.046), P(0.066, 0.083), P(0.052 - lag * 0.4, 0.114), P(0.026 - lag, 0.133), P(0.0 - lag * 1.4, 0.128), P(-0.013 - lag * 1.6, 0.11)];
      const rad = [0.043, 0.048, 0.051, 0.047, 0.037, 0.026, 0.015, 0.009, 0.005];
      const bm = s === 'L' ? D.bootL : D.bootR;
      tubeInto(bm.geo, pts, rad, 16, 0.85); R.update(bm);
      add(bm, Mr, MAT.boot);
      add(G.torus, M4.mul(Mr, M4.mul(segM(ankle, V.add(ankle, V.mul(down, -0.01)), 1, 1, fwd0), M4.S(0.044, 1, 0.044))), MAT.fur);
      add(G.sphere, M4.mul(Mr, M4.chain(M4.T(...V.add(pts[8], V.mul(down, 0.01))), M4.S(0.016, 0.016, 0.016))), MAT.gold);
      out['ankle' + s] = ankle;
    }

    // ---------------- head
    const drop = clamp(c.headDrop);
    const jawK = clamp(c.mouthOpen) * (1 - clamp(c.lipPress) * 0.9);
    const Mneck = M4.chain(Mb, M4.T(NECK[0], NECK[1] + shY * 0.4 - drop * 0.03, NECK[2]));
    const Mh = M4.chain(Mneck, M4.Rz(-(c.headTilt - drop * 14) * D2R), M4.Ry(c.headTurn * 0.42), M4.Rx((c.headNod * 9 + drop * 26) * D2R), M4.T(...HEAD_OFF),
      // jaw: an open mouth lengthens the lower face a little (pivot at brow level) instead of sliding off the chin
      M4.T(0, 0.1, 0), M4.S(1 - jawK * 0.015, 1 + jawK * 0.05, 1 + jawK * 0.01), M4.T(0, -0.1, 0));
    add(G.head, M4.mul(Mh, M4.S(...HEAD.r)), { ...MAT.head, p0: [-0.5, -0.36, 0.72, clamp(c.blush, 0, 1.4) * 0.55], p1: [0.5, -0.36, 0.72, 0], p2: [0.36, 0, 0, 0] });
    // neck: short skin cylinder hidden by the collar, bridges head and body when the head moves
    {
      const A = M4.pt(Mb, [0, 0.29, -0.005]), B = M4.pt(Mh, [0, -0.135, -0.02]);
      add(G.limb, segM(A, B, 0.052, 0.05), MAT.skin);
    }
    // ears (thicker, with a soft lag when the head moves)
    for (const s of [-1, 1]) {
      const es = (x.earSway || 0) * (s < 0 ? 1 : 0.85);
      const Me = M4.chain(Mh, M4.T(s * 0.176, 0.004, -0.028), M4.Ry(s * 0.35), M4.Rz((-s * 58 + es) * D2R), M4.Rx(es * 0.4 * D2R), M4.S(1, 1, 0.56));
      add(G.ear, Me, MAT.ear);
      add(G.ear, M4.chain(Me, M4.T(0, 0.022, 0.026), M4.S(0.64, 0.7, 0.42)), MAT.earIn, false);
    }
    // cheeks (follow smile, puff)
    const puff = clamp(c.cheekPuff), sm = c.smile;
    for (const s of [-1, 1]) {
      const lift = Math.max(0, sm) * 0.6 + puff;
      const pos = [s * (0.098 + puff * 0.014), -0.082 + Math.max(0, sm) * 0.014, 0.1 + lift * 0.012];
      add(G.sphere, M4.chain(Mh, M4.T(...pos), M4.S(0.04 * (1 + puff * 0.35), 0.034 * (1 + puff * 0.2), 0.038 * (1 + puff * 0.3))),
        { ...MAT.head, p0: [0, 0.15, 0.95, clamp(c.blush, 0, 1.4) * 0.6 + puff * 0.3], p1: [9, 9, 9, 0], p2: [0.85, 1, 0, 0] });
    }
    // nose
    add(G.sphere, M4.chain(Mh, M4.T(0, -0.058, 0.193), M4.Rx(-0.25), M4.S(0.031, 0.027, 0.03)), MAT.nose); // small button nose
    // hair
    add(G.hairCap, M4.mul(Mh, M4.S(1.04, 1.0, 0.98)), MAT.hair);
    add(hairLocks, Mh, MAT.hair);

    // ---------------- eyes (eyeballs rotate; lids are shells driven by the shader)
    const blink = x.blink * clamp(c.blinkMask);
    const hap = clamp(c.lidHappy);
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? -1 : 1;
      const e = EYES[s];
      const wink = s === 'L' ? c.winkL : c.winkR;
      const open = clamp(c.eyeOpen - wink, 0, 1.25);
      const close = Math.max(clamp(1 - open), blink);
      const yawE = (c.lookX * 24 + (s === 'L' ? 1 : -1) * clamp(c.cross) * 26) * D2R;
      const pitchE = c.lookY * 20 * D2R;
      const ps = 0.215 * clamp(c.pupil, 0.6, 1.5);
      add(G.sphere, M4.chain(Mh, M4.T(...e), M4.S(...EYE_S), M4.Ry(yawE), M4.Rx(pitchE), M4.S(EYE_R, EYE_R, EYE_R)), { ...MAT.eye, p0: [0.47, ps, 0, 0] });
      const wide = Math.max(0, open - 1) * 1.7;
      const half = Math.PI / 2;
      const squ = clamp(c.squint + hap * 0.5);
      const e1 = lerp(half - 0.56 - wide * 1.15, half + 0.07, close) + c.lookY * 0.07; // upper lid rests on the iris top
      const e2 = lerp(half + 0.86 - squ * 0.5, half + 0.07, close) + c.lookY * 0.05;
      const curv = -0.42 * hap * (0.3 + 0.7 * close);
      const droop = clamp(close * 1.6) * (1 - clamp(close * 1.2 - 0.4)) * 0.32 * (1 - hap);
      add(G.sphere, M4.chain(Mh, M4.T(...e), M4.S(...EYE_S), M4.S(EYE_R * 1.085, EYE_R * 1.085, EYE_R * 1.085)),
        { ...MAT.lid, c1: C.skin, p0: [e1, curv, sg * droop, 0], p1: [e2, curv * 1.05, 0, 0] });
    }
    // tear
    const tr = clamp(c.tear);
    if (tr > 0.04) add(G.sphere, M4.chain(Mh, M4.T(-0.118, -0.03 - tr * 0.03, 0.15), M4.S(0.009, 0.014, 0.008)), { ...MAT.tear, alpha: Math.min(1, tr * 2) * 0.85 }, false);

    // ---------------- brows (tubes on the forehead)
    for (const s of ['L', 'R']) {
      const ecx = s === 'L' ? 86.6 : 113.4;
      const raise = s === 'L' ? c.browL : c.browR;
      const k = clamp(c.browKnit), sad = clamp(c.browSad);
      const dir = s === 'L' ? 1 : -1;
      const inX = ecx + dir * 7 - dir * k * 2.4, inY = 45.3 - raise * 8 + k * 5 - sad * 6;
      const mX = ecx - dir * 0.5, mY = 42.2 - raise * 8.5 + k * 1.2 - sad * 1;
      const outX = ecx - dir * 8.5, outY = 45.6 - raise * 6.5 + sad * 3.5;
      const pts = [], rad = [];
      for (let i = 0; i < 9; i++) {
        const tt = i / 8, u = 1 - tt;
        const X = u * u * inX + 2 * u * tt * mX + tt * tt * outX, Y = u * u * inY + 2 * u * tt * (mY - 1.5) + tt * tt * outY;
        const [hx, hy] = F(X, Y);
        const p = onFace(hx, hy, 0.0035);
        pts.push([p[0], p[1], p[2]]);
        rad.push(0.0175 * (1 - Math.pow(Math.abs(tt - 0.3) * 1.4, 2) * 0.62));
      }
      const bm = s === 'L' ? D.browL : D.browR;
      tubeInto(bm.geo, pts, rad, 10, 0.42); R.update(bm);
      add(bm, Mh, MAT.brow);
    }

    // ---------------- mouth (rebuilt on the face surface)
    const press = clamp(c.lipPress), puck = clamp(c.pucker);
    const mw = 12.5 * c.mouthW * (1 - 0.48 * puck) * (1 - 0.3 * press);
    const op = clamp(c.mouthOpen) * (1 - press * 0.9);
    const cy = 84.2;
    const cL = cy - sm * 5.2 + c.skew * 3 + puck * op * 2, cRy = cy - sm * 5.2 - c.skew * 3 + puck * op * 2;
    const up = cy + sm * 3.4 - op * (3.5 + puck * 3) - press * 0.6;
    const lo = cy + sm * 5.4 + op * (14 + puck * 3) + 0.9 - press * 0.4;
    const A0 = [100 - mw, cL], A3 = [100 + mw, cRy];
    const U1 = [100 - mw * 0.55, up], U2 = [100 + mw * 0.55, up];
    const L1 = [100 + mw * 0.6, lo], L2 = [100 - mw * 0.6, lo];
    const NS = 20;
    const upper = [], lower = [];
    for (let i = 0; i <= NS; i++) upper.push(bez3(A0, U1, U2, A3, i / NS));
    for (let i = 0; i <= NS; i++) lower.push(bez3(A3, L1, L2, A0, i / NS));
    // inner fill (fan)
    // ring-subdivided fan: every vertex is projected onto the sculpted face, so the decal hugs the
    // curved surface (a plain fan's chords sank ~2 mm into the head and the skin showed through)
    const RINGS = 3;
    const fill = (mesh, polyTop, polyBot, off) => {
      const g = mesh.geo; let vi = 0, ii = 0;
      const pts2 = [...polyTop, ...polyBot.slice(1, -1)];
      const cx2 = pts2.reduce((a, p) => a + p[0], 0) / pts2.length, cy2 = pts2.reduce((a, p) => a + p[1], 0) / pts2.length;
      const putV = (X, Y, du = 1) => { const [hx, hy] = F(X, Y); const p = onFace(hx, hy, off); g.pos.set([p[0], p[1], p[2]], vi * 3); g.nrm.set(p[3], vi * 3); g.uv.set([du, 0], vi * 2); return vi++; };
      const c0 = putV(cx2, cy2, 0);
      const n = pts2.length;
      const ring = [];
      for (let r = 1; r <= RINGS; r++) {
        const k = r / RINGS; const first = vi;
        for (const p of pts2) putV(cx2 + (p[0] - cx2) * k, cy2 + (p[1] - cy2) * k, Math.pow(k, 0.7));
        ring.push(first);
      }
      for (let i = 0; i < n; i++) { g.idx[ii++] = c0; g.idx[ii++] = ring[0] + i; g.idx[ii++] = ring[0] + ((i + 1) % n); }
      for (let r = 1; r < RINGS; r++) for (let i = 0; i < n; i++) {
        const a0 = ring[r - 1] + i, a1 = ring[r - 1] + ((i + 1) % n), b0 = ring[r] + i, b1 = ring[r] + ((i + 1) % n);
        g.idx[ii++] = a0; g.idx[ii++] = b0; g.idx[ii++] = b1; g.idx[ii++] = a0; g.idx[ii++] = b1; g.idx[ii++] = a1;
      }
      g.count = ii; R.update(mesh);
    };
    const opened = lo - up > 1.2;
    if (opened) {
      fill(D.mouth, upper, lower, 0.0008);
      add(D.mouth, Mh, MAT.mouthIn, false);
      // teeth band under the upper lip, tongue on the bottom
      const th = 2.7 * clamp(c.teeth + Math.max(0, sm) * 0.35);
      if (th > 0.3) {
        const top = upper.slice(3, NS - 2), bot = top.map((p) => [p[0], Math.min(p[1] + th, lerp(up, lo, 0.6))]).reverse();
        fill(D.teeth, top, [top[top.length - 1], ...bot, top[0]], 0.0034);
        add(D.teeth, Mh, MAT.teeth, false);
      }
      // tongue: a soft rounded mound resting on the lower lip (clamped inside the lip curve)
      const lowAt = (X) => { let best = lower[0], bd = 1e9; for (const p of lower) { const d = Math.abs(p[0] - X); if (d < bd) { bd = d; best = p; } } return best[1]; };
      const tw = mw * 0.56, tH = Math.min(3.6, (lo - up) * 0.34), tc = lo - 0.9;
      const tTop = [], tBot = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12, X = 100 - tw + 2 * tw * u, sn = Math.sin(u * Math.PI);
        const yb = Math.min(tc, lowAt(X) - 0.2);
        tTop.push([X, Math.max(up + 0.8, yb - 0.25 - (tH + 1.1) * Math.pow(sn, 0.6))]);
        tBot.push([X, yb]);
      }
      fill(D.tongue, tTop, tBot.reverse(), 0.0024);
      add(D.tongue, Mh, MAT.tongue, false);
    }
    // lips: a soft tube along the whole outline (closed mouth = smile line)
    {
      const loop = [...upper, ...lower.slice(1)];
      const pts = [], rad = [];
      const n = loop.length;
      for (let i = 0; i < n; i++) {
        const [hx, hy] = F(loop[i][0], loop[i][1]);
        const p = onFace(hx, hy, 0.0036);
        pts.push([p[0], p[1], p[2]]);
        const tt = i / (n - 1);
        const corner = Math.min(tt, Math.abs(tt - 0.5), 1 - tt) * 2; // thin at corners
        const lower = tt > 0.5 ? 1.3 : 0.85;  // thin upper lip, fuller lower lip
        rad.push((opened ? 0.0044 : 0.0039) * lower * (0.42 + 0.58 * Math.min(1, corner * 3)) * (1 + press * 0.4));
      }
      tubeInto(D.lip.geo, pts, rad, 8, 0.75); R.update(D.lip);
      add(D.lip, Mh, opened ? MAT.lip : { ...MAT.lip, c1: srgb('#b0525a') }, false);
    }
    const tgo = clamp(c.tongueOut);
    if (tgo > 0.03) {
      const [hx, hy] = F(100, lo + 1.5);
      const p = onFace(hx, hy, 0.004);
      add(G.sphere, M4.chain(Mh, M4.T(p[0], p[1] - tgo * 0.012, p[2] + tgo * 0.012), M4.Rx(0.5), M4.S(0.022, 0.028 * tgo + 0.004, 0.012)), MAT.tongue, false);
    }
    // snowflake on the nose
    if (c.flakeA > 0.04) {
      add(G.flake, M4.chain(Mh, M4.T(0, -0.032 + Math.max(0, -c.flakeY) * 0.5, 0.205 - Math.max(0, -c.flakeY) * 0.05), M4.Rz(c.flakeY * 4), M4.Rx(-0.3), M4.S(0.022, 0.022, 0.004)),
        { ...MAT.flake, alpha: clamp(c.flakeA) }, false);
    }

    // ---------------- hat (bendable cone, fur band, pompom)
    const slip = clamp(c.hatSlip), pop = clamp(c.hatPop, 0, 1.2);
    const Mhat = M4.chain(Mh, M4.T(slip * 0.01, 0.134 - slip * 0.118 + pop * 0.3 * Math.sin(Math.min(1, pop) * Math.PI) + pop * 0.0, 0.004 + slip * 0.03),
      M4.Rx((-10 - slip * 18) * D2R), M4.Rz((c.hatTilt - slip * 6 - pop * 360 * Math.min(1, pop)) * D2R));
    {
      const sw = x.hatSway * D2R;
      const pts = [], rad = [];
      const hb = (x.hatBend || 0) * 0.01; // vertical bounce of the soft tip (secondary motion)
      const P0 = [0, 0.0, 0], P1 = [0.0, 0.17, -0.02], P2 = [0.06 + sw * 0.15, 0.28 - hb * 0.5, -0.07], P3 = [0.2 + sw * 0.3 + hb * 0.2, 0.26 + sw * 0.1 - hb, -0.05];
      for (let i = 0; i < 18; i++) {
        const tt = i / 17, u = 1 - tt;
        const p = [0, 1, 2].map((k) => u * u * u * P0[k] + 3 * u * u * tt * P1[k] + 3 * u * tt * tt * P2[k] + tt * tt * tt * P3[k]);
        pts.push(p); rad.push(0.174 * Math.pow(1 - tt, 1.08) * (1 + 0.04 * Math.sin(tt * Math.PI)) + 0.012);
      }
      tubeInto(D.hat.geo, pts, rad, 28, 1); R.update(D.hat);
      add(D.hat, Mhat, MAT.hat);
      add(G.sphere, M4.chain(Mhat, M4.T(...V.add(P3, [0.02, -0.012, 0])), M4.S(0.05, 0.05, 0.05)), MAT.fur);
      add(G.torus, M4.chain(Mhat, M4.T(0, 0.012, 0), M4.S(0.188, 0.16, 0.178)), MAT.fur);
      add(G.torusThin, M4.chain(Mhat, M4.T(0, 0.046, -0.006), M4.S(0.172, 0.24, 0.163)), MAT.band); // green velvet band
      add(G.sphereLo, M4.chain(Mhat, M4.T(0, 0.016, 0.205), M4.S(0.016, 0.016, 0.016)), MAT.gold);
    }

    // ---------------- book
    const fl = clamp(c.bookFlip), bo = clamp(c.bookOpen), bs = c.bookScale;
    const [bx2, by2] = to3(c.bookX, c.bookY);
    let bx = bx2, byy = by2 - x.breathV * 0.002;
    const bz = BOOK.z + c.bookZ * S;
    const shoulders = {
      L: [SHOULDER.L[0] - c.shoulders * 0.002, SHOULDER.L[1] + shY, 0],
      R: [SHOULDER.R[0] + c.shoulders * 0.002, SHOULDER.R[1] + shY, 0],
    };
    const shift = -BOOK.w / 2 * (1 - bo);
    const rotZ = -c.bookRot * D2R;
    const bookM = () => M4.chain(M4.T(bx, byy, bz), M4.Rx(BOOK.tilt), M4.Rz(rotZ), M4.S(bs, bs, bs));
    const gripLoc = (s) => (s === 'L' ? [(-BOOK.w * bo + shift) - 0.004, 0.005, 0.0] : [BOOK.w + shift + 0.004, 0.005, 0.0]);
    // reach constraint (book never leaves the hands that hold it)
    const reach = ARM.l1 + ARM.l2 - 0.006;
    for (let it = 0; it < 3; it++) for (const s of ['L', 'R']) {
      const hold = 1 - clamp(c['h' + s + 'w'] * 2);
      if (hold <= 0) continue;
      const g = M4.pt(bookM(), gripLoc(s)); const Sh = shoulders[s];
      const d = V.len(V.sub(g, Sh));
      if (d > reach) { const k = ((d - reach) / d) * hold; bx -= (g[0] - Sh[0]) * k; byy -= (g[1] - Sh[1]) * k; }
    }
    const MB = M4.mul(Mb, bookM());
    const Minner = M4.chain(MB, M4.T(shift, 0, 0), M4.Rz(fl * Math.PI));
    const openA = lerp(172, 16, bo) * D2R; // left cover swings behind when closing
    // covers' outer edges lean toward the reader; closing folds the left cover onto the right (pages inside)
    const Mleft = M4.chain(Minner, M4.T(0, 0, -0.052 * (1 - bo)), M4.Ry(-openA));
    const Mright = M4.chain(Minner, M4.Ry(16 * D2R * bo));
    const W2 = BOOK.w / 2, H2 = BOOK.h / 2;
    for (const [Mc, sgn] of [[Mleft, -1], [Mright, 1]]) {
      add(G.box, M4.chain(Mc, M4.T(sgn * W2, 0, 0), M4.S(W2, H2, BOOK.t / 2)), MAT.cover);
      add(G.box, M4.chain(Mc, M4.T(sgn * (W2 - 0.004), 0, -0.0165), M4.S(W2 - 0.007, H2 - 0.007, 0.0115)), MAT.page); // page block (visible thickness)
      add(G.box, M4.chain(Mc, M4.T(sgn * W2, 0, BOOK.t / 2 + 0.0008), M4.S(W2 - 0.014, H2 - 0.014, 0.0006)), { ...MAT.gold, alpha: 1 }, false);
      add(G.box, M4.chain(Mc, M4.T(sgn * W2, 0, BOOK.t / 2 + 0.0014), M4.S(W2 - 0.019, H2 - 0.019, 0.0006)), MAT.cover, false);
    }
    add(G.star, M4.chain(Mright, M4.T(W2, 0.02, BOOK.t / 2 + 0.003), M4.S(0.04, 0.04, 0.004)), MAT.gold, false);
    add(G.cyl, M4.chain(Minner, M4.T(0, -H2, -0.004), M4.S(0.009, BOOK.h, 0.012)), { ...MAT.cover, c1: srgb('#6e0d16') });
    // page flip: a leading sheet and a small trailing group of pages (articulated, curling at the free edge)
    const pt = clamp(c.pageTurn);
    const sheet = (mesh, ph, lift) => {
      const g = mesh.geo; let vi = 0, ii = 0;
      const th = ph * Math.PI, NU = 10, NV = 6;
      for (let j = 0; j <= NV; j++) {
        let px = 0, pz = 0;
        const v = j / NV, lag = 0.18 * Math.sin(th) * (v - 0.5);   // the top corner leads a little
        for (let i = 0; i <= NU; i++) {
          const u = i / NU;
          if (i > 0) { const a = th + lag + Math.sin(th) * (0.9 + lift) * u * u; px += Math.cos(a) * (BOOK.w - 0.01) / NU; pz -= Math.sin(a) * (BOOK.w - 0.01) / NU; }
          g.pos.set([px, (v - 0.5) * (BOOK.h - 0.016), pz - 0.03 + lift * 0.004], vi * 3);
          g.nrm.set([Math.sin(th), 0, Math.cos(th)], vi * 3); g.uv.set([u, v], vi * 2); vi++;
        }
      }
      for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = j * (NU + 1) + i, b = a + NU + 1; g.idx.set([a, b, a + 1, b, b + 1, a + 1], ii); ii += 6; }
      g.count = ii; R.update(mesh);
      add(mesh, Minner, MAT.page);
    };
    if (pt > 0.01 && pt < 0.99 && bo > 0.5) sheet(D.page, pt, 0);
    const pt2 = clamp((pt - 0.16) / 0.84) * clamp(pt * 6);
    if (pt > 0.06 && pt2 < 0.985 && pt2 > 0.01 && bo > 0.5) sheet(D.page2, pt2, 0.25);

    const BM = bookM();
    const gripB = { L: M4.pt(BM, gripLoc('L')), R: M4.pt(BM, gripLoc('R')) };
    const bn = V.norm(M4.dir(BM, [0, 0, 1])), br = V.norm(M4.dir(BM, [1, 0, 0]));

    // ---------------- arms + hands (IK in body space, then drawn with Mb)
    for (const s of ['L', 'R']) {
      const sgn = s === 'L' ? -1 : 1;
      const w = clamp(c['h' + s + 'w']);
      const gB = gripB[s];
      const [fx2, fy2] = to3(c['h' + s + 'x'], c['h' + s + 'y']);
      // free hand depth: just in front of the face when over the head, else in front of the chest
      const hd = V.sub([fx2, fy2, 0], [0, NECK[1] + HEAD_OFF[1], 0]);
      const inHead = (hd[0] * hd[0]) / 0.05 + (hd[1] * hd[1]) / 0.05;
      const fz = inHead < 1 ? HEAD.r[2] * Math.sqrt(1 - inHead) + 0.045 : 0.13;
      const T = V.lerp(gB, [fx2, fy2, fz], w);
      const Sh = shoulders[s];
      // 2-bone IK with pole (elbow out, down, a bit back)
      const L1 = ARM.l1, L2 = ARM.l2;
      const dv = V.sub(T, Sh); const dl = Math.max(1e-4, V.len(dv)); const dn = V.mul(dv, 1 / dl);
      const d = clamp(dl, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.002);
      const a = (L1 * L1 + d * d - L2 * L2) / (2 * d);
      const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
      const pole = V.sub([sgn * 0.6, -0.55, -0.35], V.mul(dn, V.dot([sgn * 0.6, -0.55, -0.35], dn)));
      const pn = V.norm(pole);
      const E = V.add(V.add(Sh, V.mul(dn, a)), V.mul(pn, h));
      const fd = V.norm(V.sub(T, E));
      const Wr = V.add(E, V.mul(fd, Math.min(L2, V.len(V.sub(T, E)))));
      // rounded shoulder cap, tapered sleeves with a soft swell, red piping + fur cuff
      add(G.sphere, M4.mul(Mb, M4.chain(M4.T(Sh[0] + sgn * 0.004, Sh[1] - 0.004, Sh[2]), M4.S(0.05, 0.045, 0.047))), MAT.sleeve);
      add(G.sleeveT, M4.mul(Mb, segM(Sh, E, 0.039, 0.038)), MAT.sleeve);
      add(G.sphere, M4.mul(Mb, M4.chain(M4.T(...E), M4.S(0.034, 0.034, 0.034))), MAT.sleeve);
      const cuffP = V.add(Wr, V.mul(fd, -0.012));
      add(G.sleeveT, M4.mul(Mb, segM(E, cuffP, 0.034, 0.033)), MAT.sleeve);
      add(G.torusThin, M4.mul(Mb, M4.mul(segM(V.add(cuffP, V.mul(fd, -0.012)), V.add(cuffP, V.mul(fd, -0.011)), 1, 1), M4.S(0.0315, 1, 0.0315))), MAT.piping);
      add(G.torus, M4.mul(Mb, M4.mul(segM(V.add(cuffP, V.mul(fd, -0.004)), V.add(cuffP, V.mul(fd, 0.004)), 1, 1), M4.S(0.035, 1, 0.035))), MAT.fur);
      // hand frame: holding → fingers wrap the cover edge toward the visitor; free → forearm direction + palm channel
      const inward = V.mul(br, -sgn);
      const holdFx = V.norm(V.add(V.mul(bn, 0.85), V.mul(inward, 0.25)));
      const holdFn = inward;
      const pal = clamp(c['h' + s + 'palm'], -1, 1);
      const freeFn = V.norm(V.lerp([0, 0, -1], [0, 0, 1], (pal + 1) / 2));
      const fxv = V.norm(V.lerp(holdFx, fd, w));
      const fnv = V.norm(V.lerp(holdFn, freeFn, w));
      const curl = clamp(c['h' + s + 'curl']);
      hand(Mb, Wr, fxv, fnv, curl, clamp(c['h' + s + 'point']), sgn, MAT.skin, s === 'L' ? D.handL : D.handR);
      out['hand' + s] = Wr; out['grip' + s] = gB; out['elbow' + s] = E;
    }

    // ---------------- contact-shadow catchers on the real button (top surface + front face)
    const cat = catcher;
    if (!x.noCatcher) add(G.box, M4.chain(M4.T((cat.left + cat.right) / 2, -0.001, EDGE_Z - 0.07), M4.S((cat.right - cat.left) / 2, 0.0005, 0.07)),
      { ...MAT.catcher, alpha: 0.2, p0: [0, 0.07, 0.03, 0.5] }, false);
    if (!x.noCatcher) add(G.box, M4.chain(M4.T((cat.left + cat.right) / 2, cat.bottom / 2, EDGE_Z), M4.S((cat.right - cat.left) / 2, -cat.bottom / 2, 0.0005)),
      { ...MAT.catcher, alpha: 0.32, p0: [1, 0.1, EDGE_Z, 0.0] }, false);

    if (!noRender) R.render(list, camera(), lightVP);
    out.seat = M4.pt(Mb, [0, 0, 0]);
    out.draws = list.length;
    return out;
  }

  // ---------------------------------------------------------------- FX
  function spawnFx(kind, opts = {}) {
    const slot = fxPool.find((p) => !p.busy);
    if (!slot) return;
    slot.busy = true;
    const txt = { z: 'z', bang: '!', q: '?', note: '♪', text: opts.text || '' }[kind] || '';
    slot.text.textContent = txt;
    slot.text.setAttribute('font-size', kind === 'z' ? String(opts.size || 13) : kind === 'text' ? '13' : '18');
    slot.text.style.display = txt ? '' : 'none';
    slot.star.style.display = kind === 'spark' ? '' : 'none';
    slot.puff.style.display = kind === 'puff' ? '' : 'none';
    slot.heart.style.display = kind === 'heart' ? '' : 'none';
    const [X, Y] = to3(opts.x ?? 140, opts.y ?? 20);
    fxLive.push({ slot, kind, t: 0, dur: opts.dur || (kind === 'z' ? 1.8 : kind === 'puff' ? 0.55 : kind === 'text' ? 1.8 : 0.95),
      p: M4.pt(ROOT, [X, Y, 0.12]), vx: (opts.vx ?? (kind === 'z' ? 7 : 0)) * 0.6, vy: (opts.vy ?? (kind === 'z' ? -14 : -10)) * 0.6 });
  }
  function stepFx(dt) {
    for (let i = fxLive.length - 1; i >= 0; i--) {
      const a = fxLive[i];
      a.t += dt;
      const u = a.t / a.dur;
      if (u >= 1) { a.slot.busy = false; a.slot.g.setAttribute('opacity', '0'); fxLive.splice(i, 1); continue; }
      const [px, py] = project(a.p);
      const x = px + a.vx * a.t + (a.kind === 'z' ? Math.sin(a.t * 4) * 2.5 : 0), y = py + a.vy * a.t;
      let sc = 1, op = 1;
      if (a.kind === 'bang' || a.kind === 'q') { sc = u < 0.2 ? 0.4 + u * 3.5 : 1.1 - (u - 0.2) * 0.1; op = u > 0.75 ? (1 - u) * 4 : 1; }
      else if (a.kind === 'spark') { sc = Math.sin(u * Math.PI) * 1.1; }
      else if (a.kind === 'puff') { sc = 0.4 + u * 1.4; op = (1 - u) * 0.9; }
      else { sc = 0.6 + u * 0.6; op = u < 0.15 ? u / 0.15 : (1 - u) / 0.85; }
      a.slot.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(2)})`);
      a.slot.g.setAttribute('opacity', clamp(op).toFixed(2));
    }
  }
  function clearFx() { for (const a of fxLive) { a.slot.busy = false; a.slot.g.setAttribute('opacity', '0'); } fxLive.length = 0; }

  // ---------------------------------------------------------------- layout
  // w,h: canvas css size; returns the css position (inside the canvas) of the seat edge point
  function setSize(w, h, ratio) {
    cssW = w; cssH = h; dpr = ratio;
    R.resize(w, h, ratio);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    fxSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    fxSvg.style.width = w + 'px'; fxSvg.style.height = h + 'px';
    return project(M4.pt(ROOT, [0, 0, EDGE_Z]));
  }
  // css pixel → world point on the plane z = zp (ray cast through the camera)
  function unproject(px, py, zp) {
    const c = camera();
    const inv = invert4(c.VP);
    const nx = (px / cssW) * 2 - 1, ny = 1 - (py / cssH) * 2;
    const a = M4.pt(inv, [nx, ny, -1]), aw = inv[3] * nx + inv[7] * ny + inv[11] * -1 + inv[15];
    const b = M4.pt(inv, [nx, ny, 1]), bw = inv[3] * nx + inv[7] * ny + inv[11] + inv[15];
    const A = V.mul(a, 1 / aw), B = V.mul(b, 1 / bw);
    const t = (zp - A[2]) / (B[2] - A[2]);
    return V.lerp(A, B, t);
  }
  // button rect in canvas css px → shadow catchers that exactly cover the real button
  function setCatcher(left, top, right, bottom) {
    const a = unproject(left, top, EDGE_Z), b = unproject(right, bottom, EDGE_Z);
    catcher = { left: a[0], right: b[0], bottom: b[1] };
  }
  const seatCss = () => project(M4.pt(ROOT, [0, 0, EDGE_Z]));
  // head bounding box as fractions of the canvas (for tests / tooling)
  function headBox() {
    const c = project(M4.pt(ROOT, [0, 0.55, 0.17])), r = Math.abs(project(M4.pt(ROOT, [0, 0.76, 0.17]))[1] - c[1]);
    return [(c[0] - r) / cssW, (c[1] - r) / cssH, (c[0] + r) / cssW, (c[1] + r) / cssH];
  }
  // the head/torso hit circle (css px, relative to canvas)
  function hitCircle() {
    const head = project(M4.pt(ROOT, [0, 0.52, 0.05])), seat = project(M4.pt(ROOT, [0, 0.0, 0.05]));
    const d = Math.abs(seat[1] - head[1]);
    return { x: head[0], y: (head[1] + seat[1]) / 2 - 6, r: d * 0.5 }; // bottom stays above the seat line
  }

  return { canvas, fxSvg, apply, spawnFx, stepFx, clearFx, setSize, setCatcher, hitCircle, project, unproject, seatCss, headBox, gl: R.gl, shadowSize: R.SM,
    destroy() { try { R.dispose(); } catch (e) { /* context already lost */ } canvas.remove(); fxSvg.remove(); const ext = R.gl.getExtension('WEBGL_lose_context'); ext && ext.loseContext(); } };
}
