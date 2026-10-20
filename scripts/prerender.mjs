// Derlemenin son adımı: herkese açık sayfaları gerçek içerikleriyle HTML olarak yazar ki arama motorları
// JavaScript çalıştırmadan da görsün. Ayrıca giriş gerektiren sayfalar için boş bir kabuk (app.html),
// 404 sayfası, sitemap.xml ve robots.txt üretir. Caddy bu dosyaları adrese göre seçer.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dist = resolve('dist');
const { render, PUBLIC_PAGES, SITE_URL, pageMeta } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const template = readFileSync(resolve(dist, 'index.html'), 'utf-8');

const escape = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Şablonun <head>'ini sayfaya göre düzenler ve gövdeye içeriği koyar. */
function page({ meta, body = '', jsonLd = null }) {
    let html = template
        .replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`)
        .replace(/<meta name="description" content="[^"]*" \/>/, meta.description
            ? `<meta name="description" content="${escape(meta.description)}" />` : '')
        .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escape(meta.title)}" />`)
        .replace(/<meta property="og:description" content="[^"]*" \/>/, meta.description
            ? `<meta property="og:description" content="${escape(meta.description)}" />` : '')
        .replace(/<meta property="og:url" content="[^"]*" \/>/, meta.canonical
            ? `<meta property="og:url" content="${meta.canonical}" />` : '');

    const head = [
        meta.canonical ? `<link rel="canonical" href="${meta.canonical}" />` : '',
        meta.index ? '' : '<meta name="robots" content="noindex" />',
        jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '',
        // JavaScript kapalıysa ekrana girince belirecek bölümler hiç görünmez kalmasın
        body ? '<noscript><style>.reveal{opacity:1;transform:none}</style></noscript>' : '',
    ].filter(Boolean).join('\n    ');
    html = html.replace('</head>', `    ${head}\n</head>`);
    return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const written = [];
const write = (file, html) => { writeFileSync(resolve(dist, file), html); written.push(file); };

// Herkese açık sayfalar: / → index.html, /launcher → launcher.html ...
for (const path of Object.keys(PUBLIC_PAGES)) {
    const meta = pageMeta(path);
    write(path === '/' ? 'index.html' : `${path.slice(1)}.html`, page({ meta, body: render(path), jsonLd: PUBLIC_PAGES[path].jsonLd }));
}

// Giriş gerektiren sayfaların kabuğu: içerik tarayıcıda çizilir, arama motorları dizine eklemez
write('app.html', page({ meta: { title: 'vulu', index: false } }));

// Olmayan adresler: Caddy bunu 404 koduyla verir
write('404.html', page({ meta: pageMeta('/__yok__'), body: render('/__yok__') }));

// sitemap.xml ve robots.txt
const today = new Date().toISOString().slice(0, 10);
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(PUBLIC_PAGES).map(p => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *
Disallow: /hesap
Disallow: /giris
Disallow: /kayit
Disallow: /u/
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`);
written.push('sitemap.xml', 'robots.txt');
console.log('ön çizim:', written.join(', '));
