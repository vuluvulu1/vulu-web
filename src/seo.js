// Sayfa başlıkları, açıklamalar ve arama motorları için yapılandırılmış veri (JSON-LD).
// Hem derleme sırasındaki ön çizim (scripts/prerender.mjs) hem de site içi gezinme (App.jsx) buradan okur.
// Başlıklar insanların gerçekten aradığı ifadeleri içerir ama doğal bir cümle gibi kalır.

export const SITE_URL = 'https://vuluvulu.com.tr';
const OG_IMAGE = `${SITE_URL}/img/og.png`;
const LICENSE = 'https://www.gnu.org/licenses/agpl-3.0.html';

/** Arama motorlarına açık sayfalar; sitemap.xml ve ön çizim bu listeden üretilir. */
export const PUBLIC_PAGES = {
    '/': {
        title: 'vulu – Minecraft launcher\'ı, sunucu paneli ve görev editörü',
        description: 'vulu Launcher, vulu Server Panel ve FTB Quests Editor: Minecraft\'ı modlu oynamak, kendi sunucunu kurmak ve görev kitabını düzenlemek için ücretsiz ve açık kaynak araçlar.',
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'vulu',
            url: SITE_URL,
            inLanguage: 'tr',
        },
    },
    '/launcher': {
        title: 'vulu Launcher – Ücretsiz Türkçe Minecraft launcher\'ı',
        description: 'Fabric, Quilt, Forge ve NeoForge instance\'ları, Modrinth\'ten mod kurulumu, hazır mod paketleri, sunucular ve arkadaşlarınla sohbet tek uygulamada. Windows için ücretsiz Minecraft launcher\'ı.',
        jsonLd: app({
            name: 'vulu Launcher',
            url: `${SITE_URL}/launcher`,
            category: 'GameApplication',
            os: 'Windows 10, Windows 11',
            download: `${SITE_URL}/releases/vulu-launcher-setup.exe`,
            image: `${SITE_URL}/img/logo-512.png`,
            screenshot: `${SITE_URL}/img/home.png`,
            description: 'Minecraft\'ı modlu ya da modsuz oynamak için bir launcher: instance\'lar, Modrinth modları, mod paketleri, sunucular ve sohbet.',
        }),
    },
    '/server-panel': {
        title: 'vulu Server Panel – Minecraft sunucu kurma ve yönetim paneli',
        description: 'Minecraft sunucunu kendi bilgisayarında kur ve tarayıcıdan yönet: Paper, Fabric, Forge ve NeoForge, Modrinth modları, canlı konsol, yedekleme ve zamanlama. Ücretsiz ve açık kaynak.',
        jsonLd: app({
            name: 'vulu Server Panel',
            url: `${SITE_URL}/server-panel`,
            category: 'UtilitiesApplication',
            os: 'Windows, Linux, macOS',
            download: 'https://github.com/vuluvulu1/vulu-server-panel/releases/latest',
            image: `${SITE_URL}/img/server-panel.svg`,
            screenshot: `${SITE_URL}/img/server-panel-shot.webp`,
            description: 'Minecraft sunucunu kendi bilgisayarında çalıştıran ve tarayıcıdan yönetmeni sağlayan bir panel.',
        }),
    },
    '/ftbquests-editor': {
        title: 'FTB Quests Editor – Görev kitabını oyunu açmadan düzenle',
        description: 'FTB Quests görev kitabını masaüstünde düzenle: gerçek eşya simgeleri, eşya arama, çeviri desteği, bölüm görselleri ve her kayıttan önce yedek. Windows için ücretsiz.',
        jsonLd: app({
            name: 'FTB Quests Editor',
            url: `${SITE_URL}/ftbquests-editor`,
            category: 'DeveloperApplication',
            os: 'Windows',
            download: 'https://github.com/vuluvulu1/vulu-ftbquests-editor/releases/latest',
            image: `${SITE_URL}/img/ftbquests-editor.svg`,
            screenshot: `${SITE_URL}/img/ftbquests-editor-shot.webp`,
            description: 'Bir modpack\'in FTB Quests görev kitabını oyunu açmadan düzenlemek için masaüstü uygulaması.',
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
    [/^\/hesap\/admin$/, 'Admin – vulu'],
    [/^\/hesap\/profil$/, 'Profil – vulu'],
    [/^\/hesap\/paketler/, 'Paketler – vulu'],
    [/^\/hesap\/ekran-goruntuleri$/, 'Ekran görüntüleri – vulu'],
    [/^\/hesap\/geri-bildirim$/, 'Geri bildirim – vulu'],
    [/^\/hesap/, 'Hesabım – vulu'],
    [/^\/u\/([^/]+)$/, m => `${decodeURIComponent(m[1])} – vulu`],
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
