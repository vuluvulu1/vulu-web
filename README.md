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

`npm run build` komutu `dist/` klasörünü üretir. Bu klasör statik olarak herhangi bir yerde yayınlanabilir (`vercel.json` dosyası Vercel için yönlendirmeleri içerir).

Site yayına girince adresi vulu-api'nin `CORS_ORIGINS` ortam değişkenine eklenmeli. Örnek: `https://vulu.vercel.app,http://localhost:5173`. Eklenmezse sitedeki giriş ve kayıt çalışmaz. Launcher bundan etkilenmez.
