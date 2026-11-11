import type { CSSProperties, JSX } from 'react';

export interface ChristmasExpressProps {
  /** Segundos de cada travessia. Padrão: 10 */
  duration?: number;
  /** Segundos de pausa antes de recomeçar. Padrão: 5 */
  pause?: number;
  /** Com prefers-reduced-motion: 'static' mostra a cena parada; 'hide' não renderiza. Padrão: 'static' */
  reducedMotion?: 'static' | 'hide';
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

/** Peças SVG avulsas — devem ser renderizadas dentro de um <svg viewBox="0 0 760 200">. */
export function Reindeer(): JSX.Element;
export function SantaSleigh(): JSX.Element;
export function Sparkles(): JSX.Element;
