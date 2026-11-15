// Profildeki dönen 3B karakter (three.js). Skin ve (varsa) vulu Pelerini dokusundan Minecraft modelini kurar:
// baş, gövde, kollar, bacaklar, ikinci katman ve pelerin. Kendiliğinden döner, sürükleyerek çevrilir; görünmezken çizmez.
import * as THREE from 'three';

const SLIM = 3, WIDE = 4;

/** Kutu: w×h×d (doku pikseli), dokudaki açılımın sol üstü (u,v). Yüz sırası three.js'inki: +x, -x, +y, -y, +z, -z. */
function box(w, h, d, u, v, texW, texH, inflate = 0, cape = false) {
    const g = new THREE.BoxGeometry(w + inflate * 2, h + inflate * 2, d + inflate * 2);
    const rect = (x, y, rw, rh) => [x / texW, 1 - y / texH, (x + rw) / texW, 1 - (y + rh) / texH];
    const right = rect(u, v + d, d, h), front = rect(u + d, v + d, w, h), left = rect(u + d + w, v + d, d, h);
    const back = rect(u + d * 2 + w, v + d, w, h), top = rect(u + d, v, w, d), bottom = rect(u + d + w, v, w, d);
    // Pelerinin dış yüzü (1,1) karakterin arkasına bakar
    const faces = cape ? [left, right, top, bottom, back, front] : [left, right, top, bottom, front, back];
    const uv = g.attributes.uv;
    faces.forEach(([u0, v0, u1, v1], f) => {
        uv.setXY(f * 4 + 0, u0, v0);
        uv.setXY(f * 4 + 1, u1, v0);
        uv.setXY(f * 4 + 2, u0, v1);
        uv.setXY(f * 4 + 3, u1, v1);
    });
    uv.needsUpdate = true;
    return g;
}

function loadTexture(url) {
    return new Promise((resolve, reject) => {
        if (!url) return resolve(null);
        new THREE.TextureLoader().setCrossOrigin('anonymous').load(url, t => {
            t.magFilter = THREE.NearestFilter;
            t.minFilter = THREE.NearestFilter;
            t.colorSpace = THREE.SRGBColorSpace;
            t.generateMipmaps = false;
            resolve(t);
        }, undefined, reject);
    });
}

/** Skin yokken: düz renkli basit bir karakter (dosya gerektirmez). */
function defaultSkin() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const x = c.getContext('2d');
    const fill = (col, ...r) => { x.fillStyle = col; x.fillRect(...r); };
    fill('#b4846c', 0, 0, 32, 16); fill('#2a1d10', 8, 0, 16, 8); fill('#2a1d10', 0, 8, 32, 2);
    fill('#fff', 9, 12, 2, 1); fill('#fff', 13, 12, 2, 1); fill('#4a3a8f', 10, 12, 1, 1); fill('#4a3a8f', 13, 12, 1, 1);
    fill('#2fa3a8', 16, 16, 24, 16); fill('#b4846c', 40, 16, 16, 16); fill('#2fa3a8', 40, 16, 16, 8);
    fill('#3b3a8f', 0, 16, 16, 16); fill('#b4846c', 32, 48, 16, 16); fill('#2fa3a8', 32, 48, 16, 8); fill('#3b3a8f', 16, 48, 16, 16);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

/**
 * canvas'a karakteri çizer. Dönen fonksiyon her şeyi kapatır (bileşen kaldırılınca).
 * @param {{ skinUrl?: string, capeUrl?: string, slim?: boolean }} opts
 */
export async function mountSkin(canvas, { skinUrl, capeUrl, slim }) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 1, 200);
    camera.position.set(0, 8, 92);
    camera.lookAt(0, 0, 0);

    const [skinTex, capeTex] = await Promise.all([
        loadTexture(skinUrl).catch(() => null),
        loadTexture(capeUrl).catch(() => null),
    ]);
    const skin = skinTex || defaultSkin();
    const legacy = skin.image && skin.image.height === 32;
    const texH = legacy ? 32 : 64;
    const arm = slim ? SLIM : WIDE;

    const base = new THREE.MeshBasicMaterial({ map: skin, alphaTest: 0.5 });
    const layer = new THREE.MeshBasicMaterial({ map: skin, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide, depthWrite: false });
    const geometries = [];
    const mesh = (geo, mat) => { geometries.push(geo); return new THREE.Mesh(geo, mat); };

    const model = new THREE.Group();
    scene.add(model);

    /** Bir parça: kendi dönme noktasında bir grup; ızgara (ayaklar y=0) yerine modelin ortası y=16'da. */
    function part(pivot, offset, w, h, d, uv, layerUv) {
        const g = new THREE.Group();
        g.position.set(pivot[0], pivot[1] - 16, pivot[2]);
        const m = mesh(box(w, h, d, uv[0], uv[1], 64, texH), base);
        m.position.set(...offset);
        g.add(m);
        if (layerUv && !legacy) {
            const l = mesh(box(w, h, d, layerUv[0], layerUv[1], 64, texH, w === 8 && h === 8 ? 0.5 : 0.25), layer);
            l.position.set(...offset);
            g.add(l);
        }
        model.add(g);
        return g;
    }

    const head = part([0, 24, 0], [0, 4, 0], 8, 8, 8, [0, 0], null);
    // Şapka katmanı eski skinlerde de var
    const hat = mesh(box(8, 8, 8, 32, 0, 64, texH, 0.5), layer);
    hat.position.set(0, 4, 0);
    head.add(hat);
    part([0, 24, 0], [0, -6, 0], 8, 12, 4, [16, 16], [16, 32]);
    const rightArm = part([-4 - arm / 2, 22, 0], [0, -4, 0], arm, 12, 4, [40, 16], [40, 32]);
    const leftArm = part([4 + arm / 2, 22, 0], [0, -4, 0], arm, 12, 4, legacy ? [40, 16] : [32, 48], [48, 48]);
    const rightLeg = part([-2, 12, 0], [0, -6, 0], 4, 12, 4, [0, 16], [0, 32]);
    const leftLeg = part([2, 12, 0], [0, -6, 0], 4, 12, 4, legacy ? [0, 16] : [16, 48], [0, 48]);

    let cape = null;
    if (capeTex) {
        const capeMat = new THREE.MeshBasicMaterial({ map: capeTex, alphaTest: 0.5 });
        cape = new THREE.Group();
        cape.position.set(0, 24 - 16, -2.6);
        const m = mesh(box(10, 16, 1, 0, 0, 64, 32, 0, true), capeMat);
        m.position.set(0, -8, 0);
        cape.add(m);
        model.add(cape);
    }

    // Etkileşim: sürükleyince döner, bırakınca 2 sn sonra kendiliğinden döner
    let yaw = -0.5, dragging = false, lastX = 0, lastDrag = 0;
    const down = e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture?.(e.pointerId); };
    const move = e => { if (!dragging) return; yaw += (e.clientX - lastX) * 0.012; lastX = e.clientX; lastDrag = performance.now(); };
    const up = () => { dragging = false; lastDrag = performance.now(); };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    function resize() {
        const w = canvas.clientWidth || 200, h = canvas.clientHeight || 300;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let frame = 0, last = performance.now(), t = 0;
    function tick(now) {
        frame = requestAnimationFrame(tick);
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        if (!visible || document.hidden) return;
        t += dt;
        if (!dragging && now - lastDrag > 2000 && !reduced) yaw += dt * 0.55;
        model.rotation.y = yaw;
        const swing = reduced ? 0 : Math.sin(t * 2.2) * 0.18;
        rightArm.rotation.x = swing; leftArm.rotation.x = -swing;
        rightLeg.rotation.x = -swing; leftLeg.rotation.x = swing;
        if (cape) cape.rotation.x = 0.12 + (reduced ? 0 : Math.sin(t * 1.6) * 0.04);
        renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(tick);

    return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        io.disconnect();
        canvas.removeEventListener('pointerdown', down);
        canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', up);
        canvas.removeEventListener('pointercancel', up);
        geometries.forEach(g => g.dispose());
        [base, layer].forEach(m => m.dispose());
        [skinTex, capeTex].forEach(tx => tx && tx.dispose());
        renderer.dispose();
    };
}
