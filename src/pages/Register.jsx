import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

// Kurallar vulu-api'deki /auth/register ile aynı; asıl denetim sunucuda yapılır
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Status({ msg }) {
    if (!msg?.text) return null;
    return <p className={msg.error ? 'status error' : 'status'} role={msg.error ? 'alert' : 'status'}>{msg.text}</p>;
}

export default function Register() {
    const { status } = useAuth();
    const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const [done, setDone] = useState(null);

    if (status === 'in') return <Navigate to="/hesap" replace />;

    const set = key => e => {
        let value = e.target.value;
        // Oyun içi ad kuralları: İngilizce harf, rakam ve alt çizgi
        if (key === 'username') value = value.replace(/[^a-zA-Z0-9_]/g, '');
        setForm(f => ({ ...f, [key]: value }));
    };

    async function submit(event) {
        event.preventDefault();
        const username = form.username.trim(), email = form.email.trim();
        const fail = text => setMsg({ text, error: true });

        if (username.length < 3 || username.length > 16) return fail('Kullanıcı adı 3-16 karakter olmalı.');
        if (!EMAIL.test(email)) return fail('Geçerli bir e-posta adresi gir.');
        if (form.password.length < 6) return fail('Şifre en az 6 karakter olmalı.');
        if (new TextEncoder().encode(form.password).length > 72) return fail('Şifre en fazla 72 karakter olabilir.');
        if (form.password !== form.password2) return fail('Şifreler aynı değil.');

        setBusy(true);
        setMsg({ text: 'Gönderiliyor…' });
        try {
            await api.register(username, email, form.password, {
                onSlow: () => setMsg({ text: 'Sunucu uyanıyor, bu yarım dakika kadar sürebilir…' }),
            });
            setDone(username);
            setForm({ username: '', email: '', password: '', password2: '' });
            setMsg(null);
        } catch (err) {
            fail(err.message);
        } finally {
            setBusy(false);
        }
    }

    if (done) {
        return (
            <section className="wrap auth">
                <div className="card auth-card">
                    <h1>İsteğin gönderildi</h1>
                    <p>
                        <b>{done}</b> için katılma isteğin alındı. Bir admin onayladığında hem launcher'dan hem de
                        buradan aynı kullanıcı adı ve şifreyle giriş yapabilirsin.
                    </p>
                    <Link className="btn btn-primary" to="/giris">Girişe dön</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="wrap auth">
            <form className="card auth-card" onSubmit={submit} noValidate>
                <h1>Katılma isteği</h1>
                <p className="muted">Hesaplar davetle açılır. İsteğini bir admin onayladığında hesabın açılır.</p>
                <label>
                    Kullanıcı adı
                    <input value={form.username} onChange={set('username')} autoComplete="username" maxLength={16} autoFocus />
                    <small>Oyunda görünecek ad. 3-16 karakter; İngilizce harf, rakam ve _.</small>
                </label>
                <label>
                    E-posta
                    <input type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={254} />
                </label>
                <label>
                    Şifre
                    <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" maxLength={72} />
                </label>
                <label>
                    Şifre (tekrar)
                    <input type="password" value={form.password2} onChange={set('password2')} autoComplete="new-password" maxLength={72} />
                </label>
                <Status msg={msg} />
                <button className="btn btn-primary" disabled={busy}>İsteği gönder</button>
                <p className="auth-alt">Zaten hesabın var mı? <Link to="/giris">Giriş yap</Link></p>
            </form>
        </section>
    );
}
