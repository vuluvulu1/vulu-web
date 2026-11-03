// VULU KUANTUM: üçüncü gizli kapı. Ekran kartında yaşayan, akışkan gibi davranan, müzikle atan bir parçacık bulutu.
// Tetik: launcher sayfasında sol üstteki VL logosuna basılı tutmak (src/kuantumKapi.js). Sayfa değişmez; tam ekran
// bir katman açılır, Esc ya da Kapat ile kapanır.
//
// Her şey ham WebGL 2 ile, ekran kartında (bu dosya ~15 KB, three.js yok):
//   simülasyon   konum ve hız iki float dokuda; tek bir tam ekran geçiş (MRT) hepsini aynı anda günceller: hedef şekle
//                yay kuvveti, akış alanı (girdaplı), parmağın itmesi ve girdabı, müzikteki vuruşların nabzı, sönüm
//   şekiller     VL logosu, VULU yazısı, piksel bir kazma, küre, galaksi; her biri için 65 536 hedef nokta bir kez
//                üretilip tek bir dokuya yüklenir, parçacıklar bu noktaları küçük sapmalarla paylaşır (şekil değişirken
//                veri aktarımı yok); şekiller arası geçişte parçacıklar sırayla, dalga gibi akar
//   çizim        parçacıklar köşe verisi olmadan, gl_VertexID ile doğrudan dokudan okunur; düşük çözünürlüklü bir HDR
//                tampona toplanarak (additive) çizilir; hareket izi tamponun her karede biraz söndürülmesiyle (ek doku
//                yok); bloom 1/2–1/8 çözünürlükte; son geçişte ton eşleme, vinyet, gren
//   kalite       cihaza göre bir üst sınır (masaüstü 1M, orta 512K, telefon 131K parçacık); çalışırken kare süresi
//                ekranın yenilenmesine (60 / 120 Hz kendiliğinden anlaşılır) yetişmiyorsa simüle edilen satır sayısı
//                hemen düşer, rahatsa yavaşça artar: doku yeniden kurulmaz, takılma olmaz. En altta da yetişmezse
//                çizim çözünürlüğü düşer. Sekme gizliyken çizilmez.
// Etkileşim: sürükle (madde parmağının etrafında dağılır, girdap olur), bırak (yeniden şekil alır), çift dokun (patlar,
// sonraki şekle geçer). Müzik (src/kuantumSes.js) olaylarını zamanıyla verir: kick'te nabız, clap'te girdap, iki barda
// bir yeni şekil, dört barda bir büyük patlama.

import { asset } from './api.js';
import { kuantumMuzigi } from './kuantumSes.js';
import './kuantum.css';

const SEKIL_SAYISI = 5, ORNEK = 256;   // her şekil 256×256 = 65 536 hedef nokta

const TAM_EKRAN_VS = `#version 300 es
out vec2 vUv;
void main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); vUv = p; gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;

const HASH = `
uvec3 pcg3(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    return v;
}
vec3 h3(uint i) { return vec3(pcg3(uvec3(i, i * 7u + 1u, i * 13u + 5u))) / 4294967295.0; }`;

const SIM_FS = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
uniform sampler2D uPos, uVel, uSekil;
uniform float uZaman, uDt, uBicim, uKarisim, uNabiz, uGirdap, uFareGuc, uOlcek;
uniform int uSekilA, uSekilB, uGen;
uniform vec3 uFare;
layout(location = 0) out vec4 oPos;
layout(location = 1) out vec4 oVel;
${HASH}
// ucuz, sürekli, girdaplı akış alanı
vec3 akis(vec3 p, float t) {
    vec3 q = p * 1.7;
    return vec3(sin(q.y * 1.3 + t) + cos(q.z * 1.7 - t * 0.7),
                sin(q.z * 1.1 - t * 0.8) + cos(q.x * 1.5 + t * 0.6),
                sin(q.x * 1.2 + t * 0.5) + cos(q.y * 1.4 - t * 0.9)) * 0.5;
}
void main() {
    ivec2 ij = ivec2(gl_FragCoord.xy);
    vec3 p = texelFetch(uPos, ij, 0).xyz, v = texelFetch(uVel, ij, 0).xyz;
    uint id = uint(ij.y * uGen + ij.x);
    int s = int(id & 65535u);
    ivec2 sij = ivec2(s & 255, s >> 8);
    vec3 tA = texelFetch(uSekil, sij + ivec2(0, uSekilA * 256), 0).xyz;
    vec3 tB = texelFetch(uSekil, sij + ivec2(0, uSekilB * 256), 0).xyz;
    vec3 j = h3(id) - 0.5;
    float k = smoothstep(0.0, 1.0, clamp(uKarisim * 1.7 - (j.x + 0.5) * 0.7, 0.0, 1.0));   // sırayla, dalga gibi
    vec3 hedef = mix(tA, tB, k) * vec3(uOlcek, uOlcek, 1.0) + j * 0.016;

    vec3 f = (hedef - p) * 7.0 * uBicim;
    f += akis(p, uZaman * 0.35) * mix(1.7, 0.1, uBicim);
    vec3 d = p - uFare;
    float r2 = dot(d.xy, d.xy) + 0.012;
    f += (vec3(d.xy, 0.0) * 1.1 + vec3(-d.y, d.x, 0.0) * 2.4) * uFareGuc * 0.055 / r2;
    f += vec3(-p.y, p.x, 0.0) * uGirdap * 1.6;
    f += normalize(p + j * 0.02) * uNabiz * 3.2;
    v = v * exp(-mix(1.0, 5.0, uBicim) * uDt) + f * uDt;
    p += v * uDt;
    oPos = vec4(p, 1.0);
    oVel = vec4(v, 1.0);
}`;

const NOKTA_VS = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
uniform sampler2D uPos, uVel;
uniform mat4 uMVP;
uniform int uGen;
uniform float uNokta, uParlak, uFlas;
out vec3 vRenk;
${HASH}
void main() {
    ivec2 ij = ivec2(gl_VertexID % uGen, gl_VertexID / uGen);
    vec3 p = texelFetch(uPos, ij, 0).xyz, v = texelFetch(uVel, ij, 0).xyz;
    vec4 c = uMVP * vec4(p, 1.0);
    gl_Position = c;
    float r = h3(uint(gl_VertexID)).x;
    vec3 taban = r < 0.45 ? vec3(1.0, 0.16, 0.85) : r < 0.85 ? vec3(0.0, 0.72, 1.0) : vec3(0.6, 0.2, 1.0);
    vRenk = mix(taban, vec3(1.0, 0.93, 0.85), clamp(length(v) * 0.32, 0.0, 1.0)) * uParlak * (1.0 + uFlas);
    gl_PointSize = clamp(uNokta / c.w, 1.0, 6.0);
}`;

const NOKTA_FS = `#version 300 es
precision mediump float;
in vec3 vRenk; out vec4 o;
void main() { o = vec4(vRenk, 1.0); }`;

const SIFIR_FS = `#version 300 es
precision mediump float; out vec4 o; void main() { o = vec4(0.0); }`;

const ORNEKLE_FS = esik => `#version 300 es
precision mediump float;
uniform sampler2D uKaynak; uniform vec2 uTexel;
in vec2 vUv; out vec4 o;
void main() {
    vec3 c = texture(uKaynak, vUv + uTexel * vec2(-0.5, -0.5)).rgb + texture(uKaynak, vUv + uTexel * vec2(0.5, -0.5)).rgb
           + texture(uKaynak, vUv + uTexel * vec2(-0.5, 0.5)).rgb + texture(uKaynak, vUv + uTexel * vec2(0.5, 0.5)).rgb;
    c *= 0.25;
    ${esik ? 'c = max(c - 0.3, 0.0);' : ''}
    o = vec4(c, 1.0);
}`;

const SON_FS = `#version 300 es
precision mediump float;
uniform sampler2D uAcc, uBloom;
uniform float uBloomGuc, uZaman, uFlas;
in vec2 vUv; out vec4 o;
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
    vec2 d = vUv - 0.5;
    vec3 zemin = mix(vec3(0.03, 0.0, 0.07), vec3(0.0), clamp(length(d) * 1.6, 0.0, 1.0));
    vec3 c = zemin + texture(uAcc, vUv).rgb + texture(uBloom, vUv).rgb * uBloomGuc;
    c = aces(c * (1.05 + uFlas * 0.25));
    c *= mix(0.5, 1.0, 1.0 - smoothstep(0.3, 1.2, length(d) * 1.35));
    c += (h(vUv * 931.7 + uZaman) - 0.5) * 0.02;
    o = vec4(pow(c, vec3(1.0 / 2.2)), 1.0);
}`;

let acik = null;

/** Katmanı açar (zaten açıksa bir şey yapmaz). hafif: telefon ya da zayıf cihaz. */
export function kuantumAc({ hafif = false } = {}) {
    if (acik) return;
    acik = baslat(hafif);
}

function baslat(hafif) {
    const html = document.documentElement;
    const kap = document.createElement('div');
    kap.className = 'kq';
    kap.setAttribute('role', 'dialog');
    kap.setAttribute('aria-label', 'Vulu Kuantum');
    kap.innerHTML = `
        <canvas class="kq-tuval" aria-hidden="true"></canvas>
        <div class="kq-ust">
            <span class="kq-ad">VULU KUANTUM</span>
            <span class="kq-sayi" aria-hidden="true"></span>
            <button type="button" class="kq-btn kq-ses" aria-pressed="false">Sesi kapat</button>
            <button type="button" class="kq-btn kq-kapat">Kapat</button>
        </div>
        <p class="kq-ipucu">Sürükle · bırak · çift dokun</p>`;
    document.body.appendChild(kap);
    html.classList.add('kq-acik');
    requestAnimationFrame(() => kap.classList.add('gorunur'));

    const tuval = kap.querySelector('canvas');
    const sayiEl = kap.querySelector('.kq-sayi');
    const temizlikler = [];
    const dinle = (h, o, f, s) => { h.addEventListener(o, f, s); temizlikler.push(() => h.removeEventListener(o, f, s)); };
    let kapaniyor = false, raf = 0, muzik = null, gl = null;

    function kapat() {
        if (kapaniyor) return;
        kapaniyor = true;
        kap.classList.remove('gorunur');
        muzik?.durdur();
        setTimeout(() => {
            cancelAnimationFrame(raf);
            temizlikler.forEach(f => f());
            gl?.getExtension('WEBGL_lose_context')?.loseContext();
            kap.remove();
            html.classList.remove('kq-acik');
            acik = null;
        }, 450);
    }
    dinle(kap.querySelector('.kq-kapat'), 'click', kapat);
    dinle(window, 'keydown', e => { if (e.key === 'Escape') kapat(); });

    const hata = mesaj => { kap.classList.add('hata'); kap.querySelector('.kq-ipucu').textContent = mesaj; };

    gl = tuval.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', desynchronized: true });
    if (!gl) { hata('Bu cihaz WebGL 2 desteklemiyor.'); return { kapat }; }
    const tam32 = !!gl.getExtension('EXT_color_buffer_float');
    const yarim16 = tam32 || !!gl.getExtension('EXT_color_buffer_half_float');
    if (!yarim16) { hata('Bu cihazın ekran kartı gerekli dokuları desteklemiyor.'); return { kapat }; }
    const SIM_IC = tam32 ? gl.RGBA32F : gl.RGBA16F;

    /* ── kalite basamağı ── */
    const dokunmatik = matchMedia('(pointer: coarse)').matches;
    const cekirdek = navigator.hardwareConcurrency || 4, bellek = navigator.deviceMemory || 4;
    const GEN = hafif || dokunmatik ? 512 : 1024;
    const YUK = hafif || dokunmatik ? 256 : cekirdek >= 8 && bellek >= 8 ? 1024 : 512;
    const MIN_SATIR = 32;
    let aktif = Math.max(MIN_SATIR, Math.round(YUK * 0.25 / 8) * 8);   // dörtte birle başla, yöneticiyle tırman
    let cozOlcek = hafif || dokunmatik ? 0.5 : 0.62;     // parçacık tamponunun ekrana oranı
    const dpr = Math.min(devicePixelRatio || 1, hafif || dokunmatik ? 1.25 : 1.5);

    /* ── yardımcılar ── */
    function derle(tip, kaynak) {
        const s = gl.createShader(tip);
        gl.shaderSource(s, kaynak); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
    }
    function program(vs, fs) {
        const p = gl.createProgram();
        gl.attachShader(p, derle(gl.VERTEX_SHADER, vs)); gl.attachShader(p, derle(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        const yer = {};
        const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) { const ad = gl.getActiveUniform(p, i).name; yer[ad] = gl.getUniformLocation(p, ad); }
        return { p, u: yer };
    }
    function doku(w, h, ic, bicim, tip, veri = null, filtre = gl.NEAREST) {
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, ic, w, h, 0, bicim, tip, veri);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtre);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtre);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
    }
    function cerceve(...dokular) {
        const f = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        dokular.forEach((d, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, d, 0));
        gl.drawBuffers(dokular.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('çerçeve tamamlanamadı');
        return f;
    }
    const bagla = (birim, t) => { gl.activeTexture(gl.TEXTURE0 + birim); gl.bindTexture(gl.TEXTURE_2D, t); };

    let P;
    try {
        P = {
            sim: program(TAM_EKRAN_VS, SIM_FS),
            nokta: program(NOKTA_VS, NOKTA_FS),
            sifir: program(TAM_EKRAN_VS, SIFIR_FS),
            parlak: program(TAM_EKRAN_VS, ORNEKLE_FS(true)),
            kucult: program(TAM_EKRAN_VS, ORNEKLE_FS(false)),
            son: program(TAM_EKRAN_VS, SON_FS),
        };
    } catch (e) {
        hata('Shader derlenemedi.');
        console.error(e);
        return { kapat };
    }
    gl.bindVertexArray(gl.createVertexArray());

    /* ── parçacık durumu: başta merkezde sıkışık, dışarı fırlayan (açılış patlaması) ── */
    const n = GEN * YUK;
    const ilkP = new Float32Array(n * 4), ilkV = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
        const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        const r = Math.cbrt(Math.random()) * 0.12, hiz = 2 + Math.random() * 5;
        ilkP.set([Math.cos(a) * s * r, Math.sin(a) * s * r, u * r, 1], i * 4);
        ilkV.set([Math.cos(a) * s * hiz, Math.sin(a) * s * hiz, u * hiz, 1], i * 4);
    }
    const konum = [0, 1].map(() => doku(GEN, YUK, SIM_IC, gl.RGBA, gl.FLOAT, ilkP));
    const hiz = [0, 1].map(() => doku(GEN, YUK, SIM_IC, gl.RGBA, gl.FLOAT, ilkV));
    const simC = [0, 1].map(i => cerceve(konum[i], hiz[i]));
    let su = 0;   // şu anki durum (okunacak); yazılacak = 1 - su

    const sekilDokusu = doku(ORNEK, ORNEK * SEKIL_SAYISI, gl.RGBA32F, gl.RGBA, gl.FLOAT, null);
    sekilleriUret().then(veri => {
        if (kapaniyor) return;
        gl.bindTexture(gl.TEXTURE_2D, sekilDokusu);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, ORNEK, ORNEK * SEKIL_SAYISI, gl.RGBA, gl.FLOAT, veri);
        sekillerHazir = true;
    });
    let sekillerHazir = false;

    /* ── çizim tamponları (ekran boyutuna bağlı) ── */
    let T = null;
    function tamponlar() {
        if (T) { [T.acc, T.b1, T.b2, T.b3].forEach(t => gl.deleteTexture(t)); [T.accC, T.b1C, T.b2C, T.b3C].forEach(f => gl.deleteFramebuffer(f)); }
        const w = Math.max(64, Math.round(tuval.width * cozOlcek)), h = Math.max(64, Math.round(tuval.height * cozOlcek));
        const yap = (a, b) => doku(a, b, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, null, gl.LINEAR);
        const acc = yap(w, h), b1 = yap(w >> 1, h >> 1), b2 = yap(w >> 2, h >> 2), b3 = yap(w >> 3, h >> 3);
        T = { w, h, acc, b1, b2, b3, accC: cerceve(acc), b1C: cerceve(b1), b2C: cerceve(b2), b3C: cerceve(b3) };
        gl.bindFramebuffer(gl.FRAMEBUFFER, T.accC);
        gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    }
    function boyutla() {
        tuval.width = Math.round(innerWidth * dpr);
        tuval.height = Math.round(innerHeight * dpr);
        tamponlar();
    }
    boyutla();
    dinle(window, 'resize', boyutla);

    /* ── kamera ve etkileşim ── */
    const durum = {
        fareX: 0, fareY: 0, dunya: [0, 0, 0], surukle: false, fareGuc: 0, bicim: 0.0,
        sekilA: 0, sekilB: 0, karisim: 1, nabiz: 0, girdap: 0, flas: 0, sonTik: 0, sonSekil: 0,
    };
    const FOV = 55 * Math.PI / 180, MESAFE = 3.6;
    function fareGuncelle(e) {
        const x = (e.clientX / innerWidth) * 2 - 1, y = -((e.clientY / innerHeight) * 2 - 1);
        durum.fareX = x; durum.fareY = y;
        const tanY = Math.tan(FOV / 2) * MESAFE;
        durum.dunya = [x * tanY * (innerWidth / innerHeight), y * tanY, 0];
    }
    const sonrakiSekil = () => {
        durum.sekilA = durum.karisim >= 1 ? durum.sekilB : durum.sekilA;
        durum.sekilB = (durum.sekilB + 1) % SEKIL_SAYISI;
        durum.karisim = 0;
    };
    dinle(tuval, 'pointerdown', e => {
        tuval.setPointerCapture(e.pointerId);
        fareGuncelle(e);
        durum.surukle = true;
        const s = performance.now();
        if (s - durum.sonTik < 320) { durum.nabiz += 2.6; durum.flas = 1; sonrakiSekil(); }
        durum.sonTik = s;
        if (muzik && !muzikBasladi) sesiBaslat();
    });
    dinle(tuval, 'pointermove', fareGuncelle);
    const birak = () => { durum.surukle = false; };
    dinle(tuval, 'pointerup', birak);
    dinle(tuval, 'pointercancel', birak);
    dinle(window, 'pointerup', () => { if (muzik && !muzikBasladi) sesiBaslat(); });

    /* ── müzik: dokunmatikte ses ancak bir dokunuş bırakılınca açılabilir; o zamana kadar şekiller saatle değişir ── */
    muzik = kuantumMuzigi();
    let muzikBasladi = false;
    function sesiBaslat() {
        muzik.baslat();
        muzikBasladi = true;
    }
    sesiBaslat();
    const sesBtn = kap.querySelector('.kq-ses');
    dinle(sesBtn, 'click', () => {
        const sessiz = !muzik.sessiz;
        muzik.sustur(sessiz);
        sesBtn.setAttribute('aria-pressed', String(sessiz));
        sesBtn.textContent = sessiz ? 'Sesi aç' : 'Sesi kapat';
    });

    /* ── matris yardımcıları ── */
    function mvp(aci, egim, en) {
        const f = 1 / Math.tan(FOV / 2), yakin = 0.1, uzak = 50;
        const proj = [f / en, 0, 0, 0, 0, f, 0, 0, 0, 0, (uzak + yakin) / (yakin - uzak), -1, 0, 0, (2 * uzak * yakin) / (yakin - uzak), 0];
        const g = [Math.sin(aci) * MESAFE * Math.cos(egim), Math.sin(egim) * MESAFE, Math.cos(aci) * MESAFE * Math.cos(egim)];
        const z = norm(g), x = norm(capraz([0, 1, 0], z)), y = capraz(z, x);
        const gor = [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -nokta(x, g), -nokta(y, g), -nokta(z, g), 1];
        return carp(proj, gor);
    }
    const norm = v => { const l = Math.hypot(...v); return v.map(a => a / l); };
    const capraz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const nokta = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    function carp(a, b) {
        const o = new Float32Array(16);
        for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
            let s = 0;
            for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
            o[c * 4 + r] = s;
        }
        return o;
    }

    /* ── kare süresi yöneticisi ── */
    const yonet = { kareler: [], taban: 0, sonDegisim: 0, ornekler: [] };
    function kaliteyiAyarla(dtMs, simdi) {
        // acil durum: tek bir kare bile çok uzun sürdüyse (ör. zayıf cihazda ilk kareler) beklemeden hemen düş
        if (dtMs > 60 && simdi - yonet.sonDegisim > 120) {
            if (aktif > MIN_SATIR) aktif = Math.max(MIN_SATIR, Math.floor(aktif * 0.5 / 8) * 8);
            else if (cozOlcek > 0.36) { cozOlcek = Math.max(0.36, cozOlcek - 0.08); tamponlar(); }
            yonet.sonDegisim = simdi;
            yonet.kareler = [];
            sayiEl.textContent = `${Math.round(GEN * aktif / 1000)}K parçacık`;
            return;
        }
        yonet.kareler.push(dtMs);
        if (!yonet.taban) {
            if (yonet.kareler.length < 24) return;
            const s = [...yonet.kareler].sort((a, b) => a - b);
            yonet.taban = Math.max(6, s[Math.floor(s.length * 0.25)]);   // ekranın yenilenme aralığı (≈16,7 ya da 8,3 ms)
            yonet.kareler = [];
            return;
        }
        if (yonet.kareler.length < 20) return;
        const ort = yonet.kareler.reduce((a, b) => a + b, 0) / yonet.kareler.length;
        yonet.kareler = [];
        if (ort > yonet.taban * 1.28) {
            if (aktif > MIN_SATIR) aktif = Math.max(MIN_SATIR, Math.floor(aktif * 0.72 / 8) * 8);
            else if (cozOlcek > 0.36) { cozOlcek = Math.max(0.36, cozOlcek - 0.08); tamponlar(); }
            yonet.sonDegisim = simdi;
        } else if (ort < yonet.taban * 1.08 && simdi - yonet.sonDegisim > 1800 && aktif < YUK) {
            aktif = Math.min(YUK, aktif + Math.max(8, Math.floor(aktif * 0.15 / 8) * 8));
            yonet.sonDegisim = simdi;
        }
        sayiEl.textContent = `${Math.round(GEN * aktif / 1000)}K parçacık`;
    }

    /* ── döngü ── */
    const t0 = performance.now();
    let onceki = t0, sonSekilSaati = t0;
    const en = () => tuval.width / tuval.height;

    function kare(simdi) {
        raf = requestAnimationFrame(kare);
        if (document.hidden || kapaniyor) { onceki = simdi; return; }
        const dtMs = simdi - onceki;
        onceki = simdi;
        const dt = Math.min(0.033, dtMs / 1000), t = (simdi - t0) / 1000;
        kaliteyiAyarla(dtMs, simdi);

        // müzik olayları
        if (muzikBasladi) {
            const at = muzik.simdi(), q = muzik.olaylar;
            while (q.length && q[0].t <= at) {
                const o = q.shift();
                if (o.tur === 'kick') { durum.nabiz += 0.22; durum.flas = Math.max(durum.flas, 0.35); }
                else if (o.tur === 'clap') durum.girdap += 0.5;
                else if (o.tur === 'sekil' && sekillerHazir && !durum.surukle) { sonrakiSekil(); sonSekilSaati = simdi; }
                else if (o.tur === 'buyuk') { durum.nabiz += 1.3; durum.flas = 1; }
            }
        }
        if (sekillerHazir && simdi - sonSekilSaati > 3750 * 1.6 && !durum.surukle) { sonrakiSekil(); sonSekilSaati = simdi; }   // ses yoksa

        durum.bicim += ((sekillerHazir && !durum.surukle ? 1 : 0.04) - durum.bicim) * Math.min(1, dt * (durum.surukle ? 6 : 1.6));
        durum.fareGuc += ((durum.surukle ? 1 : 0) - durum.fareGuc) * Math.min(1, dt * 8);
        durum.karisim = Math.min(1, durum.karisim + dt / 1.4);
        durum.nabiz *= Math.exp(-dt * 9);
        durum.girdap *= Math.exp(-dt * 3);
        durum.flas *= Math.exp(-dt * 6);
        const olcek = Math.min(1, en() * 0.9);

        // 1) simülasyon
        gl.disable(gl.BLEND);
        gl.bindFramebuffer(gl.FRAMEBUFFER, simC[1 - su]);
        gl.viewport(0, 0, GEN, aktif);
        const S = P.sim;
        gl.useProgram(S.p);
        bagla(0, konum[su]); bagla(1, hiz[su]); bagla(2, sekilDokusu);
        gl.uniform1i(S.u.uPos, 0); gl.uniform1i(S.u.uVel, 1); gl.uniform1i(S.u.uSekil, 2);
        gl.uniform1f(S.u.uZaman, t); gl.uniform1f(S.u.uDt, dt);
        gl.uniform1f(S.u.uBicim, durum.bicim); gl.uniform1f(S.u.uKarisim, durum.karisim);
        gl.uniform1f(S.u.uNabiz, durum.nabiz); gl.uniform1f(S.u.uGirdap, durum.girdap);
        gl.uniform1f(S.u.uFareGuc, durum.fareGuc); gl.uniform1f(S.u.uOlcek, olcek);
        gl.uniform1i(S.u.uSekilA, durum.sekilA); gl.uniform1i(S.u.uSekilB, durum.sekilB); gl.uniform1i(S.u.uGen, GEN);
        gl.uniform3fv(S.u.uFare, durum.dunya);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        su = 1 - su;

        // 2) parçacıklar: iz için tampon biraz söner, üstüne toplanarak çizilir
        gl.bindFramebuffer(gl.FRAMEBUFFER, T.accC);
        gl.viewport(0, 0, T.w, T.h);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ZERO, gl.CONSTANT_ALPHA);
        gl.blendColor(0, 0, 0, Math.pow(0.74, dt * 60));
        gl.useProgram(P.sifir.p);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.blendFunc(gl.ONE, gl.ONE);
        const N = P.nokta, adet = GEN * aktif;
        gl.useProgram(N.p);
        bagla(0, konum[su]); bagla(1, hiz[su]);
        gl.uniform1i(N.u.uPos, 0); gl.uniform1i(N.u.uVel, 1); gl.uniform1i(N.u.uGen, GEN);
        const aci = Math.sin(t * 0.15) * 0.35 + (durum.surukle ? 0 : durum.fareX * 0.25), egim = 0.08 + (durum.surukle ? 0 : durum.fareY * 0.2);
        gl.uniformMatrix4fv(N.u.uMVP, false, mvp(aci, egim, en()));
        gl.uniform1f(N.u.uNokta, 2.6 * (T.h / 700));
        // toplam ışık parçacık sayısından ve tamponun boyundan bağımsız kalsın
        gl.uniform1f(N.u.uParlak, Math.min(1, 0.12 * Math.pow(65536 / adet, 0.6) * Math.pow(T.h / 560, 1.1)));
        gl.uniform1f(N.u.uFlas, durum.flas * 0.6);
        gl.drawArrays(gl.POINTS, 0, adet);

        // 3) bloom: parlak kısımlar 1/2 → 1/4 → 1/8, sonra geri toplanarak büyür
        gl.disable(gl.BLEND);
        const gec = (prog, kaynak, kw, kh, hedefC, hw, hh) => {
            gl.bindFramebuffer(gl.FRAMEBUFFER, hedefC);
            gl.viewport(0, 0, hw, hh);
            gl.useProgram(prog.p);
            bagla(0, kaynak);
            gl.uniform1i(prog.u.uKaynak, 0);
            gl.uniform2f(prog.u.uTexel, 1 / kw, 1 / kh);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };
        gec(P.parlak, T.acc, T.w, T.h, T.b1C, T.w >> 1, T.h >> 1);
        gec(P.kucult, T.b1, T.w >> 1, T.h >> 1, T.b2C, T.w >> 2, T.h >> 2);
        gec(P.kucult, T.b2, T.w >> 2, T.h >> 2, T.b3C, T.w >> 3, T.h >> 3);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gec(P.kucult, T.b3, T.w >> 3, T.h >> 3, T.b2C, T.w >> 2, T.h >> 2);
        gec(P.kucult, T.b2, T.w >> 2, T.h >> 2, T.b1C, T.w >> 1, T.h >> 1);
        gl.disable(gl.BLEND);

        // 4) ekrana: ton eşleme, vinyet, gren
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, tuval.width, tuval.height);
        const Sn = P.son;
        gl.useProgram(Sn.p);
        bagla(0, T.acc); bagla(1, T.b1);
        gl.uniform1i(Sn.u.uAcc, 0); gl.uniform1i(Sn.u.uBloom, 1);
        gl.uniform1f(Sn.u.uBloomGuc, 0.9); gl.uniform1f(Sn.u.uZaman, t); gl.uniform1f(Sn.u.uFlas, durum.flas);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(kare);
    setTimeout(() => kap.querySelector('.kq-ipucu')?.classList.add('sondu'), 5500);

    return { kapat };
}

/* ── şekiller: her biri 65 536 hedef nokta (x, y, z) ─────────────────────────────── */

async function sekilleriUret() {
    const veri = new Float32Array(ORNEK * ORNEK * SEKIL_SAYISI * 4);
    const yaz = (s, i, x, y, z) => veri.set([x, y, z, 1], (s * ORNEK * ORNEK + i) * 4);
    const ADET = ORNEK * ORNEK;

    // 2D bir çizimden: dolu piksellerden rastgele örnek, piksel içinde sapma, ince bir derinlik
    const cizimden = (s, ciz, boyut = 2.7, esik = 200) => {
        const c = document.createElement('canvas');
        c.width = c.height = 512;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.fillStyle = '#fff'; g.strokeStyle = '#fff';
        ciz(g);
        const d = g.getImageData(0, 0, 512, 512).data;
        const dolu = [];
        for (let i = 0; i < 512 * 512; i++) if (d[i * 4 + 3] > 120 && d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2] > esik) dolu.push(i);
        if (!dolu.length) dolu.push(256 * 512 + 256);
        for (let i = 0; i < ADET; i++) {
            const p = dolu[(Math.random() * dolu.length) | 0];
            const x = (p % 512 + Math.random()) / 512 - 0.5, y = Math.floor(p / 512 + Math.random()) / 512 - 0.5;
            yaz(s, i, x * boyut, -y * boyut, (Math.random() - 0.5) * 0.16);
        }
    };

    // 0: VL logosu (V ile L bitişik): siyah kutunun içindeki kahverengi ve bej harfler; kutu ve çerçeve eşiğin altında kalır
    const logo = await new Promise(coz => {
        const im = new Image();
        im.onload = () => coz(im); im.onerror = () => coz(null);
        im.src = asset('img/logo.svg');
    });
    cizimden(0, g => {
        if (logo) g.drawImage(logo, 36, 36, 440, 440);
        else { g.font = '900 260px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('VL', 256, 270); }
    }, 3.0, 200);

    // 1: VULU yazısı
    try { await Promise.race([document.fonts.load('900 150px Orbitron'), new Promise(r => setTimeout(r, 700))]); } catch { /* yedek */ }
    cizimden(1, g => {
        g.font = '900 150px Orbitron, "Russo One", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('VULU', 256, 262, 490);
    }, 3.3);

    // 2: piksel kazma (kendi çizimimiz: 16×16)
    const KAZMA = [
        '................',
        '....#######.....',
        '..###.....###...',
        '.##.........##..',
        '.#....##.....#..',
        '......##........',
        '.....##.........',
        '.....##.........',
        '....##..........',
        '....##..........',
        '...##...........',
        '...##...........',
        '..##............',
        '..##............',
        '.##.............',
        '................',
    ];
    cizimden(2, g => {
        KAZMA.forEach((satir, y) => [...satir].forEach((h, x) => { if (h === '#') g.fillRect(48 + x * 26, 48 + y * 26, 26, 26); }));
    }, 2.5);

    // 3: küre (Fibonacci, ince kabuk)
    for (let i = 0; i < ADET; i++) {
        const y = 1 - (i / (ADET - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963;
        const k = 1.05 + (Math.random() - 0.5) * 0.05;
        yaz(3, i, Math.cos(a) * r * k, y * k, Math.sin(a) * r * k);
    }

    // 4: galaksi (üç kollu sarmal, eğik disk, parlak merkez)
    for (let i = 0; i < ADET; i++) {
        const kol = i % 3, merkez = Math.random() < 0.18;
        const r = merkez ? Math.pow(Math.random(), 2) * 0.35 : 0.2 + Math.pow(Math.random(), 0.7) * 1.25;
        const a = r * 4.2 + kol * 2.094 + (Math.random() - 0.5) * (merkez ? 6.3 : 0.5);
        const kal = (Math.random() - 0.5) * 0.08 * (1.6 - r);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        yaz(4, i, x, z * 0.45 + kal, z * 0.85);
    }
    return veri;
}
