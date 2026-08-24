/* SERVICE WORKER — offline do app. Não intercepta Firebase/Google (deixa passar direto). */
const VERSAO="financas-v10";
const ARQUIVOS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-512-mask.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(ARQUIVOS)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ns=>Promise.all(ns.filter(n=>n!==VERSAO).map(n=>caches.delete(n)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  // só cacheia o próprio site e as fontes; Firebase/googleapis vão direto à rede
  const cacheavel = url.origin===location.origin || url.host.indexOf("fonts.g")>-1;
  if(e.request.method!=="GET" || !cacheavel) return;
  e.respondWith(caches.match(e.request).then(hit=> hit || fetch(e.request).then(r=>{
    if(r&&r.status===200){const cp=r.clone();caches.open(VERSAO).then(c=>c.put(e.request,cp));}
    return r;
  }).catch(()=>hit)));
});
