import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';
import GiftBox from '../Gift.jsx';
import { P } from '../shared.jsx';
import { Bits, BreathPuffs, GroundShadow, SnowKick, SNOW } from '../SnowFx.jsx';

/**
 * Barbeiro 04 — o mais baixo; passadas curtas e rápidas. O corpo inteiro é conduzido pela
 * linha do tempo: leva o duende de carona, para ofegante com as mãos nos joelhos, pega o
 * presente no ar e, na reta final, cai na neve e é levantado pelo 03.
 * A caixa "segurada" é filha do antebraço, então acompanha o braço sem deslizar.
 *   cx-b04-advance  posição na fila (inclui ficar parado no chão enquanto o grupo segue)
 *   cx-b04-hop      pulinho da captura
 *   cx-b04-body     corpo inteiro girando em torno dos pés (a queda e o levantar)
 */
export default function Barber04() {
  const held = (
    <g className="cx-b-heldgift" transform="translate(-9 19) rotate(-103)">
      <GiftBox />
    </g>
  );
  return (
    <g className="cx-b04-advance">
      <GroundShadow rx={16} />
      <ellipse className="cx-b04-prone-shadow" cx={-52} cy={3} rx={58} ry={4.6} fill={SNOW.shadow} />
      <g className="cx-b04-kick">
        <SnowKick x={8} dur={0.38} phase={0.45} reach={22} />
      </g>
      <g className="cx-b04-hop">
        <g className="cx-b04-body">
          <BarberSide b={BARBERS.b04} pose={RUN_POSE.b04} mood="run" alt="wow" uid="b04" held={held} />
          {/* brilho no instante da captura */}
          <g transform="translate(-31 -98)">
            <g className="cx-catch-burst">
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <path key={a} transform={`rotate(${a})`} d="M0 -9 L1.6 -18 L0 -27 L-1.6 -18 Z" fill={a % 120 ? P.goldLight : P.gold} />
              ))}
            </g>
          </g>
        </g>
      </g>
      {/* bafinhos de cansaço (mãos nos joelhos) e a neve que espirra na queda */}
      <g transform="translate(-44 -58)">
        <BreathPuffs />
      </g>
      <g transform="translate(-62 -2)">
        <Bits cls="cx-fall-bit" n={9} r={2.2} />
      </g>
    </g>
  );
}
