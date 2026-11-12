import { BarberSide } from './Barber.jsx';
import { BARBERS, RUN_POSE } from './config.js';
import { GroundShadow, SnowKick, StumbleSpray, SweatDrops } from '../SnowFx.jsx';

/**
 * Barbeiro 03 — cabelo comprido para trás, tatuagens nos braços. É ele quem quase tropeça:
 * pisa torto, o pé desliza, o corpo vai para trás, os braços abrem… e ele se recupera sem cair.
 * O corpo inteiro é conduzido pela linha do tempo (story.js); cx-b03-slip é o pequeno atraso
 * que ele perde no escorregão e recupera correndo.
 */
export default function Barber03() {
  return (
    <g className="cx-b03-slip">
      <GroundShadow />
      <g className="cx-b03-kick">
        <SnowKick x={9} dur={0.52} />
      </g>
      {/* cx-b03-face: vira o corpo inteiro quando ele volta para ajudar o 04 na queda final */}
      <g className="cx-b03-face">
        <BarberSide b={BARBERS.b03} pose={RUN_POSE.b03} mood="run" alt="wow" uid="b03" />
      </g>
      {/* neve espalhada pelo pé que desliza + gotinhas de susto */}
      <g transform="translate(-24 -3)">
        <StumbleSpray />
      </g>
      <g transform="translate(4 -120)">
        <SweatDrops />
      </g>
    </g>
  );
}
