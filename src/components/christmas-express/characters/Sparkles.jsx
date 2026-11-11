import { P } from './shared.jsx';

const STAR = 'M0 -6 C0.9 -1.6 1.6 -0.9 6 0 C1.6 0.9 0.9 1.6 0 6 C-0.9 1.6 -1.6 0.9 -6 0 C-1.6 -0.9 -0.9 -1.6 0 -6 Z';

/**
 * Partículas douradas. Cada uma nasce em (x, y), deriva `dx`/`dy` unidades
 * para trás (direita) e some. Como o conjunto anda para a esquerda, elas
 * parecem ficar "paradas no ar", formando o rastro.
 * phase: 0–1 (defasagem) · dur: segundos · s: escala · c: cor · dot: círculo em vez de estrela
 */
const TRAIL = [
  { x: 548, y: 78, dx: 150, dy: -14, phase: 0.0, dur: 1.5, s: 1.25, c: P.gold },
  { x: 552, y: 104, dx: 186, dy: 6, phase: 0.37, dur: 1.7, s: 0.9, c: P.goldLight },
  { x: 546, y: 132, dx: 168, dy: -8, phase: 0.71, dur: 1.4, s: 1.45, c: P.gold },
  { x: 556, y: 156, dx: 140, dy: 10, phase: 0.18, dur: 1.6, s: 1.0, c: P.goldDark },
  { x: 550, y: 92, dx: 120, dy: 18, phase: 0.55, dur: 1.3, s: 0.6, c: P.goldLight, dot: true },
  { x: 554, y: 120, dx: 196, dy: -20, phase: 0.86, dur: 1.9, s: 0.75, c: P.gold, dot: true },
  { x: 548, y: 146, dx: 110, dy: -4, phase: 0.29, dur: 1.2, s: 0.55, c: P.goldLight, dot: true },
  { x: 552, y: 66, dx: 130, dy: 12, phase: 0.63, dur: 1.6, s: 0.8, c: P.goldLight },
  { x: 550, y: 178, dx: 176, dy: -6, phase: 0.47, dur: 1.5, s: 1.1, c: P.gold },
  { x: 546, y: 112, dx: 90, dy: 4, phase: 0.93, dur: 1.1, s: 0.5, c: P.goldDark, dot: true },
  // poeira dourada dos cascos
  { x: 150, y: 184, dx: 120, dy: -8, phase: 0.12, dur: 1.1, s: 0.7, c: P.goldLight },
  { x: 210, y: 186, dx: 100, dy: -12, phase: 0.6, dur: 1.0, s: 0.5, c: P.gold, dot: true },
  { x: 120, y: 187, dx: 90, dy: -5, phase: 0.8, dur: 0.9, s: 0.45, c: P.gold, dot: true },
];

export default function Sparkles() {
  return (
    <g className="cx-sparkles">
      {TRAIL.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <g
            className="cx-spark"
            style={{
              '--cx-dx': `${p.dx}px`,
              '--cx-dy': `${p.dy}px`,
              '--cx-phase': p.phase,
              '--cx-spark-dur': `${p.dur}s`,
            }}
          >
            {p.dot ? (
              <circle r={5.5 * p.s} fill={p.c} />
            ) : (
              <path d={STAR} transform={`scale(${p.s * 1.9})`} fill={p.c} />
            )}
          </g>
        </g>
      ))}
    </g>
  );
}
