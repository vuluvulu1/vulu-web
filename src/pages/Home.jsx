import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DOWNLOAD_URL, asset, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import Icon from '../icons.jsx';

const EXTRAS = [
    ['Çökme yardımcısı', 'Oyun çökerse launcher kayıtları okur ve soruna hangi modun yol açtığını söyler.'],
    ['Dünya yedekleri', 'Dünyalarını tek tıkla yedekleyebilir, gerektiğinde geri yükleyebilirsin.'],
    ['Oynama süresi', 'Her instance\'ta ne kadar oynadığın kaydedilir.'],
    ['Skinler', 'Skinini launcher\'dan değiştirebilirsin.'],
    ['Discord durumu', 'Ne oynadığın Discord profilinde görünür.'],
    ['Temalar', 'Launcher\'ı Classic, Neon veya Atlas temasıyla kullanabilirsin.'],
    ['Müzik', 'Launcher açıkken arka planda müzik çalar; sesini ayarlardan değiştirebilirsin.'],
    ['Güvenli güncellemeler', 'Launcher kendini günceller ve imzası doğrulanmayan bir sürümü kurmaz.'],
];

export default function Home() {
    const { status } = useAuth();
    const [release, setRelease] = useState(null);
    useEffect(() => { latestRelease().then(setRelease); }, []);

    return (
        <>
            <section className="wrap hero">
                <h1 className="hero-title">vulu<span>Launcher</span></h1>
                <p className="lead">
                    vulu Launcher, Minecraft'ı kurmayı, modlamayı ve oynamayı tek bir uygulamada toplar.
                    Java'yı, mod yükleyicileri ve güncellemeleri senin yerine o halleder.
                </p>
                <div className="hero-actions">
                    <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                        <Icon name="windows" size={18} /> Windows için indir
                    </a>
                    {status !== 'in'
                        ? <Link className="btn btn-lg" to="/kayit">Hesap iste</Link>
                        : <Link className="btn btn-lg" to="/hesap">Hesabım</Link>}
                </div>
                <p className="hero-meta">
                    {release ? <span className="mono">{release.tag}</span> : 'Beta'} · Windows 10 ve 11 · Ücretsiz
                </p>
                <img className="hero-shot" src={asset('img/home.png')} alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" />
            </section>

            <section className="wrap features">
                <Feature
                    label="Instance'lar"
                    title="Her instance kendi ayarlarıyla çalışır"
                    visual={<InstancesMock />}
                >
                    Vanilla, Fabric, Quilt, Forge veya NeoForge ile istediğin kadar instance oluşturabilirsin.
                    Her birinin sürümü, modları, RAM ayarı ve dünyaları ayrı tutulur. Gereken Java sürümünü
                    launcher kendisi indirir.
                </Feature>
                <Feature
                    label="Modlar ve paketler"
                    title="Modları launcher'dan çıkmadan kurabilirsin"
                    visual={<PackMock />}
                    flip
                >
                    Modrinth'teki modları, kaynak paketlerini, shader'ları ve modpack'leri launcher içinde arayıp
                    kurabilirsin. vulu Packs'teki hazır paketleri ise tek tıkla kurarsın. Bir paket güncellendiğinde,
                    kurduğun sürümden bu yana nelerin değiştiğini görürsün.
                </Feature>
                <Feature
                    label="Sosyal"
                    title="Ekran görüntülerini ve mesajlarını launcher'da paylaşırsın"
                    visual={<ChatMock />}
                >
                    Ekran görüntülerini akışa atabilir, başkalarınınkine yorum yazabilirsin. Arkadaş listende kimin
                    çevrimiçi olduğunu görürsün. Mesajlar uçtan uca şifrelendiği için sunucu bile içeriklerini okuyamaz.
                </Feature>
                <Feature
                    label="Sunucular"
                    title="Sunuculara tek tıkla bağlanırsın"
                    visual={<ServerMock />}
                    flip
                >
                    Sunucular sekmesinde her sunucunun açık olup olmadığını, kaç kişinin oynadığını ve gecikmeyi
                    görürsün. Bağlan'a bastığında oyun açılır ve doğrudan sunucuya girersin.
                </Feature>
            </section>

            <section className="wrap section">
                <h2 className="section-title">Diğer özellikler</h2>
                <dl className="extras">
                    {EXTRAS.map(([title, text]) => (
                        <div key={title}>
                            <dt>{title}</dt>
                            <dd>{text}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="wrap section start">
                <h2 className="section-title">Nasıl başlanır</h2>
                <p className="muted">Hesaplar davetle açılıyor, bu yüzden önce bir hesap istemen gerekiyor.</p>
                <ol className="steps">
                    <li><span><Link to="/kayit">Kayıt formunu</Link> doldurarak hesap iste.</span></li>
                    <li><span>Bir admin isteğini onayladığında hesabın açılır.</span></li>
                    <li><span>Kurulum dosyasını indirip çalıştır ve aynı kullanıcı adı ile şifreyle giriş yap.</span></li>
                </ol>
                <p className="note">
                    Windows ilk açılışta SmartScreen uyarısı gösterebilir. Bu durumda <i>Ek bilgi</i> ve ardından
                    {' '}<i>Yine de çalıştır</i> seçeneğine tıkla.
                </p>
                <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                    <Icon name="download" size={18} /> Kurulum dosyasını indir
                </a>
            </section>
        </>
    );
}

function Feature({ label, title, visual, flip, children }) {
    return (
        <article className={'feature' + (flip ? ' flip' : '')}>
            <div className="feature-text">
                <p className="feature-label">{label}</p>
                <h2>{title}</h2>
                <p className="muted">{children}</p>
            </div>
            <div className="feature-visual" aria-hidden="true">{visual}</div>
        </article>
    );
}

/* ── Arayüz örnekleri: launcher'ın görünümünü HTML ile taklit eder, içerikleri temsilidir ── */

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
    const versions = [
        ['1.4', '12 Ekim', [['add', 3, 'eklendi'], ['up', 5, 'güncellendi'], ['del', 1, 'kaldırıldı']], true],
        ['1.3', '28 Eylül', [['up', 2, 'güncellendi']]],
        ['1.2', '9 Eylül', [['add', 1, 'eklendi'], ['up', 4, 'güncellendi']]],
    ];
    return (
        <div className="mock">
            <div className="mock-head"><span>Survival paketi · değişiklikler</span><span className="mock-pill">Güncelle</span></div>
            {versions.map(([ver, date, changes, isNew]) => (
                <div className={'mock-version' + (isNew ? ' new' : '')} key={ver}>
                    <div className="mock-version-top">
                        <b className="mono">v{ver}</b>
                        <small>{date}</small>
                        {isNew && <span className="mock-new">Yeni</span>}
                    </div>
                    <div className="mock-counts">
                        {changes.map(([kind, n, text]) => (
                            <span key={kind}><i className={'sign ' + kind} />{n} mod {text}</span>
                        ))}
                    </div>
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
                <p className="bubble">süper, base'in fotoğrafını akışa attım</p>
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
