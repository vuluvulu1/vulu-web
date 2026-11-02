import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { AuthImage, Avatar, Empty, RoleChips, formatDate, formatHours, loaderName, timeAgo, useLoad, useUsers } from '../components.jsx';
import Icon from '../icons.jsx';
import { RisingEmbers, sparkBurst } from '../effects.jsx';
import { CountUp } from '../motion.jsx';
import { describePresence, friendAction, relationTo, useFriends, usePresence } from '../social.js';
import { AccountShell } from './account/Layout.jsx';
import { AvatarControl, BannerControls, BioEditor, SkinStage } from './account/ProfileEdit.jsx';
import { ShotDialog, useShotPages, useShotViewer } from './account/ShotDialog.jsx';

/** Bir üyenin profili. API profilleri yalnızca giriş yapmış üyelere gösterir. */
export default function UserProfile() {
    const { username } = useParams();
    const { status, user: me } = useAuth();

    if (status === 'loading') return <div className="wrap app"><div className="skeleton" style={{ height: 360 }} aria-label="Yükleniyor" /></div>;
    if (status === 'out') {
        return (
            <section className="wrap auth">
                <div className="auth-card">
                    <h1>{username}</h1>
                    <p className="muted">Profiller yalnızca üyelere açık. Görmek için giriş yap.</p>
                    <Link className="btn btn-primary" to="/giris">Giriş yap</Link>
                    <p className="auth-alt">Hesabın yok mu? <Link to="/kayit">Katıl</Link></p>
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

const AVATAR_SIZE = 128;

function ProfileView({ username, isMe }) {
    const { user: me } = useAuth();
    const { data, error, loading } = useLoad(() => api.profile(username), [username]);
    const shots = useShotPages(username);
    const online = usePresence();

    if (loading) return <div className="skeleton" style={{ height: 360 }} aria-label="Yükleniyor" />;
    if (error) return <Empty icon="user" title="Profil açılamadı">{error}</Empty>;

    // Kendi profilinde düzenlemeler (avatar, banner, skin, hakkında) hemen görünsün diye oturumdaki hâl kullanılır
    const p = isMe ? { ...data, ...me, packs: data.packs } : data;
    const presence = online?.find(x => x.username === p.username);
    const shotCount = shots.loading && !shots.shots.length ? '…' : shots.shots.length + (shots.more ? '+' : '');

    return (
        <div className="pf">
            <header className="pf-hero">
                <div className={'pf-banner' + (p.bannerVersion > 0 ? '' : ' plain')}>
                    {p.bannerVersion > 0 && <BannerImage key={p.bannerVersion} src={api.bannerUrl(p.username, p.bannerVersion)} />}
                    <RisingEmbers rate={presence?.state === 'playing' ? 40 : 24} />
                    {isMe && <BannerControls />}
                </div>
                <div className="pf-head">
                    <div className={'pf-avatar' + (presence ? ' lit ' + presence.state : '')}>
                        {isMe
                            ? <AvatarControl size={AVATAR_SIZE} />
                            : <Avatar username={p.username} version={p.avatarVersion} size={AVATAR_SIZE} />}
                    </div>
                    <div className="pf-id">
                        <h1>{p.username}{p.isAdmin && <span className="tag hot">admin</span>}</h1>
                        <RoleChips roles={p.roles} />
                        <p className="pf-presence">
                            {presence
                                ? <><span className={'presence-dot inline ' + presence.state} /><span className={presence.state === 'playing' ? 'playing' : ''}>{describePresence(presence)}</span></>
                                : <span className="muted">{p.lastSeenAt ? `Son görülme ${timeAgo(p.lastSeenAt)}` : 'Çevrimdışı'}</span>}
                        </p>
                    </div>
                    {!isMe && <div className="pf-actions"><FriendButton username={p.username} /></div>}
                </div>
                <dl className="pf-stats">
                    <div><dt>Oynama süresi</dt><dd>{p.playtime ? formatHours(p.playtime.totalSeconds) : '—'}</dd></div>
                    <div><dt>Ekran görüntüsü</dt><dd>{shotCount}</dd></div>
                    <div><dt>Paylaştığı paket</dt><dd><CountUp value={p.packs.length} /></dd></div>
                    <div><dt>Üyelik</dt><dd>{p.createdAt ? formatMonth(p.createdAt) : '—'}</dd></div>
                </dl>
            </header>

            <div className="pf-body">
                <div className="pf-main">
                    <section className="pf-section" id="pf-about">
                        <h2>Hakkında</h2>
                        {isMe ? <BioEditor /> : <p className={'pf-bio' + (p.bio ? '' : ' empty')}>{p.bio || 'Henüz bir şey yazmamış.'}</p>}
                    </section>

                    <ProfileShots list={shots} isMe={isMe} />

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
                    <TopPlayed playtime={p.playtime} isMe={isMe} />
                    <section className="pf-section pf-skin">
                        <h2>Skin</h2>
                        <SkinStage profile={p} own={isMe} />
                    </section>
                    {isMe && <AccountBox createdAt={p.createdAt} />}
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

/** En çok oynanan paketler, süreye göre çubuklarla. */
function TopPlayed({ playtime, isMe }) {
    const top = playtime?.top.slice(0, 6) || [];
    const max = Math.max(1, ...top.map(t => t.seconds));
    return (
        <section className="pf-section">
            <h2>En çok oynadıkları</h2>
            {top.length ? (
                <ol className="pf-top">
                    {top.map((t, i) => (
                        <li key={t.name} style={{ '--n': i }}>
                            <span className="pf-top-row">
                                <span className="pf-rank">{i + 1}</span>
                                <span className="grow">{t.name}</span>
                                <span className="mono">{formatHours(t.seconds)}</span>
                            </span>
                            <span className="pf-bar"><span style={{ width: `${Math.max(3, (t.seconds / max) * 100)}%` }} /></span>
                        </li>
                    ))}
                </ol>
            ) : <p className="muted small">{isMe ? 'Henüz kayıtlı oynama süren yok. Launcher\'la oynadıkça burada görünür; ayarlardan gizlediysen oradan açabilirsin.' : 'Oynama süresi yok ya da gizli.'}</p>}
        </section>
    );
}

function AccountBox({ createdAt }) {
    const { logout } = useAuth();
    return (
        <section className="pf-section">
            <h2>Hesap</h2>
            {createdAt && <p className="small">Üyelik: {formatDate(createdAt)}</p>}
            <p className="muted small">
                Şifreni launcher'daki profil sayfasından değiştirebilirsin. Şifreli mesajlarının anahtarı şifrene bağlı
                olduğu için bu işlem şimdilik yalnızca launcher'da yapılabiliyor.
            </p>
            <button className="btn btn-sm" onClick={logout}><Icon name="logout" size={16} /> Çıkış yap</button>
        </section>
    );
}

function FriendButton({ username }) {
    const friends = useFriends();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const relation = relationTo(friends, username);
    if (!relation) return null;

    async function act(kind, e) {
        if (kind === 'request' || kind === 'accept') sparkBurst(e?.currentTarget, 20);
        setBusy(true);
        setError(null);
        try { await friendAction(kind, username); } catch (err) { setError(err.message); } finally { setBusy(false); }
    }

    return (
        <>
            {relation === 'none' && <button className="btn btn-primary btn-sm" disabled={busy} onClick={e => act('request', e)}><Icon name="plus" size={16} /> Arkadaş ekle</button>}
            {relation === 'outgoing' && <button className="btn btn-sm" disabled={busy} onClick={() => act('drop')}>İsteği geri al</button>}
            {relation === 'incoming' && <>
                <button className="btn btn-primary btn-sm" disabled={busy} onClick={e => act('accept', e)}>İsteği kabul et</button>
                <button className="btn btn-quiet btn-sm" disabled={busy} onClick={() => act('drop')}>Reddet</button>
            </>}
            {relation === 'friend' && (
                <button className="btn btn-sm pf-friend" disabled={busy}
                    onClick={() => { if (confirm(`${username} arkadaşlıktan çıkarılsın mı?`)) act('remove'); }}>
                    <span className="on"><Icon name="check" size={16} /> Arkadaşsınız</span><span className="off">Arkadaşlıktan çıkar</span>
                </button>
            )}
            {error && <p className="status error">{error}</p>}
        </>
    );
}

function ProfileShots({ list, isMe }) {
    const users = useUsers();
    const [viewer, open] = useShotViewer(list);
    const { shots, more, loading, loadMore } = list;

    return (
        <section className="pf-section">
            <h2>Ekran görüntüleri</h2>
            {!loading && !shots.length && (
                isMe
                    ? <Empty icon="image">Henüz ekran görüntüsü paylaşmadın. <Link to="/hesap">Akıştan</Link> ya da launcher'ın Sosyal sekmesinden paylaşabilirsin.</Empty>
                    : <p className="muted small">Henüz bir ekran görüntüsü paylaşmamış.</p>
            )}
            {shots.length > 0 && (
                <div className="gallery">
                    {shots.map(shot => (
                        <button className="gallery-item" data-tilt="8" key={shot.id} onClick={() => open(shot)} aria-label={shot.caption || 'Ekran görüntüsünü aç'}>
                            <AuthImage path={api.shotImagePath(shot.id, 'thumb')} width={shot.width} height={shot.height} />
                            <span className="gallery-counts"><Icon name="heart" size={14} /> {shot.likes} <Icon name="comment" size={14} /> {shot.commentCount}</span>
                        </button>
                    ))}
                </div>
            )}
            {loading && <div className="gallery">{[0, 1, 2].map(i => <span key={i} className="skeleton gallery-item" />)}</div>}
            {more && !loading && <button className="btn btn-sm load-more" onClick={loadMore}>Daha fazla göster</button>}
            {viewer && <ShotDialog {...viewer} users={users} />}
        </section>
    );
}

function PackTile({ pack }) {
    const [coverFailed, setCoverFailed] = useState(false);
    return (
        <Link className="pack-tile" to={`/hesap/paketler/${pack.id}`}>
            {pack.hasCover && !coverFailed
                ? <img src={api.packCoverUrl(pack)} alt="" onError={() => setCoverFailed(true)} />
                : <span className="pack-tile-empty">{pack.name[0].toLocaleUpperCase('tr')}</span>}
            <span className="pack-tile-info">
                <b>{pack.name}</b>
                <small>Minecraft {pack.mcVersion} · {loaderName(pack.loader)}</small>
                <small className="mono">r{pack.revision} · {timeAgo(pack.updatedAt)}</small>
            </span>
        </Link>
    );
}
