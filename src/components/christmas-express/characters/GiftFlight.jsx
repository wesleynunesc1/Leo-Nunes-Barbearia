import GiftBox from './Gift.jsx';

/**
 * Presente em voo. Três grupos aninhados, cada um com uma animação simples
 * (X linear · Y em arco · giro), o que resulta numa parábola suave sem
 * precisar de dezenas de keyframes. Os valores vêm de story.js.
 */
export default function GiftFlight() {
  return (
    <g className="cx-gift-fly">
      <g className="cx-gift-x">
        <g className="cx-gift-y">
          <g className="cx-gift-spin">
            <GiftBox />
          </g>
        </g>
      </g>
    </g>
  );
}
