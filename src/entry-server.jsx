import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AuthProvider } from './auth.jsx';
import App from './App.jsx';

/**
 * Derleme sırasında bir sayfanın HTML'ini üretir (scripts/prerender.mjs kullanır). Ziyaretçi girişsiz sayılır;
 * sürüm, istatistik gibi canlı veriler tarayıcıda sonradan yüklenir.
 */
export function render(url) {
    return renderToString(
        <StrictMode>
            <StaticRouter location={url}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </StaticRouter>
        </StrictMode>,
    );
}

export { PUBLIC_PAGES, SITE_URL, pageMeta } from './seo.js';
