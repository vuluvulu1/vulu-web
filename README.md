# vulu web

vulu Launcher'ın web sitesi: tanıtım, indirme, hesap isteği ve giriş.

Site veritabanına doğrudan bağlanmaz, launcher'la aynı [vulu-api](https://github.com/vuluvulu1/vulu-api)'yi kullanır. Bu yüzden hesaplar ortaktır. Siteden gönderilen kayıt istekleri launcher'daki Admin → Kayıt istekleri listesine düşer.

## Geliştirme

```sh
npm install
npm run dev        # http://localhost:5173
```

Yerel bir vulu-api ile denemek için `.env.example` dosyasını `.env` olarak kopyalayıp `VITE_API_URL` değerini doldur.

## Yayın

`main`'e her push'ta site GitHub Pages'e yayınlanır (`.github/workflows/pages.yml`): https://vuluvulu1.github.io/vulu-web/

Pages'te site `/vulu-web/` alt klasöründe açılır. Workflow derlemede bunu `BASE_PATH` ile verir. Kendi domain'ine geçince workflow'daki `BASE_PATH` değerini `/` yap.

Sitenin adresi vulu-api'nin `CORS_ORIGINS` ortam değişkeninde olmalı. Örnek: `https://vuluvulu1.github.io,http://localhost:5173`. Adres yalnızca origin'dir, `/vulu-web` kısmı yazılmaz. Eklenmezse sitedeki giriş ve kayıt çalışmaz. Launcher bundan etkilenmez.
