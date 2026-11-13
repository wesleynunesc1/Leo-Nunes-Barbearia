"use client";

// Living Christmas Elf 2.3 — React wrapper (real-time 3D elf rendered with WebGL2).
//
// <LivingChristmasElf>
//   <a href="/agendar" className="btn-hero">Agendar meu horário</a>   ← your existing button, untouched
// </LivingChristmasElf>
//
// React renders only the wrapper <span>. The elf (WebGL canvas + animation loop) lives outside React:
// no state updates per frame, no re-renders while it animates.
import { useEffect, useRef } from 'react';
import { createElf } from '../core/index.js';
import '../styles/living-christmas-elf.css';

export default function LivingChristmasElf({
  children,
  inset = undefined,    // px from the button's right edge to the seat (default 0.24 × elf height → top-right corner)
  seat = undefined,     // px fine-tune: how deep he sits on the top edge (default 1)
  size = undefined,     // CSS length for the elf height (default clamp(150px, 12.5vw, 190px))
  personality = 'AUTO', // 'AUTO' | 'CURIOUS' | 'PLAYFUL' | 'SLEEPY'
  interactiveElf = true,// hover, tap ×1/×2/×3/×5 and long press on the elf itself (head/torso only, above the button)
  seed = undefined,     // fixed seed → reproducible behaviour (tests)
  wrapperDisplay = undefined, // e.g. 'block' or 'inline-flex' if the CTA layout needs it
  className = '',
  onDebug = undefined,  // optional, throttled to ~5 Hz — for debug panels only
  apiRef = undefined,   // optional ref → { setPersonality, play, expression, react, ... }
}) {
  const wrapRef = useRef(null);
  const elfRef = useRef(null);
  const debugRef = useRef(onDebug);
  debugRef.current = onDebug;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const button = wrap.querySelector('a, button, [role="button"]');
    try {
      const elf = createElf(wrap, button, {
        inset, seat, size, seed, interactiveElf,
        onDebug: (d) => debugRef.current && debugRef.current(d),
      });
      elfRef.current = elf;
      if (apiRef) apiRef.current = elf;
      return () => {
        elf.destroy();
        elfRef.current = null;
        if (apiRef) apiRef.current = null;
      };
    } catch {
      // Graceful fallback handled within core/index.js
    }
    // mount once; personality has its own effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (elfRef.current) elfRef.current.setPersonality(personality);
  }, [personality]);

  return (
    <span
      ref={wrapRef}
      className={`lce-wrap ${className}`.trim()}
      style={wrapperDisplay ? { '--lce-wrap-display': wrapperDisplay } : undefined}
    >
      {children}
    </span>
  );
}

export { createElf };
export { mountElf, webglAvailable, ACTIONS, PERSONALITIES, EXPRESSIONS } from '../core/index.js';
