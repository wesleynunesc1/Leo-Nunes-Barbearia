import type { CSSProperties, JSX } from 'react';

export interface ChristmasExpressProps {
  /** Segundos de cada travessia (a cena do presente escala junto). Padrão: 15 */
  duration?: number;
  /** Segundos de pausa antes de recomeçar. Padrão: 5 */
  pause?: number;
  /** Com prefers-reduced-motion: 'static' mostra a cena parada; 'hide' não renderiza. Padrão: 'static' */
  reducedMotion?: 'static' | 'hide';
  /** Contorno claro em volta dos personagens, para fundos escuros. Padrão: false */
  halo?: boolean;
  className?: string;
  /** Aceita as variáveis CSS --cx-height, --cx-offset-y, --cx-z e --cx-stride. */
  style?: CSSProperties & {
    '--cx-height'?: string;
    '--cx-offset-y'?: string;
    '--cx-z'?: number | string;
    '--cx-stride'?: string;
  };
}

export function ChristmasExpress(props: ChristmasExpressProps): JSX.Element | null;
export default ChristmasExpress;

/** Peças SVG avulsas — devem ser renderizadas dentro de um <svg viewBox="0 0 915 200">. */
export function Reindeer(): JSX.Element;
export function SantaSleigh(): JSX.Element;
export function Sparkles(): JSX.Element;
export function Barber01(): JSX.Element;
export function Barber02(): JSX.Element;
export function Barber03(): JSX.Element;
export function Barber04(): JSX.Element;
export function GiftBox(): JSX.Element;
export function GiftFlight(): JSX.Element;
