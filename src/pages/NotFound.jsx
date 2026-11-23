import { Link } from 'react-router-dom';
import { TemaKutu } from '../tema.jsx';

/** Olmayan bir adres. Sunucu bu sayfayı 404 koduyla verir, böylece arama motorları onu dizine eklemez. */
export default function NotFound() {
    return (
        <TemaKutu>
            <div className="auth-card">
                <h1>Sayfa bulunamadı</h1>
                <p className="muted">Bu adreste bir şey yok.</p>
                <Link className="btn btn-primary" to="/">Ana sayfaya dön</Link>
            </div>
        </TemaKutu>
    );
}
