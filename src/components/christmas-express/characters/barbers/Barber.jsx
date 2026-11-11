import { P } from '../shared.jsx';
import BarberHead from './BarberHead.jsx';
import { C } from './config.js';

export const O = { stroke: C.line, strokeWidth: 2.2, strokeLinejoin: 'round', strokeLinecap: 'round' };
export const SK = { stroke: P.ink, strokeWidth: 2.2, strokeLinejoin: 'round', strokeLinecap: 'round' };

/** Junta: leva a origem ao pivô (x, y); o <g> interno gira (atributo estático ou animação CSS). */
function Joint({ x = 0, y = 0, angle = 0, className, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className} transform={`rotate(${angle})`}>
        {children}
      </g>
    </g>
  );
}

export function Tattoo({ kind }) {
  const s = { fill: 'none', stroke: C.tattoo, strokeWidth: 0.9, strokeLinecap: 'round', opacity: 0.9 };
  if (kind === 'sleeve-fore')
    return (
      <g>
        <rect x={-3} y={0.5} width={6} height={12.5} rx={2.8} fill={C.tattoo} opacity={0.3} />
        <circle cx={0} cy={5} r={2.1} {...s} />
        <path d="M-0.9 5.1 a0.9 0.9 0 1 1 0.9 0.9 M-2.6 8.6 q2.6 1.8 5.2 0 M-2.4 11 q2.4 1.5 4.8 0 M-2.2 1.9 q2.2 -1.2 4.4 0" {...s} />
      </g>
    );
  if (kind === 'sleeve-upper')
    return (
      <g>
        <rect x={-3.2} y={7.5} width={6.4} height={8} rx={2.6} fill={C.tattoo} opacity={0.3} />
        <path d="M-2.4 10 q2.4 -1.8 4.8 0 M-2.4 12.6 q2.4 1.6 4.8 0 M0 9.2 v4.6" {...s} />
      </g>
    );
  // frase curta no antebraço
  return <path d="M-1.6 3.5 q1.6 1 0.4 2.2 q-1.6 1 0.6 2.2 q1.4 0.9 -0.2 2.2" {...s} strokeWidth={0.8} />;
}

function Arm({ b, far, upper, fore, cls, held }) {
  const skin = far ? b.skinShade : b.skin;
  const tee = far ? C.teeFar : C.tee;
  const tat = b.tattoos ? (far ? ['', 'script'] : ['sleeve-upper', 'sleeve-fore']) : null;
  return (
    <Joint x={0.5} y={-82} angle={upper} className={`cx-b-upper ${cls}`}>
      <rect x={-3.5} y={-3} width={7} height={20} rx={3.5} fill={skin} {...SK} />
      {tat && tat[0] && <Tattoo kind={tat[0]} />}
      <Joint y={15.5} angle={fore} className={`cx-b-fore ${cls}`}>
        {held}
        <rect x={-3.2} y={-3} width={6.4} height={18} rx={3.2} fill={skin} {...SK} />
        {tat && tat[1] && <Tattoo kind={tat[1]} />}
        <circle cx={-0.3} cy={16.2} r={4.1} fill={skin} {...SK} />
      </Joint>
      {/* manga */}
      <rect x={-5} y={-5} width={10} height={13.5} rx={4.6} fill={tee} {...O} />
    </Joint>
  );
}

function Leg({ far, thigh, shin, cls }) {
  const pants = far ? C.pantsFar : C.pants;
  return (
    <Joint x={far ? 1.2 : -0.6} y={-50} angle={thigh} className={`cx-b-thigh ${cls}`}>
      <rect x={-5.7} y={-5} width={11.4} height={30} rx={5.6} fill={pants} {...O} />
      <Joint y={23} angle={shin} className={`cx-b-shin ${cls}`}>
        <rect x={-4.6} y={-4} width={9.2} height={25} rx={4.4} fill={pants} {...O} />
        <path d="M4.4 17.6 L4.6 23.4 Q4.6 25.4 2.6 25.4 L-9.2 25.4 Q-12 25.4 -10.8 22.8 Q-9.2 19.8 -4.6 19 L-4.2 17.6 Z" fill={C.shoe} {...O} />
        <path d="M-10.6 24.9 H4.2" stroke={C.sole} strokeWidth={1.3} strokeLinecap="round" />
      </Joint>
    </Joint>
  );
}

/**
 * Barbeiro em vista lateral (¾), virado para a esquerda. Origem = chão, sob o quadril.
 * `pose`: ângulos em graus (positivo = para a frente). Sem animação, vale a pose estática;
 * as classes cx-b-* recebem os keyframes de corrida no CSS.
 */
export function BarberSide({ b, pose = STAND, mood = 'calm', alt, uid, className = '', held }) {
  const p = { ...STAND, ...pose };
  const c = b.chest;
  return (
    <g className={`cx-barber cx-barber--${b.id} ${className}`.trim()} style={{ '--cx-lean': `${p.lean}deg` }}>
      <g transform={`scale(${b.k})`}>
        <Joint x={0} y={-50} angle={p.lean} className="cx-b-lean">
          <g transform="translate(0 50)">
            <Arm b={b} far upper={p.armF[0]} fore={p.armF[1]} cls="cx-b--far" />
          </g>
        </Joint>
        <Leg far thigh={p.legF[0]} shin={p.legF[1]} cls="cx-b--far" />
        <Leg thigh={p.legN[0]} shin={p.legN[1]} cls="cx-b--near" />
        <Joint x={0} y={-50} angle={p.lean} className="cx-b-lean">
          <g transform="translate(0 50)">
            <path d="M-4.8 -95 L-4.4 -84 L4.6 -84 L4.6 -95 Z" fill={b.skin} {...SK} />
            <path
              d={`M-6.5 -88.4 C${-11.5 - c} -86 ${-13 - c} -76 ${-11.5 - c} -62 C${-11 - c} -57 -11.2 -53 -10.8 -48.5 L10.4 -48.5 C11.6 -60 12 -74 9.6 -84 C8.6 -87 6 -88.6 3 -88.6 Z`}
              fill={C.tee}
              {...O}
            />
            {b.polo ? (
              <path d="M-7.4 -88.6 L-3.6 -92.4 L4.6 -91.6 L6.6 -87.4 L1 -85.4 L-3 -88 L-8.6 -83.6 Z" fill={C.tee} {...O} strokeWidth={1.8} />
            ) : (
              <path d="M-6 -88.2 Q-1 -85.4 4.2 -88.4" fill="none" stroke={C.line} strokeWidth={1.6} strokeLinecap="round" />
            )}
            {/* pivô da cabeça na base do pescoço: compensa a inclinação do tronco e permite "olhar para trás" */}
            <Joint x={0} y={-87} angle={p.head != null ? p.head : -p.lean * 0.7} className="cx-b-headjoint">
              <g transform={`translate(${b.side.hx} ${b.headY / b.k + 87}) scale(${1 / b.k})`}>
                {/* cx-b-turn: espelha a cabeça inteira (rosto, cabelo, óculos) para "olhar para trás" */}
                <g className="cx-b-turn">
                  <BarberHead b={b} view="side" mood={mood} alt={alt} uid={uid} />
                </g>
              </g>
            </Joint>
            <Arm b={b} upper={p.armN[0]} fore={p.armN[1]} cls="cx-b--near" held={held} />
          </g>
        </Joint>
      </g>
    </g>
  );
}

export const STAND = { lean: 0, legN: [0, 0], legF: [3, 0], armN: [-3, 10], armF: [6, 12] };

