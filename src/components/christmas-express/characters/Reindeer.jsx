import { P, OUTLINE, Pivot } from './shared.jsx';

/**
 * Perna em dois segmentos (coxa + canela) com casco.
 * `kind`: "front" | "hind" — escolhe o ciclo de galope no CSS.
 * `phase`: 0–1 — defasagem dentro da passada.
 */
function Leg({ x, y, kind, phase, far = false }) {
  const fur = far ? P.furDark : P.fur;
  const style = { '--cx-phase': phase };
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`cx-thigh cx-thigh--${kind}`} style={style}>
        <rect x={-6.5} y={-6} width={13} height={38} rx={6.5} fill={fur} {...OUTLINE} />
        <g transform="translate(0 27)">
          <g className={`cx-shin cx-shin--${kind}`} style={style}>
            <rect x={-4.6} y={-4.5} width={9.2} height={31} rx={4.6} fill={fur} {...OUTLINE} />
            <path d="M-5.2 21.5 H5 L5.6 30 Q-1 32.5 -8 30 Z" fill={P.hoof} {...OUTLINE} />
          </g>
        </g>
      </g>
    </g>
  );
}

function Antler({ d, tines, color }) {
  const all = [d, ...tines].join(' ');
  return (
    <>
      <path d={all} fill="none" stroke={P.ink} strokeWidth={8.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={all} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

export default function Reindeer() {
  return (
    <Pivot x={156} y={130} className="cx-deer">
      {/* pernas do lado oposto (atrás do corpo) */}
      <Leg x={131} y={122} kind="front" phase={0.1} far />
      <Leg x={197} y={120} kind="hind" phase={0.6} far />

      {/* cauda */}
      <Pivot x={208} y={102} className="cx-tail">
        <path d="M206 98 C216 86 228 92 224 104 C221 111 212 112 206 108 Z" fill={P.furLight} {...OUTLINE} />
      </Pivot>

      {/* corpo */}
      <path
        d="M103 100 C108 82 148 78 180 82 C201 84 213 97 211 112 C209 128 191 134 165 133 C140 135 118 135 108 125 C100 117 100 108 103 100 Z"
        fill={P.fur}
        {...OUTLINE}
      />
      <path
        d="M112 124 C132 131 178 131 203 121 C196 131 180 134 165 133 C142 135 122 134 112 124 Z"
        fill={P.furLight}
        opacity={0.85}
      />

      {/* tirante que puxa o trenó + rédeas (as pontas ficam escondidas atrás do trenó e da luva) */}
      <path d="M150 114 C210 120 280 126 344 132" fill="none" stroke={P.leather} strokeWidth={3} strokeLinecap="round" />
      <path d="M112 90 C190 72 300 96 376 102" fill="none" stroke={P.leather} strokeWidth={2} strokeLinecap="round" />

      {/* arreio */}
      <path d="M147 80 C142 98 142 116 148 134" fill="none" stroke={P.ink} strokeWidth={9} strokeLinecap="round" />
      <path d="M147 80 C142 98 142 116 148 134" fill="none" stroke={P.red} strokeWidth={4.8} strokeLinecap="round" />
      <circle cx={144} cy={106} r={2.6} fill={P.gold} stroke={P.ink} strokeWidth={1.2} />

      {/* pernas do lado visível */}
      <Leg x={122} y={124} kind="front" phase={0} />
      <Leg x={189} y={122} kind="hind" phase={0.5} />
      {/* "ombreiras" na cor do corpo escondem a emenda das coxas */}
      <circle cx={122} cy={121} r={8} fill={P.fur} />
      <circle cx={189} cy={119} r={8} fill={P.fur} />

      {/* pescoço + cabeça */}
      <Pivot x={110} y={104} className="cx-deer-head">
        <Antler
          color="#D8BC86"
          d="M79 40 C75 28 67 20 58 16"
          tines={['M71 27 C70 20 72 14 76 9']}
        />
        <path d="M124 98 C116 84 106 70 98 54 L72 62 C78 82 88 102 100 116 Z" fill={P.fur} {...OUTLINE} />
        {/* orelha */}
        <Pivot x={94} y={46} className="cx-ear">
          <path d="M92 42 C99 31 112 31 115 38 C111 46 102 51 94 50 Z" fill={P.fur} {...OUTLINE} />
          <path d="M97 43 C102 37 108 36 110 39 C107 43 102 46 97 46 Z" fill={P.blush} opacity={0.7} />
        </Pivot>
        {/* cabeça */}
        <path
          d="M99 51 C99 38 85 33 74 37 C63 41 52 49 45 56 C39 63 43 73 54 73 C66 74 81 73 91 67 C97 63 99 57 99 51 Z"
          fill={P.fur}
          {...OUTLINE}
        />
        <path d="M46 58 C41 65 45 73 54 73 C62 74 67 69 65 63 C61 58 52 55 46 58 Z" fill={P.furLight} />
        <ellipse cx={46.5} cy={60} rx={5.6} ry={4.8} fill={P.ink} />
        <ellipse cx={45} cy={58.4} rx={1.8} ry={1.2} fill="#fff" opacity={0.75} />
        <path d="M52 68.5 q5 3.2 10.5 0" fill="none" stroke={P.ink} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx={67} cy={62} r={4} fill={P.blush} opacity={0.45} />
        <ellipse cx={75} cy={51} rx={3.1} ry={3.6} fill={P.ink} />
        <circle cx={74} cy={49.6} r={1.1} fill="#fff" />
        <path d="M70 44.5 q5 -3 10 -0.5" fill="none" stroke={P.ink} strokeWidth={1.8} strokeLinecap="round" />
        <Antler
          color={P.antler}
          d="M86 39 C86 25 93 15 105 9"
          tines={['M89 25 C82 21 78 15 78 9', 'M96 16 C103 18 109 16 114 12']}
        />
        {/* coleira com guizo */}
        <path d="M95 99 L116 87" stroke={P.ink} strokeWidth={10.5} strokeLinecap="round" />
        <path d="M95 99 L116 87" stroke={P.red} strokeWidth={6} strokeLinecap="round" />
        <Pivot x={97} y={101} className="cx-bell">
          <circle cx={96} cy={106} r={5.2} fill={P.gold} {...OUTLINE} strokeWidth={1.8} />
          <path d="M93 107 h6" stroke={P.ink} strokeWidth={1.3} strokeLinecap="round" />
          <circle cx={94.4} cy={104.2} r={1.2} fill={P.goldLight} />
        </Pivot>
      </Pivot>
    </Pivot>
  );
}
