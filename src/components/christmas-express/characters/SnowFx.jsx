import { P } from './shared.jsx';

export const SNOW = {
  white: '#FFFFFF',
  soft: '#EAF3FF',
  shade: '#C3D6EE',
  shadow: '#5F7FB2',
};

/** Sombra suave na neve, sob o personagem. Fica dentro do grupo dele, então acompanha cada passo. */
export function GroundShadow({ x = 0, y = 3, rx = 17, ry = 4.2, opacity = 0.3 }) {
  return <ellipse className="cx-shadow" cx={x} cy={y} rx={rx} ry={ry} fill={SNOW.shadow} opacity={opacity} />;
}

/**
 * Neve levantada pelos pés: cada floquinho nasce no chão, vai para trás (direita) e some.
 * dur: duração da passada (s) · phase: 0–1 · n: quantidade (2 = um por pé).
 */
export function SnowKick({ x = 0, y = 0, dur = 0.48, phase = 0, n = 2, reach = 26, size = 2.6 }) {
  return (
    <g className="cx-snowkick" transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          className="cx-snowpuff"
          r={size * (i % 2 ? 0.8 : 1)}
          fill={SNOW.white}
          style={{
            '--cx-dur': typeof dur === 'number' ? `${dur}s` : dur,
            '--cx-phase': (phase + i / n) % 1,
            '--cx-dx': `${reach * (i % 2 ? 0.75 : 1)}px`,
            '--cx-dy': `${-(7 + (i % 3) * 3)}px`,
          }}
        />
      ))}
    </g>
  );
}

/** Riscos de vento rente ao chão: reforçam a velocidade sem mexer no cenário. */
const STREAKS = [
  { x: 250, y: 198, w: 34, dur: 0.9, phase: 0.0 },
  { x: 560, y: 203, w: 26, dur: 1.1, phase: 0.35 },
  { x: 700, y: 199, w: 30, dur: 0.8, phase: 0.6 },
  { x: 830, y: 204, w: 22, dur: 1.0, phase: 0.15 },
  { x: 95, y: 202, w: 24, dur: 0.95, phase: 0.75 },
];
export function WindStreaks() {
  return (
    <g className="cx-streaks">
      {STREAKS.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          <path
            className="cx-streak"
            d={`M0 0 h${s.w}`}
            stroke={SNOW.white}
            strokeWidth={1.6}
            strokeLinecap="round"
            style={{ '--cx-dur': `${s.dur}s`, '--cx-phase': s.phase }}
          />
        </g>
      ))}
    </g>
  );
}

/** Floco de 6 pontas bem simples (3 traços). */
function Flake({ r = 3.2 }) {
  return (
    <g stroke={SNOW.white} strokeWidth={1.3} strokeLinecap="round">
      <path d={`M${-r} 0 H${r} M${-r / 2} ${-r * 0.87} L${r / 2} ${r * 0.87} M${r / 2} ${-r * 0.87} L${-r / 2} ${r * 0.87}`} />
    </g>
  );
}

/**
 * Espirro da rena: uma nuvenzinha branca + poucos flocos. Fica nas coordenadas do conjunto
 * (não dentro da cabeça), para que a nuvem "fique para trás" enquanto a rena segue correndo.
 * A linha do tempo (story.js) posiciona e mostra cada peça.
 */
export const SNEEZE_FLAKES = 6;
export function SneezeCloud() {
  return (
    <g className="cx-sneeze">
      <g className="cx-sneeze-cloud">
        <g stroke={SNOW.shade} strokeWidth={1.2}>
          <circle cx={-9} cy={2} r={8} fill={SNOW.white} />
          <circle cx={8} cy={3} r={7} fill={SNOW.white} />
          <circle cx={0} cy={-5} r={9} fill={SNOW.white} />
          <circle cx={1} cy={5} r={7.5} fill={SNOW.white} />
        </g>
        <circle cx={0} cy={0} r={8.5} fill={SNOW.white} />
        <path d="M-6 3 q4 3 9 1" fill="none" stroke={SNOW.shade} strokeWidth={1.2} strokeLinecap="round" />
      </g>
      {Array.from({ length: SNEEZE_FLAKES }, (_, i) => (
        <g key={i} className={`cx-sneeze-flake cx-sneeze-flake--${i}`}>
          {i % 2 ? <circle r={2} fill={SNOW.white} /> : <Flake r={2.8 + (i % 3) * 0.5} />}
        </g>
      ))}
    </g>
  );
}

/** Neve espalhada pelo pé do barbeiro 03 quando ele escorrega (origem = ponto onde o pé desliza). */
export const SPRAY_BITS = 7;
export function StumbleSpray() {
  return (
    <g className="cx-spray">
      {Array.from({ length: SPRAY_BITS }, (_, i) => (
        <circle key={i} className={`cx-spray-bit cx-spray-bit--${i}`} r={1.8 + (i % 3) * 0.7} fill={i % 3 === 2 ? SNOW.soft : SNOW.white} />
      ))}
    </g>
  );
}

/** Gotinhas de susto (saem da cabeça do 03 no escorregão). */
export function SweatDrops() {
  const drop = 'M0 -4 C2.4 -1 2.6 1.6 0 2.6 C-2.6 1.6 -2.4 -1 0 -4 Z';
  return (
    <g className="cx-sweat">
      {[0, 1, 2].map((i) => (
        <g key={i} className={`cx-sweat-drop cx-sweat-drop--${i}`}>
          <path d={drop} fill="#BFE3FF" stroke={P.ink} strokeWidth={0.9} strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
}
