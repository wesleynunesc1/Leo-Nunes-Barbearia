"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ThreeDScrollTrigger() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Em mobile (< 768px) ou movimento reduzido, ativa imediatamente sem cálculos pesados de scroll
    if (window.innerWidth < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".video").forEach((el) => {
        el.classList.add("video-ativoo");
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Timeout sutil para garantir que o DOM esteja montado
    const timeout = setTimeout(() => {
      const elements = gsap.utils.toArray<HTMLElement>(".video");
      const triggers: ScrollTrigger[] = [];

      elements.forEach((el) => {
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 60%", // quando o topo do elemento chega a 60% da viewport
          end: "bottom 20%", // e sai da parte de baixo
          toggleClass: { targets: el, className: "video-ativoo" },
          markers: false,
        });
        triggers.push(st);
      });

      // Recalcula posições do ScrollTrigger
      ScrollTrigger.refresh();
    }, 120);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return null;
}
