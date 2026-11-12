import { P } from '../characters/shared.jsx';

/**
 * Cenário fixo da faixa: brilho noturno, pontinhos de luz, pinheiros nas pontas, chão nevado
 * e neve caindo. Nada aqui acompanha os personagens — o conjunto passa "por dentro" do cenário.
 * Tudo é transparente fora do que está desenhado, e as bordas se dissolvem (máscaras no CSS)
 * para a faixa não parecer um retângulo separado do site.
 */

const S = {
  snow: '#F6FAFF',
  snowBack: '#CFE0F4',
  snowShade: '#B4CAE6',
  pine: '#17553F',
  pineDark: '#0F3F2F',
  pineLight: '#22705A',
  trunk: '#5B3A29',
};

const f = (n) => Math.round(n * 10) / 10;

/** Borda superior ondulada (irregularidades naturais da neve). Determinística: sem Math.random. */
function drift(y0, amp, n, seed) {
  const step = 1200 / n;
  const y = (i) => y0 + amp * (Math.sin(i * 1.7 + seed) * 0.6 + Math.sin(i * 0.63 + seed * 2.1) * 0.4);
  let d = `M0 60 L0 ${f(y(0))}`;
  for (let i = 0; i < n; i++) {
    const xm = (i + 0.5) * step;
    d += ` Q${f(xm)} ${f(y(i + 0.5) - amp * 0.9)} ${f((i + 1) * step)} ${f(y(i + 1))}`;
  }
  return `${d} L1200 60 Z`;
}

const BACK = drift(9, 3.2, 13, 0.4);
const FRONT = drift(17, 2.4, 19, 2.3);

function Ground() {
  return (
    <svg className="cx-ground" viewBox="0 0 1200 60" preserveAspectRatio="none" focusable="false">
      <defs>
        <linearGradient id="cx-ground-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={S.snow} />
          <stop offset="0.55" stopColor={S.snow} />
          <stop offset="1" stopColor={S.snow} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cx-ground-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={S.snowBack} />
          <stop offset="0.7" stopColor={S.snowBack} stopOpacity="0.6" />
          <stop offset="1" stopColor={S.snowBack} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={BACK} fill="url(#cx-ground-back)" />
      <path d={FRONT} fill="url(#cx-ground-fade)" />
      {/* relevo suave: sombrinhas e brilhos na superfície */}
      <g fill="none" stroke={S.snowShade} strokeWidth={1.2} strokeLinecap="round" opacity={0.55}>
        <path d="M70 34 q26 -5 52 0 M318 39 q30 -6 58 0 M560 33 q22 -4 46 0 M802 40 q28 -5 54 0 M1015 35 q24 -5 50 0" />
        <path d="M190 45 q18 -3 36 0 M455 46 q16 -3 34 0 M690 47 q20 -4 40 0 M930 46 q16 -3 30 0 M1120 44 q14 -3 28 0" opacity={0.7} />
      </g>
    </svg>
  );
}

function Pine({ x, h, w, lights = [] }) {
  const tiers = [
    [-0.1 * h, -0.56 * h, w / 2],
    [-0.4 * h, -0.8 * h, w * 0.38],
    [-0.67 * h, -h, w * 0.26],
  ];
  const stroke = { stroke: P.ink, strokeWidth: 1.6, strokeLinejoin: 'round' };
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-w * 0.07} y={-0.14 * h} width={w * 0.14} height={0.16 * h} rx={1.5} fill={S.trunk} {...stroke} />
      {tiers.map(([yb, yt, hw], i) => {
        const ym = yt + (yb - yt) * 0.46;
        const sw = hw * 0.46;
        return (
          <g key={i}>
            <path d={`M${f(-hw)} ${f(yb)} Q0 ${f(yb + 5)} ${f(hw)} ${f(yb)} L0 ${f(yt)} Z`} fill={i === 1 ? S.pineLight : S.pine} {...stroke} />
            <path d={`M${f(-hw)} ${f(yb)} Q0 ${f(yb + 5)} ${f(hw)} ${f(yb)} L${f(hw * 0.55)} ${f(yb - (yb - yt) * 0.28)} Q0 ${f(yb + 1)} ${f(-hw * 0.55)} ${f(yb - (yb - yt) * 0.28)} Z`} fill={S.pineDark} opacity={0.55} />
            {/* neve acumulada na ponta de cada camada */}
            <path
              d={`M0 ${f(yt)} L${f(sw)} ${f(ym)} Q${f(sw * 0.66)} ${f(ym + 4)} ${f(sw * 0.33)} ${f(ym - 1)} Q0 ${f(ym + 5)} ${f(-sw * 0.33)} ${f(ym - 1)} Q${f(-sw * 0.66)} ${f(ym + 4)} ${f(-sw)} ${f(ym)} Z`}
              fill={S.snow}
              stroke={P.ink}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      {lights.map(([lx, ly, c], i) => (
        <circle key={i} className="cx-tree-light" cx={f(lx * w)} cy={f(-ly * h)} r={1.9} fill={c} style={{ '--cx-phase': (i * 0.37) % 1 }} />
      ))}
      {/* montinho de neve no pé */}
      <ellipse cx={0} cy={1} rx={w * 0.42} ry={3.4} fill={S.snow} />
    </g>
  );
}

const GOLD = P.goldLight;
const RED = '#FF8A7A';

function Trees({ side }) {
  const left = side === 'left';
  return (
    <svg
      className={`cx-trees cx-trees--${side}`}
      viewBox="0 -112 176 118"
      preserveAspectRatio={left ? 'xMinYMax meet' : 'xMaxYMax meet'}
      focusable="false"
    >
      {left ? (
        <>
          <g className="cx-tree cx-tree--extra"><Pine x={118} h={52} w={36} lights={[[0.12, 0.3, GOLD]]} /></g>
          <Pine x={36} h={104} w={58} lights={[[-0.2, 0.22, GOLD], [0.16, 0.48, RED], [-0.06, 0.72, GOLD]]} />
          <Pine x={82} h={72} w={44} lights={[[0.14, 0.26, RED], [-0.1, 0.55, GOLD]]} />
        </>
      ) : (
        <>
          <g className="cx-tree cx-tree--extra"><Pine x={52} h={48} w={34} lights={[[-0.1, 0.3, RED]]} /></g>
          <Pine x={140} h={96} w={54} lights={[[0.2, 0.24, GOLD], [-0.14, 0.5, GOLD], [0.05, 0.74, RED]]} />
          <Pine x={96} h={66} w={42} lights={[[-0.16, 0.28, GOLD], [0.1, 0.56, RED]]} />
        </>
      )}
    </svg>
  );
}

/* pontinhos luminosos: x/y em % da faixa, s = tamanho relativo, p = defasagem */
const STARS = [
  [4, 14, 1.0, 0.0], [11, 38, 0.7, 0.4], [17, 9, 0.8, 0.7], [24, 30, 1.1, 0.2], [31, 12, 0.7, 0.55],
  [38, 34, 0.8, 0.85], [45, 8, 1.0, 0.3], [52, 26, 0.7, 0.65], [59, 13, 0.9, 0.1], [66, 36, 0.7, 0.5],
  [72, 10, 1.1, 0.8], [79, 28, 0.8, 0.25], [86, 14, 0.7, 0.6], [92, 34, 1.0, 0.9], [97, 12, 0.8, 0.45],
];

/* neve caindo: x em %, dur em s, deriva lateral em % da altura da faixa, s = tamanho, p = defasagem */
const FLAKES = [
  [3, 7.5, 18, 1.0, 0.1], [9, 9.5, -14, 0.7, 0.6], [16, 6.8, 22, 0.8, 0.35], [23, 8.6, -20, 1.1, 0.85],
  [30, 7.2, 16, 0.7, 0.5], [37, 9.8, -12, 0.9, 0.05], [44, 6.6, 20, 0.8, 0.7], [51, 8.2, -18, 1.0, 0.25],
  [58, 7.8, 14, 0.7, 0.95], [65, 9.2, -22, 0.9, 0.45], [72, 6.9, 18, 1.1, 0.15], [79, 8.8, -16, 0.7, 0.75],
  [86, 7.4, 20, 0.8, 0.3], [93, 9.4, -14, 1.0, 0.55],
];

export default function Scenery({ backdrop = 'soft', snowfall = true }) {
  return (
    <div className="cx-scenery">
      {backdrop !== 'none' && <div className="cx-backdrop" />}
      <div className="cx-stars">
        {STARS.map(([x, y, s, p], i) => (
          <i key={i} className="cx-star" style={{ left: `${x}%`, top: `${y}%`, '--cx-s': s, '--cx-phase': p }} />
        ))}
      </div>
      <Trees side="left" />
      <Trees side="right" />
      <Ground />
      {snowfall && (
        <div className="cx-snowfall">
          {FLAKES.map(([x, dur, dx, s, p], i) => (
            <i
              key={i}
              className="cx-flake"
              style={{ left: `${x}%`, '--cx-dur': `${dur}s`, '--cx-drift': dx / 100, '--cx-s': s, '--cx-phase': p }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
