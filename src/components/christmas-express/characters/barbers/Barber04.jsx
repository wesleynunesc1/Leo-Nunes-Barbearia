import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';
import GiftBox from '../Gift.jsx';
import { P } from '../shared.jsx';

/**
 * Barbeiro 04 — o mais baixo; passadas curtas e rápidas. É ele quem pega o presente:
 * a caixa "segurada" é filha do antebraço, então acompanha os braços sem deslizar.
 */
export default function Barber04() {
  const held = (
    <g className="cx-b-heldgift" transform="translate(-9 19) rotate(-103)">
      <GiftBox />
    </g>
  );
  return (
    <g className="cx-b04-advance">
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
  );
}
