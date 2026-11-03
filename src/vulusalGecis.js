// Launcher sayfasından vulusal sayfaya gizli geçiş (easter egg): EVREN İKİYE BÖLÜNÜR, KARA DELİK HER ŞEYİ YUTAR, BIG BANG.
// Tetik: "vulu Launcher" başlığına hızlı hızlı 5 kez tıkla (her tıklamada başlık kızışır ve bir enerji çınlaması duyulur)
// ya da klavyeden "vulu" yaz. Geçiş, sayfa değişse de sürsün diye React'in dışında, doğrudan body'ye eklenir; atlanamaz.
//   ÇATLAK   (0–0,7 sn)  tıklanan noktadan şimşek gibi bir çatlak ekranı yarar; şok dalgaları, glitch, sayfa titrer
//   YARILMA  (0,7 sn)    sayfa o çizgiden ikiye bölünür, iki yarı dönerek derin uzaya savrulur; aradan ışık ve nebula
//   UZAY     (2 sn)      ortada bir kara delik doğar: dönen toplanma diski, olay ufku, bükülmüş ışık halkası;
//                        yıldızlar spiral çizerek içine düşer; sinematik alt yazılar
//   ÇÖKÜŞ    (4,3 sn)    her şey kara deliğe çekilir, ekran kararır, bir an sessizlik
//   PATLAMA  (5,1 sn)    Big Bang: kör eden flaş, şok dalgaları, yıldızlar dışarı fışkırır, VULUSAL tekillikten doğar;
//                        arkada vulusal sayfa açılır
//   ÇIKIŞ    (7–7,7 sn)  harfler saçılır, perde kalkar
// Sesler src/vulusalSes.js'te. "Hareketi azalt" açıksa efekt yoktur, doğrudan geçilir.

import { useCallback, useEffect, useRef } from 'react';
import { sparkBurst } from './effects.jsx';
import { reducedMotion } from './motion.jsx';
import { hafifMi } from './vulusalEngine.js';
import { gecisSesi, tikSesi } from './vulusalSes.js';

export const VULUSAL_YOL = '/vulusalvululauncher';

const RENKLER = ['#ff2df1', '#00d7ff', '#f6dc43', '#39ff14', '#5800ff', '#ffffff'];
const sec = arr => arr[(Math.random() * arr.length) | 0];
const rastgele = (a, b) => a + Math.random() * (b - a);

/** Aşamaların başlangıçları (ms). Ses de bunlara göre kurulur. */
const Z = { YARILMA: 700, UZAY: 2000, COKUS: 4300, PATLAMA: 5100, CIKIS: 7000, SON: 7700 };

/** Sinematik alt yazılar: [ne zaman (ms), ne] */
const ALT_YAZILAR = [
    [1250, 'EVREN İKİYE BÖLÜNDÜ'],
    [2500, 'KARA DELİK OLUŞUYOR'],
    [3450, 'AURA KRİTİK SEVİYEDE'],
    [4400, 'TEKİLLİK'],
];

let suruyor = false;

/** Geçişi oynatır ve Big Bang anında navigate(VULUSAL_YOL) çağırır. x, y: çatlağın başladığı nokta (yoksa ekranın ortası). */
export function vulusalGecis({ navigate, x = innerWidth / 2, y = innerHeight / 2 }) {
    if (suruyor) return;
    if (reducedMotion()) { navigate(VULUSAL_YOL, { state: { gecis: true } }); return; }
    suruyor = true;

    const html = document.documentElement;
    const kok = document.getElementById('root');
    const hafif = hafifMi();
    const W = innerWidth, H = innerHeight;

    // Yarılma çizgisi: (x, y)'den geçen, yataya göre biraz eğik bir doğru. n: çizgiye dik birim vektör.
    const aci = rastgele(-28, 28) * Math.PI / 180;
    const d = [Math.cos(aci), Math.sin(aci)], n = [-Math.sin(aci), Math.cos(aci)];
    const L = Math.hypot(W, H) * 2;

    const el = document.createElement('div');
    el.className = 'vg' + (hafif ? ' hafif' : '');
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--x', x + 'px');
    el.style.setProperty('--y', y + 'px');
    el.style.setProperty('--aci', aci + 'rad');
    el.style.setProperty('--nx', n[0].toFixed(4));
    el.style.setProperty('--ny', n[1].toFixed(4));

    const harfler = [...'VULUSAL'].map((h, i) =>
        `<span style="--i:${i};--tx:${rastgele(-120, 120).toFixed(0)}vw;--ty:${rastgele(-90, 90).toFixed(0)}vh;--rot:${rastgele(-720, 720).toFixed(0)}deg;--c:${RENKLER[i % 5]}">${h}</span>`).join('');
    const seritler = Array.from({ length: hafif ? 7 : 12 }, () =>
        `<i style="top:${rastgele(0, 96).toFixed(1)}%;height:${rastgele(1, 7).toFixed(1)}%;--c:${sec(RENKLER)};--d:${rastgele(80, 260).toFixed(0)}ms;--g:${rastgele(-30, 30).toFixed(0)}vw"></i>`).join('');
    const halkalar = (sinif, sayi) => Array.from({ length: sayi }, (_, i) =>
        `<i class="${sinif}" style="--i:${i};--c:${RENKLER[i % 4]}"></i>`).join('');
    const disk = sinif => `<div class="vg-kd-disk ${sinif}"><i></i></div>`;

    el.innerHTML = `
        <div class="vg-uzay"></div>
        <div class="vg-nebula"><i></i><i></i><i></i></div>
        <canvas class="vg-yildiz"></canvas>
        <div class="vg-kd"><div class="vg-kd-hale"></div>${disk('arka')}<div class="vg-kd-ufuk"></div><div class="vg-kd-lens"></div>${disk('on')}</div>
        <div class="vg-kozmos"><div class="vg-isinlar"></div><div class="vg-izgara"></div></div>
        <div class="vg-yari a"></div><div class="vg-yari b"></div>
        <div class="vg-seritler">${seritler}</div>
        <div class="vg-huzme"></div>
        <svg class="vg-catlak" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${catlakSvg(x, y, d, Math.hypot(W, H))}</svg>
        <div class="vg-halkalar">${halkalar('ilk', 3)}${halkalar('son', 5)}</div>
        <div class="vg-karanlik"></div>
        <div class="vg-yazi"></div>
        <div class="vg-baslik">${harfler}</div>
        <div class="vg-alt">+1.000.000 AURA</div>
        <canvas class="vg-canvas"></canvas>
        <div class="vg-flash"></div>`;
    document.body.appendChild(el);
    html.classList.add('vg-bozul');
    if (hafif) html.classList.add('vg-hafif');

    // Çatlağı tıklanan noktadan iki yana doğru çiz: her çizginin uzunluğu dash'e yazılır
    el.querySelectorAll('.vg-catlak polyline').forEach(p => {
        const u = Math.ceil(p.getTotalLength());
        p.style.strokeDasharray = u;
        p.style.strokeDashoffset = u;
    });

    const zaman = [];
    const sonra = (ms, fn) => zaman.push(setTimeout(fn, ms));
    gecisSesi(Z);
    const evren = kozmos(el.querySelector('.vg-yildiz'), hafif);
    const asama = ad => { el.classList.add(ad); evren.asama(ad); };

    // YARILMA: sayfanın iki kopyası çizginin iki yanından kırpılıp zıt yönlere savrulur; asıl sayfa arkada gizlenir
    sonra(Z.YARILMA, () => {
        const yarim = (kutu, isaret) => {
            const P = (a, b) => `${(x + d[0] * a + n[0] * b).toFixed(1)}px ${(y + d[1] * a + n[1] * b).toFixed(1)}px`;
            kutu.style.clipPath = `polygon(${P(-L, 0)}, ${P(L, 0)}, ${P(L, isaret * L)}, ${P(-L, isaret * L)})`;
            kutu.appendChild(kopya(kok));
        };
        yarim(el.querySelector('.vg-yari.a'), -1);
        yarim(el.querySelector('.vg-yari.b'), 1);
        html.classList.remove('vg-bozul');
        kok.style.visibility = 'hidden';
        asama('yar');
    });
    sonra(Z.UZAY + 500, () => el.querySelectorAll('.vg-yari').forEach(y => y.replaceChildren()));   // uzayın derinliklerinde kayboldular

    // alt yazılar
    const yazi = el.querySelector('.vg-yazi');
    for (const [ms, metin] of ALT_YAZILAR) {
        sonra(ms, () => { yazi.textContent = metin; yazi.classList.remove('goster'); void yazi.offsetWidth; yazi.classList.add('goster'); });
    }

    sonra(Z.UZAY, () => asama('uzay'));
    sonra(Z.COKUS, () => asama('cokus'));

    // PATLAMA: Big Bang
    sonra(Z.PATLAMA, () => {
        asama('patlama');
        konfeti(el.querySelector('.vg-canvas'), 3200, hafif);
        // Yeni sayfanın açılması bir an takılabilir: flaşın ilk (bembeyaz) karesi çizildikten sonra geç ki görünmesin
        requestAnimationFrame(() => requestAnimationFrame(() => {
            navigate(VULUSAL_YOL, { state: { gecis: true } });
            kok.style.visibility = '';
        }));
    });

    sonra(Z.CIKIS, () => el.classList.add('cikis'));
    sonra(Z.SON, bitir);

    function bitir() {
        zaman.forEach(clearTimeout);
        el.remove();
        html.classList.remove('vg-bozul', 'vg-hafif');
        kok.style.visibility = '';
        suruyor = false;
    }
    return bitir;
}

/**
 * Yıldızlar ve kara deliğe düşen madde (canvas). Aşamalar:
 *   başta / yar: yıldızlar ekranın ortasından dışarı doğru süzülür (derin uzayda ilerliyormuş gibi)
 *   uzay: yıldızlar kara deliğin çevresinde dönerek, yaklaştıkça hızlanarak içine düşer; düşenin yerine yenisi gelir
 *   cokus: çekim katlanır, hepsi içeri çekilir, yenisi gelmez
 *   patlama: hepsi merkezden ışık hızında dışarı fışkırır
 * Kara deliğin boyutu CSS'teki .vg-kd ile aynı hesaplanır.
 */
function kozmos(canvas, hafif) {
    const ctx = canvas.getContext('2d');
    const dpr = hafif ? 1 : Math.min(devicePixelRatio || 1, 2);
    const W = innerWidth, H = innerHeight, cx = W / 2, cy = H / 2;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const kd = Math.min(Math.min(W, H) * 0.72, 560);
    const ufuk = kd * 0.13, dis = Math.hypot(W, H) * 0.62;
    const egim = -12 * Math.PI / 180, ce = Math.cos(egim), se = Math.sin(egim);
    let asama = 'yildiz';

    const yeni = (r = rastgele(ufuk * 2, dis)) => ({
        a: Math.random() * Math.PI * 2, r, v: 0,
        duz: Math.random() < 0.6,                       // diskin düzleminde mi (basık yörünge)
        c: sec(RENKLER), b: rastgele(0.8, 2.4), px: null, py: null, olu: false,
    });
    const parcaciklar = Array.from({ length: hafif ? 240 : 560 }, () => yeni());

    const konum = p => {
        const ox = Math.cos(p.a) * p.r, oy = Math.sin(p.a) * p.r * (p.duz ? 0.3 : 1);
        return p.duz ? [cx + ox * ce - oy * se, cy + ox * se + oy * ce] : [cx + ox, cy + oy];
    };

    let son = performance.now();
    (function ciz(t) {
        if (!canvas.isConnected) return;
        requestAnimationFrame(ciz);
        const dt = Math.min(0.05, (t - son) / 1000);
        son = t;
        ctx.clearRect(0, 0, W, H);
        ctx.lineCap = 'round';
        for (const p of parcaciklar) {
            if (p.olu) continue;
            if (asama === 'yildiz') {
                p.r += (20 + p.r * 0.5) * dt;
                if (p.r > dis) Object.assign(p, yeni(rastgele(10, 80)), { px: null });
            } else if (asama === 'uzay' || asama === 'cokus') {
                const cek = asama === 'cokus' ? 7 : 1;
                p.a += dt * 1.6 * Math.pow(kd * 0.5 / Math.max(p.r, ufuk), 1.5) * (asama === 'cokus' ? 2.5 : 1);
                p.r -= dt * cek * (25 + 9000 / Math.max(p.r, ufuk * 0.5));
                if (p.r < ufuk * 0.9) {
                    if (asama === 'uzay') Object.assign(p, yeni(dis * rastgele(0.7, 1)), { px: null });
                    else { p.olu = true; continue; }
                }
            } else if (asama === 'patlama') {
                p.v *= 1 - 1.4 * dt;
                p.r += p.v * dt;
            }
            const [x, y] = konum(p);
            if (p.px !== null) {
                const yakin = asama === 'uzay' || asama === 'cokus' ? Math.min(1, (kd * 0.9) / p.r) : 1;
                ctx.globalAlpha = asama === 'patlama' ? Math.min(1, p.v / 400 + 0.15) : 0.35 + 0.65 * yakin;
                ctx.strokeStyle = p.c;
                ctx.lineWidth = p.b * (asama === 'patlama' ? 1.6 : 1);
                ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(x, y); ctx.stroke();
            }
            p.px = x; p.py = y;
        }
        ctx.globalAlpha = 1;
    })(son);

    return {
        asama(ad) {
            if (ad === 'uzay' || ad === 'cokus') asama = ad;
            if (ad === 'patlama') {
                asama = 'patlama';
                for (const p of parcaciklar) Object.assign(p, { olu: false, r: rastgele(2, ufuk * 0.4), a: Math.random() * Math.PI * 2, v: rastgele(500, 2200), px: null, duz: Math.random() < 0.35 });
            }
        },
    };
}

/**
 * Sayfanın donmuş bir kopyası: animasyonlar ve geçişler durur, tuvallerin o anki görüntüsü kopyalanır, tıklanamaz.
 * Sayfa kaydırılmışsa kopya da aynı yerden görünür; üst çubuk ekranın tepesinde kalır. Ekranın tamamen dışında kalan
 * bölümler kopyalanmaz, yerlerine aynı boyda boş kutular konur: yerleşim aynı kalır, kopyalamak çok daha ucuz olur.
 */
function kopya(kok) {
    const H = innerHeight;
    const disarida = e => { const r = e.getBoundingClientRect(); return r.bottom < -40 || r.top > H + 40; };
    const yerTutucu = e => {
        const cs = getComputedStyle(e);
        const t = document.createElement('div');
        t.style.cssText = `height:${e.offsetHeight}px;margin:${cs.marginTop} 0 ${cs.marginBottom};grid-column:${cs.gridColumn}`;
        return t;
    };
    // Ekrandaki bölümlerin içine iki kat inilir (uzun bölümlerin ekran dışındaki parçaları da atılsın)
    const ayikla = (asil, klon, derinlik) => {
        [...asil.children].forEach((c, i) => {
            const k = klon.children[i];
            if (!k || c.matches('.topbar, .tabbar, canvas')) return;
            if (disarida(c)) k.replaceWith(yerTutucu(c));
            else if (derinlik > 0 && c.offsetHeight > H) ayikla(c, k, derinlik - 1);
        });
    };

    const k = kok.cloneNode(true);
    const sayfa = kok.querySelector('.page-enter'), ksayfa = k.querySelector('.page-enter');
    if (sayfa && ksayfa) ayikla(sayfa, ksayfa, 2);
    const altbant = kok.querySelector('.footer');
    if (altbant && disarida(altbant)) k.querySelector('.footer')?.replaceWith(yerTutucu(altbant));

    k.removeAttribute('id');
    k.className = 'vg-kopya';
    k.inert = true;
    k.style.top = -scrollY + 'px';
    k.style.width = kok.offsetWidth + 'px';
    const asil = kok.querySelectorAll('canvas'), yeni = k.querySelectorAll('canvas');
    asil.forEach((c, i) => {
        const t = yeni[i];
        if (!t || !c.width || !c.height) return;
        t.width = c.width; t.height = c.height;
        try { t.getContext('2d').drawImage(c, 0, 0); } catch { /* boş kalsın */ }
    });
    return k;
}

/** Tıklanan noktadan iki yana zikzaklı bir şimşek çatlağı ve birkaç kısa dal (SVG). Üç kat çizgi: geniş pembe, cyan, beyaz çekirdek. */
function catlakSvg(x, y, d, uzunluk) {
    const kol = yon => {
        const nokta = [[x, y]];
        let a = 0;
        while (a < uzunluk) {
            a += rastgele(28, 70);
            const sap = rastgele(-14, 14);
            nokta.push([x + d[0] * a * yon - d[1] * sap, y + d[1] * a * yon + d[0] * sap]);
        }
        return nokta;
    };
    const dal = (bas, yon) => {
        const nokta = [bas];
        let [px, py] = bas;
        const a = Math.atan2(d[1] * yon, d[0] * yon) + rastgele(-1.1, 1.1);
        for (let i = 0; i < 4; i++) {
            const adim = rastgele(18, 45), sap = rastgele(-.5, .5);
            px += Math.cos(a + sap) * adim; py += Math.sin(a + sap) * adim;
            nokta.push([px, py]);
        }
        return nokta;
    };
    const kollar = [kol(1), kol(-1)];
    const dallar = [];
    for (const [i, k] of kollar.entries()) {
        for (let j = 0; j < 3; j++) dallar.push(dal(k[1 + ((Math.random() * Math.min(8, k.length - 2)) | 0)], i ? -1 : 1));
    }
    const yaz = p => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
    const cizgi = (p, sinif, gecikme) => `<polyline class="${sinif}" style="--g:${gecikme}ms" points="${yaz(p)}"/>`;
    return ['k1', 'k2', 'k3'].map(s =>
        kollar.map(k => cizgi(k, s, 0)).join('') + dallar.map((p, i) => cizgi(p, s + ' dal', 180 + i * 50)).join('')).join('');
}

/** Kendi kendine sönen konfeti patlaması. */
function konfeti(canvas, sure, hafif) {
    const ctx = canvas.getContext('2d');
    const dpr = hafif ? 1 : Math.min(devicePixelRatio || 1, 2);
    const az = hafif ? 0.55 : 1;
    const W = innerWidth, H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const p = [];
    const at = (x, y, n, guc) => {
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, v = rastgele(4, 18) * guc;
            p.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: rastgele(0, 6), vr: rastgele(-.4, .4), b: rastgele(5, 11), c: sec(RENKLER), o: 1, d: rastgele(.006, .014) });
        }
    };
    at(W / 2, H / 2, Math.round(280 * az), 1.4);
    setTimeout(() => { at(W * .15, H * .35, Math.round(100 * az), 1.1); at(W * .85, H * .35, Math.round(100 * az), 1.1); }, 160);
    setTimeout(() => { at(W * .5, H * .9, Math.round(120 * az), 1.3); }, 320);
    const bitis = performance.now() + sure;
    (function ciz(t) {
        ctx.clearRect(0, 0, W, H);
        for (const q of p) {
            q.vx *= .985; q.vy = q.vy * .985 + .28; q.x += q.vx; q.y += q.vy; q.r += q.vr; q.o -= q.d;
            if (q.o <= 0) continue;
            ctx.globalAlpha = q.o; ctx.fillStyle = q.c;
            ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillRect(-q.b / 2, -q.b / 4, q.b, q.b / 2); ctx.restore();
        }
        if (t < bitis && canvas.isConnected) requestAnimationFrame(ciz);
    })(performance.now());
}

const TIK_ESIK = 5;          // kaç tıklamada geçilir
const TIK_ARALIK = 900;      // tıklamalar arası en çok bu kadar ms

/**
 * Launcher sayfası için gizli kapı. Klavyeden "vulu" yazmayı dinler; döndürdüğü fonksiyon başlığın onClick'ine verilir.
 * Her hızlı tıklamada başlıktan kıvılcım çıkar, bir enerji çınlaması duyulur ve başlık (data-vulu ile) biraz daha
 * vululaşır; 5.'de geçiş başlar.
 */
export function useVulusalKapi(navigate) {
    const tik = useRef({ n: 0, t: 0, sifirla: 0 });

    useEffect(() => {
        let yazilan = '';
        const tus = e => {
            if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
            if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
            yazilan = (yazilan + e.key.toLocaleLowerCase('tr')).slice(-4);
            if (yazilan === 'vulu') { yazilan = ''; vulusalGecis({ navigate }); }
        };
        window.addEventListener('keydown', tus);
        return () => { window.removeEventListener('keydown', tus); clearTimeout(tik.current.sifirla); };
    }, [navigate]);

    return useCallback(e => {
        const s = tik.current;
        const el = e.currentTarget;
        const simdi = performance.now();
        s.n = simdi - s.t < TIK_ARALIK ? s.n + 1 : 1;
        s.t = simdi;
        clearTimeout(s.sifirla);
        if (s.n >= TIK_ESIK) {
            s.n = 0;
            vulusalGecis({ navigate, x: e.clientX, y: e.clientY });
            setTimeout(() => delete el.dataset.vulu, Z.YARILMA + 50);   // yarılan kopyada başlık hâlâ kızgın görünsün
            return;
        }
        el.dataset.vulu = s.n;
        tikSesi(s.n);
        sparkBurst(el.querySelector('.hero-title-box') || el, 6 + s.n * 8);
        s.sifirla = setTimeout(() => { s.n = 0; delete el.dataset.vulu; }, TIK_ARALIK + 300);
    }, [navigate]);
}
