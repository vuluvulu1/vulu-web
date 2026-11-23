// Herkese açık sayfaların teması. Her sayfa yüklenişinde temalardan biri rastgele seçilir (bir önceki ziyarettekinden
// farklı); site içinde gezinirken değişmez. Üst çubuk ve alt bilgi her temada aynıdır; sahne, arka plan ve renkler
// temadan gelir. Temalar src/temalar/ altında: Lütuf baştan pakettedir (sunucuda hazırlanan HTML de onu kullanır),
// diğerleri yalnızca seçildiklerinde yüklenir.
//
// Sahne ve arka planlar derlemeyle gelen sabit HTML'dir, kullanıcı verisi içermez; bu yüzden innerHTML ile basılır.
// Hareketli katmanlar ayrı öğelerdir ve yalnızca transform/opacity ile oynar: ağır bulanıklık filtreli arka plan bir
// kez çizilir, her karede yeniden hesaplanmaz.
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import lutuf from './temalar/lutuf.js';

const YUKLE = {
    derinlik: () => import('./temalar/derinlik.js'),
    fener: () => import('./temalar/fener.js'),
    gozlemevi: () => import('./temalar/gozlemevi.js'),
    atolye: () => import('./temalar/atolye.js'),
    sinema: () => import('./temalar/sinema.js'),
    kitap: () => import('./temalar/kitap.js'),
    kutup: () => import('./temalar/kutup.js'),
    orman: () => import('./temalar/orman.js'),
    deniz: () => import('./temalar/deniz.js'),
};
export const TEMALAR = ['lutuf', ...Object.keys(YUKLE)];
const SON = 'vulu.tema.son';

let aktif = lutuf;
export const useTema = () => aktif;

/** Bu yükleniş için bir tema seçer; bir önceki ziyarettekini tekrar seçmez. */
export function temaSec() {
    let son = null;
    try { son = localStorage.getItem(SON); } catch { /* gizli pencere */ }
    const adaylar = TEMALAR.filter(t => t !== son);
    const secim = adaylar[Math.floor(Math.random() * adaylar.length)];
    try { localStorage.setItem(SON, secim); } catch { /* gizli pencere */ }
    return secim;
}

/** Seçilen temayı yükler, kökteki data-tema'yı ve temanın CSS'ini ayarlar. Yüklenemezse Lütuf kalır. */
export async function temaYukle(anahtar) {
    if (YUKLE[anahtar]) {
        try { aktif = (await YUKLE[anahtar]()).default; } catch { aktif = lutuf; }
    }
    const kok = document.documentElement;
    kok.dataset.tema = aktif.anahtar;
    kok.style.setProperty('--sayfa-zemin', aktif.renk.zemin);
    const stil = document.createElement('style');
    stil.textContent = aktif.css;
    document.head.appendChild(stil);
    return aktif;
}

/** Sahne çizildikten sonra görünür olur; sunucunun hazırladığı (varsayılan) sahne bir an bile yanlış temayla görünmez. */
export function useTemaHazir() {
    useEffect(() => { document.documentElement.classList.add('tema-hazir'); }, []);
}

/** Temanın renkleri, alt bölümlerin kullandığı CSS değişkenleri olarak. */
export function temaDegiskenleri(t = aktif) {
    const r = t.renk;
    return { '--t-zemin': r.zemin, '--t-kart': r.kart, '--t-kenar': r.kenar, '--t-vurgu': r.vurgu, '--t-soluk': r.soluk, '--t-etiket': r.etiket, '--t-cerceve': r.cerceve };
}

/** Sabit HTML'i basar; içindeki site içi bağlantılar (data-to) sayfayı yeniden yüklemeden açılır. */
export function SabitHtml({ html, className }) {
    const navigate = useNavigate();
    const icerik = useMemo(() => ({ __html: html }), [html]);
    function tikla(e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest('a[data-to]');
        const hedef = a?.dataset.to;
        // Yalnızca site içi yollar: "/" ile başlar, "//" (başka alan adı) ile başlamaz
        if (!hedef || !hedef.startsWith('/') || hedef.startsWith('//')) return;
        e.preventDefault();
        navigate(hedef);
    }
    return <div className={className} onClick={tikla} dangerouslySetInnerHTML={icerik} />;
}

/** Temanın arka planı (sahnesiz) ve yazının okunması için soldan hafif bir karartma. */
export function TemaArkaPlan({ karartma = true }) {
    const t = useTema();
    return (
        <>
            <SabitHtml html={t.arkaPlan} className="tema-arka" />
            {karartma && <div className="tema-karartma" aria-hidden="true" />}
        </>
    );
}

/** Uygulama sayfalarının üst bölümü: arka plan temadan, solda başlık ve indirme, sağda görsel. */
export function TemaKahraman({ sol, sag }) {
    return (
        <section className="tema-kahraman" style={temaDegiskenleri()}>
            <TemaArkaPlan />
            <div className="tema-ust" aria-hidden="true" />
            <div className="tema-kahraman-ic">
                <div className="tema-kahraman-sol">{sol}</div>
                <div className="tema-kahraman-sag">{sag}</div>
            </div>
        </section>
    );
}

/** Giriş, kayıt, doğrulama ve 404: temanın arka planı üstünde ortalanmış bir kart. */
export function TemaKutu({ children }) {
    return (
        <section className="tema-kutu" style={temaDegiskenleri()}>
            <TemaArkaPlan karartma={false} />
            <div className="tema-ust" aria-hidden="true" />
            <div className="wrap auth">{children}</div>
        </section>
    );
}

/** Temanın çerçevesinde bir ekran görüntüsü. */
export function TemaGorsel({ src, alt, width, height }) {
    return (
        <div className="tema-gorsel">
            <img src={src} alt={alt} width={width} height={height} />
        </div>
    );
}
