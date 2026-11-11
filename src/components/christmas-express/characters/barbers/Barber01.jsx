import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';

/** Barbeiro 01 — corre e olha para trás, surpreso, quando o 04 pega o presente. */
export default function Barber01() {
  return <BarberSide b={BARBERS.b01} pose={RUN_POSE.b01} mood="run" alt="wow" uid="b01" />;
}
