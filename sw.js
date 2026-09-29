// Service worker do OS Granjas (v8)
// • "Rede primeiro": sempre busca a versão nova no GitHub, então atualizações chegam a todos.
// • Se o GitHub demorar mais de 6 s, estiver fora do ar ou responder com erro, usa a cópia guardada:
//   o app continua abrindo (e mostra "fora do ar" só se o banco também não responder).
// • Banco e login (Supabase) nunca passam por aqui.
const CACHE = "osg-v8";
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
