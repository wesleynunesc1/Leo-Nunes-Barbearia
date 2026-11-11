/**
 * Christmas Express 2.0 — linha do tempo da cena do presente.
 *
 * Todos os tempos abaixo estão em segundos, numa travessia-base de 15 s:
 *   0–4   todos correm            6–9   o presente voa por cima de 03, 02 e 01
 *   4–6   Noel olha e pega a caixa 9–11  o 04 acelera, estende os braços e pega
 *   6     lançamento              11–15  04 corre com o presente; os outros olham para trás
 *
 * Cada faixa vira UMA animação WAAPI infinita com a mesma duração da travessia
 * (+ pausa), então tudo fica sincronizado e pausa/retoma junto.
 * Se a prop `duration` mudar, a história é esticada proporcionalmente.
 */

export const BASE = 15;

/* Pontos medidos no viewBox (ver README › "Ajustar a trajetória") */
const SHOULDER = [437, 90]; // ombro do braço que lança
const HAND_GIFT = [21, -54]; // centro da caixa em relação ao ombro, com o braço a 0°
const RELEASE_ANGLE = 25;
export const CATCH = { x: 801, y: 90.5, rot: 16 }; // onde a caixa "segurada" do 04 está no instante 9.9 s
const APEX_Y = 18;

const T = {
  look: 4.0,
  reach: 4.9,
  grab: 5.05,
  windup: 5.9,
  release: 6.2,
  apex: 8.9,
  catch: 9.9,
};

function rotatePoint([x, y], deg) {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
}

/** Vai-e-vem (a ↔ b a cada `half` s) com um trecho de história no meio. */
function swingTrack({ half, a, b, story = [], after = [a, b] }) {
  const out = [];
  const s0 = story.length ? story[0][0] : Infinity;
  let i = 0;
  for (let t = 0; t < Math.min(s0 - half * 0.6, BASE); t += half, i++) out.push([t, i % 2 ? b : a, 'ease-in-out']);
  story.forEach((k) => out.push(k));
  if (story.length) {
    i = 1;
    for (let t = story[story.length - 1][0] + half; t <= BASE; t += half, i++) out.push([t, i % 2 ? after[1] : after[0], 'ease-in-out']);
  }
  return out;
}

const rot = (v) => ({ transform: `rotate(${v}deg)` });
const flip = (v) => ({ transform: `scaleX(${v})` });
const op = (v) => ({ opacity: v });

/** Liga/desliga instantâneo (2 quadros a 20 ms). */
function onOff(on, off, base = 0) {
  const k = [[0, op(base)], [on - 0.02, op(base)], [on, op(1 - base)]];
  if (off != null) k.push([off - 0.02, op(1 - base)], [off, op(base)]);
  return k;
}

function lookBack(from, to) {
  return [[0, flip(1)], [from, flip(1), 'ease-in-out'], [from + 0.2, flip(-1)], [to, flip(-1), 'ease-in-out'], [to + 0.2, flip(1)]];
}

function tracks() {
  const [rx, ry] = rotatePoint(HAND_GIFT, RELEASE_ANGLE);
  const REL = { x: SHOULDER[0] + rx, y: SHOULDER[1] + ry };
  const list = [];
  const add = (selector, keys) => list.push({ selector, keys });
  const addRot = (selector, cfg) => add(selector, swingTrack(cfg).map(([t, v, e]) => [t, rot(v), e]));

  /* ---------- Papai Noel ---------- */
  add('.cx-santa-turn', lookBack(T.look, 6.9));
  addRot('.cx-wave-arm', {
    half: 0.9, a: -5, b: 20,
    story: [
      [4.3, 8, 'ease-in-out'],
      [T.reach, 42],
      [T.grab + 0.1, 42, 'ease-in-out'],
      [T.windup, -25, 'cubic-bezier(.5,0,.9,.4)'],
      [T.release, RELEASE_ANGLE, 'ease-out'],
      [6.45, 50, 'ease-in-out'],
      [7.2, 8, 'ease-in-out'],
    ],
  });
  addRot('.cx-wave-hand', {
    half: 0.9, a: -20, b: 22,
    story: [[4.3, 0, 'linear'], [7.2, 0, 'ease-in-out']],
  });
  add('.cx-pile-green', onOff(T.grab, null, 1));
  add('.cx-pile-navy', [
    [0, { transform: 'translate(0px, 0px)' }],
    [T.grab, { transform: 'translate(0px, 0px)' }, 'cubic-bezier(.5,0,1,.6)'],
    [T.grab + 0.32, { transform: 'translate(2px, 33px)' }],
  ]);
  add('.cx-santa-gift', onOff(T.grab, T.release));

  /* ---------- presente em voo ---------- */
  add('.cx-gift-fly', onOff(T.release, T.catch));
  add('.cx-gift-x', [
    [0, { transform: `translateX(${REL.x}px)` }],
    [T.release, { transform: `translateX(${REL.x}px)` }, 'linear'],
    [T.catch, { transform: `translateX(${CATCH.x}px)` }],
  ]);
  add('.cx-gift-y', [
    [0, { transform: `translateY(${REL.y}px)` }],
    [T.release, { transform: `translateY(${REL.y}px)` }, 'cubic-bezier(.3,.6,.6,1)'],
    [T.apex, { transform: `translateY(${APEX_Y}px)` }, 'cubic-bezier(.4,0,.75,.45)'],
    [T.catch, { transform: `translateY(${CATCH.y}px)` }],
  ]);
  add('.cx-gift-spin', [
    [0, rot(RELEASE_ANGLE)],
    [T.release, rot(RELEASE_ANGLE), 'linear'],
    [T.catch, rot(CATCH.rot + 360)],
  ]);

  /* ---------- barbeiro 04 ---------- */
  const b4 = '.cx-barber--b04 ';
  add('.cx-b04-advance', [
    [0, { transform: 'translateX(0px)' }, 'ease-in-out'],
    [7.6, { transform: 'translateX(12px)' }, 'ease-in-out'], // vai ficando para trás…
    [T.catch, { transform: 'translateX(-30px)' }, 'ease-in-out'], // …e dispara para pegar
    [12.5, { transform: 'translateX(-22px)' }],
  ]);
  const half = 0.19;
  const reach = (up, lo, carryUp, carryLo) => [
    [[9.0, up[0], 'ease-in-out'], [9.55, up[1]], [T.catch + 0.08, up[1], 'ease-in-out'], [10.55, carryUp]],
    [[9.0, lo[0], 'ease-in-out'], [9.55, lo[1]], [T.catch + 0.08, lo[1], 'ease-in-out'], [10.55, carryLo]],
  ];
  const near = reach([0, 114], [88, 16], 20, 95);
  const far = reach([0, 106], [92, 22], 28, 88);
  addRot(b4 + '.cx-b-upper.cx-b--near', { half, a: -38, b: 36, story: near[0], after: [17, 23] });
  addRot(b4 + '.cx-b-fore.cx-b--near', { half, a: 86, b: 96, story: near[1], after: [97, 93] });
  addRot(b4 + '.cx-b-upper.cx-b--far', { half, a: 36, b: -38, story: far[0], after: [25, 31] });
  addRot(b4 + '.cx-b-fore.cx-b--far', { half, a: 96, b: 86, story: far[1], after: [90, 86] });
  add(b4 + '.cx-b-heldgift', onOff(T.catch));
  add(b4 + '.cx-b-face--alt', onOff(9.3, 10.5)); // surpresa…
  add(b4 + '.cx-b-face--main', onOff(9.3, 10.5, 1)); // …e de volta ao sorriso
  add('.cx-catch-burst', [
    [0, { opacity: 0, transform: 'scale(0.2)' }],
    [T.catch - 0.03, { opacity: 0, transform: 'scale(0.2)' }],
    [T.catch, { opacity: 1, transform: 'scale(0.3)' }, 'ease-out'],
    [T.catch + 0.45, { opacity: 0, transform: 'scale(1.25) rotate(40deg)' }],
  ]);

  /* ---------- 03, 02 e 01 olham para trás, surpresos ---------- */
  [['b03', 10.9], ['b02', 11.05], ['b01', 11.2]].forEach(([id, t]) => {
    const s = `.cx-barber--${id} `;
    add(s + '.cx-b-turn', lookBack(t, t + 1.3));
    add(s + '.cx-b-face--alt', onOff(t + 0.1, t + 1.4));
    add(s + '.cx-b-face--main', onOff(t + 0.1, t + 1.4, 1));
  });

  return list;
}

/**
 * Cria as animações da história dentro de `root`.
 * @param {Element} root   elemento .cx-root
 * @param {number} travel  segundos da travessia
 * @param {number} total   travessia + pausa
 * @returns {Animation[]}
 */
export function createStory(root, travel, total) {
  const scale = travel / BASE;
  const anims = [];
  tracks().forEach(({ selector, keys }) => {
    const el = root.querySelector(selector);
    if (!el) return;
    const frames = [];
    let last = -1;
    keys.forEach(([t, props, easing]) => {
      const offset = Math.min(1, Math.max(0, (t * scale) / total));
      if (offset < last) return;
      last = offset;
      frames.push({ ...props, offset, easing: easing || 'linear' });
    });
    if (frames[0].offset > 0) frames.unshift({ ...frames[0], offset: 0, easing: 'linear' });
    if (last < 1) frames.push({ ...frames[frames.length - 1], offset: 1 });
    anims.push(el.animate(frames, { duration: total * 1000, iterations: Infinity }));
  });
  return anims;
}
