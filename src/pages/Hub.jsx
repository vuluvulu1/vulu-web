import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asset, githubRelease, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatDate, timeAgo } from '../components.jsx';
import { Reveal } from '../motion.jsx';
import { PRODUCTS } from '../products.js';
import Wordmark from '../Wordmark.jsx';

const STATS_REFRESH = 30 * 1000;

/** Ana sayfa: vulu'nun üç ürünü arasından seçim, canlı sayılar ve son sürümler. */
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
        <section className="wrap hub">
            <h1 className="hub-title"><Wordmark animate /></h1>
            <h2 className="hub-question">Ne için buradasın?</h2>
            <p className="lead">Devam etmek için aşağıdan birini seç.</p>

            <LiveStats />

            <div className="products">
                {PRODUCTS.map((p, i) => (
                    <Reveal key={p.slug} delay={i * 90}>
                        <Link to={'/' + p.slug} className="product-card">
                            <img src={asset(p.logo)} alt="" width="56" height="56" />
                            <h3>{p.name}</h3>
                            <p>{p.summary}</p>
                            <span className="product-meta">
                                {p.platforms}{releases[p.slug] && <> · <span className="mono">{releases[p.slug].tag}</span></>}
                            </span>
                            <span className="product-go">Sayfasına git →</span>
                        </Link>
                    </Reveal>
                ))}
            </div>

            {status === 'in' && (
                <p className="hub-account">
                    <b>{user.username}</b> olarak giriş yaptın. Duyurular, ekran görüntüleri ve paketler için{' '}
                    <Link to="/hesap">hesabına</Link> bakabilirsin.
                </p>
            )}

            <RecentReleases releases={releases} />
        </section>
    );
}

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

/** Üç ürünün son sürümleri, en yeniden eskiye; notların ilk maddesiyle. */
function RecentReleases({ releases }) {
    const items = PRODUCTS
        .map(p => ({ product: p, release: releases[p.slug] }))
        .filter(x => x.release?.publishedAt)
        .sort((a, b) => new Date(b.release.publishedAt) - new Date(a.release.publishedAt));
    if (!items.length) return null;

    return (
        <section className="section recent">
            <h2 className="section-title">Son güncellemeler</h2>
            <ol className="release-feed">
                {items.map(({ product: p, release: r }, i) => (
                    <Reveal as="li" key={p.slug} delay={i * 80}>
                        <img src={asset(p.logo)} alt="" width="36" height="36" />
                        <div className="grow">
                            <div className="release-head">
                                <Link to={'/' + p.slug}><b>{p.name}</b></Link>
                                <span className="mono">{r.tag}</span>
                                <small className="muted" title={formatDate(r.publishedAt)}>{timeAgo(r.publishedAt)}</small>
                            </div>
                            {firstNote(r.notes) && <p className="muted">{firstNote(r.notes)}</p>}
                        </div>
                    </Reveal>
                ))}
            </ol>
        </section>
    );
}

/** Sürüm notlarının ilk maddesi, biçim işaretleri temizlenmiş ve kısaltılmış hâlde. */
function firstNote(notes) {
    const line = (notes || '').split('\n').map(l => l.trim()).find(l => /^[-*•]\s+/.test(l));
    if (!line) return '';
    const text = line.replace(/^[-*•]\s+/, '').replace(/\*\*|`/g, '').replace(/\*([^*]+)\*/g, '$1');
    return text.length > 160 ? text.slice(0, 157).trimEnd() + '…' : text;
}
