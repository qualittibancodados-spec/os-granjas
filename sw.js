// Service worker do OS Granjas: permite instalar o app e abre mais rápido.
// Estratégia "rede primeiro": sempre busca a versão nova; o cache só é usado sem internet.
// Assim uma atualização no GitHub chega a todos sem ficar presa em versão antiga.
const CACHE = "osg-v7";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return; // banco e login (Supabase) nunca passam pelo cache
  e.respondWith((async () => {
    try {
      const resp = await fetch(r, { cache: "no-cache" });
      if (resp.ok) (await caches.open(CACHE)).put(r, resp.clone());
      return resp;
    } catch {
      return (await caches.match(r)) || (r.mode === "navigate" ? caches.match("./index.html") : Response.error());
    }
  })());
});
