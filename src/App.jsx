import { useEffect, useRef } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api, asset } from './api.js';
import { useAuth } from './auth.jsx';
import { PRODUCTS, productBySlug } from './products.js';
import { Avatar } from './components.jsx';
import Icon from './icons.jsx';
import PixelField from './PixelField.jsx';
import { usePointerLight } from './effects.jsx';
import Wordmark from './Wordmark.jsx';
import { useFriends } from './social.js';
import Hub from './pages/Hub.jsx';
import Launcher from './pages/Launcher.jsx';
import Product from './pages/Product.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AccountLayout from './pages/account/Layout.jsx';
import Feed from './pages/account/Feed.jsx';
import Friends from './pages/account/Friends.jsx';
import Packs from './pages/account/Packs.jsx';
import PackDetail from './pages/account/PackDetail.jsx';
import Feedback from './pages/account/Feedback.jsx';
import Admin from './pages/account/Admin.jsx';
import UserProfile from './pages/UserProfile.jsx';
import NotFound from './pages/NotFound.jsx';
import Verify from './pages/Verify.jsx';
import VulusalLauncher from './pages/VulusalLauncher.jsx';
import VulusalUfuk from './pages/VulusalUfuk.jsx';
import { pageMeta } from './seo.js';
import { useKuantumKapi } from './kuantumKapi.js';

export default function App() {
    const { pathname } = useLocation();
    const { status } = useAuth();
    usePointerLight();

    // API'yi önceden ısıt: kullanıcı formu doldururken bağlantı hazır olsun
    useEffect(() => { api.ping().catch(() => {}); }, []);
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    useEffect(() => { applyMeta(pageMeta(pathname)); }, [pathname]);

    return (
        <>
            <PixelField />
            <div className="torch" aria-hidden="true" />
            <a className="skip" href="#main">İçeriğe geç</a>
            {status === 'in' ? <MemberHeader /> : <GuestHeader />}
            <main id="main">
                {/* Her sayfa değişiminde içerik aşağıdan yumuşakça belirir */}
                <div className="page-enter" key={pageKey(pathname)}>
                <Routes>
                    <Route path="/" element={<Hub />} />
                    <Route path="/launcher" element={<Launcher />} />
                    <Route path="/vulusalvululauncher" element={<VulusalLauncher />} />
                    <Route path="/vulusalufuk" element={<VulusalUfuk />} />
                    <Route path="/server-panel" element={<Product product={productBySlug('server-panel')} />} />
                    <Route path="/ftbquests-editor" element={<Product product={productBySlug('ftbquests-editor')} />} />
                    <Route path="/giris" element={<Login />} />
                    <Route path="/kayit" element={<Register />} />
                    <Route path="/dogrula" element={<Verify />} />
                    <Route path="/hesap" element={<AccountLayout />}>
                        <Route index element={<Feed />} />
                        <Route path="arkadaslar" element={<Friends />} />
                        <Route path="ekran-goruntuleri" element={<Navigate to="/hesap" replace />} />
                        <Route path="paketler" element={<Packs />} />
                        <Route path="paketler/:id" element={<PackDetail />} />
                        <Route path="geri-bildirim" element={<Feedback />} />
                        <Route path="profil" element={<OwnProfile />} />
                        <Route path="admin" element={<Admin />} />
                    </Route>
                    <Route path="/u/:username" element={<UserProfile />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                </div>
            </main>
            <Footer />
            {status === 'in' && <TabBar />}
        </>
    );
}

/** Logo. Launcher sayfasında basılı tutulursa Vulu Kuantum açılır (gizli kapı, src/kuantumKapi.js). */
function Brand() {
    const { pathname } = useLocation();
    const kuantum = useKuantumKapi(pathname === '/launcher');
    return (
        <Link to="/" className="brand" aria-label="vulu ana sayfa" {...kuantum}>
            <img src={asset('img/logo.svg')} alt="" width="26" height="26" />
            <Wordmark />
        </Link>
    );
}

/** Giriş yapmamış ziyaretçinin üst çubuğu: ürünler ve hesap düğmeleri. */
function GuestHeader() {
    const { status } = useAuth();
    return (
        <header className="topbar">
            <div className="wrap topbar-inner">
                <Brand />
                <nav className="topnav" aria-label="Ürünler">
                    {PRODUCTS.map(p => <NavLink key={p.slug} to={'/' + p.slug}>{p.short || p.name}</NavLink>)}
                </nav>
                <div className="topbar-end">
                    {status === 'loading' ? <span className="topbar-wait" aria-hidden="true" /> : <>
                        <NavLink to="/giris" className="btn btn-quiet btn-sm">Giriş yap</NavLink>
                        <NavLink to="/kayit" className="btn btn-primary btn-sm">Katıl</NavLink>
                    </>}
                </div>
            </div>
        </header>
    );
}

/** Üyenin üst çubuğu: akış, arkadaşlar, paketler ve kullanıcı menüsü. Telefonda sekmeler alttaki çubuğa iner. */
function MemberHeader() {
    const friends = useFriends();
    const incoming = friends?.incoming.length || 0;
    return (
        <header className="topbar">
            <div className="wrap topbar-inner">
                <Brand />
                <nav className="topnav topnav-member" aria-label="Ana menü">
                    <NavLink to="/hesap" end>Akış</NavLink>
                    <NavLink to="/hesap/arkadaslar">Arkadaşlar{incoming > 0 && <span className="num" aria-label={`${incoming} yeni istek`}>{incoming}</span>}</NavLink>
                    <NavLink to="/hesap/paketler">Paketler</NavLink>
                    <NavLink to="/launcher">Launcher</NavLink>
                </nav>
                <div className="topbar-end">
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

/** Sağ üstteki kullanıcı menüsü: profil, geri bildirim, admin ve çıkış. Dışarı tıklayınca ya da sayfa değişince kapanır. */
function UserMenu() {
    const { user, logout } = useAuth();
    const ref = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => { ref.current?.removeAttribute('open'); }, [pathname]);
    useEffect(() => {
        const close = e => { if (ref.current?.open && !ref.current.contains(e.target)) ref.current.removeAttribute('open'); };
        const esc = e => { if (e.key === 'Escape') ref.current?.removeAttribute('open'); };
        document.addEventListener('click', close);
        document.addEventListener('keydown', esc);
        return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc); };
    }, []);

    return (
        <details className="menu" ref={ref}>
            <summary aria-label="Hesap menüsü">
                <Avatar username={user.username} version={user.avatarVersion} size={30} />
                <span className="menu-name">{user.username}</span>
                <Icon name="chevron" size={16} />
            </summary>
            <div className="menu-panel">
                <Link to={`/u/${user.username}`} className="menu-me">
                    <Avatar username={user.username} version={user.avatarVersion} size={40} />
                    <span><b>{user.username}</b><small>Profilini gör ve düzenle</small></span>
                </Link>
                <Link to="/hesap/geri-bildirim"><Icon name="chat" size={18} />Geri bildirim</Link>
                {user.isAdmin && <Link to="/hesap/admin"><Icon name="shield" size={18} />Admin</Link>}
                <Link to="/launcher"><Icon name="download" size={18} />Launcher'ı indir</Link>
                <hr />
                <button type="button" onClick={logout}><Icon name="logout" size={18} />Çıkış yap</button>
            </div>
        </details>
    );
}

/** Telefonda ekranın altında duran sekmeler (yalnızca üyeler). */
function TabBar() {
    const { user } = useAuth();
    const friends = useFriends();
    const incoming = friends?.incoming.length || 0;
    const items = [
        { to: '/hesap', label: 'Akış', icon: 'feed', end: true },
        { to: '/hesap/arkadaslar', label: 'Arkadaşlar', icon: 'users', count: incoming },
        { to: '/hesap/paketler', label: 'Paketler', icon: 'box' },
        { to: `/u/${user.username}`, label: 'Profil', icon: 'user' },
    ];
    return (
        <nav className="tabbar" aria-label="Ana menü">
            {items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end}>
                    <span className="tabbar-icon"><Icon name={item.icon} size={22} />{item.count > 0 && <span className="num">{item.count}</span>}</span>
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );
}

function Footer() {
    return (
        <footer className="footer">
            <div className="wrap footer-inner">
                <div className="footer-brand">
                    <img src={asset('img/logo.svg')} alt="" width="20" height="20" />
                    <Wordmark />
                    <span>© {new Date().getFullYear()}</span>
                </div>
                <nav className="footer-links" aria-label="Alt menü">
                    {PRODUCTS.map(p => <Link key={p.slug} to={'/' + p.slug}>{p.name}</Link>)}
                    <a href="https://github.com/vuluvulu1" target="_blank" rel="noreferrer">GitHub</a>
                </nav>
                <p className="footer-note">Mojang ya da Microsoft ile bağlantılı değildir.</p>
            </div>
        </footer>
    );
}

/** Geçiş animasyonu için sayfanın kimliği; hesap sayfaları arasında üst çubuk ve başlık sabit kalsın diye yol bütünüyle kullanılır. */
const pageKey = pathname => pathname.replace(/\/$/, '') || '/';

/** Eski "Profil" sekmesinin adresi: artık profil kendi sayfasında düzenleniyor. */
function OwnProfile() {
    const { user } = useAuth();
    return <Navigate to={`/u/${user.username}`} replace />;
}

/**
 * Site içinde gezinirken sayfa başlığını, açıklamayı, kanonik adresi ve dizinleme kuralını günceller.
 * İlk yüklemede bunlar zaten ön çizilmiş HTML'de vardır (scripts/prerender.mjs).
 */
function applyMeta(meta) {
    document.title = meta.title;
    const set = (selector, create, attr, value) => {
        let el = document.head.querySelector(selector);
        if (value == null) { el?.remove(); return; }
        if (!el) { el = create(); document.head.appendChild(el); }
        el.setAttribute(attr, value);
    };
    const metaTag = (name, prop) => () => { const m = document.createElement('meta'); m.setAttribute(prop ? 'property' : 'name', name); return m; };
    set('meta[name="description"]', metaTag('description'), 'content', meta.description ?? null);
    set('meta[property="og:title"]', metaTag('og:title', true), 'content', meta.index ? meta.title : null);
    set('meta[property="og:description"]', metaTag('og:description', true), 'content', meta.description ?? null);
    set('meta[property="og:url"]', metaTag('og:url', true), 'content', meta.canonical ?? null);
    set('meta[name="robots"]', metaTag('robots'), 'content', meta.index ? null : 'noindex');
    set('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; }, 'href', meta.canonical ?? null);
}
