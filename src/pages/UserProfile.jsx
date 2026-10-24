import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { AuthImage, Avatar, RoleChips, formatDate, formatHours, loaderName, timeAgo, useLoad, useUsers } from '../components.jsx';
import Icon from '../icons.jsx';
import { describePresence, friendAction, relationTo, useFriends, usePresence } from '../social.js';
import { AccountShell } from './account/Layout.jsx';
import { AvatarControl, BannerControls, BioEditor, SkinStage } from './account/ProfileEdit.jsx';
import { ShotDialog, useShotPages } from './account/ShotDialog.jsx';

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
    return (
        <AccountShell>
            <ProfileView key={username} username={username} isMe={me.username === username} />
        </AccountShell>
    );
}

const AVATAR_SIZE = 136;

function ProfileView({ username, isMe }) {
    const { user: me, logout } = useAuth();
    const { data, error, loading } = useLoad(() => api.profile(username), [username]);
    const shots = useShotPages(username);
    const online = usePresence();

    if (loading) return <div className="pf-skeleton" aria-label="Yükleniyor" />;
    if (error) return <p className="status error">{error}</p>;

    // Kendi profilinde düzenlemeler (avatar, banner, skin, hakkında) hemen görünsün diye oturumdaki hâl kullanılır
    const p = isMe ? { ...data, ...me, packs: data.packs } : data;
    const presence = online?.find(x => x.username === p.username);
    const top = p.playtime?.top.slice(0, 6) || [];
    const maxSeconds = Math.max(1, ...top.map(t => t.seconds));

    return (
        <div className="pf">
            <header className="pf-hero">
                <div className="pf-banner">
                    {p.bannerVersion > 0 && <BannerImage key={p.bannerVersion} src={api.bannerUrl(p.username, p.bannerVersion)} />}
                    {isMe && <BannerControls />}
                </div>
                <div className="pf-head">
                    <div className="pf-avatar">
                        {isMe
                            ? <AvatarControl size={AVATAR_SIZE} />
                            : <Avatar username={p.username} version={p.avatarVersion} size={AVATAR_SIZE} />}
                    </div>
                    <div className="pf-id">
                        <h1>{p.username}{p.isAdmin && <span className="badge">admin</span>}</h1>
                        <RoleChips roles={p.roles} />
                        <p className="pf-meta">
                            {presence
                                ? <span className={'pf-presence ' + presence.state}><span className={'presence-dot ' + presence.state} />{describePresence(presence)}</span>
                                : p.lastSeenAt && <span>Son görülme {timeAgo(p.lastSeenAt)}</span>}
                        </p>
                    </div>
                    {!isMe && <div className="pf-actions"><FriendButton username={p.username} /></div>}
                </div>
                <dl className="pf-stats">
                    <div><dt>Oynama süresi</dt><dd>{p.playtime ? formatHours(p.playtime.totalSeconds) : '—'}</dd></div>
                    <div><dt>Paket</dt><dd>{p.packs.length}</dd></div>
                    <div><dt>Ekran görüntüsü</dt><dd>{shots.loading && !shots.shots.length ? '…' : shots.shots.length + (shots.more ? '+' : '')}</dd></div>
                    <div><dt>Katıldı</dt><dd>{p.createdAt ? formatMonth(p.createdAt) : '—'}</dd></div>
                </dl>
            </header>

            <div className="pf-body">
                <div className="pf-main">
                    <section className="pf-section">
                        <h2>Hakkında</h2>
                        {isMe ? <BioEditor /> : <p className={'pf-bio' + (p.bio ? '' : ' empty')}>{p.bio || 'Henüz bir şey yazmamış.'}</p>}
                    </section>

                    <ProfileShots {...shots} isMe={isMe} />

                    {p.packs.length > 0 && (
                        <section className="pf-section">
                            <h2>Paylaştığı paketler <span className="muted">{p.packs.length}</span></h2>
                            <div className="pf-packs">
                                {p.packs.map(pack => <PackTile key={pack.id} pack={pack} />)}
                            </div>
                        </section>
                    )}
                </div>

                <aside className="pf-side">
                    <section className="pf-section pf-skin">
                        <h2>Skin</h2>
                        <SkinStage profile={p} own={isMe} />
                    </section>

                    <section className="pf-section">
                        <h2>En çok oynadıkları</h2>
                        {top.length ? (
                            <ul className="pf-top">
                                {top.map(t => (
                                    <li key={t.name}>
                                        <span className="pf-top-row"><span className="grow">{t.name}</span><span className="mono muted">{formatHours(t.seconds)}</span></span>
                                        <span className="pf-bar"><span style={{ width: `${(t.seconds / maxSeconds) * 100}%` }} /></span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="muted small">{isMe ? 'Henüz kayıtlı oynama süren yok ya da launcher ayarlarından gizlemişsin.' : 'Oynama süresi yok ya da gizli.'}</p>}
                    </section>

                    {isMe && (
                        <section className="pf-section">
                            <h2>Hesap</h2>
                            {p.createdAt && <p className="small">Üyelik: {formatDate(p.createdAt)}</p>}
                            <p className="muted small">
                                Şifreni şimdilik launcher'dan değiştir. Şifreli mesajlarının anahtarı şifrene bağlı olduğu için
                                bu ayarı siteye mesajlarla birlikte ekleyeceğiz.
                            </p>
                            <button className="btn btn-sm" onClick={logout}><Icon name="logout" size={16} /> Çıkış yap</button>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}

const formatMonth = value => new Date(value).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

/** Banner resmi; yüklenemezse (silinmiş, ağ yok) düz şerit kalır. */
function BannerImage({ src }) {
    const [failed, setFailed] = useState(false);
    if (failed) return null;
    return <img src={src} alt="" onError={() => setFailed(true)} />;
}

function FriendButton({ username }) {
    const friends = useFriends();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const relation = relationTo(friends, username);
    if (!relation) return null;

    async function act(kind) {
        setBusy(true);
        setError(null);
        try { await friendAction(kind, username); } catch (err) { setError(err.message); } finally { setBusy(false); }
    }

    return (
        <>
            {relation === 'none' && <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => act('request')}>Arkadaş ekle</button>}
            {relation === 'outgoing' && <button className="btn btn-sm" disabled={busy} onClick={() => act('drop')}>İsteği geri al</button>}
            {relation === 'incoming' && <>
                <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => act('accept')}>İsteği kabul et</button>
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act('drop')}>Reddet</button>
            </>}
            {relation === 'friend' && (
                <button className="btn btn-sm pf-friend" disabled={busy}
                    onClick={() => { if (confirm(`${username} arkadaşlıktan çıkarılsın mı?`)) act('remove'); }}>
                    <span className="on">✓ Arkadaşsınız</span><span className="off">Arkadaşlıktan çıkar</span>
                </button>
            )}
            {error && <p className="status error">{error}</p>}
        </>
    );
}

function ProfileShots({ shots, more, loading, loadMore, update, isMe }) {
    const users = useUsers();
    const [open, setOpen] = useState(null);

    return (
        <section className="pf-section">
            <h2>Ekran görüntüleri</h2>
            {!loading && !shots.length && (
                <p className="muted small">{isMe ? "Henüz ekran görüntüsü paylaşmadın. Launcher'ın Sosyal sekmesinden paylaşabilirsin." : 'Henüz ekran görüntüsü paylaşmamış.'}</p>
            )}
            {shots.length > 0 && (
                <div className="pf-gallery">
                    {shots.map(shot => (
                        <button className="pf-shot" key={shot.id} onClick={() => setOpen(shot)} title={shot.caption}>
                            <AuthImage path={api.shotImagePath(shot.id, 'thumb')} width={shot.width} height={shot.height} />
                            <span className="pf-shot-counts"><Icon name="heart" size={14} /> {shot.likes} · {shot.commentCount}</span>
                        </button>
                    ))}
                </div>
            )}
            {loading && <p className="muted small">Yükleniyor…</p>}
            {more && !loading && <button className="btn btn-sm load-more" onClick={loadMore}>Daha fazla göster</button>}
            {open && (
                <ShotDialog shot={shots.find(s => s.id === open.id) || open} users={users}
                    onChange={changes => update(open.id, changes)} onClose={() => setOpen(null)} />
            )}
        </section>
    );
}

function PackTile({ pack }) {
    const [coverFailed, setCoverFailed] = useState(false);
    return (
        <Link className="pf-pack" to={`/hesap/paketler/${pack.id}`}>
            {pack.hasCover && !coverFailed
                ? <img src={api.packCoverUrl(pack)} alt="" onError={() => setCoverFailed(true)} />
                : <span className="pf-pack-empty">{pack.name[0]}</span>}
            <span className="pf-pack-info">
                <b>{pack.name}</b>
                <small>Minecraft {pack.mcVersion} · {loaderName(pack.loader)}</small>
                <small className="mono">r{pack.revision} · {timeAgo(pack.updatedAt)}</small>
            </span>
        </Link>
    );
}
