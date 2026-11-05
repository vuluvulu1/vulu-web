// Vulu Kuantum'un gizli kapısı: launcher sayfasında sol üstteki VL logosuna basılı tutmak.
// Basılı tutarken logonun çevresinde bir halka dolar ve perdesi yükselen bir ses duyulur; dolunca kısa bir titreşim ve
// çınlamayla Kuantum açılır. Erken bırakılırsa iptal olur ve logo her zamanki gibi ana sayfaya götürür.
// Ağır kod (src/kuantum.js) basmaya başlar başlamaz arka planda yüklenir.

import { useRef } from 'react';
import { hafifMi } from './vulusalEngine.js';
import { yuklemeSesi } from './kuantumSes.js';

const SURE = 1.5;   // sn

/** aktif değilse boş nesne döner. Dönen olaylar logonun bağlantısına (Link) verilir. */
export function useKuantumKapi(aktif) {
    const d = useRef({ raf: 0, ses: null, tamam: false, modul: null, el: null }).current;
    if (!aktif) return {};

    const bitir = tamam => {
        cancelAnimationFrame(d.raf);
        d.ses?.bitir(tamam);
        d.ses = null;
        if (d.el) { d.el.classList.remove('kq-yukleniyor'); d.el.style.removeProperty('--kq'); }
        if (tamam) {
            navigator.vibrate?.(40);
            const hafif = hafifMi();
            d.modul.then(m => m?.kuantumAc({ hafif }));
        }
    };

    return {
        onPointerDown(e) {
            if (e.button > 0) return;
            d.el = e.currentTarget;
            d.tamam = false;
            d.modul ||= import('./kuantum.js').catch(() => null);
            d.ses = yuklemeSesi(SURE);
            d.el.classList.add('kq-yukleniyor');
            const t0 = performance.now();
            const adim = () => {
                const p = Math.min(1, (performance.now() - t0) / (SURE * 1000));
                d.el.style.setProperty('--kq', p.toFixed(3));
                if (p >= 1) { d.tamam = true; bitir(true); }
                else d.raf = requestAnimationFrame(adim);
            };
            d.raf = requestAnimationFrame(adim);
        },
        onPointerUp() { if (!d.tamam && d.ses) bitir(false); },
        onPointerLeave() { if (!d.tamam && d.ses) bitir(false); },
        onPointerCancel() { if (!d.tamam && d.ses) bitir(false); },
        // kapı açıldıysa bırakınca gelen tıklama ana sayfaya götürmesin
        onClick(e) { if (d.tamam) { e.preventDefault(); d.tamam = false; } },
        onContextMenu(e) { e.preventDefault(); },
        onDragStart(e) { e.preventDefault(); },
    };
}
