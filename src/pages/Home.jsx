import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DOWNLOAD_URL, asset, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';

const FEATURES = [
    ['Instance\'lar', 'Vanilla, Fabric, Quilt, Forge ve NeoForge. Java kendiliğinden indirilir.'],
    ['Modrinth', 'Mod, kaynak paketi, shader ve modpack kurulumu launcher içinden.'],
    ['vulu Packs', 'Grubun paylaştığı paketler: tek tıkla kurulum, güncelleme ve değişiklik listesi.'],
    ['Sunucular', 'vulu sunucularının durumu ve tek tıkla bağlanma.'],
    ['Sosyal', 'Ekran görüntüsü akışı, yorumlar, arkadaş listesi ve uçtan uca şifreli mesajlar.'],
    ['Diğerleri', 'Çökme yardımcısı, dünya yedekleri, oynama süresi, skinler ve Discord durumu.'],
];

export default function Home() {
    const { status } = useAuth();
    const [release, setRelease] = useState(null);
    useEffect(() => { latestRelease().then(setRelease); }, []);

    return (
        <>
            <section className="hero wrap">
                <img className="hero-logo" src={asset('img/logo.svg')} alt="" width="96" height="96" />
                <h1>vulu Launcher</h1>
                <p className="lead">Arkadaş grubumuz için yazdığımız Minecraft launcher'ı.</p>
                <div className="hero-actions">
                    <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>İndir</a>
                    {status !== 'in' && <Link className="btn btn-ghost btn-lg" to="/kayit">Hesap iste</Link>}
                </div>
                <p className="hero-meta">
                    Windows 10 / 11
                    {release && <> · <span className="mono">{release.tag}</span></>}
                </p>
                <img className="hero-shot" src={asset('img/home.png')} alt="Launcher ana ekranı" width="1280" height="800" />
            </section>

            <section className="wrap section">
                <h2>Neler var</h2>
                <div className="features">
                    {FEATURES.map(([title, text]) => (
                        <div className="card feature" key={title}>
                            <h3>{title}</h3>
                            <p>{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="wrap section">
                <h2>Nasıl başlarım</h2>
                <ol className="steps">
                    <li><b>Hesap iste.</b> <Link to="/kayit">Kayıt formunu</Link> doldur; hesaplar davetle açılıyor.</li>
                    <li><b>Onay bekle.</b> Bir admin isteğini onaylayınca hesabın açılır.</li>
                    <li><b>İndir ve giriş yap.</b> <span className="mono">vulu-launcher-setup.exe</span>'yi çalıştır, aynı kullanıcı adı ve şifreyle gir. Launcher her açılışta kendini günceller.</li>
                </ol>
                <p className="note">
                    Windows ilk seferde SmartScreen uyarısı verebilir: <i>Ek bilgi → Yine de çalıştır</i>.
                </p>
            </section>
        </>
    );
}
