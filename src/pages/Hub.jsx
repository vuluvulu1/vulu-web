import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asset, githubRelease, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatDate, timeAgo } from '../components.jsx';
import Icon from '../icons.jsx';
import { HeroTitle } from '../TitleEmbers.jsx';
import { Reveal } from '../motion.jsx';
import { PRODUCTS } from '../products.js';

/** Ana sayfa: üç uygulama, kimin çevrimiçi olduğu ve son sürümler. */
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
                            <span className="product-go">İndir <Icon name="right" size={16} /></span>
                        </Link>
                    ))}
                </div>
                {status === 'in' && (
                    <p className="wrap hub-account">
                        Hoş geldin, <b>{user.username}</b>. <Link to="/hesap">Akışa git</Link>
                    </p>
                )}
            </section>

            <LiveNumbers />

            <Reveal as="section" className="wrap section">
                <h2 className="section-title">Son güncellemeler</h2>
                <RecentReleases releases={releases} />
            </Reveal>
        </>
    );
}

const NUMBERS_REFRESH = 30 * 1000;

/** Şu an kaç kişinin çevrimiçi olduğu; 30 sn'de bir yenilenir. */
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
            {stats ? (
                <p className="numbers-live">
                    <span className={'fire' + (stats.online ? '' : ' out')} />
                    {stats.online ? <>Şu an <b>{stats.online}</b> kişi çevrimiçi{stats.playing > 0 && <>, <b>{stats.playing}</b> kişi oyunda</>}.</> : 'Şu an çevrimiçi kimse yok.'}
                </p>
            ) : <p className="numbers-live placeholder" aria-hidden="true" />}
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
