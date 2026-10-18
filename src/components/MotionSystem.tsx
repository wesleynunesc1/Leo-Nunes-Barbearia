"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal: Reveals elements smoothly when entering the viewport (IntersectionObserver)
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "left" | "right" | "scale";
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "p" | "span";
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const directionClasses = {
    up: "reveal-fade-up",
    left: "reveal-fade-left",
    right: "reveal-fade-right",
    scale: "reveal-scale-up",
  };

  const animClass = directionClasses[direction];
  const activeClass = isVisible ? "reveal-active" : "";

  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      className={`${animClass} ${activeClass} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/**
 * SpotlightCard: Card with an ambient cursor spotlight tracking mouse coordinates on desktop
 */
interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  glowColor = "rgba(37, 196, 64, 0.11)",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos(null);
      }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer (desktop only) */}
      {isHovered && mousePos && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 hidden sm:block"
          style={{
            background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 80%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

/**
 * PointerAura: Subtle authorial luminous aura in the Hero fold tracking mouse with smooth interpolation
 */
export function PointerAura() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [target, setTarget] = useState({ x: -200, y: -200 });
  const [isClientDesktop, setIsClientDesktop] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop with fine pointer
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || isReduced) return;
    setIsClientDesktop(true);

    const handleMouseMove = (e: MouseEvent) => {
      setTarget({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Smooth lerp loop
    const loop = () => {
      setPos((prev) => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        return {
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08,
        };
      });
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [target.x, target.y]);

  if (!isClientDesktop) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute w-[450px] h-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl transition-opacity duration-700 pointer-events-none"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          background: "radial-gradient(circle, rgba(37, 196, 64, 0.07) 0%, rgba(37, 196, 64, 0.015) 50%, transparent 75%)",
        }}
      />
    </div>
  );
}

/**
 * HeroHeadline: Choreographed line-by-line reveal with signature green sweep
 */
export function HeroHeadline() {
  return (
    <div className="space-y-1">
      {/* Line 1 */}
      <span className="title-line-mask">
        <span className="title-line-inner title-line-delay-1 font-heading text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FFFFFF] leading-[1.1] block">
          NA LÉO NUNES
        </span>
      </span>

      {/* Line 2 with green accent and subtle sweep bar */}
      <span className="title-line-mask relative inline-block">
        <span className="title-line-inner title-line-delay-2 font-heading text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#25C440] leading-[1.1] block">
          VOCÊ SAI COM VISUAL ALINHADO
        </span>
        <span className="green-sweep-bar" aria-hidden="true" />
      </span>
    </div>
  );
}
