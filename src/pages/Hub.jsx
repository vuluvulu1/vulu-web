import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asset, githubRelease, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatDate, timeAgo } from '../components.jsx';
import Icon from '../icons.jsx';
import { HeroTitle } from '../TitleEmbers.jsx';
import { CountUp, Reveal } from '../motion.jsx';
import { RisingEmbers } from '../effects.jsx';
import { PRODUCTS } from '../products.js';

/** Ana sayfa: "Ne için buradasın?" — vulu'nun üç ürünü arasından seçim, canlı sayılar ve son sürümler. */
export default function Hub() {
    const { status, user } = useAuth();
    const [releases, setReleases] = useState({});

    useEffect(() => {
        latestRelease().then(r => r && setReleases(v => ({ ...v, launcher: r })));
        for (const p of PRODUCTS.filter(p => p.repo)) {
            githubRelease(p.repo, p.asset).then(r => r && setReleases(v => ({ ...v, [p.slug]: r })));
        }
    }, []);

    return (
        <>
            <section className="hero hub">
                <div className="wrap hub-head">
                    <HeroTitle full={false} label="vulu: Minecraft launcher'ı, sunucu paneli ve görev editörü" className="hub-title" mode="forge" />
                    <h2 className="hub-question">Ne için buradasın?</h2>
                    <p className="hub-lead">Oynamak, kendi sunucunu kurmak ya da görev kitabını hazırlamak için yaptığımız ücretsiz araçlar. Hangisiyle başlamak istersin?</p>
                </div>
                <div className="wrap products">
                    {PRODUCTS.map((p, i) => (
                        <Link key={p.slug} to={'/' + p.slug} className="product-card" data-tilt="5" style={{ '--n': i }}>
                            <span className="product-logo-wrap"><img src={asset(p.logo)} alt="" width="64" height="64" /></span>
                            <h3>{p.name}</h3>
                            <p>{p.summary}</p>
                            <span className="product-meta">
                                {p.platforms}{releases[p.slug] && <> · <span className="mono">{releases[p.slug].tag}</span></>}
                            </span>
                            <span className="product-go">{p.slug === 'launcher' ? 'İndir ve oyna' : 'Göz at'} <Icon name="right" size={16} /></span>
                        </Link>
                    ))}
                </div>
                {status === 'in' && (
                    <p className="wrap hub-account">
                        Tekrar hoş geldin, <b>{user.username}</b>. Arkadaşlarının son paylaşımları ve kimin ne oynadığı <Link to="/hesap">akışında</Link> seni bekliyor.
                    </p>
                )}
            </section>

            <LiveNumbers />

            <div className="wrap home-grid">
                <Reveal as="section" className="home-block span-7">
                    <h2>Son güncellemeler</h2>
                    <RecentReleases releases={releases} />
                </Reveal>

                <Reveal as="section" className="home-block span-5 join" delay={80}>
                    <RisingEmbers rate={14} />
                    {status === 'in' ? <>
                        <h2>Akışta neler var</h2>
                        <p>Arkadaşlarının ekran görüntüleri, kimin ne oynadığı ve paketlerdeki son değişiklikler seni akışında bekliyor.</p>
                        <Link className="btn btn-primary" to="/hesap">Akışa git</Link>
                    </> : <>
                        <h2>Ücretsiz hesap</h2>
                        <p>
                            Bir hesapla arkadaşlarını ekler, onlarla mesajlaşır, ekran görüntülerini paylaşır ve hazır paketleri
                            kurarsın. Hesaplar şimdilik bir admin onayıyla açılıyor; genellikle uzun sürmez.
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
                    {stats.online ? <>Şu an <b>{stats.online}</b> kişi çevrimiçi{stats.playing > 0 && <>, <b>{stats.playing}</b> kişi oyunda</>}.</> : 'Şu an çevrimiçi kimse yok; ilk gelen sen ol.'}
                </p>
                <dl>
                    <div><dt>Üye</dt><dd><CountUp value={stats.members} /></dd></div>
                    <div><dt>Paket</dt><dd><CountUp value={stats.packs} /></dd></div>
                    <div><dt>Ekran görüntüsü</dt><dd><CountUp value={stats.shots} /></dd></div>
                    {stats.downloads?.total > 0 && <div><dt>İndirme</dt><dd><CountUp value={stats.downloads.total} /></dd></div>}
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
    if (!items.length) return <p className="muted small">Son sürümler yükleniyor…</p>;

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
