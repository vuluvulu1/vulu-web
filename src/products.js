// vulu'nun üç ürünü. Ana sayfadaki kartlar ve ürün sayfaları bu listeden üretilir.
// Okura "sen" diye, etken ve doğal cümlelerle hitap edilir; abartılı vaat yoktur.
// Özellikler yalnızca ürünlerin kendi README'lerinde yazanlardır.

export const PRODUCTS = [
    {
        slug: 'launcher',
        name: 'vulu Launcher',
        logo: 'img/logo.svg',
        summary: 'Minecraft\'ı modlu ya da modsuz oynamak için bir launcher. Instance\'larını, paketlerini, sunucularını ve arkadaşlarınla sohbetini tek yerde toplar.',
        platforms: 'Windows',
    },
    {
        slug: 'server-panel',
        name: 'vulu Server Panel',
        logo: 'img/server-panel.svg',
        shot: ['img/server-panel-shot.webp', 'vulu Server Panel\'de çalışan bir sunucunun sayfası'],
        repo: 'vulu-server-panel',
        asset: /^vulu-panel-.*\.zip$/,
        summary: 'Minecraft sunucunu kendi bilgisayarında kurup tarayıcıdan yönetmeni sağlayan bir panel.',
        platforms: 'Windows, Linux ve macOS',
        lead: 'vulu Server Panel, Minecraft sunucunu kendi bilgisayarında çalıştırır ve onu tarayıcıdan yönetmeni sağlar. Java\'yı, sunucu dosyalarını ve mod yükleyiciyi senin yerine indirip kurar; sana sürümü ve ayarları seçmek kalır.',
        features: [
            ['Sunucu yönetimi', 'Sunucularını panelden oluştur, başlat ve durdur. Konsolu canlı izler, komutlarını da oradan gönderirsin.'],
            ['Otomatik kurulum', 'Paper, Fabric, Forge ya da NeoForge\'u seçmen yeterli; gereken Java\'yı ve sunucu dosyalarını panel kendisi indirir.'],
            ['Modlar ve modpack\'ler', 'Modrinth\'te bulduğun modları bağımlılıklarıyla birlikte kur, bir modpack dosyasından doğrudan sunucu aç.'],
            ['İzleme', 'İşlemci ve bellek kullanımını, oyuncuları ve TPS\'i canlı grafiklerde takip et.'],
            ['Yedekleme ve zamanlama', 'Yalnızca dünyanın ya da bütün sunucunun yedeğini al. Yeniden başlatmaları ve yedekleri istediğin saatlere kur.'],
            ['Dosya yöneticisi', 'Sunucu klasöründe gezin, ayar dosyalarını düzenle, dosya yükle ve indir.'],
            ['Oyuncular', 'Beyaz listeyi, OP\'leri ve yasakları panelden yönet; sunucu açıkken de kapalıyken de çalışır.'],
            ['vulu Packs', 'vulu Launcher\'da paylaşılan bir paketten tek tıkla sunucu kur. Paket güncellenince sunucunu da tek tıkla güncellersin.'],
            ['Çökme analizi', 'Sunucu çökerse panel kayıtları okur ve sorunun ne olabileceğini sade bir dille anlatır.'],
            ['Dil ve temalar', 'Arayüzü Türkçe ya da İngilizce kullan, dört tema arasından sana uyanı seç.'],
        ],
        steps: [
            'Son sürümün zip dosyasını indir ve bir klasöre çıkar.',
            'Windows\'ta baslat.bat dosyasına çift tıkla; Linux ya da macOS\'ta klasörde bash baslat.sh komutunu çalıştır.',
            'İlk açılışta gereken her şey kurulur, ardından panel tarayıcında açılır.',
        ],
        note: 'Bilgisayarında Python 3.11 ya da daha yenisi olmalı. Güvenlik için panel ilk başta yalnızca kurulduğu bilgisayardan açılır.',
    },
    {
        slug: 'ftbquests-editor',
        name: 'FTB Quests Editor',
        logo: 'img/ftbquests-editor.svg',
        shot: ['img/ftbquests-editor-shot.webp', 'FTB Quests Editor\'de bir görev haritası'],
        repo: 'vulu-ftbquests-editor',
        asset: /\.exe$/,
        summary: 'Modpack\'inin FTB Quests görev kitabını oyunu açmadan, masaüstünde düzenlemen için bir uygulama.',
        platforms: 'Windows · Minecraft 1.18–1.20.1',
        lead: 'FTB Quests Editor, modpack\'inin görev kitabını oyunu açmadan düzenlemeni sağlar. Görev dosyalarını doğrudan açar ve onları oyundaki kitapta göründükleri gibi, gerçek simgeleriyle gösterir.',
        features: [
            ['Tanıdık düzenleme', 'Haritada boş bir yere sağ tıklayarak görev ekle, bir göreve tıklayarak düzenle. Görevler, ödüller ve bağımlılıklar FTB Quests\'teki gibi aynı pencerededir.'],
            ['Gerçek eşya simgeleri', 'Simgeler oyunun, modların ve kaynak paketlerinin kendi dosyalarından okunur; bloklar 3D modelleriyle görünür.'],
            ['Eşya arama', 'Bir eşyayı adıyla, kimliğiyle ya da ait olduğu modla ara.'],
            ['Kodsuz biçimlendirme', 'Açıklamaları araç çubuğuyla renklendir ve biçimlendir; renk kodlarını editör senin yerine yazar.'],
            ['Çeviri desteği', 'Paket dil anahtarları kullanıyorsa anahtarları değil asıl metni görür ve onu düzenlersin.'],
            ['Bölüm görselleri', 'Bölümlere resim ekle, resimleri sürükleyerek taşı ve boyutlandır.'],
            ['Güvenli kaydetme', 'Editör yalnızca değiştirdiğin dosyalara dokunur ve her kayıttan önce yedek alır. Yaptığın her adımı geri alabilirsin.'],
            ['Gelişmiş mod', 'Bir görevin bütün ayarlarına yan panelden ulaş; formu olmayan alanlar için SNBT\'yi doğrudan düzenle.'],
        ],
        steps: [
            'Exe dosyasını indir.',
            'Çift tıklayıp aç; kurmana gerek yok.',
        ],
        note: 'Uygulama henüz imzalı olmadığı için Windows bir SmartScreen uyarısı gösterebilir. Ek bilgi\'ye, ardından Yine de çalıştır\'a tıklaman yeterli.',
    },
];

export const productBySlug = slug => PRODUCTS.find(p => p.slug === slug);
