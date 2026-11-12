import type { CSSProperties, JSX } from 'react';

export interface ChristmasExpressProps {
  /** Segundos da história (da entrada ao grupo reunido depois da queda). Toda a coreografia escala junto. Padrão: 32 */
  duration?: number;
  /** Segundos da saída acelerada, depois da história. Padrão: 4 */
  exit?: number;
  /** Segundos de pausa, com tudo fora da tela, antes de recomeçar. Padrão: 5 */
  pause?: number;
  /** Brilho noturno azulado atrás da cena, sem bordas duras. Padrão: 'soft' */
  backdrop?: 'soft' | 'none';
  /** Neve caindo de leve. Padrão: true */
  snowfall?: boolean;
  /** Contorno claro em volta dos personagens, para fundos muito escuros. Padrão: false */
  halo?: boolean;
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

/** Cenário fixo (HTML/SVG): brilho, pontos de luz, pinheiros, chão nevado e neve caindo. */
export function Scenery(props: { backdrop?: 'soft' | 'none'; snowfall?: boolean }): JSX.Element;

/** Peças SVG avulsas — devem ser renderizadas dentro de um <svg viewBox={VIEW_BOX}> ("0 -4 1000 222"). */
export function Reindeer(): JSX.Element;
export function SantaSleigh(): JSX.Element;
export function Sparkles(): JSX.Element;
export function Barber01(): JSX.Element;
export function Barber02(): JSX.Element;
export function Barber03(): JSX.Element;
export function Barber04(): JSX.Element;
export function Elf(): JSX.Element;
export function GiftBox(): JSX.Element;
export function GiftFlight(): JSX.Element;
export function GroundShadow(props?: { x?: number; y?: number; rx?: number; ry?: number; opacity?: number }): JSX.Element;
export function SnowKick(props?: { x?: number; y?: number; dur?: number | string; phase?: number; n?: number; reach?: number; size?: number }): JSX.Element;
export function WindStreaks(): JSX.Element;
export function SneezeCloud(): JSX.Element;
export function StumbleSpray(): JSX.Element;
export function SweatDrops(): JSX.Element;
export function SneezeBall(): JSX.Element;
export function GustLines(): JSX.Element;
export function Bits(props: { cls: string; n?: number; r?: number }): JSX.Element;
export function BreathPuffs(props?: { n?: number }): JSX.Element;

export const VIEW_BOX: string;
export const GROUND_Y: number;
export const LANE: { b03: number; b02: number; b01: number; b04: number; elf: number };
/** Tempos da coreografia, em segundos-base (história de 32 s). */
export const TIMELINE: Record<string, number>;
export function planTravel(o: { W: number; L: number; exit?: number }): { frames: { t: number; x: number }[]; end: number };
