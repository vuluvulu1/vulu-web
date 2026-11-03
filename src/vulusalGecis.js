// Launcher sayfasından vulusal sayfaya gizli geçiş (easter egg): EVREN İKİYE BÖLÜNÜR.
// Tetik: "vulu Launcher" başlığına hızlı hızlı 5 kez tıkla (her tıklamada başlık biraz daha vululaşır) ya da klavyeden "vulu" yaz.
// Geçiş, sayfa değişse de sürsün diye React'in dışında, doğrudan body'ye eklenir:
//   1. çatlak (0–0,65 sn): tıklanan noktadan iki yana şimşek gibi parlayan bir çatlak ekranı yarar; şok dalgaları,
//      glitch şeritleri, sayfa titrer; ses yükselir, cızırdar
//   2. yarılma (0,65 sn): sayfa o çizgiden ikiye bölünür, iki yarı birbirinden uzağa savrulur; aradaki yarıktan kör edici
//      bir ışık hüzmesi ve dönen gökkuşağı kozmos fışkırır; yırtılma sesi ve gümleme
//   3. VULUSAL (1,35 sn): harfler ışığın içinden çarpar
//   4. drop (1,65 sn): beyaz flaş, şok dalgaları, konfeti, bas; arkada vulusal sayfa açılır
//   5. çıkış (2,55–3,25 sn): harfler dört yana saçılır, perde kalkar
// "Hareketi azalt" açıksa efekt yoktur, doğrudan geçilir.

import { useCallback, useEffect, useRef } from 'react';
import { sparkBurst } from './effects.jsx';
import { reducedMotion } from './motion.jsx';
import { hafifMi } from './vulusalEngine.js';

export const VULUSAL_YOL = '/vulusalvululauncher';

const RENKLER = ['#ff2df1', '#00d7ff', '#f6dc43', '#39ff14', '#5800ff', '#ffffff'];
const sec = arr => arr[(Math.random() * arr.length) | 0];
const rastgele = (a, b) => a + Math.random() * (b - a);

const YARILMA = 650, SLAM = 1350, DROP = 1650, CIKIS = 2550, SON = 3250;

let suruyor = false;

/** Geçişi oynatır ve drop anında navigate(VULUSAL_YOL) çağırır. x, y: çatlağın başladığı nokta (yoksa ekranın ortası). */
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

    el.innerHTML = `
        <div class="vg-portal"><div class="vg-isinlar"></div><div class="vg-izgara"></div><div class="vg-cekirdek"></div></div>
        <div class="vg-yari a"></div><div class="vg-yari b"></div>
        <div class="vg-seritler">${seritler}</div>
        <div class="vg-huzme"></div>
        <svg class="vg-catlak" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${catlakSvg(x, y, d, Math.hypot(W, H))}</svg>
        <div class="vg-halkalar">${halkalar('ilk', 3)}${halkalar('drop', 4)}</div>
        <canvas class="vg-canvas"></canvas>
        <div class="vg-baslik">${harfler}</div>
        <div class="vg-alt">+1.000.000 AURA</div>
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
    const ses = gecisSesi();

    // 2. yarılma: sayfanın iki kopyası çizginin iki yanından kırpılıp zıt yönlere savrulur; asıl sayfa arkada gizlenir
    sonra(YARILMA, () => {
        const yarim = (kutu, isaret) => {
            const P = (a, b) => `${(x + d[0] * a + n[0] * b).toFixed(1)}px ${(y + d[1] * a + n[1] * b).toFixed(1)}px`;
            kutu.style.clipPath = `polygon(${P(-L, 0)}, ${P(L, 0)}, ${P(L, isaret * L)}, ${P(-L, isaret * L)})`;
            kutu.appendChild(kopya(kok));
        };
        yarim(el.querySelector('.vg-yari.a'), -1);
        yarim(el.querySelector('.vg-yari.b'), 1);
        html.classList.remove('vg-bozul');
        kok.style.visibility = 'hidden';
        el.classList.add('yar');
    });

    // 3. harfler
    sonra(SLAM, () => el.classList.add('slam'));

    // 4. drop
    sonra(DROP, () => {
        el.classList.add('drop');
        konfeti(el.querySelector('.vg-canvas'), 3000, hafif);
        // Yeni sayfanın açılması bir an takılabilir: flaşın ilk (bembeyaz) karesi çizildikten sonra geç ki görünmesin
        requestAnimationFrame(() => requestAnimationFrame(() => {
            navigate(VULUSAL_YOL, { state: { gecis: true } });
            kok.style.visibility = '';
            el.querySelectorAll('.vg-yari').forEach(y => y.replaceChildren());   // ekrandan çıktılar, kopyaları at
        }));
    });

    // 5. çıkış
    sonra(CIKIS, () => el.classList.add('cikis'));
    sonra(SON, bitir);

    function bitir() {
        zaman.forEach(clearTimeout);
        el.remove();
        html.classList.remove('vg-bozul', 'vg-hafif');
        kok.style.visibility = '';
        ses?.close().catch(() => {});
        suruyor = false;
    }
    return bitir;
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

/**
 * Ses: yükselen riser, çatlarken elektrik cızırtıları, yarılmada yırtılma + gümleme, drop'ta kick, 808, crash ve akor.
 * Ses açılamazsa sessiz geçer.
 */
function gecisSesi() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    let ac;
    try { ac = new AC(); } catch { return null; }
    const now = ac.currentTime + 0.02;
    const yar = now + YARILMA / 1000, drop = now + DROP / 1000;
    const out = ac.createDynamicsCompressor();
    const master = ac.createGain();
    master.gain.value = 0.5;
    master.connect(out); out.connect(ac.destination);

    const gurultu = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);   // 1 sn, kaynaklar döngüde çalar
    const gd = gurultu.getChannelData(0);
    for (let i = 0; i < gd.length; i++) gd[i] = Math.random() * 2 - 1;
    const noise = (bas, sure, tip, f0, f1, g0, q = 1) => {
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = gurultu; s.loop = true; f.type = tip; f.Q.value = q;
        f.frequency.setValueAtTime(f0, bas); f.frequency.exponentialRampToValueAtTime(f1, bas + sure);
        g.gain.setValueAtTime(g0, bas); g.gain.exponentialRampToValueAtTime(0.0001, bas + sure);
        s.connect(f); f.connect(g); g.connect(master);
        s.start(bas); s.stop(bas + sure + 0.05);
    };
    const osc = (bas, sure, tip, f0, f1, g0) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = tip;
        o.frequency.setValueAtTime(f0, bas); o.frequency.exponentialRampToValueAtTime(f1, bas + sure);
        g.gain.setValueAtTime(g0, bas); g.gain.exponentialRampToValueAtTime(0.0001, bas + sure);
        o.connect(g); g.connect(master);
        o.start(bas); o.stop(bas + sure + 0.05);
    };

    // riser: yükselen testere + açılan filtre, drop'a kadar
    const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(110, now); o.frequency.exponentialRampToValueAtTime(1760, drop);
    f.type = 'lowpass'; f.Q.value = 8;
    f.frequency.setValueAtTime(300, now); f.frequency.exponentialRampToValueAtTime(9000, drop);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.22, drop - 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, drop);
    o.connect(f); f.connect(g); g.connect(master);
    o.start(now); o.stop(drop + 0.05);

    // çatlarken elektrik cızırtıları
    for (let i = 0; i < 9; i++) noise(now + rastgele(0, 0.6), rastgele(0.03, 0.08), 'bandpass', rastgele(2500, 7000), rastgele(1500, 4000), 0.5, 4);
    osc(now, 0.6, 'square', 60, 55, 0.08);   // uğultu

    // yarılma: yırtılma (aşağı süpürülen gürültü) + gümleme
    noise(yar, 0.55, 'bandpass', 6000, 180, 0.9, 2);
    osc(yar, 0.9, 'sine', 120, 30, 0.9);

    // drop: kick + 808, crash, akor
    osc(drop, 1.6, 'sine', 180, 38, 1);
    noise(drop, 1.5, 'highpass', 3000, 3000, 0.5);
    for (const hz of [261.6, 311.1, 392, 523.3]) {
        const a = ac.createOscillator(), a2 = ac.createOscillator(), af = ac.createBiquadFilter(), ag = ac.createGain();
        a.type = 'sawtooth'; a2.type = 'square';
        a.frequency.value = hz; a2.frequency.value = hz * 1.006;
        af.type = 'lowpass'; af.frequency.setValueAtTime(5000, drop); af.frequency.exponentialRampToValueAtTime(600, drop + 1.2);
        ag.gain.setValueAtTime(0.07, drop);
        ag.gain.exponentialRampToValueAtTime(0.0001, drop + 1.3);
        a.connect(af); a2.connect(af); af.connect(ag); ag.connect(master);
        a.start(drop); a2.start(drop); a.stop(drop + 1.35); a2.stop(drop + 1.35);
    }
    return ac;
}

const TIK_ESIK = 5;          // kaç tıklamada geçilir
const TIK_ARALIK = 900;      // tıklamalar arası en çok bu kadar ms

/**
 * Launcher sayfası için gizli kapı. Klavyeden "vulu" yazmayı dinler; döndürdüğü fonksiyon başlığın onClick'ine verilir.
 * Her hızlı tıklamada başlıktan kıvılcım çıkar ve başlık (data-vulu ile) biraz daha vululaşır; 5.'de geçiş başlar.
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
            setTimeout(() => delete el.dataset.vulu, YARILMA + 50);   // yarılan kopyada başlık hâlâ kızgın görünsün
            return;
        }
        el.dataset.vulu = s.n;
        sparkBurst(el.querySelector('.hero-title-box') || el, 6 + s.n * 8);
        s.sifirla = setTimeout(() => { s.n = 0; delete el.dataset.vulu; }, TIK_ARALIK + 300);
    }, [navigate]);
}
