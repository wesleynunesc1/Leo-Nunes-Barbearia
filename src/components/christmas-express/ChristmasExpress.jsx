"use client";

import { useEffect, useRef, useState } from 'react';
import Scenery from './scene/Scenery.jsx';
import Reindeer from './characters/Reindeer.jsx';
import SantaSleigh from './characters/SantaSleigh.jsx';
import Sparkles from './characters/Sparkles.jsx';
import Elf from './characters/Elf.jsx';
import Barber01 from './characters/barbers/Barber01.jsx';
import Barber02 from './characters/barbers/Barber02.jsx';
import Barber03 from './characters/barbers/Barber03.jsx';
import Barber04 from './characters/barbers/Barber04.jsx';
import GiftFlight from './characters/GiftFlight.jsx';
import { SneezeCloud, WindStreaks } from './characters/SnowFx.jsx';
import { BASE, createStory, planTravel } from './story.js';
import { GROUND_Y, LANE, VIEW_BOX } from './geometry.js';
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
 * Christmas Express 3.0 — faixa natalina: chão nevado, pinheiros nas pontas e a perseguição
 * atravessando da direita para a esquerda. A rena puxa o trenó do Papai Noel (e espirra neve),
 * os quatro barbeiros correm atrás (o 03 quase tropeça), o duende tenta acompanhar, o Noel
 * lança um presente e o barbeiro 04 pega no ar.
 *
 * Coloque dentro de um contêiner com `position: relative` (a faixa de cards).
 * O componente é um overlay decorativo: `pointer-events: none`, `aria-hidden`.
 *
 * @param {object}  props
 * @param {number}  [props.duration=24]  Segundos da história (da entrada ao aceno final). Tudo escala junto.
 * @param {number}  [props.exit=4]     Segundos da saída acelerada, depois da história.
 * @param {number}  [props.pause=5]      Segundos de pausa, com tudo fora da tela, antes de recomeçar.
 * @param {'soft'|'none'} [props.backdrop='soft']  Brilho noturno azulado atrás da cena (sem bordas duras).
 * @param {boolean} [props.snowfall=true]  Neve caindo de leve.
 * @param {boolean} [props.halo=false]   Contorno claro em volta dos personagens (para fundos muito escuros).
 * @param {'static'|'hide'} [props.reducedMotion='static']
 *        Com prefers-reduced-motion: 'static' mostra a cena parada; 'hide' não renderiza nada.
 * @param {string}  [props.className]
 * @param {object}  [props.style]        Útil para as variáveis CSS (--cx-height, --cx-offset-y, --cx-z).
 */
export default function ChristmasExpress({
  duration = 24,
  exit = 4,
  pause = 5,
  backdrop = 'soft',
  snowfall = true,
  halo = false,
  reducedMotion = 'static',
  className = '',
  style,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const trailRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const trail = trailRef.current;
    if (!root || !track || reduced || typeof track.animate !== 'function') return undefined;

    const story = Math.max(1, duration);
    const scale = story / BASE;
    const out = Math.max(0.5, exit);
    const total = story + out + Math.max(0, pause);
    const endBase = BASE + out / scale;

    let anims = [];
    let size = '';
    let inView = !('IntersectionObserver' in window);
    let pageVisible = !document.hidden;

    const sync = () => {
      const playing = inView && pageVisible;
      root.dataset.playing = playing ? 'true' : 'false'; // o CSS pausa os ciclos internos
      anims.forEach((a) => (playing ? a.play() : a.pause()));
    };

    // Monta (ou remonta, se a largura mudar) todas as animações. Nenhum estado React é tocado:
    // são só animações WAAPI de transform/opacity, calculadas uma vez por tamanho de tela.
    const build = () => {
      const W = root.clientWidth;
      const L = track.offsetWidth;
      if (!W || !L) return;
      const key = `${W}x${L}`;
      if (key === size) return;
      size = key;

      const at = anims.length ? anims[0].currentTime : 0; // mantém o ponto da história num resize
      anims.forEach((a) => a.cancel());

      const plan = planTravel({ W, L, exit: out / scale });
      const timing = { duration: total * 1000, iterations: Infinity };
      const offset = (t) => Math.min(1, (t * scale) / total);
      const path = (sign) => {
        const frames = plan.frames.map(({ t, x }) => ({
          transform: `translate3d(${(sign * (x - W)).toFixed(2)}px,0,0)`,
          offset: offset(t),
          easing: 'linear',
        }));
        frames.push({ transform: frames[frames.length - 1].transform, offset: 1 });
        return frames;
      };

      // 1) a pista: leva o conjunto de "logo depois da borda direita" a "logo antes da esquerda"
      anims = [track.animate(path(1), timing)];

      // 2) o rastro: a janela anda com o conjunto, mas as marcas ficam paradas na neve
      //    (o miolo recebe o movimento inverso, quadro a quadro igual ao da pista)
      if (trail) {
        const inner = trail.firstElementChild;
        const reach = W + L * 1.9;
        inner.style.left = `${-reach}px`;
        inner.style.width = `${reach + trail.offsetWidth + 8}px`;
        anims.push(inner.animate(path(-1), timing));
        anims.push(
          trail.animate(
            [
              { opacity: 1, offset: 0 },
              { opacity: 1, offset: offset(plan.end - 1.4) },
              { opacity: 0, offset: offset(plan.end - 0.3) },
              { opacity: 0, offset: 1 },
            ],
            timing
          )
        );
      }

      // 3) a história: mesmo relógio da travessia
      anims.push(...createStory(root, { scale, total, endBase }));

      if (at) anims.forEach((a) => { a.currentTime = at; });
      root.dataset.ready = 'true';
      sync();
    };

    build();

    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    };
    let resizeObserver = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(root);
    } else {
      window.addEventListener('resize', onResize);
    }

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
    }

    const onVisibility = () => {
      pageVisible = !document.hidden;
      sync();
    };
    document.addEventListener('visibilitychange', onVisibility);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', onResize);
      if (observer) observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      anims.forEach((a) => a.cancel());
      anims = [];
      delete root.dataset.playing;
      delete root.dataset.ready;
    };
  }, [duration, exit, pause, reduced]);

  if (reduced && reducedMotion === 'hide') return null;

  return (
    <div
      ref={rootRef}
      className={`cx-root ${halo ? 'cx-root--halo ' : ''}${className}`.trim()}
      style={style}
      data-reduced={reduced ? 'true' : 'false'}
      aria-hidden="true"
    >
      {/* cenário fixo: brilho, pontinhos de luz, pinheiros, chão nevado, neve caindo */}
      <Scenery backdrop={backdrop} snowfall={snowfall} />

      {/* a pista: tudo o que atravessa a tela */}
      <div ref={trackRef} className="cx-track">
        <div ref={trailRef} className="cx-trail">
          <div className="cx-trail-marks" />
        </div>
        <svg className="cx-art" viewBox={VIEW_BOX} xmlns="http://www.w3.org/2000/svg" focusable="false" role="presentation">
          <WindStreaks />
          <Sparkles />
          <Reindeer />
          <SantaSleigh />
          {/* barbeiros, do mais próximo ao mais distante do trenó: 03 · 02 · 01 · 04 — e o duende por último */}
          <g transform={`translate(${LANE.b03} ${GROUND_Y})`}><Barber03 /></g>
          <g transform={`translate(${LANE.b02} ${GROUND_Y})`}><Barber02 /></g>
          <g transform={`translate(${LANE.b01} ${GROUND_Y})`}><Barber01 /></g>
          <g transform={`translate(${LANE.b04} ${GROUND_Y})`}><Barber04 /></g>
          <g transform={`translate(${LANE.elf} ${GROUND_Y})`}><Elf /></g>
          <SneezeCloud />
          <GiftFlight />
        </svg>
      </div>
    </div>
  );
}
