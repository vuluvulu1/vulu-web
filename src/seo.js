// Sayfa başlıkları, açıklamalar ve arama motorları için yapılandırılmış veri (JSON-LD).
// Hem derleme sırasındaki ön çizim (scripts/prerender.mjs) hem de site içi gezinme (App.jsx) buradan okur.
// vulu kapalı bir topluluk: başlıklar ve açıklamalar kısa, tanıtım dili yok.

export const SITE_URL = 'https://vuluvulu.com.tr';
const OG_IMAGE = `${SITE_URL}/img/og.png`;
const LICENSE = 'https://www.gnu.org/licenses/agpl-3.0.html';

/** Arama motorlarına açık sayfalar; sitemap.xml ve ön çizim bu listeden üretilir. */
export const PUBLIC_PAGES = {
    '/': {
        title: 'vulu',
        description: 'vulu Launcher, vulu Server Panel ve FTB Quests Editor.',
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'vulu',
            url: SITE_URL,
            inLanguage: 'tr',
        },
    },
    '/launcher': {
        title: 'vulu Launcher',
        description: 'vulu\'nun Minecraft launcher\'ı. Windows ve Android.',
        jsonLd: app({
            name: 'vulu Launcher',
            url: `${SITE_URL}/launcher`,
            category: 'GameApplication',
            os: 'Windows 10, Windows 11, Android 8+',
            download: `${SITE_URL}/releases/vulu-launcher-setup.exe`,
            image: `${SITE_URL}/img/logo-512.png`,
            screenshot: `${SITE_URL}/img/home.png`,
            description: 'vulu\'nun Minecraft launcher\'ı.',
        }),
    },
    '/server-panel': {
        title: 'vulu Server Panel',
        description: 'Minecraft sunucusunu bilgisayarında ya da VDS/VPS\'te kurup yönetmek için panel.',
        jsonLd: app({
            name: 'vulu Server Panel',
            url: `${SITE_URL}/server-panel`,
            category: 'UtilitiesApplication',
            os: 'Windows, Linux, macOS',
            download: 'https://github.com/vuluvulu1/vulu-server-panel/releases/latest',
            image: `${SITE_URL}/img/server-panel.svg`,
            screenshot: `${SITE_URL}/img/server-panel-shot.webp`,
            description: 'Minecraft sunucusunu bilgisayarında ya da VDS/VPS\'te kurup yönetmek için panel.',
        }),
    },
    '/ftbquests-editor': {
        title: 'FTB Quests Editor',
        description: 'FTB Quests görev kitabını oyun dışında düzenler.',
        jsonLd: app({
            name: 'FTB Quests Editor',
            url: `${SITE_URL}/ftbquests-editor`,
            category: 'DeveloperApplication',
            os: 'Windows',
            download: 'https://github.com/vuluvulu1/vulu-ftbquests-editor/releases/latest',
            image: `${SITE_URL}/img/ftbquests-editor.svg`,
            screenshot: `${SITE_URL}/img/ftbquests-editor-shot.webp`,
            description: 'FTB Quests görev kitabını oyun dışında düzenler.',
        }),
    },
};

function app({ name, url, category, os, download, image, screenshot, description }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name, url, description, image, screenshot,
        applicationCategory: category,
        operatingSystem: os,
        downloadUrl: download,
        inLanguage: 'tr',
        license: LICENSE,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
        author: { '@type': 'Organization', name: 'vulu', url: SITE_URL },
    };
}

/** Arama motorlarına kapalı uygulama sayfaları için genel başlıklar. */
const PRIVATE_TITLES = [
    [/^\/giris$/, 'Giriş yap – vulu'],
    [/^\/kayit$/, 'Katıl – vulu'],
    [/^\/dogrula$/, 'E-posta doğrulama – vulu'],
    [/^\/hesap\/admin$/, 'Admin – vulu'],
    [/^\/hesap\/profil$/, 'Profil – vulu'],
    [/^\/hesap\/paketler/, 'Paketler – vulu'],
    [/^\/hesap\/arkadaslar$/, 'Arkadaşlar – vulu'],
    [/^\/hesap\/geri-bildirim$/, 'Geri bildirim – vulu'],
    [/^\/hesap\/?$/, 'Akış – vulu'],
    [/^\/hesap/, 'Hesabım – vulu'],
    [/^\/u\/([^/]+)$/, m => `${decodeURIComponent(m[1])} – vulu`],
    [/^\/liderlik\/?$/, 'Liderlik – vulu'],
];

/** Bir adresin başlığı, açıklaması ve dizine eklenip eklenmeyeceği. */
export function pageMeta(pathname) {
    const page = PUBLIC_PAGES[pathname];
    if (page) return { ...page, canonical: SITE_URL + (pathname === '/' ? '/' : pathname), index: true, image: OG_IMAGE };
    for (const [re, title] of PRIVATE_TITLES) {
        const m = pathname.match(re);
        if (m) return { title: typeof title === 'function' ? title(m) : title, index: false };
    }
    return { title: 'Sayfa bulunamadı – vulu', index: false };
}
