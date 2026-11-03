import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ANDROID_URL, DOWNLOAD_URL, androidRelease, api, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import Icon from '../icons.jsx';
import { reducedMotion } from '../motion.jsx';
import { vulusalBaslat } from '../vulusalEngine.js';
import { EXTRAS } from './Launcher.jsx';
import '../vulusal.css';

// vulu Launcher'ın vulusal sürümü (/vulusalvululauncher). Asıl /launcher sayfasının yerine geçmez; aynı launcher'ı
// neon synthwave, konfeti ve trap beat'iyle anlatır. Söylenen her özellik asıl sayfadakiyle aynıdır, sadece tonu vulusaldır.
// Gizli şeyler: aura metresi dolunca (ya da ↑↑↓↓←→←→BA) ULTRA mod açılır; "VULUSAL - 2026"nın üstüne gelince beat çalar.

const OZELLIKLER = [
    {
        etiket: "Instance'lar",
        baslik: 'Her oyuna ayrı instance',
        renk: 'pembe',
        metin: "Vanilla, Fabric, Quilt, Forge ya da NeoForge. İstediğin kadar aç brom. Sürüm, modlar, RAM ve dünyalar her birinde ayrı durur; gereken Java'yı launcher kendisi indirir.",
    },
    {
        etiket: 'Modlar ve paketler',
        baslik: "Mod kurmak için launcher'dan çıkma",
        renk: 'cyan',
        metin: "CurseForge'daki modları, kaynak paketlerini, shader'ları ve modpack'leri içeriden ara ve kur; istersen Modrinth'e geç. vulu Packs'teki hazır paketler tek tıkla kurulur, her güncellemede ne eklendi ne çıktı listelenir.",
    },
    {
        etiket: 'Sosyal',
        baslik: 'Arkadaşların da burada',
        renk: 'sari',
        metin: 'Ekran görüntülerini akışta paylaş, arkadaşlarının paylaşımlarına yorum yaz. Kim çevrimiçi, kim ne oynuyor görürsün. Mesajlar uçtan uca şifreli; sunucu bile okuyamıyor.',
    },
    {
        etiket: 'Sunucular',
        baslik: 'Tek tıkla sunucuya gir',
        renk: 'yesil',
        metin: "Her sunucunun açık olup olmadığı, içeride kaç kişi olduğu ve gecikme görünür. Bağlan'a bas: oyun açılır, direkt sunucuya girersin.",
    },
];

const UST_SERIT = 'VULU ✦ VULUSAL ✦ AURA FARMING ✦ VULU LAUNCHER ✦ 2026 ✦ ';
const ALT_SERIT = '★ HER YERDE VULU YAZIYO ★ VULUSAL LAUNCHER ★ BEDAVA ★ ';

export default function VulusalLauncher() {
    const root = useRef(null);
    const motor = useRef(null);
    const { status } = useAuth();
    const [release, setRelease] = useState(null);
    const [android, setAndroid] = useState(null);
    const [online, setOnline] = useState(null);
    const [mesaj, setMesaj] = useState(null);        // açık modalın metni
    const [kapaniyor, setKapaniyor] = useState(false);

    useEffect(() => { latestRelease().then(setRelease); androidRelease().then(setAndroid); }, []);

    useEffect(() => {
        let iptal = false;
        const yukle = () => api.stats().then(s => { if (!iptal) setOnline(s.online); }).catch(() => {});
        yukle();
        const id = setInterval(yukle, 30 * 1000);
        return () => { iptal = true; clearInterval(id); };
    }, []);

    useEffect(() => {
        motor.current = vulusalBaslat(root.current, { sakin: reducedMotion() });
        return () => { motor.current?.durdur(); motor.current = null; };
    }, []);

    useEffect(() => {
        if (!mesaj) return;
        const esc = e => { if (e.key === 'Escape') kapat(); };
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    });

    function ac(metin, kaynak) {
        setKapaniyor(false);
        setMesaj(metin);
        const m = motor.current;
        if (!m) return;
        m.flash(); m.sars();
        const r = kaynak?.getBoundingClientRect() || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
        m.patlat(r.left + r.width / 2, r.top + r.height / 2, 220, 1.5);
        setTimeout(() => motor.current?.patlat(innerWidth * 0.2, innerHeight * 0.3, 90, 1.2), 150);
        setTimeout(() => motor.current?.patlat(innerWidth * 0.8, innerHeight * 0.3, 90, 1.2), 300);
        m.auraEkle(15);
    }

    function kapat() {
        if (!mesaj || kapaniyor) return;
        setKapaniyor(true);
        motor.current?.patlat(innerWidth / 2, innerHeight / 2, 80, 1);
        setTimeout(() => { setMesaj(null); setKapaniyor(false); }, 340);
    }

    const surum = release?.tag || 'BETA';

    return (
        <div className="vulusal" ref={root}>
            {/* arka plan katmanları */}
            <canvas className="vs-canvas" aria-hidden="true" />
            <div className="vs-grid" aria-hidden="true"><div /></div>
            <div className="vs-sun" aria-hidden="true" />
            <div className="vs-lasers" aria-hidden="true">{[1, 2, 3, 4, 5, 6].map(i => <span key={i} />)}</div>
            <div className="vs-floating" aria-hidden="true" />

            <div className="vs-icerik">
                <Serit metin={UST_SERIT} className="top" />

                <section className="vs-sahne">
                    <div className="vs-rozet">⚡ VERSION {surum} ULTRA VULU EDITION ⚡</div>
                    <h1 className="vs-h1 vs-glitch" data-text="aşırı vulu bir launcher" aria-label="aşırı vulu bir launcher">
                        <Dalga metin="aşırı vulu bir launcher" />
                    </h1>
                    <p className="vs-altyazi">vulusal minecraft launcher'ı</p>
                    <p className="vs-lead">
                        Minecraft'ı kurmak, modlamak ve oynamak için tek uygulama. Java'yı, mod yükleyicileri ve
                        güncellemeleri launcher kendisi indirir. Sen sadece aura farmla.
                    </p>

                    <div className="vs-oyna-wrap">
                        <button type="button" className="vs-oyna" onClick={e => ac('vulu launcher iniyo brom, aura yükleniyo', e.currentTarget)}>
                            <span className="vs-oyna-text">VULUSAL İNDİR TUŞU</span>
                            <span className="vs-oyna-shine" />
                        </button>
                    </div>

                    <p className="vs-meta">
                        <span className="mono">{surum}</span> · Windows 10 ve 11{android && <> · Android 8+</>} · bedava
                    </p>
                    {online !== null && (
                        <p className="vs-live">
                            <span className={'vs-live-dot' + (online > 0 ? ' on' : '')} />
                            {online > 0 ? <>Şu an <b>{online}</b> kişi launcher'da aura farmlıyor.</> : "Şu an launcher'da kimse yok. Aura senin brom."}
                        </p>
                    )}
                    <small className="vs-small">her yerde vulu yaziyo</small>
                </section>

                <section className="vs-bolum" aria-labelledby="vs-ozellikler">
                    <h2 id="vs-ozellikler" className="vs-bolum-baslik vs-glitch" data-text="ÖZELLİKLER">ÖZELLİKLER</h2>
                    <div className="vs-kartlar">
                        {OZELLIKLER.map((o, i) => (
                            <article key={o.etiket} className={'vs-kart ' + o.renk} style={{ '--n': i }}>
                                <p className="vs-kart-etiket">{o.etiket}</p>
                                <h3>{o.baslik}</h3>
                                <p>{o.metin}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="vs-bolum" aria-labelledby="vs-ekstra">
                    <h2 id="vs-ekstra" className="vs-bolum-baslik vs-glitch" data-text="DAHA DA VULUSAL">DAHA DA VULUSAL</h2>
                    <dl className="vs-ekstralar">
                        {EXTRAS.map(([baslik, metin], i) => (
                            <div key={baslik} style={{ '--n': i }}>
                                <dt>{baslik}</dt>
                                <dd>{metin}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section className="vs-bolum vs-basla" aria-labelledby="vs-basla">
                    <h2 id="vs-basla" className="vs-bolum-baslik vs-glitch" data-text="NASIL BAŞLARIM BROM">NASIL BAŞLARIM BROM</h2>
                    <p className="vs-not">Hesaplar şimdilik davetle açılıyor; önce bir katılma isteği göndermen gerekiyor.</p>
                    <ol className="vs-adimlar">
                        <li><span>{status === 'in' ? <>Hesabın zaten var, bu adım geçildi. <b>+100 aura</b>.</> : <><Link to="/kayit">Katılma formunu</Link> doldur ve isteğini gönder.</>}</span></li>
                        <li><span>Bir admin onayladığında hesabın açılır.</span></li>
                        <li><span>Kurulum dosyasını indirip çalıştır, aynı kullanıcı adı ve şifreyle giriş yap.</span></li>
                    </ol>
                    <p className="vs-not">
                        Windows ilk açılışta SmartScreen uyarısı gösterebilir. <i>Ek bilgi</i>'ye, ardından <i>Yine de çalıştır</i>'a tıkla.
                    </p>
                    <div className="vs-indir">
                        <a className="vs-btn sari" href={DOWNLOAD_URL}><Icon name="windows" size={18} /> Windows için indir</a>
                        {android && <a className="vs-btn cyan" href={ANDROID_URL}><Icon name="android" size={18} /> Android APK (deneme)</a>}
                        <Link className="vs-btn" to="/launcher">Sakin sürüme dön</Link>
                    </div>
                </section>

                <div className="vs-aura-wrap">
                    <h2 className="vs-aura" data-text="VULUSAL - 2026">VULUSAL - 2026</h2>
                    <div className="vs-aura-hint">üstüne gel. cesaretin varsa.</div>
                </div>

                <Serit metin={ALT_SERIT} className="bottom" ters />
            </div>

            {/* HUD */}
            <div className="vs-combo" aria-hidden="true"><span className="vs-combo-sayi">0</span>x</div>
            <div className="vs-aura-meter" aria-hidden="true">
                <div className="vs-aura-meter-label">AURA</div>
                <div className="vs-aura-meter-bar"><div className="vs-aura-fill" /></div>
            </div>

            {mesaj && (
                <div className={'vs-modal' + (kapaniyor ? ' kapaniyor' : '')} onClick={e => { if (e.target === e.currentTarget) kapat(); }}>
                    <div className="vs-modal-content" role="dialog" aria-modal="true" aria-labelledby="vs-modal-baslik">
                        <div className="vs-modal-rays" aria-hidden="true" />
                        <h2 id="vs-modal-baslik" className="vs-glitch" data-text="vulusal launcher">vulusal launcher</h2>
                        <p aria-label={mesaj}>
                            {[...mesaj].map((h, i) => <span key={i} className="harf" style={{ '--i': i }} aria-hidden="true">{h === ' ' ? ' ' : h}</span>)}
                        </p>
                        <div className="vs-modal-actions">
                            <a className="vs-btn sari" href={DOWNLOAD_URL} autoFocus><Icon name="windows" size={18} /> Windows</a>
                            {android && <a className="vs-btn cyan" href={ANDROID_URL}><Icon name="android" size={18} /> Android</a>}
                            <button type="button" className="vs-btn" onClick={kapat}>Tamam</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ekran efektleri */}
            <div className="vs-scanlines" aria-hidden="true" />
            <div className="vs-vignette" aria-hidden="true" />
            <div className="vs-flash" aria-hidden="true" />
            <div className="vs-ultra-banner" aria-hidden="true">ULTRA VULUSAL MOD AKTİF</div>
        </div>
    );
}

/** Başlığı harf harf dalgalandırır; dar ekranda satır kelime aralarından kırılır. */
function Dalga({ metin }) {
    let i = 0;
    return (
        <span className="vs-wavy" aria-hidden="true">
            {metin.split(' ').map((kelime, k) => (
                <span key={k} className="vs-kelime">
                    {k > 0 && ' '}
                    {[...kelime].map(h => <span key={i} style={{ '--i': i++ }}>{h}</span>)}
                </span>
            ))}
        </span>
    );
}

/** Sonsuz kayan şerit; metin iki kopya hâlinde yan yana durur, yarısı kadar kayınca başa döner. */
function Serit({ metin, className, ters }) {
    const parca = metin.repeat(8);
    return (
        <div className={'vs-marquee ' + className} aria-hidden="true">
            <div className={'vs-marquee-track' + (ters ? ' reverse' : '')}>{parca + parca}</div>
        </div>
    );
}
