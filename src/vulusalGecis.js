// Launcher sayfasından vulusal sayfaya gizli geçiş (easter egg).
// Tetik: "vulu Launcher" başlığına hızlı hızlı 5 kez tıkla (her tıklamada başlık biraz daha vululaşır) ya da klavyeden "vulu" yaz.
// Geçiş, sayfa değişse de sürsün diye React'in dışında, doğrudan body'ye eklenir:
//   1. bozulma (0–0,85 sn): site titrer, renkleri kayar, ekranı glitch şeritleri keser, "SİSTEM VULULANIYOR" sayar; ses yükselir
//   2. portal (0,85–1,4 sn): tıklanan noktadan dönen gökkuşağı bir delik açılıp ekranı yutar; V-U-L-U-S-A-L harfleri çarpar
//   3. drop (1,4 sn): beyaz flaş, konfeti, bas; arkada vulusal sayfa açılır
//   4. çıkış (2,3–3 sn): harfler dört yana saçılır, perde açılır
// "Hareketi azalt" açıksa efekt yoktur, doğrudan geçilir.

import { useCallback, useEffect, useRef } from 'react';
import { sparkBurst } from './effects.jsx';
import { reducedMotion } from './motion.jsx';

export const VULUSAL_YOL = '/vulusalvululauncher';

const RENKLER = ['#ff2df1', '#00d7ff', '#f6dc43', '#39ff14', '#5800ff', '#ffffff'];
const sec = arr => arr[(Math.random() * arr.length) | 0];
const rastgele = (a, b) => a + Math.random() * (b - a);

let suruyor = false;

/** Geçişi oynatır ve ortasında navigate(VULUSAL_YOL) çağırır. x, y: portalın açılacağı nokta (yoksa ekranın ortası). */
export function vulusalGecis({ navigate, x = innerWidth / 2, y = innerHeight / 2 }) {
    if (suruyor) return;
    if (reducedMotion()) { navigate(VULUSAL_YOL, { state: { gecis: true } }); return; }
    suruyor = true;

    const html = document.documentElement;
    const el = document.createElement('div');
    el.className = 'vg';
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--x', x + 'px');
    el.style.setProperty('--y', y + 'px');
    const harfler = [...'VULUSAL'].map((h, i) =>
        `<span style="--i:${i};--tx:${rastgele(-120, 120).toFixed(0)}vw;--ty:${rastgele(-90, 90).toFixed(0)}vh;--rot:${rastgele(-720, 720).toFixed(0)}deg;--c:${RENKLER[i % 5]}">${h}</span>`).join('');
    const seritler = Array.from({ length: 12 }, () =>
        `<i style="top:${rastgele(0, 96).toFixed(1)}%;height:${rastgele(1, 9).toFixed(1)}%;--c:${sec(RENKLER)};--d:${rastgele(80, 260).toFixed(0)}ms;--g:${rastgele(-30, 30).toFixed(0)}vw"></i>`).join('');
    el.innerHTML = `
        <div class="vg-seritler">${seritler}</div>
        <div class="vg-terminal"><b>SİSTEM VULULANIYOR</b><span class="vg-yuzde">0%</span><div class="vg-bar"><div></div></div></div>
        <div class="vg-portal"><div class="vg-isinlar"></div><div class="vg-izgara"></div></div>
        <canvas class="vg-canvas"></canvas>
        <div class="vg-baslik">${harfler}</div>
        <div class="vg-alt">+1.000.000 AURA</div>
        <div class="vg-flash"></div>`;
    document.body.appendChild(el);
    html.classList.add('vg-bozul');

    const zaman = [];
    const sonra = (ms, fn) => zaman.push(setTimeout(fn, ms));
    const ses = gecisSesi();

    // 1. bozulma: yüzde sayacı
    const yuzde = el.querySelector('.vg-yuzde');
    const bar = el.querySelector('.vg-bar > div');
    const t0 = performance.now();
    (function say() {
        const p = Math.min(1, (performance.now() - t0) / 820);
        const v = p < 0.7 ? Math.floor(p * 100) : p < 0.9 ? 69 : 100;   // 69'da bir an takılır
        yuzde.textContent = v + '%';
        bar.style.width = v + '%';
        if (p < 1) requestAnimationFrame(say);
    })();

    // 2. portal ve harfler
    sonra(850, () => el.classList.add('portal'));
    sonra(1180, () => el.classList.add('slam'));

    // 3. drop
    sonra(1400, () => {
        el.classList.add('drop');
        html.classList.remove('vg-bozul');
        konfeti(el.querySelector('.vg-canvas'), 3000);
        navigate(VULUSAL_YOL, { state: { gecis: true } });
    });

    // 4. çıkış
    sonra(2300, () => el.classList.add('cikis'));
    sonra(3000, () => {
        el.remove();
        ses?.close().catch(() => {});
        suruyor = false;
    });

    return () => { zaman.forEach(clearTimeout); el.remove(); html.classList.remove('vg-bozul'); suruyor = false; };
}

/** Kendi kendine sönen konfeti patlaması. */
function konfeti(canvas, sure) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
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
    at(W / 2, H / 2, 260, 1.3);
    setTimeout(() => { at(W * .15, H * .35, 90, 1); at(W * .85, H * .35, 90, 1); }, 180);
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

/** Yükselen riser + 1,4. saniyede drop (bas, kick, crash, akor). Ses açılamazsa sessiz geçer. */
function gecisSesi() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    let ac;
    try { ac = new AC(); } catch { return null; }
    const now = ac.currentTime + 0.02, drop = now + 1.4;
    const out = ac.createDynamicsCompressor();
    const master = ac.createGain();
    master.gain.value = 0.45;
    master.connect(out); out.connect(ac.destination);

    const gurultu = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = gurultu.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // riser: yükselen testere + açılan filtre
    const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(110, now);
    o.frequency.exponentialRampToValueAtTime(1760, drop);
    f.type = 'lowpass'; f.Q.value = 8;
    f.frequency.setValueAtTime(300, now);
    f.frequency.exponentialRampToValueAtTime(9000, drop);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.25, drop - 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, drop);
    o.connect(f); f.connect(g); g.connect(master);
    o.start(now); o.stop(drop + 0.05);

    // riser: kabaran gürültü
    const n = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain();
    n.buffer = gurultu; nf.type = 'highpass';
    nf.frequency.setValueAtTime(400, now);
    nf.frequency.exponentialRampToValueAtTime(6000, drop);
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.exponentialRampToValueAtTime(0.3, drop - 0.02);
    ng.gain.exponentialRampToValueAtTime(0.0001, drop);
    n.connect(nf); nf.connect(ng); ng.connect(master);
    n.start(now); n.stop(drop + 0.05);

    // drop: kick + 808
    const k = ac.createOscillator(), kg = ac.createGain();
    k.frequency.setValueAtTime(180, drop);
    k.frequency.exponentialRampToValueAtTime(38, drop + 0.25);
    kg.gain.setValueAtTime(1, drop);
    kg.gain.exponentialRampToValueAtTime(0.001, drop + 1.6);
    k.connect(kg); kg.connect(master);
    k.start(drop); k.stop(drop + 1.7);

    // drop: crash
    const c = ac.createBufferSource(), cf = ac.createBiquadFilter(), cg = ac.createGain();
    c.buffer = gurultu; cf.type = 'highpass'; cf.frequency.value = 3000;
    cg.gain.setValueAtTime(0.5, drop);
    cg.gain.exponentialRampToValueAtTime(0.001, drop + 1.5);
    c.connect(cf); cf.connect(cg); cg.connect(master);
    c.start(drop); c.stop(drop + 1.6);

    // drop: do minör akor
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
            delete el.dataset.vulu;
            vulusalGecis({ navigate, x: e.clientX, y: e.clientY });
            return;
        }
        el.dataset.vulu = s.n;
        sparkBurst(el.querySelector('.hero-title-box') || el, 6 + s.n * 8);
        s.sifirla = setTimeout(() => { s.n = 0; delete el.dataset.vulu; }, TIK_ARALIK + 300);
    }, [navigate]);
}
