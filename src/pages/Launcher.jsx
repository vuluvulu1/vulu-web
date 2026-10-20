import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ANDROID_URL, DOWNLOAD_URL, androidRelease, api, asset, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import Icon from '../icons.jsx';
import Wordmark from '../Wordmark.jsx';
import { ReleaseNotes, formatDate } from '../components.jsx';
import { Reveal, reducedMotion, useTicker } from '../motion.jsx';

const EXTRAS = [
    ['Çökme yardımcısı', 'Oyun çökerse launcher kayıtları okur ve sorunun nereden çıktığını sade bir dille anlatır.'],
    ['Dünya yedekleri', 'Dünyanın yedeğini tek tıkla al; bir şey ters giderse aynı kolaylıkla geri yükle.'],
    ['Oynama süresi', 'Hangi instance\'ta ne kadar oynadığını görürsün; istersen profilinde de gösterirsin.'],
    ['Skinler', 'Skinini launcher\'dan değiştir, oyunda arkadaşların da onu görsün.'],
    ['Discord durumu', 'Ne oynadığın Discord profilinde görünür; arkadaşların launcher\'ı oradan indirebilir.'],
    ['Temalar', 'Classic, Neon ve Atlas temalarından sana uyanı seç.'],
    ['Müzik', 'Launcher açıkken arkada müzik çalar; sesini ayarlardan kısabilir ya da tamamen kapatabilirsin.'],
    ['Güvenli güncellemeler', 'Launcher kendini günceller ve imzası doğrulanmayan hiçbir sürümü kurmaz.'],
];

export default function Launcher() {
    const { status } = useAuth();
    const [release, setRelease] = useState(null);
    const [android, setAndroid] = useState(null);
    useEffect(() => { latestRelease().then(setRelease); androidRelease().then(setAndroid); }, []);

    return (
        <>
            <section className="wrap hero">
                <div className="hero-text">
                    <h1 className="hero-title"><Wordmark full animate /><span className="sr-only">vulu Launcher: ücretsiz Türkçe Minecraft launcher'ı</span></h1>
                    <p className="lead">
                        vulu Launcher, Minecraft'ı kurmayı, modlamayı ve oynamayı tek bir uygulamada toplar.
                        Java'yı, mod yükleyicileri ve güncellemeleri senin yerine o halleder.
                    </p>
                    <div className="hero-actions">
                        <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                            <Icon name="windows" size={18} /> Windows için indir
                        </a>
                        {android && (
                            <a className="btn btn-lg" href="#android">
                                <Icon name="android" size={18} /> Android (önizleme)
                            </a>
                        )}
                        {status !== 'in'
                            ? <Link className="btn btn-lg" to="/kayit">Katıl</Link>
                            : <Link className="btn btn-lg" to="/hesap">Hesabım</Link>}
                    </div>
                    <p className="hero-meta">
                        {release ? <span className="mono">{release.tag}</span> : 'Beta'} · Windows 10 ve 11 · Ücretsiz
                    </p>
                    <LiveStats />
                </div>
                <img className="hero-shot" src={asset('img/home.png')} alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" />
            </section>

            <section className="wrap features">
                <Feature
                    label="Instance'lar"
                    title="Her oyun için ayrı bir instance"
                    visual={<InstancesMock />}
                >
                    Vanilla, Fabric, Quilt, Forge ya da NeoForge ile istediğin kadar instance aç. Her birinin sürümü,
                    modları, RAM ayarı ve dünyaları birbirinden ayrı durur. Hangi Java sürümü gerekiyorsa launcher
                    onu kendisi indirir.
                </Feature>
                <Feature
                    label="Modlar ve paketler"
                    title="Modları launcher'dan çıkmadan kur"
                    visual={<PackMock />}
                    flip
                >
                    Modrinth'teki modları, kaynak paketlerini, shader'ları ve modpack'leri launcher'ın içinden ara ve kur.
                    vulu Packs'teki hazır paketleri tek tıkla kurarsın; bir paket güncellendiğinde neyin eklenip neyin
                    çıkarıldığını da görürsün.
                </Feature>
                <Feature
                    label="Sosyal"
                    title="Arkadaşların da burada"
                    visual={<ChatMock />}
                >
                    Oyunda aldığın ekran görüntülerini akışa at, arkadaşlarının paylaştıklarına yorum yaz. Arkadaş
                    listende kimin çevrimiçi olduğunu ve kimin ne oynadığını görürsün. Mesajların uçtan uca şifrelenir;
                    sunucu bile içlerini okuyamaz.
                </Feature>
                <Feature
                    label="Sunucular"
                    title="Sunucuya tek tıkla bağlan"
                    visual={<ServerMock />}
                    flip
                >
                    Sunucular sekmesi her sunucunun açık olup olmadığını, içeride kaç kişi olduğunu ve gecikmeyi
                    gösterir. Bağlan'a bastığında oyun açılır ve doğrudan sunucuya girersin.
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

            {android && (
                <Reveal as="section" className="wrap section start" id="android">
                    <h2 className="section-title">Android önizlemesi</h2>
                    <p className="muted">
                        Launcher'ın telefon sürümü: aynı hesap, sosyal akış, mesajlar, paketler ve sunucular. Telefon
                        ekranına göre yeniden tasarlandı. <b>Oyunu henüz telefonda açmıyor</b>; Minecraft'ı şimdilik
                        bilgisayardan oynaman gerekiyor.
                    </p>
                    <p className="muted small">
                        <span className="mono">{android.tag}</span> · {formatDate(android.publishedAt)}
                        {android.sizeMb ? <> · {android.sizeMb} MB</> : null} · Android 8 ve üstü
                    </p>
                    {android.notes && <ReleaseNotes text={android.notes} />}
                    <p className="note">
                        Play Store'da değil, dosyayı doğrudan kuruyorsun. Telefon "bilinmeyen kaynaklardan yükleme" izni
                        isteyebilir; izni verip kurulumu tamamla. Yeni sürüm çıkınca uygulama kendisi haber verir.
                    </p>
                    <a className="btn btn-primary btn-lg" href={ANDROID_URL}>
                        <Icon name="android" size={18} /> APK'yı indir
                    </a>
                </Reveal>
            )}

            <Reveal as="section" className="wrap section start">
                <h2 className="section-title">Nasıl başlanır</h2>
                <p className="muted">Hesaplar davetle açılıyor, o yüzden önce bir katılma isteği göndermen gerekiyor.</p>
                <ol className="steps">
                    <li><span><Link to="/kayit">Katılma formunu</Link> doldur ve isteğini gönder.</span></li>
                    <li><span>Bir admin isteğini onaylayınca hesabın açılır.</span></li>
                    <li><span>Kurulum dosyasını indirip çalıştır, ardından aynı kullanıcı adı ve şifreyle giriş yap.</span></li>
                </ol>
                <p className="note">
                    Windows ilk açılışta bir SmartScreen uyarısı gösterebilir. <i>Ek bilgi</i>'ye, ardından
                    {' '}<i>Yine de çalıştır</i>'a tıklaman yeterli.
                </p>
                <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                    <Icon name="download" size={18} /> Kurulum dosyasını indir
                </a>
            </Reveal>
        </>
    );
}

const STATS_REFRESH = 30 * 1000;

/** "Şu an 3 oyuncu aktif." satırı (launcher'ı açık olanlar, oyunda olanlar dahil); 30 sn'de bir yenilenir. */
function LiveStats() {
    const [online, setOnline] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const load = () => api.stats().then(s => { if (!cancelled) setOnline(s.online); }).catch(() => {});
        load();
        const id = setInterval(load, STATS_REFRESH);
        return () => { cancelled = true; clearInterval(id); };
    }, []);
    if (online === null) return <p className="live-now placeholder" aria-hidden="true" />;

    return (
        <Reveal as="p" className="live-now">
            <span className={'live-dot' + (online > 0 ? ' on' : '')} />
            <span>{online > 0 ? <>Şu an <b>{online}</b> oyuncu aktif.</> : 'Şu an aktif oyuncu yok.'}</span>
        </Reveal>
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
