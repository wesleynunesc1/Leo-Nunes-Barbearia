import { P, OUTLINE, Pivot } from './shared.jsx';
import GiftBox from './Gift.jsx';
import { GroundShadow, SnowKick } from './SnowFx.jsx';

function Bow({ x, y, color }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 0 C-9 -11 -15 -2 0 0 C9 -11 15 -2 0 0 Z"
        fill={color}
        stroke={P.ink}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <circle r={2.4} fill={color} stroke={P.ink} strokeWidth={1.4} />
    </g>
  );
}

/** Presentes empilhados no fundo do trenó (a base fica escondida pela carroceria). */
function Presents() {
  return (
    <Pivot x={500} y={110} className="cx-presents">
      <g transform="rotate(5 510 80)">
        <rect x={497} y={46} width={28} height={64} rx={2.5} fill={P.cream} {...OUTLINE} />
        <rect x={508} y={46} width={6} height={64} fill={P.red} />
        <Bow x={511} y={46} color={P.red} />
      </g>
      {/* caixa verde: é esta que o Papai Noel pega (some da pilha quando vai para a mão) */}
      <g className="cx-pile-green" transform="rotate(-4 483 90)">
        <rect x={467} y={68} width={31} height={50} rx={2.5} fill={P.green} {...OUTLINE} />
        <rect x={479.5} y={68} width={6} height={50} fill={P.gold} />
        <rect x={467} y={82} width={31} height={5} fill={P.gold} />
        <rect x={467} y={68} width={31} height={50} rx={2.5} fill="none" {...OUTLINE} />
        <Bow x={482.5} y={68} color={P.gold} />
      </g>
      {/* a caixinha azul fica em cima da verde: cai no lugar quando a verde é retirada */}
      <g className="cx-pile-navy">
        <g transform="rotate(-10 481 58)">
          <rect x={471} y={49} width={20} height={18} rx={2} fill={P.navy} {...OUTLINE} />
          <rect x={479} y={49} width={4} height={18} fill={P.goldLight} />
          <Bow x={481} y={49} color={P.goldLight} />
        </g>
      </g>
    </Pivot>
  );
}

/**
 * Papai Noel. Dois grupos extras em volta do corpo (pivô no quadril):
 * cx-santa-sway  — balanço contínuo no banco (CSS), meio passo atrás do trenó;
 * cx-santa-react — solavancos pontuais da história (o espirro da rena puxa as rédeas).
 */
function Santa() {
  return (
    <Pivot x={412} y={124} className="cx-santa-react">
    <Pivot x={412} y={124} className="cx-santa-sway">
      {/* tronco */}
      <path d="M381 124 C375 92 390 72 412 72 C437 72 449 94 445 124 Z" fill={P.red} {...OUTLINE} />

      {/* braço que acena: ombro → punho → luva */}
      <Pivot x={437} y={90} className="cx-wave-arm">
        <path d="M437 90 L456 56" stroke={P.ink} strokeWidth={17} strokeLinecap="round" />
        <path d="M437 90 L456 56" stroke={P.red} strokeWidth={12.2} strokeLinecap="round" />
        {/* presente na mão (visível só entre pegar e lançar) */}
        <g className="cx-santa-gift" transform="translate(458 36)">
          <GiftBox />
        </g>
        <Pivot x={457} y={54} className="cx-wave-hand">
          <ellipse cx={451.5} cy={43} rx={3.6} ry={5} transform="rotate(-35 451.5 43)" fill={P.green} {...OUTLINE} strokeWidth={2} />
          <path
            d="M454 50 C451 41 456 32 463 33 C471 34 472 44 467 52 Z"
            fill={P.green}
            {...OUTLINE}
            strokeWidth={2}
          />
        </Pivot>
        <path d="M451.5 56.5 L463 61.5" stroke={P.ink} strokeWidth={12} strokeLinecap="round" />
        <path d="M451.5 56.5 L463 61.5" stroke={P.cream} strokeWidth={7.6} strokeLinecap="round" />
      </Pivot>

      {/* cabeça */}
      <Pivot x={406} y={50} className="cx-santa-turn">
      <Pivot x={407} y={70} className="cx-santa-head">
        {/* gorro */}
        <Pivot x={418} y={34} className="cx-hat">
          <path d="M388 41 C387 20 406 9 425 15 C436 18 442 24 446 31 C438 28 431 31 427 41 Z" fill={P.red} {...OUTLINE} />
          <circle cx={447} cy={30} r={6.6} fill={P.cream} {...OUTLINE} />
        </Pivot>
        <circle cx={406} cy={50} r={16.5} fill={P.skin} {...OUTLINE} />
        <circle cx={412} cy={56} r={3.8} fill={P.blush} opacity={0.55} />
        {/* barba */}
        <path
          d="M388 50 C382 62 385 74 391 80 C393 87 400 92 407 91 C414 93 421 87 423 80 C429 73 429 60 424 49 C424 58 416 61 407 60 C398 61 390 58 388 50 Z"
          fill={P.cream}
          {...OUTLINE}
        />
        {/* olhos sorridentes + sobrancelhas */}
        <path d="M393.4 51 q2.6 -3.2 5.2 0 M404.4 51 q2.6 -3.2 5.2 0" fill="none" stroke={P.ink} strokeWidth={1.9} strokeLinecap="round" />
        {/* sorriso (e a risada aberta, que a história liga quando ele pega o presente e no aceno final) */}
        <path className="cx-santa-mouth--main" d="M395.4 69.4 q4.6 4.2 9.2 0" fill="none" stroke={P.ink} strokeWidth={1.7} strokeLinecap="round" />
        <path
          className="cx-santa-mouth--alt"
          d="M394.2 68.2 q5.8 1.8 11.6 0 q-0.6 7.2 -5.8 7.4 q-5.2 -0.2 -5.8 -7.4 Z"
          fill="#7C2A2A"
          stroke={P.ink}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* bigode de barbeiro (handlebar) */}
        <path
          d="M400 60 C394 57 388 62 382 56 C382 66 393 69 400 64.5 C407 69 417 66 418 56 C412 62 406 57 400 60 Z"
          fill="#fff"
          {...OUTLINE}
          strokeWidth={1.7}
        />
        <circle cx={399.5} cy={56} r={3.7} fill={P.blush} {...OUTLINE} strokeWidth={1.6} />
        {/* aba do gorro */}
        <path
          d="M384 41 C384 33 394 31 406 31 C418 31 428 33 428 41 C428 47 418 45 406 45 C394 45 384 47 384 41 Z"
          fill={P.cream}
          {...OUTLINE}
        />
      </Pivot>
      </Pivot>
    </Pivot>
    </Pivot>
  );
}

const BODY =
  'M322 98 C316 84 330 74 340 84 C347 97 354 110 374 110 L470 110 C498 110 514 92 522 64 C525 54 541 55 540 68 C539 112 534 142 512 156 L358 156 C334 153 325 128 322 98 Z';
const RIM =
  'M322 98 C316 84 330 74 340 84 C347 97 354 110 374 110 L470 110 C498 110 514 92 522 64 C525 54 541 55 540 68';
const RUNNER =
  'M336 168 C324 157 305 163 307 176 C309 184 320 186 332 186 L528 186 C539 186 545 180 547 173 M374 157 L368 186 M498 157 L504 186';

export default function SantaSleigh() {
  return (
    <g className="cx-sleigh-jolt">
      <GroundShadow x={428} y={191} rx={122} ry={5.4} />
      {/* neve que os patins levantam */}
      <SnowKick x={548} y={186} dur={0.5} n={3} reach={40} size={2.8} />
      <SnowKick x={330} y={187} dur={0.62} phase={0.3} n={2} reach={24} size={2.2} />
    <Pivot x={430} y={186} className="cx-sleigh">
      {/* patins */}
      <path d={RUNNER} fill="none" stroke={P.ink} strokeWidth={8.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={RUNNER} fill="none" stroke={P.gold} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />

      <Presents />
      <Santa />

      {/* carroceria */}
      <path d={BODY} fill={P.red} {...OUTLINE} />
      <path
        d="M328 128 C334 146 345 154 358 156 L512 156 C524 148 531 137 535 120 C522 140 500 146 470 146 L374 146 C352 146 337 141 328 128 Z"
        fill={P.redDark}
      />
      <path d={BODY} fill="none" {...OUTLINE} />
      <path d={RIM} fill="none" stroke={P.ink} strokeWidth={8.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={RIM} fill="none" stroke={P.gold} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {/* filigrana dourada */}
      <path
        d="M350 131 C392 121 466 126 504 106 C511 102 517 106 514 112 C512 116 506 115 507 110"
        fill="none"
        stroke={P.gold}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <path d="M430 133 l1.8 4 4.2 .5 -3.1 3 .8 4.3 -3.7 -2.1 -3.7 2.1 .8 -4.3 -3.1 -3 4.2 -.5 Z" fill={P.goldLight} />

      {/* braço que segura as rédeas */}
      <path d="M393 92 L380 100" stroke={P.ink} strokeWidth={16} strokeLinecap="round" />
      <path d="M393 92 L380 100" stroke={P.red} strokeWidth={11.2} strokeLinecap="round" />
      <circle cx={374} cy={102} r={7.6} fill={P.green} {...OUTLINE} strokeWidth={2} />
    </Pivot>
    </g>
  );
}
