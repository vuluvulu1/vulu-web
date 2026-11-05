// "Vulu Kuantum"un müziği (src/kuantum.js): 128 BPM, Fa minör future bass. Fm → D♭ → A♭ → E♭.
//   dört vuruşta bir kick, 2. ve 4. vuruşta clap (kısa, kapı gibi kesilen yankıyla), ara sekizliklerde hi-hat,
//   kick'lerin arasında yuvarlanan bas, kick'e göre nefes alan (sidechain) supersaw akorlar, iki barda bir arpej,
//   her dört barın sonunda yükselen bir riser ve yeni turun başında crash.
// Görüntü vuruşları analizle değil doğrudan buradan öğrenir: her olay (kick, clap, şekil, büyük) çalınacağı zamanla
// bir kuyruğa yazılır, kuantum.js zamanı gelince alır. Ses açılamazsa aynı olaylar bir saatle üretilir (görüntü yine
// müziğin temposunda atar). Ortak ses bağlamı ve yardımcılar src/vulusalSes.js'te.

import { grup, gumle, gurultu, hazirla, ton, zarf } from './vulusalSes.js';

const BPM = 128, ON6 = 60 / BPM / 4;
const AKORLAR = [
    [174.6, 207.7, 261.6],   // Fm
    [138.6, 174.6, 207.7],   // D♭
    [207.7, 261.6, 311.1],   // A♭
    [155.6, 196.0, 233.1],   // E♭
];
const BAS = [87.3, 69.3, 103.8, 77.8];
const SEVIYE = 1.2;   // müziğin ana seviyesi

export function kuantumMuzigi() {
    let s = null, saat = 0, zaman = 0, adim = 0, calisiyor = false, sessiz = false;
    let ana = null, yakin, uzak, kapi, pompa;
    const olaylar = [];
    const t0Yedek = performance.now() / 1000;
    const simdi = () => (s ? s.ac.currentTime : performance.now() / 1000 - t0Yedek);

    function kur() {
        ana = s.ac.createGain();
        ana.gain.setValueAtTime(0.0001, s.ac.currentTime);
        ana.gain.exponentialRampToValueAtTime(sessiz ? 0.0001 : SEVIYE, s.ac.currentTime + 1.2);
        ana.connect(s.ana);
        // grupları ana kazanca bağla (sustur / kapat hepsini birden etkilesin)
        const altGrup = (kuru, islak, yanki = s.yanki) => {
            const g = s.ac.createGain(), k = s.ac.createGain(), w = s.ac.createGain();
            k.gain.value = kuru; w.gain.value = islak;
            g.connect(k); k.connect(ana); g.connect(w); w.connect(yanki);
            return g;
        };
        yakin = altGrup(0.8, 0.15);
        uzak = altGrup(0.35, 0.55);
        kapi = altGrup(0.6, 0.9, s.kisaYanki);
        // sidechain: akorlar ve bas her kick'te kısılır, sonra açılır
        pompa = s.ac.createGain();
        pompa.connect(uzak);
    }

    function olay(i, t) {
        const k = i % 16, bar = Math.floor(i / 16), akor = AKORLAR[bar % 4], kok = BAS[bar % 4];
        const sonBar = bar % 4 === 3;
        if (k === 0 && bar % 2 === 0) olaylar.push({ t, tur: 'sekil' });
        if (k === 0 && bar % 4 === 0 && bar > 0) olaylar.push({ t, tur: 'buyuk' });

        if (!s) {                                   // ses yok: yalnızca olaylar
            if (k % 4 === 0) olaylar.push({ t, tur: 'kick' });
            if (k === 4 || k === 12) olaylar.push({ t, tur: 'clap' });
            return;
        }

        if (k % 4 === 0) {
            olaylar.push({ t, tur: 'kick' });
            gumle(s, yakin, t, 160, 42, 0.42, 0.9);
            pompa.gain.setValueAtTime(0.18, t);
            pompa.gain.linearRampToValueAtTime(1, t + 0.3);
        }
        if (k === 4 || k === 12) {
            olaylar.push({ t, tur: 'clap' });
            for (const g of [0, 0.012, 0.024]) gurultu(s, kapi, t + g, 0.16, 'bandpass', 1600, 1200, 0.45, { q: 0.9 });
        }
        if (k % 4 === 2) gurultu(s, yakin, t, 0.05, 'highpass', 8500, 8500, 0.09);
        if (sonBar && k >= 12) gurultu(s, yakin, t, 0.04, 'highpass', 9000, 9000, 0.07);

        // yuvarlanan bas: kick'lerin arasındaki on altılıklar
        if (k % 4 !== 0) {
            const o = s.ac.createOscillator(), f = s.ac.createBiquadFilter(), g = s.ac.createGain();
            o.type = 'sawtooth'; o.frequency.value = kok;
            f.type = 'lowpass'; f.Q.value = 5;
            f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(180, t + 0.1);
            zarf(g.gain, t, 0.11, 0.16, { atak: 0.004 });
            o.connect(f); f.connect(g); g.connect(pompa);
            o.start(t); o.stop(t + 0.14);
        }

        // supersaw akor: barın başında, bar boyunca
        if (k === 0) {
            const sure = 16 * ON6;
            const f = s.ac.createBiquadFilter(), g = s.ac.createGain();
            f.type = 'lowpass'; f.Q.value = 0.8;
            f.frequency.setValueAtTime(1400, t); f.frequency.linearRampToValueAtTime(sonBar ? 5200 : 2600, t + sure);
            g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.028, t + 0.04);
            g.gain.setValueAtTime(0.028, t + sure - 0.06); g.gain.linearRampToValueAtTime(0.0001, t + sure);
            f.connect(g); g.connect(pompa);
            for (const n of akor) for (const sapma of [-24, -11, 0, 11, 24]) {
                const o = s.ac.createOscillator();
                o.type = 'sawtooth'; o.frequency.value = n * 2; o.detune.value = sapma;
                o.connect(f); o.start(t); o.stop(t + sure + 0.02);
            }
            if (bar % 4 === 0 && bar > 0) gurultu(s, uzak, t, 1.8, 'highpass', 4000, 3000, 0.35);   // crash
        }

        // arpej: iki barda bir, akor seslerinden yukarı
        if (bar % 2 === 1) {
            const n = [akor[0], akor[1], akor[2], akor[1] * 2][k % 4] * 4;
            ton(s, uzak, t, ON6 * 1.6, 'triangle', n, n, 0.045, { atak: 0.003 });
        }
        // riser: dört barın sonunda
        if (sonBar && k === 0) {
            gurultu(s, uzak, t, 16 * ON6, 'highpass', 300, 9000, 0.25, { yukselt: true });
            ton(s, uzak, t, 16 * ON6, 'sawtooth', 110, 880, 0.03, { yukselt: true });
        }
    }

    function planla() {
        const ufuk = simdi() + 0.3;
        while (zaman < ufuk) { olay(adim, zaman); zaman += ON6; adim++; }
    }

    return {
        /** Olay kuyruğu: { t (simdi() ile aynı saat), tur: 'kick' | 'clap' | 'sekil' | 'buyuk' } */
        olaylar,
        simdi,
        baslat() {
            if (calisiyor) return;
            s = hazirla();
            if (s) kur();
            zaman = simdi() + 0.1; adim = 0;
            planla();
            saat = setInterval(planla, 80);
            calisiyor = true;
        },
        sustur(evet) {
            sessiz = evet;
            if (!ana) return;
            const t = s.ac.currentTime;
            ana.gain.cancelScheduledValues(t);
            ana.gain.setValueAtTime(Math.max(ana.gain.value, 0.0001), t);
            ana.gain.exponentialRampToValueAtTime(evet ? 0.0001 : SEVIYE, t + 0.25);
        },
        get sessiz() { return sessiz; },
        get sesVar() { return !!s; },
        durdur() {
            if (!calisiyor) return;
            calisiyor = false;
            clearInterval(saat);
            if (ana) {
                const t = s.ac.currentTime;
                ana.gain.cancelScheduledValues(t);
                ana.gain.setValueAtTime(Math.max(ana.gain.value, 0.0001), t);
                ana.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
                setTimeout(() => ana.disconnect(), 700);
            }
        },
    };
}

/**
 * Gizli kapı için yükleme sesi: basılı tutulurken perdesi yükselen bir ton. Dönen nesnenin bitir(tamam) çağrısı ya
 * parlak bir çınlamayla kapanır (tamamlandı) ya da hızla söner (erken bırakıldı).
 */
export function yuklemeSesi(sure) {
    const s = hazirla();
    if (!s) return { bitir() {} };
    const t = s.ac.currentTime + 0.01;
    const g = s.ac.createGain(), f = s.ac.createBiquadFilter();
    const gr = grup(s, 0.6, 0.5);
    f.type = 'lowpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(4000, t + sure);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + sure);
    f.connect(g); g.connect(gr);
    const osc = [0, 7].map(sapma => {
        const o = s.ac.createOscillator();
        o.type = 'sawtooth'; o.detune.value = sapma;
        o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(880, t + sure);
        o.connect(f); o.start(t);
        return o;
    });
    return {
        bitir(tamam) {
            const u = s.ac.currentTime;
            g.gain.cancelScheduledValues(u);
            g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), u);
            g.gain.exponentialRampToValueAtTime(0.0001, u + (tamam ? 0.05 : 0.15));
            osc.forEach(o => o.stop(u + 0.2));
            if (tamam) {
                for (const [fr, gg] of [[1046.5, 0.12], [1568, 0.08], [2093, 0.05]]) ton(s, gr, u, 1.6, 'sine', fr, fr, gg, { atak: 0.003 });
                gumle(s, gr, u, 120, 40, 0.6, 0.6);
            }
        },
    };
}
