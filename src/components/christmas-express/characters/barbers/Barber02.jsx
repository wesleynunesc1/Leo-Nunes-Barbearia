import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';
import { GroundShadow, SnowKick } from '../SnowFx.jsx';

/** Barbeiro 02 — corre logo atrás do 03: é o primeiro a se assustar com o escorregão. */
export default function Barber02() {
  return (
    <g className="cx-b02-brake">
      <GroundShadow rx={18} />
      <SnowKick x={9} dur={0.45} phase={0.65} />
      <BarberSide b={BARBERS.b02} pose={RUN_POSE.b02} mood="run" alt="wow" uid="b02" />
    </g>
  );
}
