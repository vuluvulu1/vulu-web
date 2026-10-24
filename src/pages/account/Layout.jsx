import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import { Avatar } from '../../components.jsx';
import Icon from '../../icons.jsx';
import { useFriends } from '../../social.js';

// Sayfanın üstündeki başlık; profil ve paket ayrıntısı kendi başlığını çizer
const TITLES = [
    [/^\/hesap\/?$/, 'Akış'],
    [/^\/hesap\/arkadaslar$/, 'Arkadaşlar'],
    [/^\/hesap\/paketler$/, 'Paketler'],
    [/^\/hesap\/geri-bildirim$/, 'Geri bildirim'],
    [/^\/hesap\/admin$/, 'Admin'],
];

/** Hesap bölümü: giriş yapılmamışsa giriş sayfasına gider, yapılmışsa kenar çubuğuyla seçili sayfayı gösterir. */
export default function AccountLayout() {
    const { status } = useAuth();
    if (status === 'loading') return <section className="wrap auth"><p className="muted">Yükleniyor…</p></section>;
    if (status === 'out') return <Navigate to="/giris" replace />;
    return <AccountShell><Outlet /></AccountShell>;
}

/** Giriş yapmış üyenin sayfa iskeleti: solda (telefonda altta) gezinme, sağda içerik. */
export function AccountShell({ children }) {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const friends = useFriends();
    const title = TITLES.find(([re]) => re.test(pathname))?.[1];
    const incoming = friends?.incoming.length || 0;

    const items = [
        { to: '/hesap', label: 'Akış', icon: 'feed', end: true },
        { to: `/u/${user.username}`, label: 'Profilim', short: 'Profil', icon: 'user' },
        { to: '/hesap/arkadaslar', label: 'Arkadaşlar', icon: 'users', count: incoming },
        { to: '/hesap/paketler', label: 'Paketler', icon: 'box' },
        { to: '/hesap/geri-bildirim', label: 'Geri bildirim', short: 'Bildirim', icon: 'chat' },
        user.isAdmin && { to: '/hesap/admin', label: 'Admin', icon: 'shield' },
    ].filter(Boolean);

    return (
        <div className="wrap app-shell">
            <aside className="side-nav">
                <Link to={`/u/${user.username}`} className="side-me">
                    <Avatar username={user.username} version={user.avatarVersion} size={40} />
                    <span>
                        <b>{user.username}</b>
                        <small>Profilini gör</small>
                    </span>
                </Link>
                <nav className="side-links" aria-label="Hesap">
                    {items.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.end} className="side-link">
                            <Icon name={item.icon} size={19} />
                            <span className="side-label">{item.label}</span>
                            <span className="side-short">{item.short || item.label}</span>
                            {item.count > 0 && <span className="count">{item.count}</span>}
                        </NavLink>
                    ))}
                </nav>
                <button className="side-link side-logout" onClick={logout}>
                    <Icon name="logout" size={19} />
                    <span className="side-label">Çıkış yap</span>
                </button>
            </aside>
            <div className="app-main">
                {title && <h1 className="page-title">{title}</h1>}
                {children}
            </div>
        </div>
    );
}
