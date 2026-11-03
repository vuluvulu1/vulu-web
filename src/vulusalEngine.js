// Vulusal Launcher sayfasının efekt motoru: yıldız warp'ı ve konfeti (canvas), uçuşan "vulu" yazıları, imleç izi,
// tıklama patlamaları ve combo, aura metresi, ULTRA mod (aura dolunca ya da Konami koduyla) ve WebAudio ile
// sıfırdan çalınan 140 BPM trap beat'i. Hepsi sayfanın kök öğesine bağlıdır; sayfadan çıkınca durdur() her şeyi
// (döngü, zamanlayıcılar, dinleyiciler, ses) temizler. "Hareketi azalt" açıksa sürekli hareket edenler çalışmaz.

const RENKLER = ['#ff2df1', '#00d7ff', '#f6dc43', '#39ff14', '#5800ff', '#ffffff', '#ff3131'];
const KELIMELER = ['vulu', 'VULU', 'vulusal', 'aura', '+1000 aura', '2026', 'brom', 'VULUSAL', 'farming', 'launcher', 'GG'];
const TIK_YAZILARI = ['+VULU', '+AURA', '300', 'VULUSAL!', '+1000', 'brom', 'GG', 'x2 AURA'];
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const rastgele = (a, b) => a + Math.random() * (b - a);

/**
 * Telefonlar ve zayıf cihazlar için hafif mod: canvas 1x çözünürlükte ve saniyede ~30 karede çizilir, daha az yıldız,
 * parçacık ve uçuşan yazı olur; CSS'te (.vs-hafif) bulanıklık, renk döndürme ve karışım efektleri kapanır.
 */
export const hafifMi = () => typeof window !== 'undefined' && (
    window.matchMedia?.('(max-width: 760px), (pointer: coarse)').matches
    || (navigator.hardwareConcurrency || 8) <= 4
    || (navigator.deviceMemory || 8) <= 4);
const sec = arr => arr[(Math.random() * arr.length) | 0];

/**
 * @param {HTMLElement} root  .vulusal öğesi
 * @param {{ sakin: boolean, hafif: boolean }} ayar  sakin: "hareketi azalt" açık; hafif: telefon ya da zayıf cihaz
 * @returns {{ patlat, flash, sars, auraEkle, caldir, durdur }}
 */
export function vulusalBaslat(root, { sakin = false, hafif = false } = {}) {
    const PARCACIK_SINIR = hafif ? 250 : 900;
    const $ = sel => root.querySelector(sel);
    const temizlik = [];
    const dinle = (hedef, olay, fn, opt) => { hedef.addEventListener(olay, fn, opt); temizlik.push(() => hedef.removeEventListener(olay, fn, opt)); };
    const zamanlayicilar = new Set();
    const sonra = (fn, ms) => { const id = setTimeout(() => { zamanlayicilar.delete(id); fn(); }, ms); zamanlayicilar.add(id); return id; };

    const durum = { beat: 0, aura: 0, ultra: false, partikuller: [] };

    /* ── Canvas ── */
    const canvas = $('.vs-canvas');
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    function boyutla() {
        const dpr = hafif ? 1 : Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#09000d'; ctx.fillRect(0, 0, W, H);
    }
    boyutla();
    dinle(window, 'resize', boyutla);

    const yeniYildiz = ilk => ({ x: rastgele(-1, 1), y: rastgele(-1, 1), z: ilk ? rastgele(0.05, 1) : 1, pz: 1, c: sec(RENKLER) });
    const yildizlar = Array.from({ length: hafif ? 70 : 260 }, () => yeniYildiz(true));

    const patlat = (x, y, n = 60, guc = 1) => {
        if (sakin) n = Math.min(n, 12);
        else if (hafif) n = Math.ceil(n * 0.4);
        for (let i = 0; i < n; i++) {
            const aci = Math.random() * Math.PI * 2;
            const hiz = rastgele(2, 11) * guc;
            durum.partikuller.push({
                x, y, vx: Math.cos(aci) * hiz, vy: Math.sin(aci) * hiz - rastgele(0, 3),
                omur: 1, azalma: rastgele(0.008, 0.02), boyut: rastgele(3, 8), renk: sec(RENKLER),
                donus: rastgele(0, Math.PI), donusHizi: rastgele(-0.3, 0.3),
                konfeti: Math.random() < 0.55,
            });
        }
        if (durum.partikuller.length > PARCACIK_SINIR) durum.partikuller.splice(0, durum.partikuller.length - PARCACIK_SINIR);
    };

    /* ── Ekran efektleri ── */
    const flashEl = $('.vs-flash');
    const icerik = $('.vs-icerik');
    const yeniden = (el, sinif) => { el.classList.remove(sinif); void el.offsetWidth; el.classList.add(sinif); };
    const flash = () => yeniden(flashEl, 'go');
    const sars = () => { if (!sakin) yeniden(icerik, 'shake'); };
    dinle(icerik, 'animationend', e => { if (e.animationName === 'vs-shake') icerik.classList.remove('shake'); });

    const auraFill = $('.vs-aura-fill');
    const auraEkle = miktar => {
        durum.aura = Math.min(100, durum.aura + miktar);
        if (durum.aura >= 100 && !durum.ultra) ultraMod();
    };

    /* ── Ses: WebAudio trap beat ── */
    let audioCtx = null, analyser = null, freqData = null;
    let caliyor = false, bitis = 0, enerjiOrt = 0, sonVurus = 0;
    let ilkTik = false, bekleyen = false;
    const ipucu = $('.vs-aura-hint');
    const auraYazi = $('.vs-aura');

    const etkilesimVar = () => (navigator.userActivation ? navigator.userActivation.hasBeenActive : ilkTik);
    dinle(window, 'pointerdown', () => { ilkTik = true; if (bekleyen) { bekleyen = false; caldir(); } }, { capture: true });

    function caldir() {
        if (caliyor) return;
        // Tarayıcılar bir tıklama olmadan ses çaldırmıyor (üstüne gelmek sayılmıyor)
        if (!etkilesimVar()) {
            bekleyen = true;
            if (ipucu) ipucu.textContent = 'önce bir yere tıkla brom, tarayıcı izin vermiyo';
            return;
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!audioCtx) {
            audioCtx = new AC();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.6;
            freqData = new Uint8Array(analyser.frequencyBinCount);
            analyser.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        beatCal();
    }

    function beatCal() {
        const ac = audioCtx;
        const master = ac.createGain();
        master.gain.value = 0.5;
        const comp = ac.createDynamicsCompressor();
        master.connect(comp); comp.connect(analyser);

        const BPM = 140, adim = 60 / BPM / 4;     // 16'lık
        const BAR = 16, BAR_SAYISI = 16;
        const t0 = ac.currentTime + 0.08;

        const gurultu = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
        const gd = gurultu.getChannelData(0);
        for (let i = 0; i < gd.length; i++) gd[i] = Math.random() * 2 - 1;
        const egri = new Float32Array(256);
        for (let i = 0; i < 256; i++) egri[i] = Math.tanh((i / 128 - 1) * 3);

        const kick = (t, nota) => {
            const o = ac.createOscillator(), g = ac.createGain(), dist = ac.createWaveShaper();
            o.frequency.setValueAtTime(nota * 4, t);
            o.frequency.exponentialRampToValueAtTime(nota, t + 0.08);
            g.gain.setValueAtTime(1, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
            dist.curve = egri;
            o.connect(dist); dist.connect(g); g.connect(master);
            o.start(t); o.stop(t + 1);
        };
        const snare = t => {
            const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
            n.buffer = gurultu; f.type = 'highpass'; f.frequency.value = 1500;
            g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            n.connect(f); f.connect(g); g.connect(master);
            n.start(t); n.stop(t + 0.25);
            const o = ac.createOscillator(), og = ac.createGain();
            o.frequency.value = 190; og.gain.setValueAtTime(0.4, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.12);
        };
        const hat = (t, ses) => {
            const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
            n.buffer = gurultu; f.type = 'highpass'; f.frequency.value = 8000;
            g.gain.setValueAtTime(ses, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
            n.connect(f); f.connect(g); g.connect(master);
            n.start(t); n.stop(t + 0.05);
        };
        const lead = (t, frek, sure) => {
            const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
            f.type = 'lowpass'; f.frequency.value = 2400; f.Q.value = 6;
            o.type = 'sawtooth'; o2.type = 'square';
            o.frequency.value = frek; o2.frequency.value = frek * 1.005;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.09, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
            o.connect(f); o2.connect(f); f.connect(g); g.connect(master);
            o.start(t); o2.start(t); o.stop(t + sure + 0.02); o2.stop(t + sure + 0.02);
        };

        // Do minör karanlık melodi (Hz)
        const MELODI = [261.6, 0, 311.1, 0, 392, 0, 311.1, 0, 415.3, 0, 392, 0, 311.1, 0, 293.7, 0];
        const KICK = [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0];
        const BAS = [43.65, 43.65, 51.91, 38.89];   // her bar farklı 808 notası

        for (let b = 0; b < BAR_SAYISI; b++) {
            const drop = b >= 4;                       // ilk 4 bar intro, sonra DROP
            for (let s = 0; s < BAR; s++) {
                const t = t0 + (b * BAR + s) * adim;
                if (drop && KICK[s]) kick(t, BAS[b % 4]);
                if (drop && (s === 4 || s === 12)) snare(t);
                if (drop || b >= 2) {
                    hat(t, s % 2 ? 0.08 : 0.16);
                    if (s === 14 && b % 2) { hat(t + adim / 3, 0.1); hat(t + adim * 2 / 3, 0.1); }
                    if (s === 15 && b % 4 === 3) for (let r = 1; r < 4; r++) hat(t + (adim / 4) * r, 0.12);
                }
                if (MELODI[s]) lead(t, MELODI[s] * (b % 8 >= 6 ? 2 : 1), adim * 1.8);
            }
        }
        bitis = t0 + BAR * BAR_SAYISI * adim + 1;
        caliyor = true;
        root.classList.add('audio-active');
        flash(); sars();
        sonra(() => { if (caliyor) { flash(); sars(); patlat(W / 2, H * 0.85, 250, 1.6); } }, (t0 - ac.currentTime + 4 * BAR * adim) * 1000);
    }

    function sesGuncelle(t) {
        if (caliyor && audioCtx.currentTime > bitis) { caliyor = false; root.classList.remove('audio-active'); }
        if (!caliyor) { durum.beat *= 0.9; return; }
        analyser.getByteFrequencyData(freqData);
        let enerji = 0;
        for (let i = 0; i < 6; i++) enerji += freqData[i];   // düşük frekanslar: 808 ve kick
        enerji /= 6 * 255;
        durum.beat = Math.max(enerji, durum.beat * 0.86);

        enerjiOrt = enerjiOrt * 0.95 + enerji * 0.05;
        if (enerji > 0.55 && enerji > enerjiOrt * 1.35 && t - sonVurus > 280) {
            sonVurus = t;
            sars();
            const r = auraYazi.getBoundingClientRect();
            if (r.bottom > 0 && r.top < H) patlat(rastgele(r.left, r.right), r.top + r.height / 2, 35, 1.1);
            else patlat(rastgele(0, W), H * 0.9, 35, 1.1);
            auraEkle(1.5);
        }
    }

    /* ── Çizim döngüsü ── */
    const beatElemanlari = ['.vs-sun', '.vs-sahne', '.vs-aura'].map($).filter(Boolean);
    let sonZaman = performance.now(), sonBeat = '', raf = 0;
    function ciz(t) {
        raf = requestAnimationFrame(ciz);
        if (document.hidden) { sonZaman = t; return; }
        if (hafif && t - sonZaman < 30) return;          // hafif modda ~30 kare/sn
        const dt = Math.min((t - sonZaman) / 16.67, 3);
        sonZaman = t;

        ctx.fillStyle = `rgba(9, 0, 13, ${durum.ultra ? 0.12 : 0.28})`;   // iz bırakan arka plan
        ctx.fillRect(0, 0, W, H);

        const cx = W / 2, cy = H * 0.42;
        const hiz = sakin ? 0 : (0.006 + durum.beat * 0.05 + (durum.ultra ? 0.03 : 0)) * dt;
        ctx.lineCap = 'round';
        for (const s of yildizlar) {
            s.pz = s.z;
            s.z -= hiz;
            if (s.z <= 0.02) { Object.assign(s, yeniYildiz(false)); continue; }
            const sx = cx + (s.x / s.z) * W * 0.5, sy = cy + (s.y / s.z) * H * 0.5;
            const px = cx + (s.x / s.pz) * W * 0.5, py = cy + (s.y / s.pz) * H * 0.5;
            if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) { Object.assign(s, yeniYildiz(false)); continue; }
            ctx.strokeStyle = s.c;
            ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4);
            ctx.lineWidth = Math.max(1, (1 - s.z) * 3.2);
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx + (sakin ? 0.5 : 0), sy); ctx.stroke();
        }
        ctx.globalAlpha = 1;

        if (!hafif) ctx.globalCompositeOperation = 'lighter';
        for (let i = durum.partikuller.length - 1; i >= 0; i--) {
            const p = durum.partikuller[i];
            p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.18 * dt;
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.donus += p.donusHizi * dt;
            p.omur -= p.azalma * dt;
            if (p.omur <= 0 || p.y > H + 40) { durum.partikuller.splice(i, 1); continue; }
            ctx.globalAlpha = p.omur;
            ctx.fillStyle = p.renk;
            if (p.konfeti) {
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.donus);
                ctx.fillRect(-p.boyut / 2, -p.boyut / 4, p.boyut, p.boyut / 2);
                ctx.restore();
            } else if (hafif) {
                ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
            } else {
                const r = p.boyut * 0.4 * p.omur + 0.5;
                ctx.globalAlpha = p.omur * 0.35;
                ctx.beginPath(); ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = p.omur;
                ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        if (audioCtx) sesGuncelle(t);
        const b = durum.beat.toFixed(2);
        if (b !== sonBeat) { sonBeat = b; for (const el of beatElemanlari) el.style.setProperty('--beat', b); }
        if (caliyor) auraYazi.style.setProperty('--hue', ((t / 10) % 360).toFixed(0) + 'deg');

        durum.aura = Math.max(0, durum.aura - 0.04 * dt);
        auraFill.style.height = durum.aura + '%';
    }
    raf = requestAnimationFrame(ciz);

    /* ── Uçuşan "vulu" yazıları ── */
    const ucan = $('.vs-floating');
    function vuluUcur() {
        if (document.hidden) return;
        const s = document.createElement('span');
        s.textContent = sec(KELIMELER);
        s.style.left = rastgele(0, 95) + '%';
        s.style.fontSize = rastgele(14, 54) + 'px';
        s.style.setProperty('--c', sec(RENKLER));
        s.style.setProperty('--d', rastgele(7, 16) + 's');
        s.style.setProperty('--r', rastgele(-90, 90) + 'deg');
        s.addEventListener('animationend', () => s.remove());
        ucan.appendChild(s);
    }
    if (!sakin) {
        const id = setInterval(vuluUcur, hafif ? 1600 : 650);
        temizlik.push(() => clearInterval(id));
        for (let i = 0; i < (hafif ? 2 : 6); i++) sonra(vuluUcur, i * 120);
    }

    /* ── İmleç izi (yalnızca fare) ── */
    let sonIz = 0;
    if (!sakin) dinle(root, 'pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const simdi = performance.now();
        if (simdi - sonIz < 30) return;
        sonIz = simdi;
        const d = document.createElement('div');
        d.className = 'vs-trail';
        d.style.left = e.clientX + 'px';
        d.style.top = e.clientY + 'px';
        d.style.setProperty('--c', sec(RENKLER));
        d.addEventListener('animationend', () => d.remove());
        root.appendChild(d);
    });

    /* ── Tıklama patlaması + combo ── */
    const comboEl = $('.vs-combo');
    const comboSayi = $('.vs-combo-sayi');
    let combo = 0, comboTimer = 0;
    dinle(root, 'pointerdown', e => {
        if (e.target.closest('.vs-modal')) return;
        patlat(e.clientX, e.clientY, 28, 0.7);
        const t = document.createElement('div');
        t.className = 'vs-click-text';
        t.textContent = sec(TIK_YAZILARI);
        t.style.left = e.clientX + 'px';
        t.style.top = e.clientY + 'px';
        t.style.setProperty('--c', sec(RENKLER));
        t.style.setProperty('--r', rastgele(-25, 25) + 'deg');
        t.addEventListener('animationend', () => t.remove());
        root.appendChild(t);

        combo++;
        comboSayi.textContent = combo;
        comboEl.classList.add('goster');
        yeniden(comboEl, 'pop');
        clearTimeout(comboTimer);
        comboTimer = setTimeout(() => { combo = 0; comboEl.classList.remove('goster'); }, 1500);
        auraEkle(4);
    });
    temizlik.push(() => clearTimeout(comboTimer));

    /* ── Oyna tuşu: mıknatıs + dalga ── */
    const btn = $('.vs-oyna');
    if (btn) {
        if (!sakin) {
            dinle(btn, 'pointermove', e => {
                const r = btn.getBoundingClientRect();
                const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
                const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
                btn.style.transform = `translate(${dx * 14}px, ${dy * 10}px) scale(1.1) rotateX(${-dy * 20}deg) rotateY(${dx * 20}deg)`;
            });
            dinle(btn, 'pointerleave', () => { btn.style.transform = ''; });
        }
        dinle(btn, 'pointerdown', e => {
            const r = btn.getBoundingClientRect();
            const rp = document.createElement('span');
            rp.className = 'vs-ripple';
            const boy = Math.max(r.width, r.height) * 2.5;
            rp.style.width = rp.style.height = boy + 'px';
            rp.style.left = e.clientX - r.left + 'px';
            rp.style.top = e.clientY - r.top + 'px';
            rp.addEventListener('animationend', () => rp.remove());
            btn.appendChild(rp);
        });
    }

    /* ── ULTRA VULUSAL MOD ── */
    const banner = $('.vs-ultra-banner');
    function ultraMod() {
        if (durum.ultra) return;
        durum.ultra = true;
        root.classList.add('ultra');
        yeniden(banner, 'go');
        flash(); sars();
        for (let i = 0; i < 6; i++) sonra(() => patlat(rastgele(0, W), rastgele(0, H * 0.7), 120, 1.4), i * 180);
        caldir();
        sonra(() => { durum.ultra = false; root.classList.remove('ultra'); durum.aura = 30; }, 10000);
    }

    let kIdx = 0;
    dinle(window, 'keydown', e => {
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        kIdx = k === KONAMI[kIdx] ? kIdx + 1 : (k === KONAMI[0] ? 1 : 0);
        if (kIdx === KONAMI.length) { kIdx = 0; ultraMod(); }
    });

    /* ── VULUSAL - 2026: üstüne gelince ya da dokununca müzik ── */
    dinle(auraYazi, 'mouseenter', caldir);
    dinle(auraYazi, 'click', caldir);

    return {
        patlat, flash, sars, auraEkle, caldir,
        durdur() {
            cancelAnimationFrame(raf);
            temizlik.forEach(fn => fn());
            zamanlayicilar.forEach(clearTimeout);
            audioCtx?.close().catch(() => {});
            root.classList.remove('audio-active', 'ultra');
        },
    };
}
