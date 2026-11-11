import { P, OUTLINE } from './shared.jsx';

/** Caixa verde com laço dourado, centrada na origem (≈ 27 × 30 unidades). */
export default function GiftBox() {
  return (
    <g>
      <rect x={-12} y={-7} width={24} height={18} rx={2} fill={P.green} {...OUTLINE} />
      <rect x={-2.6} y={-7} width={5.2} height={18} fill={P.gold} />
      <rect x={-13.5} y={-12} width={27} height={6.5} rx={1.8} fill={P.green} {...OUTLINE} />
      <rect x={-2.6} y={-12} width={5.2} height={6.5} fill={P.gold} />
      <path
        d="M0 -12 C-9 -23 -15 -14 0 -12 C9 -23 15 -14 0 -12 Z"
        fill={P.gold}
        stroke={P.ink}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <circle cy={-12} r={2.4} fill={P.goldLight} stroke={P.ink} strokeWidth={1.4} />
    </g>
  );
}
