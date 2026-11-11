import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';

/** Barbeiro 03 — corre e olha para trás, surpreso, quando o 04 pega o presente. */
export default function Barber03() {
  return <BarberSide b={BARBERS.b03} pose={RUN_POSE.b03} mood="run" alt="wow" uid="b03" />;
}
