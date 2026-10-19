import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DOWNLOAD_URL, asset, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import Icon from '../icons.jsx';

const LOADERS = ['Vanilla', 'Fabric', 'Quilt', 'Forge', 'NeoForge'];

const EXTRAS = [
    ['wrench', 'Çökme yardımcısı', 'Oyun çökünce sebebini bulur, hangi modun suçlu olduğunu söyler.'],
    ['archive', 'Dünya yedekleri', 'Dünyalarını tek tıkla yedekle, istediğin zaman geri dön.'],
    ['clock', 'Oynama süresi', 'Her instance ve profil için ne kadar oynadığın tutulur.'],
    ['shirt', 'Skinler', 'Skinini launcher içinden değiştir.'],
    ['discord', 'Discord durumu', 'Ne oynadığın Discord profilinde görünür.'],
    ['palette', 'Temalar', 'Classic, Neon ve Atlas: launcher sana nasıl görünsün, sen seç.'],
    ['music', 'Müzik çalar', 'Launcher açıkken arka planda müzik; sesini sen ayarla.'],
    ['shield', 'İmzalı güncellemeler', 'Launcher kendini günceller; imzası doğrulanmayan sürüm kurulmaz.'],
];

export default function Home() {
    const { status } = useAuth();
    const [release, setRelease] = useState(null);
    useEffect(() => { latestRelease().then(setRelease); }, []);

    return (
        <>
            <section className="hero">
                <div className="wrap hero-grid">
                    <div className="hero-text">
                        <span className="eyebrow">
                            <span className="dot" /> Beta{release && <> · <span className="mono">{release.tag}</span></>}
                        </span>
                        <h1>Minecraft'ı <span className="accent">tek yerden</span> oyna.</h1>
                        <p className="lead">
                            Instance'lar, Modrinth, mod paketleri, sunucular ve sohbet. Hepsi tek bir hızlı launcher'da,
                            Java dahil her şey kendiliğinden kurulur.
                        </p>
                        <div className="hero-actions">
                            <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                                <Icon name="windows" size={18} /> Windows için indir
                            </a>
                            {status !== 'in'
                                ? <Link className="btn btn-ghost btn-lg" to="/kayit">Hesap iste</Link>
                                : <Link className="btn btn-ghost btn-lg" to="/hesap">Hesabım</Link>}
                        </div>
                        <p className="hero-meta">Ücretsiz · Windows 10 / 11 · Kendini günceller</p>
                    </div>

                    <div className="hero-visual">
                        <div className="window">
                            <img src={asset('img/home.png')} alt="vulu Launcher ana ekranı" width="1860" height="1140" />
                        </div>
                    </div>
                </div>

                <div className="wrap loaders">
                    <span className="loaders-label">Desteklenenler</span>
                    {LOADERS.map(l => <span className="chip" key={l}>{l}</span>)}
                    <span className="chip chip-accent">Modrinth</span>
                </div>
            </section>

            <section className="wrap showcase">
                <Feature
                    icon="layers"
                    kicker="Instance'lar"
                    title="Her sürüm, her mod yükleyici. Ayrı ayrı."
                    text="İstediğin kadar instance aç: her birinin kendi sürümü, modları, RAM ayarı ve dünyaları olur. Doğru Java'yı launcher kendisi indirir."
                    points={['Vanilla, Fabric, Quilt, Forge, NeoForge', 'Java otomatik indirilir', 'Masaüstü kısayolu ile tek tıkla oyna']}
                    visual={<InstancesMock />}
                />
                <Feature
                    icon="package"
                    kicker="Modrinth ve vulu Packs"
                    title="Modları ara, kur, güncelle."
                    text="Mod, kaynak paketi, shader ve modpack'ler launcher içinden kurulur. vulu Packs ile hazır bir paketi tek tıkla kurarsın; güncellenince neyin değiştiğini görürsün."
                    points={['Modrinth araması launcher içinde', 'Paket güncellemelerinde değişiklik listesi', 'Eksik bağımlılıklar oyundan önce yakalanır']}
                    visual={<PackMock />}
                    flip
                />
                <Feature
                    icon="users"
                    kicker="Sosyal"
                    title="Oyunun dışında da bir arada."
                    text="Ekran görüntülerini paylaş, yorum yap, arkadaş listende kimin çevrimiçi olduğunu gör. Mesajlar uçtan uca şifreli: sunucu bile okuyamaz."
                    points={['Ekran görüntüsü akışı ve yorumlar', 'Uçtan uca şifreli mesajlar', 'Duyurular ana ekranda']}
                    visual={<ChatMock />}
                />
                <Feature
                    icon="server"
                    kicker="Sunucular"
                    title="Sunucuya bir tıkla bağlan."
                    text="Sunucuların durumu, kaç kişinin oyunda olduğu ve gecikme tek listede. Bağlan'a bas; oyun açılır açılmaz sunucuya girersin."
                    points={['Canlı durum ve oyuncu sayısı', 'Oyun açılınca doğrudan sunucuya bağlanır']}
                    visual={<ServerMock />}
                    flip
                />
            </section>

            <section className="wrap section">
                <div className="section-head">
                    <h2>Ve daha fazlası</h2>
                    <p className="muted">Her gün oynarken işine yarayan küçük şeyler.</p>
                </div>
                <div className="extras">
                    {EXTRAS.map(([icon, title, text]) => (
                        <div className="extra" key={title}>
                            <span className="extra-icon"><Icon name={icon} /></span>
                            <div>
                                <h3>{title}</h3>
                                <p>{text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="wrap section">
                <div className="section-head">
                    <h2>Üç adımda başla</h2>
                    <p className="muted">Hesaplar davetle açılıyor.</p>
                </div>
                <ol className="steps">
                    <li className="step">
                        <span className="step-num">1</span>
                        <h3>Hesap iste</h3>
                        <p><Link to="/kayit">Kayıt formunu</Link> doldur; kullanıcı adın oyunda görünecek ad olur.</p>
                    </li>
                    <li className="step">
                        <span className="step-num">2</span>
                        <h3>Onay bekle</h3>
                        <p>Bir admin isteğini onaylayınca hesabın açılır.</p>
                    </li>
                    <li className="step">
                        <span className="step-num">3</span>
                        <h3>İndir ve oyna</h3>
                        <p><span className="mono">vulu-launcher-setup.exe</span>'yi çalıştır, aynı kullanıcı adı ve şifreyle gir.</p>
                    </li>
                </ol>
                <p className="note">
                    Windows ilk seferde SmartScreen uyarısı verebilir: <i>Ek bilgi → Yine de çalıştır</i>.
                </p>
            </section>

            <section className="wrap section">
                <div className="cta">
                    <img src={asset('img/logo.svg')} alt="" width="56" height="56" />
                    <div className="cta-text">
                        <h2>Hazırsan oyun başlasın.</h2>
                        <p className="muted">Kurulum bir dakika sürer, gerisini launcher halleder.</p>
                    </div>
                    <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                        <Icon name="download" size={18} /> İndir
                    </a>
                </div>
            </section>
        </>
    );
}

function Feature({ icon, kicker, title, text, points, visual, flip }) {
    return (
        <div className={'feature' + (flip ? ' flip' : '')}>
            <div className="feature-text">
                <span className="kicker"><Icon name={icon} size={16} /> {kicker}</span>
                <h2>{title}</h2>
                <p className="muted">{text}</p>
                <ul className="points">
                    {points.map(p => <li key={p}><Icon name="check" size={16} /> {p}</li>)}
                </ul>
            </div>
            <div className="feature-visual" aria-hidden="true">{visual}</div>
        </div>
    );
}

/* ── Arayüz canlandırmaları: launcher'ın görünümünü HTML ile taklit eder (gerçek veri değildir) ── */

function InstancesMock() {
    const rows = [
        ['V', 'Vanilla', '1.21.1', 'Vanilla', true],
        ['F', 'Fabric 1.21', '1.21.1', 'Fabric · 42 mod'],
        ['N', 'Teknoloji', '1.20.1', 'NeoForge · 186 mod'],
        ['Q', 'Hafif', '1.20.4', 'Quilt · 18 mod'],
    ];
    return (
        <div className="mock">
            <div className="mock-head"><span>Instance'larım</span><span className="mock-pill">+ Yeni</span></div>
            {rows.map(([letter, name, ver, info, active]) => (
                <div className={'mock-row' + (active ? ' active' : '')} key={name}>
                    <span className="mock-tile">{letter}</span>
                    <div className="mock-main"><b>{name}</b><small>{ver} · {info}</small></div>
                    {active && <span className="mock-play"><Icon name="play" size={12} /> Oyna</span>}
                </div>
            ))}
        </div>
    );
}

function PackMock() {
    const changes = [
        ['add', '+', 'Sodium', '0.6.0'],
        ['add', '+', 'Distant Horizons', '2.3.0'],
        ['up', '↑', 'Iris Shaders', '1.8.1'],
        ['up', '↑', 'Fabric API', '0.114.0'],
        ['del', '−', 'OptiFine', ''],
    ];
    return (
        <div className="mock">
            <div className="mock-head"><span>Survival paketi · v1.4</span><span className="mock-pill">Güncelle</span></div>
            <p className="mock-note">Son kurduğun sürümden bu yana:</p>
            {changes.map(([kind, sign, name, ver]) => (
                <div className="mock-change" key={name}>
                    <span className={'sign ' + kind}>{sign}</span>
                    <span>{name}</span>
                    <small className="mono">{ver}</small>
                </div>
            ))}
        </div>
    );
}

function ChatMock() {
    return (
        <div className="mock">
            <div className="mock-head"><span>Mesajlar · deniz</span><span className="mock-lock"><Icon name="lock" size={13} /> Şifreli</span></div>
            <div className="bubbles">
                <p className="bubble">akşam sunucuya giriyor musun?</p>
                <p className="bubble me">20:00'de oradayım, yeni paketi kurdum</p>
                <p className="bubble">süper, base'in fotosunu akışa attım</p>
                <div className="shot"><Icon name="image" size={18} /><span>yeni_base.png · 3 yorum</span></div>
            </div>
        </div>
    );
}

function ServerMock() {
    const servers = [
        ['Survival', '1.21.1 · Fabric', '6/20', '18 ms', true],
        ['Yaratıcı', '1.20.1 · Vanilla', '0/10', '22 ms', true],
        ['Etkinlik', '1.20.1 · NeoForge', '', '', false],
    ];
    return (
        <div className="mock">
            <div className="mock-head"><span>Sunucular</span></div>
            {servers.map(([name, ver, players, ping, online]) => (
                <div className="mock-row" key={name}>
                    <span className={'status-dot' + (online ? ' on' : '')} />
                    <div className="mock-main"><b>{name}</b><small>{ver}</small></div>
                    {online
                        ? <><small className="mock-stat mono">{players} · {ping}</small><span className="mock-pill">Bağlan</span></>
                        : <small className="mock-stat">Kapalı</small>}
                </div>
            ))}
        </div>
    );
}
