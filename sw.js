// Service worker do OS Granjas (v9)
// • "Rede primeiro": sempre busca a versão nova no GitHub, então atualizações chegam a todos.
// • Se o GitHub demorar mais de 6 s, estiver fora do ar ou responder com erro, usa a cópia guardada:
//   o app continua abrindo (e mostra "fora do ar" só se o banco também não responder).
// • Banco e login (Supabase) nunca passam por aqui.
// • Notificações: recebe o aviso mesmo com o app fechado e, ao tocar, abre o app direto na OS.
const CACHE = "osg-v9";
const ESSENCIAIS = ["./", "index.html", "app.js", "style.css", "config.js", "supabase.js", "logo.png", "manifest.webmanifest", "icone-192.png"];
self.addEventListener("install", (e) => e.waitUntil((async () => {
  const c = await caches.open(CACHE);
  await Promise.all(ESSENCIAIS.map((u) => c.add(new Request(u, { cache: "no-cache" })).catch(() => {})));
  await self.skipWaiting();
})()));
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardada = () => cache.match(r).then((x) => x || (r.mode === "navigate" ? cache.match("index.html") : undefined));
    try {
      const resp = await Promise.race([fetch(r, { cache: "no-cache" }), new Promise((_, rej) => setTimeout(() => rej(new Error("lento")), 6000))]);
      if (resp.ok) { cache.put(r, resp.clone()); return resp; }
      return (await guardada()) || resp;           // GitHub com erro (404/500): usa a cópia
    } catch {
      return (await guardada()) || Response.error(); // sem resposta: usa a cópia
    }
  })());
});

// ---------- notificações no celular (Web Push)
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { titulo: "OS Granjas", corpo: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titulo || "OS Granjas", {
    body: d.corpo || "", icon: "icone-192.png", badge: "icone-192.png", tag: d.tag || undefined, renotify: !!d.tag,
    requireInteraction: !!d.urgente, vibrate: d.urgente ? [300, 120, 300, 120, 300] : [160], data: { url: d.url || "" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "";
  e.waitUntil((async () => {
    const abas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const aba = abas.find((c) => c.url.startsWith(self.registration.scope));
    if (aba) { await aba.focus(); aba.postMessage({ abrirOS: url }); return; }
    await self.clients.openWindow(new URL("./" + url, self.registration.scope).href);
  })());
});
