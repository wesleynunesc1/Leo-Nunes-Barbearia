/**
 * Paleta e utilitários compartilhados pelos personagens.
 * Tudo aqui é SVG puro — sem dependências.
 */
export const P = {
  ink: '#2B1A16', // contorno
  fur: '#B4703C',
  furDark: '#8C5229',
  furLight: '#E9C79A',
  hoof: '#3B2620',
  antler: '#EBD3A2',
  red: '#C21A30',
  redDark: '#931225',
  gold: '#F0BC4E',
  goldLight: '#FFE7A6',
  goldDark: '#D99A22',
  cream: '#FFF7EA',
  skin: '#F7CBA9',
  blush: '#F08A7C',
  green: '#1E6F55',
  greenDark: '#16543F',
  navy: '#24365C',
  leather: '#5B3A29',
};

export const OUTLINE = {
  stroke: P.ink,
  strokeWidth: 2.4,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
};

/**
 * Gira/anima o conteúdo em torno do ponto (x, y) do viewBox.
 * O <g> externo leva a origem até o pivô; o do meio recebe a animação CSS
 * (origem 0,0 = pivô); o interno devolve o desenho às coordenadas absolutas.
 * Assim nenhum `transform-origin` é necessário — comportamento idêntico em
 * Chrome, Safari e Firefox.
 */
export function Pivot({ x, y, className, phase, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className} style={phase != null ? { '--cx-phase': phase } : undefined}>
        <g transform={`translate(${-x} ${-y})`}>{children}</g>
      </g>
    </g>
  );
}
