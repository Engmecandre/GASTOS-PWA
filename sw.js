/* =====================================================================
   SERVICE WORKER — o que faz o PWA funcionar offline.

   Ele roda "ao lado" da página, em segundo plano. Sua função aqui:
   1. Na instalação, baixar e guardar (cachear) os arquivos do app.
   2. Em cada pedido de rede, responder primeiro com o que está no cache
      (rápido e funciona offline); se não tiver, busca na internet.

   Sempre que você mudar o app, troque o número da versão abaixo.
   Isso força o navegador a baixar tudo de novo na próxima visita.
===================================================================== */

const VERSAO = "gastos-v2";

// Arquivos essenciais do app (o "esqueleto" que precisa estar offline)
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-mask.png"
];

/* INSTALL: dispara uma vez, quando o SW é registrado.
   Aqui guardamos os arquivos no cache. */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSAO).then((cache) => cache.addAll(ARQUIVOS))
  );
  self.skipWaiting(); // ativa a versão nova imediatamente
});

/* ACTIVATE: limpa caches antigos de versões anteriores. */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

/* FETCH: intercepta toda requisição da página.
   Estratégia "cache primeiro": se já temos o arquivo guardado, devolve
   na hora; senão, busca na rede e guarda uma cópia para a próxima vez.
   (É assim que as fontes do Google ficam disponíveis offline depois
   da primeira abertura online.) */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((emCache) => {
      if (emCache) return emCache;
      return fetch(e.request).then((resposta) => {
        // só cacheia respostas válidas
        if (resposta && resposta.status === 200) {
          const copia = resposta.clone();
          caches.open(VERSAO).then((cache) => cache.put(e.request, copia));
        }
        return resposta;
      }).catch(() => emCache); // offline e sem cache: deixa quieto
    })
  );
});
