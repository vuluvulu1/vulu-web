import { useEffect, useRef } from 'react';
import Wordmark, { GLYPHS } from './Wordmark.jsx';
import { reducedMotion } from './motion.jsx';

// "vulu Launcher" yazısının harflerinden kopan kıvılcımlar. Harfler çizilirken o harften bir avuç kıvılcım fışkırır,
// sonra yazının üstünden sürekli közler yükselir; imleç yazının üstündeyken daha çok yanar.
// Kıvılcımlar harflerin gerçek şeklinin içinden doğar (Wordmark'taki yollar Path2D olarak kullanılır).

// Wordmark'ın viewBox'ları: "vulu Launcher" ve yalnızca "vulu"
const VIEWS = { full: { x: -3, y: -831, w: 4401, h: 1182 }, short: { x: -3, y: -650, w: 1320, h: 670 } };
const ABOVE = 180;                                    // tuvalin yazının üstüne taşan kısmı (px)
const SIDE = 60;
const DRAW_START = 0.5, DRAW_STEP = 0.07;             // styles.css'teki ink-fill zamanlamasıyla aynı (sn)
const COLORS = ['#fff4d6', '#ffd59a', '#ffc873', '#f2a33a', '#e8693a'];

/** Bir yolun kabaca sınır kutusu (komut harfleri atılır, sayılar x,y çiftleri sayılır; H/V tek sayıları atlanır). */
function bbox(d) {
    const clean = d.replace(/[HV]-?[\d.]+/g, ' ');
    const nums = clean.match(/-?\d+(\.\d+)?/g).map(Number);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i + 1 < nums.length; i += 2) {
        x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]);
        y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]);
    }
    return { x0, y0, x1, y1 };
}

export default function TitleEmbers({ targetRef, full = true }) {
    const ref = useRef(null);

    useEffect(() => {
        if (reducedMotion() || typeof Path2D === 'undefined') return;
        const canvas = ref.current, target = targetRef.current;
        if (!canvas || !target) return;
        const g = canvas.getContext('2d');
        const probe = document.createElement('canvas').getContext('2d');
        const VIEW = full ? VIEWS.full : VIEWS.short;
        const glyphs = (full ? GLYPHS : GLYPHS.slice(0, 4)).map(d => ({ path: new Path2D(d), box: bbox(d) }));

        let w = 0, h = 0, scale = 1, dpr = 1, raf = 0, running = false, hot = false;
        const start = performance.now();
        let last = start;
        const embers = [];
        const fired = new Set();

        function resize() {
            const r = target.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = r.width + SIDE * 2; h = r.height + ABOVE + 20;
            canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            scale = r.width / VIEW.w;
        }

        /** Bir harfin içinden rastgele bir nokta (tuval koordinatında); bulunamazsa null. */
        function pointIn(i) {
            const { path, box } = glyphs[i];
            for (let t = 0; t < 40; t++) {
                const x = box.x0 + Math.random() * (box.x1 - box.x0), y = box.y0 + Math.random() * (box.y1 - box.y0);
                if (probe.isPointInPath(path, x, y)) return { x: SIDE + (x - VIEW.x) * scale, y: ABOVE + (y - VIEW.y) * scale };
            }
            return null;
        }

        function spawn(i, burst) {
            const p = pointIn(i);
            if (!p) return;
            const speed = burst ? 40 + Math.random() * 110 : 14 + Math.random() * 34;
            const angle = -Math.PI / 2 + (Math.random() - .5) * (burst ? 2.2 : .9);
            embers.push({
                x: p.x, y: p.y,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: 0, max: burst ? .6 + Math.random() * .9 : 1.4 + Math.random() * 2.2,
                size: Math.random() < .15 ? 4 : Math.random() < .5 ? 3 : 2,
                phase: Math.random() * 6.28,
                color: COLORS[Math.floor(Math.random() * 3)],
            });
        }

        function frame(now) {
            const dt = Math.min(.05, (now - last) / 1000);
            last = now;
            const t = (now - start) / 1000;

            // Harfler çizilirken: her harf dolmaya başlayınca ondan kıvılcım fışkırır
            glyphs.forEach((_, i) => {
                if (!fired.has(i) && t >= DRAW_START + i * DRAW_STEP) {
                    fired.add(i);
                    for (let k = 0; k < 34; k++) spawn(i, true);
                }
            });
            // Sonra sürekli közler; imleç üstündeyken daha çok
            if (t > DRAW_START + glyphs.length * DRAW_STEP) {
                const rate = hot ? 95 : 30;
                let n = rate * dt;
                while (n > 0) { if (Math.random() < n) spawn(Math.floor(Math.random() * glyphs.length), false); n -= 1; }
            }

            g.clearRect(0, 0, w, h);
            g.globalCompositeOperation = 'lighter';
            for (let i = embers.length - 1; i >= 0; i--) {
                const e = embers[i];
                e.life += dt;
                if (e.life >= e.max) { embers.splice(i, 1); continue; }
                e.vy -= 18 * dt;                                   // sıcak hava yukarı iter
                e.vx += Math.sin(t * 3 + e.phase) * 12 * dt;       // titreşerek savrulur
                e.vx *= 1 - .6 * dt;
                e.x += e.vx * dt; e.y += e.vy * dt;
                const k = e.life / e.max;
                const flicker = .7 + .3 * Math.sin(t * 22 + e.phase);
                const alpha = Math.max(0, (1 - k) * flicker);
                const color = k > .65 ? COLORS[4] : k > .35 ? COLORS[3] : e.color;
                const x = Math.round(e.x), y = Math.round(e.y);
                g.globalAlpha = alpha * .07;
                g.fillStyle = COLORS[3];
                g.fillRect(x - e.size * 3, y - e.size * 3, e.size * 7, e.size * 7);
                g.globalAlpha = alpha * .28;
                g.fillRect(x - e.size, y - e.size, e.size * 3, e.size * 3);
                g.globalAlpha = alpha;
                g.fillStyle = color;
                g.fillRect(x, y, e.size, e.size);
            }
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
            raf = requestAnimationFrame(frame);
        }

        const play = () => { if (!running && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
        const stop = () => { running = false; cancelAnimationFrame(raf); };
        const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : stop()));
        const onVisibility = () => (document.hidden ? stop() : play());
        const enter = () => { hot = true; }, leave = () => { hot = false; };

        resize();
        io.observe(target);
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', onVisibility);
        target.addEventListener('pointerenter', enter);
        target.addEventListener('pointerleave', leave);
        return () => {
            stop();
            io.disconnect();
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', onVisibility);
            target.removeEventListener('pointerenter', enter);
            target.removeEventListener('pointerleave', leave);
        };
    }, [targetRef, full]);

    return <canvas ref={ref} className="title-embers" aria-hidden="true" style={{ top: -ABOVE, left: -SIDE }} />;
}

/** Tanıtım sayfalarının başlığı: el yazısı "vulu Launcher" (full) ya da "vulu" ve harflerinden kopan kıvılcımlar. */
export function HeroTitle({ full = true, label = 'vulu Launcher', className = '' }) {
    const box = useRef(null);
    return (
        <h1 className={'hero-title' + (className ? ' ' + className : '')}>
            <span className="hero-title-box" ref={box}>
                <Wordmark full={full} animate shine />
                <TitleEmbers targetRef={box} full={full} />
            </span>
            <span className="sr-only">{label}</span>
        </h1>
    );
}
