import { useEffect, useRef } from 'react';
import { reducedMotion } from './motion.jsx';

// Sitenin arkasında yavaşça yukarı süzülen seyrek, soluk bakır/altın pikseller (oyundaki tecrübe küresi ya da kıvılcım gibi).
// İçeriğin arkasında durur ve tıklamaları engellemez. Sekme gizlenince durur; "hareketi azalt" açıksa hiç çizilmez.

const COLORS = ['#c27e3e', '#e3b37a', '#f3d6a4', '#9a6230'];
const AREA_PER_PIXEL = 17000;   // ekran alanı / parçacık sayısı: büyüdükçe seyrekleşir
const MAX = 90;

function spawn(w, h, anywhere) {
    const size = [2, 3, 3, 4, 4, 5][Math.floor(Math.random() * 6)];
    return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        size,
        speed: 6 + Math.random() * 14,           // px/sn, yukarı
        sway: 6 + Math.random() * 14,            // yatay salınım genişliği
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.4 + Math.random() * 1.2,      // parlama hızı
        alpha: 0.3 + Math.random() * 0.45,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
}

export default function PixelField() {
    const ref = useRef(null);

    useEffect(() => {
        if (reducedMotion()) return;
        const canvas = ref.current;
        const g = canvas.getContext('2d');
        let w = 0, h = 0, dpr = 1, particles = [], raf = 0, last = performance.now();

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            g.imageSmoothingEnabled = false;
            const target = Math.min(MAX, Math.round((w * h) / AREA_PER_PIXEL));
            while (particles.length < target) particles.push(spawn(w, h, true));
            particles.length = target;
        }

        function frame(now) {
            const dt = Math.min(0.05, (now - last) / 1000);   // sekmeye dönünce zıplamasın
            last = now;
            g.clearRect(0, 0, w, h);
            const t = now / 1000;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.y -= p.speed * dt;
                if (p.y < -10) { particles[i] = spawn(w, h, false); continue; }
                const x = p.x + Math.sin(t * 0.5 + p.phase) * p.sway;
                const a = p.alpha * (0.55 + 0.45 * Math.sin(t * p.twinkle + p.phase));
                g.globalAlpha = Math.max(0, a);
                g.fillStyle = p.color;
                // Tam piksele oturt: bulanık değil keskin kare
                g.fillRect(Math.round(x), Math.round(p.y), p.size, p.size);
            }
            g.globalAlpha = 1;
            raf = requestAnimationFrame(frame);
        }

        function onVisibility() {
            cancelAnimationFrame(raf);
            if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
        }

        resize();
        raf = requestAnimationFrame(frame);
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    return <canvas ref={ref} className="pixel-field" aria-hidden="true" />;
}
