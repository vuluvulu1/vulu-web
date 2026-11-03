// Neon synthwave dünyası (three.js): "Olay Ufku" geçişinin son sahnesi ve ardından açılan /vulusalufuk
// sayfasının arka planı aynı dünyayı kullanır, geçişten sayfaya kesintisiz geçilir.
//   gökyüzü (ufukta pembe, tepede gece), sonsuz neon ızgara zemin ve üstünde güneşin yansıması, şeritli retro güneş ve
//   halesi, iki yanda wireframe neon dağlar (z yönünde tekrar eden gürültüyle, iki parça birbirinin önüne atlar: kamera
//   istediği kadar ileri gidebilir), yıldızlar, sis.
// Ayrıca son işleme lensi: radyal hız bulanıklığı, renk kırılması, vinyet, film greni, beyaz / siyah perde.

import * as THREE from 'three';

export const UV_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

/** Son işleme: radyal hız bulanıklığı + renk kırılması, vinyet, film greni, beyaz / siyah perde. defines.ADIM gerekir. */
export const LENS = {
    uniforms: {
        tDiffuse: { value: null }, uMerkez: { value: new THREE.Vector2(0.5, 0.5) },
        uKirilma: { value: 0 }, uBulanik: { value: 0 }, uGren: { value: 0 }, uVinyet: { value: 0 },
        uBeyaz: { value: 0 }, uSiyah: { value: 0 }, uZaman: { value: 0 },
    },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform vec2 uMerkez;
    uniform float uKirilma, uBulanik, uGren, uVinyet, uBeyaz, uSiyah, uZaman;
    varying vec2 vUv;
    float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
        vec2 d = vUv - uMerkez;
        vec3 c = vec3(0.0);
        for (int i = 0; i < ADIM; i++) {
            float k = 1.0 - uBulanik * 0.22 * float(i) / float(ADIM);
            c.r += texture2D(tDiffuse, uMerkez + d * k * (1.0 + uKirilma)).r;
            c.g += texture2D(tDiffuse, uMerkez + d * k).g;
            c.b += texture2D(tDiffuse, uMerkez + d * k * (1.0 - uKirilma)).b;
        }
        c /= float(ADIM);
        c *= mix(1.0, 1.0 - smoothstep(0.25, 1.25, length(d * vec2(1.0, 0.85)) * 1.45), uVinyet);
        c += (h(vUv * 1000.0 + uZaman) - 0.5) * uGren;
        c = mix(c, vec3(1.0), uBeyaz);
        c = mix(c, vec3(0.0), uSiyah);
        gl_FragColor = vec4(c, 1.0);
    }`,
};

const ZEMIN_VERT = /* glsl */`
varying vec3 vDunya;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vDunya = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

/** Neon ızgara zemin: kenarı yumuşatılmış çizgiler, yakında cyan uzakta pembe, ortada güneşin yansıması, sis. */
const ZEMIN_FRAG = /* glsl */`
uniform vec3 uKamera;
uniform float uParla, uUzay;
varying vec3 vDunya;
void main() {
    vec2 k = vDunya.xz / 4.0;
    vec2 g = abs(fract(k - 0.5) - 0.5) / fwidth(k);
    float cizgi = 1.0 - min(min(g.x, g.y), 1.0);
    float uzak = length(vDunya.xz - uKamera.xz);
    float sis = exp(-uzak * 0.011);
    vec3 renk = mix(vec3(0.0, 0.85, 1.0), vec3(1.0, 0.16, 0.92), smoothstep(10.0, 150.0, uzak));
    vec3 c = vec3(0.02, 0.0, 0.05) + renk * cizgi * 1.8 * uParla * (0.3 + 0.7 * sis);
    float yans = exp(-pow((vDunya.x - uKamera.x) / 7.0, 2.0)) * smoothstep(15.0, 170.0, uzak);
    c += vec3(1.0, 0.35, 0.55) * yans * 0.7;
    c = mix(vec3(0.09, 0.0, 0.16), c, sis * 0.85 + 0.15);
    gl_FragColor = vec4(c * (1.0 - uUzay * 0.95), 1.0);
}`;

/** Retro güneş: üstte sarı altta pembe, alt yarıda aşağı kayan ve aşağı doğru kalınlaşan boşluklar. */
const GUNES_FRAG = /* glsl */`
uniform float uZaman, uBeyaz;
varying vec2 vUv;
void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    vec3 c = mix(vec3(1.0, 0.08, 0.6), vec3(1.0, 0.82, 0.25), smoothstep(-0.9, 0.85, p.y)) * 0.95;
    c = mix(c, vec3(1.5, 1.4, 1.6), uBeyaz);                       // beyaz delik: soğudukça rengi gelir
    if (p.y < 0.2) {
        float f = fract((p.y + uZaman * 0.07) * 9.0);
        float kalin = mix(0.04, 0.6, smoothstep(0.2, -1.0, p.y)) * (1.0 - uBeyaz);   // şeritler de soğurken açılır
        if (f < kalin) discard;
    }
    gl_FragColor = vec4(c, 1.0);
}`;

const GOK_FRAG = /* glsl */`
uniform float uKizil, uUzay;
varying vec3 vYon;
void main() {
    float y = normalize(vYon).y;
    vec3 ufuk = mix(vec3(0.55, 0.05, 0.45), vec3(0.75, 0.12, 0.3), uKizil), orta = vec3(0.12, 0.0, 0.24), tepe = vec3(0.0, 0.0, 0.02);
    vec3 c = y < 0.0 ? ufuk * 0.5 : mix(mix(ufuk, orta, smoothstep(0.0, 0.18, y)), tepe, smoothstep(0.18, 0.7, y));
    vec3 uzay = vec3(0.01, 0.0, 0.03) + vec3(0.08, 0.0, 0.12) * exp(-abs(y) * 6.0);   // derin uzay: neredeyse siyah
    gl_FragColor = vec4(mix(c, uzay, uUzay), 1.0);
}`;

const DAG_BOY = 900;                 // bir dağ parçasının boyu; gürültü bu boyda kendini tekrar eder

/** Dağ yüksekliği: ortada vadi, iki yanda tepeler. Gürültü z'de DAG_BOY ile tekrar eder (parçalar dikişsiz birleşsin). */
function dagYuksekligi(x, z) {
    const h = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    const n = (a, b, devir) => {
        const i = Math.floor(a), j = Math.floor(b), f = a - i, g = b - j, u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
        const j0 = ((j % devir) + devir) % devir, j1 = (j0 + 1) % devir;
        return (h(i, j0) * (1 - u) + h(i + 1, j0) * u) * (1 - v) + (h(i, j1) * (1 - u) + h(i + 1, j1) * u) * v;
    };
    const vadi = Math.min(1, Math.max(0, (Math.abs(x) - 22) / 50));
    return (n(x * 0.04, z * 0.04, DAG_BOY * 0.04) * 0.65 + n(x * 0.1, z * 0.1, DAG_BOY * 0.1) * 0.35) * 42 * vadi * vadi;
}

/**
 * Dünyayı kurar. guncelle({ t, gunesY, parla, kizil }) her karede çağrılır: zemin, gökyüzü, yıldızlar ve güneş kameraya
 * göre yerleşir, dağ parçaları kameranın arkasında kalınca öne atlar. Kamerayı çağıran hareket ettirir.
 */
export function synthDunyasi({ hafif, W, H }) {
    const sahne = new THREE.Scene();
    sahne.fog = new THREE.FogExp2(0x16002e, 0.0065);
    const kamera = new THREE.PerspectiveCamera(72, W / H, 0.1, 3000);
    kamera.position.set(0, 2.2, 0);
    kamera.rotation.x = -0.035;
    sahne.add(kamera);

    const gokMat = new THREE.ShaderMaterial({
        uniforms: { uKizil: { value: 0 }, uUzay: { value: 0 } },
        vertexShader: `varying vec3 vYon; void main() { vYon = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: GOK_FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
    });
    const gok = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), gokMat);
    sahne.add(gok);

    const zeminMat = new THREE.ShaderMaterial({
        uniforms: { uKamera: { value: kamera.position }, uParla: { value: 1 }, uUzay: { value: 0 } },
        vertexShader: ZEMIN_VERT, fragmentShader: ZEMIN_FRAG,
    });
    const zemin = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), zeminMat);
    zemin.rotation.x = -Math.PI / 2;
    sahne.add(zemin);

    const gunesMat = new THREE.ShaderMaterial({ uniforms: { uZaman: { value: 0 }, uBeyaz: { value: 0 } }, vertexShader: UV_VERT, fragmentShader: GUNES_FRAG, fog: false });
    const gunes = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), gunesMat);
    sahne.add(gunes);
    const haleMat = new THREE.ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: `varying vec2 vUv; void main() { float r = length(vUv * 2.0 - 1.0); gl_FragColor = vec4(vec3(1.0, 0.2, 0.7), pow(max(0.0, 1.0 - r), 2.6) * 0.28); }`,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    });
    const hale = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), haleMat);
    sahne.add(hale);
    const SIS_SYNTH = new THREE.Color(0x16002e), SIS_UZAY = new THREE.Color(0x020006);

    // dağlar: iki parça, kamera ilerledikçe arkada kalan öne atlar
    const dagGeo = new THREE.PlaneGeometry(700, DAG_BOY, hafif ? 70 : 120, hafif ? 60 : 100);
    dagGeo.rotateX(-Math.PI / 2);
    const konum = dagGeo.attributes.position;
    for (let i = 0; i < konum.count; i++) konum.setY(i, dagYuksekligi(konum.getX(i), konum.getZ(i) + DAG_BOY / 2));
    const dagMat = new THREE.MeshBasicMaterial({ color: 0x07000f, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const telGeo = new THREE.WireframeGeometry(dagGeo);
    const telMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0.0, 0.9, 1.6), transparent: true, opacity: 0.55 });
    const daglar = [0, 1].map(k => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(dagGeo, dagMat), new THREE.LineSegments(telGeo, telMat));
        g.position.set(0, -0.05, -DAG_BOY / 2 - k * DAG_BOY + 50);
        sahne.add(g);
        return g;
    });

    // yıldızlar
    const yildizSayi = hafif ? 700 : 1600;
    const yp = new Float32Array(yildizSayi * 3);
    for (let i = 0; i < yildizSayi; i++) {
        const a = Math.random() * Math.PI * 2, e = Math.acos(0.05 + Math.random() * 0.95), r = 1200;
        yp.set([Math.cos(a) * Math.sin(e) * r, Math.cos(e) * r, Math.sin(a) * Math.sin(e) * r], i * 3);
    }
    const yildizGeo = new THREE.BufferGeometry();
    yildizGeo.setAttribute('position', new THREE.BufferAttribute(yp, 3));
    const yildizlar = new THREE.Points(yildizGeo, new THREE.PointsMaterial({ color: 0xffffff, size: hafif ? 1.6 : 2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 }));
    sahne.add(yildizlar);

    return {
        sahne, kamera, zeminMat,
        /**
         * uzay (0–1): dünyanın ne kadar derin uzay gibi göründüğü (Olay Ufku'nda tünelden çıkarken 1'den 0'a iner):
         * gökyüzü kararır, zemin ve sis söner, dağ telleri görünmez. gunesBeyaz / gunesOlcek: güneşin beyaz delik hâli.
         * gunesUstte: güneş zeminin arkasında kalmasın (tünelin sonundaki ışık bütün bir daire görünsün).
         */
        guncelle({ t, gunesY = 36, parla = 1, kizil = 0, uzay = 0, gunesBeyaz = 0, gunesOlcek = 1, gunesUstte = false }) {
            const k = kamera.position;
            zemin.position.set(k.x, 0, k.z);
            gok.position.copy(k);
            yildizlar.position.copy(k);
            gunes.position.set(0, gunesY, k.z - 420);
            hale.position.set(0, gunesY, k.z - 430);
            gunes.scale.setScalar(gunesOlcek);
            hale.scale.setScalar(0.6 + gunesOlcek * 0.4);
            gunesMat.uniforms.uZaman.value = t;
            gunesMat.uniforms.uBeyaz.value = gunesBeyaz;
            gunesMat.depthTest = haleMat.depthTest = !gunesUstte;
            gunes.renderOrder = hale.renderOrder = gunesUstte ? 10 : 0;
            zeminMat.uniforms.uParla.value = parla;
            zeminMat.uniforms.uUzay.value = uzay;
            gokMat.uniforms.uKizil.value = kizil;
            gokMat.uniforms.uUzay.value = uzay;
            sahne.fog.color.copy(SIS_SYNTH).lerp(SIS_UZAY, uzay);
            telMat.opacity = 0.55 * (1 - uzay);
            for (const d of daglar) {
                if (d.position.z - DAG_BOY / 2 > k.z + 60) d.position.z -= DAG_BOY * 2;
            }
        },
        boyutla(w, h) { kamera.aspect = w / h; kamera.updateProjectionMatrix(); },
    };
}

/** Bir sahnedeki geometri ve malzemeleri bırakır (paylaşılanlar bir kez). */
export function birak(sahne) {
    const gorulen = new Set();
    sahne.traverse(o => {
        for (const x of [o.geometry, o.material]) if (x && !gorulen.has(x)) { gorulen.add(x); x.dispose(); }
    });
}
