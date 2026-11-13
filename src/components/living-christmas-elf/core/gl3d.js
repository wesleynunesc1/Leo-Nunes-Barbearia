// Living Christmas Elf 2.3 — tiny real-time 3D engine (WebGL2, no libraries).
// mat4 math (column-major), procedural geometry, one uber-shader with
// wrap/subsurface skin, Blinn specular, fresnel rim, hemisphere ambient,
// soft PCF shadow map and transparent "shadow catcher" planes (contact
// shadows that darken the real HTML button underneath the canvas).

// ------------------------------------------------------------------ math
export const M4 = {
  ident() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  mul(a, b, o = new Float32Array(16)) {
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  },
  T(x, y, z) { const m = M4.ident(); m[12] = x; m[13] = y; m[14] = z; return m; },
  S(x, y, z) { const m = M4.ident(); m[0] = x; m[5] = y; m[10] = z; return m; },
  Rx(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; },
  Ry(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; },
  Rz(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; },
  chain(...ms) { let r = ms[0]; for (let i = 1; i < ms.length; i++) r = M4.mul(r, ms[i]); return r; },
  // matrix whose columns are basis vectors x,y,z and translation p
  basis(x, y, z, p) { const m = M4.ident(); m.set([...x, 0, ...y, 0, ...z, 0, ...p, 1]); return m; },
  perspective(fovy, asp, n, f) {
    const t = 1 / Math.tan(fovy / 2), m = new Float32Array(16);
    m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = (2 * f * n) / (n - f); return m;
  },
  ortho(l, r, b, t, n, f) {
    const m = M4.ident();
    m[0] = 2 / (r - l); m[5] = 2 / (t - b); m[10] = -2 / (f - n);
    m[12] = -(r + l) / (r - l); m[13] = -(t + b) / (t - b); m[14] = -(f + n) / (f - n); return m;
  },
  lookAt(e, c, up) {
    const z = V.norm(V.sub(e, c)), x = V.norm(V.cross(up, z)), y = V.cross(z, x);
    const m = M4.ident();
    m.set([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -V.dot(x, e), -V.dot(y, e), -V.dot(z, e), 1]);
    return m;
  },
  pt(m, p) { return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]]; },
  dir(m, p) { return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2], m[1] * p[0] + m[5] * p[1] + m[9] * p[2], m[2] * p[0] + m[6] * p[1] + m[10] * p[2]]; },
  // inverse-transpose of upper 3x3 (normal matrix)
  nrm(m) {
    const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    const det = a * A + b * B + c * C || 1e-9;
    const o = new Float32Array(9);
    o[0] = A / det; o[1] = B / det; o[2] = C / det;
    o[3] = -(b * i - c * h) / det; o[4] = (a * i - c * g) / det; o[5] = -(a * h - b * g) / det;
    o[6] = (b * f - c * e) / det; o[7] = -(a * f - c * d) / det; o[8] = (a * e - b * d) / det;
    return o;
  },
};
export const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};

// matrix that maps the unit Y-axis segment [0,1] onto A→B with radius r (for limbs)
export function segM(A, B, rx, rz = rx, roll = [0, 0, 1]) {
  const y = V.sub(B, A);
  const L = V.len(y) || 1e-6;
  const yn = V.mul(y, 1 / L);
  let x = V.cross(yn, roll);
  if (V.len(x) < 1e-4) x = V.cross(yn, [1, 0, 0]);
  x = V.norm(x);
  const z = V.cross(x, yn);
  return M4.basis(V.mul(x, rx), V.mul(yn, L), V.mul(z, rz), A);
}

// ------------------------------------------------------------------ geometry
function pack(pos, nrm, uv, idx) {
  return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), uv: new Float32Array(uv), idx: new Uint16Array(idx) };
}
export const Geo = {
  sphere(su = 32, sv = 22) {
    const pos = [], nrm = [], uv = [], idx = [];
    for (let j = 0; j <= sv; j++) {
      const v = j / sv, th = v * Math.PI;
      for (let i = 0; i <= su; i++) {
        const u = i / su, ph = u * Math.PI * 2;
        const x = Math.sin(th) * Math.sin(ph), y = Math.cos(th), z = Math.sin(th) * Math.cos(ph);
        pos.push(x, y, z); nrm.push(x, y, z); uv.push(u, v);
      }
    }
    for (let j = 0; j < sv; j++) for (let i = 0; i < su; i++) {
      const a = j * (su + 1) + i, b = a + su + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return pack(pos, nrm, uv, idx);
  },
  // open cylinder along +Y from 0..1, radius 1
  // top < 1 → tapered limb (radius 1 at y=0, `top` at y=1), bulge > 0 → soft muscle/fabric swell mid-length
  cylinder(su = 20, sv = 6, top = 1, bulge = 0) {
    const pos = [], nrm = [], uv = [], idx = [];
    for (let j = 0; j <= sv; j++) for (let i = 0; i <= su; i++) {
      const v = j / sv, a = (i / su) * Math.PI * 2, x = Math.sin(a), z = Math.cos(a);
      const r = 1 + (top - 1) * v + bulge * Math.sin(v * Math.PI), dr = (top - 1) + bulge * Math.PI * Math.cos(v * Math.PI);
      const nl = Math.hypot(1, dr);
      pos.push(x * r, v, z * r); nrm.push(x / nl, -dr / nl, z / nl); uv.push(i / su, v);
    }
    for (let j = 0; j < sv; j++) for (let i = 0; i < su; i++) {
      const a = j * (su + 1) + i, b = a + su + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    return pack(pos, nrm, uv, idx);
  },
  torus(R = 1, r = 0.25, sR = 40, sr = 14) {
    const pos = [], nrm = [], uv = [], idx = [];
    for (let j = 0; j <= sR; j++) {
      const a = (j / sR) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      for (let i = 0; i <= sr; i++) {
        const b = (i / sr) * Math.PI * 2, cb = Math.cos(b), sb = Math.sin(b);
        pos.push((R + r * cb) * ca, r * sb, (R + r * cb) * sa); nrm.push(cb * ca, sb, cb * sa); uv.push(j / sR, i / sr);
      }
    }
    for (let j = 0; j < sR; j++) for (let i = 0; i < sr; i++) {
      const a = j * (sr + 1) + i, b = a + sr + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return pack(pos, nrm, uv, idx);
  },
  // surface of revolution around Y; prof = [[r, y], ...] bottom→top
  lathe(prof, su = 36) {
    const pos = [], nrm = [], uv = [], idx = [];
    const n = prof.length;
    for (let j = 0; j < n; j++) {
      const [r, y] = prof[j];
      const p0 = prof[Math.max(0, j - 1)], p1 = prof[Math.min(n - 1, j + 1)];
      const dr = p1[0] - p0[0], dy = p1[1] - p0[1];
      const nl = Math.hypot(dr, dy) || 1;
      const nr = dy / nl, ny = -dr / nl;
      for (let i = 0; i <= su; i++) {
        const a = (i / su) * Math.PI * 2, x = Math.sin(a), z = Math.cos(a);
        pos.push(r * x, y, r * z); nrm.push(nr * x, ny, nr * z); uv.push(i / su, j / (n - 1));
      }
    }
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < su; i++) {
      const a = j * (su + 1) + i, b = a + su + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    return pack(pos, nrm, uv, idx);
  },
  box() {
    const pos = [], nrm = [], uv = [], idx = [];
    const F = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 1, 0], [0, 0, -1]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
      [[0, -1, 0], [0, 0, -1], [1, 0, 0]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]]];
    F.forEach(([n, u, v], k) => {
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        pos.push(n[0] + u[0] * a + v[0] * b, n[1] + u[1] * a + v[1] * b, n[2] + u[2] * a + v[2] * b);
        nrm.push(...n); uv.push((b + 1) / 2, (a + 1) / 2);
      }
      const o = k * 4; idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
    });
    return pack(pos, nrm, uv, idx);
  },
  // sculpted closed surface: fn(unitDir) → point. Normals from the analytic parametrisation (no seams)
  deformed(fn, su = 40, sv = 30) {
    const pos = [], nrm = [], uv = [], idx = [];
    const P = (th, ph) => fn([Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph)]);
    const e = 1e-3;
    for (let j = 0; j <= sv; j++) {
      const v = j / sv, th = Math.min(Math.PI - 1e-3, Math.max(1e-3, v * Math.PI));
      for (let i = 0; i <= su; i++) {
        const u = i / su, ph = u * Math.PI * 2;
        const p = P(th, ph);
        const dt = V.sub(P(th + e, ph), P(th - e, ph)), dp = V.sub(P(th, ph + e), P(th, ph - e));
        let n = V.norm(V.cross(dp, dt));
        if (V.dot(n, p) < 0) n = V.mul(n, -1);
        pos.push(...p); nrm.push(...n); uv.push(u, v);
      }
    }
    for (let j = 0; j < sv; j++) for (let i = 0; i < su; i++) {
      const a = j * (su + 1) + i, b = a + su + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return pack(pos, nrm, uv, idx);
  },
  // flat star prism (z thickness 1), points in xy unit radius
  star(nPts = 5, inner = 0.45) {
    const pos = [], nrm = [], uv = [], idx = [];
    const ring = [];
    for (let i = 0; i < nPts * 2; i++) {
      const a = (i / (nPts * 2)) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? inner : 1;
      ring.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    for (const z of [0.5, -0.5]) {
      const o = pos.length / 3;
      pos.push(0, 0, z); nrm.push(0, 0, Math.sign(z)); uv.push(0.5, 0.5);
      ring.forEach(([x, y]) => { pos.push(x, y, z); nrm.push(x * 0.35, y * 0.35, Math.sign(z)); uv.push(x, y); });
      for (let i = 0; i < ring.length; i++) idx.push(o, o + 1 + i, o + 1 + ((i + 1) % ring.length));
    }
    return pack(pos, nrm, uv, idx);
  },
  // rectangular grid (dynamic: page flip, mouth, brows...) — allocate with n verts
  dynamic(nVerts, nIdx) {
    return { pos: new Float32Array(nVerts * 3), nrm: new Float32Array(nVerts * 3), uv: new Float32Array(nVerts * 2), idx: new Uint16Array(nIdx), dynamic: true };
  },
};

// tube along a polyline with per-point radius; writes into geo (pre-allocated with Geo.dynamic)
export function tubeInto(geo, pts, radii, seg, flat = 1, cap = true, base = null) {
  const n = pts.length;
  const v0 = base ? base.v : 0;
  let pi = v0 * 3, ui = v0 * 2, ii = base ? base.i : 0, vi = v0;
  let prevN = null;
  const frames = [];
  for (let k = 0; k < n; k++) {
    const t = V.norm(V.sub(pts[Math.min(n - 1, k + 1)], pts[Math.max(0, k - 1)]));
    let nn = prevN ? V.sub(prevN, V.mul(t, V.dot(prevN, t))) : V.cross(t, Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]);
    nn = V.norm(nn);
    prevN = nn;
    frames.push([t, nn, V.cross(t, nn)]);
  }
  for (let k = 0; k < n; k++) {
    const [, nn, bb] = frames[k], p = pts[k], r = radii[k];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a) * flat;
      const d = V.add(V.mul(nn, ca), V.mul(bb, sa));
      const dn = V.norm(V.add(V.mul(nn, ca), V.mul(bb, Math.sin(a) / flat)));
      geo.pos[pi] = p[0] + d[0] * r; geo.pos[pi + 1] = p[1] + d[1] * r; geo.pos[pi + 2] = p[2] + d[2] * r;
      geo.nrm[pi] = dn[0]; geo.nrm[pi + 1] = dn[1]; geo.nrm[pi + 2] = dn[2];
      geo.uv[ui] = i / seg; geo.uv[ui + 1] = k / (n - 1);
      pi += 3; ui += 2; vi++;
    }
  }
  for (let k = 0; k < n - 1; k++) for (let i = 0; i < seg; i++) {
    const a = v0 + k * (seg + 1) + i, b = a + seg + 1;
    geo.idx[ii++] = a; geo.idx[ii++] = b; geo.idx[ii++] = a + 1; geo.idx[ii++] = b; geo.idx[ii++] = b + 1; geo.idx[ii++] = a + 1;
  }
  geo.count = ii;
  if (base) { base.v = vi; base.i = ii; }
  return geo;
}
export const tubeSize = (n, seg) => ({ v: n * (seg + 1), i: (n - 1) * seg * 6 });

// ------------------------------------------------------------------ shaders
const VS = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNrm; layout(location=2) in vec2 aUV;
uniform mat4 uM, uVP, uLVP; uniform mat3 uN;
out vec3 vW; out vec3 vN; out vec2 vUV; out vec3 vL; out vec4 vS;
void main(){ vec4 w = uM*vec4(aPos,1.); vW=w.xyz; vN=uN*aNrm; vUV=aUV; vL=aPos; vS=uLVP*w; gl_Position=uVP*w; }`;

const FS = `#version 300 es
precision highp float; precision highp sampler2DShadow;
in vec3 vW; in vec3 vN; in vec2 vUV; in vec3 vL; in vec4 vS;
uniform vec3 uCam, uC1, uC2; uniform float uTwo; uniform float uRough, uSpec, uSSS, uRim, uAlpha, uFreq, uAO;
uniform int uMode; uniform vec4 uP0, uP1, uP2, uP3;
uniform sampler2DShadow uSh; uniform float uShTexel;
uniform vec3 uKeyD, uKeyC, uFillD, uFillC, uRimD, uRimC, uSky, uGnd;
out vec4 frag;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float nz(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
vec3 L(vec3 c){ return pow(c, vec3(2.2)); }
// derivative bump mapping (no tangents needed): folds, seams, weave, leather grain
vec3 bump(vec3 N, float h){
  vec3 dpx = dFdx(vW), dpy = dFdy(vW); float hx = dFdx(h), hy = dFdy(h);
  vec3 r1 = cross(dpy, N), r2 = cross(N, dpx); float det = dot(dpx, r1);
  if(abs(det) < 1e-12) return N;
  vec3 g = sign(det) * (hx*r1 + hy*r2);
  return normalize(abs(det)*N - g);
}
float shadow(){ vec3 p = vS.xyz/vS.w*.5+.5; if(p.x<0.||p.x>1.||p.y<0.||p.y>1.||p.z>1.) return 1.;
  float s=0.; for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++) s+=texture(uSh, vec3(p.xy+vec2(i,j)*uShTexel*2.4, p.z-0.0015));
  return s/9.; }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14), 0., 1.); }
void main(){
  vec3 N = normalize(vN); if(uTwo>0.5 && !gl_FrontFacing) N=-N;
  vec3 Vv = normalize(uCam - vW);
  vec3 base = L(uC1); float rough=uRough, spec=uSpec, sss=uSSS; vec3 specC = vec3(1.); float eyeGlint = 0., ao = 1., sheen = 0.;
  if(uMode==8){ float sh = shadow(); float a = (1.-sh)*uAlpha; if(uP0.x > .5) a *= exp(vW.y*5.5);
    float b = uP0.w>0. ? exp(-dot((vW.xz-uP0.xz)/uP0.y,(vW.xz-uP0.xz)/uP0.y))*uP0.w : 0.;
    a = clamp(a + b*(1.-a), 0., 1.); frag = vec4(0.,0.,0.,a); return; }
  if(uMode==1){ // knitted striped tights
    float s = smoothstep(.42,.5,fract(vUV.y*uFreq)) - smoothstep(.92,1.,fract(vUV.y*uFreq));
    base = mix(L(uC1), L(uC2), s);
    float knit = abs(sin(vUV.x*120.))*.5 + abs(sin(vUV.y*uFreq*14.))*.5;
    N = bump(N, knit*.0006); base *= .9 + .1*knit; rough = .8; }
  else if(uMode==2){ // matte fabric: weave + soft folds + discreet seams (uP3 = foldAmp, seams, sheen, foldFreq)
    float wv = sin(vUV.x*uFreq*40.)*sin(vUV.y*uFreq*40.);
    float folds = sin(vUV.y*(uP3.w>0.?uP3.w:9.) + nz(vUV*vec2(6.,3.))*3.) * uP3.x;
    float seam = uP3.y > 0. ? -exp(-pow((fract(vUV.x*uP3.y)-.5)*40.,2.))*.0012 : 0.;
    N = bump(N, folds*.004 + seam);   // weave stays in colour only (no aliasing at small sizes)
    float n = nz(vUV*vec2(uFreq*2.,uFreq))*.6 + nz(vUV*uFreq*5.)*.4;
    base *= (.9 + .12*n) * (1. + wv*.025) * (1. + seam*60.); rough = .88; spec = min(spec,.15); sheen = uP3.z; }
  else if(uMode==3){ // soft fur / pompom / hair: object-space fluff (no UV stretching), bright fuzzy edge
    float f = uFreq*.35; vec3 q = vL*f;
    float n = nz(q.xy)*.4 + nz(q.yz+7.)*.35 + nz(q.zx*2.3+3.)*.25;
    N = bump(N, n*.0011);
    base *= .84 + .2*n; rough = 1.; spec = .04; sheen = .5; }
  else if(uMode==4){ // eyeball: iris fibres, pupil, limbal ring, wet cornea, lid shadow
    vec3 p = normalize(vL); float d = acos(clamp(p.z,-1.,1.));
    float ir = uP0.x, pr = uP0.y; float ang = atan(p.y,p.x);
    vec3 sclera = L(vec3(.97,.96,.95)) * mix(1., .8, smoothstep(.9,1.8,d));
    float fib = .78 + .3*nz(vec2(ang*9., d*26.)) + .12*sin(ang*38.);
    vec3 irisC = mix(L(uC1)*1.35, L(uC2), smoothstep(pr, ir, d)) * fib;
    vec3 c = mix(sclera, irisC, 1.-smoothstep(ir-.025, ir+.01, d));
    c = mix(c, L(vec3(.03,.02,.015)), 1.-smoothstep(pr-.02, pr+.012, d));
    c *= mix(1., .5, smoothstep(ir-.08, ir, d) * (1.-smoothstep(ir, ir+.02, d)));
    c *= mix(1., .62, smoothstep(.15, .75, N.y));          // soft shadow of the upper lid
    base = c; rough = .06; spec = 1.2; sss = 0.;
    vec3 Lc = normalize(vec3(-.35,.55,1.)); float cl = pow(max(0.,dot(N, normalize(Lc+Vv))), 900.);
    eyeGlint = cl*2.2 + pow(max(0.,dot(N, normalize(normalize(vec3(.55,-.15,1.))+Vv))), 1600.)*.7; }
  else if(uMode==5){ // eyelids: uP0 = (upperEdge, curve, tilt), uP1 = lower
    vec3 p = normalize(vL); float ang = acos(clamp(p.y,-1.,1.));
    float x = p.x; float bow = 1.-x*x*1.6;
    float e1 = uP0.x + uP0.y*bow + uP0.z*x; float e2 = uP1.x + uP1.y*bow + uP1.z*x;
    bool up = ang < e1, lo = ang > e2;
    if(!(up||lo) || p.z < -.35) discard;
    base = L(uC1) * (up ? .95 : .98);
    if(up) base *= 1. - .12*smoothstep(.32,.12,e1-ang)*step(.12,e1-ang);   // lid crease shading
    if(up && e1-ang < .1 && p.z>-.1) { base = mix(L(vec3(.13,.07,.05)), base, smoothstep(.06,.1,e1-ang)); rough=.6; }
    if(lo && ang-e2 < .04 && p.z>-.1) base *= .8;
    sss = .9; }
  else if(uMode==6){ // skin (unit sphere): tone variation, blush, freckles, eye-socket + hat-band occlusion
    vec3 p = vL; float wd = uP2.x > 0. ? uP2.x : .36;
    float tone = nz(p.xy*5.+p.z*3.); base *= mix(vec3(.97,1.,1.02), vec3(1.03,.99,.97), tone);
    float b = exp(-dot((p-uP0.xyz)/wd,(p-uP0.xyz)/wd)) + exp(-dot((p-uP1.xyz)/wd,(p-uP1.xyz)/wd));
    base = mix(base, L(vec3(.96,.5,.5)), clamp(b*uP0.w,0.,.55));
    if(uP2.y < .5){
      vec2 fq = p.xy*21.; float fr = step(.82, h21(floor(fq))) * (1.-smoothstep(.12,.3,length(fq-floor(fq)-.5)));
      float zone = exp(-pow((abs(p.x)-.34)/.17,2.)-pow((p.y+.26)/.13,2.)) * step(.35,p.z);
      base = mix(base, L(vec3(.8,.48,.36)), fr*zone*.45);
      float sock = exp(-pow((abs(p.x)-.34)/.2,2.)-pow((p.y-.02)/.2,2.)) * step(.3,p.z);
      ao *= 1. - .22*sock;                                  // eye sockets give the eyes depth
      ao *= 1. - .35*smoothstep(.45,.75,p.y);              // under the hat band
      base = mix(base, base*vec3(1.04,.9,.88), smoothstep(-.2,-.7,p.y)*.35); } }
  else if(uMode==7){ specC = L(uC1)*1.4; spec = 1.5; rough=.28; N = bump(N, nz(vUV*60.)*.0004); }
  else if(uMode==9){ // paper: text lines + page-edge stack
    float ln = step(.5, fract(vUV.y*uFreq)) * step(.12, vUV.x) * step(vUV.x, .88) * step(.08,vUV.y)*step(vUV.y,.92);
    float edge = .5+.5*sin(vUV.y*900.);
    base *= 1. - ln*.06 - edge*.035; rough=.9; spec=.08; }
  else if(uMode==10){ // stylised brown leather: grain, darker sole, stitch line, soft sheen
    float g = nz(vUV*vec2(40.,16.))*.6 + nz(vUV*vec2(110.,40.))*.4;
    N = bump(N, g*.00035);
    float sole = smoothstep(-.35,-.6, N.y);
    base = mix(base*(.86+.2*g), L(vec3(.18,.1,.06)), sole);
    float st = smoothstep(.025,0.,abs(N.y+.3)) * step(.5, fract(vUV.y*46.));
    base = mix(base, L(vec3(.85,.7,.48)), st*.7);
    rough = mix(.42,.8,sole); spec = .45; }
  else if(uMode==11){ // mouth interior: darker toward the throat
    base *= mix(.35, 1., smoothstep(0.,1.,vUV.x)); rough=.5; spec=.25; }
  float sh = shadow();
  float ndk = dot(N, -uKeyD);
  float w = sss*.55;
  float dk = clamp((ndk + w)/(1.+w), 0., 1.);
  vec3 diff = uKeyC * dk * mix(1., sh, .92);
  diff += uKeyC * sss * .2 * vec3(1.,.38,.26) * (smoothstep(-.3,.12,ndk) - smoothstep(.12,.65,ndk)) * mix(.6,1.,sh);
  diff += uFillC * (dot(N,-uFillD)*.5+.5) * .5 * ao;
  vec3 amb = mix(uGnd, uSky, N.y*.5+.5) * ao * uAO;
  vec3 col = base * (diff + amb);
  vec3 H = normalize(-uKeyD + Vv); float shn = mix(180., 6., rough);
  col += uKeyC * specC * pow(max(0.,dot(N,H)), shn) * spec * (shn+8.)/60. * sh;
  vec3 H2 = normalize(-uFillD + Vv); col += uFillC * specC * pow(max(0.,dot(N,H2)), shn) * spec * (shn+8.)/200.;
  float fr = pow(1.-max(0.,dot(N,Vv)), 3.);
  col += uRimC * fr * uRim * (1.-sss*.55) * clamp(dot(N,-uRimD)*.6+.4, 0., 1.);
  col += base * sheen * fr * .9 * (dot(N,-uKeyD)*.5+.5);
  col += vec3(eyeGlint);
  col = aces(col * 1.05);
  col = pow(col, vec3(1./2.2));
  frag = vec4(col*uAlpha, uAlpha);
}`;

const VS_D = `#version 300 es
layout(location=0) in vec3 aPos; uniform mat4 uM, uLVP; void main(){ gl_Position = uLVP*uM*vec4(aPos,1.); }`;
const FS_D = `#version 300 es
precision mediump float; out vec4 o; void main(){ o = vec4(1.); }`;

function prog(gl, vs, fs) {
  const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
  const p = gl.createProgram();
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
  return { p, u };
}

// ------------------------------------------------------------------ renderer
export class Renderer {
  constructor(canvas, opts = {}) {
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, depth: true, powerPreference: 'low-power' });
    if (!gl) throw new Error('WebGL2 indisponível');
    this.gl = gl; this.canvas = canvas;
    this.main = prog(gl, VS, FS);
    this.depth = prog(gl, VS_D, FS_D);
    // shadow map
    this.SM = opts.shadowSize || 1024;   // 512 on phones (index.js) — same soft look, 4× less fill
    this.meshes = [];
    this.shTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.shTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, this.SM, this.SM);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.light = {
      keyD: V.norm([0.5, -0.78, -0.62]), keyC: [1.55, 1.42, 1.28],
      fillD: V.norm([-0.75, -0.2, -0.55]), fillC: [0.26, 0.3, 0.42],
      rimD: V.norm([-0.25, 0.1, 0.95]), rimC: [0.42, 0.62, 0.5],
      sky: [0.17, 0.17, 0.22], gnd: [0.09, 0.13, 0.1],
    };
  }
  mesh(geo) {
    const gl = this.gl, vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const mk = (data, loc, size) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, geo.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); return b;
    };
    const m = { vao, geo, pb: mk(geo.pos, 0, 3), nb: mk(geo.nrm, 1, 3), ub: mk(geo.uv, 2, 2), count: geo.count ?? geo.idx.length };
    m.ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.idx, geo.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    this.meshes.push(m);
    return m;
  }
  // free every GPU resource (called on unmount, before the context is released)
  dispose() {
    const gl = this.gl;
    for (const m of this.meshes) { gl.deleteBuffer(m.pb); gl.deleteBuffer(m.nb); gl.deleteBuffer(m.ub); gl.deleteBuffer(m.ib); gl.deleteVertexArray(m.vao); }
    this.meshes.length = 0;
    gl.deleteTexture(this.shTex); gl.deleteFramebuffer(this.fbo);
    gl.deleteProgram(this.main.p); gl.deleteProgram(this.depth.p);
  }
  update(m) {
    const gl = this.gl, g = m.geo;
    gl.bindBuffer(gl.ARRAY_BUFFER, m.pb); gl.bufferSubData(gl.ARRAY_BUFFER, 0, g.pos);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.nb); gl.bufferSubData(gl.ARRAY_BUFFER, 0, g.nrm);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.ub); gl.bufferSubData(gl.ARRAY_BUFFER, 0, g.uv);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ib); gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, g.idx);
    m.count = g.count ?? g.idx.length;
  }
  resize(w, h, dpr) {
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
  }
  // list: [{ m: mesh, M: mat4, mat: {...}, cast: bool }]
  render(list, cam, lightVP) {
    const gl = this.gl;
    // ---- shadow pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.SM, this.SM);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.colorMask(false, false, false, false);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 2.0);
    gl.useProgram(this.depth.p);
    gl.uniformMatrix4fv(this.depth.u.uLVP, false, lightVP);
    for (const d of list) {
      if (d.cast === false || d.mat.mode === 8) continue;
      gl.uniformMatrix4fv(this.depth.u.uM, false, d.M);
      gl.bindVertexArray(d.m.vao); gl.drawElements(gl.TRIANGLES, d.m.count, gl.UNSIGNED_SHORT, 0);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.colorMask(true, true, true, true);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // ---- main pass
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const P = this.main, u = P.u, Lt = this.light;
    gl.useProgram(P.p);
    gl.uniformMatrix4fv(u.uVP, false, cam.VP); gl.uniform3fv(u.uCam, cam.eye);
    gl.uniformMatrix4fv(u.uLVP, false, lightVP);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.shTex); gl.uniform1i(u.uSh, 0); gl.uniform1f(u.uShTexel, 1 / this.SM);
    gl.uniform3fv(u.uKeyD, Lt.keyD); gl.uniform3fv(u.uKeyC, Lt.keyC); gl.uniform3fv(u.uFillD, Lt.fillD); gl.uniform3fv(u.uFillC, Lt.fillC);
    gl.uniform3fv(u.uRimD, Lt.rimD); gl.uniform3fv(u.uRimC, Lt.rimC); gl.uniform3fv(u.uSky, Lt.sky); gl.uniform3fv(u.uGnd, Lt.gnd);
    // shadow catchers first (no depth write), then opaque
    const order = list.slice().sort((a, b) => (a.mat.mode === 8 ? 0 : 1) - (b.mat.mode === 8 ? 0 : 1));
    for (const d of order) {
      const mt = d.mat;
      gl.depthMask(mt.mode !== 8);
      gl.uniformMatrix4fv(u.uM, false, d.M); gl.uniformMatrix3fv(u.uN, false, M4.nrm(d.M));
      gl.uniform3fv(u.uC1, mt.c1); gl.uniform3fv(u.uC2, mt.c2 || mt.c1);
      gl.uniform1f(u.uRough, mt.rough ?? 0.6); gl.uniform1f(u.uSpec, mt.spec ?? 0.3); gl.uniform1f(u.uSSS, mt.sss ?? 0);
      gl.uniform1f(u.uRim, mt.rim ?? 0.4); gl.uniform1f(u.uAO, mt.ao ?? 1); gl.uniform1f(u.uAlpha, mt.alpha ?? 1); gl.uniform1f(u.uFreq, mt.freq ?? 1);
      gl.uniform1i(u.uMode, mt.mode || 0); gl.uniform1f(u.uTwo, mt.two ? 1 : 0);
      gl.uniform4fv(u.uP0, mt.p0 || [0, 0, 0, 0]); gl.uniform4fv(u.uP1, mt.p1 || [0, 0, 0, 0]); gl.uniform4fv(u.uP2, mt.p2 || [0, 0, 0, 0]); gl.uniform4fv(u.uP3, mt.p3 || [0, 0, 0, 0]);
      gl.bindVertexArray(d.m.vao); gl.drawElements(gl.TRIANGLES, d.m.count, gl.UNSIGNED_SHORT, 0);
    }
    gl.depthMask(true);
    gl.bindVertexArray(null);
  }
}
