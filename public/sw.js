// Service Worker Oficial — Leo Nunes Barbearia
// PWA + Offline Shell + Web Push Notifications

const CACHE_NAME = "leo-nunes-barbearia-v1";
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/favicon.ico",
  "/favicon.png",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/images/logo.png",
  "/manifest.json"
];

// Instalação do Service Worker e pré-carregamento do shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de versões antigas de cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de Cache e Rede Segura
// REGRA CRÍTICA: NUNCA servir cache para Wix Bookings, disponibilidade, reservas, login ou Minha Conta.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Apenas métodos GET são candidatos a cache
  if (event.request.method !== "GET") {
    return;
  }

  // 1. ROTAS ESTRITAMENTE PRIVADAS / DINÂMICAS: Sempre REDE DIRETA (Bypass total do cache)
  const isDynamicOrPrivate = 
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/minha-conta") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/cadastro") ||
    url.searchParams.has("timestamp");

  if (isDynamicOrPrivate) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Se for navegação direta de página e estiver offline, exibe tela amigável
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
        return new Response(JSON.stringify({ error: "Sem conexão com o servidor." }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // 2. RECURSOS ESTÁTICOS IMUTÁVEIS (_next/static, fontes, imagens, ícones)
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalida em background
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. PÁGINAS PÚBLICAS NAVEGÁVEIS: Network First com fallback de cache / offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match("/offline.html");
          });
        })
    );
    return;
  }

  // Fallback padrão: tenta rede, depois cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// =============================================================================
// WEB PUSH NOTIFICATIONS
// =============================================================================

self.addEventListener("push", (event) => {
  let data = {
    title: "Leo Nunes Barbearia ✂️",
    body: "Seu horário foi confirmado! Acesse o aplicativo para conferir os detalhes.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    url: "/minha-conta/agendamentos"
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/minha-conta/agendamentos",
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: "open-app",
        title: "Ver Agendamento"
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : "/minha-conta/agendamentos";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
