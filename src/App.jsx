import { useEffect } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DOWNLOAD_URL, api, asset } from './api.js';
import { useAuth } from './auth.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';

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
                    <Route path="/" element={<Home />} />
                    <Route path="/giris" element={<Login />} />
                    <Route path="/kayit" element={<Register />} />
                    <Route path="/hesap" element={<Account />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <footer className="footer">
                <div className="wrap footer-inner">
                    <div className="footer-brand">
                        <img src={asset('img/logo.svg')} alt="" width="20" height="20" />
                        <b>vulu Launcher</b>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                    <nav className="footer-links">
                        <a href={DOWNLOAD_URL}>İndir</a>
                        <Link to="/kayit">Hesap iste</Link>
                        <Link to="/giris">Giriş yap</Link>
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
                    <span>vulu Launcher</span>
                    <span className="tag">Beta</span>
                </Link>
                <nav className="nav">
                    {status === 'in' ? (
                        <NavLink to="/hesap" className="btn btn-ghost btn-sm">{user.username}</NavLink>
                    ) : (
                        <>
                            <NavLink to="/giris" className="btn btn-ghost btn-sm">Giriş yap</NavLink>
                            <NavLink to="/kayit" className="btn btn-ghost btn-sm hide-sm">Kayıt ol</NavLink>
                            <a href={DOWNLOAD_URL} className="btn btn-primary btn-sm">İndir</a>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
