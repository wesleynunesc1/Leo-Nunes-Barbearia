import { P } from '../shared.jsx';
import BarberHead from './BarberHead.jsx';
import { C } from './config.js';
import { O, SK, Tattoo } from './Barber.jsx';

/** Vista frontal (apenas para a prancha de personagens). */
export default function BarberFront({ b, uid }) {
  const w = b.front.w;
  const arm = (sx, dir, tat) => (
    <g transform={`translate(${sx} -82) rotate(${dir * 5})`}>
      <rect x={-3.6} y={-2} width={7.2} height={36} rx={3.6} fill={b.skin} {...SK} />
      {tat === 'sleeve' && (
        <g>
          <g transform="translate(0 16)"><Tattoo kind="sleeve-fore" /></g>
          <Tattoo kind="sleeve-upper" />
        </g>
      )}
      {tat === 'script' && <g transform="translate(0 16)"><Tattoo kind="script" /></g>}
      <circle cx={0} cy={36} r={4.2} fill={b.skin} {...SK} />
      <rect x={-5.2} y={-5} width={10.4} height={15} rx={4.6} fill={C.tee} {...O} />
    </g>
  );
  const shoe = (dir) => (
    <path
      transform={`scale(${dir} 1)`}
      d="M1.2 -6 L1.2 -1.4 Q1.2 0.2 3 0.2 L12.6 0.2 Q14.6 0.2 14 -2.2 Q13 -5.4 9.6 -6 Z"
      fill={C.shoe}
      {...O}
    />
  );
  return (
    <g className={`cx-barber cx-barber--${b.id}`}>
      <g transform={`scale(${b.k})`}>
        {/* braço esquerdo dele (tatuagem fechada) fica à direita de quem olha */}
        {arm(-(w + 2), 1, b.tattoos ? 'script' : null)}
        {arm(w + 2, -1, b.tattoos ? 'sleeve' : null)}
        {shoe(1)}
        {shoe(-1)}
        <rect x={-w + 2.6} y={-54} width={w - 3.4} height={50} rx={4.4} fill={C.pants} {...O} />
        <rect x={0.8} y={-54} width={w - 3.4} height={50} rx={4.4} fill={C.pants} {...O} />
        <path d={`M${-w + 2.6} -56 H${w - 2.6} V-44 H${-w + 2.6} Z`} fill={C.pants} />
        <path d="M-4.8 -95 V-84 H4.8 V-95 Z" fill={b.skin} {...SK} />
        <path
          d={`M-6 -88.6 L${-w + 4} -87.4 Q${-w - 0.6} -86.4 ${-w - 0.4} -81 L${-w + 2} -49 H${w - 2} L${w + 0.4} -81 Q${w + 0.6} -86.4 ${w - 4} -87.4 L6 -88.6 Q0 -83.4 -6 -88.6 Z`}
          fill={C.tee}
          {...O}
        />
        {b.polo ? (
          <g>
            <path d="M0 -84.6 V-71" stroke={C.line} strokeWidth={1.5} strokeLinecap="round" />
            <path d="M-6.4 -90 L-9.4 -84.6 L-3.4 -80.6 L0 -84.6 L3.4 -80.6 L9.4 -84.6 L6.4 -90 L0 -85 Z" fill={C.tee} {...O} strokeWidth={1.8} />
            <circle cx={1.6} cy={-78.4} r={0.8} fill={C.sole} />
            <circle cx={1.6} cy={-74.2} r={0.8} fill={C.sole} />
          </g>
        ) : null}
        <g transform={`translate(0 ${b.headY / b.k}) scale(${1 / b.k})`}>
          <BarberHead b={b} view="front" mood="calm" uid={uid} />
        </g>
      </g>
    </g>
  );
}
