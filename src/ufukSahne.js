// /vulusalufuk sayfasının canlı arka planı: "Olay Ufku" geçişinin synthwave dünyası (src/synthDunya.js), sayfa boyunca.
// Kamera ızgaranın üstünde sakin sakin ileri süzülür; sayfa kaydırıldıkça hızlanır, güneş batar, ufuk kızarır.
// Fare / parmak hafif bir paralaks verir. Son işleme: bloom, hafif renk kırılması, vinyet, film greni.
// Sekme gizliyken çizmez; "hareketi azalt" açıksa tek bir sabit kare çizer (kaydırınca yeniden).
// Bu dosya ayrı bir paket olarak, sayfa açılınca yüklenir.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { LENS, birak, synthDunyasi } from './synthDunya.js';

/** kap: tuvalin konacağı öğe. WebGL açılamazsa null döner (sayfa CSS'teki yedek arka planla kalır). */
export function ufukBaslat(kap, { hafif = false, sakin = false } = {}) {
    let W = innerWidth, H = innerHeight;
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    } catch { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, hafif ? 1 : 1.5));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const tuval = renderer.domElement;
    tuval.setAttribute('aria-hidden', 'true');

    const dunya = synthDunyasi({ hafif, W, H });
    const { sahne, kamera } = dunya;

    const besteci = new EffectComposer(renderer);
    besteci.addPass(new RenderPass(sahne, kamera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(hafif ? W / 2 : W, hafif ? H / 2 : H), 0.85, 0.6, 0.85);
    besteci.addPass(bloom);
    const lens = new ShaderPass({ ...LENS, defines: { ADIM: hafif ? 2 : 4 } });
    besteci.addPass(lens);
    besteci.addPass(new OutputPass());
    const L = lens.uniforms;
    L.uVinyet.value = 0.7;
    L.uGren.value = hafif ? 0 : 0.05;
    L.uMerkez.value.set(0.5, 0.55);

    kap.appendChild(tuval);
    requestAnimationFrame(() => tuval.classList.add('gorunur'));

    const durum = { kaydirma: 0, hedefKaydirma: 0, fareX: 0, fareY: 0, ivme: 0, sonKaydirma: 0 };
    const t0 = performance.now();
    let onceki = t0, raf = 0, calisiyor = true;

    function ciz(simdi) {
        const t = (simdi - t0) / 1000, dt = Math.min(0.05, (simdi - onceki) / 1000);
        onceki = simdi;
        durum.kaydirma += (durum.hedefKaydirma - durum.kaydirma) * Math.min(1, dt * 4);
        durum.ivme *= Math.exp(-dt * 2.2);
        const hiz = 7 + durum.ivme * 90;
        kamera.position.z -= hiz * dt;
        kamera.position.x += (durum.fareX * 3 - kamera.position.x) * Math.min(1, dt * 2);
        kamera.position.y = 2.2 + Math.sin(t * 0.6) * 0.12 - durum.fareY * 0.5 + durum.kaydirma * 1.2;
        kamera.rotation.y = -durum.fareX * 0.06;
        kamera.rotation.x = -0.035 + durum.fareY * 0.025;
        kamera.rotation.z = Math.sin(t * 0.4) * 0.012;
        dunya.guncelle({ t, gunesY: 36 - durum.kaydirma * 40, kizil: durum.kaydirma });
        L.uZaman.value = t;
        L.uKirilma.value = 0.0015 + Math.min(0.01, durum.ivme * 0.02);
        L.uBulanik.value = Math.min(0.5, durum.ivme * 0.8);
        besteci.render(dt);
    }
    function kare(simdi) {
        if (!calisiyor) return;
        raf = requestAnimationFrame(kare);
        if (document.hidden) { onceki = simdi; return; }
        ciz(simdi);
    }
    if (sakin) ciz(performance.now());
    else raf = requestAnimationFrame(kare);

    function boyutla() {
        W = innerWidth; H = innerHeight;
        renderer.setSize(W, H);
        besteci.setSize(W, H);
        dunya.boyutla(W, H);
        if (sakin) ciz(performance.now());
    }
    addEventListener('resize', boyutla);

    return {
        /** oran: sayfanın ne kadarı kaydırıldı (0–1). */
        kaydir(oran) {
            durum.ivme = Math.min(1, durum.ivme + Math.abs(oran - durum.sonKaydirma) * 3);
            durum.sonKaydirma = oran;
            durum.hedefKaydirma = oran;
            if (sakin) { durum.kaydirma = oran; ciz(performance.now()); }
        },
        /** x, y: -1…1 */
        fare(x, y) { durum.fareX = x; durum.fareY = y; },
        durdur() {
            calisiyor = false;
            cancelAnimationFrame(raf);
            removeEventListener('resize', boyutla);
            tuval.remove();
            birak(sahne);
            besteci.dispose?.();
            renderer.dispose();
            renderer.forceContextLoss();
        },
    };
}
