// Living Christmas Elf 2.3 — personalities, actions, bridges, reactions, expressions.
//
// Action format
//   dur      seconds
//   tracks   { channel: [t0, v0, t1, v1, ...] }  absolute targets (linear between keys)
//            '+channel' = additive on top of whatever is below
//   ev       [[t, 'fx', kind, {x, y}], [t, 'switch']]
//   lock     [[a, b]] windows where a hover may NOT interrupt (click still can)
//   fadeIn / fadeOut   blend times (default .3 / .4)
//   kind     'special' | 'bridge' | 'reaction' | 'expression'
//
// Body-space reference: book centre (100,129); hand grips (64,131) / (136,131);
// mouth (100,88); eyes (85,62)/(115,62); hat band (100,36); seat line y = 170.

export const PERSONALITIES = {
  CURIOUS: {
    label: 'Curioso', share: 0.5, dwell: [8, 13], gap: [1.4, 3.2],
    base: {},
    blink: { every: [2.6, 5.5], dur: 0.16 }, legRate: 1.6, breathRate: 0.24,
  },
  PLAYFUL: {
    label: 'Brincalhão', share: 0.3, dwell: [9, 14], gap: [0.9, 2.2],
    base: { smile: 0.46, blush: 0.75, squint: 0.2, legSwing: 1.0, browL: 0.15, browR: 0.18, headTilt: 2.5, read: 0.75, pupil: 1.08 },
    blink: { every: [2.0, 4.5], dur: 0.14 }, legRate: 2.3, breathRate: 0.27,
  },
  SLEEPY: {
    label: 'Sonolento', share: 0.2, dwell: [10, 15], gap: [1.6, 3.4],
    base: { eyeOpen: 0.58, browL: 0.3, browR: 0.34, browSad: 0.5, smile: 0.06, headTilt: -8, shoulders: -0.8,
      bodyY: 1.2, legSwing: 0.25, bookY: 134, bookRot: -3, read: 0.55, blush: 0.25, squint: 0, lidHappy: 0.12 },
    blink: { every: [1.8, 3.6], dur: 0.48 }, legRate: 1.0, breathRate: 0.17,
  },
};

const LOOK_VISITOR = { lookX: 0, lookY: -0.22, headNod: -0.35 };

export const ACTIONS = {
  // ------------------------------------------------------------------ CURIOUS
  concentrate: { p: 'CURIOUS', w: 3, cd: 6, dur: 4.6, label: 'Lê concentrado',
    tracks: { browKnit: [0, 0, 0.6, 0.4, 4.0, 0.4], squint: [0, 0.1, 0.6, 0.3], headNod: [0, 0.25, 0.8, 0.55], lipPress: [0.5, 0, 1, 0.35],
      smile: [0, 0.18, 1, 0.05], bookY: [0, 129, 0.8, 126], read: [0, 1] } },
  turnPage: { p: 'CURIOUS', w: 2, cd: 7, dur: 2.0, label: 'Vira a página',
    tracks: { pageTurn: [0, 0, 0.35, 0, 1.25, 1, 1.3, 0], hRw: [0, 0, 0.3, 0.3, 1.2, 0.3, 1.6, 0], hRx: [0, 128], hRy: [0, 104],
      lookX: [0, 0.2, 0.4, 0.35, 1.2, -0.3, 1.6, -0.45], lookY: [0, 0.4], read: [0, 0.3, 1.5, 1] } },
  confused: { p: 'CURIOUS', w: 2.2, cd: 12, dur: 3.3, label: 'Franze a testa',
    tracks: { browKnit: [0, 0, 0.5, 1, 2.6, 0.9, 3.3, 0], browL: [0, 0, 0.5, -0.25], browR: [0, 0, 0.5, 0.55], smile: [0, 0.15, 0.5, -0.3],
      skew: [0.5, 0, 0.8, 0.55], headTilt: [0, -3, 0.6, -9], read: [0, 1, 0.5, 0.4], lookX: [0, 0, 0.6, 0.25], lookY: [0, 0.5] },
    ev: [[0.8, 'fx', 'q', { x: 146, y: 14 }]] },
  bookCloser: { p: 'CURIOUS', w: 2, cd: 14, dur: 3.8, label: 'Aproxima o livro do rosto',
    tracks: { bookY: [0, 129, 0.7, 111, 3.0, 111, 3.6, 129], bookScale: [0, 1, 0.7, 1.12, 3.0, 1.12, 3.6, 1], headNod: [0, 0.25, 0.7, 0.85],
      squint: [0, 0.1, 0.8, 0.55], browKnit: [0, 0, 0.8, 0.55], lookY: [0, 0.5, 0.8, 0.75], read: [0, 1], eyeOpen: [0, 1, 0.8, 0.9] } },
  headTiltWonder: { p: 'CURIOUS', w: 2, cd: 10, dur: 2.8, label: 'Inclina a cabeça e levanta a sobrancelha',
    tracks: { headTilt: [0, -3, 0.55, 11, 2.2, 11], browR: [0, 0.05, 0.5, 1], browL: [0, 0.05, 0.5, -0.15], lookX: [0, 0, 0.5, -0.25],
      smile: [0, 0.18, 0.8, 0.1], skew: [0.4, 0, 0.9, -0.4], read: [0, 1, 0.5, 0.5] } },
  lookAround: { p: 'CURIOUS', w: 1.6, cd: 14, dur: 3.5, label: 'Olha para os lados',
    tracks: { read: [0, 0], lookX: [0, 0, 0.3, 0.95, 1.0, 0.95, 1.35, -0.95, 2.1, -0.95, 2.6, 0], lookY: [0, 0.1],
      headTurn: [0, 0, 0.4, 0.55, 1.0, 0.55, 1.5, -0.55, 2.1, -0.55, 2.7, 0], headNod: [0, -0.15], browL: [0, 0.45], browR: [0, 0.45],
      eyeOpen: [0, 1.08], bookY: [0, 132], smile: [0, 0.05] } },
  upsideDown: { p: 'CURIOUS', w: 1.4, cd: 30, dur: 5.4, label: 'Vira o livro de cabeça para baixo',
    tracks: { bookFlip: [0.35, 0, 0.85, 1, 2.75, 1, 3.3, 0], bookY: [0, 129, 0.4, 133, 0.9, 129], read: [0, 1, 2.2, 1, 2.4, 0, 3.5, 0, 4.4, 1],
      browKnit: [1.0, 0, 2.1, 0.8, 2.35, 0], eyeOpen: [2.2, 1, 2.4, 1.18, 3.0, 1.1, 3.4, 1], browL: [2.2, 0.05, 2.4, 0.9, 3.4, 0.2],
      browR: [2.2, 0.05, 2.4, 0.9, 3.4, 0.2], mouthOpen: [2.2, 0, 2.4, 0.28, 3.2, 0], pucker: [2.2, 0, 2.4, 0.7, 3.2, 0],
      smile: [3.2, 0.1, 3.6, 0.6, 5.0, 0.4], blush: [3.2, 0.35, 3.6, 1.1], lidHappy: [3.4, 0, 3.7, 0.35, 4.8, 0.3],
      lookX: [3.4, 0, 3.6, 0.55, 4.6, 0.55], lookY: [3.4, 0.5, 3.6, 0.1], headTilt: [3.4, -3, 3.8, 6] },
    ev: [[2.4, 'fx', 'bang', { x: 148, y: 14 }]], lock: [[0.3, 0.95], [2.7, 3.35]] },
  hardPage: { p: 'CURIOUS', w: 1.6, cd: 20, dur: 5.0, label: 'Tenta virar uma página difícil',
    tracks: { pageTurn: [0, 0, 0.5, 0, 0.9, 0.28, 1.1, 0.03, 1.6, 0.38, 1.85, 0.03, 2.4, 0.1, 3.2, 1, 3.25, 0],
      hRw: [0, 0, 0.4, 0.45, 3.1, 0.45, 3.6, 0], hRx: [0, 126], hRy: [0, 102, 0.9, 98, 1.1, 104, 1.6, 97, 1.85, 104, 2.6, 100],
      browKnit: [0, 0, 0.8, 0.7, 2.9, 0.7, 3.3, 0], lipPress: [0.6, 0, 0.9, 0.6, 1.3, 0], tongueOut: [1.3, 0, 1.5, 0.45, 2.7, 0.45, 2.9, 0],
      mouthOpen: [1.3, 0, 1.5, 0.12, 2.7, 0.12, 2.9, 0], lookX: [0, 0.2, 0.5, 0.45], lookY: [0, 0.4, 0.5, 0.15, 3.3, 0.5],
      smile: [3.1, 0.05, 3.5, 0.55, 4.6, 0.35], read: [0, 0.2, 3.4, 0.2, 4.2, 1], eyeOpen: [3.0, 1, 3.3, 1.08] },
    lock: [[3.0, 3.3]] },
  surprised: { p: 'CURIOUS', w: 1.8, cd: 14, dur: 2.8, label: 'Surpreso com uma passagem',
    tracks: { eyeOpen: [0.2, 1, 0.35, 1.22, 1.6, 1.15, 2.2, 1], browL: [0.2, 0.05, 0.35, 1], browR: [0.2, 0.05, 0.35, 1], mouthOpen: [0.2, 0, 0.35, 0.55, 1.6, 0.45, 2.0, 0.1],
      pucker: [0.2, 0, 0.35, 0.7, 1.8, 0.4, 2.2, 0], headNod: [0.2, 0.25, 0.4, -0.35, 1.6, -0.2], bookY: [0.2, 129, 0.35, 125, 0.7, 128],
      shoulders: [0.2, 0, 0.35, 0.7, 1.2, 0.1], smile: [1.8, 0.1, 2.3, 0.45], read: [0, 1, 0.3, 0.7], pupil: [0.3, 1, 0.4, 0.85] },
    ev: [[0.35, 'fx', 'bang', { x: 150, y: 16 }]] },
  glanceVisitor: { p: 'CURIOUS', w: 1.6, cd: 11, dur: 2.4, label: 'Olha para o visitante',
    tracks: { read: [0, 0], lookX: [0, 0.05], lookY: [0, -0.22], headNod: [0, -0.35], headTurn: [0, 0.12], smile: [0.5, 0.2, 0.9, 0.5],
      browL: [0, 0.3], browR: [0, 0.3], eyeOpen: [0, 1.06] } },
  discovery: { p: 'CURIOUS', w: 1.6, cd: 13, dur: 2.8, label: 'Sorri ao descobrir algo',
    tracks: { eyeOpen: [0.1, 1, 0.3, 1.15, 0.8, 1.0], browL: [0.1, 0.05, 0.3, 0.65, 1.6, 0.4], browR: [0.1, 0.05, 0.3, 0.65, 1.6, 0.4],
      smile: [0.3, 0.15, 0.8, 0.85], lidHappy: [0.6, 0, 1.0, 0.45], teeth: [0.6, 0, 1.0, 0.5], mouthOpen: [0.6, 0, 1.0, 0.14],
      blush: [0.5, 0.35, 1.0, 0.85], read: [0, 1, 0.4, 0.6, 2.0, 1], headNod: [0, 0.25, 0.4, 0.05] },
    ev: [[0.45, 'fx', 'spark', { x: 152, y: 30 }], [0.75, 'fx', 'spark', { x: 50, y: 42 }]] },

  // ------------------------------------------------------------------ PLAYFUL
  silentLaugh: { p: 'PLAYFUL', w: 2.2, cd: 10, dur: 3.1, label: 'Ri silenciosamente',
    tracks: { smile: [0, 0.45, 0.3, 1], lidHappy: [0, 0, 0.3, 1], eyeOpen: [0, 1, 0.3, 0.15], mouthOpen: [0.2, 0, 0.4, 0.45, 2.5, 0.4],
      teeth: [0, 1], blush: [0, 0.8, 0.4, 1.15], shake: [0.25, 0, 0.4, 1, 2.4, 0.9, 2.8, 0], headTilt: [0, 2.5, 0.4, 7], headNod: [0, 0.25, 0.4, 0.4],
      tear: [1.7, 0, 2.2, 0.7, 3.1, 0.7], read: [0, 0] } },
  holdLaugh: { p: 'PLAYFUL', w: 1.8, cd: 13, dur: 3.5, label: 'Tenta segurar o riso',
    tracks: { lipPress: [0.2, 0, 0.5, 1, 2.3, 1, 2.45, 0], cheekPuff: [0.2, 0, 0.6, 1, 2.3, 1, 2.5, 0], smile: [0, 0.45, 0.4, 0.25, 2.4, 0.9],
      eyeOpen: [0, 1, 0.5, 0.65, 2.3, 0.65, 2.5, 0.25], squint: [0, 0.2, 0.5, 0.5], browL: [0, 0.15, 0.5, 0.45], browR: [0, 0.18, 0.5, 0.45],
      blush: [0, 0.8, 0.6, 1.25], shake: [0.5, 0, 0.8, 0.28, 2.3, 0.35, 2.5, 0.9, 3.2, 0.2], lidHappy: [2.35, 0, 2.5, 0.9],
      mouthOpen: [2.35, 0, 2.5, 0.35], teeth: [2.4, 0, 2.5, 1], read: [0, 0.3] },
    ev: [[2.42, 'fx', 'puff', { x: 104, y: 92, vx: 0, vy: 6 }]] },
  coverMouth: { p: 'PLAYFUL', w: 2, cd: 12, dur: 3.3, label: 'Cobre a boca com a mão',
    tracks: { hRw: [0, 0, 0.45, 1, 2.6, 1, 3.1, 0], hRx: [0, 103], hRy: [0, 89], bookRot: [0, 0, 0.5, -9, 2.6, -9, 3.1, 0], bookX: [0, 100, 0.5, 94],
      bookY: [0, 129, 0.5, 133], lidHappy: [0.3, 0, 0.6, 0.85], eyeOpen: [0.3, 1, 0.6, 0.35], smile: [0, 0.45, 0.5, 0.9], mouthOpen: [0, 0, 0.5, 0.3],
      shake: [0.5, 0, 0.7, 0.65, 2.4, 0.5, 2.7, 0], blush: [0, 0.8, 0.6, 1.2], browL: [0, 0.15, 0.6, 0.35], browR: [0, 0.18, 0.6, 0.35],
      headTilt: [0, 2.5, 0.6, -6], read: [0, 0] } },
  funnyFace: { p: 'PLAYFUL', w: 1.6, cd: 15, dur: 2.6, label: 'Faz careta',
    tracks: { read: [0, 0], ...LOOK_VISITOR_TR(), tongueOut: [0.3, 0, 0.5, 1, 1.8, 1, 2.0, 0], mouthOpen: [0.3, 0, 0.5, 0.32, 1.8, 0.32, 2.0, 0],
      cross: [0.4, 0, 0.6, 0.75, 1.7, 0.75, 1.9, 0], browL: [0.3, 0.15, 0.5, 1], browR: [0.3, 0.18, 0.5, -0.45], headTilt: [0.3, 2.5, 0.6, 10, 1.9, 10, 2.2, 3],
      cheekPuff: [0.4, 0, 0.6, 0.3, 1.8, 0], smile: [1.9, 0.3, 2.2, 0.8], lidHappy: [1.95, 0, 2.2, 0.6] } },
  hatSlip: { p: 'PLAYFUL', w: 1.7, cd: 20, dur: 4.0, label: 'O gorro escorrega',
    tracks: { hatSlip: [0.3, 0, 0.75, 1, 1.9, 1, 2.35, 0.2, 2.7, 0], hatTilt: [2.3, 0, 2.5, 6, 2.9, 0],
      hLw: [0, 0, 0.95, 0, 1.3, 1, 2.75, 1, 3.2, 0], hLx: [0, 74, 1.9, 74, 2.4, 70], hLy: [0, 46, 1.9, 54, 2.4, 40],
      bookRot: [0.8, 0, 1.2, 8, 2.8, 8, 3.2, 0], bookX: [0.8, 100, 1.2, 106], mouthOpen: [0.6, 0, 0.8, 0.28, 2.4, 0.05], pucker: [0.6, 0, 0.8, 0.55, 2.4, 0],
      smile: [2.6, 0.2, 3.0, 0.7], lidHappy: [2.7, 0, 3.0, 0.45], read: [0, 0], lookY: [0, -0.4], headNod: [0, 0.2, 0.8, -0.25, 2.8, 0.1] },
    lock: [[0.6, 2.8]] },
  snowSneeze: { p: 'PLAYFUL', w: 1.5, cd: 32, dur: 6.2, label: 'Floco no nariz e espirro',
    tracks: { flakeA: [0, 0, 0.15, 1, 2.68, 1, 2.72, 0], flakeY: [0, -1, 1.3, 0], read: [0, 0],
      lookY: [0, -0.9, 1.3, 0.95, 2.6, 0.9, 2.8, 0.2], lookX: [0, 0], cross: [0.9, 0, 1.4, 1, 2.3, 1, 2.6, 0.4, 2.8, 0],
      headNod: [0, 0.1, 0.4, -0.5, 1.3, 0.35, 2.0, 0.2, 2.5, -0.7, 2.72, 1.1, 3.0, 0.6, 3.6, 0.2],
      browL: [0, 0.1, 1.3, 0.65], browR: [0, 0.1, 1.3, 0.25], browSad: [1.9, 0, 2.3, 0.6, 2.7, 0],
      eyeOpen: [1.9, 1, 2.4, 0.45, 2.68, 0, 2.95, 0, 3.2, 1.2, 3.9, 1.05, 4.2, 0, 4.5, 0.25, 5.2, 0.9],
      mouthOpen: [1.9, 0, 2.3, 0.35, 2.6, 0.45, 2.72, 0.65, 2.95, 0.15, 3.2, 0.3, 3.7, 0.1, 4.3, 0.2, 5.0, 0], pucker: [1.9, 0, 2.3, 0.35, 2.68, 0, 4.2, 0, 4.4, 0.6, 5.0, 0],
      shoulders: [2.5, 0, 2.72, 1, 3.1, 0.3, 4.2, 0.2, 4.6, -0.7, 5.4, -0.3],
      bookRot: [2.68, 0, 2.92, -36, 3.3, -30, 3.7, -8, 4.1, 0], bookY: [2.68, 129, 2.92, 150, 3.3, 148, 3.7, 136, 4.1, 129], bookX: [2.68, 100, 2.92, 105, 3.7, 102, 4.1, 100],
      hLw: [2.68, 0, 2.8, 1, 3.6, 1, 3.85, 0], hLx: [0, 64, 3.0, 64, 3.4, 70], hLy: [0, 128, 3.0, 136, 3.4, 142], smile: [4.4, 0.1, 5.0, 0.45], headTilt: [4.2, 2.5, 4.6, -6] },
    ev: [[2.72, 'fx', 'puff', { x: 100, y: 78, vx: -18, vy: 8 }], [2.74, 'fx', 'puff', { x: 104, y: 80, vx: 16, vy: 10 }],
      [2.78, 'fx', 'puff', { x: 100, y: 84, vx: 0, vy: 16 }], [3.15, 'fx', 'bang', { x: 150, y: 16 }]],
    lock: [[2.5, 4.1]] },
  happyFeet: { p: 'PLAYFUL', w: 1.8, cd: 9, dur: 3.2, label: 'Balança os pés animado',
    tracks: { legSwing: [0, 1, 0.4, 2.3, 2.8, 2.3, 3.2, 1], smile: [0, 0.45, 0.4, 0.65], '+headTilt': [0, 0, 0.4, 4, 0.75, -4, 1.1, 4, 1.45, -4, 1.8, 4, 2.15, -4, 2.5, 3, 2.9, 0],
      read: [0, 0.6], lidHappy: [0.3, 0, 0.6, 0.25] } },
  crossLegs: { p: 'PLAYFUL', w: 1.5, cd: 14, dur: 4.2, label: 'Cruza e descruza as pernas',
    tracks: { legCross: [0.3, 0, 0.9, 1, 2.8, 1, 3.5, 0], legSwing: [0, 1, 0.5, 0.15, 3.4, 0.15, 3.9, 1], smile: [0, 0.45, 0.8, 0.6],
      headTilt: [0, 2.5, 0.8, 5], torsoLean: [0.4, 0, 0.9, -1.4, 2.8, -1.4, 3.4, 0], read: [0, 0.8], '+shoulders': [0.4, 0, 0.7, 0.4, 1.1, 0] } },
  smileWave: { p: 'PLAYFUL', w: 1.7, cd: 14, dur: 3.0, label: 'Sorri e acena para o visitante',
    tracks: { read: [0, 0], ...LOOK_VISITOR_TR(), smile: [0.3, 0.45, 0.6, 0.9], teeth: [0.4, 0, 0.7, 0.6], mouthOpen: [0.4, 0, 0.7, 0.12],
      hRw: [0.4, 0, 0.8, 1, 2.2, 1, 2.7, 0], hRx: [0.4, 150, 0.95, 152, 1.15, 158, 1.35, 149, 1.55, 158, 1.75, 150], hRy: [0, 70],
      bookRot: [0.4, 0, 0.8, -8, 2.3, -8, 2.7, 0], bookX: [0.4, 100, 0.8, 95], browL: [0, 0.4], browR: [0, 0.4], lidHappy: [0.5, 0, 0.8, 0.35] } },
  pointCTA: { p: 'PLAYFUL', w: 1.5, cd: 16, dur: 3.0, label: 'Aponta para o botão',
    tracks: { read: [0, 0], lookX: [0, 0, 0.5, 0.4, 1.4, 0.4, 1.7, 0], lookY: [0, 0.3, 0.5, 1, 1.4, 1, 1.7, -0.2], headNod: [0, 0.2, 0.5, 0.5, 1.5, -0.3],
      hRw: [0.3, 0, 0.7, 1, 2.3, 1, 2.8, 0], hRx: [0, 154], hRy: [0, 156, 1.0, 160, 1.3, 155, 1.6, 160], hRpoint: [0.5, 0, 0.8, 1, 2.2, 1, 2.6, 0],
      bookRot: [0.3, 0, 0.7, -7, 2.3, -7, 2.8, 0], bookX: [0.3, 100, 0.7, 95], smile: [0.5, 0.45, 1.6, 0.85], browL: [0, 0.45], browR: [0, 0.45], eyeOpen: [0, 1.06] } },

  // ------------------------------------------------------------------ SLEEPY
  yawn: { p: 'SLEEPY', w: 2.2, cd: 10, dur: 3.4, label: 'Boceja',
    tracks: { mouthOpen: [0.3, 0, 1.2, 1, 2.2, 0.95, 2.6, 0], pucker: [0.3, 0, 1.2, 0.35], eyeOpen: [0.3, 0.6, 1.0, 0.1, 2.4, 0.1, 2.8, 0.55],
      browSad: [0.3, 0.18, 1.0, 0.6], browL: [0.3, -0.15, 1.0, 0.35], browR: [0.3, -0.1, 1.0, 0.35], headNod: [0.3, 0.2, 1.2, -0.6, 2.4, 0.2],
      shoulders: [0.3, -0.8, 1.2, 0.6, 2.4, -0.8], hLw: [0.6, 0, 1.0, 0.85, 2.3, 0.85, 2.8, 0], hLx: [0, 98], hLy: [0, 99],
      bookRot: [0.6, -3, 1.0, 8, 2.4, 8, 2.8, -3], bookX: [0.6, 100, 1.0, 105], tear: [2.0, 0, 2.6, 0.5, 3.4, 0.5], read: [0, 0] } },
  rubEyes: { p: 'SLEEPY', w: 1.8, cd: 14, dur: 3.0, label: 'Esfrega os olhos',
    tracks: { hLw: [0.3, 0, 0.7, 1, 2.3, 1, 2.75, 0], hRw: [0.3, 0, 0.7, 1, 2.3, 1, 2.75, 0],
      hLx: [0, 84, 1.0, 86, 1.3, 83, 1.6, 86, 1.9, 83], hLy: [0, 70, 1.0, 67, 1.3, 72, 1.6, 67, 1.9, 71],
      hRx: [0, 116, 1.0, 114, 1.3, 117, 1.6, 114, 1.9, 117], hRy: [0, 70, 1.0, 72, 1.3, 67, 1.6, 72, 1.9, 67],
      bookY: [0.3, 134, 0.7, 153, 2.3, 153, 2.75, 134], bookScale: [0.3, 1, 0.7, 0.92, 2.3, 0.92, 2.75, 1], bookRot: [0, -3, 0.7, 0],
      eyeOpen: [0.4, 0.6, 0.7, 0, 2.3, 0, 2.6, 0.75], mouthOpen: [0.7, 0, 1.0, 0.12], pucker: [0.7, 0, 1.0, 0.5], headNod: [0, 0.2, 0.7, 0.4], read: [0, 0] },
    lock: [[0.6, 2.4]] },
  sleepyTilt: { p: 'SLEEPY', w: 1.6, cd: 9, dur: 3.6, label: 'Relaxa e inclina a cabeça',
    tracks: { headTilt: [0, -8, 0.9, -15], shoulders: [0, -0.8, 1.0, -1.3], legSwing: [0, 0.25, 0.8, 0.04], eyeOpen: [0, 0.6, 1.0, 0.42],
      bookY: [0, 134, 1.0, 137], bookRot: [0, -3, 1.0, -6], read: [0, 0.4], smile: [0, 0.06, 1.0, 0.12] } },
  nodOff: { p: 'SLEEPY', w: 2.4, cd: 16, dur: 7.2, label: 'Cochila e acorda assustado',
    tracks: { eyeOpen: [0, 0.6, 1.8, 0, 3.45, 0, 3.6, 1.25, 4.3, 1.1, 5.6, 0.95, 6.6, 0.8],
      headDrop: [0, 0, 2.0, 0.45, 2.15, 0.45, 2.75, 1, 3.45, 1, 3.6, 0], headNod: [3.45, 0.2, 3.6, -0.55, 4.2, -0.1, 5.8, 0.25],
      bookY: [0, 134, 2.0, 139, 3.45, 141, 3.62, 124, 4.2, 129], bookRot: [0, -3, 2.0, -7, 3.45, -7, 3.62, 3, 4.2, 0],
      legSwing: [0, 0.25, 1.5, 0, 3.4, 0, 3.6, 0.2], legKick: [3.5, 0, 3.6, 1, 3.95, 0],
      mouthOpen: [2.2, 0, 2.7, 0.3, 3.45, 0.3, 3.6, 0.32, 4.0, 0.05, 4.6, 0.1, 5.4, 0.05], pucker: [3.5, 0, 3.6, 0.5, 4.0, 0, 4.6, 0.65, 5.4, 0],
      browL: [3.45, -0.15, 3.6, 1, 4.2, 0.35], browR: [3.45, -0.1, 3.6, 1, 4.2, 0.35], shoulders: [3.45, -0.8, 3.6, 1, 4.2, 0],
      read: [0, 0.3, 3.4, 0, 5.6, 0, 6.4, 1], lookX: [4.0, 0, 4.3, 0.85, 4.9, 0.85, 5.2, -0.6, 5.6, -0.6, 5.9, 0], lookY: [4.0, 0.2, 4.3, 0, 5.6, 0],
      headTurn: [4.0, 0, 4.4, 0.3, 4.9, 0.3, 5.3, -0.25, 5.6, -0.2, 6.0, 0], smile: [4.2, 0.06, 4.5, 0.35, 5.5, 0.3], skew: [4.2, 0, 4.5, 0.5, 5.6, 0],
      blush: [4.0, 0.25, 4.4, 0.95, 6.0, 0.6], headTilt: [3.6, -8, 4.2, 4, 6.2, -2] },
    ev: [[2.3, 'fx', 'z', { x: 140, y: 30, size: 11 }], [2.9, 'fx', 'z', { x: 146, y: 22, size: 14 }], [3.35, 'fx', 'z', { x: 152, y: 14, size: 17 }],
      [3.58, 'fx', 'bang', { x: 150, y: 14 }]], lock: [[1.8, 4.0]] },
  microNap: { p: 'SLEEPY', w: 1.6, cd: 12, dur: 3.2, label: 'Cochila por um instante',
    tracks: { eyeOpen: [0.3, 0.6, 1.0, 0, 1.9, 0, 2.05, 0.95, 3.0, 0.75], headDrop: [0.6, 0, 1.4, 0.4, 1.9, 0.42, 2.05, 0],
      '+headTurn': [2.05, 0, 2.2, 0.28, 2.35, -0.28, 2.5, 0.22, 2.65, -0.15, 2.8, 0], browL: [1.95, -0.15, 2.1, 0.6, 2.8, 0.2], browR: [1.95, -0.1, 2.1, 0.6, 2.8, 0.2],
      bookY: [0.6, 134, 1.6, 138, 2.1, 132], read: [0, 0.2, 2.6, 0.8], mouthOpen: [1.2, 0, 1.6, 0.18, 2.0, 0] },
    ev: [[1.5, 'fx', 'z', { x: 140, y: 30, size: 12 }]], lock: [[1.0, 2.1]] },
  bookSlip: { p: 'SLEEPY', w: 1.5, cd: 18, dur: 4.2, label: 'Quase deixa o livro escorregar',
    tracks: { eyeOpen: [0, 0.6, 0.6, 0.25, 1.55, 0.2, 1.65, 1.2, 2.4, 1, 3.2, 0.8], bookY: [0.3, 134, 1.55, 146, 1.75, 144, 2.7, 133],
      bookRot: [0.3, -3, 1.55, -12, 1.75, -9, 2.7, -3], hLw: [0.4, 0, 0.9, 0.55, 1.6, 0.55, 1.75, 0], hRw: [0.4, 0, 0.9, 0.55, 1.6, 0.55, 1.75, 0],
      hLx: [0, 66], hLy: [0, 134], hRx: [0, 134], hRy: [0, 134], browL: [1.55, -0.15, 1.65, 1, 2.6, 0.2], browR: [1.55, -0.1, 1.65, 1, 2.6, 0.2],
      mouthOpen: [1.6, 0, 1.7, 0.35, 2.3, 0.05, 2.8, 0.18, 3.4, 0], pucker: [1.6, 0, 1.7, 0.6, 2.3, 0, 2.8, 0.6, 3.4, 0], browSad: [2.6, 0.18, 2.9, 0.45, 3.8, 0.18],
      shoulders: [1.55, -0.8, 1.7, 0.7, 2.6, -0.3], read: [0, 0.3, 1.6, 0, 3.2, 0.6] },
    ev: [[1.65, 'fx', 'bang', { x: 150, y: 16 }]], lock: [[1.4, 1.9]] },
  stretch: { p: 'SLEEPY', w: 1.3, cd: 20, dur: 3.8, label: 'Se espreguiça discretamente',
    tracks: { hLw: [0.4, 0, 0.9, 1, 2.3, 1, 2.9, 0], hRw: [0.4, 0, 0.9, 1, 2.3, 1, 2.9, 0], hLx: [0, 66, 1.5, 63], hLy: [0, 66, 1.5, 58], hRx: [0, 134, 1.5, 137], hRy: [0, 66, 1.5, 58],
      bookY: [0.4, 134, 0.9, 153], bookScale: [0.4, 1, 0.9, 0.92], bookRot: [0, -3, 0.9, 0], eyeOpen: [0.6, 0.6, 1.0, 0, 2.3, 0, 2.7, 0.7],
      mouthOpen: [0.8, 0, 1.3, 0.45, 2.1, 0.4, 2.4, 0], pucker: [0.8, 0, 1.3, 0.35], headNod: [0.6, 0.2, 1.3, -0.45, 2.4, 0.2], bodyY: [0.8, 1.2, 1.4, -1.2, 2.4, 1.2],
      shoulders: [0.8, -0.8, 1.4, 0.9, 2.4, -0.5], lidHappy: [1.0, 0, 1.4, 0.5, 2.2, 0], read: [0, 0] },
    lock: [[0.8, 2.6]] },

  // ------------------------------------------------------------------ BRIDGES (personality transitions)
  readsFunny: { kind: 'bridge', from: 'CURIOUS', to: 'PLAYFUL', dur: 2.6, label: 'Lê algo engraçado',
    tracks: { read: [0, 1, 1.6, 0.6], eyeOpen: [0.3, 1, 0.5, 1.12, 1.2, 1.0], smile: [0.4, 0.18, 1.0, 0.75], skew: [0.4, 0, 0.9, 0.45, 1.8, 0],
      lipPress: [0.9, 0, 1.1, 0.55, 1.7, 0.4, 2.0, 0], cheekPuff: [1.0, 0, 1.2, 0.45, 1.8, 0], browL: [0.4, 0.05, 0.7, 0.5], shake: [1.2, 0, 1.4, 0.35, 2.2, 0.3, 2.6, 0],
      lidHappy: [1.8, 0, 2.1, 0.5], blush: [0.8, 0.35, 1.4, 0.95] },
    ev: [[1.2, 'switch']] },
  calmDown: { kind: 'bridge', from: 'PLAYFUL', to: 'CURIOUS', dur: 2.8, label: 'Recupera a calma',
    tracks: { shake: [0, 0.25, 0.5, 0], hLw: [0.3, 0, 0.6, 1, 1.3, 1, 1.7, 0], hLx: [0, 77, 0.9, 79, 1.1, 75], hLy: [0, 71, 0.9, 69, 1.1, 72],
      bookRot: [0.3, 0, 0.6, 7, 1.4, 7, 1.7, 0], bookX: [0.3, 100, 0.6, 105, 1.5, 100], tear: [0, 0.5, 1.1, 0], eyeOpen: [0.4, 1, 0.7, 0.55, 1.2, 0.85],
      mouthOpen: [1.3, 0, 1.6, 0.16, 2.0, 0], pucker: [1.3, 0, 1.6, 0.5, 2.0, 0], smile: [0, 0.5, 1.4, 0.2, 2.4, 0.25], read: [0, 0, 1.8, 1], shoulders: [1.4, 0, 1.7, -0.4, 2.4, 0] },
    ev: [[1.0, 'switch']] },
  tiring: { kind: 'bridge', from: 'CURIOUS', to: 'SLEEPY', dur: 3.0, label: 'Começa a cansar',
    tracks: { eyeOpen: [0, 1, 0.8, 0.7, 1.0, 0.3, 1.9, 0.3, 2.4, 0.6], mouthOpen: [0.9, 0, 1.5, 0.5, 2.1, 0], pucker: [0.9, 0, 1.5, 0.3], browSad: [0.6, 0, 1.4, 0.4],
      shoulders: [0.6, 0, 1.4, 0.4, 2.4, -0.8], headNod: [0.9, 0.25, 1.5, -0.3, 2.3, 0.3], read: [0, 1, 0.9, 0.2, 2.6, 0.55] },
    ev: [[0.8, 'switch']] },
  refocus: { kind: 'bridge', from: 'SLEEPY', to: 'CURIOUS', dur: 2.8, label: 'Recupera a concentração',
    tracks: { eyeOpen: [0, 0.6, 0.25, 0.1, 0.45, 1.15, 0.7, 0.2, 0.85, 1.08], '+headTurn': [0.9, 0, 1.05, 0.25, 1.2, -0.25, 1.35, 0.18, 1.5, 0],
      browL: [0.4, -0.15, 0.6, 0.55, 1.8, 0.1], browR: [0.4, -0.1, 0.6, 0.55, 1.8, 0.1], browKnit: [1.6, 0, 2.0, 0.35], shoulders: [0.4, -0.8, 0.8, 0.2, 1.5, 0],
      bookY: [0.6, 134, 1.2, 127, 2.0, 129], headTilt: [0.5, -8, 1.2, -3], read: [0, 0.3, 1.5, 1], lipPress: [1.6, 0, 2.0, 0.3, 2.6, 0] },
    ev: [[0.5, 'switch']] },

  // ------------------------------------------------------------------ REACTIONS (any personality)
  hover: { kind: 'reaction', dur: 2.8, label: 'Hover: olha e aponta o botão',
    tracks: { read: [0, 0], lookX: [0, 0, 1.0, 0.35, 1.5, 0.35, 1.8, 0], lookY: [0, -0.25, 0.9, -0.2, 1.1, 0.95, 1.5, 0.95, 1.8, -0.2],
      headNod: [0, -0.4, 1.0, 0.3, 1.6, -0.3], eyeOpen: [0, 1.1], browL: [0, 0.55], browR: [0, 0.55], smile: [0.2, 0.3, 0.6, 0.8], teeth: [0.4, 0, 0.7, 0.35],
      mouthOpen: [0.3, 0, 0.6, 0.12], hRw: [0.7, 0, 1.05, 1, 2.2, 1, 2.65, 0], hRx: [0, 154], hRy: [0, 156, 1.3, 161, 1.55, 155, 1.8, 160], hRpoint: [0.9, 0, 1.15, 1, 2.1, 1, 2.45, 0],
      bookRot: [0.7, 0, 1.05, -7, 2.2, -7, 2.65, 0], bookX: [0.7, 100, 1.05, 95], headTilt: [0, 2, 0.6, 5], blush: [0, 0.6] },
    fadeIn: 0.22 },
  hoverSleepy: { kind: 'reaction', dur: 3.0, label: 'Hover (sonolento): acorda, olha e aponta',
    tracks: { read: [0, 0], eyeOpen: [0, 0.6, 0.15, 0.3, 0.35, 1.15], browL: [0.2, -0.1, 0.4, 0.75, 1.4, 0.45], browR: [0.2, -0.1, 0.4, 0.75, 1.4, 0.45],
      headDrop: [0, 0], headTilt: [0.2, -8, 0.6, 3], shoulders: [0.2, -0.8, 0.5, 0.3, 1.4, 0], lookX: [0, 0, 1.2, 0.35, 1.7, 0.35, 2.0, 0],
      lookY: [0, -0.25, 1.1, -0.2, 1.3, 0.95, 1.7, 0.95, 2.0, -0.2], headNod: [0, -0.35, 1.2, 0.3, 1.8, -0.3], smile: [0.4, 0.06, 0.8, 0.7], blush: [0.4, 0.25, 0.8, 0.7],
      hRw: [0.9, 0, 1.25, 1, 2.4, 1, 2.85, 0], hRx: [0, 154], hRy: [0, 156, 1.5, 161, 1.75, 155, 2.0, 160], hRpoint: [1.1, 0, 1.35, 1, 2.3, 1, 2.65, 0],
      bookRot: [0.9, -3, 1.25, -7, 2.4, -7, 2.85, -3], bookX: [0.9, 100, 1.25, 95], bookY: [0.3, 134, 0.6, 130] },
    fadeIn: 0.18 },
  click: { kind: 'reaction', dur: 2.2, label: 'Clique: alegria, fecha o livro e acena',
    tracks: { read: [0, 0], lookX: [0, 0], lookY: [0, -0.2], headNod: [0, -0.4], smile: [0, 0.6, 0.15, 1], lidHappy: [0.1, 0, 0.25, 1], eyeOpen: [0, 1.1, 0.25, 0.08, 1.5, 0.08, 1.9, 1],
      mouthOpen: [0.05, 0, 0.2, 0.45, 1.6, 0.3], teeth: [0, 1], blush: [0, 1.1], browL: [0, 0.6], browR: [0, 0.6],
      bookOpen: [0.08, 1, 0.3, 0, 1.6, 0, 1.95, 1], bookX: [0.05, 100, 0.3, 92], bookRot: [0.05, 0, 0.3, -10, 1.7, -10, 2.0, 0], bookY: [0.05, 129, 0.3, 133],
      hRw: [0.1, 0, 0.35, 1, 1.45, 1, 1.8, 0], hRx: [0.2, 148, 0.45, 155, 0.65, 147, 0.85, 156, 1.05, 147, 1.25, 154], hRy: [0, 68], shoulders: [0, 0, 0.2, 0.6, 1.0, 0.2],
      '+headTilt': [0.2, 0, 0.45, 5, 0.75, -4, 1.05, 4, 1.35, 0], legKick: [0.05, 0, 0.18, 0.8, 0.45, 0] },
    fadeIn: 0.1, fadeOut: 0.35 },
  tapElf: { kind: 'reaction', dur: 2.2, label: 'Toque no duende: risadinha e aceno',
    tracks: { read: [0, 0], lookX: [0, 0], lookY: [0, -0.2], headNod: [0, -0.3], smile: [0, 0.5, 0.2, 1], lidHappy: [0.1, 0, 0.3, 0.9], eyeOpen: [0.1, 1, 0.3, 0.25],
      mouthOpen: [0.1, 0, 0.3, 0.35], teeth: [0, 1], blush: [0, 1.15], shake: [0.2, 0, 0.35, 0.7, 1.2, 0.5, 1.5, 0],
      hRw: [1.0, 0, 1.25, 1, 1.85, 1, 2.15, 0], hRx: [1.1, 150, 1.35, 156, 1.55, 149, 1.75, 155], hRy: [0, 70], bookRot: [1.0, 0, 1.25, -8, 1.9, -8, 2.15, 0], bookX: [1.0, 100, 1.25, 95] },
    fadeIn: 0.12 },
  doubleTap: { kind: 'reaction', dur: 2.2, label: 'Toque duplo: susto e risadinha',
    tracks: { read: [0, 0], lookX: [0, 0], lookY: [0, -0.2], headNod: [0, -0.5, 0.5, -0.3], eyeOpen: [0.05, 1, 0.15, 1.25, 0.8, 1.15, 1.1, 0.25],
      browL: [0.05, 0.1, 0.15, 1, 1.0, 0.7], browR: [0.05, 0.1, 0.15, 1, 1.0, 0.7], mouthOpen: [0.05, 0, 0.15, 0.42, 0.9, 0.3, 1.2, 0.35],
      pucker: [0.05, 0, 0.15, 0.7, 0.9, 0.4, 1.1, 0], squash: [0.05, 0, 0.14, -0.9, 0.32, 0.7, 0.5, -0.3, 0.7, 0], shoulders: [0.05, 0, 0.15, 1, 0.8, 0.2],
      legKick: [0.05, 0, 0.15, 1, 0.5, 0], smile: [0.9, 0.2, 1.2, 0.95], lidHappy: [1.0, 0, 1.2, 0.9], teeth: [1.0, 0, 1.2, 1], blush: [0, 0.6, 1.1, 1.2],
      shake: [1.1, 0, 1.25, 0.6, 1.9, 0.4, 2.2, 0], bookY: [0.05, 129, 0.15, 124, 0.5, 129] },
    ev: [[0.15, 'fx', 'bang', { x: 150, y: 14 }]], fadeIn: 0.08 },
  // 1 toque — variações rápidas (o cérebro sorteia com anti-repetição): tapElf · tapCurious · tapWink · tapShy
  tapCurious: { kind: 'reaction', dur: 1.9, label: 'Toque no duende: surpresa curta e sorriso',
    tracks: { read: [0, 0], lookX: [0, 0], lookY: [0, -0.2], eyeOpen: [0, 1, 0.12, 1.16, 0.6, 1.04], browL: [0, 0.1, 0.12, 0.7, 0.9, 0.3], browR: [0, 0.1, 0.12, 0.9, 0.9, 0.35],
      headNod: [0, 0, 0.12, -0.45, 0.8, -0.25], headTilt: [0.3, 0, 0.8, 8], smile: [0.35, 0.1, 0.8, 0.7], blush: [0.4, 0.4, 0.9, 0.85],
      mouthOpen: [0.05, 0, 0.15, 0.18, 0.45, 0.04], pucker: [0.05, 0, 0.15, 0.5, 0.45, 0], squash: [0, 0, 0.08, -0.4, 0.25, 0.25, 0.45, 0], shoulders: [0.05, 0, 0.15, 0.6, 0.7, 0] },
    fadeIn: 0.08 },
  tapWink: { kind: 'reaction', dur: 1.8, label: 'Toque no duende: piscadinha',
    tracks: { read: [0, 0], lookX: [0, 0], lookY: [0, -0.2], headNod: [0, 0, 0.3, -0.35], winkR: [0.25, 0, 0.4, 1, 0.95, 1, 1.15, 0], smile: [0.1, 0.2, 0.4, 0.8],
      skew: [0.2, 0, 0.4, 0.35], blush: [0.2, 0.4, 0.6, 0.9], headTilt: [0.2, 0, 0.45, -6, 1.2, -4], '+torsoLean': [0.2, 0, 0.45, 2, 1.2, 0],
      squash: [0.12, 0, 0.24, -0.25, 0.4, 0.15, 0.55, 0], browL: [0.25, 0.1, 0.4, 0.45] },
    ev: [[0.45, 'fx', 'spark', { x: 128, y: 48 }]], fadeIn: 0.1 },
  tapShy: { kind: 'reaction', dur: 2.0, label: 'Toque no duende: fica envergonhado',
    tracks: { read: [0, 0], smile: [0.1, 0.2, 0.5, 0.55], blush: [0, 0.5, 0.6, 1.35], lidHappy: [0.2, 0, 0.5, 0.35], lookX: [0, 0, 0.2, 0.1, 0.5, 0.65], lookY: [0, -0.2, 0.5, 0.25],
      headTilt: [0.2, 0, 0.6, 7], headTurn: [0.2, 0, 0.6, 0.25], shoulders: [0.1, 0, 0.5, 0.7, 1.5, 0.3], bookY: [0.2, 129, 0.6, 123], squash: [0.04, 0, 0.14, -0.3, 0.35, 0] },
    ev: [[0.7, 'fx', 'heart', { x: 140, y: 24 }]], fadeIn: 0.1 },
  // 2 toques — variação de confusão (alternada com o susto)
  doubleTapConfused: { kind: 'reaction', dur: 2.4, label: 'Toque duplo: confusão evidente',
    tracks: { read: [0, 0], eyeOpen: [0.04, 1, 0.14, 1.15, 0.5, 1], browKnit: [0.3, 0, 0.6, 1, 2.0, 0.9], browL: [0.04, 0.1, 0.14, 0.8, 0.5, -0.3], browR: [0.04, 0.1, 0.14, 0.8, 0.5, 0.75],
      smile: [0.4, 0.1, 0.7, -0.35], skew: [0.5, 0, 0.8, 0.6], headTilt: [0.3, 0, 0.8, -12, 2.0, -11], headTurn: [0.3, 0, 0.8, 0.25, 1.4, -0.15],
      lookX: [0.3, 0, 0.6, 0.45, 1.2, -0.3, 1.7, 0.1], lookY: [0, -0.2, 0.6, 0.05], squash: [0.04, 0, 0.12, -0.5, 0.3, 0.3, 0.5, 0], shoulders: [0.6, 0, 0.9, 0.8, 1.6, 0.6, 2.1, 0] },
    ev: [[0.75, 'fx', 'q', { x: 148, y: 14 }], [1.45, 'fx', 'q', { x: 56, y: 18 }]], fadeIn: 0.08 },
  // 3 toques — percebe que está sendo provocado, faz careta e acaba rindo
  tripleTap: { kind: 'reaction', dur: 3.6, label: 'Toque triplo: percebe a provocação e faz careta',
    tracks: { read: [0, 0], squash: [0, 0, 0.1, -0.45, 0.28, 0.25, 0.45, 0],
      squint: [0.15, 0, 0.45, 0.5, 0.95, 0.45, 1.1, 0], browKnit: [0.15, 0, 0.45, 0.75, 0.95, 0.7, 1.1, 0], lipPress: [0.2, 0, 0.45, 0.5, 0.95, 0.5, 1.05, 0],
      lookX: [0.15, 0, 0.4, 0.65, 0.75, 0.6, 0.95, 0], lookY: [0, -0.15], headTurn: [0.2, 0, 0.5, 0.3, 0.8, 0.25, 1.0, 0],
      tongueOut: [1.0, 0, 1.2, 1, 2.2, 1, 2.4, 0], cross: [1.0, 0, 1.2, 0.75, 2.2, 0.75, 2.4, 0], cheekPuff: [0.95, 0, 1.15, 0.35, 2.2, 0.3, 2.4, 0],
      mouthOpen: [1.0, 0, 1.2, 0.32, 2.2, 0.3, 2.45, 0.55, 3.2, 0.45, 3.6, 0.15],
      browL: [0.9, -0.3, 1.15, 1, 2.2, 1, 2.4, 0.6], browR: [0.9, -0.1, 1.15, -0.45, 2.2, -0.45, 2.4, 0.6],
      headTilt: [1.0, 0, 1.25, 10, 1.6, 5, 1.9, 11, 2.3, 2, 3.4, 0],
      hRw: [0.9, 0, 1.15, 1, 2.2, 1, 2.5, 0], hRx: [0, 133], hRy: [0, 66, 1.4, 61, 1.65, 66, 1.9, 61, 2.15, 66],
      hRcurl: [0.9, 0.85, 1.15, 0.05, 2.2, 0.05, 2.5, 0.85], hRpalm: [0.9, -1, 1.15, 1, 2.2, 1, 2.5, -1], bookRot: [0.9, 0, 1.2, 8, 2.2, 8, 2.5, 0], bookX: [0.9, 100, 1.2, 96],
      smile: [0, 0.2, 0.4, -0.2, 0.95, -0.2, 1.1, 0.3, 2.3, 0.3, 2.5, 1], lidHappy: [2.35, 0, 2.55, 1], eyeOpen: [2.3, 1, 2.5, 0.12, 3.3, 0.12, 3.6, 1], teeth: [2.3, 0, 2.5, 1],
      shake: [2.4, 0, 2.55, 1.1, 3.3, 0.9, 3.6, 0], blush: [0, 0.6, 0.5, 0.9, 2.3, 0.7, 2.6, 1.25], tear: [2.8, 0, 3.2, 0.7, 3.6, 0.7],
      legKick: [2.5, 0, 2.65, 0.8, 2.9, 0], legSwing: [2.4, 0.6, 2.6, 2.2, 3.4, 2.2, 3.6, 0.8] },
    ev: [[0.5, 'fx', 'puff', { x: 66, y: 74 }], [2.6, 'fx', 'note', { x: 150, y: 24 }], [3.1, 'fx', 'note', { x: 48, y: 30 }]], fadeIn: 0.08 },
  // toque longo — olha para o dedo, inclina a cabeça, "toca" o dedo com curiosidade e abraça o livro
  longPress: { kind: 'reaction', dur: 3.9, label: 'Toque longo: olha para o dedo com curiosidade',
    tracks: { read: [0, 0], eyeOpen: [0, 1, 0.15, 1.12, 1.8, 1.08, 2.2, 0.08, 3.3, 0.08, 3.8, 1], browL: [0, 0.1, 0.2, 0.6, 0.8, 0.25], browR: [0, 0.1, 0.2, 0.6, 0.8, 1],
      lookX: [0, 0, 0.25, 0.06], lookY: [0, -0.2, 0.3, 0.05], cross: [0.2, 0, 0.45, 0.35, 1.6, 0.35, 1.9, 0], headNod: [0, 0, 0.3, -0.15],
      headTilt: [0.3, 0, 0.9, 13, 1.8, 13, 2.3, 5, 3.4, 5, 3.8, 0], mouthOpen: [0.3, 0, 0.6, 0.15, 1.3, 0.12, 1.6, 0], pucker: [0.3, 0, 0.6, 0.55, 1.4, 0.4, 1.6, 0],
      smile: [0.2, 0.15, 0.5, 0.05, 1.4, 0.1, 1.8, 0.85], lidHappy: [1.8, 0, 2.2, 1, 3.3, 1, 3.7, 0], blush: [1.4, 0.4, 2.2, 1.35],
      hRw: [0.6, 0, 1.0, 1, 1.7, 1, 2.0, 0], hRx: [0, 126], hRy: [0, 106], hRpoint: [0.7, 0, 1.0, 1, 1.7, 1, 1.9, 0], hRcurl: [0.6, 0.85, 1.0, 0.9, 1.9, 0.9, 2.1, 0.95],
      hRpalm: [0.6, -1, 1.0, 0, 1.7, 0, 2.0, -1], hLcurl: [2.0, 0.85, 2.3, 0.95],
      bookOpen: [2.0, 1, 2.3, 0, 3.3, 0, 3.75, 1], bookY: [2.0, 129, 2.3, 124, 3.3, 124, 3.75, 129], bookZ: [2.0, 0, 2.3, -9, 3.3, -9, 3.75, 0], bookRot: [2.0, 0, 2.3, -6, 3.3, -6, 3.7, 0],
      '+torsoLean': [2.3, 0, 2.7, 3, 3.1, -3, 3.4, 0], shoulders: [2.0, 0, 2.3, 0.6, 3.3, 0.6, 3.6, 0], legSwing: [0, 0.6, 0.5, 0.2, 3.3, 0.2, 3.8, 0.6] },
    ev: [[1.0, 'fx', 'spark', { x: 132, y: 96 }], [2.5, 'fx', 'heart', { x: 140, y: 24 }], [3.0, 'fx', 'heart', { x: 58, y: 30 }]], fadeIn: 0.12 },
  // 5 toques (segredo) — fecha o livro, cruza os braços, faz-se de indignado… e cai na risada (o gorro pula)
  secret: { kind: 'reaction', dur: 5.2, label: 'Segredo (5 toques): fecha o livro, cruza os braços, indignado e depois ri',
    tracks: { read: [0, 0], squash: [0.05, 0, 0.18, -0.5, 0.35, 0.2, 0.5, 0, 2.95, 0, 3.05, -0.35, 3.25, 0.2, 3.45, 0],
      bookOpen: [0.3, 1, 0.6, 0, 4.2, 0, 4.7, 1], bookZ: [0.5, 0, 0.9, -14, 3.9, -14, 4.5, 0], bookY: [0.5, 129, 0.9, 122, 3.9, 122, 4.5, 129], bookRot: [0.5, 0, 0.9, -4, 3.9, -4, 4.4, 0],
      hLw: [0.75, 0, 1.15, 1, 3.9, 1, 4.4, 0], hRw: [0.75, 0, 1.15, 1, 3.9, 1, 4.4, 0], hLx: [0, 124], hLy: [0, 126], hRx: [0, 76], hRy: [0, 119],
      hLcurl: [0.75, 0.85, 1.15, 0.55, 3.9, 0.55, 4.4, 0.85], hRcurl: [0.75, 0.85, 1.15, 0.55, 3.9, 0.55, 4.4, 0.85], hLpalm: [0, -1], hRpalm: [0, -1],
      eyeOpen: [0.05, 1, 0.2, 1.2, 0.5, 1, 1.0, 1, 1.3, 0.85, 2.7, 0.85, 2.95, 0.1, 4.5, 0.1, 4.9, 1],
      browKnit: [0.9, 0, 1.2, 1, 2.6, 1, 2.9, 0], browL: [0.05, 0.1, 0.2, 0.8, 0.9, 0.1, 1.2, -0.35, 2.6, -0.35, 2.9, 0.6], browR: [0.05, 0.1, 0.2, 0.8, 0.9, 0.1, 1.2, -0.15, 2.6, -0.15, 2.9, 0.6],
      smile: [0.9, 0, 1.2, -0.55, 2.6, -0.5, 2.75, 0.2, 2.95, 1], lipPress: [1.0, 0, 1.25, 0.7, 2.5, 0.7, 2.75, 0], cheekPuff: [1.3, 0, 1.5, 0.5, 2.2, 0.5, 2.5, 0],
      headTurn: [1.0, 0, 1.35, -0.6, 2.3, -0.55, 2.7, 0], headNod: [1.0, 0, 1.3, -0.4, 2.6, -0.35, 2.9, -0.2],
      lookX: [1.0, 0, 1.3, -0.8, 1.9, -0.8, 2.1, 0.4, 2.4, 0.4, 2.7, 0], lookY: [0, -0.1], squint: [1.0, 0, 1.3, 0.35, 2.6, 0.4, 2.8, 0],
      shoulders: [0.8, 0, 1.1, 0.8, 2.6, 0.7, 2.9, 0], blush: [1.0, 0.4, 1.4, 0.9, 2.7, 0.9, 3.0, 1.3], legCross: [1.0, 0, 1.4, 1, 3.0, 1, 3.5, 0],
      lidHappy: [2.75, 0, 2.95, 1, 4.5, 1, 4.9, 0], mouthOpen: [2.75, 0, 2.95, 0.5, 4.4, 0.45, 4.8, 0], teeth: [2.7, 0, 2.9, 1],
      shake: [2.9, 0, 3.05, 1.1, 4.4, 1, 4.8, 0], hatPop: [3.0, 0, 4.2, 1, 4.25, 0], '+headTilt': [2.9, 0, 3.2, 6, 3.6, -5, 4.0, 5, 4.4, 0],
      legSwing: [0.8, 0.6, 1.1, 0, 2.9, 0, 3.1, 2.4, 4.4, 2.4, 5.0, 0.8], legKick: [3.0, 0, 3.15, 0.8, 3.4, 0] },
    ev: [[0.2, 'fx', 'bang', { x: 150, y: 10 }], [1.4, 'fx', 'puff', { x: 64, y: 80 }], [1.5, 'fx', 'text', { x: 58, y: 34, text: 'Hmpf!', vy: -5 }],
      [3.1, 'fx', 'text', { x: 100, y: -12, text: 'Ho ho ho!', vy: -6 }], [3.2, 'fx', 'spark', { x: 160, y: -10 }], [3.6, 'fx', 'spark', { x: 40, y: 0 }], [3.9, 'fx', 'note', { x: 156, y: 20 }]],
    lock: [[0, 5.2]], fadeIn: 0.1 },
};

function LOOK_VISITOR_TR() {
  const o = {};
  for (const [k, v] of Object.entries(LOOK_VISITOR)) o[k] = [0, v];
  o.eyeOpen = [0, 1.05];
  return o;
}

// The base set of named expressions (kept from the 2.0 vocabulary; usable from the debug panel
// and via api.expression(name)). Values are channel targets.
export const EXPRESSIONS = {
  neutro: { smile: 0.1, read: 0, ...LOOK_VISITOR },
  lendo: {},
  concentrado: { browKnit: 0.45, squint: 0.35, lipPress: 0.35, smile: 0.05 },
  feliz: { smile: 0.75, blush: 0.8, lidHappy: 0.3, read: 0, ...LOOK_VISITOR },
  alegria: { smile: 1, lidHappy: 1, eyeOpen: 0.05, mouthOpen: 0.42, teeth: 1, blush: 1.1, browL: 0.6, browR: 0.6, read: 0, ...LOOK_VISITOR },
  risada: { smile: 1, lidHappy: 1, eyeOpen: 0.15, mouthOpen: 0.45, teeth: 1, blush: 1.2, shake: 0.9, headTilt: 7, read: 0 },
  surpreso: { eyeOpen: 1.22, browL: 1, browR: 1, mouthOpen: 0.55, pucker: 0.7, headNod: -0.3, read: 0, lookY: 0 },
  confuso: { browKnit: 1, browL: -0.25, browR: 0.55, smile: -0.3, skew: 0.55, headTilt: -9 },
  curioso: { headTilt: 10, browR: 1, browL: -0.15, lookX: -0.25, smile: 0.1, skew: -0.4 },
  piscadinha: { winkR: 1, smile: 0.75, skew: 0.35, blush: 0.8, read: 0, ...LOOK_VISITOR },
  travesso: { smile: 0.7, skew: 0.6, browL: 0.7, browR: -0.1, squint: 0.4, lookX: 0.4, lookY: 0, read: 0 },
  aliviado: { eyeOpen: 0.35, lidHappy: 0.4, smile: 0.45, mouthOpen: 0.12, pucker: 0.5, browSad: 0.35, shoulders: -0.6 },
  sonolento: { eyeOpen: 0.42, browSad: 0.5, browL: 0.3, browR: 0.34, lidHappy: 0.12, smile: 0.05, headTilt: -12, shoulders: -1 },
  dormindo: { eyeOpen: 0, headDrop: 1, mouthOpen: 0.3, legSwing: 0, read: 0 },
  assustado: { eyeOpen: 1.25, browL: 1, browR: 1, mouthOpen: 0.32, pucker: 0.5, shoulders: 1, headNod: -0.5, pupil: 0.8, read: 0 },
  envergonhado: { smile: 0.5, blush: 1.3, lidHappy: 0.3, lookX: 0.6, lookY: 0.2, headTilt: 6, read: 0, skew: 0.3 },
  careta: { tongueOut: 1, mouthOpen: 0.32, cross: 0.75, browL: 1, browR: -0.45, headTilt: 10, read: 0, cheekPuff: 0.3 },
  vesgo: { cross: 1, lookY: 0.9, browL: 0.6, browR: 0.25, mouthOpen: 0.2, pucker: 0.4, read: 0 },
  irritado: { browKnit: 0.9, browL: -0.35, browR: -0.2, smile: -0.45, lipPress: 0.6, cheekPuff: 0.4, lookX: 0.6, lookY: -0.05, headTurn: -0.3, headTilt: -4, squint: 0.35, blush: 0.6, read: 0 },
};

export function expressionAction(name, dur = 2.6) {
  const e = EXPRESSIONS[name];
  const tracks = {};
  for (const [k, v] of Object.entries(e)) tracks[k] = [0, v];
  return { kind: 'expression', dur, tracks, label: 'Expressão: ' + name, fadeIn: 0.3, fadeOut: 0.45 };
}

export const BRIDGES = {
  'CURIOUS>PLAYFUL': 'readsFunny', 'PLAYFUL>CURIOUS': 'calmDown',
  'CURIOUS>SLEEPY': 'tiring', 'SLEEPY>CURIOUS': 'refocus',
};

// Hand poses for 3D fingers: for actions that free a hand, derive curl/palm tracks from the
// hXw keyframes (0 = holding the book, 1 = free with the pose below).
const HANDPOSE = {
  turnPage: { R: [0.5, -1] }, hardPage: { R: [0.45, -1] }, coverMouth: { R: [0.12, -1] }, hatSlip: { L: [0.45, -0.6] },
  snowSneeze: { L: [0.35, 0] }, smileWave: { R: [0.06, 1] }, pointCTA: { R: [0.9, 0] }, yawn: { L: [0.15, -1] },
  rubEyes: { L: [0.65, -1], R: [0.65, -1] }, bookSlip: { L: [0.45, -1], R: [0.45, -1] }, stretch: { L: [0.3, 0.4], R: [0.3, 0.4] },
  calmDown: { L: [0.55, -1] }, hover: { R: [0.9, 0] }, hoverSleepy: { R: [0.9, 0] }, click: { R: [0.06, 1] }, tapElf: { R: [0.08, 1] },
  doubleTap: {},
};
for (const [id, hp] of Object.entries(HANDPOSE)) {
  const a = ACTIONS[id]; if (!a) continue;
  for (const side of ['L', 'R']) {
    const pose = hp[side], wt = a.tracks['h' + side + 'w'];
    if (!pose || !wt || a.tracks['h' + side + 'curl']) continue;
    const curl = [], palm = [];
    for (let i = 0; i < wt.length; i += 2) {
      curl.push(wt[i], 0.85 + (pose[0] - 0.85) * wt[i + 1]);
      palm.push(wt[i], -1 + (pose[1] + 1) * wt[i + 1]);
    }
    a.tracks['h' + side + 'curl'] = curl; a.tracks['h' + side + 'palm'] = palm;
  }
}

// pre-compile tracks: split additive, sort keys
for (const [id, a] of Object.entries(ACTIONS)) {
  a.id = id;
  a.kind = a.kind || 'special';
  compile(a);
}
export function compile(a) {
  a.abs = []; a.add = [];
  for (const [k, arr] of Object.entries(a.tracks)) {
    const add = k.startsWith('+');
    const ch = add ? k.slice(1) : k;
    const keys = [];
    for (let i = 0; i < arr.length; i += 2) keys.push([arr[i], arr[i + 1]]);
    keys.sort((p, q) => p[0] - q[0]);
    (add ? a.add : a.abs).push([ch, keys]);
  }
  a.ev = a.ev || [];
  a.lock = a.lock || [];
  a.fadeIn = a.fadeIn ?? 0.3;
  a.fadeOut = a.fadeOut ?? 0.4;
  return a;
}

export function sample(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  const n = keys.length;
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  for (let i = 1; i < n; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      const u = (t - t0) / (t1 - t0 || 1);
      const s = u * u * (3 - 2 * u); // ease in/out between keys
      return v0 + (v1 - v0) * s;
    }
  }
  return keys[n - 1][1];
}
