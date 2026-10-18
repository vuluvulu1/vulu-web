import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DOWNLOAD_URL, api } from '../api.js';
import { useAuth } from '../auth.jsx';

const formatHours = seconds => {
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60);
    return h ? `${h} sa ${m} dk` : `${m} dk`;
};

const formatDate = value => value
    ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

export default function Account() {
    const { status, user, logout } = useAuth();
    const [avatarFailed, setAvatarFailed] = useState(false);

    if (status === 'loading') return <section className="wrap auth"><p className="muted">Yükleniyor…</p></section>;
    if (status === 'out') return <Navigate to="/giris" replace />;

    const joined = formatDate(user.createdAt);
    const showAvatar = user.avatarVersion > 0 && !avatarFailed;

    return (
        <section className="wrap account">
            <div className="card profile">
                <div className="avatar">
                    {showAvatar
                        ? <img src={api.avatarUrl(user.username, user.avatarVersion)} alt="" onError={() => setAvatarFailed(true)} />
                        : <span>{user.username[0].toUpperCase()}</span>}
                </div>
                <div className="profile-main">
                    <h1>
                        {user.username}
                        {user.isAdmin && <span className="badge">admin</span>}
                    </h1>
                    {user.bio && <p>{user.bio}</p>}
                    {joined && <p className="muted">Üyelik: {joined}</p>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Çıkış yap</button>
            </div>

            <div className="account-grid">
                <div className="card">
                    <h2>Oynama süresi</h2>
                    {user.playtime ? (
                        <>
                            <p className="big mono">{formatHours(user.playtime.totalSeconds)}</p>
                            <ul className="top-list">
                                {user.playtime.top.slice(0, 5).map(t => (
                                    <li key={t.name}><span>{t.name}</span><span className="mono muted">{formatHours(t.seconds)}</span></li>
                                ))}
                            </ul>
                        </>
                    ) : <p className="muted">Henüz kayıtlı oynama süresi yok ya da gizlenmiş.</p>}
                </div>
                <div className="card">
                    <h2>Launcher</h2>
                    <p className="muted">Profilini, skinini ve paketlerini launcher'dan yönetebilirsin.</p>
                    <a className="btn btn-primary" href={DOWNLOAD_URL}>vulu Launcher'ı indir</a>
                </div>
            </div>
        </section>
    );
}
