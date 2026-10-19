import { useEffect } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api, asset } from './api.js';
import { useAuth } from './auth.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';

export default function App() {
    const { pathname } = useLocation();

    // Render'daki API uykudaysa kullanıcı formu doldururken uyansın
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
                    <span>© {new Date().getFullYear()} vulu</span>
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
                    <img src={asset('img/logo.svg')} alt="" width="28" height="28" />
                    <span>vulu</span>
                </Link>
                <nav className="nav">
                    {status === 'in' ? (
                        <NavLink to="/hesap" className="btn btn-ghost btn-sm">{user.username}</NavLink>
                    ) : (
                        <>
                            <NavLink to="/giris" className="btn btn-ghost btn-sm">Giriş yap</NavLink>
                            <NavLink to="/kayit" className="btn btn-primary btn-sm">Kayıt ol</NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
