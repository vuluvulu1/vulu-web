import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

/** E-postadaki doğrulama bağlantısının açtığı sayfa: /dogrula?token=… */
export default function Verify() {
    const [params] = useSearchParams();
    const token = params.get('token') || '';
    const [state, setState] = useState({ status: 'working' });   // working | ok | error
    const sent = useRef(false);

    useEffect(() => {
        if (sent.current) return;   // React geliştirme modunda effect iki kez çalışır; token bir kez harcanır
        sent.current = true;
        if (!token) { setState({ status: 'error', message: 'Bağlantı eksik görünüyor. E-postadaki bağlantıyı tam olarak açtığından emin ol.' }); return; }
        api.verifyEmail(token)
            .then(r => setState({ status: 'ok', username: r.username }))
            .catch(err => setState({ status: 'error', message: err.message }));
    }, [token]);

    return (
        <section className="wrap auth">
            <div className="card auth-card">
                {state.status === 'working' && <><h1>Doğrulanıyor…</h1><p className="muted">Bir saniye.</p></>}
                {state.status === 'ok' && (
                    <>
                        <h1>E-postan doğrulandı</h1>
                        <p>
                            Teşekkürler, <b>{state.username}</b>. İsteğin artık bir adminin önünde. Onaylandığında launcher'a da
                            siteye de aynı kullanıcı adı ve şifreyle girersin.
                        </p>
                        <Link className="btn btn-primary" to="/">Ana sayfaya dön</Link>
                    </>
                )}
                {state.status === 'error' && (
                    <>
                        <h1>Doğrulanamadı</h1>
                        <p className="muted">{state.message}</p>
                        <Link className="btn btn-primary" to="/kayit">Katılma formuna git</Link>
                    </>
                )}
            </div>
        </section>
    );
}
