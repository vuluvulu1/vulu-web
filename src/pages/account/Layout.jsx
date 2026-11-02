import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';

// Sayfanın üstündeki başlık ve kısa açıklama; akış, profil ve paket ayrıntısı kendi başlığını çizer
const TITLES = [
    [/^\/hesap\/arkadaslar$/, 'Arkadaşlar', 'Kim çevrimiçi, kim ne oynuyor, hepsi burada. Yeni arkadaşlarını da buradan ekleyebilirsin.'],
    [/^\/hesap\/paketler$/, 'Paketler', 'vulu Packs\'teki paketler ve her güncellemede neyin değiştiği. Bir paketi kurmak için launcher\'da vulu Packs\'i açman yeterli.'],
    [/^\/hesap\/geri-bildirim$/, 'Geri bildirim', null],
    [/^\/hesap\/admin$/, 'Admin', null],
];

/** Hesap bölümü: giriş yapılmamışsa giriş sayfasına gider, yapılmışsa seçili sayfayı gösterir. */
export default function AccountLayout() {
    const { status } = useAuth();
    if (status === 'loading') return <div className="wrap app"><div className="skeleton" style={{ height: 320 }} aria-label="Yükleniyor" /></div>;
    if (status === 'out') return <Navigate to="/giris" replace />;
    return <AccountShell><Outlet /></AccountShell>;
}

/** Giriş yapmış üyenin sayfa iskeleti. Gezinme üst çubukta (telefonda alttaki sekmelerde). */
export function AccountShell({ children }) {
    const { pathname } = useLocation();
    const [, title, lead] = TITLES.find(([re]) => re.test(pathname)) || [];
    return (
        <div className="wrap app">
            {title && (
                <header className="page-head">
                    <h1>{title}</h1>
                    {lead && <p>{lead}</p>}
                </header>
            )}
            {children}
        </div>
    );
}
