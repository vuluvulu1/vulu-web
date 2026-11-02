import { Link } from 'react-router-dom';

/** Olmayan bir adres. Sunucu bu sayfayı 404 koduyla verir, böylece arama motorları onu dizine eklemez. */
export default function NotFound() {
    return (
        <section className="wrap auth">
            <div className="auth-card">
                <h1>Sayfa bulunamadı</h1>
                <p className="muted">Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Ana sayfadan yolunu kolayca bulursun.</p>
                <Link className="btn btn-primary" to="/">Ana sayfaya dön</Link>
            </div>
        </section>
    );
}
