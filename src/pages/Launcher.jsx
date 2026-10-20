import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DOWNLOAD_URL, asset, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import Icon from '../icons.jsx';
import Wordmark from '../Wordmark.jsx';
import { ReleaseNotes, formatDate } from '../components.jsx';
import { Reveal, reducedMotion, useTicker } from '../motion.jsx';

const EXTRAS = [
    ['Çökme yardımcısı', 'Oyun çökünce kayıtları okur ve sorunun olası sebebini gösterir.'],
    ['Dünya yedekleri', 'Dünyalar tek tıkla yedeklenir ve geri yüklenir.'],
    ['Oynama süresi', 'Her instance\'ta geçirilen süre kaydedilir.'],
    ['Skinler', 'Skin launcher içinden değiştirilir.'],
    ['Discord durumu', 'Oynanan instance Discord profilinde görünür.'],
    ['Temalar', 'Classic, Neon ve Atlas temaları arasından seçim yapılır.'],
    ['Müzik', 'Launcher açıkken arka planda müzik çalar. Ses seviyesi ayarlardan değiştirilir.'],
    ['Güvenli güncellemeler', 'Launcher kendini günceller. İmzası doğrulanmayan sürümler kurulmaz.'],
];

export default function Launcher() {
    const { status } = useAuth();
    const [release, setRelease] = useState(null);
    useEffect(() => { latestRelease().then(setRelease); }, []);

    return (
        <>
            <section className="wrap hero">
                <div className="hero-text">
                    <h1 className="hero-title"><Wordmark full animate /></h1>
                    <p className="lead">
                        vulu Launcher, Minecraft'ı kurmayı, modlamayı ve oynamayı tek bir uygulamada toplar.
                        Java'yı, mod yükleyicileri ve güncellemeleri senin yerine o halleder.
                    </p>
                    <div className="hero-actions">
                        <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                            <Icon name="windows" size={18} /> Windows için indir
                        </a>
                        {status !== 'in'
                            ? <Link className="btn btn-lg" to="/kayit">Katıl</Link>
                            : <Link className="btn btn-lg" to="/hesap">Hesabım</Link>}
                    </div>
                    <p className="hero-meta">
                        {release ? <span className="mono">{release.tag}</span> : 'Beta'} · Windows 10 ve 11 · Ücretsiz
                    </p>
                </div>
                <img className="hero-shot" src={asset('img/home.png')} alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" />
            </section>

            <section className="wrap features">
                <Feature
                    label="Instance'lar"
                    title="Her instance'ın kendi ayarları var"
                    visual={<InstancesMock />}
                >
                    Vanilla, Fabric, Quilt, Forge ve NeoForge desteklenir. Her instance'ın sürümü, modları,
                    RAM ayarı ve dünyaları ayrı tutulur. Gereken Java sürümü otomatik olarak indirilir.
                </Feature>
                <Feature
                    label="Modlar ve paketler"
                    title="Modlar ve paketler launcher içinden kurulur"
                    visual={<PackMock />}
                    flip
                >
                    Modrinth'teki modlar, kaynak paketleri, shader'lar ve modpack'ler launcher içinde aranıp kurulur.
                    vulu Packs'teki paketler tek tıkla kurulur. Bir paket güncellendiğinde, kurulu sürümden bu yana
                    yapılan değişiklikler listelenir.
                </Feature>
                <Feature
                    label="Sosyal"
                    title="Ekran görüntüleri, arkadaşlar ve mesajlar"
                    visual={<ChatMock />}
                >
                    Ekran görüntüleri ortak bir akışta paylaşılır ve yorumlanabilir. Arkadaş listesinde kimin çevrimiçi
                    olduğu görünür. Mesajlar uçtan uca şifrelenir, bu yüzden sunucu içeriklerini okuyamaz.
                </Feature>
                <Feature
                    label="Sunucular"
                    title="Sunucuların durumu tek listede"
                    visual={<ServerMock />}
                    flip
                >
                    Sunucular sekmesi her sunucunun açık olup olmadığını, oyuncu sayısını ve gecikmeyi gösterir.
                    Bağlan'a basıldığında oyun açılır ve doğrudan sunucuya girilir.
                </Feature>
            </section>

            <Reveal as="section" className="wrap section">
                <h2 className="section-title">Diğer özellikler</h2>
                <dl className="extras">
                    {EXTRAS.map(([title, text]) => (
                        <div key={title}>
                            <dt>{title}</dt>
                            <dd>{text}</dd>
                        </div>
                    ))}
                </dl>
            </Reveal>

            {release?.notes && (
                <Reveal as="section" className="wrap section">
                    <h2 className="section-title">Son sürümde neler var</h2>
                    <p className="muted small"><span className="mono">{release.tag}</span> · {formatDate(release.publishedAt)}</p>
                    <ReleaseNotes text={release.notes} />
                </Reveal>
            )}

            <Reveal as="section" className="wrap section start">
                <h2 className="section-title">Nasıl başlanır</h2>
                <p className="muted">Hesaplar davetle açılır, bu yüzden önce bir katılma isteği gönderilmesi gerekir.</p>
                <ol className="steps">
                    <li><span><Link to="/kayit">Katılma formunu</Link> doldurarak istek gönder.</span></li>
                    <li><span>Bir admin isteğini onayladığında hesabın açılır.</span></li>
                    <li><span>Kurulum dosyasını indirip çalıştır ve aynı kullanıcı adı ile şifreyle giriş yap.</span></li>
                </ol>
                <p className="note">
                    Windows ilk açılışta SmartScreen uyarısı gösterebilir. Bu durumda <i>Ek bilgi</i> ve ardından
                    {' '}<i>Yine de çalıştır</i> seçilerek devam edilir.
                </p>
                <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                    <Icon name="download" size={18} /> Kurulum dosyasını indir
                </a>
            </Reveal>
        </>
    );
}

function Feature({ label, title, visual, flip, children }) {
    return (
        <Reveal as="article" className={'feature' + (flip ? ' flip' : '')}>
            <div className="feature-text">
                <p className="feature-label">{label}</p>
                <h2>{title}</h2>
                <p className="muted">{children}</p>
            </div>
            <div className="feature-visual" aria-hidden="true">{visual}</div>
        </Reveal>
    );
}

/* ── Arayüz örnekleri: launcher'ın görünümünü HTML ile taklit eder, içerikleri temsilidir ──
   Ekranda görünürken kendi kendine çalışırlar; "hareketi azalt" açıksa son hâllerinde dururlar. */

function InstancesMock() {
    // Döngü: Oyna → hazırlanıyor (dolan çubuk) → oynanıyor → başa
    const [ref, tick] = useTicker(1400);
    const phase = reducedMotion() ? 0 : tick % 6;
    const state = phase < 2 ? 'idle' : phase < 4 ? 'preparing' : 'playing';
    const rows = [
        ['V', 'Vanilla', '1.21.1', 'Vanilla', true],
        ['F', 'Fabric 1.21', '1.21.1', 'Fabric · 42 mod'],
        ['N', 'Teknoloji', '1.20.1', 'NeoForge · 186 mod'],
        ['Q', 'Hafif', '1.20.4', 'Quilt · 18 mod'],
    ];
    return (
        <div className="mock" ref={ref}>
            <div className="mock-head"><span>Instance'larım</span><span className="mock-pill">+ Yeni</span></div>
            {rows.map(([letter, name, ver, info, active]) => (
                <div className={'mock-row' + (active ? ' active' : '')} key={name}>
                    <span className="mock-tile">{letter}</span>
                    <div className="mock-main">
                        <b>{name}</b>
                        <small>{active && state === 'playing' ? <span className="mock-live">Oynanıyor · 3 dk</span> : `${ver} · ${info}`}</small>
                        {active && state === 'preparing' && <span className="mock-progress"><i key={tick} /></span>}
                    </div>
                    {active && (state === 'idle'
                        ? <span className="mock-play"><Icon name="play" size={12} /> Oyna</span>
                        : <span className="mock-play busy">{state === 'preparing' ? 'Hazırlanıyor' : 'Açık'}</span>)}
                </div>
            ))}
        </div>
    );
}

function PackMock() {
    // Döngü: Güncelle → Güncelleniyor… → Güncel
    const [ref, tick] = useTicker(1300);
    const phase = reducedMotion() ? 0 : tick % 5;
    const pill = phase < 2 ? ['Güncelle', ''] : phase < 3 ? ['Güncelleniyor…', ' busy'] : ['Güncel ✓', ' done'];
    const versions = [
        ['1.4', '12 Ekim', [['add', 3, 'eklendi'], ['up', 5, 'güncellendi'], ['del', 1, 'kaldırıldı']], true],
        ['1.3', '28 Eylül', [['up', 2, 'güncellendi']]],
        ['1.2', '9 Eylül', [['add', 1, 'eklendi'], ['up', 4, 'güncellendi']]],
    ];
    return (
        <div className="mock" ref={ref}>
            <div className="mock-head"><span>Survival paketi · değişiklikler</span><span className={'mock-pill' + pill[1]}>{pill[0]}</span></div>
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

const CHAT = [
    ['them', 'akşam sunucuya giriyor musun?'],
    ['me', '20:00\'de oradayım, yeni paketi kurdum'],
    ['them', 'süper, base\'in fotoğrafını akışa attım'],
    ['shot', 'yeni_base.png · 3 yorum'],
];

function ChatMock() {
    // Mesajlar sırayla gelir; gelmeden önce "yazıyor" görünür. Sonda kısa bir bekleme, sonra baştan.
    const [ref, tick] = useTicker(1100);
    const step = reducedMotion() ? CHAT.length * 2 : tick % (CHAT.length * 2 + 3);
    const shown = Math.min(CHAT.length, Math.floor(step / 2));
    const typing = !reducedMotion() && shown < CHAT.length && step % 2 === 1;
    return (
        <div className="mock" ref={ref}>
            <div className="mock-head"><span>Mesajlar · deniz</span><span className="mock-lock"><Icon name="lock" size={13} /> Şifreli</span></div>
            <div className="bubbles">
                {CHAT.slice(0, shown).map(([who, text]) => (who === 'shot'
                    ? <div className="shot pop" key={text}><Icon name="image" size={18} /><span>{text}</span></div>
                    : <p className={'bubble pop' + (who === 'me' ? ' me' : '')} key={text}>{text}</p>))}
                {typing && <p className={'bubble typing' + (CHAT[shown][0] === 'me' ? ' me' : '')}><i /><i /><i /></p>}
            </div>
        </div>
    );
}

function ServerMock() {
    // Oyuncu sayısı ve gecikme küçük adımlarla değişir; "Etkinlik" arada bir açılır
    const [ref, tick] = useTicker(1800);
    const wave = n => Math.round(Math.sin(tick * 0.9 + n) * 1.5);
    const eventOpen = !reducedMotion() && tick % 8 >= 4;
    const servers = [
        ['Survival', '1.21.1 · Fabric', `${6 + wave(0)}/20`, `${18 + wave(2)} ms`, true],
        ['Yaratıcı', '1.20.1 · Vanilla', `${Math.max(0, 1 + wave(4))}/10`, `${22 + wave(1)} ms`, true],
        ['Etkinlik', '1.20.1 · NeoForge', '0/30', '31 ms', eventOpen],
    ];
    return (
        <div className="mock" ref={ref}>
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
