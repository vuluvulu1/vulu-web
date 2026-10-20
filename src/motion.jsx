import { useEffect, useRef, useState } from 'react';

/** Kullanıcı işletim sisteminde "hareketi azalt"ı açtıysa true; hareketler o zaman atlanır. */
export const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Öğe ekrana girdiğinde (bir kez) true olur. */
export function useInView(options = { threshold: 0.2 }) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || inView) return;
        if (reducedMotion() || !('IntersectionObserver' in window)) { setInView(true); return; }
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setInView(true); io.disconnect(); }
        }, options);
        io.observe(el);
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);
    return [ref, inView];
}

/** Ekrana girince aşağıdan yumuşakça belirir. as ile etiket seçilir (varsayılan div). */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
    const [ref, inView] = useInView({ threshold: 0.12 });
    return (
        <Tag ref={ref} className={`reveal${inView ? ' in' : ''} ${className}`.trim()}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...rest}>
            {children}
        </Tag>
    );
}

/** Sayı ekrana girince 0'dan hedefe sayarak yükselir; sonraki değişikliklerde eski değerden geçer. */
export function CountUp({ value, duration = 900 }) {
    const [ref, inView] = useInView({ threshold: 0.5 });
    const [shown, setShown] = useState(0);
    const from = useRef(0);
    useEffect(() => {
        if (!inView || value == null) return;
        if (reducedMotion()) { setShown(value); from.current = value; return; }
        const start = performance.now(), a = from.current, b = value;
        let raf;
        const step = now => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setShown(Math.round(a + (b - a) * eased));
            if (t < 1) raf = requestAnimationFrame(step); else from.current = b;
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [inView, value, duration]);
    return <span ref={ref}>{shown}</span>;
}

/** Ekranda görünürken her `ms`'de bir artan sayaç (canlandırma adımları için); ekrandan çıkınca ya da sekme gizlenince durur. */
export function useTicker(ms) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el || reducedMotion() || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
        io.observe(el);
        return () => io.disconnect();
    }, []);
    useEffect(() => {
        if (!visible) return;
        const id = setInterval(() => { if (!document.hidden) setTick(t => t + 1); }, ms);
        return () => clearInterval(id);
    }, [visible, ms]);
    return [ref, tick];
}
