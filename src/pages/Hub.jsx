import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { asset, githubRelease, latestRelease } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PRODUCTS } from '../products.js';
import Wordmark from '../Wordmark.jsx';

/** Ana sayfa: vulu'nun üç ürünü arasından seçim. */
export default function Hub() {
    const { status, user } = useAuth();
    const [versions, setVersions] = useState({});

    useEffect(() => {
        latestRelease().then(r => r && setVersions(v => ({ ...v, launcher: r.tag })));
        for (const p of PRODUCTS.filter(p => p.repo)) {
            githubRelease(p.repo, p.asset).then(r => r && setVersions(v => ({ ...v, [p.slug]: r.tag })));
        }
    }, []);

    return (
        <section className="wrap hub">
            <h1 className="hub-title"><Wordmark animate /></h1>
            <h2 className="hub-question">Ne için buradasın?</h2>
            <p className="lead">vulu, Minecraft için yapılmış üç araçtan oluşur. İlgilendiğin aracı seçerek devam edebilirsin.</p>

            <div className="products">
                {PRODUCTS.map(p => (
                    <Link to={'/' + p.slug} className="product-card" key={p.slug}>
                        <img src={asset(p.logo)} alt="" width="56" height="56" />
                        <h3>{p.name}</h3>
                        <p>{p.summary}</p>
                        <span className="product-meta">
                            {p.platforms}{versions[p.slug] && <> · <span className="mono">{versions[p.slug]}</span></>}
                        </span>
                        <span className="product-go">Sayfasına git →</span>
                    </Link>
                ))}
            </div>

            {status === 'in' && (
                <p className="hub-account">
                    <b>{user.username}</b> olarak giriş yaptın. Duyurular, ekran görüntüleri ve paketler için{' '}
                    <Link to="/hesap">hesabına</Link> bakabilirsin.
                </p>
            )}
        </section>
    );
}
