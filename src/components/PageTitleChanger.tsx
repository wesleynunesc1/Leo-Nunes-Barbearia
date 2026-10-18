"use client";

import { useEffect } from "react";

export function PageTitleChanger() {
  useEffect(() => {
    const originalTitle = document.title;
    const msgs = ["👋 Ei, volta pra aqui!", "💈 Seu corte te espera…"];
    const INTERVAL = 1600;

    let timer: NodeJS.Timeout | null = null;
    let i = 0;

    function startCycle() {
      if (timer) clearInterval(timer);
      i = 0;
      document.title = msgs[i];
      timer = setInterval(() => {
        i = (i + 1) % msgs.length;
        document.title = msgs[i];
      }, INTERVAL);
    }

    function stopCycle() {
      if (timer) clearInterval(timer);
      document.title = originalTitle;
    }

    const handleVisibility = () => {
      if (document.hidden) {
        startCycle();
      } else {
        stopCycle();
      }
    };

    const handleBlur = () => {
      if (document.hidden) return;
      startCycle();
    };

    const handleFocus = () => {
      stopCycle();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      stopCycle();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return null;
}
