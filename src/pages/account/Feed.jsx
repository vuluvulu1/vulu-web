import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { AuthImage, Avatar, Empty, formatDate, timeAgo, useLoad, useUsers } from '../../components.jsx';
import Icon from '../../icons.jsx';
import { describePresence, friendAction, useFriends, usePresence } from '../../social.js';
import { ChangeCounts } from './Packs.jsx';
import ShareShot from './ShareShot.jsx';
import { sparkBurst } from '../../effects.jsx';
import { ShotDialog, useLike, useShotPages, useShotViewer } from './ShotDialog.jsx';

/** Akış: üstte sana gelenler, ortada paylaşılan ekran görüntüleri; yanda kim oynuyor, sunucular ve paket güncellemeleri. */
export default function Feed() {
    const { user } = useAuth();
    const users = useUsers();
    const list = useShotPages();
    const [viewer, open] = useShotViewer(list);

    return (
        <div className="feed">
            <div className="feed-main">
                <header className="feed-head">
                    <h1>Merhaba, <span className="glow-text">{user.username}</span></h1>
                </header>
                <Announcement />
                <Inbox users={users} onOpenShot={shot => open(shot, { comment: true })} />
                <ShareShot onShared={list.add} />
                <ShotFeed list={list} users={users} open={open} />
            </div>
            <aside className="feed-rail">
                <Online users={users} />
                <Servers users={users} />
                <PackUpdates />
            </aside>
            {viewer && <ShotDialog {...viewer} users={users} />}
        </div>
    );
}

function Announcement() {
    const { data: a } = useLoad(() => api.announcement());
    if (!a) return null;
    return (
        <div className="announcement" role="note">
            <b>Duyuru</b>
            <p>{a.text}</p>
            <small>{a.author} · {formatDate(a.createdAt)}</small>
        </div>
    );
}

const EVENT_DAYS = 3;

/** "Sana gelenler": arkadaşlık istekleri ve son günlerde ekran görüntülerine gelen beğeni ve yorumlar. Boşsa görünmez. */
function Inbox({ users, onOpenShot }) {
    const friends = useFriends();
    const [events, setEvents] = useState([]);
    const [busy, setBusy] = useState(null);

    useEffect(() => {
        api.shotEvents(new Date(Date.now() - EVENT_DAYS * 86400000).toISOString())
            .then(r => setEvents(r.events.slice().reverse()))
            .catch(() => {});
    }, []);

    async function act(kind, username, e) {
        setBusy(username);
        if (kind === 'accept') sparkBurst(e?.currentTarget, 20);
        try { await friendAction(kind, username); } catch { /* liste yine de tazelenir */ } finally { setBusy(null); }
    }

    async function openShot(id) {
        try { onOpenShot(await api.shot(id)); } catch { /* görüntü silinmiş olabilir */ }
    }

    const requests = friends?.incoming || [];
    if (!requests.length && !events.length) return null;

    return (
        <section className="inbox" aria-label="Sana gelenler">
            <h2 className="label">Sana gelenler</h2>
            <ul className="lines">
                {requests.map(name => (
                    <li key={'r' + name} className="line">
                        <Avatar username={name} version={users[name]?.avatarVersion} size={34} />
                        <span className="grow"><Link to={`/u/${name}`}><b>{name}</b></Link> seninle arkadaş olmak istiyor.</span>
                        <span className="line-actions">
                            <button className="btn btn-primary btn-sm" disabled={busy === name} onClick={e => act('accept', name, e)}>Kabul et</button>
                            <button className="btn btn-quiet btn-sm" disabled={busy === name} onClick={() => act('drop', name)}>Reddet</button>
                        </span>
                    </li>
                ))}
                {events.slice(0, 6).map(e => (
                    <li key={e.id} className="line">
                        <Avatar username={e.from} version={users[e.from]?.avatarVersion} size={34} />
                        <span className="grow">
                            <Link to={`/u/${e.from}`}><b>{e.from}</b></Link>{' '}
                            {e.kind === 'like' ? 'ekran görüntünü beğendi.' : <>yorum yazdı: <q>{e.text}</q></>}
                            <small className="muted"> · {timeAgo(e.createdAt)}</small>
                        </span>
                        <button className="btn btn-sm" onClick={() => openShot(e.shotId)}>Gör</button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function ShotFeed({ list, users, open }) {
    const { shots, more, loading, error, loadMore, update } = list;

    if (!loading && !error && !shots.length) {
        return (
            <Empty icon="image" title="Akış şimdilik sessiz">
                İlk görüntüyü yukarıdan sen paylaş ya da oyundayken launcher'ın Sosyal sekmesini kullan.
            </Empty>
        );
    }

    return (
        <>
            <div className="posts">
                {shots.map(shot => (
                    <ShotPost key={shot.id} shot={shot} users={users} onOpen={opts => open(shot, opts)} onChange={c => update(shot.id, c)} />
                ))}
                {loading && !shots.length && [0, 1].map(i => <div key={i} className="skeleton post-skeleton" />)}
            </div>
            {error && <p className="status error">{error}</p>}
            {loading && shots.length > 0 && <p className="muted small">Yükleniyor…</p>}
            {more && !loading && <button className="btn load-more" onClick={loadMore}>Daha eski paylaşımlar</button>}
        </>
    );
}

function ShotPost({ shot, users, onOpen, onChange }) {
    const [toggleLike, error] = useLike(shot, onChange);
    return (
        <article className="post">
            <header className="post-head">
                <Avatar username={shot.author} version={users[shot.author]?.avatarVersion} size={36} />
                <div className="grow">
                    <Link to={`/u/${shot.author}`}><b>{shot.author}</b></Link>
                    <small>
                        {timeAgo(shot.createdAt)}
                        {shot.packName && ` · ${shot.packName}`}
                        {shot.mcVersion && ` · ${shot.mcVersion}`}
                    </small>
                </div>
            </header>
            <button className="post-image" onClick={() => onOpen()} aria-label="Büyük hâlini aç">
                <AuthImage path={api.shotImagePath(shot.id, 'thumb')} width={shot.width} height={shot.height} alt={shot.caption} />
            </button>
            {shot.caption && <p className="post-caption">{shot.caption}</p>}
            <footer className="post-actions">
                <button className={'like-btn' + (shot.liked ? ' on' : '')} onClick={toggleLike} aria-pressed={!!shot.liked}
                    aria-label={shot.liked ? 'Beğenmekten vazgeç' : 'Beğen'}>
                    <Icon name="heart" size={18} /> <span>{shot.likes}</span>
                </button>
                <button className="like-btn" onClick={() => onOpen({ comment: true })}>
                    <Icon name="comment" size={18} /> {shot.commentCount ? `${shot.commentCount} yorum` : 'Yorum yaz'}
                </button>
                {error && <small className="status error">{error}</small>}
            </footer>
        </article>
    );
}

const STATE_ORDER = { playing: 0, launcher: 1, online: 2 };

/** Şu an launcher'ı açık olanlar; önce arkadaşlar ve oyunda olanlar. */
function Online({ users }) {
    const { user } = useAuth();
    const online = usePresence();
    const others = (online || []).filter(p => p.username !== user.username)
        .sort((a, b) => (a.friend === b.friend ? 0 : a.friend ? -1 : 1) || STATE_ORDER[a.state] - STATE_ORDER[b.state]);
    const playing = others.filter(p => p.state === 'playing').length;

    return (
        <section className="rail-card">
            <h2 className="label">Şu an çevrimiçi{others.length > 0 && <span> {others.length}</span>}</h2>
            {online === undefined && <p className="muted small">Yükleniyor…</p>}
            {online === null && <p className="muted small">Çevrimiçi durumu şu an alınamadı.</p>}
            {online && !others.length && <p className="muted small">Şu an launcher'ı açık kimse yok.</p>}
            {playing > 0 && <p className="rail-sum"><span className="fire" />{playing} kişi oyunda</p>}
            <ul className="people">
                {others.slice(0, 8).map(p => (
                    <li key={p.username}>
                        <Avatar username={p.username} version={users[p.username]?.avatarVersion} size={34} state={p.state} />
                        <div className="grow">
                            <span className="row-tight">
                                <Link to={`/u/${p.username}`}><b>{p.username}</b></Link>
                                {p.friend && <span className="tag">arkadaş</span>}
                            </span>
                            <small className={p.state === 'playing' ? 'playing' : ''}>{describePresence(p)}</small>
                        </div>
                    </li>
                ))}
            </ul>
            {others.length > 8 && <Link className="card-link" to="/hesap/arkadaslar">Hepsini gör</Link>}
        </section>
    );
}

/** Launcher'daki sunucu listesi; içeride kimin oynadığı çevrimiçi durumundan çıkar. Adres kopyalanabilir. */
function Servers({ users }) {
    const { data: servers } = useLoad(() => api.servers().catch(() => []));
    const online = usePresence();
    const [copied, setCopied] = useState(null);
    if (!servers?.length) return null;

    async function copy(s) {
        try { await navigator.clipboard.writeText(s.address); setCopied(s.id); setTimeout(() => setCopied(null), 1600); } catch { /* izin yok */ }
    }

    return (
        <section className="rail-card">
            <h2 className="label">Sunucular</h2>
            <ul className="servers">
                {servers.map(s => {
                    const here = (online || []).filter(p => p.state === 'playing' && p.server && (p.server === s.address || p.server === s.name));
                    return (
                        <li key={s.id}>
                            <div className="row-tight">
                                <b className="grow">{s.name}</b>
                                <button className="copy-btn" onClick={() => copy(s)} title="Adresi kopyala">
                                    <Icon name={copied === s.id ? 'check' : 'copy'} size={15} /> {copied === s.id ? 'Kopyalandı' : s.address}
                                </button>
                            </div>
                            {s.description && <small>{s.description}</small>}
                            {here.length > 0 && (
                                <div className="heads">
                                    {here.slice(0, 5).map(p => <Avatar key={p.username} username={p.username} version={users[p.username]?.avatarVersion} size={24} />)}
                                    <small>{here.length} kişi burada oynuyor</small>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
            <p className="muted small">Bağlanmak için launcher'da Sunucular sekmesini açman yeterli.</p>
        </section>
    );
}

function PackUpdates() {
    const { data: packs, error } = useLoad(() => api.packs());
    const recent = (packs || []).slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4);
    return (
        <section className="rail-card">
            <h2 className="label">Paket güncellemeleri</h2>
            {!packs && !error && <p className="muted small">Yükleniyor…</p>}
            {error && <p className="muted small">{error}</p>}
            {packs && !packs.length && <p className="muted small">Henüz paylaşılan bir paket yok.</p>}
            <ul className="pack-updates">
                {recent.map(pack => {
                    const latest = [...pack.changelog].sort((a, b) => b.revision - a.revision)[0];
                    return (
                        <li key={pack.id}>
                            <div className="row-tight">
                                <Link to={`/hesap/paketler/${pack.id}`} className="grow"><b>{pack.name}</b></Link>
                                <small className="muted"><span className="mono">r{pack.revision}</span> · {timeAgo(pack.updatedAt)}</small>
                            </div>
                            {latest ? <ChangeCounts change={latest} /> : <small className="muted">Değişiklik kaydı yok.</small>}
                        </li>
                    );
                })}
            </ul>
            {packs?.length > 0 && <Link className="card-link" to="/hesap/paketler">Tüm paketler</Link>}
        </section>
    );
}
