import { useEffect } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api, asset } from './api.js';
import { useAuth } from './auth.jsx';
import { PRODUCTS, productBySlug } from './products.js';
import Hub from './pages/Hub.jsx';
import Launcher from './pages/Launcher.jsx';
import Product from './pages/Product.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AccountLayout from './pages/account/Layout.jsx';
import Overview from './pages/account/Overview.jsx';
import Shots from './pages/account/Shots.jsx';
import Packs from './pages/account/Packs.jsx';
import Profile from './pages/account/Profile.jsx';
import PackDetail from './pages/account/PackDetail.jsx';
import Feedback from './pages/account/Feedback.jsx';
import Admin from './pages/account/Admin.jsx';
import UserProfile from './pages/UserProfile.jsx';

export default function App() {
    const { pathname } = useLocation();

    // API'yi önceden ısıt: kullanıcı formu doldururken bağlantı hazır olsun
    useEffect(() => { api.ping().catch(() => {}); }, []);
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Hub />} />
                    <Route path="/launcher" element={<Launcher />} />
                    <Route path="/server-panel" element={<Product product={productBySlug('server-panel')} />} />
                    <Route path="/ftbquests-editor" element={<Product product={productBySlug('ftbquests-editor')} />} />
                    <Route path="/giris" element={<Login />} />
                    <Route path="/kayit" element={<Register />} />
                    <Route path="/hesap" element={<AccountLayout />}>
                        <Route index element={<Overview />} />
                        <Route path="ekran-goruntuleri" element={<Shots />} />
                        <Route path="paketler" element={<Packs />} />
                        <Route path="paketler/:id" element={<PackDetail />} />
                        <Route path="geri-bildirim" element={<Feedback />} />
                        <Route path="profil" element={<Profile />} />
                        <Route path="admin" element={<Admin />} />
                    </Route>
                    <Route path="/u/:username" element={<UserProfile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
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
                        <NavLink to="/hesap" className="btn btn-ghost btn-sm">{user.username}</NavLink>
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
