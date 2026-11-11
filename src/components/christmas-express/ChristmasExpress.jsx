"use client";

import { useEffect, useRef, useState } from 'react';
import Reindeer from './characters/Reindeer.jsx';
import SantaSleigh from './characters/SantaSleigh.jsx';
import Sparkles from './characters/Sparkles.jsx';
import Barber01 from './characters/barbers/Barber01.jsx';
import Barber02 from './characters/barbers/Barber02.jsx';
import Barber03 from './characters/barbers/Barber03.jsx';
import Barber04 from './characters/barbers/Barber04.jsx';
import GiftFlight from './characters/GiftFlight.jsx';
import { createStory } from './story.js';
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
 * Christmas Express 2.0 — a rena puxa o trenó do Papai Noel e os quatro barbeiros correm
 * atrás. No meio da travessia o Noel lança um presente, que o barbeiro 04 pega no ar.
 *
 * Coloque dentro de um contêiner com `position: relative` (a faixa de cards).
 * O componente é um overlay decorativo: `pointer-events: none`, `aria-hidden`.
 *
 * @param {object}  props
 * @param {number}  [props.duration=15]  Segundos de cada travessia (a cena do presente escala junto).
 * @param {number}  [props.pause=5]      Segundos de pausa antes de recomeçar.
 * @param {'static'|'hide'} [props.reducedMotion='static']
 *        Com prefers-reduced-motion: 'static' mostra a cena parada; 'hide' não renderiza nada.
 * @param {boolean} [props.halo=false]   Contorno claro em volta dos personagens (para fundos escuros).
 * @param {string}  [props.className]
 * @param {object}  [props.style]        Útil para as variáveis CSS (--cx-height, --cx-offset-y, --cx-z).
 */
export default function ChristmasExpress({
  duration = 15,
  pause = 5,
  reducedMotion = 'static',
  halo = false,
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

    // Cena do presente: mesma duração e mesmo relógio da travessia.
    const anims = [travelAnim, ...createStory(root, travel, total)];

    let inView = false;
    let pageVisible = !document.hidden;

    const sync = () => {
      const playing = inView && pageVisible;
      root.dataset.playing = playing ? 'true' : 'false'; // o CSS pausa os ciclos internos
      anims.forEach((a) => (playing ? a.play() : a.pause()));
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
      anims.forEach((a) => a.cancel());
      delete root.dataset.playing;
    };
  }, [duration, pause, reduced]);

  if (reduced && reducedMotion === 'hide') return null;

  return (
    <div
      ref={rootRef}
      className={`cx-root ${halo ? 'cx-root--halo ' : ''}${className}`.trim()}
      style={style}
      data-reduced={reduced ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div ref={trackRef} className="cx-track">
        <svg
          className="cx-art"
          viewBox="0 0 915 200"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          role="presentation"
        >
          <Sparkles />
          <Reindeer />
          <SantaSleigh />
          {/* barbeiros, do mais próximo ao mais distante do trenó: 03 · 02 · 01 · 04 */}
          <g transform="translate(620 188)"><Barber03 /></g>
          <g transform="translate(692 188)"><Barber02 /></g>
          <g transform="translate(764 188)"><Barber01 /></g>
          <g transform="translate(862 188)"><Barber04 /></g>
          <GiftFlight />
        </svg>
      </div>
    </div>
  );
}
