/** Cores comuns dos barbeiros (roupa preta desenhada em grafite para o contorno continuar legível). */
export const C = {
  hair: '#1B1819',
  hairHi: '#4F484B',
  tee: '#34323A',
  teeFar: '#29272E',
  pants: '#2A2930',
  pantsFar: '#212026',
  shoe: '#19181C',
  sole: '#6A6670',
  line: '#111013',
  tattoo: '#27323C',
  metal: '#8A7236',
  silver: '#D5DAE0',
};

const TOP = 123; // topo do crânio para 1,70 m, em unidades do viewBox

function make(id, cfg) {
  const top = TOP * (cfg.height / 1.7);
  const headY = -(top - cfg.ry); // centro da cabeça
  const shoulder = top - 2 * cfg.ry - 1; // queixo ≈ linha do ombro
  return { id, ...cfg, top, headY, k: shoulder / 86 };
}

/**
 * rx/ry: meia-largura e meia-altura do rosto · jaw: 0.7 (fino) – 0.95 (quadrado)
 * k (calculado): escala do corpo para a altura real — o 04 fica 5,9% mais baixo.
 */
export const BARBERS = {
  b01: make('b01', {
    n: '01', height: 1.7, rx: 13.2, ry: 18, jaw: 0.74,
    skin: '#DDA680', skinShade: '#C48F6B', blush: '#E08E78',
    chest: 0, front: { w: 14.5 }, side: { hx: -1 },
    beard: 0.88, glasses: 'face',
  }),
  b02: make('b02', {
    n: '02', height: 1.7, rx: 16.4, ry: 17.6, jaw: 0.9,
    skin: '#D69B70', skinShade: '#BC845C', blush: '#DE8468',
    chest: 1.2, front: { w: 16 }, side: { hx: -1 },
    beard: 0.4,
  }),
  b03: make('b03', {
    n: '03', height: 1.7, rx: 15, ry: 17.3, jaw: 0.86,
    skin: '#A8724C', skinShade: '#8F5E3C', blush: '#B9624A',
    chest: 1.6, front: { w: 16.5 }, side: { hx: -1 },
    beard: 0.72, glasses: 'top', tattoos: true,
  }),
  b04: make('b04', {
    n: '04', height: 1.6, rx: 15.8, ry: 17, jaw: 0.84,
    skin: '#DFAA84', skinShade: '#C6936E', blush: '#E79280',
    chest: 0, front: { w: 14.8 }, side: { hx: -1 },
    beard: 0.3, polo: true,
  }),
};

export const ORDER = ['b01', 'b02', 'b03', 'b04'];

/** Poses de corrida estáticas (prancha / reduced motion). [coxa, canela] e [braço, antebraço] */
export const RUN_POSE = {
  b01: { lean: -9, legN: [52, -42], legF: [-34, -62], armN: [-48, 78], armF: [44, 88] },
  b02: { lean: -13, legN: [58, -50], legF: [-40, -70], armN: [-62, 92], armF: [58, 100] },
  b03: { lean: -7, legN: [-30, -58], legF: [50, -40], armN: [40, 84], armF: [-44, 74] },
  b04: { lean: -12, legN: [40, -34], legF: [-28, -78], armN: [-38, 86], armF: [36, 96] },
};

/**
 * Ciclo de corrida do 03 e do 04, que na versão 3.0 é conduzido pela linha do tempo
 * (story.js) em vez do CSS: o 03 precisa interromper a passada para o quase tropeço e o 04
 * para pegar o presente. Os valores são os mesmos que o CSS usava na 2.0.
 * bs: duração da passada (s) · bp: defasagem (0–1) · th: coxa [frente, trás] · sh: flexão
 * máxima do joelho · ar/fo: braço e antebraço [frente, trás] · bob: oscilação vertical.
 */
export const RUN_CYCLE = {
  // 01: só o braço da frente é conduzido pela linha do tempo (ele ajeita os óculos); o resto segue no CSS
  b01: { bs: 0.48, bp: 0.3, ar: [46, -46], fo: [92, 74] },
  b03: { bs: 0.52, bp: 0, th: [46, -30], sh: -98, ar: [40, -40], fo: [92, 74], bob: 3.2, lean: -7 },
  b04: { bs: 0.38, bp: 0.45, th: [38, -26], sh: -84, bob: 2.4, lean: -12 },
};
