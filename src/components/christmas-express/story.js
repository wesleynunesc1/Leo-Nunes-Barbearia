/**
 * Christmas Express 3.1 — linha do tempo.
 *
 * Tempos em segundos, numa história-base de 32 s (a prop `duration` estica tudo junto):
 *
 *    0–4     a rena entra correndo, puxando o trenó
 *    4–7     os quatro barbeiros aparecem atrás (03 · 02 · 01 · 04) e, logo depois, o duende
 *    7–9     A · os óculos do 01 escorregam pelo nariz; ele se assusta e ajeita com a mão
 *    9–11    B · uma rajada bagunça o cabelo comprido do 03; ele ajeita correndo
 *   11–13    C · a rena espirra; a neve voa para trás e acerta o 02, que pisca e sacode a cabeça
 *   13–15    D · o duende alcança o 04 e pede carona (braço erguido, olhando para ele)
 *   15–17        pula nas costas do 04, que se desequilibra, quase cai e se recupera
 *   17–19        o 04 para, mãos nos joelhos, ofegante (fica parado no chão; o grupo segue devagar)
 *   19–21    E · o duende desce, dá tapinhas, aponta "vamos!" e os dois voltam a correr
 *   21–25        o Papai Noel pega a caixa verde e lança; o 04 pega no ar e segue com ela
 *   25–27        reta final: o 03 quase tropeça (gag da 3.0) e se recupera
 *   27.6–32  F · o 04 cai na neve; o duende dá um pulo de susto; o 03 freia levantando neve,
 *                volta, puxa o 04 pela mão e o levanta; o grupo retoma a corrida
 *   32+          saída acelerada pela esquerda (prop `exit`), depois a pausa
 *
 * Cada faixa vira UMA animação WAAPI infinita com a duração do ciclo inteiro
 * (história + saída + pausa): tudo fica no mesmo relógio e pausa/retoma junto.
 *
 * planTravel() calcula a travessia a partir da largura real do contêiner, de modo que
 * cada acontecimento ocorra com o seu personagem dentro da tela — em qualquer largura.
 * O cenário é fixo; quando alguém para (04 ofegante, 04 caído, 03 ajudando, duende ao lado),
 * a posição dele recebe o movimento inverso da pista e os pés ficam cravados na neve.
 */
import { RUN_CYCLE } from './characters/barbers/config.js';
import { LANE, SPAN } from './geometry.js';

export const BASE = 32;

export const T = {
  glasses: 7.2, // A
  gust: 9.2, // B
  sneezeStart: 11.0, // C
  sneeze: 11.8,
  hit: 12.55, // a neve acerta o 02
  hitch: 13.3, // D: o duende acelera
  jump: 15.2,
  land: 15.65,
  tired: 17.0,
  off: 18.9, // E: o duende desce
  cheer: 19.4,
  resume: 20.8,
  look: 20.9, // presente
  reach: 21.6,
  grab: 21.8,
  windup: 22.75,
  release: 23.15,
  apex: 23.85,
  catch: 24.6,
  slip: 25.3, // quase tropeço do 03
  slipEnd: 27.2,
  fall: 27.6, // F
  help: 30.0, // o 03 começa a puxar
  up: 30.8, // o 04 está de pé
  regroup: 31.0,
};

/* Pontos medidos no viewBox (ver README › "Personalização") */
const SHOULDER = [437, 90]; // ombro do braço que lança
const HAND_GIFT = [21, -54]; // centro da caixa em relação ao ombro, com o braço a 0°
const RELEASE_ANGLE = 25;
/** Onde a caixa "segurada" do 04 está no instante T.catch (medido na prévia: botão "Medir captura"). */
export const CATCH = { x: 821.8, y: 85.1, rot: 14.5 };
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

/* ------------------------------------------------------------------ utilitários da 3.1 */

const HOLD = null;
const scY = (v) => ({ transform: `scale(1, ${v})` });
const lerp = (a, b, u) => a + (b - a) * u;

/**
 * Ciclo → trecho de história → ciclo → trecho… Cada parte é [história, cicloDepois, folga].
 * cicloDepois omitido = volta ao ciclo-base; HOLD = fica parado até a próxima parte.
 */
function script(spec, parts, end) {
  const out = [];
  let cur = spec;
  let from = 0;
  parts.forEach(([story, after, gap = 0.08]) => {
    if (!story || !story.length) return;
    if (cur) out.push(...cycle(cur, from, story[0][0] - gap));
    out.push(...story);
    from = story[story.length - 1][0] + 0.08;
    cur = after === undefined ? spec : after;
  });
  if (cur) out.push(...cycle(cur, from, end));
  return out;
}

/** Vários saltos na mesma faixa [t, valor] → pisca / liga-desliga com transição curta. */
function pulses(base, list, fn) {
  const k = [[0, fn(base)]];
  list.forEach(([a, b, v, tin = 0.08, tout = 0.14]) => {
    k.push([a - tin, fn(base), EIO], [a, fn(v)], [b, fn(v), EIO], [b + tout, fn(base)]);
  });
  return k;
}

/**
 * Deslocamento do conjunto (em unidades do viewBox) entre dois instantes — é o quanto um
 * personagem parado no chão "fica para trás" enquanto a pista segue. Sem travessia, zero.
 */
function makeDrift(travel) {
  if (!travel || !travel.frames || !travel.frames.length) return { drift: () => 0, times: (a, b, extra = []) => [...new Set([a, ...extra, b])].sort((p, q) => p - q) };
  const { frames, unit } = travel;
  const X = (t) => {
    if (t <= frames[0].t) return frames[0].x;
    for (let i = 1; i < frames.length; i++) {
      if (t <= frames[i].t) {
        const a = frames[i - 1];
        const b = frames[i];
        return lerp(a.x, b.x, (t - a.t) / (b.t - a.t || 1));
      }
    }
    return frames[frames.length - 1].x;
  };
  return {
    drift: (t0, t) => (X(t0) - X(t)) / unit,
    // instantes em que a pista muda de velocidade (para o movimento inverso bater quadro a quadro)
    times: (a, b, extra = []) => {
      const ts = [a, b, ...extra.filter((t) => t > a && t < b), ...frames.map((f) => f.t).filter((t) => t > a + 1e-6 && t < b - 1e-6)];
      return [...new Set(ts.map((t) => Math.round(t * 1000) / 1000))].sort((p, q) => p - q);
    },
  };
}

const ELF_STRIDE = 0.3;
const ELF = {
  thigh: (lp) => ({ period: ELF_STRIDE, phase: lp, keys: [[0, 64, STRIDE], [0.5, -48, STRIDE]] }),
  shin: (lp) => ({ period: ELF_STRIDE, phase: lp, keys: [[0, -12], [0.24, -8], [0.5, -58], [0.74, -124]] }),
  lean: { period: ELF_STRIDE, keys: [[0, -15, EIO], [0.5, -9, EIO]] },
  head: { period: ELF_STRIDE, phase: 0.2, keys: [[0, 7, EIO], [0.5, 14, EIO]] },
  upperN: { period: ELF_STRIDE, keys: [[0, 64, EIO], [0.5, 82, EIO]] },
  foreN: { period: ELF_STRIDE, keys: [[0, 18, EIO], [0.5, 6, EIO]] },
  upperF: { period: ELF_STRIDE, phase: 0.5, keys: [[0, 70, EIO], [0.5, 88, EIO]] },
  foreF: { period: ELF_STRIDE, phase: 0.5, keys: [[0, 14, EIO], [0.5, 2, EIO]] },
  bob: { period: ELF_STRIDE / 2, phase: -0.16, keys: [[0, 0, EIO], [0.5, -2.6, EIO]] },
};

/* ------------------------------------------------------------------ faixas */

function tracks(END, travel) {
  const [rx, ry] = rotatePoint(HAND_GIFT, RELEASE_ANGLE);
  const REL = { x: SHOULDER[0] + rx, y: SHOULDER[1] + ry };
  const list = [];
  const add = (selector, keys) => list.push({ selector, keys });
  const { drift, times } = makeDrift(travel);
  const C = T.catch;
  const F = T.fall;
  const P0 = T.help;
  const UP = T.up;
  const R = T.regroup;

  /* =================== posições na fila (quem para fica cravado no chão) =================== */
  // 04 ofegante: para em T.tired e só volta a correr em T.resume
  const tq0 = T.tired + 0.17;
  const lockQ = (t) => drift(tq0, t);
  // queda final: o 04 já vinha ficando para trás (LAG); cai e fica no chão até ser levantado
  const LAG = 62;
  const tf0 = F + 0.15;
  const lockF = (t) => LAG + drift(tf0, t);
  const HAUL = 102; // ao ser puxado, ele se levanta 102 unidades à frente de onde estavam os pés
  const HANDS = 86; // onde o 03 para (em relação à raia dele): logo adiante da mão estendida do 04 caído
  const Ta = F + 2.05; // o 03 chega
  const locked = (ts, fn, last = EIO) => ts.map((t, i) => [t, fn(t), i === ts.length - 1 ? last : 'linear']);

  const adv04 = [
    [0, 0, 'linear'],
    [T.land - 0.02, 0, 'ease-out'], // o duende aterrissa nas costas
    [T.land + 0.3, -8, EIO],
    [T.land + 0.75, 6, EIO],
    [T.tired, 0, 'ease-in'],
    ...locked(times(T.tired + 0.35, T.resume, [T.off, T.off + 0.4]), lockQ),
    [T.resume + 0.9, lockQ(T.resume) * 0.8, EIO], // arranca; o duende vai ficando um pouco para trás
    [C - 0.5, 6, EIO],
    [C, -8, EIO], // dispara para pegar o presente (CATCH.x depende deste valor)
    [C + 1.2, 0, EIO],
    [F - 0.3, LAG, 'linear'],
    ...locked(times(tf0, P0), lockF),
    ...locked(times(UP, R), (t) => lockF(t) - HAUL),
    [END, lockF(R) - HAUL - 6],
  ];
  add('.cx-b04-advance', as(tx, adv04));

  // duende: distância até o 04 (rel) somada à posição do 04, nos mesmos instantes/curvas
  const GAP = LANE.elf - LANE.b04;
  const SEAT_X = 25; // distância do duende ao 04 enquanto está de carona (ver SEAT)
  const relOff = (t) => (t <= T.off ? SEAT_X : t >= T.off + 0.4 ? 29 : lerp(SEAT_X, 29, (t - T.off) / 0.4));
  const elfX = [
    [0, 12, EIO], [7.5, 4, EIO], [10, 16, EIO], [12.4, 1, EIO],
    [T.hitch, 6, EIO], // acelera para alcançar o 04
    [T.hitch + 0.7, 44 - GAP, EIO],
    [T.jump - 0.02, 44 - GAP, 'linear'],
    [T.land, SEAT_X - GAP, 'ease-out'], // de carona: mesma posição do 04
    [T.land + 0.3, -8 + SEAT_X - GAP, EIO],
    [T.land + 0.75, 6 + SEAT_X - GAP, EIO],
    [T.tired, SEAT_X - GAP, 'ease-in'],
    ...locked(times(T.tired + 0.35, T.resume, [T.off, T.off + 0.4]), (t) => lockQ(t) + relOff(t) - GAP),
    [T.resume + 0.9, lockQ(T.resume) * 0.8 + 50 - GAP, EIO],
    [C - 0.5, 6 + 54 - GAP, EIO],
    [C, -8 + 56 - GAP, EIO],
    [C + 1.2, 50 - GAP, EIO],
    [F - 0.3, LAG + 42 - GAP, 'linear'],
    ...locked(times(tf0, R), (t) => lockF(t) + 42 - GAP),
    [END, lockF(R) - HAUL - 6 + 52 - GAP],
  ];
  add('.cx-elf-drift', as(tx, elfX));

  /* =================== rena: espirro (C) =================== */
  const S0 = T.sneezeStart;
  const S = T.sneeze;
  const I = T.hit;
  const SE = S + 1.1;
  add('.cx-deer-sneeze', as(rot, [
    [0, 0], [S0, 0, EIO],
    [S0 + 0.28, 7, EIO], [S0 + 0.42, 4, EIO], // "ah…"
    [S0 + 0.64, 13, EIO], [S - 0.06, 15, 'cubic-bezier(.6, 0, 1, .5)'], // "aaah…"
    [S + 0.05, -15, 'ease-out'], // "TCHIM!"
    [S + 0.22, -8, EIO], [S + 0.44, 3, EIO], [S + 0.62, -4, EIO], [S + 0.8, 2.5, EIO], [SE, 0],
  ]));
  add('.cx-deer-nose', as(sc, [
    [0, 1], [S0 + 0.05, 1, EIO], [S0 + 0.16, 1.25, EIO], [S0 + 0.27, 1, EIO], [S0 + 0.4, 1.3, EIO], [S0 + 0.52, 1, EIO],
    [S - 0.1, 1.1, EIO], [S + 0.05, 1.4, EIO], [S + 0.35, 1],
  ]));
  add('.cx-deer-eye--open', during([[S0 + 0.56, S + 0.42], [S + 0.66, S + 0.78]], 1));
  add('.cx-deer-eye--shut', during([[S0 + 0.56, S + 0.42], [S + 0.66, S + 0.78]]));
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
  // a neve do espirro: sai do focinho, passa por cima do trenó e do 03 e acerta o rosto do 02
  const HIT = { x: LANE.b02 - 11, y: 81 };
  add('.cx-sneeze-ball', during([[S + 0.06, I]]));
  add('.cx-ball-x', [[0, tx(sx)], [S + 0.06, tx(sx), 'linear'], [I, tx(HIT.x)]]);
  add('.cx-ball-y', [
    [0, ty(sy)],
    [S + 0.06, ty(sy), 'cubic-bezier(.3, .6, .6, 1)'],
    [S + 0.4, ty(3), 'cubic-bezier(.4, 0, .75, .45)'],
    [I, ty(HIT.y)],
  ]);
  add('.cx-ball-spin', [[0, rot(0)], [S + 0.06, rot(0), 'linear'], [I, rot(500)]]);

  /* =================== Papai Noel =================== */
  add('.cx-santa-turn', lookBack([[T.look, T.release + 1.25], [F + 0.7, END - 0.4]]));
  // solavancos: o espirro puxa as rédeas (e ele se abaixa da neve); depois o gesto de pegar e lançar
  add('.cx-santa-react', as(rot, [
    [0, 0], [S, 0, 'ease-out'], [S + 0.12, -7, EIO], [S + 0.4, 6, EIO], [S + 0.72, -1.5, EIO], [SE, 0],
    [T.reach - 0.2, 0, EIO], [T.grab, 5, EIO], [T.grab + 0.5, 2, EIO], [T.windup, 6, 'cubic-bezier(.5, 0, .9, .4)'],
    [T.release, -6, 'ease-out'], [T.release + 0.75, 0],
  ]));
  add('.cx-sleigh-jolt', as(tx, [[0, 0], [S, 0, 'ease-out'], [S + 0.14, 4, EIO], [S + 0.6, 0]]));

  const WAVE = { period: 1.8, keys: [[0, -5, EIO], [0.5, 20, EIO]] };
  const BIG_WAVE = { period: 0.72, keys: [[0, 30, EIO], [0.5, 64, EIO]] };
  add('.cx-wave-arm', as(rot, [
    ...cycle(WAVE, 0, T.look),
    [T.look + 0.3, 8, EIO],
    [T.reach, 42],
    [T.grab + 0.1, 42, EIO],
    [T.grab + 0.5, 12, EIO], // ergue a caixa…
    [T.grab + 0.75, 17, EIO], // …e dá uma olhada nela
    [T.windup, -25, 'cubic-bezier(.5, 0, .9, .4)'],
    [T.release, RELEASE_ANGLE, 'ease-out'],
    [T.release + 0.25, 50, EIO],
    [T.release + 1.05, 8, EIO],
    ...cycle(WAVE, T.release + 1.45, R - 0.5),
    [R - 0.1, 30, EIO],
    ...cycle(BIG_WAVE, R, END), // aceno final, mais alto e mais rápido
  ]));
  const HAND = { period: 1.8, phase: 0.06, keys: [[0, -20, EIO], [0.5, 22, EIO]] };
  const BIG_HAND = { period: 0.72, phase: 0.12, keys: [[0, -30, EIO], [0.5, 30, EIO]] };
  add('.cx-wave-hand', as(rot, [
    ...cycle(HAND, 0, T.look),
    [T.look + 0.3, 0],
    [T.release + 1.05, 0, EIO],
    ...cycle(HAND, T.release + 1.45, R - 0.5),
    ...cycle(BIG_HAND, R, END),
  ]));
  add('.cx-santa-mouth--alt', during([[T.grab + 0.1, T.windup], [R - 0.1, null]]));
  add('.cx-santa-mouth--main', during([[T.grab + 0.1, T.windup], [R - 0.1, null]], 1));

  /* --- o presente: pilha → mão → voo → braço do 04 (só um visível por vez) --- */
  add('.cx-pile-green', during([[T.grab, null]], 1));
  add('.cx-pile-navy', [
    [0, txy(0, 0)],
    [T.grab, txy(0, 0), 'cubic-bezier(.5, 0, 1, .6)'],
    [T.grab + 0.32, txy(2, 33)],
  ]);
  add('.cx-santa-gift', during([[T.grab, T.release]]));
  add('.cx-gift-fly', during([[T.release, C]]));
  add('.cx-gift-x', [[0, tx(REL.x)], [T.release, tx(REL.x), 'linear'], [C, tx(CATCH.x)]]);
  add('.cx-gift-y', [
    [0, ty(REL.y)],
    [T.release, ty(REL.y), 'cubic-bezier(.3, .6, .6, 1)'],
    [T.apex, ty(APEX_Y), 'cubic-bezier(.4, 0, .75, .45)'],
    [C, ty(CATCH.y)],
  ]);
  add('.cx-gift-spin', [[0, rot(RELEASE_ANGLE)], [T.release, rot(RELEASE_ANGLE), 'linear'], [C, rot(CATCH.rot + 360)]]);

  /* =================== barbeiro 01: óculos escorregando (A) =================== */
  {
    const b = '.cx-barber--b01 ';
    const G = T.glasses;
    const c = RUN_CYCLE.b01;
    // os óculos giram em torno da haste (na orelha) e descem pelo nariz; s = 0 no lugar, 1 = na ponta do nariz
    const gl = (s) => ({ transform: `translate(7.3px, -3.4px) rotate(${(-20 * s).toFixed(2)}deg) translate(-7.3px, 3.4px) translate(${(-2 * s).toFixed(2)}px, ${(2.5 * s).toFixed(2)}px)` });
    add(b + '.cx-b-glasses', [
      [0, gl(0)], [G, gl(0), 'ease-in'], [G + 0.42, gl(1), EIO], [G + 0.56, gl(0.82), EIO], [G + 0.7, gl(1), EIO],
      [G + 0.98, gl(1), 'ease-out'], // a mão chega…
      [G + 1.16, gl(-0.12), EIO], // …e empurra de volta
      [G + 1.32, gl(0)],
    ]);
    const up = { period: c.bs, phase: c.bp + 0.5, keys: [[0, c.ar[0], EIO], [0.5, c.ar[1], EIO]] };
    const fo = { period: c.bs, phase: c.bp + 0.5, keys: [[0, c.fo[0], EIO], [0.5, c.fo[1], EIO]] };
    add(b + '.cx-b-upper.cx-b--near', as(rot, script(up, [[[
      [G + 0.55, 30, EIO], [G + 0.95, 112, EIO], [G + 1.16, 119, EIO], [G + 1.34, 110, EIO], [G + 1.72, 10, EIO],
    ]]], END)));
    add(b + '.cx-b-fore.cx-b--near', as(rot, script(fo, [[[
      [G + 0.55, 84, EIO], [G + 0.95, 86, EIO], [G + 1.16, 97, EIO], [G + 1.34, 86, EIO], [G + 1.72, 80, EIO],
    ]]], END)));
  }

  /* =================== barbeiro 02: leva a neve do espirro (C) =================== */
  {
    const b = '.cx-barber--b02 ';
    add(b + '.cx-b-head', as(rot, [
      [0, 0], [I - 0.02, 0, 'ease-out'], [I + 0.1, 15, EIO], [I + 0.4, 7, EIO], // o tranco
      [I + 0.52, -15, EIO], [I + 0.63, 13, EIO], [I + 0.74, -13, EIO], [I + 0.85, 10, EIO], [I + 0.96, -6, EIO], [I + 1.08, 0], // sacode
    ]));
    add(b + '.cx-b-eyes', pulses(1, [[I, I + 0.5, 0.12, 0.02], [I + 1.12, I + 1.2, 0.12, 0.05, 0.06], [I + 1.36, I + 1.44, 0.12, 0.05, 0.06]], scY));
    const sf = (o, x, y, s) => ({ opacity: o, transform: `translate(${x}px, ${y}px) scale(${s})` });
    add(b + '.cx-b-snowface', [
      [0, sf(0, 0, 0, 0.5)], [I - 0.02, sf(0, 0, 0, 0.5)], [I, sf(1, 0, 0, 0.6), 'ease-out'], [I + 0.1, sf(1, 0, 0, 0.95), EIO],
      [I + 0.2, sf(1, 0, 0, 0.86)], [I + 0.36, sf(1, 0, 0, 0.86), 'ease-in'], [I + 0.54, sf(0.9, 2, 5, 0.7), 'ease-in'], [I + 0.76, sf(0, 7, 20, 0.45)],
    ]);
    for (let i = 0; i < 7; i++) {
      const a = (-170 + i * 52) * (Math.PI / 180);
      const d = 15 + (i % 3) * 6;
      const bit = (o, x, y, s) => ({ opacity: o, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s})` });
      const s2 = I + 0.52 + (i % 3) * 0.1;
      add(`.cx-splat-bit--${i}`, [
        [0, bit(0, 0, 0, 0.4)], [I - 0.02, bit(0, 0, 0, 0.4)], [I, bit(1, 0, 0, 0.7), 'ease-out'],
        [I + 0.26, bit(1, Math.cos(a) * d, Math.sin(a) * d * 0.8, 1), 'ease-in'], [I + 0.5, bit(0, Math.cos(a) * d + 10, Math.sin(a) * d * 0.8 + 22, 0.7)],
        // sacudindo a cabeça: mais um pouquinho de neve voa
        [s2, bit(0, 4, 4, 0.5)], [s2 + 0.02, bit(1, 4, 4, 0.6), 'ease-out'],
        [s2 + 0.22, bit(1, 4 + Math.cos(a) * d * 0.7, 4 + Math.sin(a) * d * 0.5, 0.8), 'ease-in'], [s2 + 0.5, bit(0, 12 + Math.cos(a) * d * 0.7, 30, 0.5)],
      ]);
    }
  }

  /* =================== reações compartilhadas do 02 e do 01 =================== */
  const G = T.glasses;
  const trip = T.slip + 0.3;
  const t5 = T.slip + 1.62;
  const t6 = T.slipEnd;
  [['b02', 0.1, 15, -18], ['b01', 0.3, 8, -30]].forEach(([id, lag, back, close]) => {
    const s = `.cx-barber--${id} `;
    const gasp = [trip + lag, t5];
    const wow = [];
    const brow = [];
    if (id === 'b01') { wow.push([G + 0.4, G + 1.34]); brow.push([G + 0.4, G + 1.3, -3]); }
    if (id === 'b02') { wow.push([I + 0.02, I + 1.05]); brow.push([I + 0.5, I + 1.1, -2.4]); }
    wow.push([C + 0.5, C + 1.0], gasp, [F + 0.7, F + 2.2]);
    brow.push([C + 0.5, C + 0.85, -2], [gasp[0], gasp[1], -2], [F + 0.7, F + 2.2, -2.4]);
    add(s + '.cx-b-face--alt', during(wow));
    add(s + '.cx-b-face--main', during(wow, 1));
    add(s + '.cx-b-brows', pulses(0, brow, ty));
    if (id === 'b01') add(s + '.cx-b-eyes', pulses(1, [[G + 0.42, G + 1.25, 1.35]], sc));
    add(s + '.cx-b-turn', lookBack([[C + 0.45, C + 1.0], [F + 0.7, UP + 0.1]]));
    // freadas: o tranco da neve (02), o susto com o 03 e, no fim, fecham a fila enquanto o 03 volta
    const k = [[0, 0, 'linear']];
    if (id === 'b02') k.push([I - 0.03, 0, 'ease-out'], [I + 0.15, 8, EIO], [I + 0.95, 0, EIO]);
    k.push([gasp[0] - 0.15, 0, EIO], [gasp[0] + 0.45, back, EIO], [t5 - 0.2, back, EIO], [t6 + 0.9, 0, EIO], [F + 0.8, 0, EIO], [F + 2.0, close, 'linear'], [END, close]);
    add(`.cx-${id}-brake`, as(tx, k));
  });

  /* =================== barbeiro 03: vento no cabelo (B), quase tropeço e socorro ao 04 (F) =================== */
  {
    const b = '.cx-barber--b03 ';
    const R3 = runSpecs(RUN_CYCLE.b03);
    const H = T.gust;
    const t0 = T.slip; // o pé toca torto
    const t1 = t0 + 0.3; // o pé desliza para a frente
    const t2 = t0 + 0.64; // corpo para trás, braços abertos
    const t3 = t0 + 0.9; // balança…
    const t4 = t0 + 1.18; // …balança…
    const OUT = 'cubic-bezier(.2, .7, .3, 1)';
    const a = Ta;

    // --- B: a rajada
    for (let i = 0; i < 3; i++) {
      const g = (o, x) => ({ opacity: o, transform: `translateX(${x}px)` });
      const s0 = H + i * 0.09;
      add(`.cx-gust-line--${i}`, [
        [0, g(0, -95)], [s0, g(0, -95), 'ease-out'], [s0 + 0.1, g(0.75, -60), 'linear'], [s0 + 0.36, g(0.65, 20), 'ease-in'], [s0 + 0.55, g(0, 70)],
        [s0 + 0.62, g(0, -95)], [s0 + 0.66, g(0.6, -70), 'linear'], [s0 + 0.95, g(0, 50)],
      ]);
    }
    add(b + '.cx-b-hairgust', as(rot, [
      [0, 0], [H + 0.05, 0, 'ease-out'], [H + 0.24, -72, EIO], [H + 0.38, -50, EIO], [H + 0.52, -76, EIO], [H + 0.68, -54, EIO],
      [H + 0.84, -68, EIO], [H + 1.0, -48, EIO], [H + 1.25, -22, EIO], [H + 1.45, -30, EIO], [H + 1.7, 0],
    ]));
    const mess = (o, s, r) => ({ opacity: o, transform: `scale(${s}) rotate(${r}deg)` });
    add(b + '.cx-b-hairmess', [
      [0, mess(0, 0.2, 0)], [H + 0.08, mess(0, 0.2, 0), 'ease-out'], [H + 0.1, mess(1, 0.3, 0), 'ease-out'], [H + 0.28, mess(1, 1.12, 8), EIO],
      [H + 0.42, mess(1, 0.95, -6), EIO], [H + 0.56, mess(1, 1.08, 7), EIO], [H + 0.72, mess(1, 0.96, -5), EIO], [H + 0.9, mess(1, 1.02, 4), EIO],
      [H + 1.1, mess(1, 1, 0), EIO], // a mão passa e assenta os fios
      [H + 1.3, mess(1, 0.62, 6), EIO], [H + 1.42, mess(1, 0.7, 2), EIO], [H + 1.62, mess(1, 0.28, 8), 'linear'], [H + 1.66, mess(0, 0.2, 8)],
    ]);

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
    // B: a mão da frente sobe e alisa o cabelo para trás, duas passadas
    const gust = {
      upperN: [[H + 0.62, 60, EIO], [H + 1.0, 184, EIO], [H + 1.5, 188, EIO], [H + 1.9, 20, EIO]],
      foreN: [[H + 0.62, 80, EIO], [H + 1.0, 62, EIO], [H + 1.14, 34, EIO], [H + 1.28, 60, EIO], [H + 1.42, 34, EIO], [H + 1.52, 52, EIO], [H + 1.9, 84, EIO]],
      head: [[H + 0.1, 5, 'ease-out'], [H + 0.3, -9, EIO], [H + 0.9, -5, EIO], [H + 1.5, 2, EIO], [H + 1.8, 5]],
    };
    // F: freia (derrapa), vira, volta correndo, agacha, puxa o 04 pela mão e o levanta
    const run = (spec) => cycle(spec, F + 1.14, a - 0.14);
    const help = {
      thighN: [[F + 0.5, 52, EIO], [F + 0.95, 46, EIO], ...run(R3.thigh(0)), [a + 0.25, 70, EIO], [P0, 70, EIO], [P0 + 0.4, 46, EIO], [UP, 14, EIO], [R - 0.02, 8]],
      shinN: [[F + 0.5, -2, EIO], [F + 0.95, -8, EIO], ...run(R3.shin(0)), [a + 0.25, -115, EIO], [P0, -115, EIO], [P0 + 0.4, -70, EIO], [UP, -10, EIO], [R - 0.02, -10]],
      thighF: [[F + 0.5, 6, EIO], [F + 0.95, 14, EIO], ...run(R3.thigh(0.5)), [a + 0.25, 65, EIO], [P0, 65, EIO], [P0 + 0.4, 30, EIO], [UP, -12, EIO], [R - 0.02, -6]],
      shinF: [[F + 0.5, -50, EIO], [F + 0.95, -60, EIO], ...run(R3.shin(0.5)), [a + 0.25, -110, EIO], [P0, -110, EIO], [P0 + 0.4, -60, EIO], [UP, -18, EIO], [R - 0.02, -12]],
      lean: [[F + 0.5, 16, EIO], [F + 0.95, 8, EIO], ...run(R3.lean), [a + 0.25, -42, EIO], [P0, -42, EIO], [P0 + 0.4, -14, EIO], [UP, 12, EIO], [R - 0.02, -4]],
      head: [[F + 0.5, -8, EIO], [F + 0.95, -4, EIO], ...run(R3.head), [a + 0.25, 26, EIO], [P0, 26, EIO], [P0 + 0.4, 6, EIO], [UP, -6, EIO], [R - 0.02, 4]],
      upperN: [[F + 0.5, -70, EIO], [F + 0.95, -40, EIO], ...run(R3.upper(0.5)), [a + 0.25, 78, EIO], [P0, 78, EIO], [P0 + 0.4, 74, EIO], [UP, 70, EIO], [R - 0.02, 20]],
      foreN: [[F + 0.5, 40, EIO], [F + 0.95, 60, EIO], ...run(R3.fore(0.5)), [a + 0.25, 4, EIO], [P0, 4, EIO], [UP, 6, EIO], [R - 0.02, 70]],
      upperF: [[F + 0.5, 80, EIO], [F + 0.95, 50, EIO], ...run(R3.upper(0)), [a + 0.25, 81, EIO], [P0, 81, EIO], [P0 + 0.4, 76, EIO], [UP, 72, EIO], [R - 0.02, -10]],
      foreF: [[F + 0.5, 30, EIO], [F + 0.95, 60, EIO], ...run(R3.fore(0)), [a + 0.25, 4, EIO], [P0, 4, EIO], [UP, 6, EIO], [R - 0.02, 74]],
      bob: [[F + 0.5, 5, EIO], [F + 0.95, 3, EIO], ...cycle(R3.bob, F + 1.14, a - 0.14), [a + 0.25, 23, EIO], [P0, 23, EIO], [P0 + 0.4, 11, EIO], [UP, 1, EIO], [R - 0.02, 0]],
    };
    const part = (sel, spec, key) => add(b + sel, as(rot, script(spec, [[gust[key]], [story[key]], [help[key]]], END)));
    part('.cx-b-thigh.cx-b--near', R3.thigh(0), 'thighN');
    part('.cx-b-shin.cx-b--near', R3.shin(0), 'shinN');
    part('.cx-b-thigh.cx-b--far', R3.thigh(0.5), 'thighF');
    part('.cx-b-shin.cx-b--far', R3.shin(0.5), 'shinF');
    part('.cx-b-upper.cx-b--near', R3.upper(0.5), 'upperN');
    part('.cx-b-fore.cx-b--near', R3.fore(0.5), 'foreN');
    part('.cx-b-upper.cx-b--far', R3.upper(0), 'upperF');
    part('.cx-b-fore.cx-b--far', R3.fore(0), 'foreF');
    part('.cx-b-lean', R3.lean, 'lean');
    part('.cx-b-headjoint', R3.head, 'head');
    add('.cx-barber--b03', as(ty, script(R3.bob, [[story.bob], [help.bob]], END)));

    // posição: o escorregão leva o quadril à frente; na queda do 04 ele derrapa, vira e volta
    // pela pista da frente (um pouco abaixo) até as mãos do amigo — e fica parado no chão ali
    const p = (x, y) => txy(x.toFixed(2), y);
    add('.cx-b03-slip', [
      [0, p(0, 0)], [t0, p(0, 0), EIO], [t1, p(-7, 0), EIO], [t2, p(-9, 0), EIO], [t4, p(-5, 0), EIO], [t6, p(0, 0)],
      [F + 0.45, p(0, 0), 'ease-out'], [F + 0.95, p(14, 0), EIO], [F + 1.12, p(16, 3), EIO],
      ...times(a, R).map((t, i, ts) => [t, p(HANDS + lockF(t), 5), i === ts.length - 1 ? EIO : 'linear']),
      [END, p(HANDS + lockF(R) - 6, 5)],
    ]);
    add('.cx-b03-face', [[0, flip(1)], [F + 0.95, flip(1), EIO], [F + 1.1, flip(-1)], [R - 0.15, flip(-1), EIO], [R, flip(1)]]);
    add(b + '.cx-b-turn', lookBack([[F + 0.35, F + 0.9]]));

    // expressões: susto com o vento, com o escorregão e ao ver o 04 no chão
    const scare = [t0 + 0.12, t5 + 0.1];
    const wow = [[H + 0.2, H + 1.0], scare, [F + 0.35, F + 1.3]];
    add(b + '.cx-b-face--alt', during(wow));
    add(b + '.cx-b-face--main', during(wow, 1));
    add(b + '.cx-b-brows', pulses(0, [[H + 0.22, H + 0.95, -2.6], [scare[0] + 0.1, scare[1] - 0.1, -2.8], [F + 0.4, F + 1.2, -2.6]], ty));
    add(b + '.cx-b-eyes', pulses(1, [[H + 0.22, H + 0.9, 1.3], [scare[0] + 0.1, scare[1] - 0.1, 1.35], [F + 0.4, F + 1.2, 1.3]], sc));
    add('.cx-b03-kick', during([[t0, t6 + 0.2], [F + 0.5, R + 0.1]], 1));

    // neve espalhada: pelo pé que desliza (quase tropeço) e pela freada (F)
    for (let i = 0; i < SPRAY_BITS; i++) {
      const ang = (-155 + i * 19) * (Math.PI / 180); // leque para a frente e para cima
      const d = 15 + (i % 3) * 7;
      const px = Math.cos(ang) * d;
      const py = Math.sin(ang) * d * 0.9;
      const bit = (o, x, y, s) => ({ opacity: o, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s})` });
      const burst = (s0, k) => [
        [s0, bit(0, 0, 0, 0.4)],
        [s0 + 0.02, bit(1, 0, 0, 0.6), 'ease-out'],
        [s0 + 0.3, bit(1, px * k, py * k, 1), 'cubic-bezier(.4, 0, .9, .6)'],
        [s0 + 0.85, bit(0, px * k + 34, 4, 0.7)],
      ];
      add(`.cx-spray-bit--${i}`, [[0, bit(0, 0, 0, 0.4)], ...burst(t0 + 0.04 + (i % 2) * 0.1, 1), ...burst(F + 0.5 + (i % 2) * 0.08, 1.25)]);
    }
    [[9, -13], [15, -5], [3, -17]].forEach(([dx, dy], i) => {
      const dr = (o, x, y) => ({ opacity: o, transform: `translate(${x}px, ${y}px) rotate(${x * 2}deg)` });
      const drops = (s0) => [[s0, dr(0, 0, 0)], [s0 + 0.02, dr(1, 0, 0), 'ease-out'], [s0 + 0.35, dr(1, dx, dy), 'ease-in'], [s0 + 0.65, dr(0, dx + 8, dy + 8)]];
      add(`.cx-sweat-drop--${i}`, [[0, dr(0, 0, 0)], ...drops(H + 0.25 + i * 0.09), ...drops(t1 + i * 0.09)]);
    });
  }

  /* =================== barbeiro 04: carona, cansaço, presente e queda =================== */
  const L = T.land;
  const Q = T.tired;
  const RS = T.resume;
  const PANT = { period: 0.56, keys: [[0, -50, EIO], [0.5, -45, EIO]] };
  // tronco do 04 enquanto leva o duende: o duende acompanha exatamente estes quadros (ver "carona")
  const lean04 = [
    [L - 0.02, -12, 'ease-out'], [L + 0.18, -30, EIO], [L + 0.5, 6, EIO], [L + 0.85, -22, EIO], [L + 1.15, -8, EIO], [Q, -12, EIO], // desequilibra e recupera
    [Q + 0.4, -50, EIO], ...cycle(PANT, Q + 0.45, T.off - 0.1), [T.off, -48, EIO], // mãos nos joelhos, ofegante
    ...cycle(PANT, T.off + 0.08, RS - 0.58), [RS - 0.5, -46, EIO], [RS - 0.1, -6, EIO], [RS, -12],
  ];
  {
    const b = '.cx-barber--b04 ';
    const c = RUN_CYCLE.b04;
    const R4 = runSpecs(c);
    const arm = (a, bb, lp) => ({ period: c.bs, phase: c.bp + lp, keys: [[0, a, EIO], [0.5, bb, EIO]] });
    const SW = { upperN: arm(-38, 36, 0), foreN: arm(86, 96, 0), upperF: arm(36, -38, 0), foreF: arm(96, 86, 0) }; // balanço de corrida
    const CARRY = { upperN: arm(17, 23, 0), foreN: arm(97, 93, 0), upperF: arm(25, 31, 0), foreF: arm(90, 86, 0) }; // caixa junto ao peito

    // D/E: o duende cai nas costas → braços rodando; depois para, mãos nos joelhos
    const ride = {
      lean: lean04,
      head: [[L - 0.02, 8.4, 'ease-out'], [L + 0.18, 22, EIO], [L + 0.5, -6, EIO], [L + 0.85, 16, EIO], [Q, 8.4, EIO], [Q + 0.4, 26, EIO], [RS - 0.5, 24, EIO], [RS - 0.1, 6, EIO], [RS, 8.4]],
      upperN: [[L - 0.02, 0, 'ease-out'], [L + 0.18, 75, EIO], [L + 0.5, -125, EIO], [L + 0.85, 80, EIO], [L + 1.15, -30, EIO], [Q, 10, EIO], [Q + 0.4, 27, EIO], [RS - 0.5, 27, EIO], [RS - 0.05, 0]],
      foreN: [[L - 0.02, 88, 'ease-out'], [L + 0.18, 30, EIO], [L + 0.5, 24, EIO], [L + 0.85, 50, EIO], [L + 1.15, 80, EIO], [Q, 60, EIO], [Q + 0.4, 4, EIO], [RS - 0.5, 4, EIO], [RS - 0.05, 88]],
      upperF: [[L - 0.02, 0, 'ease-out'], [L + 0.18, 85, EIO], [L + 0.5, -110, EIO], [L + 0.85, 64, EIO], [L + 1.15, 20, EIO], [Q, 14, EIO], [Q + 0.4, 30, EIO], [RS - 0.5, 30, EIO], [RS - 0.05, 0]],
      foreF: [[L - 0.02, 92, 'ease-out'], [L + 0.18, 26, EIO], [L + 0.5, 30, EIO], [L + 0.85, 44, EIO], [L + 1.15, 84, EIO], [Q, 60, EIO], [Q + 0.4, 6, EIO], [RS - 0.5, 6, EIO], [RS - 0.05, 90]],
      bob: [
        [L - 0.02, 0, 'ease-out'], [L + 0.15, 5, EIO], [L + 0.5, -2, EIO], [L + 0.85, 3, EIO], [Q, 0, EIO], [Q + 0.4, 5.6, EIO],
        ...cycle({ period: 0.56, keys: [[0, 5.6, EIO], [0.5, 4.6, EIO]] }, Q + 0.45, RS - 0.58), [RS - 0.5, 5.4, EIO], [RS - 0.1, 0.5, EIO], [RS, 0],
      ],
      thighN: [[Q + 0.4, 30, EIO], [RS - 0.5, 30, EIO], [RS - 0.08, 8]],
      shinN: [[Q + 0.4, -45, EIO], [RS - 0.5, -45, EIO], [RS - 0.08, -12]],
      thighF: [[Q + 0.4, 22, EIO], [RS - 0.5, 22, EIO], [RS - 0.08, -4]],
      shinF: [[Q + 0.4, -38, EIO], [RS - 0.5, -38, EIO], [RS - 0.08, -10]],
    };
    // presente: estende os braços para pegar → carrega a caixa
    const reach = (up, lo, carryUp, carryLo) => [
      [[C - 0.9, up[0], EIO], [C - 0.35, up[1]], [C + 0.08, up[1], EIO], [C + 0.65, carryUp]],
      [[C - 0.9, lo[0], EIO], [C - 0.35, lo[1]], [C + 0.08, lo[1], EIO], [C + 0.65, carryLo]],
    ];
    const near = reach([0, 114], [88, 16], 20, 95);
    const far = reach([0, 106], [92, 22], 28, 88);
    const grab = { upperN: near[0], foreN: near[1], upperF: far[0], foreF: far[1] };
    // F: a ponta do pé prende, ele cai de frente (o braço da caixa sobe para salvá-la), ergue a
    // cabeça, estende a outra mão; o 03 puxa e ele volta a ficar de pé
    const fall = {
      thighN: [[F, -10, EIO], [F + 0.42, -4, EIO], [P0, -4, EIO], [P0 + 0.4, 50, EIO], [UP, 6, EIO], [R, 6]],
      shinN: [[F, -70, EIO], [F + 0.42, -6, EIO], [P0, -6, EIO], [P0 + 0.4, -80, EIO], [UP, -6, EIO], [R, -8]],
      thighF: [[F, 30, EIO], [F + 0.42, 6, EIO], [P0, 6, EIO], [P0 + 0.4, 24, EIO], [UP, -6, EIO], [R, -6]],
      shinF: [[F, -20, EIO], [F + 0.42, -35, EIO], [F + 0.8, -62, EIO], [F + 1.1, -30, EIO], [F + 1.4, -56, EIO], [F + 1.8, -32, EIO], [P0, -32, EIO], [P0 + 0.4, -60, EIO], [UP, -8, EIO], [R, -10]],
      lean: [[F, -20, EIO], [F + 0.42, -6, EIO], [P0, -6, EIO], [UP, -4, EIO], [R, -12]],
      head: [[F, 10, EIO], [F + 0.42, -12, EIO], [F + 0.95, -12, EIO], [F + 1.25, 42, EIO], [P0, 42, EIO], [UP, 6, EIO], [R, 8.4]],
      upperN: [[F, 20, EIO], [F + 0.3, -60, EIO], [F + 0.42, -80, EIO], [P0, -80, EIO], [UP, 10, EIO], [R, 17]],
      foreN: [[F, 95, EIO], [F + 0.42, 20, EIO], [P0, 20, EIO], [UP, 80, EIO], [R, 97]],
      upperF: [[F, 28, EIO], [F + 0.42, 178, EIO], [F + 1.3, 178, EIO], [F + 2.0, 202, EIO], [P0, 202, EIO], [P0 + 0.4, 150, EIO], [UP, 102, EIO], [R - 0.05, 96, EIO], [R + 0.25, 25]],
      foreF: [[F, 88, EIO], [F + 0.42, 4, EIO], [F + 2.1, 12, EIO], [UP, 6, EIO], [R - 0.05, 6, EIO], [R + 0.25, 90]],
      bob: [[F, 0], [R, 0]],
    };
    const part = (sel, spec, key, afterGrab) =>
      add(b + sel, as(rot, script(spec, [[ride[key], undefined, 0.3], [grab[key], afterGrab], [fall[key], afterGrab]], END)));
    part('.cx-b-thigh.cx-b--near', R4.thigh(0), 'thighN');
    part('.cx-b-shin.cx-b--near', R4.shin(0), 'shinN');
    part('.cx-b-thigh.cx-b--far', R4.thigh(0.5), 'thighF');
    part('.cx-b-shin.cx-b--far', R4.shin(0.5), 'shinF');
    part('.cx-b-lean', R4.lean, 'lean');
    part('.cx-b-headjoint', R4.head, 'head');
    ['upperN', 'foreN', 'upperF', 'foreF'].forEach((key) => {
      const sel = `.cx-b-${key.startsWith('upper') ? 'upper' : 'fore'}.cx-b--${key.endsWith('N') ? 'near' : 'far'}`;
      add(b + sel, as(rot, script(SW[key], [[ride[key], SW[key], 0.1], [grab[key], CARRY[key]], [fall[key], CARRY[key]]], END)));
    });
    add('.cx-barber--b04', as(ty, script(R4.bob, [[ride.bob], [fall.bob]], END)));
    add('.cx-b04-hop', as(ty, [[0, 0], [C - 0.28, 0, 'ease-out'], [C, -7, 'ease-in'], [C + 0.3, 0]]));

    // o corpo inteiro gira em torno dos pés: cai de frente, quica de leve e é puxado de volta
    const body = (y, r) => ({ transform: `translate(0px, ${y}px) rotate(${r}deg)` });
    add('.cx-b04-body', [
      [0, body(0, 0)], [F, body(0, 0), 'cubic-bezier(.55, 0, .9, .5)'], [F + 0.42, body(-8, -84), 'ease-out'], [F + 0.53, body(-11, -78), 'ease-in'],
      [F + 0.64, body(-8, -84)], [P0, body(-8, -84), EIO], [P0 + 0.4, body(-4, -46), EIO], [UP - 0.08, body(0, 5), EIO], [UP + 0.1, body(0, 0)],
    ]);
    add('.cx-b04-prone-shadow', [[0, op(0)], [F + 0.3, op(0)], [F + 0.45, op(0.3)], [P0 + 0.1, op(0.3)], [P0 + 0.45, op(0)]]);
    add('.cx-b04-kick', during([[Q + 0.2, RS], [F + 0.08, R + 0.05]], 1));

    add(b + '.cx-b-heldgift', during([[C, null]]));
    const wow = [[L, L + 1.2], [Q + 0.4, RS - 0.45], [C - 0.6, C + 0.6], [F - 0.04, F + 0.44], [F + 1.25, UP]];
    add(b + '.cx-b-face--alt', during(wow)); // surpresa / boca aberta de cansaço
    add(b + '.cx-b-face--main', during(wow, 1));
    add(b + '.cx-b-brows', pulses(0, [[L + 0.05, L + 1.1, -2.4], [C - 0.5, C + 0.5, -2.2], [F + 1.3, UP - 0.1, -2.4]], ty));
    add(b + '.cx-b-eyes', pulses(1, [[L + 0.05, L + 1.0, 1.3, 0.05], [Q + 0.9, Q + 1.0, 0.15, 0.05, 0.08], [Q + 1.9, Q + 2.0, 0.15, 0.05, 0.08], [F + 1.3, F + 1.38, 0.15, 0.04, 0.06], [F + 1.6, F + 1.68, 0.15, 0.04, 0.06]], scY));
    add(b + '.cx-b-turn', lookBack([[T.hitch + 1.0, T.hitch + 1.6]])); // olha o duende que pede carona
    const sf = (o, x, y, s) => ({ opacity: o, transform: `translate(${x}px, ${y}px) scale(${s})` });
    add(b + '.cx-b-snowface', [
      [0, sf(0, 0, 0, 1)], [F + 0.4, sf(0, 0, 0, 1)], [F + 0.44, sf(1, 0, 0, 1)], [F + 1.3, sf(1, 0, 0, 1), 'ease-in'], [F + 1.5, sf(0.9, -2, 5, 0.8), 'ease-in'], [F + 1.75, sf(0, -5, 16, 0.5)],
    ]);
    // bafinhos de cansaço
    for (let i = 0; i < 4; i++) {
      const pf = (o, x, y, s) => ({ opacity: o, transform: `translate(${x}px, ${y}px) scale(${s})` });
      const s0 = Q + 0.62 + i * 0.56;
      add(`.cx-pant--${i}`, [[0, pf(0, 0, 0, 0.3)], [s0, pf(0, 0, 0, 0.3), 'ease-out'], [s0 + 0.1, pf(0.9, -4, -1, 0.7), 'linear'], [s0 + 0.6, pf(0, -16, -9, 1.25)]]);
    }
    // neve que espirra quando ele cai
    for (let i = 0; i < 9; i++) {
      const ang = (-175 + i * 21) * (Math.PI / 180);
      const d = 20 + (i % 3) * 9;
      const x0 = (i - 4) * 9;
      const bit = (o, x, y, s) => ({ opacity: o, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s})` });
      const s0 = F + 0.4 + (i % 2) * 0.05;
      add(`.cx-fall-bit--${i}`, [
        [0, bit(0, x0, 0, 0.4)], [s0, bit(0, x0, 0, 0.4)], [s0 + 0.02, bit(1, x0, 0, 0.7), 'ease-out'],
        [s0 + 0.3, bit(1, x0 + Math.cos(ang) * d, Math.sin(ang) * d, 1.1), 'ease-in'], [s0 + 0.8, bit(0, x0 + Math.cos(ang) * d * 1.3, 2, 0.7)],
      ]);
    }
    add('.cx-catch-burst', [
      [0, { opacity: 0, transform: 'scale(0.2)' }],
      [C - 0.03, { opacity: 0, transform: 'scale(0.2)' }],
      [C, { opacity: 1, transform: 'scale(0.3)' }, 'ease-out'],
      [C + 0.45, { opacity: 0, transform: 'scale(1.25) rotate(40deg)' }],
    ]);
  }

  /* =================== duende: pede carona, pula, desce, incentiva, se assusta =================== */
  {
    const J = T.jump;
    const O = T.off;
    const CH = T.cheer;
    const h = T.hitch;
    const WAVE = { period: 0.34, keys: [[0, 152, EIO], [0.5, 112, EIO]] };
    const WAVE_F = { period: 0.34, phase: 0.15, keys: [[0, 0, EIO], [0.5, 24, EIO]] };
    const PAT = { period: 0.24, keys: [[0, 128, EIO], [0.5, 104, EIO]] };
    const hop = (t, a, bb) => [[t, a, 'ease-out'], [t + 0.12, bb, 'ease-in'], [t + 0.25, a]];
    // D: ergue o braço da frente (com o presentinho) e acena para o 04, olhando para ele, aos pulinhos
    const ask = {
      upperN: [[h + 0.55, 100, EIO], ...cycle(WAVE, h + 0.7, J - 0.22)],
      foreN: [[h + 0.55, 10, EIO], ...cycle(WAVE_F, h + 0.7, J - 0.22)],
      head: [[h + 0.6, 23, EIO], [J - 0.22, 25, EIO]],
      lean: [[h + 0.6, -6, EIO], [J - 0.22, -8, EIO]],
    };
    // salto → carona (pernas em volta da cintura, braços nos ombros) → desce → tapinhas → "vamos!"
    const ridePose = {
      thighN: [[J - 0.15, 70, EIO], [J, 8, 'ease-out'], [J + 0.25, 50, EIO], [L, 78, EIO], [O, 78, EIO], [O + 0.4, 35, EIO], [O + 0.55, 4, EIO], ...hop(CH + 0.75, 4, 22), ...hop(CH + 1.05, 4, 22), [RS - 0.05, 4]],
      shinN: [[J - 0.15, -110, EIO], [J, -4, 'ease-out'], [J + 0.25, -70, EIO], [L, -55, EIO], [O, -55, EIO], [O + 0.4, -70, EIO], [O + 0.55, -2, EIO], ...hop(CH + 0.75, -2, -44), ...hop(CH + 1.05, -2, -44), [RS - 0.05, -2]],
      thighF: [[J - 0.15, 60, EIO], [J, 24, 'ease-out'], [J + 0.25, 36, EIO], [L, 88, EIO], [O, 88, EIO], [O + 0.4, 25, EIO], [O + 0.55, -4, EIO], ...hop(CH + 0.75, -4, 14), ...hop(CH + 1.05, -4, 14), [RS - 0.05, -4]],
      shinF: [[J - 0.15, -100, EIO], [J, -12, 'ease-out'], [J + 0.25, -60, EIO], [L, -72, EIO], [O, -72, EIO], [O + 0.4, -60, EIO], [O + 0.55, -4, EIO], ...hop(CH + 0.75, -4, -38), ...hop(CH + 1.05, -4, -38), [RS - 0.05, -4]],
      lean: [[J - 0.15, -26, EIO], [J, -30, EIO], [J + 0.25, -18, EIO], [L, -22, EIO], [O, -22, EIO], [O + 0.4, -14, EIO], [O + 0.5, -4, EIO], [CH + 0.12, -13, EIO], [CH + 0.7, -13, EIO], [CH + 0.85, -4, EIO], [RS - 0.05, -8]],
      head: [[J - 0.15, 10, EIO], [J + 0.25, 20, EIO], [L, 14, EIO], [O, 14, EIO], [O + 0.5, 20, EIO], [CH + 0.7, 20, EIO], [CH + 0.85, 8, EIO], [RS - 0.05, 10]],
      upperN: [[J - 0.15, 60, EIO], [J + 0.25, 100, EIO], [L, 72, EIO], [O, 72, EIO], [O + 0.5, 18, EIO], [RS - 0.2, 18, EIO], [RS - 0.05, 70]],
      foreN: [[J - 0.15, 20, EIO], [L, 24, EIO], [O, 24, EIO], [O + 0.5, 46, EIO], [RS - 0.2, 46, EIO], [RS - 0.05, 14]],
      upperF: [[J - 0.15, 150, EIO], [J, 160, EIO], [J + 0.25, 120, EIO], [L, 84, EIO], [O, 84, EIO], [O + 0.4, 130, EIO], [CH, 124, EIO], ...cycle(PAT, CH + 0.02, CH + 0.68), [CH + 0.8, 98, EIO], [RS - 0.15, 98, EIO], [RS - 0.05, 80]],
      foreF: [[J - 0.15, 10, EIO], [L, 16, EIO], [O, 16, EIO], [O + 0.4, 8, EIO], [CH, 6, EIO], [CH + 0.7, 6, EIO], [CH + 0.8, 0, EIO], [RS - 0.05, 8]],
      bob: [[J - 0.15, 3, EIO], [J, 0], [RS - 0.05, 0]],
    };
    // F: pulo de susto, fica olhando aflito (mãos na cabeça), comemora quando o 04 levanta
    const u = UP;
    const fright = {
      thighN: [[F + 0.2, 10, EIO], [F + 0.4, 30, EIO], [F + 0.6, 6, EIO], [u + 0.05, 6, EIO], [u + 0.22, 30, EIO], [u + 0.4, 6]],
      shinN: [[F + 0.2, -10, EIO], [F + 0.4, -50, EIO], [F + 0.6, -4, EIO], [u + 0.05, -4, EIO], [u + 0.22, -50, EIO], [u + 0.4, -4]],
      thighF: [[F + 0.2, -6, EIO], [F + 0.4, 20, EIO], [F + 0.6, -4, EIO], [u + 0.05, -4, EIO], [u + 0.22, 20, EIO], [u + 0.4, -4]],
      shinF: [[F + 0.2, -10, EIO], [F + 0.4, -40, EIO], [F + 0.6, -4, EIO], [u + 0.05, -4, EIO], [u + 0.22, -40, EIO], [u + 0.4, -4]],
      lean: [[F + 0.2, -4, EIO], [F + 0.4, 6, EIO], [F + 0.6, -4, EIO], [u + 0.4, -6]],
      head: [[F + 0.2, 12, EIO], [F + 0.4, 2, EIO], [F + 0.6, 10, EIO], [u + 0.4, 12]],
      upperN: [[F + 0.2, 100, EIO], [F + 0.4, 140, EIO], [F + 0.6, 112, EIO], [u + 0.05, 112, EIO], [u + 0.22, 150, EIO], [u + 0.4, 80]],
      foreN: [[F + 0.2, 20, EIO], [F + 0.4, 10, EIO], [F + 0.6, 56, EIO], [u + 0.05, 56, EIO], [u + 0.22, 10, EIO], [u + 0.4, 14]],
      upperF: [[F + 0.2, 120, EIO], [F + 0.4, 166, EIO], [F + 0.6, 132, EIO], [u + 0.05, 132, EIO], [u + 0.22, 170, EIO], [u + 0.4, 84]],
      foreF: [[F + 0.2, 10, EIO], [F + 0.4, 8, EIO], [F + 0.6, 66, EIO], [u + 0.05, 66, EIO], [u + 0.22, 8, EIO], [u + 0.4, 8]],
      bob: [[F + 0.2, 0, EIO], ...cycle({ period: 0.32, keys: [[0, 0, EIO], [0.5, -1.6, EIO]] }, F + 0.7, u), [u + 0.4, 0]],
    };
    const e = '.cx-elf ';
    const part = (sel, spec, key) => add(sel, as(rot, script(spec, [[ask[key], undefined, 0.1], [ridePose[key], undefined, 0.1], [fright[key]]], END)));
    part(e + '.cx-elf-thigh.cx-elf--near', ELF.thigh(0), 'thighN');
    part(e + '.cx-elf-thigh.cx-elf--far', ELF.thigh(0.5), 'thighF');
    part(e + '.cx-elf-shin.cx-elf--near', ELF.shin(0), 'shinN');
    part(e + '.cx-elf-shin.cx-elf--far', ELF.shin(0.5), 'shinF');
    part(e + '.cx-elf-lean', ELF.lean, 'lean');
    part(e + '.cx-elf-head', ELF.head, 'head');
    part(e + '.cx-elf-upper.cx-elf--near', ELF.upperN, 'upperN');
    part(e + '.cx-elf-fore.cx-elf--near', ELF.foreN, 'foreN');
    part(e + '.cx-elf-upper.cx-elf--far', ELF.upperF, 'upperF');
    part(e + '.cx-elf-fore.cx-elf--far', ELF.foreF, 'foreF');
    add('.cx-elf', as(ty, script(ELF.bob, [[ridePose.bob], [fright.bob]], END)));

    // carona: o duende fica preso às costas do 04 — a posição gira em torno do quadril dele
    // junto com o tronco (mesmos quadros de lean04)
    const SEAT = [25, 15];
    const HIP = -47;
    const seat = (lean) => {
      const [x, y] = rotatePoint(SEAT, lean + 12);
      return [x - SEAT[0], HIP + y, lean + 12];
    };
    const riding = lean04.filter(([t]) => t > L && t <= O);
    const at = ([x, y]) => txy(x.toFixed(2), y.toFixed(2));
    const hopY = (t, hgt) => [[t, txy(0, 0), 'ease-out'], [t + 0.12, txy(0, -hgt), 'ease-in'], [t + 0.25, txy(0, 0)]];
    add('.cx-elf-lift', [
      [0, txy(0, 0)], ...hopY(h + 0.8, 5), ...hopY(h + 1.14, 6), ...hopY(h + 1.48, 5),
      [J - 0.02, txy(0, 0), 'cubic-bezier(.2, .7, .4, 1)'], [J + 0.25, txy(0, -66), 'cubic-bezier(.5, 0, .8, .5)'],
      [L, at(seat(-12)), 'ease-out'],
      ...riding.map(([t, v, ez]) => [t, at(seat(v)), ez]),
      [O + 0.02, at(seat(-48)), 'ease-in'], [O + 0.4, txy(0, 0)],
      ...hopY(CH + 0.75, 7), ...hopY(CH + 1.05, 7),
      [F + 0.2, txy(0, 0), 'ease-out'], [F + 0.4, txy(0, -17), 'ease-in'], [F + 0.6, txy(0, 0)],
      [u + 0.05, txy(0, 0), 'ease-out'], [u + 0.22, txy(0, -13), 'ease-in'], [u + 0.4, txy(0, 0)],
    ]);
    add('.cx-elf-tilt', as(rot, [
      [0, 0], [J - 0.15, 0, EIO], [J, -14, EIO], [J + 0.25, -24, EIO], [L, 0, 'ease-out'],
      ...riding.map(([t, v, ez]) => [t, v + 12, ez]),
      [O + 0.02, -36, 'ease-in'], [O + 0.4, 0],
      [F + 0.2, 0, EIO], [F + 0.4, 12, EIO], [F + 0.6, 0],
    ]));
    add('.cx-elf-shadow', [[0, op(1)], [J, op(1)], [J + 0.2, op(0)], [O + 0.2, op(0)], [O + 0.4, op(1)]]);
    add('.cx-elf-kick', during([[J - 0.1, RS], [F + 0.2, u + 0.4]], 1));
  }

  return list;
}

/**
 * Cria as animações da história dentro de `root`.
 * @param {Element} root
 * @param {{ scale: number, total: number, endBase: number, travel?: { frames: {t:number,x:number}[], unit: number } }} timing
 *        scale = duration / 32 · total = ciclo inteiro em segundos · endBase = fim da saída (em s-base)
 *        travel = a travessia planejada (planTravel) e quantos px vale uma unidade do viewBox
 * @returns {Animation[]}
 */
export function createStory(root, { scale, total, endBase, travel }) {
  const anims = [];
  tracks(endBase, travel).forEach(({ selector, keys }) => {
    const els = root.querySelectorAll(selector);
    if (!els.length) return;
    const frames = [];
    let last = -1;
    keys.forEach(([t, props, easing]) => {
      const offset = Math.min(1, Math.max(0, (t * scale) / total));
      if (offset < last) return; // quadro fora de ordem: ignorado
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
 *    duende até 9 s). Em telas estreitas o conjunto é quase da largura da tela e a faixa
 *    funciona como uma câmera que acompanha a ação;
 *  · enquanto o 04 está parado (ofegante, ou caído na neve), o conjunto anda mais devagar,
 *    para ele não ficar longe demais — é ele quem fica cravado no chão, o cenário não se mexe;
 *  · depois da história, saída acelerada (nunca há reinício com alguém visível).
 *
 * @returns {{ frames: {t: number, x: number}[], end: number }}  t em segundos-base
 */
export function planTravel({ W, L, exit = 4 }) {
  const m = Math.max(4, L * 0.012);
  const dt = 0.5;
  const n = Math.round(BASE / dt);
  const lo = new Array(n + 1).fill(-Infinity);
  const hi = new Array(n + 1).fill(W);
  const wide = W >= L * 1.8;

  const need = (t0, t1, [a, b]) => {
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      if (t < t0 - 1e-6 || t > t1 + 1e-6) continue;
      lo[i] = Math.max(lo[i], m - a * L);
      hi[i] = Math.min(hi[i], W - m - b * L);
    }
  };
  need(T.glasses - 0.2, T.glasses + 1.8, SPAN.glasses);
  need(T.gust - 0.2, T.gust + 1.8, SPAN.gust);
  need(T.sneezeStart, T.hit + 0.9, SPAN.sneeze);
  need(T.hitch, T.tired, SPAN.hitch);
  need(T.tired, T.resume, SPAN.tired);
  need(T.look, T.release, SPAN.sleigh);
  need(T.release, T.catch + 0.5, SPAN.throwArc);
  need(T.slip - 0.2, T.slipEnd, SPAN.b03);
  need(T.fall - 0.2, BASE, wide ? SPAN.all : SPAN.finale);

  if (wide) {
    const by = (t, frac) => {
      const i = Math.round(t / dt);
      hi[i] = Math.min(hi[i], W - frac * L);
    };
    by(4, 0.56);
    by(7, 0.905);
    by(9, 1.0);
  }
  for (let i = 0; i <= n; i++) if (lo[i] > hi[i]) lo[i] = hi[i] = (lo[i] + hi[i]) / 2;

  // velocidade relativa de cada trecho: mais lenta enquanto o 04 está parado no chão
  const cruise = (W + L * 0.1) / BASE; // px/s, aproximado
  const slow = clamp((24 * L) / 1000 / cruise, 0.15, 0.6); // alvo ≈ 24 unidades do viewBox por segundo
  const w = new Array(n + 1).fill(1); // w[i] = trecho entre i-1 e i
  for (let i = 1; i <= n; i++) {
    const t = (i - 0.5) * dt;
    if ((t > T.tired + 0.2 && t < T.resume) || (t > T.fall + 0.2 && t < T.regroup)) w[i] = slow;
  }

  // pontas fixas: começa encostado na borda direita; no fim está o mais à esquerda que o final permite
  const x0 = W;
  const xN = Math.min(lo[n], hi[n]);
  const x = Array.from({ length: n + 1 }, (_, i) => x0 + ((xN - x0) * i) / n);
  for (let it = 0; it < 1500; it++) {
    for (let i = 1; i < n; i++) {
      const a = 1 / w[i];
      const b = 1 / w[i + 1];
      x[i] = clamp((x[i - 1] * a + x[i + 1] * b) / (a + b), lo[i], hi[i]);
    }
  }
  // arredonda as mudanças de velocidade e garante que o conjunto nunca volte para trás
  for (let pass = 0; pass < 2; pass++) {
    const y = x.slice();
    for (let i = 1; i < n; i++) x[i] = clamp(y[i - 1] * 0.25 + y[i] * 0.5 + y[i + 1] * 0.25, lo[i], hi[i]);
  }
  for (let i = 1; i <= n; i++) x[i] = Math.min(x[i], x[i - 1]);

  const frames = x.map((v, i) => ({ t: i * dt, x: v }));

  // saída: parte da velocidade de cruzeiro e acelera até sumir (o 03, o 04 e o duende vêm um pouco atrás)
  const xEnd = -L * 1.2;
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
