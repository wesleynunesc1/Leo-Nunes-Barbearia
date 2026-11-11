import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';

/** Barbeiro 02 — corre e olha para trás, surpreso, quando o 04 pega o presente. */
export default function Barber02() {
  return <BarberSide b={BARBERS.b02} pose={RUN_POSE.b02} mood="run" alt="wow" uid="b02" />;
}
