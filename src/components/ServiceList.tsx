"use client";

import React, { useState } from "react";
import { BarberService } from "@/data/barbers";
import { ServiceCard } from "@/components/ServiceCard";
import { Scissors, Layers, Shield, CheckCircle2, Droplets } from "lucide-react";

interface ServiceListProps {
  services: BarberService[];
  barberName: string;
  barberSlug?: string;
}

export function ServiceList({ services: initialServices, barberName, barberSlug }: ServiceListProps) {
  const [services, setServices] = useState<BarberService[]>(initialServices);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  React.useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  React.useEffect(() => {
    if (!barberSlug) return;

    const refresh = () => {
      fetch(`/api/bookings/services?barberSlug=${barberSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.services) && data.services.length > 0) {
            setServices(data.services);
          }
        })
        .catch(() => {});
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibility);
    const interval = setInterval(refresh, 60000);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [barberSlug]);

  const categories = [
    { id: "all", label: "Todos os Serviços", icon: Layers, count: services.length },
    {
      id: "cabelo",
      label: "Cortes",
      icon: Scissors,
      count: services.filter((s) => s.category === "cabelo").length,
    },
    {
      id: "combo",
      label: "Combos",
      icon: CheckCircle2,
      count: services.filter((s) => s.category === "combo").length,
    },
    {
      id: "barba",
      label: "Barba",
      icon: Shield,
      count: services.filter((s) => s.category === "barba").length,
    },
    {
      id: "tratamento",
      label: "Tratamentos & Estética",
      icon: Droplets,
      count: services.filter((s) => s.category === "tratamento").length,
    },
  ].filter((c) => c.id === "all" || c.count > 0);

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              role="tab"
              aria-selected={isActive}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25C440] ${
                isActive
                  ? "bg-[#25C440] text-[#080B09] shadow-lg shadow-[#25C440]/20 font-bold"
                  : "bg-[#101611] text-[#A6AEA8] hover:text-[#F5F7F3] hover:bg-[#161F18] border border-[#202A22]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-[#080B09]/20 text-[#080B09]" : "bg-[#1A261D] text-[#25C440]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            barberName={barberName}
            barberSlug={barberSlug}
          />
        ))}
      </div>
    </div>
  );
}
