import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { AuthImage, Avatar, formatDate, formatHours, loaderName, timeAgo, useLoad, useUsers } from '../components.jsx';
import { SkinPreview } from '../images.jsx';
import { ShotDialog } from './account/Shots.jsx';

/** Bir üyenin profili. API profilleri yalnızca giriş yapmış üyelere gösterir. */
export default function UserProfile() {
    const { username } = useParams();
    const { status, user: me } = useAuth();

    if (status === 'loading') return <section className="wrap auth"><p className="muted">Yükleniyor…</p></section>;
    if (status === 'out') {
        return (
            <section className="wrap auth">
                <div className="card auth-card">
                    <h1>{username}</h1>
                    <p className="muted">Profiller yalnızca üyelere açık. Görmek için giriş yapman gerekiyor.</p>
                    <Link className="btn btn-primary" to="/giris">Giriş yap</Link>
                </div>
            </section>
        );
    }
    return <ProfileView key={username} username={username} isMe={me.username === username} />;
}

function ProfileView({ username, isMe }) {
    const { data: p, error, loading } = useLoad(() => api.profile(username), [username]);

    if (loading) return <section className="wrap account"><p className="muted">Yükleniyor…</p></section>;
    if (error) return <section className="wrap account"><p className="status error">{error}</p></section>;

    return (
        <section className="wrap account public-profile">
            <div className="profile-hero">
                {p.bannerVersion > 0
                    ? <img className="banner" src={api.bannerUrl(p.username, p.bannerVersion)} alt="" />
                    : <div className="banner banner-empty" />}
                <div className="profile-hero-main">
                    <Avatar username={p.username} version={p.avatarVersion} size={96} />
                    <div className="grow">
                        <h1>{p.username}{p.isAdmin && <span className="badge">admin</span>}</h1>
                        <p className="muted small">
                            {p.createdAt && `Üyelik: ${formatDate(p.createdAt)}`}
                            {p.lastSeenAt && ` · son görülme ${timeAgo(p.lastSeenAt)}`}
                        </p>
                    </div>
                    {isMe && <Link className="btn btn-sm" to="/hesap/profil">Profili düzenle</Link>}
                </div>
                {p.bio && <p className="profile-bio">{p.bio}</p>}
            </div>

            <div className="profile-columns">
                <div className="card profile-skin">
                    <h2>Skin</h2>
                    {p.skinHash
                        ? <SkinPreview hash={p.skinHash} model={p.skinModel} scale={7} />
                        : <p className="muted small">Varsayılan skin kullanıyor.</p>}
                </div>
                <div className="stack-lg grow">
                    <div className="card">
                        <h2>Oynama süresi</h2>
                        {p.playtime ? (
                            <>
                                <p className="big mono">{formatHours(p.playtime.totalSeconds)}</p>
                                <ul className="top-list">
                                    {p.playtime.top.slice(0, 5).map(t => (
                                        <li key={t.name}><span>{t.name}</span><span className="mono muted">{formatHours(t.seconds)}</span></li>
                                    ))}
                                </ul>
                            </>
                        ) : <p className="muted small">Oynama süresi yok ya da gizli.</p>}
                    </div>
                    {p.packs.length > 0 && (
                        <div className="card">
                            <h2>Paylaştığı paketler</h2>
                            <ul className="top-list">
                                {p.packs.map(pack => (
                                    <li key={pack.id}>
                                        <Link to={`/hesap/paketler/${pack.id}`}>{pack.name}</Link>
                                        <span className="muted small">Minecraft {pack.mcVersion} · {loaderName(pack.loader)} · {timeAgo(pack.updatedAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <UserShots username={p.username} />
        </section>
    );
}

function UserShots({ username }) {
    const users = useUsers();
    const [shots, setShots] = useState(null);
    const [open, setOpen] = useState(null);
    useEffect(() => { api.shots(null, username).then(page => setShots(page.shots)).catch(() => setShots([])); }, [username]);
    if (!shots?.length) return null;
    const update = (id, changes) => setShots(list => list.map(s => (s.id === id ? { ...s, ...changes } : s)));
    return (
        <div className="card">
            <h2>Ekran görüntüleri</h2>
            <div className="shot-strip">
                {shots.map(shot => (
                    <button className="shot-mini" key={shot.id} onClick={() => setOpen(shot)} title={shot.caption}>
                        <AuthImage path={api.shotImagePath(shot.id, 'thumb')} width={shot.width} height={shot.height} />
                    </button>
                ))}
            </div>
            {open && (
                <ShotDialog shot={shots.find(s => s.id === open.id) || open} users={users}
                    onChange={changes => update(open.id, changes)} onClose={() => setOpen(null)} />
            )}
        </div>
    );
}
