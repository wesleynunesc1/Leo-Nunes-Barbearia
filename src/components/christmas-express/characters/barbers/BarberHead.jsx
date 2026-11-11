import { P } from '../shared.jsx';
import { C } from './config.js';

const SK = { stroke: P.ink, strokeWidth: 2.2, strokeLinejoin: 'round', strokeLinecap: 'round' };
const HAIR = { fill: C.hair, stroke: C.line, strokeWidth: 2, strokeLinejoin: 'round' };
const HI = { fill: 'none', stroke: C.hairHi, strokeWidth: 1.2, strokeLinecap: 'round', opacity: 0.85 };
const f = (n) => Math.round(n * 100) / 100;

/* ---------- contornos do rosto (origem = centro da cabeça) ---------- */
function sideOutline(rx, ry, J) {
  return `M0 ${-ry} C${f(rx * 0.6)} ${-ry} ${rx} ${f(-ry * 0.6)} ${rx} -2 C${rx} ${f(ry * 0.4)} ${f(rx * J)} ${f(ry * 0.8)} ${f(rx * 0.3)} ${f(ry * 0.97)} C${f(-rx * 0.1)} ${f(ry * 1.06)} ${f(-rx * 0.6)} ${f(ry * 1.02)} ${f(-rx * 0.82)} ${f(ry * 0.62)} C${f(-rx * 0.98)} ${f(ry * 0.35)} ${-rx} ${f(ry * 0.1)} ${-rx} ${f(-ry * 0.15)} C${-rx} ${f(-ry * 0.65)} ${f(-rx * 0.6)} ${-ry} 0 ${-ry} Z`;
}
function frontOutline(rx, ry, J) {
  return `M0 ${-ry} C${f(rx * 0.62)} ${-ry} ${rx} ${f(-ry * 0.62)} ${rx} -1 C${rx} ${f(ry * 0.45)} ${f(rx * J)} ${f(ry * 0.8)} ${f(rx * 0.38)} ${f(ry * 0.95)} C${f(rx * 0.15)} ${f(ry * 1.03)} ${f(-rx * 0.15)} ${f(ry * 1.03)} ${f(-rx * 0.38)} ${f(ry * 0.95)} C${f(-rx * J)} ${f(ry * 0.8)} ${-rx} ${f(ry * 0.45)} ${-rx} -1 C${-rx} ${f(-ry * 0.62)} ${f(-rx * 0.62)} ${-ry} 0 ${-ry} Z`;
}

/* ---------- peças do rosto ---------- */
function Eye({ x, y = -1.4, rx = 1.6, ry = 2.1 }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#1E1412" />
      <circle cx={x - 0.5} cy={y - 0.8} r={0.62} fill="#fff" />
    </g>
  );
}

function Brow({ x, y = -6, w = 3.2, tilt = 0, lift = 0 }) {
  // tilt > 0: desce em direção ao nariz (determinado); lift: sobe a sobrancelha inteira
  return (
    <path
      d={`M${f(x - w)} ${f(y - lift + tilt * 0.5)} Q${x} ${f(y - lift - 1.7)} ${f(x + w)} ${f(y - lift - tilt * 0.5)}`}
      fill="none"
      stroke={C.hair}
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}

function Mouth({ x, y = 9.8, mood }) {
  if (mood === 'grin')
    return (
      <path
        d={`M${f(x - 4.4)} ${f(y - 1.5)} Q${x} ${f(y - 0.3)} ${f(x + 4.4)} ${f(y - 1.5)} Q${f(x + 3.8)} ${f(y + 3.7)} ${x} ${f(y + 3.9)} Q${f(x - 3.8)} ${f(y + 3.7)} ${f(x - 4.4)} ${f(y - 1.5)} Z`}
        fill="#fff"
        stroke={P.ink}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    );
  if (mood === 'wow')
    return <ellipse cx={x} cy={y + 0.8} rx={2.7} ry={3.1} fill="#7C2A2A" stroke={P.ink} strokeWidth={1.4} />;
  if (mood === 'set')
    return (
      <path
        d={`M${f(x - 3.9)} ${f(y + 0.5)} Q${f(x - 0.5)} ${f(y + 1.3)} ${f(x + 3.9)} ${f(y - 0.9)}`}
        fill="none"
        stroke={P.ink}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    );
  return (
    <path
      d={`M${f(x - 3.7)} ${f(y - 0.5)} Q${x} ${f(y + 2.5)} ${f(x + 3.7)} ${f(y - 0.5)}`}
      fill="none"
      stroke={P.ink}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  );
}

const MOODS = {
  // expressão por barbeiro em corrida
  b01: { run: { mouth: 'grin', lift: 1.2, tilt: 0 } },
  b02: { run: { mouth: 'set', lift: -0.6, tilt: 2.4 } },
  b03: { run: { mouth: 'grin', lift: 0.4, tilt: 0 } },
  b04: { run: { mouth: 'grin', lift: 1.8, tilt: -0.8 }, wow: { mouth: 'wow', lift: 3, tilt: -1 } },
};

/* ---------- barba (sempre recortada pelo contorno do rosto) ---------- */
function Beard({ b, cx, left, right, ry, wide }) {
  const op = b.beard;
  if (b.id === 'b04')
    return (
      <g>
        {/* pouca barba: sombra no buço + cavanhaque ralo */}
        <path d={`M${cx - 4.6} 7.4 Q${cx} 5.6 ${cx + 4.6} 7.4`} fill="none" stroke={C.hair} strokeWidth={1.5} strokeLinecap="round" opacity={0.26} />
        <ellipse cx={cx} cy={ry - 1.6} rx={4.6} ry={3} fill={C.hair} opacity={0.42} />
      </g>
    );
  // faixa no maxilar + bigode ligado ao cavanhaque; uma "máscara" de pele limpa as bochechas
  const t = { b01: [2.7, 12.9, 2.1], b02: [2.1, 13.2, 1.6], b03: [3.5, 12.1, 2.4] }[b.id];
  const l = left + (left === -right ? t[0] : t[0] * 0.55); // lado distante mais fino em ¾
  const r = right - t[0];
  return (
    <g opacity={op}>
      <path d={`M${left - 2} -7 H${right + 2} V${ry + 3} H${left - 2} Z`} fill={C.hair} />
      <path
        d={`M${f(l)} -9 L${f(l)} 3 C${f(l)} 9.4 ${f(cx - 4.4)} ${t[1]} ${cx} ${t[1]} C${f(cx + 4.4)} ${t[1]} ${f(r)} ${left === -right ? 9.4 : t[1] - 0.6} ${f(r)} 3 L${f(r)} -9 Z`}
        fill={b.skin}
      />
      <path
        d={`M${f(cx - 5.4)} ${t[1] + 0.6} L${f(cx - 5.6)} 8 C${f(cx - 3)} 5.5 ${f(cx + 3)} 5.5 ${f(cx + 5.6)} 8 L${f(cx + 5.4)} ${t[1] + 0.6}`}
        fill="none"
        stroke={C.hair}
        strokeWidth={t[2]}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {b.id === 'b02' && <ellipse cx={cx} cy={ry - 2.2} rx={4.6} ry={2.6} fill={C.hair} />}
      {wide && <ellipse cx={cx} cy={10.6} rx={4.9} ry={3.2} fill={b.skin} />}
    </g>
  );
}

/* ---------- óculos ---------- */
function FaceGlasses({ lenses, temples }) {
  // lenses: [[cx, halfWidth], ...] · lentes translúcidas: os olhos continuam visíveis
  const s = { stroke: C.metal, strokeWidth: 0.75, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <g className="cx-b-glasses">
      {lenses.map(([x, hw], i) => (
        <g key={i}>
          <rect x={x - hw} y={-5.7} width={hw * 2} height={7.8} rx={2.4} fill="#fff" fillOpacity={0.3} {...s} />
          <path d={`M${f(x - hw + 1.6)} -1 L${f(x - hw + 3.6)} -4.2`} stroke="#fff" strokeWidth={0.6} strokeLinecap="round" opacity={0.7} />
        </g>
      ))}
      <path d={`M${lenses[1][0] + lenses[1][1]} -2.6 Q${f((lenses[0][0] - lenses[0][1] + lenses[1][0] + lenses[1][1]) / 2)} -4.2 ${lenses[0][0] - lenses[0][1]} -2.6`} fill="none" {...s} />
      {temples.map((d, i) => (
        <path key={i} d={d} fill="none" {...s} />
      ))}
    </g>
  );
}

function TopGlasses({ lenses, extra }) {
  // óculos apoiados no cabelo: contorno escuro por baixo + armação clara
  const shape = (
    <>
      {lenses.map(([x, y, rx, ry, rot], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${rot} ${x} ${y})`} />
      ))}
      <path d={extra} />
    </>
  );
  return (
    <g className="cx-b-glasses">
      <g fill="none" stroke={C.line} strokeWidth={3} strokeLinecap="round">{shape}</g>
      <g fill="#9FB4C6" fillOpacity={0.55} stroke={C.silver} strokeWidth={1.2} strokeLinecap="round">{shape}</g>
    </g>
  );
}

/* ---------- cabelos: vista lateral (¾, olhando para a esquerda) ---------- */
function SideHair({ b }) {
  switch (b.id) {
    case 'b01': // volumoso, penteado para trás
      return (
        <g>
          <path d="M-11.8 -12.4 C-8 -14.6 -2 -14 3 -13 C7 -13.4 11 -13.8 14.2 -13.2 C16 -18.5 13.4 -24 7 -26 C0 -28.4 -8.6 -27.4 -12.2 -22.6 C-14 -19.6 -13.4 -15.4 -11.8 -12.4 Z" {...HAIR} />
          <path d="M-9.6 -20.6 C-4 -24.6 4 -24.2 10.4 -20.2 M-8.6 -16.4 C-3 -19.6 4 -19.2 11.6 -16.2" {...HI} />
        </g>
      );
    case 'b02': // curto, topete na frente penteado de lado
      return (
        <g>
          <path d="M-14.6 -12 C-17.6 -15 -19 -22 -15.8 -26.6 C-14.2 -28.6 -11.4 -27.4 -9 -25.4 C-5.6 -25.8 -2 -25 1 -24.2 C8 -24 14 -21.6 17 -15.6 C18.4 -12.4 18.4 -8.6 17.6 -5.6 C14 -9.8 9 -11.8 4.6 -12.2 C-2 -13.4 -9 -13.6 -14.6 -12 Z" {...HAIR} />
          <path d="M-14.4 -22.6 C-11.6 -19.4 -5 -19.2 1 -19.8 M-12 -15.6 C-5 -17.6 4 -17 11 -14.6" {...HI} />
        </g>
      );
    case 'b03': // comprido, alisado para trás até a nuca
      return (
        <g>
          <path d="M-13.2 -12 C-14.6 -15.5 -12 -20.6 -6 -21.8 C2 -23.2 11.6 -21.2 15.8 -14 C18.4 -9 18.6 -2 17.4 5 L10.6 8.4 C11 2 10.6 -3.4 8.8 -6.6 C7.6 -9.8 5.6 -11.8 3 -12.2 C-3 -13.6 -8.6 -13.8 -13.2 -12 Z" {...HAIR} />
          <path d="M-11.6 -14.6 C-5 -19.4 6 -18.6 13.6 -11.6 M-7 -18.6 C0 -20.6 9 -18.6 15 -11 M12.6 -6 C14.2 -2 14.4 2 13.8 5.4" {...HI} />
        </g>
      );
    default: // b04: curto, cacheado/texturizado
      return (
        <g>
          <path d="M-14.6 -10 Q-18 -11.6 -16.4 -14.4 Q-19 -18.6 -13.8 -20.6 Q-13.2 -25.8 -7.6 -24.2 Q-4 -28.2 0.6 -24.8 Q5.2 -27.8 8.8 -23.2 Q14 -24.2 14.4 -19 Q18.6 -16.4 16.2 -12 C12 -13.2 7.6 -13 3.6 -12.4 C0.6 -10.6 -2.6 -12 -4.8 -10.4 C-8 -12 -11.4 -11.6 -14.6 -10 Z" {...HAIR} />
          <path d="M-11.6 -17 q1.8 -2.6 4 -0.6 M-5.6 -20 q2 -2.6 4.2 -0.4 M1.2 -19.4 q2 -2.6 4.2 -0.4 M7.4 -17.4 q2 -2.2 3.8 0 M-8.6 -13.6 q1.8 -2.2 3.8 -0.2 M-1.6 -15 q2 -2.4 4 -0.2 M5 -14.2 q1.8 -2 3.6 0" {...HI} />
        </g>
      );
  }
}

/* ---------- cabelos: vista frontal ---------- */
function FrontHair({ b }) {
  switch (b.id) {
    case 'b01':
      return (
        <g>
          <path d="M-12.7 -11 C-15 -17 -12.4 -26 1 -27.2 C13 -26.4 15 -17 12.7 -11 C10 -13.8 6 -14.8 1 -14.8 C-5 -15 -10 -13.8 -12.7 -11 Z" {...HAIR} />
          <path d="M-7.4 -17.4 C-6.4 -22 -1 -24.6 5 -25 M-1.6 -16.6 C-1 -20 3.6 -22.6 9 -22.8 M5.4 -16.6 C6.4 -18.6 8.8 -20 11 -20.2" {...HI} />
        </g>
      );
    case 'b02':
      return (
        <g>
          <path d="M-15.7 -10.4 C-17.6 -16 -14 -22 -8 -23.4 C-3 -24.8 4 -25.4 9 -28.2 C13.4 -30.4 16.6 -27.6 14.6 -24.4 C17 -20.6 17.3 -14.6 15.8 -10.4 C13 -13 10 -13.7 7 -13.5 C2 -14.5 -5 -12.7 -9 -12.3 C-12 -12.1 -14 -11.6 -15.7 -10.4 Z" {...HAIR} />
          <path d="M-11.6 -16.4 C-5 -19.8 4 -19.6 12.2 -24.4 M-6 -14.6 C0 -16.6 7 -16.4 13 -19" {...HI} />
        </g>
      );
    case 'b03':
      return (
        <g>
          <path d="M-15 -6.4 C-17.2 -14 -13 -23 0 -23.4 C13 -23 17.2 -14 15 -6.4 C13.4 -10.8 8 -13.8 0 -13.8 C-8 -13.8 -13.4 -10.8 -15 -6.4 Z" {...HAIR} />
          <path d="M-9 -15.6 C-7.6 -20 -3.4 -21.4 -1 -21.6 M9 -15.6 C7.6 -20 3.4 -21.4 1 -21.6 M0 -14.4 V-21" {...HI} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M-15.5 -9.4 Q-18.4 -11 -16.8 -14 Q-19 -19.8 -13.2 -21.4 Q-12.2 -26.6 -6.6 -25 Q-3 -28.8 1 -25.6 Q5.6 -28.6 8.8 -24.4 Q14 -25.4 14.4 -20.2 Q19 -18 16.8 -13.6 Q18.4 -11 15.5 -9.4 C13.6 -11.6 11 -11.9 8 -11.3 C5 -9.8 2 -11.9 0 -10.4 C-3 -11.9 -6 -9.8 -8 -11.3 C-11 -11.9 -13.6 -11.6 -15.5 -9.4 Z" {...HAIR} />
          <path d="M-11.6 -17.4 q1.8 -2.6 4 -0.6 M-5.6 -20.6 q2 -2.6 4.2 -0.4 M1.2 -20.4 q2 -2.6 4.2 -0.4 M7.6 -17.8 q2 -2.2 3.8 0 M-8.6 -14 q1.8 -2.2 3.8 -0.2 M-1.6 -15.6 q2 -2.4 4 -0.2 M5 -14.4 q1.8 -2 3.6 0" {...HI} />
        </g>
      );
  }
}

/* ====================================================================== */

export default function BarberHead({ b, view = 'side', mood = 'calm', alt, uid = b.id }) {
  const { rx, ry, jaw } = b;
  const m = (MOODS[b.id] && MOODS[b.id][mood]) || { mouth: 'calm', lift: 0, tilt: 0 };
  const clip = `cx-clip-${uid}-${view}`;
  const fadeOp = 0.5;

  if (view === 'front') {
    const d = frontOutline(rx, ry, jaw);
    const ex = rx * 0.4;
    const ear = (s) => (
      <g transform={`scale(${s} 1)`}>
        <ellipse cx={rx + (b.id === 'b02' ? 1.4 : 0.6)} cy={0.6} rx={b.id === 'b02' ? 3.4 : 2.8} ry={4.6} fill={b.skin} {...SK} />
      </g>
    );
    return (
      <g className="cx-b-head">
        {b.id === 'b03' && (
          // cabelo comprido caindo atrás das orelhas até a nuca
          <path d="M-15 -8 C-20 -2 -19.6 11 -15.6 17.6 C-13 20 -10 18.6 -10.6 14.6 L-10 0 Z M15 -8 C20 -2 19.6 11 15.6 17.6 C13 20 10 18.6 10.6 14.6 L10 0 Z" {...HAIR} />
        )}
        {ear(1)}
        {ear(-1)}
        <clipPath id={clip}><path d={d} /></clipPath>
        <path d={d} fill={b.skin} />
        <g clipPath={`url(#${clip})`}>
          <Beard b={b} cx={0} left={-rx} right={rx} ry={ry} wide={m.mouth === 'grin'} />
          {b.id !== 'b03' && (
            <path d={`M${-rx - 1} -15 L${-rx + 3.4} -14 L${-rx + 2.6} -5.4 L${-rx - 1} -5.4 Z M${rx + 1} -15 L${rx - 3.4} -14 L${rx - 2.6} -5.4 L${rx + 1} -5.4 Z`} fill={C.hair} opacity={fadeOp} />
          )}
        </g>
        <path d={d} fill="none" {...SK} />
        <FrontHair b={b} />
        <circle cx={-rx * 0.56} cy={5.4} r={2.9} fill={b.blush} opacity={0.4} />
        <circle cx={rx * 0.56} cy={5.4} r={2.9} fill={b.blush} opacity={0.4} />
        <Brow x={-ex} tilt={-m.tilt} lift={m.lift} />
        <Brow x={ex} tilt={m.tilt} lift={m.lift} />
        <Eye x={-ex} rx={b.id === 'b04' ? 1.8 : 1.6} />
        <Eye x={ex} rx={b.id === 'b04' ? 1.8 : 1.6} />
        <path d="M-1.9 3.6 Q0 5.6 1.9 3.6" fill="none" stroke={P.ink} strokeWidth={1.5} strokeLinecap="round" />
        <Mouth x={0} mood={m.mouth} />
        {b.glasses === 'face' && (
          <FaceGlasses
            lenses={[[ex, 4.5], [-ex, 4.5]]}
            temples={[`M${f(ex + 4.5)} -3.2 L${rx + 0.4} -3.8`, `M${f(-ex - 4.5)} -3.2 L${-rx - 0.4} -3.8`]}
          />
        )}
        {b.glasses === 'top' && (
          <TopGlasses lenses={[[-5.4, -19.4, 4.5, 2.9, -4], [5.4, -19.4, 4.5, 2.9, 4]]} extra="M-0.9 -19.4 H0.9 M-9.9 -19 L-13.4 -15.4 M9.9 -19 L13.4 -15.4" />
        )}
      </g>
    );
  }

  /* ---- vista lateral ¾ ---- */
  const d = sideOutline(rx, ry, jaw);
  const fx = -rx * 0.3; // centro do rosto
  const e1 = f(fx + rx * 0.44); // olho próximo
  const e2 = f(fx - rx * 0.38); // olho distante
  const earX = f(rx * 0.6);
  const big = b.id === 'b02';
  return (
    <g className="cx-b-head">
      {b.id === 'b03' && (
        // mecha da nuca: grupo próprio para o movimento secundário (pivô no topo da mecha)
        <g transform="translate(13 3)">
          <g className="cx-b-hairtail">
            <path d="M-4 1 C-4.6 8 -2.4 13.6 2 16.4 C6.4 18.8 10.6 16.2 9.6 12.4 C7.4 14 5.4 12.4 5.4 9 C5.8 5 5.4 1.6 4.4 -1.6 Z" {...HAIR} />
          </g>
        </g>
      )}
      <clipPath id={clip}><path d={d} /></clipPath>
      <path d={d} fill={b.skin} />
      <g clipPath={`url(#${clip})`}>
        <Beard b={b} cx={fx - 0.5} left={-rx} right={earX} ry={ry} wide={m.mouth === 'grin'} />
        {/* nuca / lateral raspada */}
        <path d={`M${f(earX - 5.4)} -15 C${f(earX - 5)} -10 ${f(earX - 3.8)} -8 ${f(earX - 2.6)} -4.6 L${f(earX + 1)} -4.6 L${f(earX + 2.4)} ${b.id === 'b03' ? 16 : 4.6} Q${f(earX + 4.6)} ${b.id === 'b03' ? 16 : 7.4} ${rx + 3} ${b.id === 'b03' ? 16 : 6} L${rx + 3} -16 Z`} fill={C.hair} opacity={b.id === 'b03' ? 1 : 0.86} />
      </g>
      <path d={d} fill="none" {...SK} />
      <ellipse cx={earX} cy={0.8} rx={big ? 3.5 : 3} ry={big ? 4.9 : 4.4} fill={b.skin} {...SK} strokeWidth={1.9} />
      <path d={`M${f(earX + 0.9)} -1.2 q-2.2 1.4 -0.4 3.6`} fill="none" stroke={P.ink} strokeWidth={1.1} strokeLinecap="round" opacity={0.7} />
      <SideHair b={b} />
      <circle cx={f(fx + rx * 0.52)} cy={5.4} r={2.9} fill={b.blush} opacity={0.4} />
      <Brow x={e2} w={2.5} tilt={-m.tilt} lift={m.lift} />
      <Brow x={e1} tilt={m.tilt} lift={m.lift} />
      <Eye x={e2} rx={1.35} />
      <Eye x={e1} rx={b.id === 'b04' ? 1.8 : 1.6} />
      <path d={`M${f(fx + 0.4)} -0.4 C${f(fx - 1.2)} 1.8 ${f(fx - 4)} 3.2 ${f(fx - 3.2)} 4.8 C${f(fx - 2.6)} 5.8 ${f(fx - 1)} 5.6 ${f(fx - 0.2)} 5`} fill="none" stroke={P.ink} strokeWidth={1.5} strokeLinecap="round" />
      {/* duas bocas sobrepostas: a história alterna a opacidade (ex.: sorriso ↔ surpresa) */}
      <g className="cx-b-face--main"><Mouth x={f(fx - 0.5)} mood={m.mouth} /></g>
      {alt && <g className="cx-b-face--alt"><Mouth x={f(fx - 0.5)} mood={alt} /></g>}
      {b.glasses === 'face' && (
        <FaceGlasses lenses={[[e1, 4.5], [e2, 3.5]]} temples={[`M${f(e1 + 4.5)} -3.2 L${f(earX - 0.6)} -3.4`]} />
      )}
      {b.glasses === 'top' && (
        <TopGlasses lenses={[[1.6, -20, 4.9, 2.7, 8], [-8.6, -19, 3.8, 2.5, -10]]} extra="M-3.4 -20 L-4.9 -19.6 M6.4 -19.4 L11.4 -14.4" />
      )}
    </g>
  );
}
