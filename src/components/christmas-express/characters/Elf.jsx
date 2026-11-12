import { P } from './shared.jsx';
import { GroundShadow, SnowKick } from './SnowFx.jsx';

const O = { stroke: P.ink, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' };
const E = {
  green: '#2E9E62',
  greenDark: '#1F7A49',
  red: '#D2283C',
  redDark: '#A31B2C',
  skin: '#F6CDA8',
  skinShade: '#E2B08A',
  boot: '#7A4A2B',
  cream: '#FFF4DD',
};

/** Junta: leva a origem ao pivô; o <g> interno recebe a animação CSS (classe) ou o ângulo estático. */
function Joint({ x = 0, y = 0, angle = 0, className, style, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className} style={style} transform={`rotate(${angle})`}>
        {children}
      </g>
    </g>
  );
}

function Leg({ far, thigh, shin }) {
  const lp = far ? 0.5 : 0;
  return (
    <Joint x={far ? 1 : -0.5} y={-24} angle={thigh} className={`cx-elf-thigh ${far ? 'cx-elf--far' : 'cx-elf--near'}`} style={{ '--cx-lp': lp }}>
      <rect x={-3.6} y={-3} width={7.2} height={15} rx={3.5} fill={far ? E.redDark : E.red} {...O} />
      <Joint y={11} angle={shin} className={`cx-elf-shin ${far ? 'cx-elf--far' : 'cx-elf--near'}`} style={{ '--cx-lp': lp }}>
        {/* meia listrada */}
        <rect x={-3} y={-2.5} width={6} height={12} rx={3} fill={E.cream} {...O} />
        <path d="M-3 1.6 h6 M-3 5.2 h6" stroke={far ? E.redDark : E.red} strokeWidth={1.7} />
        {/* botinha de bico enrolado, com guizo */}
        <path d="M3.2 6.6 L3.4 11.4 Q3.4 13 1.8 13 L-6.4 13 Q-10.4 13 -11.2 9.6 Q-11.4 7.4 -9.4 7.6 Q-8.6 9.6 -6.2 9.2 Q-4.4 8.6 -3.2 6.6 Z" fill={E.boot} {...O} strokeWidth={1.8} />
        <circle cx={-10.6} cy={7} r={1.7} fill={P.gold} stroke={P.ink} strokeWidth={1} />
      </Joint>
    </Joint>
  );
}

/** Presentinho do duende — vermelho com fita creme, bem diferente da caixa verde do Noel. */
function TinyGift() {
  return (
    <g>
      <rect x={-5.6} y={-5} width={11.2} height={10} rx={1.4} fill={E.red} {...O} strokeWidth={1.7} />
      <rect x={-1.3} y={-5} width={2.6} height={10} fill={E.cream} />
      <path d="M0 -5 C-4.6 -10.6 -7.6 -6 0 -5 C4.6 -10.6 7.6 -6 0 -5 Z" fill={E.cream} stroke={P.ink} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  );
}

function Arm({ far, upper, fore, children }) {
  return (
    <Joint x={-1} y={-37.5} angle={upper} className={`cx-elf-upper ${far ? 'cx-elf--far' : 'cx-elf--near'}`}>
      <rect x={-2.7} y={-2.5} width={5.4} height={11.5} rx={2.7} fill={far ? E.greenDark : E.green} {...O} strokeWidth={1.8} />
      <Joint y={8} angle={fore} className={`cx-elf-fore ${far ? 'cx-elf--far' : 'cx-elf--near'}`}>
        {children}
        <rect x={-2.5} y={-2.2} width={5} height={9.4} rx={2.5} fill={far ? E.greenDark : E.green} {...O} strokeWidth={1.8} />
        {/* punho vermelho + mãozinha */}
        <rect x={-3} y={5} width={6} height={3} rx={1.4} fill={E.red} stroke={P.ink} strokeWidth={1.2} />
        <circle cx={0} cy={10.2} r={2.9} fill={far ? E.skinShade : E.skin} {...O} strokeWidth={1.6} />
      </Joint>
    </Joint>
  );
}

/**
 * Duende natalino (vista lateral, correndo para a esquerda). Origem = chão, sob o quadril.
 * Na 3.1 braços, pernas, tronco e cabeça são conduzidos pela linha do tempo (story.js), com o
 * mesmo ciclo de corrida de antes, para ele poder pedir carona, pular nas costas do 04, descer
 * e incentivar. Gorro, guizo e orelha continuam com os ciclos CSS (movimento secundário).
 */
export default function Elf() {
  return (
    <g className="cx-elf-drift">
      <g className="cx-elf-shadow">
        <GroundShadow rx={11} ry={3} y={2.4} />
      </g>
      <g className="cx-elf-kick">
        <SnowKick x={7} y={0} dur={0.3} n={2} reach={18} size={2} />
      </g>
      {/* cx-elf-lift: saltos e a carona nas costas do 04 · cx-elf-tilt: inclinação do corpo inteiro */}
      <g className="cx-elf-lift">
      <g className="cx-elf-tilt">
      <g className="cx-elf">
        <Leg far thigh={-40} shin={-70} />
        <Leg thigh={52} shin={-16} />
        <Joint x={0} y={-24} angle={-12} className="cx-elf-lean">
          <g transform="translate(0 24)">
            <Arm far upper={78} fore={8} />
            {/* túnica verde com barra em zigue-zague */}
            <path d="M-6.4 -39.6 C-9 -34 -9.6 -28 -9.4 -22.6 L-6.2 -19.4 L-3.2 -22.6 L0 -19.4 L3.2 -22.6 L6.2 -19.4 L8.6 -22.6 C9.4 -28.6 8.8 -35 6 -39.6 Z" fill={E.green} {...O} />
            {/* cinto + fivela */}
            <path d="M-9.4 -27.6 L8.9 -27.6" stroke={P.ink} strokeWidth={5} strokeLinecap="butt" />
            <path d="M-8.6 -27.6 L8.2 -27.6" stroke={E.redDark} strokeWidth={2.6} />
            <rect x={-3.6} y={-30} width={4.8} height={4.8} rx={1} fill={P.gold} stroke={P.ink} strokeWidth={1.1} />
            {/* gola vermelha */}
            <path d="M-7.4 -40.4 L-5 -36.4 L-2 -39.4 L1 -36.2 L4 -39.4 L6.6 -36.6 L6.8 -40.6 Z" fill={E.red} {...O} strokeWidth={1.7} />

            {/* cabeça */}
            <Joint x={0} y={-40} angle={10} className="cx-elf-head">
              <g transform="translate(0 40)">
                {/* gorro comprido: base presa à cabeça + ponta com guizo (dois ciclos, com atraso) */}
                <Joint x={3} y={-60} angle={0} className="cx-elf-hat">
                  <path d="M-15.6 0.6 C-13 -10.6 -1 -15.6 9 -11.6 C14 -9.6 17 -6.6 18.6 -3.2 L12.4 3.6 C9 1 2 0.4 -2 1.6 Z" fill={E.green} {...O} />
                  <Joint x={15} y={-1.4} angle={0} className="cx-elf-hat-tip">
                    <path d="M-3.6 -5.4 C5 -6.6 13 -3.6 19.4 4.6 C12 3.6 4 4.6 -2.6 3.6 Z" fill={E.green} {...O} />
                    <path d="M3 -5.6 L1.4 3.9 M9 -3.4 L7.4 4.3" stroke={E.greenDark} strokeWidth={1.4} strokeLinecap="round" />
                    <Joint x={19.2} y={4.6} angle={0} className="cx-elf-bell">
                      <circle cx={1.4} cy={2.4} r={3.3} fill={P.gold} stroke={P.ink} strokeWidth={1.5} />
                      <circle cx={0.6} cy={1.4} r={0.9} fill={P.goldLight} />
                    </Joint>
                  </Joint>
                </Joint>
                {/* orelha pontuda */}
                <g transform="translate(6.6 -49)">
                  <g className="cx-elf-ear">
                    <path d="M-2.6 2.6 C-1.6 -4 5.6 -9.6 12.6 -10.6 C10.6 -4.6 7.4 2 1.4 5.4 Z" fill={E.skin} {...O} strokeWidth={1.8} />
                    <path d="M0.6 1.6 C2.6 -2.4 5.6 -5 8.6 -6.6" fill="none" stroke={E.skinShade} strokeWidth={1.3} strokeLinecap="round" />
                  </g>
                </g>
                {/* rosto */}
                <circle cx={-1.6} cy={-50} r={11.8} fill={E.skin} {...O} />
                <circle cx={-6.8} cy={-46} r={2.7} fill={P.blush} opacity={0.6} />
                <ellipse cx={-6.2} cy={-52.4} rx={1.7} ry={2.3} fill={P.ink} />
                <circle cx={-6.8} cy={-53.2} r={0.65} fill="#fff" />
                <path d="M-9.4 -56.6 q3 -2.4 6 -0.6" fill="none" stroke={P.ink} strokeWidth={1.5} strokeLinecap="round" />
                {/* nariz de botão + sorrisão */}
                <circle cx={-12.6} cy={-49.4} r={2.5} fill={P.blush} {...O} strokeWidth={1.4} />
                <path d="M-10.6 -45 Q-6.4 -43.6 -3 -46.2 Q-3.8 -40.6 -7.6 -41 Q-10.2 -41.6 -10.6 -45 Z" fill="#fff" stroke={P.ink} strokeWidth={1.3} strokeLinejoin="round" />
                {/* aba vermelha do gorro */}
                <path d="M-14.6 -58.6 C-9 -63.6 3 -64.6 12.6 -58.4" fill="none" stroke={P.ink} strokeWidth={7} strokeLinecap="round" />
                <path d="M-14.6 -58.6 C-9 -63.6 3 -64.6 12.6 -58.4" fill="none" stroke={E.red} strokeWidth={3.8} strokeLinecap="round" />
              </g>
            </Joint>

            {/* braço da frente segurando o presentinho */}
            <Arm upper={72} fore={12}>
              <g transform="translate(0 15.5) rotate(-84)">
                <g className="cx-elf-gift">
                  <TinyGift />
                </g>
              </g>
            </Arm>
          </g>
        </Joint>
      </g>
      </g>
      </g>
    </g>
  );
}
