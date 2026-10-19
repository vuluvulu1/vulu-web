// vulu'nun üç ürünü. Ana sayfadaki kartlar ve ürün sayfaları bu listeden üretilir.
// Metinler sade ve iddiasız tutulur; özellikler yalnızca ürünlerin kendi README'lerinde yazanlardır.

export const PRODUCTS = [
    {
        slug: 'launcher',
        name: 'vulu Launcher',
        logo: 'img/logo.svg',
        summary: 'Minecraft\'ı kurmak, modlamak ve oynamak için bir launcher. Instance\'lar, mod paketleri, sunucular ve sohbet tek uygulamada bulunur.',
        platforms: 'Windows',
    },
    {
        slug: 'server-panel',
        name: 'vulu Server Panel',
        logo: 'img/server-panel.svg',
        shot: ['img/server-panel-shot.webp', 'vulu Server Panel\'de çalışan bir sunucunun sayfası'],
        repo: 'vulu-server-panel',
        asset: /^vulu-panel-.*\.zip$/,
        summary: 'Minecraft sunucularını tarayıcıdan kurmak, yönetmek ve izlemek için kendi bilgisayarında çalışan bir panel.',
        platforms: 'Windows, Linux ve macOS',
        lead: 'vulu Server Panel, Minecraft sunucularını kurmak, yönetmek ve izlemek için kendi bilgisayarında çalışan bir web panelidir. Java, sunucu dosyaları ve mod yükleyiciler gerektiğinde otomatik olarak kurulur.',
        features: [
            ['Sunucu yönetimi', 'Sunucular panelden oluşturulur, başlatılır ve durdurulur. Konsol canlı izlenir ve komut gönderilir.'],
            ['Otomatik kurulum', 'Java ile Paper, Fabric, Forge ve NeoForge gerektiğinde indirilip kurulur.'],
            ['Modlar ve modpack\'ler', 'Modrinth\'teki modlar bağımlılıklarıyla birlikte kurulur. Modpack dosyalarından sunucu oluşturulur.'],
            ['İzleme', 'İşlemci ve bellek kullanımı, oyuncu listesi ve TPS canlı grafiklerle gösterilir.'],
            ['Yedekleme ve zamanlama', 'Tam yedek ya da yalnızca dünya yedeği alınır. Yeniden başlatma ve yedekleme belirli saatlere kurulabilir.'],
            ['Dosya yöneticisi', 'Sunucu klasörü panelden gezilir; dosyalar düzenlenir, yüklenir ve indirilir.'],
            ['Oyuncular', 'Beyaz liste, OP, yasaklama ve atma işlemleri panelden yapılır.'],
            ['vulu Packs', 'vulu Launcher\'daki paketlerden tek tıkla sunucu kurulur. Paket güncellenince sunucu da güncellenir.'],
            ['Çökme analizi', 'Sunucu çöktüğünde kayıtlar incelenir ve olası sebep gösterilir.'],
            ['Dil ve temalar', 'Arayüz Türkçe ve İngilizce kullanılabilir. Dört tema arasından seçim yapılır.'],
        ],
        steps: [
            'Son sürümün zip dosyasını indirip bir klasöre çıkar.',
            'Windows\'ta baslat.bat dosyasını, Linux ve macOS\'ta baslat.sh dosyasını çalıştır.',
            'İlk açılışta gerekenler kurulur ve panel tarayıcıda açılır.',
        ],
        note: 'Python 3.11 veya üstü gerekir. Panel varsayılan olarak yalnızca kurulduğu bilgisayardan açılır.',
    },
    {
        slug: 'ftbquests-editor',
        name: 'FTB Quests Editor',
        logo: 'img/ftbquests-editor.svg',
        shot: ['img/ftbquests-editor-shot.webp', 'FTB Quests Editor\'de bir görev haritası'],
        repo: 'vulu-ftbquests-editor',
        asset: /\.exe$/,
        summary: 'Bir modpack\'in FTB Quests görev kitabını oyunu açmadan düzenlemek için bir masaüstü uygulaması.',
        platforms: 'Windows · Minecraft 1.18–1.20.1',
        lead: 'FTB Quests Editor, bir modpack\'in görev kitabını oyunu açmadan, masaüstünde düzenlemek için yapılmış bir uygulamadır. Görev dosyaları doğrudan açılır ve oyundaki kitapta olduğu gibi gösterilir.',
        features: [
            ['Tanıdık düzenleme', 'Haritaya sağ tıklanarak görev eklenir, görevin üzerine tıklanarak düzenlenir. Görevler, ödüller ve bağımlılıklar aynı pencerede bulunur.'],
            ['Gerçek eşya simgeleri', 'Simgeler oyunun, modların ve kaynak paketlerinin dosyalarından okunur. 3D blok modelleri de gösterilir.'],
            ['Eşya arama', 'Eşyalar adına, kimliğine ya da ait olduğu moda göre aranır.'],
            ['Kodsuz biçimlendirme', 'Açıklamalar araç çubuğuyla biçimlendirilir. Renk kodları otomatik olarak yazılır.'],
            ['Çeviri desteği', 'Dil anahtarı kullanan paketlerde asıl metin gösterilir ve düzenlenir.'],
            ['Bölüm görselleri', 'Bölümlere resim eklenir; resimler taşınır ve boyutlandırılır.'],
            ['Güvenli kaydetme', 'Yalnızca değişen dosyalar yazılır ve her kayıttan önce yedek alınır. Geri alma ve yineleme desteklenir.'],
            ['Gelişmiş mod', 'Her görev ayarı yan panelde düzenlenir. Formu olmayan alanlar için SNBT doğrudan düzenlenebilir.'],
        ],
        steps: [
            'Exe dosyasını indir.',
            'Dosyayı çalıştır; kurulum gerekmez.',
        ],
        note: 'Uygulama henüz imzalı olmadığı için Windows SmartScreen uyarısı gösterebilir. Bu durumda Ek bilgi ve ardından Yine de çalıştır seçilerek devam edilir.',
    },
];

export const productBySlug = slug => PRODUCTS.find(p => p.slug === slug);
