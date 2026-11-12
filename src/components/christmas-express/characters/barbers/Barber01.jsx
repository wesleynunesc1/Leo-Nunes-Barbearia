import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';
import { GroundShadow, SnowKick } from '../SnowFx.jsx';

/** Barbeiro 01 — corre, se assusta com o escorregão do 03 e olha para trás quando o 04 pega o presente. */
export default function Barber01() {
  return (
    <g className="cx-b01-brake">
      <GroundShadow />
      <SnowKick x={9} dur={0.48} phase={0.3} />
      <BarberSide b={BARBERS.b01} pose={RUN_POSE.b01} mood="run" alt="wow" uid="b01" />
    </g>
  );
}
