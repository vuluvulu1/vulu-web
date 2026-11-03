// İkinci gizli geçiş: "OLAY UFKU". Gerçekçi bir kara delik sayfayı yutar, ufkun öbür yanında neon bir synthwave evreni.
// three.js (WebGL, bloom, son işleme) ve html2canvas (sayfanın anlık görüntüsü, shader'a doku olarak) kullanır; bu dosya
// yalnızca gerektiğinde ayrı bir paket olarak yüklenir (src/vulusalGecis.js içindeki useVulusalKapi).
//
//   0–2,7 sn   TEKİLLİK: tıklanan noktada bir kara delik doğar ve ekranın ortasına süzülür. Sayfa (anlık görüntü) kütle
//              çekimi merceğiyle bükülür, çerçeve sürüklenmesiyle girdap olur, deliğe çekilip uzar; Einstein halkası,
//              foton halkası, Doppler'le bir yanı parlayan, akan plazmalı bir toplanma diski ve ufkun üstünden bükülen
//              arka disk görünür. Delik büyür, ekranı yutar: ufkun içine düşeriz.
//              Sayfa yutulurken altından neon bir uzay-zaman ızgarası çıkar; mercek onu da bükerek huniye çevirir.
//   2,7 sn     UFKUN İÇİ: karanlıktan, duvarları neon ızgaradan bir solucan deliği tüneline açılır; hiperuzay çizgileri
//              akar, tünelin sonunda bembeyaz bir ışık (beyaz delik) vardır
//   3,9–5,1 sn AÇILIŞ: tünelin duvarları açılıp kaybolur, zemin ızgarası belirir, simsiyah uzay synthwave moruna döner,
//              beyaz delik soğuyup şeritli güneşe dönüşerek ufkun üstüne yükselir, dağlar siluet olarak çıkar
//   2,7–7,6 sn SYNTHWAVE EVRENİ (3D): ufka uzanan neon ızgara, şeritli dev güneş ve zemindeki yansıması, iki yanda wireframe
//              dağlar, yıldızlar, sis. Krom VULUSAL logosu uzaktan uçup iner (şok dalgası, kıvılcımlar, üstünden ışık
//              süzülür); sonunda güneşe doğru hızlanma ve beyaz ekran
//   7,6 sn     aynı dünyada /vulusalufuk sayfası açılır, tuval kaybolur
// Son işleme: bloom, radyal hız bulanıklığı, renk kırılması, vinyet, film greni.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import html2canvas from 'html2canvas';
import { gecisSesi2, S2 } from './vulusalSes2.js';
import { LENS, UV_VERT, birak, synthDunyasi } from './synthDunya.js';

const YOL = '/vulusalufuk';   // synthwave evreninde açılan sayfa (src/pages/VulusalUfuk.jsx)
const KESME = S2.CUT, SON = S2.SON, BITIS = SON + 0.85;

const sinirla = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const yumusak = (a, b, v) => { const t = sinirla((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const disaHizli = t => 1 - Math.pow(1 - sinirla(t), 3);
const iceHizli = t => Math.pow(sinirla(t), 3);
const geriTepme = t => { const c = 1.9; t = sinirla(t) - 1; return 1 + (c + 1) * t * t * t + c * t * t; };
const rastgele = (a, b) => a + Math.random() * (b - a);

/** Görünen ekranın anlık görüntüsü (tuval). Geçişin ilk aşamasında shader bu görüntüyü büker. Sayfayı bir an dondurur. */
export function anlikGoruntu(hafif) {
    return html2canvas(document.body, {
        backgroundColor: '#0b0a09',
        scale: Math.min(devicePixelRatio || 1, hafif ? 1 : 1.5),
        x: scrollX, y: scrollY, width: innerWidth, height: innerHeight,
        windowWidth: document.documentElement.clientWidth, windowHeight: innerHeight,
        logging: false, useCORS: true,
        // ekranın tamamen dışında kalanlar çizilmez: görüntü iki kat hızlı alınır, sayfa daha kısa donar
        ignoreElements: e => {
            if (e.classList?.contains('torch') || e.classList?.contains('skip')) return true;
            if (e === document.body || e === document.documentElement || e.id === 'root') return false;
            const r = e.getBoundingClientRect?.();
            return !!r && (r.bottom < 0 || r.top > innerHeight);
        },
    });
}

/* ── Shader'lar ─────────────────────────────────────────────────────────────────── */

const TAM_EKRAN_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const GURULTU = /* glsl */`
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float gn(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < OKTAV; i++) { v += a * gn(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
}`;

/** Kara delik: sayfayı büken mercek, girdap, yutulma, halkalar, toplanma diski. Koordinatlar CSS pikseli, y yukarı. */
const KARA_DELIK_FRAG = /* glsl */`
uniform sampler2D tSayfa;
uniform vec2 uCoz, uMerkez;
uniform float uRs, uDon, uCek, uZaman, uDisk, uHalka, uIzgara;
varying vec2 vUv;
${GURULTU}
vec3 palet(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 a = vec3(0.22, 0.0, 0.55), b = vec3(1.0, 0.1, 0.85), c = vec3(1.0, 0.5, 0.16), d = vec3(1.0, 0.96, 0.85);
    return t < 0.4 ? mix(a, b, t / 0.4) : t < 0.75 ? mix(b, c, (t - 0.4) / 0.35) : mix(c, d, (t - 0.75) / 0.25);
}
vec3 uzay(vec2 q) {
    float y = pow(h21(floor(q * 0.6)), 400.0) * 2.5;
    return vec3(0.01, 0.0, 0.03) + vec3(y) * vec3(0.9, 0.85, 1.0);
}
vec3 sayfa(vec2 q) {
    vec2 uv = q / uCoz;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return uzay(q);
    return texture2D(tSayfa, uv).rgb;
}
void main() {
    vec2 p = vUv * uCoz - uMerkez;
    float r = length(p);
    float rs = max(uRs, 0.001);
    vec2 n = p / max(r, 0.001);

    // kütle çekimi merceği (ince mercek): ışık deliğin çevresinden bükülerek gelir
    float E = rs * 1.65;
    float rr = max(r, rs * 0.85);
    vec2 k = p - n * (E * E / rr);
    // çerçeve sürüklenmesi: dönen kara deliğin çevresinde girdap
    float a = uDon * (rs * rs / (rr * rr) * 5.0 + 0.18 * rs / rr);
    float ca = cos(a), sa = sin(a);
    k = mat2(ca, -sa, sa, ca) * k;
    // yutulma: sayfa deliğe doğru çekilip uzar
    k *= 1.0 + uCek * 3.0 * exp(-r / (uCoz.y * 0.55));
    k += uMerkez;

    // renk kırılması: deliğe yaklaştıkça kırmızı ve mavi ayrışır
    float kirilma = 18.0 * rs * rs / (r * r + rs * rs) + uCek * 5.0;
    vec3 renk = vec3(sayfa(k + n * kirilma).r, sayfa(k).g, sayfa(k - n * kirilma).b);
    renk *= mix(1.0, 0.6, uCek * (1.0 - smoothstep(rs, rs * 6.0, r)));

    // Einstein halkası ve foton halkası
    renk += exp(-pow((r - E) / (rs * 0.13), 2.0)) * vec3(1.0, 0.3, 0.95) * 0.55 * uHalka;
    renk += exp(-pow((r - rs * 1.07) / (rs * 0.035), 2.0)) * vec3(0.6, 0.95, 1.0) * 1.6 * uHalka;
    // uzay-zaman ızgarası: kaynak koordinatlarda çizildiği için mercekle birlikte bükülür, deliğe doğru huni olur
    vec2 gk = (k - uMerkez) / 46.0;
    vec2 gw = max(fwidth(gk), vec2(0.001));
    vec2 gd = abs(fract(gk - 0.5) - 0.5) / gw;
    float agCizgi = 1.0 - min(min(gd.x, gd.y), 1.0);
    // çizgilerin birbirine girdiği yerde (deliğin dibi) ızgara söner, yoksa beyaz bir lekeye döner
    agCizgi *= (1.0 - smoothstep(0.15, 0.45, max(gw.x, gw.y))) * smoothstep(rs * 1.4, rs * 3.2, r);
    vec3 agRenk = mix(vec3(0.0, 0.85, 1.0), vec3(1.0, 0.16, 0.92), smoothstep(rs * 2.0, rs * 9.0, r));
    renk = mix(renk, renk * 0.3, uIzgara * 0.75) + agRenk * agCizgi * uIzgara * 1.2;
    // olay ufku
    renk *= smoothstep(rs * 0.98, rs * 1.03, r);

    // toplanma diski
    if (uDisk > 0.001) {
        float e = -0.22, ce = cos(e), se = sin(e);
        vec2 q = mat2(ce, -se, se, ce) * p / rs;
        vec2 d = vec2(q.x, q.y / 0.2);
        float rd = length(d), ad = atan(d.y, d.x);
        float bant = smoothstep(1.55, 2.15, rd) * (1.0 - smoothstep(4.0, 7.5, rd));
        float akis = fbm(vec2(ad * 3.0 - uZaman * 3.4 + 6.0 / rd, rd * 1.4 - uZaman * 0.7));
        float dopp = 1.0 + 0.8 * cos(ad + 0.3);
        float isik = bant * (0.3 + 1.3 * akis) * dopp;
        vec3 dRenk = palet(1.1 - (rd - 1.55) / 4.2 + akis * 0.35) * isik * 1.05 * uDisk;
        float on = step(q.y, 0.0);
        float arka = (1.0 - on) * smoothstep(rs * 1.0, rs * 1.2, r);
        renk += dRenk * max(on, arka);
        // ufkun üstünden ve altından dolaşan, bükülmüş arka disk
        float rr2 = r / rs;
        float yay = smoothstep(1.22, 1.42, rr2) * (1.0 - smoothstep(1.65, 2.5, rr2));
        float ya = atan(p.y, p.x);
        float yAkis = fbm(vec2(ya * 4.0 + uZaman * 2.6, rr2 * 3.0));
        renk += palet(0.72 + yAkis * 0.3) * yay * (0.35 + yAkis) * (1.0 + 0.6 * sin(ya - 0.3)) * 0.8 * uDisk;
    }
    gl_FragColor = vec4(renk, 1.0);
}`;

/** Son işleme: radyal hız bulanıklığı + renk kırılması, vinyet, film greni, beyaz / siyah perde. */
/** Krom logo: yazı dokusu + üstünden süzülen ışık şeridi. */
const LOGO_FRAG = /* glsl */`
uniform sampler2D tLogo;
uniform float uParla, uGuc, uOpak;
varying vec2 vUv;
void main() {
    vec4 t = texture2D(tLogo, vUv);
    float serit = exp(-pow((vUv.x - vUv.y * 0.35 - uParla) / 0.05, 2.0));
    vec3 c = t.rgb * uGuc + serit * t.a * vec3(1.0, 0.95, 1.0) * 4.0;
    gl_FragColor = vec4(c, t.a * uOpak);
}`;

/** 80'ler kromu: VULUSAL ve altında LAUNCHER, pembe ışımalı (2D tuval → doku). */
async function logoDokusu() {
    try { await Promise.race([document.fonts.load('900 300px Orbitron'), new Promise(r => setTimeout(r, 800))]); } catch { /* yedek yazı tipi */ }
    const c = document.createElement('canvas');
    c.width = 2048; c.height = 640;
    const g = c.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 290px Orbitron, "Russo One", sans-serif';
    g.shadowColor = '#ff2df1'; g.shadowBlur = 50;
    g.lineWidth = 16; g.strokeStyle = '#ff2df1';
    g.strokeText('VULUSAL', 1024, 280);
    g.shadowBlur = 0;
    const krom = g.createLinearGradient(0, 150, 0, 410);
    krom.addColorStop(0, '#0a0638'); krom.addColorStop(0.3, '#3d7bff'); krom.addColorStop(0.47, '#eaf8ff');
    krom.addColorStop(0.5, '#2a0b2e'); krom.addColorStop(0.72, '#ff3ec8'); krom.addColorStop(1, '#ffd77a');
    g.fillStyle = krom;
    g.fillText('VULUSAL', 1024, 280);
    g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.85)';
    g.strokeText('VULUSAL', 1024, 280);
    g.font = '700 84px Orbitron, "Russo One", sans-serif';
    g.shadowColor = '#00d7ff'; g.shadowBlur = 30; g.fillStyle = '#9ff4ff';
    g.fillText([...'LAUNCHER'].join('  '), 1024, 520);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
}

/** Solucan deliği: kameranın çevresinde, duvarları neon ızgaradan bir tünel; açılırken duvarları dışarı kaçıp söner. */
export function tunelOlustur() {
    const tunelMat = new THREE.ShaderMaterial({
        uniforms: { uKay: { value: 0 }, uAcil: { value: 0 }, uOpak: { value: 1 } },
        vertexShader: /* glsl */`
            uniform float uAcil;
            varying vec2 vUv; varying float vZ;
            void main() {
                vUv = uv;
                vec3 p = position;
                p.xy *= 1.0 + uAcil * uAcil * 45.0;
                vec4 mv = modelViewMatrix * vec4(p, 1.0);
                vZ = -mv.z;
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: /* glsl */`
            uniform float uKay, uAcil, uOpak;
            varying vec2 vUv; varying float vZ;
            void main() {
                vec2 g = vec2(vUv.x * 28.0, vUv.y * 120.0 + uKay);
                vec2 d = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(0.001));
                float halka = 1.0 - min(d.y, 1.0), uzun = 1.0 - min(d.x, 1.0);
                float uzak = (1.0 - smoothstep(40.0, 390.0, vZ)) * smoothstep(0.5, 6.0, vZ);
                vec3 c = (vec3(0.0, 0.85, 1.0) * halka + vec3(1.0, 0.2, 0.95) * uzun) * 2.0 * uzak;
                gl_FragColor = vec4(c * uOpak * (1.0 - uAcil), 1.0);
            }`,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, side: THREE.DoubleSide, fog: false,
    });
    const tunelGeo = new THREE.CylinderGeometry(7, 7, 400, 56, 40, true);
    tunelGeo.rotateX(Math.PI / 2);
    const tunel = new THREE.Mesh(tunelGeo, tunelMat);
    // ön ucu kameranın biraz önünde başlar: tam kamera düzlemindeki köşelerde perspektif bölmesi sıfıra gidip
    // doku koordinatlarını bozuyordu (tünel hiç görünmüyordu)
    tunel.position.z = -203;
    tunel.frustumCulled = false;
    return { tunel, tunelMat };
}

/**
 * Geçişi başlatır. goruntu: anlikGoruntu() tuvali. WebGL açılamazsa false döner (çağıran eski geçişe düşer).
 * x, y: tıklanan nokta (CSS pikseli).
 */
export async function olayUfku({ navigate, x, y, goruntu, hafif }) {
    const W = innerWidth, H = innerHeight;
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    } catch { return false; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, hafif ? 1 : 1.5));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.NoToneMapping;
    const tuval = renderer.domElement;
    tuval.className = 'vg3';
    tuval.setAttribute('aria-hidden', 'true');

    const tanim = { OKTAV: hafif ? 4 : 5 };
    const logo = await logoDokusu();

    /* ── A sahnesi: kara delik (tam ekran shader) ── */
    const sayfaDokusu = new THREE.CanvasTexture(goruntu);
    sayfaDokusu.colorSpace = THREE.SRGBColorSpace;
    sayfaDokusu.minFilter = THREE.LinearFilter;
    sayfaDokusu.generateMipmaps = false;
    const tik = new THREE.Vector2(x, H - y), orta = new THREE.Vector2(W / 2, H / 2);
    const kd = new THREE.ShaderMaterial({
        defines: tanim,
        uniforms: {
            tSayfa: { value: sayfaDokusu }, uCoz: { value: new THREE.Vector2(W, H) }, uMerkez: { value: tik.clone() },
            uRs: { value: 0 }, uDon: { value: 0 }, uCek: { value: 0 }, uZaman: { value: 0 }, uDisk: { value: 0 }, uHalka: { value: 0 }, uIzgara: { value: 0 },
        },
        vertexShader: TAM_EKRAN_VERT, fragmentShader: KARA_DELIK_FRAG, depthTest: false, depthWrite: false,
    });
    const sahneA = new THREE.Scene();
    const kameraA = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    sahneA.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), kd));

    /* ── B sahnesi: synthwave evreni (ortak dünya, src/synthDunya.js) ── */
    const dunya = synthDunyasi({ hafif, W, H });
    const sahneB = dunya.sahne, kamera = dunya.kamera;

    const { tunel, tunelMat } = tunelOlustur();
    kamera.add(tunel);

    // hiperuzay çizgileri: kameranın önünde, ona doğru akan ışık çizgileri
    const cizgiSayi = hafif ? 260 : 600;
    const cp = new Float32Array(cizgiSayi * 6), cr = new Float32Array(cizgiSayi * 6), cizgiZ = new Float32Array(cizgiSayi);
    const paletRenk = [[1, 0.2, 0.95], [0, 0.85, 1], [1, 1, 1], [1, 0.85, 0.3]];
    for (let i = 0; i < cizgiSayi; i++) {
        const a = Math.random() * Math.PI * 2, r = rastgele(3, 40);
        const [rr, gg, bb] = paletRenk[i % 4];
        cp.set([Math.cos(a) * r, Math.sin(a) * r, 0, Math.cos(a) * r, Math.sin(a) * r, 0], i * 6);
        cr.set([rr * 2, gg * 2, bb * 2, rr * 2, gg * 2, bb * 2], i * 6);
        cizgiZ[i] = -rastgele(5, 400);
    }
    const cizgiGeo = new THREE.BufferGeometry();
    cizgiGeo.setAttribute('position', new THREE.BufferAttribute(cp, 3));
    cizgiGeo.setAttribute('color', new THREE.BufferAttribute(cr, 3));
    const cizgiMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const hiperuzay = new THREE.LineSegments(cizgiGeo, cizgiMat);
    hiperuzay.frustumCulled = false;
    kamera.add(hiperuzay);

    // krom logo, şok dalgası, kıvılcımlar
    const logoMat = new THREE.ShaderMaterial({
        uniforms: { tLogo: { value: logo }, uParla: { value: -1 }, uGuc: { value: 1.3 }, uOpak: { value: 0 } },
        vertexShader: UV_VERT, fragmentShader: LOGO_FRAG, transparent: true, depthWrite: false, fog: false,
    });
    const logoGenislik = Math.min(32, 30 * (W / H) / 1.35);
    const logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(logoGenislik, logoGenislik * 640 / 2048), logoMat);
    sahneB.add(logoMesh);
    const dalga = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 0.4, 1.8), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    sahneB.add(dalga);
    const kivSayi = hafif ? 160 : 400;
    const kp = new Float32Array(kivSayi * 3), kh = new Float32Array(kivSayi * 3), kr = new Float32Array(kivSayi * 3);
    for (let i = 0; i < kivSayi; i++) { const [a, b, c] = paletRenk[i % 4]; kr.set([a * 2, b * 2, c * 2], i * 3); }
    const kivGeo = new THREE.BufferGeometry();
    kivGeo.setAttribute('position', new THREE.BufferAttribute(kp, 3));
    kivGeo.setAttribute('color', new THREE.BufferAttribute(kr, 3));
    const kivMat = new THREE.PointsMaterial({ size: hafif ? 3 : 4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const kivilcim = new THREE.Points(kivGeo, kivMat);
    kivilcim.frustumCulled = false;
    sahneB.add(kivilcim);

    /* ── son işleme ── */
    const besteci = new EffectComposer(renderer);
    const gecis = new RenderPass(sahneA, kameraA);
    const bloom = new UnrealBloomPass(new THREE.Vector2(hafif ? W / 2 : W, hafif ? H / 2 : H), 0, 0.55, 0.9);
    const lens = new ShaderPass({ ...LENS, defines: { ADIM: hafif ? 5 : 9 } });
    besteci.addPass(gecis);
    besteci.addPass(bloom);
    besteci.addPass(lens);
    besteci.addPass(new OutputPass());
    const L = lens.uniforms;

    // shader'ları önceden derle, ilk kareyi çiz (görüntü sayfanın aynısı), sonra göster
    renderer.compile(sahneA, kameraA);
    renderer.compile(sahneB, kamera);
    besteci.render();
    document.body.appendChild(tuval);

    gecisSesi2();
    const t0 = performance.now();
    let onceki = t0, sahneB_mi = false, gidildi = false, dalgaT = -1, kivT = -1, raf = 0;
    const kivHiz = new Float32Array(kivSayi * 3);

    function kare(simdi) {
        raf = requestAnimationFrame(kare);
        const t = (simdi - t0) / 1000, dt = Math.min(0.05, (simdi - onceki) / 1000);
        onceki = simdi;
        L.uZaman.value = t;
        L.uGren.value = hafif ? 0.05 : 0.07;

        if (t < KESME) {
            /* TEKİLLİK */
            kd.uniforms.uZaman.value = t;
            kd.uniforms.uMerkez.value.lerpVectors(tik, orta, yumusak(0.15, 2.0, t));
            const rs = t < 0.35 ? H * 0.02 * geriTepme(t / 0.35)
                : t < 2.0 ? H * 0.02 * Math.pow(5.5, (t - 0.35) / 1.65)
                : H * 0.11 * Math.pow(26, iceHizli((t - 2.0) / (KESME - 2.05)));
            kd.uniforms.uRs.value = rs;
            kd.uniforms.uDon.value = 1.5 + t * 2.4 + iceHizli((t - 1.9) / 0.8) * 8;
            kd.uniforms.uCek.value = yumusak(0.5, 2.4, t) * 0.95;
            kd.uniforms.uDisk.value = yumusak(0.3, 1.2, t);
            kd.uniforms.uHalka.value = yumusak(0.0, 0.4, t);
            kd.uniforms.uIzgara.value = yumusak(0.8, 2.2, t);
            bloom.strength = yumusak(0.05, 0.7, t) * 0.6;
            L.uMerkez.value.set(kd.uniforms.uMerkez.value.x / W, kd.uniforms.uMerkez.value.y / H);
            L.uKirilma.value = yumusak(0.3, 2.6, t) * 0.012;
            L.uBulanik.value = yumusak(2.0, KESME, t) * 0.6;
            L.uVinyet.value = yumusak(0.2, 1.5, t) * 0.85;
            L.uBeyaz.value = t < 0.25 ? 0.3 * (1 - t / 0.25) : 0;
            L.uSiyah.value = 0;
        } else {
            /* UFKUN ÖBÜR YANI ve SYNTHWAVE EVRENİ */
            const tb = t - KESME;
            if (!sahneB_mi) {
                sahneB_mi = true;
                gecis.scene = sahneB; gecis.camera = kamera;
                bloom.radius = 0.6; bloom.threshold = 0.85;
                // synthwave evreni sinematik ton eşlemeyle: parlak güneş beyaza patlamaz, rengi ve şeritleri kalır
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.05;
                L.uMerkez.value.set(0.5, 0.52);
                sayfaDokusu.dispose();
            }
            let hiz = 650 * Math.exp(-tb * 3.2) + 24;
            if (tb > 3.7) hiz += Math.pow((tb - 3.7) * 4, 3) * 7;
            kamera.position.z -= hiz * dt;
            kamera.position.y = 2.2 + Math.sin(tb * 1.3) * 0.18;
            kamera.rotation.z = Math.sin(tb * 0.7) * 0.025;
            // tünel → açılış: duvarlar açılırken zemin belirir, uzay synthwave'e döner, beyaz delik güneşe soğuyup yükselir
            const acil = yumusak(1.2, 2.4, tb);
            tunelMat.uniforms.uAcil.value = acil;
            tunelMat.uniforms.uKay.value += hiz * dt / 3.33;
            tunelMat.uniforms.uOpak.value = yumusak(0.05, 0.5, tb);
            tunel.visible = acil < 0.999;
            dunya.guncelle({
                t,
                uzay: 1 - yumusak(1.3, 2.7, tb),
                parla: yumusak(1.4, 2.5, tb),
                gunesY: 2.2 + yumusak(1.5, 3.0, tb) * 33.8,
                gunesBeyaz: 1 - yumusak(1.6, 2.9, tb),
                gunesOlcek: 0.22 + yumusak(0.2, 2.6, tb) * 0.78,
                gunesUstte: tb < 2.2,
            });

            // hiperuzay çizgileri: hız arttıkça uzar, yavaşlarken söner
            const uzunluk = Math.min(120, hiz * 0.08);
            for (let i = 0; i < cizgiSayi; i++) {
                cizgiZ[i] += hiz * dt * 0.9;
                if (cizgiZ[i] > 2) cizgiZ[i] -= 400;
                cp[i * 6 + 2] = cizgiZ[i]; cp[i * 6 + 5] = cizgiZ[i] - uzunluk;
            }
            cizgiGeo.attributes.position.needsUpdate = true;
            cizgiMat.opacity = Math.max(0, 1 - tb / 1.3) + yumusak(3.9, 4.6, tb);

            // logo: uzaktan uçar, iner, salınır; sonda kameraya doğru gelir
            const inis = S2.LOGO - KESME;
            const lt = (tb - (inis - 0.8)) / 0.8;
            let zUzak = -260 + disaHizli(lt) * 240;
            if (tb > 3.9) zUzak += iceHizli((tb - 3.9) / 1.0) * 26;
            logoMesh.position.set(0, kamera.position.y + 4.2 + Math.sin(tb * 2) * 0.12, kamera.position.z + zUzak);   // güneşin üstünde, koyu gökyüzünde
            logoMesh.rotation.y = (1 - disaHizli(lt)) * 1.1;
            logoMat.uniforms.uOpak.value = yumusak(0, 0.25, lt);
            logoMat.uniforms.uGuc.value = 1.1 + (tb > inis ? 1.0 * Math.exp(-(tb - inis) * 5) : 0);
            logoMat.uniforms.uParla.value = tb < inis + 0.1 ? -1 : -0.4 + ((tb - inis - 0.1) % 1.5) * 1.6;

            if (tb >= inis && dalgaT < 0) {
                dalgaT = tb; kivT = tb;
                for (let i = 0; i < kivSayi; i++) {
                    kp.set([logoMesh.position.x + rastgele(-logoGenislik / 2, logoGenislik / 2), logoMesh.position.y + rastgele(-2, 2), logoMesh.position.z], i * 3);
                    const a = Math.random() * Math.PI * 2, v = rastgele(6, 30);
                    kivHiz.set([Math.cos(a) * v, Math.sin(a) * v + 6, rastgele(-8, 14)], i * 3);
                }
            }
            if (dalgaT >= 0) {
                const d = tb - dalgaT;
                dalga.position.copy(logoMesh.position);
                dalga.scale.setScalar(1 + d * 70);
                dalga.material.opacity = Math.max(0, 1 - d / 0.9);
                for (let i = 0; i < kivSayi * 3; i++) {
                    kp[i] += kivHiz[i] * dt;
                    if (i % 3 === 1) kivHiz[i] -= 22 * dt;
                }
                kivGeo.attributes.position.needsUpdate = true;
                kivMat.opacity = Math.max(0, 1 - (tb - kivT) / 1.6);
            }

            bloom.strength = 0.85 + (dalgaT >= 0 ? 0.9 * Math.exp(-(tb - dalgaT) * 4) : 0) + Math.max(0, 1 - tb / 0.6) * 0.8;
            L.uBulanik.value = Math.max(1.1 * Math.exp(-tb * 2.6), yumusak(3.8, 4.85, tb) * 1.4);
            L.uKirilma.value = 0.014 * Math.exp(-tb * 2) + 0.002 + (dalgaT >= 0 ? 0.012 * Math.exp(-(tb - dalgaT) * 6) : 0);
            L.uVinyet.value = 0.75;
            L.uBeyaz.value = Math.max(dalgaT >= 0 ? 0.3 * Math.exp(-(tb - dalgaT) * 8) : 0, yumusak(4.35, SON - KESME, tb));
            L.uSiyah.value = 1 - yumusak(0.0, 0.5, tb);   // ufkun karanlığından tünele açılış (beyaz flaş yok)
        }

        besteci.render(dt);

        if (t >= SON && !gidildi) {
            gidildi = true;
            navigate(YOL, { state: { gecis3d: true } });
            tuval.style.opacity = '0';
        }
        if (t >= BITIS) temizle();
    }
    raf = requestAnimationFrame(kare);

    function temizle() {
        cancelAnimationFrame(raf);
        tuval.remove();
        besteci.dispose?.();
        birak(sahneA);
        birak(sahneB);
        logo.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
    }
    return true;
}
