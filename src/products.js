// vulu'nun üç uygulaması. Ana sayfadaki kartlar ve ürün sayfaları bu listeden üretilir.
// vulu kapalı bir topluluk: metinler tanıtım yapmaz, uygulamanın ne olduğunu tek cümleyle söyler.

export const PRODUCTS = [
    {
        slug: 'launcher',
        name: 'vulu Launcher',
        short: 'Launcher',
        logo: 'img/logo.svg',
        summary: 'Minecraft launcher\'ı.',
        platforms: 'Windows · Android',
    },
    {
        slug: 'server-panel',
        name: 'vulu Server Panel',
        short: 'Server Panel',
        logo: 'img/server-panel.svg',
        shot: ['img/server-panel-shot.webp', 'vulu Server Panel\'de çalışan bir sunucunun sayfası'],
        repo: 'vulu-server-panel',
        asset: /^vulu-panel-.*\.zip$/,
        summary: 'Kendi bilgisayarında Minecraft sunucusu açmak için panel.',
        platforms: 'Windows, Linux ve macOS',
        lead: 'Minecraft sunucusunu kendi bilgisayarında çalıştırır, tarayıcıdan yönetilir.',
        steps: [
            'Zip\'i indir ve bir klasöre çıkar.',
            'Windows\'ta baslat.bat, Linux ve macOS\'ta bash baslat.sh.',
        ],
        note: 'Python 3.11+ gerekir. Panel ilk başta yalnızca kurulduğu bilgisayardan açılır.',
    },
    {
        slug: 'ftbquests-editor',
        name: 'FTB Quests Editor',
        short: 'Quests Editor',
        logo: 'img/ftbquests-editor.svg',
        shot: ['img/ftbquests-editor-shot.webp', 'FTB Quests Editor\'de bir görev haritası'],
        repo: 'vulu-ftbquests-editor',
        asset: /\.exe$/,
        summary: 'FTB Quests görev kitabını oyun dışında düzenler.',
        platforms: 'Windows · Minecraft 1.18–1.20.1',
        lead: 'Modpack\'in FTB Quests görev kitabını oyunu açmadan düzenler.',
        steps: [
            'Exe\'yi indir ve aç; kurulum gerekmez.',
        ],
        note: 'SmartScreen uyarısı çıkarsa "Ek bilgi" → "Yine de çalıştır".',
    },
];

export const productBySlug = slug => PRODUCTS.find(p => p.slug === slug);
