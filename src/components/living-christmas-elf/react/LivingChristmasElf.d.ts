import React from 'react';

export interface LivingChristmasElfProps {
  children?: React.ReactNode;
  inset?: number;
  seat?: number;
  size?: string;
  personality?: 'AUTO' | 'CURIOUS' | 'PLAYFUL' | 'SLEEPY' | string;
  interactiveElf?: boolean;
  seed?: number;
  wrapperDisplay?: string;
  className?: string;
  onDebug?: (debugData: any) => void;
  apiRef?: React.MutableRefObject<any>;
}

declare const LivingChristmasElf: React.FC<LivingChristmasElfProps>;
export default LivingChristmasElf;
export function createElf(wrapper: HTMLElement, button: HTMLElement, options?: any): any;
export function mountElf(button: HTMLElement, options?: any): any;
export function webglAvailable(): boolean;
export const ACTIONS: any;
export const PERSONALITIES: any;
export const EXPRESSIONS: any;

