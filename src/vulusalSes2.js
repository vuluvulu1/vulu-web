// "Olay Ufku" geçişinin sesi (src/vulusalGecis3d.js): önce kara deliğin ağırlığı, sonra gerçek bir synthwave parçası.
//   0–2,7 sn  tekillik: darbe ve BRAAAM, perdesi düşen ağır bir drone (zaman genişlemesi), hızlanan kalp atışı gümlemeleri,
//             aşağı kayan bir ışıltı, ters emiş ve bir an sessizlik
//   2,7 sn    ufkun öbür yanı: hiperuzay uğultusu ve BRAAAM
//   3,9 sn    synthwave: 120 BPM kick, 80'lerin kapı gibi kesilen yankılı snare'i, hi-hat, 16'lık arpej bas, pad akorları
//             (La minör → Fa maj7), yankılı (delay) bir lead
//   5,5 sn    logo iner: dev vuruş ve crash
//   7,6 sn    final: yükselen riser, sonra her şeyi kapatan akor
// Ortak ses bağlamı, yankı ve yardımcılar src/vulusalSes.js'te.

import { braam, grup, gumle, gurultu, hazirla, ton, zarf } from './vulusalSes.js';

/** Aşamalar (sn) — görüntüyle aynı. */
export const S2 = { CUT: 2.7, MUZIK: 3.9, LOGO: 5.5, SON: 7.6 };

export function gecisSesi2() {
    const s = hazirla();
    if (!s) return;
    const ac = s.ac;
    const t0 = ac.currentTime + 0.03;
    const T = sn => t0 + sn;
    const yakin = grup(s, 0.9, 0.3), uzak = grup(s, 0.4, 1);

    // kapı yankılı grup (snare): kuru + kısa, aniden kesilen yankı
    const kapi = ac.createGain();
    const kapiK = ac.createGain(); kapiK.gain.value = 0.8; kapi.connect(kapiK); kapiK.connect(s.ana);
    const kapiW = ac.createGain(); kapiW.gain.value = 1.1; kapi.connect(kapiW); kapiW.connect(s.kisaYanki);

    // delay'li grup (lead): 3/16'lık eko, koyulaşan geri besleme
    const lead = ac.createGain();
    const gecik = ac.createDelay(1); gecik.delayTime.value = 0.375;
    const geri = ac.createGain(); geri.gain.value = 0.38;
    const gecikF = ac.createBiquadFilter(); gecikF.type = 'lowpass'; gecikF.frequency.value = 2600;
    lead.connect(uzak); lead.connect(gecik); gecik.connect(gecikF); gecikF.connect(geri); geri.connect(gecik); gecikF.connect(uzak);

    // ── TEKİLLİK ───────────────────────────────────────────────
    gumle(s, yakin, T(0), 120, 30, 1.8, 0.95);
    braam(s, uzak, T(0), [36.7, 55], 2.8, 0.42);
    gurultu(s, yakin, T(0), 0.4, 'lowpass', 3000, 200, 0.35);

    // zaman genişlemesi: perdesi ve parlaklığı düşen, giderek büyüyen ağır bir drone
    const dF = ac.createBiquadFilter(), dG = ac.createGain();
    dF.type = 'lowpass'; dF.Q.value = 3;
    dF.frequency.setValueAtTime(900, T(0.2)); dF.frequency.exponentialRampToValueAtTime(220, T(S2.CUT - 0.05));
    dG.gain.setValueAtTime(0.0001, T(0.2));
    dG.gain.exponentialRampToValueAtTime(0.32, T(S2.CUT - 0.3));
    dG.gain.exponentialRampToValueAtTime(0.0001, T(S2.CUT - 0.04));
    dF.connect(dG); dG.connect(yakin);
    for (const [f, sapma] of [[55, -9], [55, 9], [82.4, 0], [110, 5]]) {
        const o = ac.createOscillator();
        o.type = 'sawtooth'; o.detune.value = sapma;
        o.frequency.setValueAtTime(f, T(0.2)); o.frequency.exponentialRampToValueAtTime(f / 2, T(S2.CUT));
        o.connect(dF); o.start(T(0.2)); o.stop(T(S2.CUT));
    }
    // aşağı kayan ışıltı
    for (const f of [1760, 2217, 2637]) ton(s, uzak, T(0.3), S2.CUT - 0.35, 'sine', f, f / 4, 0.02, { atak: 0.6 });
    // hızlanan kalp atışı
    for (const [a, g] of [[0.7, 0.45], [0.95, 0.35], [1.45, 0.5], [1.66, 0.4], [2.0, 0.55], [2.16, 0.45], [2.36, 0.6], [2.48, 0.5]]) gumle(s, yakin, T(a), 80, 40, 0.3, g);
    gurultu(s, uzak, T(0.4), S2.CUT - 0.4, 'bandpass', 200, 1400, 0.12, { atak: 1.6, q: 1.4, hiz: 0.5 });
    // ters emiş → sessizlik
    gurultu(s, yakin, T(2.0), S2.CUT - 2.0 - 0.06, 'highpass', 300, 7000, 0.5, { yukselt: true });

    // ── UFKUN ÖBÜR YANI ───────────────────────────────────────
    const ufuk = S2.CUT + 0.06;
    gurultu(s, uzak, T(ufuk), 1.9, 'lowpass', 12000, 180, 0.65, { atak: 0.01 });
    gurultu(s, yakin, T(ufuk), 1.2, 'bandpass', 5000, 300, 0.4, { q: 0.8 });
    braam(s, uzak, T(ufuk), [41.2, 61.7, 82.4], 3.2, 0.5);
    gumle(s, yakin, T(ufuk), 100, 26, 2.2, 0.9);
    // müziğe doğru kabaran pad
    gurultu(s, uzak, T(S2.MUZIK - 0.9), 0.88, 'highpass', 600, 9000, 0.3, { yukselt: true });

    // ── SYNTHWAVE ──────────────────────────────────────────────
    const vurus = 0.5, on6 = vurus / 4, bas = S2.MUZIK, bitis = S2.SON;
    const akorDegis = bas + 4 * vurus;
    // kick + hi-hat + gated snare
    for (let b = 0; bas + b * vurus < bitis - 0.05; b++) {
        const t = T(bas + b * vurus);
        gumle(s, yakin, t, 150, 45, 0.42, 0.85);
        if (b % 2 === 1) {
            gurultu(s, kapi, t, 0.2, 'bandpass', 1900, 1500, 0.65, { q: 0.7 });
            ton(s, kapi, t, 0.13, 'triangle', 200, 160, 0.35);
        }
        gurultu(s, yakin, t + vurus / 2, 0.045, 'highpass', 8000, 8000, 0.12);
        gurultu(s, yakin, t, 0.03, 'highpass', 9000, 9000, 0.06);
    }
    // 16'lık arpej bas
    const arp = [[55, 110, 82.4, 110, 130.8, 110, 82.4, 110], [43.65, 87.3, 65.4, 87.3, 110, 87.3, 65.4, 87.3]];
    for (let i = 0; bas + i * on6 < bitis - 0.05; i++) {
        const t = bas + i * on6;
        const f = arp[t < akorDegis ? 0 : 1][i % 8];
        const o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
        o.type = 'sawtooth'; o.frequency.value = f;
        fl.type = 'lowpass'; fl.Q.value = 7;
        fl.frequency.setValueAtTime(2200, T(t)); fl.frequency.exponentialRampToValueAtTime(260, T(t) + 0.11);
        zarf(g.gain, T(t), 0.12, 0.16, { atak: 0.003 });
        o.connect(fl); fl.connect(g); g.connect(yakin);
        o.start(T(t)); o.stop(T(t) + 0.15);
    }
    // pad akorları: La minör, sonra Fa maj7
    for (const [ilk, son, notalar] of [[bas, akorDegis, [220, 261.6, 329.6, 440]], [akorDegis, bitis, [174.6, 220, 261.6, 329.6]]]) {
        const fl = ac.createBiquadFilter(), g = ac.createGain();
        fl.type = 'lowpass'; fl.frequency.value = 1900;
        g.gain.setValueAtTime(0.0001, T(ilk));
        g.gain.linearRampToValueAtTime(0.05, T(ilk) + 0.25);
        g.gain.setValueAtTime(0.05, T(son) - 0.08);
        g.gain.linearRampToValueAtTime(0.0001, T(son));
        fl.connect(g); g.connect(uzak);
        for (const f of notalar) for (const sapma of [-11, 0, 12]) {
            const o = ac.createOscillator();
            o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = sapma;
            o.connect(fl); o.start(T(ilk)); o.stop(T(son) + 0.05);
        }
    }
    // lead
    for (const [v, f, sure] of [[0, 659.3, 1], [1, 587.3, 0.5], [1.5, 523.3, 0.5], [2, 493.9, 1], [3, 523.3, 1], [4, 440, 1], [5, 523.3, 0.5], [5.5, 659.3, 0.5], [6, 587.3, 1.2]]) {
        const t = T(bas + v * vurus), d = sure * vurus;
        ton(s, lead, t, d, 'square', f, f, 0.05, { atak: 0.01 });
        ton(s, lead, t, d, 'sawtooth', f * 1.003, f * 1.003, 0.04, { atak: 0.01 });
    }

    // ── LOGO İNER ─────────────────────────────────────────────
    gumle(s, yakin, T(S2.LOGO), 140, 28, 2.4, 1);
    gurultu(s, uzak, T(S2.LOGO), 2.2, 'highpass', 3000, 2500, 0.45);
    braam(s, uzak, T(S2.LOGO), [55, 82.4, 110], 2.2, 0.4);

    // ── FİNAL ─────────────────────────────────────────────────
    gurultu(s, uzak, T(S2.SON - 1), 0.98, 'highpass', 400, 10000, 0.45, { yukselt: true });
    ton(s, yakin, T(S2.SON - 1), 0.98, 'sawtooth', 110, 1760, 0.05, { yukselt: true });
    gumle(s, yakin, T(S2.SON), 140, 26, 3, 1.1);
    gurultu(s, yakin, T(S2.SON), 3, 'lowpass', 9000, 150, 0.6);
    braam(s, uzak, T(S2.SON), [55, 82.4, 110, 130.8, 164.8], 4.5, 0.5);
    for (const [f, g] of [[880, 0.03], [1318.5, 0.022], [1760, 0.016]]) ton(s, uzak, T(S2.SON + 0.1), 3.4, 'sine', f, f, g, { atak: 0.6 });
}
