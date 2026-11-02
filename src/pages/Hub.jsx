import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ANDROID_URL, DOWNLOAD_URL, api, asset, githubRelease, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatDate, timeAgo } from '../components.jsx';
import Icon from '../icons.jsx';
import Wordmark from '../Wordmark.jsx';
import { Reveal } from '../motion.jsx';
import { PRODUCTS } from '../products.js';

// Launcher'ın yapabildikleri; yalnızca launcher sayfasında da anlatılan, gerçekten var olan özellikler
const ABILITIES = [
    ['Mod ve paket kur', 'CurseForge ve Modrinth\'teki modları, kaynak paketlerini ve shader\'ları launcher\'dan çıkmadan ara ve kur.'],
    ['Hazır paketlerle oyna', 'vulu Packs\'teki paketleri tek tıkla kur. Paket güncellenince hangi modun eklenip hangisinin çıkarıldığını görürsün.'],
    ['Sunuculara bağlan', 'Sunucunun açık olup olmadığını ve içeride kaç kişi olduğunu gör, Bağlan\'a basınca doğrudan içeri gir.'],
    ['Çökmeyi anla', 'Oyun çökerse launcher kayıtları okur ve sorunun nereden çıktığını sade bir dille anlatır.'],
    ['Arkadaşlarınla buluş', 'Kim çevrimiçi, kim ne oynuyor gör; şifreli mesajlaş, ekran görüntülerini paylaş.'],
];

/** Ana sayfa: launcher'ı tanıtır, canlı sayıları ve son sürümleri gösterir, diğer araçlara yönlendirir. */
export default function Hub() {
    const { status } = useAuth();
    const [releases, setReleases] = useState({});

    useEffect(() => {
        latestRelease().then(r => r && setReleases(v => ({ ...v, launcher: r })));
        for (const p of PRODUCTS.filter(p => p.repo)) {
            githubRelease(p.repo, p.asset).then(r => r && setReleases(v => ({ ...v, [p.slug]: r })));
        }
    }, []);

    const launcher = releases.launcher;
    const tools = PRODUCTS.filter(p => p.slug !== 'launcher');

    return (
        <>
            <section className="hero">
                <div className="wrap hero-grid">
                    <div className="hero-text">
                        <h1 className="hero-title"><Wordmark full animate /><span className="sr-only">vulu Launcher</span></h1>
                        <p className="lead">
                            Mod ve paket kur, sunuculara tek tıkla bağlan, arkadaşlarınla aynı oyunda buluş. Java'yı, mod
                            yükleyicileri ve güncellemeleri launcher halleder.
                        </p>
                        <div className="hero-actions">
                            <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}><Icon name="windows" size={18} /> Windows için indir</a>
                            <Link className="btn btn-lg" to="/launcher">Neler yapabildiğine bak</Link>
                        </div>
                        <p className="hero-meta">
                            Ücretsiz ve açık kaynak{launcher && <> · <span className="mono">{launcher.tag}</span></>} · Windows 10 ve 11 ·{' '}
                            <a href={ANDROID_URL}>Android deneme sürümü</a>
                        </p>
                    </div>
                    <div className="hero-shot">
                        <img src={asset('img/home.png')} alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" />
                    </div>
                </div>
            </section>

            <LiveNumbers />

            <div className="wrap home-grid">
                <Reveal as="section" className="home-block span-7">
                    <h2>Neler yapabilirsin</h2>
                    <ul className="rows">
                        {ABILITIES.map(([title, text]) => <li key={title}><b>{title}.</b> {text}</li>)}
                    </ul>
                    <p className="more"><Link to="/launcher">Launcher'ın bütün özellikleri</Link></p>
                </Reveal>

                <Reveal as="section" className="home-block span-5" delay={80}>
                    <h2>Son güncellemeler</h2>
                    <RecentReleases releases={releases} />
                </Reveal>

                <Reveal as="section" className="home-block span-7">
                    <h2>Paket ya da sunucu hazırlayanlar için</h2>
                    <div className="tools">
                        {tools.map(p => (
                            <Link key={p.slug} to={'/' + p.slug} className="tool">
                                <img src={asset(p.logo)} alt="" width="44" height="44" />
                                <span>
                                    <b>{p.name}</b>
                                    <span>{p.summary}</span>
                                    <small>{p.platforms}{releases[p.slug] && <> · <span className="mono">{releases[p.slug].tag}</span></>}</small>
                                </span>
                            </Link>
                        ))}
                    </div>
                </Reveal>

                <Reveal as="section" className="home-block span-5 join" delay={80}>
                    {status === 'in' ? <>
                        <h2>Akışta neler var</h2>
                        <p>Arkadaşlarının paylaştığı ekran görüntüleri, kimin ne oynadığı ve paket güncellemeleri akışında.</p>
                        <Link className="btn btn-primary" to="/hesap">Akışa git</Link>
                    </> : <>
                        <h2>Ücretsiz hesap</h2>
                        <p>
                            Hesapla arkadaş ekler, mesajlaşır, ekran görüntüsü paylaşır ve hazır paketleri kurarsın. Hesaplar şimdilik
                            bir admin onayıyla açılıyor.
                        </p>
                        <div className="row">
                            <Link className="btn btn-primary" to="/kayit">Katılma isteği gönder</Link>
                            <Link className="btn btn-quiet" to="/giris">Giriş yap</Link>
                        </div>
                    </>}
                </Reveal>
            </div>
        </>
    );
}

const NUMBERS_REFRESH = 30 * 1000;

/** Herkese açık canlı sayılar: şu an kaç kişi çevrimiçi, kaç üye, paket ve ekran görüntüsü. */
function LiveNumbers() {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const load = () => api.stats().then(s => { if (!cancelled) setStats(s); }).catch(() => {});
        load();
        const id = setInterval(load, NUMBERS_REFRESH);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    return (
        <section className="wrap numbers" aria-label="Şu an vulu'da">
            {stats ? <>
                <p className="numbers-live">
                    <span className={'fire' + (stats.online ? '' : ' out')} />
                    {stats.online ? <>Şu an <b>{stats.online}</b> kişi çevrimiçi{stats.playing > 0 && <>, <b>{stats.playing}</b> kişi oyunda</>}.</> : 'Şu an çevrimiçi kimse yok.'}
                </p>
                <dl>
                    <div><dt>Üye</dt><dd>{stats.members}</dd></div>
                    <div><dt>Paket</dt><dd>{stats.packs}</dd></div>
                    <div><dt>Ekran görüntüsü</dt><dd>{stats.shots}</dd></div>
                    {stats.downloads?.total > 0 && <div><dt>İndirme</dt><dd>{stats.downloads.total}</dd></div>}
                </dl>
            </> : <p className="numbers-live placeholder" aria-hidden="true" />}
        </section>
    );
}

/** Üç ürünün son sürümleri, en yeniden eskiye; notların ilk maddesiyle. */
function RecentReleases({ releases }) {
    const items = PRODUCTS
        .map(p => ({ product: p, release: releases[p.slug] }))
        .filter(x => x.release?.publishedAt)
        .sort((a, b) => new Date(b.release.publishedAt) - new Date(a.release.publishedAt));
    if (!items.length) return <p className="muted small">Sürümler yükleniyor…</p>;

    return (
        <ol className="rows releases">
            {items.map(({ product: p, release: r }) => (
                <li key={p.slug}>
                    <div className="row-tight">
                        <Link to={'/' + p.slug} className="grow"><b>{p.name}</b> <span className="mono">{r.tag}</span></Link>
                        <small className="muted" title={formatDate(r.publishedAt)}>{timeAgo(r.publishedAt)}</small>
                    </div>
                    {firstNote(r.notes) && <p className="muted">{firstNote(r.notes)}</p>}
                </li>
            ))}
        </ol>
    );
}

/** Sürüm notlarının ilk maddesi, biçim işaretleri temizlenmiş ve kısaltılmış hâlde. */
function firstNote(notes) {
    const line = (notes || '').split('\n').map(l => l.trim()).find(l => /^[-*•]\s+/.test(l));
    if (!line) return '';
    const text = line.replace(/^[-*•]\s+/, '').replace(/\*\*|`/g, '').replace(/\*([^*]+)\*/g, '$1');
    return text.length > 160 ? text.slice(0, 157).trimEnd() + '…' : text;
}
