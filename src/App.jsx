import { useEffect } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api, asset } from './api.js';
import { useAuth } from './auth.jsx';
import { PRODUCTS, productBySlug } from './products.js';
import { Avatar } from './components.jsx';
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
import PixelField from './PixelField.jsx';
import NotFound from './pages/NotFound.jsx';
import Verify from './pages/Verify.jsx';
import { pageMeta } from './seo.js';

export default function App() {
    const { pathname } = useLocation();

    // API'yi önceden ısıt: kullanıcı formu doldururken bağlantı hazır olsun
    useEffect(() => { api.ping().catch(() => {}); }, []);
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    useEffect(() => { applyMeta(pageMeta(pathname)); }, [pathname]);

    return (
        <>
            <PixelField />
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Hub />} />
                    <Route path="/launcher" element={<Launcher />} />
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
            </main>
            <footer className="footer">
                <div className="wrap footer-inner">
                    <div className="footer-brand">
                        <img src={asset('img/logo.svg')} alt="" width="20" height="20" />
                        <b>vulu</b>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                    <nav className="footer-links">
                        {PRODUCTS.map(p => <Link key={p.slug} to={'/' + p.slug}>{p.name}</Link>)}
                        <a href="https://github.com/vuluvulu1" target="_blank" rel="noreferrer">GitHub</a>
                    </nav>
                </div>
            </footer>
        </>
    );
}

function Header() {
    const { status, user } = useAuth();
    return (
        <header className="header">
            <div className="wrap header-inner">
                <Link to="/" className="brand">
                    <img src={asset('img/logo.svg')} alt="" width="24" height="24" />
                    <span>vulu</span>
                </Link>
                <nav className="nav-products">
                    {PRODUCTS.map(p => <NavLink key={p.slug} to={'/' + p.slug} className="nav-link">{p.name}</NavLink>)}
                </nav>
                <nav className="nav">
                    {status === 'in' ? (
                        <NavLink to="/hesap" className="btn btn-ghost btn-sm header-me">
                            <Avatar username={user.username} version={user.avatarVersion} size={22} />
                            {user.username}
                        </NavLink>
                    ) : (
                        <>
                            <NavLink to="/giris" className="btn btn-ghost btn-sm">Giriş yap</NavLink>
                            <NavLink to="/kayit" className="btn btn-primary btn-sm">Katıl</NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

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
