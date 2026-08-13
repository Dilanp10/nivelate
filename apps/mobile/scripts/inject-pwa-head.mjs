// Inyecta los tags PWA en el index.html exportado.
//
// Por qué existe: con `web.output: 'single'` (SPA), Expo Router genera el
// index.html desde un template interno e ignora `app/+html.tsx`, así que no
// hay forma declarativa de agregar el <link rel="manifest">. Los campos `web`
// de app.json tampoco se traducen a un manifest — lo mantenemos a mano en
// public/manifest.json. Sin este paso la PWA no es instalable.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const indexPath = join(dist, 'index.html');

const TAGS = [
  '<link rel="manifest" href="/manifest.json">',
  '<link rel="icon" type="image/png" href="/icons/icon-192.png">',
  '<link rel="apple-touch-icon" href="/icons/icon-192.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
].join('\n    ');

const html = readFileSync(indexPath, 'utf8');

if (html.includes('rel="manifest"')) {
  console.log('inject-pwa-head: ya estaban los tags, nada que hacer');
  process.exit(0);
}

if (!html.includes('</head>')) {
  console.error('inject-pwa-head: no se encontró </head> en dist/index.html');
  process.exit(1);
}

writeFileSync(indexPath, html.replace('</head>', `    ${TAGS}\n  </head>`));
console.log('inject-pwa-head: tags PWA inyectados en dist/index.html');
