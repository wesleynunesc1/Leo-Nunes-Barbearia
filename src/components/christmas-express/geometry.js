/**
 * Christmas Express 3.1 — geometria da cena (unidades do viewBox).
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
  glasses: [0.72, 0.81], // óculos do 01
  gust: [0.56, 0.7], // cabelo do 03
  sneeze: [0.02, 0.74], // da rena que espirra ao 02 que leva a neve
  hitch: [0.8, 1.0], // duende pede carona e pula nas costas do 04
  tired: [0.8, 1.08], // 04 parado, ofegante; duende incentiva
  sleigh: [0.3, 0.56],
  throwArc: [0.4, 0.95],
  b03: [0.555, 0.705], // quase tropeço
  finale: [0.56, 1.1], // queda do 04, 03 volta para ajudar
  all: [0.02, 1.1],
};
