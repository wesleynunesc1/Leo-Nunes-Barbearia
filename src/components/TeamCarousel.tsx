"use client";

import React from "react";
import { Barber } from "@/data/barbers";
import { BarberCard } from "@/components/BarberCard";
import { ScrollReveal } from "@/components/MotionSystem";

interface TeamCarouselProps {
  barbers: Barber[];
}

export function TeamCarousel({ barbers }: TeamCarouselProps) {
  return (
    <div className="w-full">
      {/* 2 columns on mobile (2x2 grid), 4 columns on desktop with staggered entrance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
        {barbers.map((barber, index) => (
          <ScrollReveal
            key={barber.id}
            direction="up"
            delay={index * 100}
            className="h-full"
          >
            <BarberCard barber={barber} priority={index < 2} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
