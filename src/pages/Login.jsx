import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Status } from './Register.jsx';

export default function Login() {
    const { status, login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);

    if (status === 'in') return <Navigate to="/hesap" replace />;

    async function submit(event) {
        event.preventDefault();
        if (!username.trim() || !password) { setMsg({ text: 'Kullanıcı adı ve şifre gerekli.', error: true }); return; }
        setBusy(true);
        setMsg({ text: 'Giriş yapılıyor…' });
        try {
            await login(username.trim(), password, {
                onSlow: () => setMsg({ text: 'Sunucu biraz geç cevap veriyor, birkaç saniye bekle…' }),
            });
            navigate('/hesap');
        } catch (err) {
            setMsg({ text: err.message, error: true });
            setBusy(false);
        }
    }

    return (
        <section className="wrap auth">
            <form className="card auth-card" onSubmit={submit} noValidate>
                <h1>Giriş yap</h1>
                <p className="muted">Launcher'da kullandığın kullanıcı adı ve şifreyle giriş yap.</p>
                <label>
                    Kullanıcı adı
                    <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" maxLength={32} autoFocus />
                </label>
                <label>
                    Şifre
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" maxLength={200} />
                </label>
                <Status msg={msg} />
                <button className="btn btn-primary" disabled={busy}>Giriş yap</button>
                <p className="auth-alt">Hesabın yok mu? <Link to="/kayit">Katıl</Link></p>
            </form>
        </section>
    );
}
