import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import { Avatar } from '../../components.jsx';

const TABS = [
    ['/hesap', 'Genel', true],
    ['/hesap/ekran-goruntuleri', 'Ekran görüntüleri'],
    ['/hesap/paketler', 'Paketler'],
    ['/hesap/profil', 'Profil'],
];

/** Hesap bölümü: üstte kullanıcı ve sekmeler, altta seçili sekme. Giriş yapılmamışsa giriş sayfasına gider. */
export default function AccountLayout() {
    const { status, user, logout } = useAuth();

    if (status === 'loading') return <section className="wrap auth"><p className="muted">Yükleniyor…</p></section>;
    if (status === 'out') return <Navigate to="/giris" replace />;

    return (
        <section className="wrap account">
            <div className="account-head">
                <Avatar username={user.username} version={user.avatarVersion} size={44} />
                <div className="account-who">
                    <b>{user.username}</b>
                    {user.isAdmin && <span className="badge">admin</span>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Çıkış yap</button>
            </div>
            <nav className="tabs">
                {TABS.map(([to, label, end]) => <NavLink key={to} to={to} end={end} className="tab">{label}</NavLink>)}
            </nav>
            <Outlet />
        </section>
    );
}
