// vulu'nun üç ürünü. Ana sayfadaki kartlar ve ürün sayfaları bu listeden üretilir.
// Yazım: önce sade ve açık; okura "sen" diye, kısa ve sakin cümlelerle. Ürün ne yapıyorsa o anlatılır;
// yapmacık samimiyet, laf kalabalığı ve abartılı vaat yoktur.
// Özellikler yalnızca ürünlerin kendi README'lerinde yazanlardır.

export const PRODUCTS = [
    {
        slug: 'launcher',
        name: 'vulu Launcher',
        short: 'Launcher',
        logo: 'img/logo.svg',
        summary: 'Minecraft\'ı modlu ya da modsuz oynamak için bir launcher. Instance\'lar, paketler, sunucular ve arkadaşların tek pencerede.',
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
        summary: 'Minecraft sunucunu kendi bilgisayarında çalıştıran ve tarayıcıdan yönetmeni sağlayan bir panel.',
        platforms: 'Windows, Linux ve macOS',
        lead: 'vulu Server Panel, Minecraft sunucunu kendi bilgisayarında çalıştırır ve tarayıcıdan yönetmeni sağlar. Java\'yı, sunucu dosyalarını ve mod yükleyiciyi kendisi indirip kurar; sürümü ve ayarları sen seçersin.',
        features: [
            ['Sunucu yönetimi', 'Sunucu oluştur, başlat, durdur. Konsolu canlı izle, komutları oradan gönder.'],
            ['Otomatik kurulum', 'Paper, Fabric, Forge ya da NeoForge\'u seç; gereken Java ve sunucu dosyaları kendiliğinden iner.'],
            ['Modlar ve modpack\'ler', 'Modrinth\'teki modları bağımlılıklarıyla birlikte kur ya da bir modpack dosyasından doğrudan sunucu aç.'],
            ['İzleme', 'İşlemci ve bellek kullanımı, oyuncular ve TPS canlı grafiklerde.'],
            ['Yedekleme ve zamanlama', 'Yalnızca dünyanın ya da bütün sunucunun yedeğini al. Yeniden başlatmaları ve yedekleri belirli saatlere zamanla.'],
            ['Dosya yöneticisi', 'Sunucu klasöründe gezin, ayar dosyalarını düzenle, dosya yükle ve indir.'],
            ['Oyuncular', 'Beyaz listeyi, OP\'leri ve yasakları panelden yönet; sunucu açıkken de kapalıyken de.'],
            ['vulu Packs', 'vulu Launcher\'da paylaşılan bir paketten tek tıkla sunucu kur. Paket güncellenince sunucuyu da tek tıkla güncelle.'],
            ['Çökme analizi', 'Sunucu çökerse panel kayıtları okur ve olası nedeni sade bir dille anlatır.'],
            ['Dil ve temalar', 'Türkçe ya da İngilizce arayüz, dört tema.'],
        ],
        steps: [
            'Son sürümün zip dosyasını indir ve bir klasöre çıkar.',
            'Windows\'ta baslat.bat dosyasını çalıştır. Linux ve macOS\'ta aynı klasörde bash baslat.sh komutunu kullan.',
            'İlk açılışta gerekenler kurulur ve panel tarayıcında açılır.',
        ],
        note: 'Python 3.11 ya da daha yeni bir sürüm gerekir. Güvenlik için panel ilk başta yalnızca kurulduğu bilgisayardan açılır.',
    },
    {
        slug: 'ftbquests-editor',
        name: 'FTB Quests Editor',
        short: 'Quests Editor',
        logo: 'img/ftbquests-editor.svg',
        shot: ['img/ftbquests-editor-shot.webp', 'FTB Quests Editor\'de bir görev haritası'],
        repo: 'vulu-ftbquests-editor',
        asset: /\.exe$/,
        summary: 'FTB Quests görev kitabını oyunu açmadan, masaüstünde düzenlemek için bir uygulama.',
        platforms: 'Windows · Minecraft 1.18–1.20.1',
        lead: 'FTB Quests Editor, modpack\'inin görev kitabını oyunu açmadan düzenlemeni sağlar. Görev dosyalarını doğrudan açar ve görevleri oyundaki kitapta olduğu gibi, gerçek simgeleriyle gösterir.',
        features: [
            ['Tanıdık düzenleme', 'Haritada boş bir yere sağ tıklayıp görev ekle, bir göreve tıklayıp düzenle. Görevler, ödüller ve bağımlılıklar FTB Quests\'teki gibi tek pencerede.'],
            ['Gerçek eşya simgeleri', 'Simgeler oyunun, modların ve kaynak paketlerinin dosyalarından okunur; bloklar 3D modelleriyle görünür.'],
            ['Eşya arama', 'Eşyaları adına, kimliğine ya da ait olduğu moda göre ara.'],
            ['Kodsuz biçimlendirme', 'Açıklamaları araç çubuğuyla renklendir ve biçimlendir; renk kodlarını editör yazar.'],
            ['Çeviri desteği', 'Paket dil anahtarları kullanıyorsa anahtarı değil asıl metni görür ve düzenlersin.'],
            ['Bölüm görselleri', 'Bölümlere resim ekle; sürükleyerek taşı ve boyutlandır.'],
            ['Güvenli kaydetme', 'Yalnızca değiştirdiğin dosyalar yazılır ve her kayıttan önce yedek alınır. Her adım geri alınabilir.'],
            ['Gelişmiş mod', 'Bir görevin bütün ayarlarına yan panelden ulaş; formu olmayan alanlar için SNBT\'yi doğrudan düzenle.'],
        ],
        steps: [
            'Exe dosyasını indir.',
            'Çift tıklayıp aç; kurulum gerekmez.',
        ],
        note: 'Uygulama henüz imzalı olmadığı için Windows bir SmartScreen uyarısı gösterebilir. "Ek bilgi"ye, ardından "Yine de çalıştır"a tıkla.',
    },
];

export const productBySlug = slug => PRODUCTS.find(p => p.slug === slug);
