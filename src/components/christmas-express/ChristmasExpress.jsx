"use client";

import { useEffect, useRef, useState } from 'react';
import Reindeer from './characters/Reindeer.jsx';
import SantaSleigh from './characters/SantaSleigh.jsx';
import Sparkles from './characters/Sparkles.jsx';
import './ChristmasExpress.css';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(REDUCED_QUERY);
    const update = () => setReduced(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    else mq.addListener(update); // Safari < 14
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, []);
  return reduced;
}

/**
 * Christmas Express — rena puxando o trenó do Papai Noel, da direita para a esquerda.
 *
 * Coloque dentro de um contêiner com `position: relative` (a faixa de cards).
 * O componente é um overlay decorativo: `pointer-events: none`, `aria-hidden`.
 *
 * @param {object}  props
 * @param {number}  [props.duration=10]  Segundos de cada travessia.
 * @param {number}  [props.pause=5]      Segundos de pausa antes de recomeçar.
 * @param {'static'|'hide'} [props.reducedMotion='static']
 *        Com prefers-reduced-motion: 'static' mostra a cena parada; 'hide' não renderiza nada.
 * @param {string}  [props.className]
 * @param {object}  [props.style]        Útil para as variáveis CSS (--cx-height, --cx-offset-y, --cx-z).
 */
export default function ChristmasExpress({
  duration = 10,
  pause = 5,
  reducedMotion = 'static',
  className = '',
  style,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || reduced || typeof track.animate !== 'function') return undefined;

    const travel = Math.max(0.1, duration);
    const rest = Math.max(0, pause);
    const total = travel + rest;

    // Uma única animação infinita: atravessa e depois "descansa" fora da tela.
    // A pista (.cx-track) tem largura = contêiner + conjunto, então -100% leva o
    // conjunto exatamente de "logo depois da borda direita" a "logo antes da esquerda",
    // em qualquer largura de tela, sem medir nada em JS.
    const travelAnim = track.animate(
      [
        { transform: 'translate3d(0,0,0)', offset: 0 },
        { transform: 'translate3d(-100%,0,0)', offset: travel / total },
        { transform: 'translate3d(-100%,0,0)', offset: 1 },
      ],
      { duration: total * 1000, iterations: Infinity, easing: 'linear' }
    );

    let inView = false;
    let pageVisible = !document.hidden;

    const sync = () => {
      const playing = inView && pageVisible;
      root.dataset.playing = playing ? 'true' : 'false'; // o CSS pausa os ciclos internos
      if (playing) travelAnim.play();
      else travelAnim.pause();
    };

    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          inView = entries[entries.length - 1].isIntersecting;
          sync();
        },
        { rootMargin: '64px 0px' }
      );
      observer.observe(root);
    } else {
      inView = true;
    }

    const onVisibility = () => {
      pageVisible = !document.hidden;
      sync();
    };
    document.addEventListener('visibilitychange', onVisibility);
    sync();

    return () => {
      if (observer) observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      travelAnim.cancel();
      delete root.dataset.playing;
    };
  }, [duration, pause, reduced]);

  if (reduced && reducedMotion === 'hide') return null;

  return (
    <div
      ref={rootRef}
      className={`cx-root ${className}`.trim()}
      style={style}
      data-reduced={reduced ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div ref={trackRef} className="cx-track">
        <svg
          className="cx-art"
          viewBox="0 0 760 200"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          role="presentation"
        >
          <Sparkles />
          <Reindeer />
          <SantaSleigh />
        </svg>
      </div>
    </div>
  );
}
