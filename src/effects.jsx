import { useEffect, useRef } from 'react';
import { reducedMotion } from './motion.jsx';

// Sitenin ışık dili. Tek bir imleç dinleyicisi üç şeyi sürer:
//   - meşale: imlecin çevresini sayfa boyunca hafifçe aydınlatan sıcak ışık (--cx/--cy, :root),
//   - ışıklı kenar: imlecin altındaki kartın kenarı imlece doğru yanar (--sx/--sy, SPOT_SELECTOR),
//   - eğim: [data-tilt] öğeler imlece doğru hafifçe döner (--rx/--ry, --gx/--gy parlama).
// Yalnızca fareli cihazlarda ve "hareketi azalt" kapalıyken çalışır.

export const SPOT_SELECTOR = '.panel, .rail-card, .post, .pf-section, .pf-hero, .tool, .join, .card, .feedback-item, .auth-card, .inbox, .share, .pack-tile, .numbers, .announcement, .product-card';

export function usePointerLight() {
    useEffect(() => {
        if (reducedMotion() || !window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
        const root = document.documentElement;
        root.classList.add('has-light');
        let raf = 0, ev = null, tilted = null;

        function apply() {
            raf = 0;
            const { clientX: x, clientY: y, target } = ev;
            root.style.setProperty('--cx', x + 'px');
            root.style.setProperty('--cy', y + 'px');
            root.classList.add('lit-on');
            const el = target instanceof Element ? target : null;

            const spot = el?.closest(SPOT_SELECTOR);
            if (spot) {
                const r = spot.getBoundingClientRect();
                spot.style.setProperty('--sx', x - r.left + 'px');
                spot.style.setProperty('--sy', y - r.top + 'px');
            }

            const tilt = el?.closest('[data-tilt]');
            if (tilted && tilted !== tilt) resetTilt(tilted);
            tilted = tilt;
            if (tilt) {
                const r = tilt.getBoundingClientRect();
                const px = (x - r.left) / r.width, py = (y - r.top) / r.height;
                const max = Number(tilt.dataset.tilt) || 6;
                tilt.style.setProperty('--ry', ((px - .5) * max * 2).toFixed(2) + 'deg');
                tilt.style.setProperty('--rx', ((.5 - py) * max * 2).toFixed(2) + 'deg');
                tilt.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
                tilt.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
                tilt.classList.add('tilting');
            }
        }
        const resetTilt = t => { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); t.classList.remove('tilting'); };
        const move = e => { ev = e; if (!raf) raf = requestAnimationFrame(apply); };
        const leave = () => { if (tilted) resetTilt(tilted); tilted = null; root.classList.remove('lit-on'); };

        document.addEventListener('pointermove', move, { passive: true });
        document.documentElement.addEventListener('pointerleave', leave);
        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener('pointermove', move);
            document.documentElement.removeEventListener('pointerleave', leave);
            root.classList.remove('has-light', 'lit-on');
        };
    }, []);
}

const SPARK_COLORS = ['#fff4d6', '#ffd59a', '#ffc873', '#f2a33a', '#e8693a'];

/**
 * Bir öğenin ortasından kıvılcım patlaması (beğeni, arkadaş kabulü, paylaşım). Kıvılcımlar sayfanın üstünde,
 * öğeden bağımsız çizilir; öğe hemen kaybolsa da patlama yarım kalmaz.
 */
export function sparkBurst(el, count = 14) {
    if (!el || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    const box = document.createElement('span');
    box.className = 'burst';
    box.style.left = r.left + r.width / 2 + 'px';
    box.style.top = r.top + r.height / 2 + 'px';
    for (let i = 0; i < count; i++) {
        const s = document.createElement('i');
        const angle = (i / count) * Math.PI * 2 + Math.random() * .5;
        const dist = 26 + Math.random() * 34;
        s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        s.style.setProperty('--dy', Math.sin(angle) * dist - 10 + 'px');
        s.style.setProperty('--c', SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]);
        s.style.setProperty('--d', 420 + Math.random() * 380 + 'ms');
        box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 900);
}

/**
 * Üst kenarından yukarı doğru közler yükselen tuval (profil banner'ı, giriş kartı...). Ebeveyninin tamamını kaplar;
 * ebeveyn ekrandan çıkınca ya da sekme gizlenince durur. rate: saniyedeki kor sayısı.
 */
export function RisingEmbers({ rate = 18, from = 'bottom' }) {
    const ref = useRef(null);
    useEffect(() => {
        if (reducedMotion()) return;
        const canvas = ref.current, host = canvas?.parentElement;
        if (!host) return;
        const g = canvas.getContext('2d');
        let w = 0, h = 0, raf = 0, running = false, last = 0;
        const embers = [];

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = host.clientWidth; h = host.clientHeight;
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        function frame(now) {
            const dt = Math.min(.05, (now - last) / 1000);
            last = now;
            let n = rate * dt * (w / 900);
            while (n > 0) {
                if (Math.random() < n) {
                    embers.push({
                        x: Math.random() * w, y: from === 'bottom' ? h + 4 : Math.random() * h,
                        vx: (Math.random() - .5) * 12, vy: -(18 + Math.random() * 42),
                        life: 0, max: 2 + Math.random() * 3.5, size: Math.random() < .2 ? 3 : 2, phase: Math.random() * 6.28,
                        color: SPARK_COLORS[Math.floor(Math.random() * 4)],
                    });
                }
                n -= 1;
            }
            g.clearRect(0, 0, w, h);
            g.globalCompositeOperation = 'lighter';
            const t = now / 1000;
            for (let i = embers.length - 1; i >= 0; i--) {
                const e = embers[i];
                e.life += dt;
                if (e.life >= e.max || e.y < -10) { embers.splice(i, 1); continue; }
                e.vx += Math.sin(t * 2.4 + e.phase) * 10 * dt;
                e.x += e.vx * dt; e.y += e.vy * dt;
                const a = Math.sin(Math.PI * e.life / e.max) * (.7 + .3 * Math.sin(t * 18 + e.phase));
                const x = Math.round(e.x), y = Math.round(e.y);
                g.globalAlpha = a * .14; g.fillStyle = '#f2a33a';
                g.fillRect(x - e.size * 2, y - e.size * 2, e.size * 5, e.size * 5);
                g.globalAlpha = a; g.fillStyle = e.life / e.max > .6 ? '#e8693a' : e.color;
                g.fillRect(x, y, e.size, e.size);
            }
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
            raf = requestAnimationFrame(frame);
        }
        const play = () => { if (!running && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
        const stop = () => { running = false; cancelAnimationFrame(raf); };
        const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : stop()));
        const ro = new ResizeObserver(resize);
        const onVisibility = () => (document.hidden ? stop() : play());
        resize();
        io.observe(host);
        ro.observe(host);
        document.addEventListener('visibilitychange', onVisibility);
        return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
    }, [rate, from]);
    return <canvas ref={ref} className="rising-embers" aria-hidden="true" />;
}
