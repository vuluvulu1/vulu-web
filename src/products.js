// vulu'nun üç ürünü. Ana sayfadaki kartlar ve ürün sayfaları bu listeden üretilir.
// Yazım: okura "sen" diye, sıcak ve sakin bir dille; ürünü yapanlar kendinden "biz" diye söz eder. Abartılı vaat yoktur.
// Özellikler yalnızca ürünlerin kendi README'lerinde yazanlardır.

export const PRODUCTS = [
    {
        slug: 'launcher',
        name: 'vulu Launcher',
        short: 'Launcher',
        logo: 'img/logo.svg',
        summary: 'Minecraft\'ı modlu ya da modsuz oynaman için. Instance\'ların, paketlerin, sunucuların ve arkadaşların aynı pencerede seni bekler.',
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
        summary: 'Kendi Minecraft sunucunu bilgisayarında kur, tarayıcından rahatça yönet.',
        platforms: 'Windows, Linux ve macOS',
        lead: 'vulu Server Panel, Minecraft sunucunu kendi bilgisayarında çalıştırır ve onu tarayıcından yönetmeni sağlar. Java\'yı, sunucu dosyalarını ve mod yükleyiciyi senin yerine indirip kurar; sen yalnızca sürümü ve ayarları seçersin.',
        features: [
            ['Sunucu yönetimi', 'Sunucularını panelden oluştur, başlat, durdur. Konsolu canlı izler, komutlarını da oradan gönderirsin.'],
            ['Otomatik kurulum', 'Paper, Fabric, Forge ya da NeoForge\'u seçmen yeterli. Gereken Java\'yı ve sunucu dosyalarını panel kendisi indirir.'],
            ['Modlar ve modpack\'ler', 'Modrinth\'te beğendiğin modları bağımlılıklarıyla birlikte kur ya da bir modpack dosyasından doğrudan sunucu aç.'],
            ['İzleme', 'İşlemci ve bellek kullanımını, oyuncuları ve TPS\'i canlı grafiklerden takip et.'],
            ['Yedekleme ve zamanlama', 'İstersen yalnızca dünyanın, istersen bütün sunucunun yedeğini al. Yeniden başlatmaları ve yedekleri dilediğin saate kur.'],
            ['Dosya yöneticisi', 'Sunucu klasöründe gezin, ayar dosyalarını düzenle, dosya yükle ve indir.'],
            ['Oyuncular', 'Beyaz listeyi, OP\'leri ve yasakları panelden yönet; sunucu açık da olsa kapalı da olsa çalışır.'],
            ['vulu Packs', 'vulu Launcher\'da paylaşılan bir paketten tek tıkla sunucu kur. Paket güncellendiğinde sunucunu da tek tıkla güncellersin.'],
            ['Çökme analizi', 'Sunucu çökerse panel kayıtları okur ve sorunun nereden kaynaklanabileceğini sade bir dille anlatır.'],
            ['Dil ve temalar', 'Arayüzü Türkçe ya da İngilizce kullan; dört tema arasından sana en uygun olanı seç.'],
        ],
        steps: [
            'Son sürümün zip dosyasını indir ve bir klasöre çıkar.',
            'Windows\'ta baslat.bat dosyasına çift tıkla. Linux ya da macOS\'ta aynı klasörde bash baslat.sh komutunu çalıştır.',
            'İlk açılışta gereken her şey kurulur ve panel tarayıcında kendiliğinden açılır.',
        ],
        note: 'Bilgisayarında Python 3.11 ya da daha yeni bir sürüm kurulu olmalı. Güvenliğin için panel ilk başta yalnızca kurulduğu bilgisayardan açılır.',
    },
    {
        slug: 'ftbquests-editor',
        name: 'FTB Quests Editor',
        short: 'Quests Editor',
        logo: 'img/ftbquests-editor.svg',
        shot: ['img/ftbquests-editor-shot.webp', 'FTB Quests Editor\'de bir görev haritası'],
        repo: 'vulu-ftbquests-editor',
        asset: /\.exe$/,
        summary: 'Modpack\'inin görev kitabını oyunu açmadan, masaüstünde rahatça düzenle.',
        platforms: 'Windows · Minecraft 1.18–1.20.1',
        lead: 'FTB Quests Editor, modpack\'inin görev kitabını oyunu açmadan düzenlemeni sağlar. Görev dosyalarını doğrudan açar ve her şeyi oyundaki kitapta göründüğü gibi, gerçek simgeleriyle gösterir.',
        features: [
            ['Tanıdık düzenleme', 'Haritada boş bir yere sağ tıklayıp görev ekle, bir göreve tıklayıp düzenle. Görevler, ödüller ve bağımlılıklar FTB Quests\'teki gibi aynı pencerede durur.'],
            ['Gerçek eşya simgeleri', 'Simgeler oyunun, modların ve kaynak paketlerinin kendi dosyalarından okunur; bloklar 3D modelleriyle görünür.'],
            ['Eşya arama', 'Bir eşyayı adıyla, kimliğiyle ya da ait olduğu modla bul.'],
            ['Kodsuz biçimlendirme', 'Açıklamaları araç çubuğundan renklendir ve biçimlendir; renk kodlarını editör senin yerine yazar.'],
            ['Çeviri desteği', 'Paket dil anahtarları kullanıyorsa anahtarlarla uğraşmazsın; asıl metni görür ve onu düzenlersin.'],
            ['Bölüm görselleri', 'Bölümlere resim ekle, resimleri sürükleyerek taşı ve boyutlandır.'],
            ['Güvenli kaydetme', 'Editör yalnızca değiştirdiğin dosyalara dokunur ve her kayıttan önce yedek alır. Attığın her adımı geri alabilirsin.'],
            ['Gelişmiş mod', 'Bir görevin bütün ayarlarına yan panelden ulaş; formu olmayan alanlar için SNBT\'yi doğrudan düzenle.'],
        ],
        steps: [
            'Exe dosyasını indir.',
            'Çift tıklayıp aç; kurulum gerekmez.',
        ],
        note: 'Uygulama henüz imzalı olmadığı için Windows bir SmartScreen uyarısı gösterebilir. "Ek bilgi"ye, ardından "Yine de çalıştır"a tıklaman yeterli.',
    },
];

export const productBySlug = slug => PRODUCTS.find(p => p.slug === slug);
