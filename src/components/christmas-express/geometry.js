/**
 * Christmas Express 3.0 — geometria da cena (unidades do viewBox).
 *
 * O viewBox ganhou uma faixa de chão abaixo dos pés (y 188 → 218) e espaço para o duende
 * no fim da fila. Tudo o que depende dessas medidas (CSS, travessia, rastro) lê daqui.
 */
export const VIEW = { x: 0, y: -4, w: 1000, h: 222 };
export const VIEW_BOX = `${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`;

/** Linha do chão: onde os pés, os cascos e os patins do trenó tocam a neve. */
export const GROUND_Y = 188;

/** Posição (x) de cada personagem na fila — a frente é a esquerda. */
export const LANE = {
  b03: 620,
  b02: 692,
  b01: 764,
  b04: 862,
  elf: 940,
};

/**
 * Trechos da fila (frações da largura do conjunto) que precisam estar na tela em cada
 * momento da história. A travessia é planejada em cima disto — ver planTravel() em story.js.
 */
export const SPAN = {
  deer: [0.02, 0.26],
  sleigh: [0.3, 0.56],
  b03: [0.555, 0.705],
  throwArc: [0.4, 0.93],
  b04: [0.75, 0.93],
  all: [0.02, 0.97],
  finale: [0.34, 0.93],
};
