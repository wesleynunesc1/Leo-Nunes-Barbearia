import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';
import { Bits, GroundShadow, SnowKick } from '../SnowFx.jsx';

/**
 * Barbeiro 02 — é ele quem leva a neve do espirro da rena no rosto: pisca, se assusta,
 * sacode a cabeça e segue correndo. Também se assusta com o escorregão do 03.
 */
export default function Barber02() {
  return (
    <g className="cx-b02-brake">
      <GroundShadow rx={18} />
      <SnowKick x={9} dur={0.45} phase={0.65} />
      <BarberSide b={BARBERS.b02} pose={RUN_POSE.b02} mood="run" alt="wow" uid="b02" />
      {/* neve que estoura no rosto e depois é sacudida */}
      <g transform="translate(-12 -108)">
        <Bits cls="cx-splat-bit" n={7} r={1.9} />
      </g>
    </g>
  );
}
