/**
 * Christmas Express 3.0 — linha do tempo.
 *
 * Tempos em segundos, numa história-base de 24 s (a prop `duration` estica tudo junto):
 *
 *    0–4    a rena entra correndo, puxando o trenó
 *    4–7    os quatro barbeiros aparecem atrás (03 · 02 · 01 · 04)
 *    7–9    o duende aparece, tentando alcançar o grupo
 *    9–11   a rena espirra uma nuvenzinha de neve (sem parar de galopar)
 *   11–14   o barbeiro 03 quase tropeça, abre os braços e se recupera
 *   14–17   o Papai Noel olha para trás e pega a caixa verde
 *   17–20   lança o presente por cima do 03, do 02 e do 01
 *   20–22   o 04 pega a caixa no ar; os outros olham para trás, surpresos
 *   22–24   todos seguem correndo; o Noel acena
 *   24+     saída acelerada pela esquerda (prop `exit`), depois a pausa
 *
 * Cada faixa vira UMA animação WAAPI infinita com a duração do ciclo inteiro
 * (história + saída + pausa): tudo fica no mesmo relógio e pausa/retoma junto.
 *
 * planTravel() calcula a travessia a partir da largura real do contêiner, de modo que
 * cada acontecimento ocorra com o seu personagem dentro da tela — em qualquer largura.
 */
import { RUN_CYCLE } from './characters/barbers/config.js';
import { SPAN } from './geometry.js';

export const BASE = 24;

export const T = {
  sneezeStart: 9.0,
  sneeze: 9.9,
  sneezeEnd: 11.0,
  slip: 11.2,
  slipEnd: 13.3,
  look: 14.0,
  reach: 15.2,
  grab: 15.4,
  windup: 16.95,
  release: 17.45,
  apex: 19.35,
  catch: 20.5,
  wave: 22.0,
};

/* Pontos medidos no viewBox (ver README › "Ajustar a trajetória") */
const SHOULDER = [437, 90]; // ombro do braço que lança
const HAND_GIFT = [21, -54]; // centro da caixa em relação ao ombro, com o braço a 0°
const RELEASE_ANGLE = 25;
/** Onde a caixa "segurada" do 04 está no instante T.catch (medido na prévia: botão "Medir captura"). */
export const CATCH = { x: 823, y: 83.1, rot: 16 };
const APEX_Y = 16;

const SNEEZE_AT = [30, 80]; // focinho da rena no instante do espirro
const SNEEZE_FLAKES = 6;
const SPRAY_BITS = 7;

/* ------------------------------------------------------------------ utilitários */

const EIO = 'ease-in-out';
const rot = (v) => ({ transform: `rotate(${v}deg)` });
const flip = (v) => ({ transform: `scaleX(${v})` });
const op = (v) => ({ opacity: v });
const tx = (v) => ({ transform: `translateX(${v}px)` });
const ty = (v) => ({ transform: `translateY(${v}px)` });
const txy = (x, y) => ({ transform: `translate(${x}px, ${y}px)` });
const sc = (v) => ({ transform: `scale(${v})` });

function rotatePoint([x, y], deg) {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
}

/**
 * Ciclo repetido entre `from` e `to`.
 * spec = { period, phase (0–1), keys: [[fração do ciclo, valor, easing], …] }
 * A fase segue a mesma convenção do CSS da 2.0: progresso = t / period + phase.
 */
function cycle({ period, phase = 0, keys }, from, to) {
  const out = [];
  for (let n = Math.floor(from / period + phase) - 1; ; n++) {
    let past = false;
    for (let i = 0; i < keys.length; i++) {
      const [frac, v, e] = keys[i];
      const t = (n + frac - phase) * period;
      if (t < from - 1e-6) continue;
      if (t > to + 1e-6) { past = true; break; }
      out.push([t, v, e || 'linear']);
    }
    if (past) break;
  }
  return out;
}

/** Ciclo → trecho de história → ciclo de novo (o ciclo volta na própria grade, sem perder o compasso). */
function spliced(spec, story, end, after = spec, gap = 0.08) {
  if (!story || !story.length) return cycle(spec, 0, end);
  return [
    ...cycle(spec, 0, story[0][0] - gap),
    ...story,
    ...cycle(after, story[story.length - 1][0] + gap, end),
  ];
}

/** Visível (ou invisível, com base = 1) só durante os intervalos [a, b]. Troca instantânea (20 ms). */
function during(intervals, base = 0) {
  const k = [[0, op(base)]];
  intervals.forEach(([a, b]) => {
    k.push([a - 0.02, op(base)], [a, op(1 - base)]);
    if (b != null) k.push([b - 0.02, op(1 - base)], [b, op(base)]);
  });
  return k;
}

function lookBack(intervals) {
  const k = [[0, flip(1)]];
  intervals.forEach(([from, to]) => {
    k.push([from, flip(1), EIO], [from + 0.2, flip(-1)], [to, flip(-1), EIO], [to + 0.2, flip(1)]);
  });
  return k;
}

/** Aplica uma função de valor (rot, ty…) a uma lista [t, número, easing]. */
const as = (fn, keys) => keys.map(([t, v, e]) => [t, fn(v), e]);

/* ------------------------------------------------------------------ ciclos de corrida (03 e 04) */

const STRIDE = 'cubic-bezier(.35, 0, .65, 1)';

function runSpecs(c) {
  const P = c.bs;
  return {
    thigh: (lp) => ({ period: P, phase: c.bp + lp, keys: [[0, c.th[0], STRIDE], [0.5, c.th[1], STRIDE]] }),
    shin: (lp) => ({ period: P, phase: c.bp + lp, keys: [[0, -14], [0.24, -10], [0.5, -46], [0.74, c.sh]] }),
    upper: (lp) => c.ar && { period: P, phase: c.bp + lp, keys: [[0, c.ar[0], EIO], [0.5, c.ar[1], EIO]] },
    fore: (lp) => c.fo && { period: P, phase: c.bp + lp, keys: [[0, c.fo[0], EIO], [0.5, c.fo[1], EIO]] },
    lean: { period: P, phase: c.bp, keys: [[0, c.lean - 1.2, EIO], [0.5, c.lean + 1.2, EIO]] },
    head: { period: P, phase: c.bp, keys: [[0, c.lean * -0.7 + 1.5, EIO], [0.5, c.lean * -0.7 - 1.5, EIO]] },
    // um sobe-e-desce por passo: mais baixo logo depois do pé tocar o chão
    bob: { period: P / 2, phase: c.bp * 2 - 0.16, keys: [[0, 0, EIO], [0.5, -c.bob, EIO]] },
  };
}

/* ------------------------------------------------------------------ faixas */

function tracks(END) {
  const [rx, ry] = rotatePoint(HAND_GIFT, RELEASE_ANGLE);
  const REL = { x: SHOULDER[0] + rx, y: SHOULDER[1] + ry };
  const list = [];
  const add = (selector, keys) => list.push({ selector, keys });

  /* =================== rena: espirro (9–11) =================== */
  const S = T.sneeze;
  add('.cx-deer-sneeze', as(rot, [
    [0, 0], [T.sneezeStart, 0, EIO],
    [9.3, 7, EIO], [9.45, 4, EIO], // "ah…"
    [9.72, 13, EIO], [S - 0.06, 15, 'cubic-bezier(.6, 0, 1, .5)'], // "aaah…"
    [S + 0.05, -15, 'ease-out'], // "TCHIM!"
    [S + 0.22, -8, EIO], [S + 0.44, 3, EIO], [S + 0.62, -4, EIO], [S + 0.8, 2.5, EIO], [T.sneezeEnd, 0],
  ]));
  add('.cx-deer-nose', as(sc, [
    [0, 1], [9.05, 1, EIO], [9.16, 1.25, EIO], [9.27, 1, EIO], [9.4, 1.3, EIO], [9.55, 1, EIO],
    [S - 0.1, 1.1, EIO], [S + 0.05, 1.4, EIO], [S + 0.35, 1],
  ]));
  add('.cx-deer-eye--open', during([[9.62, S + 0.42], [S + 0.66, S + 0.78]], 1));
  add('.cx-deer-eye--shut', during([[9.62, S + 0.42], [S + 0.66, S + 0.78]]));
  add('.cx-deer-mouth--alt', during([[S - 0.04, S + 0.32]]));
  add('.cx-deer-mouth--main', during([[S - 0.04, S + 0.32]], 1));
  // o corpo dá um solavanco, mas as pernas seguem no galope
  add('.cx-deer-jolt', [
    [0, txy(0, 0)], [S, txy(0, 0), 'ease-out'], [S + 0.1, txy(5, -3), EIO], [S + 0.5, txy(0, 0)],
  ]);
  const [sx, sy] = SNEEZE_AT;
  const puff = (o, x, y, s) => ({ opacity: o, transform: `translate(${x}px, ${y}px) scale(${s})` });
  add('.cx-sneeze-cloud', [
    [0, puff(0, sx, sy, 0.2)],
    [S + 0.02, puff(0, sx, sy, 0.2)],
    [S + 0.04, puff(0.96, sx, sy, 0.25), 'ease-out'],
    [S + 0.26, puff(0.96, sx - 26, sy - 2, 1), 'linear'], // sai para a frente…
    [S + 1.15, puff(0, sx + 56, sy - 24, 1.5)], // …e fica para trás, se desfazendo
  ]);
  const FL = [[-28, -15], [-19, -24], [-36, -6], [-11, -19], [-30, -28], [-17, -10]];
  for (let i = 0; i < SNEEZE_FLAKES; i++) {
    const [dx, dy] = FL[i];
    const fl = (o, x, y, r) => ({ opacity: o, transform: `translate(${x}px, ${y}px) rotate(${r}deg)` });
    add(`.cx-sneeze-flake--${i}`, [
      [0, fl(0, sx, sy, 0)],
      [S + 0.02, fl(0, sx, sy, 0)],
      [S + 0.04, fl(1, sx, sy, 0), 'ease-out'],
      [S + 0.3, fl(1, sx + dx, sy + dy, 90), 'cubic-bezier(.4, 0, .9, .6)'],
      [S + 1.1 + i * 0.05, fl(0, sx + dx + 78, 150 + i * 6, 260)],
    ]);
  }

  /* =================== Papai Noel =================== */
  add('.cx-santa-turn', lookBack([[T.look, 18.7], [T.wave - 0.15, END - 0.4]]));
  // solavancos: o espirro puxa as rédeas; depois o gesto de pegar e lançar
  add('.cx-santa-react', as(rot, [
    [0, 0], [S, 0, 'ease-out'], [S + 0.12, -7, EIO], [S + 0.42, 4, EIO], [S + 0.72, -1.5, EIO], [T.sneezeEnd, 0],
    [T.reach - 0.2, 0, EIO], [T.grab, 5, EIO], [16.1, 2, EIO], [T.windup, 6, 'cubic-bezier(.5, 0, .9, .4)'],
    [T.release, -6, 'ease-out'], [18.2, 0],
  ]));
  add('.cx-sleigh-jolt', as(tx, [[0, 0], [S, 0, 'ease-out'], [S + 0.14, 4, EIO], [S + 0.6, 0]]));

  const WAVE = { period: 1.8, keys: [[0, -5, EIO], [0.5, 20, EIO]] };
  const BIG_WAVE = { period: 0.72, keys: [[0, 30, EIO], [0.5, 64, EIO]] };
  add('.cx-wave-arm', as(rot, [
    ...cycle(WAVE, 0, T.look),
    [T.look + 0.3, 8, EIO],
    [T.reach, 42],
    [T.grab + 0.1, 42, EIO],
    [16.0, 12, EIO], // ergue a caixa…
    [16.45, 17, EIO], // …e dá uma olhada nela
    [T.windup, -25, 'cubic-bezier(.5, 0, .9, .4)'],
    [T.release, RELEASE_ANGLE, 'ease-out'],
    [T.release + 0.25, 50, EIO],
    [18.5, 8, EIO],
    ...cycle(WAVE, 18.9, T.wave - 0.5),
    [T.wave - 0.1, 30, EIO],
    ...cycle(BIG_WAVE, T.wave, END), // aceno final, mais alto e mais rápido
  ]));
  const HAND = { period: 1.8, phase: 0.06, keys: [[0, -20, EIO], [0.5, 22, EIO]] };
  const BIG_HAND = { period: 0.72, phase: 0.12, keys: [[0, -30, EIO], [0.5, 30, EIO]] };
  add('.cx-wave-hand', as(rot, [
    ...cycle(HAND, 0, T.look),
    [T.look + 0.3, 0],
    [18.5, 0, EIO],
    ...cycle(HAND, 18.9, T.wave - 0.5),
    ...cycle(BIG_HAND, T.wave, END),
  ]));
  add('.cx-santa-mouth--alt', during([[T.grab + 0.1, T.windup], [T.wave - 0.1, null]]));
  add('.cx-santa-mouth--main', during([[T.grab + 0.1, T.windup], [T.wave - 0.1, null]], 1));

  /* --- o presente: pilha → mão → voo → braços do 04 (só um visível por vez) --- */
  add('.cx-pile-green', during([[T.grab, null]], 1));
  add('.cx-pile-navy', [
    [0, txy(0, 0)],
    [T.grab, txy(0, 0), 'cubic-bezier(.5, 0, 1, .6)'],
    [T.grab + 0.32, txy(2, 33)],
  ]);
  add('.cx-santa-gift', during([[T.grab, T.release]]));

  add('.cx-gift-fly', during([[T.release, T.catch]]));
  add('.cx-gift-x', [
    [0, tx(REL.x)],
    [T.release, tx(REL.x), 'linear'],
    [T.catch, tx(CATCH.x)],
  ]);
  add('.cx-gift-y', [
    [0, ty(REL.y)],
    [T.release, ty(REL.y), 'cubic-bezier(.3, .6, .6, 1)'],
    [T.apex, ty(APEX_Y), 'cubic-bezier(.4, 0, .75, .45)'],
    [T.catch, ty(CATCH.y)],
  ]);
  add('.cx-gift-spin', [
    [0, rot(RELEASE_ANGLE)],
    [T.release, rot(RELEASE_ANGLE), 'linear'],
    [T.catch, rot(CATCH.rot + 360)],
  ]);

  /* =================== barbeiro 03: quase tropeço (11–14) =================== */
  {
    const b = '.cx-barber--b03 ';
    const R = runSpecs(RUN_CYCLE.b03);
    const t0 = T.slip; // o pé toca torto
    const t1 = t0 + 0.32; // o pé desliza para a frente
    const t2 = t0 + 0.7; // corpo para trás, braços abertos
    const t3 = t0 + 1.0; // balança…
    const t4 = t0 + 1.3; // …balança…
    const t5 = t0 + 1.8; // joga o peso para a frente
    const t6 = T.slipEnd; // pé no chão: volta a correr
    const OUT = 'cubic-bezier(.2, .7, .3, 1)';
    const story = {
      // perna da frente: escorrega e sobe; depois volta para baixo do corpo
      thighN: [[t0, 44, OUT], [t1, 60, EIO], [t2, 74, EIO], [t3, 62, EIO], [t4, 70, EIO], [t5, 14, EIO], [t6, -22]],
      shinN: [[t0, -8, OUT], [t1, -2, EIO], [t2, 0, EIO], [t4, -4, EIO], [t5, -24, EIO], [t6, -58]],
      // perna de apoio: dobra para segurar o corpo, dá um pulinho e passa à frente
      thighF: [[t0, -16, OUT], [t1, -2, EIO], [t2, 8, EIO], [t3, 2, EIO], [t4, 9, EIO], [t5, 4, EIO], [t6, 42]],
      shinF: [[t0, -40, OUT], [t1, -30, EIO], [t2, -26, EIO], [t3, -34, EIO], [t4, -24, EIO], [t5, -44, EIO], [t6, -14]],
      lean: [[t0, -5, OUT], [t1, 7, EIO], [t2, 18, EIO], [t3, 11, EIO], [t4, 16, EIO], [t5, -17, EIO], [t6, -7]],
      head: [[t0, 4, OUT], [t1, -2, EIO], [t2, -12, EIO], [t3, -6, EIO], [t4, -11, EIO], [t5, 13, EIO], [t6, 4.5]],
      // braços abertos, girando para recuperar o equilíbrio
      upperN: [[t0, -34, OUT], [t1, -96, EIO], [t2, -148, EIO], [t3, -116, EIO], [t4, -152, EIO], [t5, -46, EIO], [t6, 34]],
      foreN: [[t0, 66, OUT], [t1, 22, EIO], [t2, 8, EIO], [t3, 20, EIO], [t4, 8, EIO], [t5, 62, EIO], [t6, 88]],
      upperF: [[t0, 34, OUT], [t1, 98, EIO], [t2, 146, EIO], [t3, 118, EIO], [t4, 150, EIO], [t5, 58, EIO], [t6, -34]],
      foreF: [[t0, 70, OUT], [t1, 24, EIO], [t2, 10, EIO], [t3, 22, EIO], [t4, 10, EIO], [t5, 70, EIO], [t6, 78]],
      bob: [[t0, 0, OUT], [t1, 4, EIO], [t2, 5.5, EIO], [t3, 1.5, EIO], [t4, 5, EIO], [t5, 2, EIO], [t6, -1]],
    };
    const part = (sel, spec, st) => add(b + sel, as(rot, spliced(spec, st, END)));
    part('.cx-b-thigh.cx-b--near', R.thigh(0), story.thighN);
    part('.cx-b-shin.cx-b--near', R.shin(0), story.shinN);
    part('.cx-b-thigh.cx-b--far', R.thigh(0.5), story.thighF);
    part('.cx-b-shin.cx-b--far', R.shin(0.5), story.shinF);
    part('.cx-b-upper.cx-b--near', R.upper(0.5), story.upperN);
    part('.cx-b-fore.cx-b--near', R.fore(0.5), story.foreN);
    part('.cx-b-upper.cx-b--far', R.upper(0), story.upperF);
    part('.cx-b-fore.cx-b--far', R.fore(0), story.foreF);
    part('.cx-b-lean', R.lean, story.lean);
    part('.cx-b-headjoint', R.head, story.head);
    add('.cx-barber--b03', as(ty, spliced(R.bob, story.bob, END)));
    // o pé desliza para a frente e leva o quadril junto: o tronco inclina para trás sem invadir o 02
    add('.cx-b03-slip', as(tx, [
      [0, 0], [t0, 0, EIO], [t1, -7, EIO], [t2, -9, EIO], [t4, -5, EIO], [t6, 0],
    ]));
    // expressão: surpresa durante o susto; depois, de novo, quando o 04 pega o presente
    const scare = [t0 + 0.12, t5 + 0.1];
    add(b + '.cx-b-face--alt', during([scare, [21.3, 22.6]]));
    add(b + '.cx-b-face--main', during([scare, [21.3, 22.6]], 1));
    add(b + '.cx-b-brows', as(ty, [[0, 0], [scare[0] - 0.05, 0, EIO], [scare[0] + 0.1, -2.8], [scare[1] - 0.1, -2.8, EIO], [scare[1] + 0.15, 0]]));
    add(b + '.cx-b-eyes', as(sc, [[0, 1], [scare[0] - 0.05, 1, EIO], [scare[0] + 0.1, 1.35], [scare[1] - 0.1, 1.35, EIO], [scare[1] + 0.15, 1]]));
    add(b + '.cx-b-turn', lookBack([[21.2, 22.5]]));
    add('.cx-b03-kick', during([[t0, t6 + 0.2]], 1));

    // neve espalhada pelo pé que desliza
    for (let i = 0; i < SPRAY_BITS; i++) {
      const a = (-155 + i * 19) * (Math.PI / 180); // leque para a frente e para cima
      const d = 15 + (i % 3) * 7;
      const px = Math.cos(a) * d;
      const py = Math.sin(a) * d * 0.9;
      const bit = (o, x, y, s) => ({ opacity: o, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s})` });
      const s0 = t0 + 0.04 + (i % 2) * 0.1;
      add(`.cx-spray-bit--${i}`, [
        [0, bit(0, 0, 0, 0.4)],
        [s0, bit(0, 0, 0, 0.4)],
        [s0 + 0.02, bit(1, 0, 0, 0.6), 'ease-out'],
        [s0 + 0.3, bit(1, px, py, 1), 'cubic-bezier(.4, 0, .9, .6)'],
        [s0 + 0.85, bit(0, px + 34, 4, 0.7)],
      ]);
    }
    [[9, -13], [15, -5], [3, -17]].forEach(([dx, dy], i) => {
      const dr = (o, x, y) => ({ opacity: o, transform: `translate(${x}px, ${y}px) rotate(${x * 2}deg)` });
      const s0 = t1 + i * 0.09;
      add(`.cx-sweat-drop--${i}`, [
        [0, dr(0, 0, 0)], [s0, dr(0, 0, 0)], [s0 + 0.02, dr(1, 0, 0), 'ease-out'],
        [s0 + 0.35, dr(1, dx, dy), 'ease-in'], [s0 + 0.65, dr(0, dx + 8, dy + 8)],
      ]);
    });

    // o 02 e o 01, logo atrás, se assustam junto (e depois olham para trás na captura)
    [['b02', t1 + 0.1, 21.35], ['b01', t1 + 0.3, 21.5]].forEach(([id, t, look]) => {
      const s = `.cx-barber--${id} `;
      const gasp = [t, t5];
      // freada de susto: abrem espaço para o 03 e depois retomam a posição
      const back = id === 'b02' ? 15 : 8;
      add(`.cx-${id}-brake`, as(tx, [[0, 0], [t - 0.15, 0, EIO], [t + 0.45, back, EIO], [t5 - 0.2, back, EIO], [t6 + 0.9, 0]]));
      add(s + '.cx-b-face--alt', during([gasp, [look + 0.1, look + 1.4]]));
      add(s + '.cx-b-face--main', during([gasp, [look + 0.1, look + 1.4]], 1));
      add(s + '.cx-b-brows', as(ty, [[0, 0], [gasp[0] - 0.05, 0, EIO], [gasp[0] + 0.1, -2], [gasp[1] - 0.1, -2, EIO], [gasp[1] + 0.15, 0]]));
      add(s + '.cx-b-turn', lookBack([[look, look + 1.3]]));
    });
  }

  /* =================== barbeiro 04: pega o presente (20–22) =================== */
  {
    const b = '.cx-barber--b04 ';
    const c = RUN_CYCLE.b04;
    const R = runSpecs(c);
    const C = T.catch;
    add(b + '.cx-b-thigh.cx-b--near', as(rot, cycle(R.thigh(0), 0, END)));
    add(b + '.cx-b-shin.cx-b--near', as(rot, cycle(R.shin(0), 0, END)));
    add(b + '.cx-b-thigh.cx-b--far', as(rot, cycle(R.thigh(0.5), 0, END)));
    add(b + '.cx-b-shin.cx-b--far', as(rot, cycle(R.shin(0.5), 0, END)));
    add(b + '.cx-b-lean', as(rot, cycle(R.lean, 0, END)));
    add(b + '.cx-b-headjoint', as(rot, cycle(R.head, 0, END)));
    add('.cx-barber--b04', as(ty, cycle(R.bob, 0, END)));

    add('.cx-b04-advance', as(tx, [
      [0, 0, EIO],
      [C - 2.3, 14, EIO], // vai ficando para trás…
      [C, -8, EIO], // …e dispara para pegar (sem encostar no 01)
      [C + 2.6, -4],
    ]));
    add('.cx-b04-hop', as(ty, [
      [0, 0], [C - 0.28, 0, 'ease-out'], [C, -7, 'ease-in'], [C + 0.3, 0],
    ]));

    // braços: balanço de corrida → estende para pegar → carrega a caixa junto ao peito
    const arm = (a, bb, lp) => ({ period: c.bs, phase: c.bp + lp, keys: [[0, a, EIO], [0.5, bb, EIO]] });
    const reach = (up, lo, carryUp, carryLo) => [
      [[C - 0.9, up[0], EIO], [C - 0.35, up[1]], [C + 0.08, up[1], EIO], [C + 0.65, carryUp]],
      [[C - 0.9, lo[0], EIO], [C - 0.35, lo[1]], [C + 0.08, lo[1], EIO], [C + 0.65, carryLo]],
    ];
    const near = reach([0, 114], [88, 16], 20, 95);
    const far = reach([0, 106], [92, 22], 28, 88);
    add(b + '.cx-b-upper.cx-b--near', as(rot, spliced(arm(-38, 36, 0), near[0], END, arm(17, 23, 0))));
    add(b + '.cx-b-fore.cx-b--near', as(rot, spliced(arm(86, 96, 0), near[1], END, arm(97, 93, 0))));
    add(b + '.cx-b-upper.cx-b--far', as(rot, spliced(arm(36, -38, 0), far[0], END, arm(25, 31, 0))));
    add(b + '.cx-b-fore.cx-b--far', as(rot, spliced(arm(96, 86, 0), far[1], END, arm(90, 86, 0))));

    add(b + '.cx-b-heldgift', during([[C, null]]));
    add(b + '.cx-b-face--alt', during([[C - 0.6, C + 0.6]])); // surpresa…
    add(b + '.cx-b-face--main', during([[C - 0.6, C + 0.6]], 1)); // …e de volta ao sorriso
    add(b + '.cx-b-brows', as(ty, [[0, 0], [C - 0.65, 0, EIO], [C - 0.5, -2.2], [C + 0.5, -2.2, EIO], [C + 0.75, 0]]));
    add('.cx-catch-burst', [
      [0, { opacity: 0, transform: 'scale(0.2)' }],
      [C - 0.03, { opacity: 0, transform: 'scale(0.2)' }],
      [C, { opacity: 1, transform: 'scale(0.3)' }, 'ease-out'],
      [C + 0.45, { opacity: 0, transform: 'scale(1.25) rotate(40deg)' }],
    ]);
  }

  /* =================== duende: fica para trás e corre para alcançar =================== */
  add('.cx-elf-drift', as(tx, [
    [0, 12, EIO], [7.5, 4, EIO], [10, 16, EIO], [12.4, 1, EIO], [15, 15, EIO],
    [17.6, 2, EIO], [20, 13, EIO], [22.4, -2, EIO], [END, 8],
  ]));

  return list;
}

/**
 * Cria as animações da história dentro de `root`.
 * @param {Element} root
 * @param {{ scale: number, total: number, endBase: number }} timing
 *        scale = duration / 24 · total = ciclo inteiro em segundos · endBase = fim da saída (em s-base)
 * @returns {Animation[]}
 */
export function createStory(root, { scale, total, endBase }) {
  const anims = [];
  tracks(endBase).forEach(({ selector, keys }) => {
    const els = root.querySelectorAll(selector);
    if (!els.length) return;
    const frames = [];
    let last = -1;
    keys.forEach(([t, props, easing]) => {
      const offset = Math.min(1, Math.max(0, (t * scale) / total));
      if (offset < last) return;
      last = offset;
      frames.push({ ...props, offset, easing: easing || 'linear' });
    });
    if (!frames.length) return;
    if (frames[0].offset > 0) frames.unshift({ ...frames[0], offset: 0, easing: 'linear' });
    if (last < 1) frames.push({ ...frames[frames.length - 1], offset: 1 });
    els.forEach((el) => anims.push(el.animate(frames, { duration: total * 1000, iterations: Infinity })));
  });
  return anims;
}

/* ------------------------------------------------------------------ travessia */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Planeja a posição do conjunto ao longo do tempo.
 *
 * x = borda esquerda do conjunto, em px, a partir da borda esquerda do contêiner
 * (W = fora da tela à direita; −L = fora à esquerda).
 *
 * O caminho é o mais uniforme possível ("barbante esticado") que respeita:
 *  · cada acontecimento com o seu trecho da fila dentro da tela (SPAN, em geometry.js);
 *  · em telas largas, as entradas nos tempos do roteiro (trenó até 4 s, barbeiros até 7 s,
 *    duende até 9 s). Em telas estreitas o conjunto é mais largo que a tela: a "câmera"
 *    acompanha a ação e o duende aparece mais tarde;
 *  · depois de 24 s, saída acelerada (nunca há reinício com alguém visível).
 *
 * @returns {{ frames: {t: number, x: number}[], end: number }}  t em segundos-base
 */
export function planTravel({ W, L, exit = 4 }) {
  const m = Math.max(4, L * 0.012);
  const dt = 0.5;
  const n = Math.round(BASE / dt);
  const lo = new Array(n + 1).fill(-Infinity);
  const hi = new Array(n + 1).fill(W);

  const need = (t0, t1, [a, b]) => {
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      if (t < t0 - 1e-6 || t > t1 + 1e-6) continue;
      lo[i] = Math.max(lo[i], m - a * L);
      hi[i] = Math.min(hi[i], W - m - b * L);
    }
  };
  need(T.sneezeStart, T.sneezeEnd, SPAN.deer);
  need(T.slip - 0.2, T.slipEnd + 0.2, SPAN.b03);
  need(T.look, T.release, SPAN.sleigh);
  need(T.release, T.catch, SPAN.throwArc);
  need(T.catch, T.wave, SPAN.b04);
  // final: em telas largas a fila inteira continua visível enquanto o Noel acena
  need(T.wave, BASE, W >= L * 1.8 ? SPAN.all : SPAN.finale);

  if (W >= L * 1.8) {
    const by = (t, frac) => {
      const i = Math.round(t / dt);
      hi[i] = Math.min(hi[i], W - frac * L);
    };
    by(4, 0.56);
    by(7, 0.905);
    by(9, 1.0);
  }
  for (let i = 0; i <= n; i++) if (lo[i] > hi[i]) lo[i] = hi[i] = (lo[i] + hi[i]) / 2;

  // pontas fixas: começa encostado na borda direita; aos 24 s está o mais à esquerda que o final permite
  const x0 = W;
  const xN = Math.min(lo[n], hi[n]);
  const x = Array.from({ length: n + 1 }, (_, i) => x0 + ((xN - x0) * i) / n);
  for (let it = 0; it < 800; it++) {
    for (let i = 1; i < n; i++) x[i] = clamp((x[i - 1] + x[i + 1]) / 2, lo[i], hi[i]);
  }
  // arredonda as mudanças de velocidade e garante que o conjunto nunca volte para trás
  for (let pass = 0; pass < 3; pass++) {
    const y = x.slice();
    for (let i = 1; i < n; i++) x[i] = y[i - 1] * 0.25 + y[i] * 0.5 + y[i + 1] * 0.25;
  }
  for (let i = 1; i <= n; i++) x[i] = Math.min(x[i], x[i - 1]);

  const frames = x.map((v, i) => ({ t: i * dt, x: v }));

  // saída: parte da velocidade de cruzeiro e acelera até sumir
  const xEnd = -L * 1.04;
  const v0 = Math.max(0, (x[n - 1] - x[n]) / dt);
  const dist = x[n] - xEnd;
  const steps = Math.max(2, Math.round(exit / 0.25));
  for (let k = 1; k <= steps; k++) {
    const u = k / steps;
    const lin = Math.min(dist, v0 * exit) * u;
    const acc = Math.max(0, dist - v0 * exit) * u * u;
    frames.push({ t: BASE + exit * u, x: x[n] - lin - acc });
  }
  return { frames, end: BASE + exit };
}
