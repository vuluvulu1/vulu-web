// Gizli geçişin sesleri, WebAudio ile sıfırdan: başlığa tıklarken "enerji yükleme" çınlamaları ve EVRENİN YARILMASI.
// Hepsi tek bir ses bağlamını ve uzun bir yankıyı (oda değil, uzay) paylaşır. Bağlam ilk tıklamada açılır (tarayıcılar
// sesi ancak bir kullanıcı etkileşiminden sonra çaldırır); yankı tamponu da o an bir kez üretilir.
// Telefon hoparlörleri 100 Hz altını neredeyse hiç çalamaz: derin sesler orta frekanslı katmanlarla da desteklenir.

let ses = null;

const rastgele = (a, b) => a + Math.random() * (b - a);

/** Paylaşılan ses bağlamı; açılamazsa null. */
function hazirla() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ses) {
        try {
            const ac = new AC();
            // sıkıştırıcı (gövdeyi toplar) → sınırlayıcı (Big Bang gibi ani darbelerde tavana vurup çatırdamasın)
            const sinirla = ac.createDynamicsCompressor();
            sinirla.threshold.value = -4; sinirla.knee.value = 0; sinirla.ratio.value = 20; sinirla.attack.value = 0.001; sinirla.release.value = 0.12;
            sinirla.connect(ac.destination);
            const sikistir = ac.createDynamicsCompressor();
            sikistir.threshold.value = -16; sikistir.ratio.value = 5; sikistir.attack.value = 0.004; sikistir.release.value = 0.3;
            sikistir.connect(sinirla);
            const ana = ac.createGain();
            ana.gain.value = 0.62;
            ana.connect(sikistir);
            const yanki = ac.createConvolver();
            yanki.buffer = yankiTamponu(ac, 4.2);
            yanki.connect(ana);

            const gurultu = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
            const g = gurultu.getChannelData(0);
            for (let i = 0; i < g.length; i++) g[i] = Math.random() * 2 - 1;

            const egri = new Float32Array(1024);   // yumuşak doyum (tüp gibi)
            for (let i = 0; i < egri.length; i++) { const x = i / 512 - 1; egri[i] = Math.tanh(x * 2.6); }

            ses = { ac, ana, yanki, gurultu, egri };
        } catch { return null; }
    }
    if (ses.ac.state === 'suspended') ses.ac.resume().catch(() => {});
    return ses;
}

/** Uzay yankısı: iki kanallı, üstel sönen, yavaşça kararan (yüksekleri önce yutan) gürültü. */
function yankiTamponu(ac, sure) {
    const n = Math.floor(ac.sampleRate * sure);
    const b = ac.createBuffer(2, n, ac.sampleRate);
    for (let k = 0; k < 2; k++) {
        const d = b.getChannelData(k);
        let onceki = 0;
        for (let i = 0; i < n; i++) {
            const t = i / n;
            const yumusat = 0.15 + t * 0.8;                 // ilerledikçe daha boğuk
            onceki = onceki * yumusat + (Math.random() * 2 - 1) * (1 - yumusat);
            d[i] = onceki * Math.pow(1 - t, 2.2) * (i < 200 ? i / 200 : 1);
        }
    }
    return b;
}

/** Bir ses grubu: kuru ve yankılı çıkışı olan bir giriş. */
function grup(s, kuru, islak) {
    const g = s.ac.createGain();
    const k = s.ac.createGain(); k.gain.value = kuru;
    const w = s.ac.createGain(); w.gain.value = islak;
    g.connect(k); k.connect(s.ana);
    g.connect(w); w.connect(s.yanki);
    return g;
}

/** Zarf: atak süresinde g0'a çıkar, sonra sure sonunda söner. yukselt: sürenin sonunda zirve yapıp aniden kesilir. */
function zarf(param, t, sure, g0, { atak = 0.005, yukselt = false } = {}) {
    param.setValueAtTime(0.0001, t);
    if (yukselt) {
        param.exponentialRampToValueAtTime(g0, t + sure);
        param.setValueAtTime(0.0001, t + sure + 0.01);
    } else {
        param.exponentialRampToValueAtTime(g0, t + atak);
        param.exponentialRampToValueAtTime(0.0001, t + sure);
    }
}

function ton(s, hedef, t, sure, tip, f0, f1, g0, secenek = {}) {
    const o = s.ac.createOscillator(), g = s.ac.createGain();
    o.type = tip;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + sure);
    if (secenek.detune) o.detune.value = secenek.detune;
    zarf(g.gain, t, sure, g0, secenek);
    o.connect(g); g.connect(hedef);
    o.start(t); o.stop(t + sure + 0.05);
    return o;
}

function gurultu(s, hedef, t, sure, tip, f0, f1, g0, secenek = {}) {
    const k = s.ac.createBufferSource(), f = s.ac.createBiquadFilter(), g = s.ac.createGain();
    k.buffer = s.gurultu; k.loop = true;
    k.playbackRate.value = secenek.hiz || 1;
    f.type = tip; f.Q.value = secenek.q ?? 0.7;
    f.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + sure);
    zarf(g.gain, t, sure, g0, secenek);
    k.connect(f); f.connect(g); g.connect(hedef);
    k.start(t, Math.random()); k.stop(t + sure + 0.05);
}

/** Kick / gümleme: inen sinüs + üstüne orta frekanslı bir "gövde" (telefonda da duyulsun) + doyum. */
function gumle(s, hedef, t, f0, f1, sure, g0) {
    const o = s.ac.createOscillator(), dist = s.ac.createWaveShaper(), g = s.ac.createGain();
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + Math.min(0.5, sure * 0.4));
    dist.curve = s.egri;
    zarf(g.gain, t, sure, g0, { atak: 0.003 });
    o.connect(dist); dist.connect(g); g.connect(hedef);
    o.start(t); o.stop(t + sure + 0.05);
    gurultu(s, hedef, t, Math.min(0.4, sure), 'lowpass', 1800, 200, g0 * 0.35);
}

/**
 * BRAAAM: her nota için üç hafif akort dışı testere, birlikte açılıp kapanan alçak geçiren filtre ve doyum.
 * Sinematik, ağır, bakır gibi; bir oktav altında sinüs alt bas.
 */
function braam(s, hedef, t, notalar, sure, g0) {
    const f = s.ac.createBiquadFilter(), dist = s.ac.createWaveShaper(), g = s.ac.createGain();
    f.type = 'lowpass'; f.Q.value = 1.6;
    f.frequency.setValueAtTime(140, t);
    f.frequency.exponentialRampToValueAtTime(1600, t + 0.14);
    f.frequency.exponentialRampToValueAtTime(260, t + sure);
    dist.curve = s.egri;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(g0, t + 0.05);
    g.gain.setValueAtTime(g0, t + sure * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    f.connect(dist); dist.connect(g); g.connect(hedef);
    for (const n of notalar) {
        for (const sapma of [-14, 0, 11]) {
            const o = s.ac.createOscillator();
            o.type = 'sawtooth'; o.frequency.value = n; o.detune.value = sapma;
            const og = s.ac.createGain(); og.gain.value = 0.22;
            o.connect(og); og.connect(f);
            o.start(t); o.stop(t + sure + 0.05);
        }
    }
    ton(s, hedef, t, sure, 'sine', notalar[0] / 2, notalar[0] / 2, g0 * 0.9, { atak: 0.03 });
}

/**
 * Başlığa n. tıklama (1–4): kristal bir çınlama (çan gibi kısmi sesler), altta enerji yükleyen bir gümleme,
 * bir kıvılcım. Her tıklamada nota yükselir, gümleme ağırlaşır; 3. ve 4.'de gerilim kabarır.
 */
export function tikSesi(n) {
    const s = hazirla();
    if (!s) return;
    const t = s.ac.currentTime + 0.005;
    const yakin = grup(s, 0.85, 0.5), uzak = grup(s, 0.3, 0.9);
    const nota = [392, 466.2, 523.3, 622.3][Math.min(n, 4) - 1];   // Sol, Si♭, Do, Mi♭: yükselen minör
    ton(s, yakin, t, 1.6, 'sine', nota, nota, 0.2, { atak: 0.003 });
    ton(s, yakin, t, 0.7, 'sine', nota * 2.76, nota * 2.76, 0.05, { atak: 0.002 });
    ton(s, yakin, t, 0.4, 'sine', nota * 5.4, nota * 5.4, 0.02, { atak: 0.002 });
    ton(s, uzak, t, 2.4, 'triangle', nota / 2, nota / 2, 0.06, { atak: 0.01 });
    gumle(s, yakin, t, 150, 48, 0.5, 0.18 + n * 0.1);
    gurultu(s, uzak, t, 0.09, 'highpass', 5500, 9000, 0.12);
    if (n >= 3) gurultu(s, uzak, t, 0.85, 'bandpass', 400, 2600 * (n - 1), 0.05 * (n - 1), { yukselt: true, q: 1.2 });
}

/** Evrenin yarılması. z: geçişin aşama zamanları (ms, geçişin başından). */
export function gecisSesi(z) {
    const s = hazirla();
    if (!s) return;
    const t0 = s.ac.currentTime + 0.02;
    const T = ms => t0 + ms / 1000;
    const yakin = grup(s, 0.9, 0.35), uzak = grup(s, 0.4, 1);

    // ÇATLAK: darbe + BRAAAM + cam gibi çatırtılar + yükselen yer altı uğultusu
    gumle(s, yakin, T(0), 120, 32, 1.4, 1);
    braam(s, uzak, T(0), [55, 82.4], 2.6, 0.45);
    for (let i = 0; i < 12; i++) gurultu(s, uzak, T(rastgele(0, z.YARILMA)), rastgele(0.012, 0.045), 'highpass', rastgele(2800, 6500), 9000, rastgele(0.15, 0.4));
    gurultu(s, yakin, T(0), z.YARILMA / 1000 + 0.3, 'lowpass', 120, 220, 0.35, { yukselt: true });

    // YARILMA: yırtılan uzay (inen bant geçiren gürültü), derin gümleme, daha alçak bir BRAAAM
    gurultu(s, uzak, T(z.YARILMA), 1.8, 'bandpass', 2600, 120, 0.6, { atak: 0.06, q: 0.9 });
    gurultu(s, yakin, T(z.YARILMA), 0.5, 'lowpass', 4000, 300, 0.35);
    gumle(s, yakin, T(z.YARILMA), 80, 24, 2.4, 0.95);
    braam(s, uzak, T(z.YARILMA), [41.2, 61.7, 82.4], 3.4, 0.5);

    // UZAY: eterik pad (La minör), uzay rüzgârı, tizde ışıltı
    const padBas = T(z.UZAY - 400), cokus = T(z.COKUS), patlama = T(z.PATLAMA);
    const pad = s.ac.createGain(), padF = s.ac.createBiquadFilter();
    padF.type = 'lowpass'; padF.frequency.setValueAtTime(500, padBas); padF.frequency.linearRampToValueAtTime(1400, cokus);
    pad.gain.setValueAtTime(0.0001, padBas);
    pad.gain.linearRampToValueAtTime(0.06, padBas + 1.4);
    pad.gain.setValueAtTime(0.06, cokus);
    pad.gain.exponentialRampToValueAtTime(0.0001, patlama - 0.06);
    padF.connect(pad); pad.connect(uzak);
    for (const f of [110, 130.8, 164.8, 220, 329.6]) {
        for (const sapma of [-7, 7]) {
            const o = s.ac.createOscillator();
            o.type = 'triangle'; o.frequency.value = f;
            o.detune.setValueAtTime(sapma, cokus);
            o.detune.linearRampToValueAtTime(sapma - 1200, patlama);    // çöküşte her şey bir oktav aşağı kayar
            o.connect(padF); o.start(padBas); o.stop(patlama);
        }
    }
    gurultu(s, uzak, T(z.YARILMA + 500), (z.COKUS - z.YARILMA - 500) / 1000 + 0.4, 'bandpass', 300, 1300, 0.14, { atak: 1.6, q: 1.6, hiz: 0.5 });
    ton(s, uzak, T(z.UZAY), (z.COKUS - z.UZAY) / 1000, 'sine', 1760, 1760, 0.018, { atak: 1.2 });
    ton(s, uzak, T(z.UZAY + 300), (z.COKUS - z.UZAY) / 1000, 'sine', 2637, 2637, 0.012, { atak: 1.2 });

    // KARA DELİK: gittikçe hızlanan çekim titreşimi (alçak bir hırıltının genliği dalgalanır)
    const hir = s.ac.createOscillator(), hirF = s.ac.createBiquadFilter(), am = s.ac.createGain(), zarfG = s.ac.createGain();
    const lfo = s.ac.createOscillator(), lfoG = s.ac.createGain();
    hir.type = 'sawtooth';
    hir.frequency.setValueAtTime(55, T(z.UZAY)); hir.frequency.exponentialRampToValueAtTime(41, patlama);
    hirF.type = 'lowpass'; hirF.frequency.value = 420; hirF.Q.value = 4;
    am.gain.value = 0.5; lfoG.gain.value = 0.5;
    lfo.frequency.setValueAtTime(1.2, T(z.UZAY)); lfo.frequency.exponentialRampToValueAtTime(18, patlama);
    zarfG.gain.setValueAtTime(0.0001, T(z.UZAY));
    zarfG.gain.exponentialRampToValueAtTime(0.5, cokus);
    zarfG.gain.setValueAtTime(0.5, patlama - 0.12);
    zarfG.gain.exponentialRampToValueAtTime(0.0001, patlama - 0.05);
    lfo.connect(lfoG); lfoG.connect(am.gain);
    hir.connect(hirF); hirF.connect(am); am.connect(zarfG); zarfG.connect(yakin);
    hir.start(T(z.UZAY)); lfo.start(T(z.UZAY)); hir.stop(patlama); lfo.stop(patlama);

    // ÇÖKÜŞ: ters dönmüş zil gibi emiş (yükselir, zirvede kesilir), sonra bir an sessizlik
    const cokusSure = (z.PATLAMA - z.COKUS - 60) / 1000;
    gurultu(s, yakin, cokus, cokusSure, 'highpass', 250, 6000, 0.5, { yukselt: true });
    ton(s, yakin, cokus, cokusSure, 'sawtooth', 70, 900, 0.07, { yukselt: true });

    // BIG BANG: dev gümleme, patlama gürlemesi, La minör BRAAAM, ardından parlayan bir ışıltı
    gumle(s, yakin, patlama, 140, 26, 3.2, 1.2);
    gurultu(s, yakin, patlama, 3.4, 'lowpass', 9000, 140, 0.75);
    gurultu(s, uzak, patlama, 4.5, 'lowpass', 6000, 260, 0.5, { hiz: 0.6 });
    braam(s, uzak, patlama, [55, 82.4, 110, 130.8, 164.8], 5, 0.5);
    for (const [f, g] of [[880, 0.035], [1318.5, 0.025], [1760, 0.02], [2637, 0.012]]) ton(s, uzak, patlama + 0.15, 3.6, 'sine', f, f, g, { atak: 0.7 });

}
