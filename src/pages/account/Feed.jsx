import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { AuthImage, Avatar, formatDate, timeAgo, useLoad, useUsers } from '../../components.jsx';
import Icon from '../../icons.jsx';
import { describePresence, friendAction, useFriends, usePresence } from '../../social.js';
import { ChangeCounts } from './Packs.jsx';
import { ShotDialog, useShotPages } from './ShotDialog.jsx';

/** Akış: ortada paylaşılan ekran görüntüleri, yanda duyuru, çevrimiçi olanlar ve paket güncellemeleri. */
export default function Feed() {
    return (
        <div className="feed-page">
            <div className="feed-main">
                <Announcement />
                <ShotFeed />
            </div>
            <aside className="feed-rail">
                <FriendRequests />
                <Online />
                <PackUpdates />
            </aside>
        </div>
    );
}

function Announcement() {
    const { data: a } = useLoad(() => api.announcement());
    if (!a) return null;
    return (
        <div className="announcement">
            <span className="announcement-label">Duyuru</span>
            <p>{a.text}</p>
            <small className="muted">{a.author} · {formatDate(a.createdAt)}</small>
        </div>
    );
}

function ShotFeed() {
    const users = useUsers();
    const { shots, more, loading, error, loadMore, update } = useShotPages();
    const [open, setOpen] = useState(null);

    if (!loading && !error && !shots.length) {
        return (
            <div className="empty-state">
                <Icon name="image" size={28} />
                <p>Henüz paylaşılmış bir ekran görüntüsü yok.</p>
                <small className="muted">Ekran görüntülerini launcher'ın Sosyal sekmesinden paylaşabilirsin.</small>
            </div>
        );
    }

    return (
        <>
            <div className="posts">
                {shots.map(shot => (
                    <ShotPost key={shot.id} shot={shot} users={users} onOpen={() => setOpen(shot)} onChange={c => update(shot.id, c)} />
                ))}
            </div>
            {error && <p className="status error">{error}</p>}
            {loading && <p className="muted">Yükleniyor…</p>}
            {more && !loading && <button className="btn load-more" onClick={loadMore}>Daha fazla göster</button>}
            {open && (
                <ShotDialog
                    shot={shots.find(s => s.id === open.id) || open}
                    users={users}
                    onChange={changes => update(open.id, changes)}
                    onClose={() => setOpen(null)}
                />
            )}
        </>
    );
}

function ShotPost({ shot, users, onOpen, onChange }) {
    const [error, setError] = useState(null);

    async function toggleLike() {
        setError(null);
        try {
            const r = await api.likeShot(shot.id, !shot.liked);
            onChange({ likes: r.likes, liked: r.liked });
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <article className="post">
            <header className="post-head">
                <Avatar username={shot.author} version={users[shot.author]?.avatarVersion} size={36} />
                <div className="grow">
                    <Link to={`/u/${shot.author}`}><b>{shot.author}</b></Link>
                    <small className="muted">
                        {timeAgo(shot.createdAt)}
                        {shot.packName && ` · ${shot.packName}`}
                        {shot.mcVersion && ` · ${shot.mcVersion}`}
                    </small>
                </div>
            </header>
            <button className="post-image" onClick={onOpen} aria-label="Büyük hâlini aç">
                <AuthImage path={api.shotImagePath(shot.id, 'thumb')} width={shot.width} height={shot.height} />
            </button>
            {shot.caption && <p className="post-caption">{shot.caption}</p>}
            <footer className="post-actions">
                <button className={'post-action' + (shot.liked ? ' liked' : '')} onClick={toggleLike} aria-pressed={!!shot.liked}>
                    <Icon name="heart" size={18} /> {shot.likes}
                </button>
                <button className="post-action" onClick={onOpen}>
                    <Icon name="comment" size={18} /> {shot.commentCount} yorum
                </button>
                {error && <small className="status error">{error}</small>}
            </footer>
        </article>
    );
}

function FriendRequests() {
    const friends = useFriends();
    const users = useUsers();
    const [busy, setBusy] = useState(null);
    if (!friends?.incoming.length) return null;

    async function act(kind, username) {
        setBusy(username);
        try { await friendAction(kind, username); } catch { /* liste yine de tazelenir */ } finally { setBusy(null); }
    }

    return (
        <div className="rail-card rail-requests">
            <h2>Arkadaşlık istekleri <span className="count">{friends.incoming.length}</span></h2>
            <ul className="people">
                {friends.incoming.slice(0, 3).map(name => (
                    <li key={name}>
                        <Avatar username={name} version={users[name]?.avatarVersion} size={32} />
                        <div><Link to={`/u/${name}`}><b>{name}</b></Link></div>
                        <button className="btn btn-primary btn-sm" disabled={busy === name} onClick={() => act('accept', name)}>Kabul et</button>
                    </li>
                ))}
            </ul>
            {friends.incoming.length > 3 && <Link className="card-link" to="/hesap/arkadaslar">Hepsini gör →</Link>}
        </div>
    );
}

function Online() {
    const { user } = useAuth();
    const users = useUsers();
    const online = usePresence();

    const others = online?.filter(p => p.username !== user.username) || [];
    // Önce arkadaşlar, sonra oynayanlar
    const rank = p => (p.friend ? 0 : 2) + (p.state === 'playing' ? 0 : 1);
    others.sort((a, b) => rank(a) - rank(b));

    return (
        <div className="rail-card">
            <h2>Şu an çevrimiçi {others.length > 0 && <span className="muted">{others.length}</span>}</h2>
            {online === undefined && <p className="muted small">Yükleniyor…</p>}
            {online === null && <p className="muted small">Çevrimiçi durumu şu an alınamadı.</p>}
            {online && !others.length && <p className="muted small">Şu an launcher'ı açık olan kimse yok.</p>}
            <ul className="people">
                {others.map(p => (
                    <li key={p.username}>
                        <span className="avatar-dot">
                            <Avatar username={p.username} version={users[p.username]?.avatarVersion} size={32} />
                            <span className={'presence-dot ' + p.state} />
                        </span>
                        <div>
                            <span className="row-tight">
                                <Link to={`/u/${p.username}`}><b>{p.username}</b></Link>
                                {p.friend && <span className="tag-friend">arkadaş</span>}
                            </span>
                            <small className={p.state === 'playing' ? 'playing' : 'muted'}>{describePresence(p)}</small>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function PackUpdates() {
    const { data: packs, error } = useLoad(() => api.packs());
    const recent = (packs || []).slice(0, 4);
    return (
        <div className="rail-card rail-packs">
            <h2>Son paket güncellemeleri</h2>
            {!packs && !error && <p className="muted small">Yükleniyor…</p>}
            {error && <p className="muted small">{error}</p>}
            {packs && !packs.length && <p className="muted small">Henüz paylaşılmış bir paket yok.</p>}
            <ul className="pack-updates">
                {recent.map(pack => {
                    const latest = [...pack.changelog].sort((a, b) => b.revision - a.revision)[0];
                    return (
                        <li key={pack.id}>
                            <div className="pack-update-head">
                                <Link to={`/hesap/paketler/${pack.id}`}><b>{pack.name}</b></Link>
                                <small className="muted"><span className="mono">r{pack.revision}</span> · {timeAgo(pack.updatedAt)}</small>
                            </div>
                            {latest ? <ChangeCounts change={latest} /> : <small className="muted">Değişiklik kaydı yok.</small>}
                        </li>
                    );
                })}
            </ul>
            {packs?.length > 0 && <Link className="card-link" to="/hesap/paketler">Tüm paketler →</Link>}
        </div>
    );
}
