import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ANDROID_URL, DOWNLOAD_URL, androidRelease, api, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import Icon from '../icons.jsx';
import { Reveal, reducedMotion } from '../motion.jsx';
import { hafifMi } from '../vulusalEngine.js';
import { ufukMuzigi } from '../vulusalSes2.js';
import { EXTRAS } from './Launcher.jsx';
import '../ufuk.css';

// /vulusalufuk: "Olay Ufku" geçişinin sonunda açılan sayfa. Geçişin synthwave dünyası (src/ufukSahne.js) burada canlı
// arka plan olur: kamera süzülür, kaydırdıkça hızlanır ve güneş batar; içerik bu dünyanın üstünde buzlu cam paneller.
// Geçişten gelindiyse synthwave müziği döngüde devam eder (sağ alttaki düğmeyle kapanır); doğrudan gelindiyse kapalı başlar.
// Söylenen her özellik asıl /launcher sayfasındakiyle aynıdır.

const OZELLIKLER = [
    ['Instance\'lar', 'Her oyun kendi evreninde', 'Vanilla, Fabric, Quilt, Forge ya da NeoForge ile istediğin kadar instance oluştur. Sürüm, modlar, RAM ve dünyalar her birinde ayrı tutulur; gereken Java sürümünü launcher kendisi indirir.'],
    ['Modlar ve paketler', 'Mod kurmak için launcher\'dan çıkma', 'CurseForge\'daki modları, kaynak paketlerini, shader\'ları ve modpack\'leri içeriden ara ve kur; istersen Modrinth\'e geç. vulu Packs\'teki hazır paketler tek tıkla kurulur, her güncellemede neyin eklenip neyin çıkarıldığı listelenir.'],
    ['Sosyal', 'Arkadaşların da burada', 'Ekran görüntülerini akışta paylaş, arkadaşlarının paylaşımlarına yorum yaz. Kimin çevrimiçi olduğu ve ne oynadığı görünür. Mesajlar uçtan uca şifrelenir; sunucu bile içeriklerini okuyamaz.'],
    ['Sunucular', 'Tek tıkla sunucuya', 'Her sunucunun açık olup olmadığı, içeride kaç kişi olduğu ve gecikme görünür. Bağlan\'a bastığında oyun açılır ve doğrudan sunucuya girersin.'],
];

export default function VulusalUfuk() {
    const { status } = useAuth();
    const gecisten = !!useLocation().state?.gecis3d;
    const kap = useRef(null);
    const sahne = useRef(null);
    const muzik = useRef(null);
    const [caliyor, setCaliyor] = useState(false);
    const [release, setRelease] = useState(null);
    const [android, setAndroid] = useState(null);
    const [online, setOnline] = useState(null);

    useEffect(() => { latestRelease().then(setRelease); androidRelease().then(setAndroid); }, []);
    useEffect(() => {
        let iptal = false;
        const yukle = () => api.stats().then(s => { if (!iptal) setOnline(s.online); }).catch(() => {});
        yukle();
        const id = setInterval(yukle, 30 * 1000);
        return () => { iptal = true; clearInterval(id); };
    }, []);

    // canlı arka plan (three.js ayrı paket olarak yüklenir), kaydırma ve fare
    useEffect(() => {
        const html = document.documentElement;
        const hafif = hafifMi();
        const sinif = ['ufuk-acik', 'pikseller-kapali', ...(hafif ? ['uf-hafif'] : [])];
        html.classList.add(...sinif);
        let iptal = false;
        import('../ufukSahne.js')
            .then(m => { if (!iptal && kap.current) sahne.current = m.ufukBaslat(kap.current, { hafif, sakin: reducedMotion() }); })
            .catch(() => {});
        const kaydir = () => {
            const boy = document.documentElement.scrollHeight - innerHeight;
            sahne.current?.kaydir(boy > 0 ? Math.min(1, scrollY / boy) : 0);
        };
        const fare = e => sahne.current?.fare((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
        addEventListener('scroll', kaydir, { passive: true });
        addEventListener('pointermove', fare, { passive: true });
        return () => {
            iptal = true;
            removeEventListener('scroll', kaydir);
            removeEventListener('pointermove', fare);
            sahne.current?.durdur();
            sahne.current = null;
            html.classList.remove(...sinif);
        };
    }, []);

    // müzik: geçişten gelindiyse kendiliğinden devam eder
    useEffect(() => {
        muzik.current = ufukMuzigi();
        if (gecisten && !reducedMotion()) {
            const id = setTimeout(() => setCaliyor(muzik.current.baslat()), 250);
            return () => { clearTimeout(id); muzik.current.durdur(); };
        }
        return () => muzik.current.durdur();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function muzikDegistir() {
        if (caliyor) { muzik.current.durdur(); setCaliyor(false); }
        else setCaliyor(muzik.current.baslat());
    }

    const surum = release?.tag;

    return (
        <div className={'uf' + (gecisten ? ' uf-gecisten' : '')}>
            <div className="uf-arka" aria-hidden="true"><div className="uf-arka-izgara" /></div>
            <div className="uf-sahne" ref={kap} />

            <section className="uf-hero">
                <p className="uf-ust">Olay ufkunun öbür yanı</p>
                <h1 className="uf-baslik">
                    <span className="uf-krom" data-text="VULUSAL">VULUSAL</span>
                    <span className="uf-alt-baslik">LAUNCHER</span>
                </h1>
                <p className="uf-lead">
                    Minecraft'ı kurmak, modlamak ve oynamak için tek uygulama. Java'yı, mod yükleyicileri ve
                    güncellemeleri launcher kendisi indirir; sana yalnızca oynamak kalır.
                </p>
                <div className="uf-eylem">
                    <a className="uf-btn birincil" href={DOWNLOAD_URL}><Icon name="windows" size={18} /> Windows için indir</a>
                    {android && <a className="uf-btn" href={ANDROID_URL}><Icon name="android" size={18} /> Android</a>}
                </div>
                <p className="uf-meta">
                    {surum && <><span className="mono">{surum}</span> · </>}Windows 10 ve 11{android && <> · Android 8+</>} · Ücretsiz
                </p>
                {online !== null && (
                    <p className="uf-canli">
                        <span className={'uf-nokta' + (online > 0 ? ' acik' : '')} />
                        {online > 0 ? <>Şu an <b>{online}</b> kişi launcher'da.</> : 'Şu an launcher\'da kimse yok.'}
                    </p>
                )}
                <span className="uf-kaydir" aria-hidden="true"><i /></span>
            </section>

            <section className="uf-bolum" aria-labelledby="uf-ozellik">
                <Reveal as="h2" id="uf-ozellik" className="uf-bolum-baslik">Neler var</Reveal>
                <div className="uf-kartlar">
                    {OZELLIKLER.map(([etiket, baslik, metin], i) => (
                        <Reveal as="article" key={etiket} className="uf-kart uf-cam" delay={i * 80}>
                            <span className="uf-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                            <p className="uf-etiket">{etiket}</p>
                            <h3>{baslik}</h3>
                            <p>{metin}</p>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section className="uf-bolum" aria-labelledby="uf-dahasi">
                <Reveal as="h2" id="uf-dahasi" className="uf-bolum-baslik">Ve dahası</Reveal>
                <Reveal as="dl" className="uf-ekstralar">
                    {EXTRAS.map(([baslik, metin]) => (
                        <div key={baslik} className="uf-cam">
                            <dt>{baslik}</dt>
                            <dd>{metin}</dd>
                        </div>
                    ))}
                </Reveal>
            </section>

            <section className="uf-bolum uf-basla" aria-labelledby="uf-basla">
                <Reveal as="h2" id="uf-basla" className="uf-bolum-baslik">Başlamak için</Reveal>
                <Reveal className="uf-cam uf-adim-kutu">
                    <p className="uf-not">Hesaplar şimdilik davetle açılıyor; önce bir katılma isteği göndermen gerekiyor.</p>
                    <ol className="uf-adimlar">
                        <li><span>{status === 'in' ? 'Hesabın hazır.' : <><Link to="/kayit">Katılma formunu</Link> doldur ve isteğini gönder.</>}</span></li>
                        <li><span>Bir admin onayladığında hesabın açılır.</span></li>
                        <li><span>Kurulum dosyasını indirip çalıştır, aynı kullanıcı adı ve şifreyle giriş yap.</span></li>
                    </ol>
                    <p className="uf-not">
                        Windows ilk açılışta bir SmartScreen uyarısı gösterebilir. <i>Ek bilgi</i>'ye, ardından <i>Yine de çalıştır</i>'a tıkla.
                    </p>
                </Reveal>
            </section>

            <section className="uf-son">
                <Reveal as="p" className="uf-son-baslik">Ufkun öbür yanında görüşürüz.</Reveal>
                <div className="uf-eylem">
                    <a className="uf-btn birincil" href={DOWNLOAD_URL}><Icon name="download" size={18} /> Kurulum dosyasını indir</a>
                    <Link className="uf-btn" to="/launcher">Sakin sürüme dön</Link>
                </div>
            </section>

            <button type="button" className={'uf-muzik' + (caliyor ? ' caliyor' : '')} onClick={muzikDegistir} aria-pressed={caliyor}>
                <span className="uf-eq" aria-hidden="true"><i /><i /><i /><i /></span>
                {caliyor ? 'Müziği kapat' : 'Müziği aç'}
            </button>
        </div>
    );
}
