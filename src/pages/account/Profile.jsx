import { DOWNLOAD_URL } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { formatDate, formatHours } from '../../components.jsx';

/** Profil: açıklama, üyelik tarihi ve oynama süresi. Düzenleme şimdilik launcher'dan yapılır. */
export default function Profile() {
    const { user } = useAuth();
    return (
        <div className="account-grid">
            <div className="card">
                <h2>Hakkında</h2>
                {user.bio ? <p>{user.bio}</p> : <p className="muted">Henüz bir açıklama yazılmamış.</p>}
                {user.createdAt && <p className="muted small">Üyelik: {formatDate(user.createdAt)}</p>}
                {user.packCount > 0 && <p className="muted small">Paylaştığı paket sayısı: {user.packCount}</p>}
            </div>
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
                <p className="muted">Avatar, banner, skin ve açıklama şimdilik launcher'dan değiştirilir.</p>
                <a className="btn btn-primary" href={DOWNLOAD_URL}>vulu Launcher'ı indir</a>
            </div>
        </div>
    );
}
