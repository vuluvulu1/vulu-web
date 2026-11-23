// Gözlemevi teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'gozlemevi',
    ad: 'Gözlemevi',
    renk: {"zemin": "#050409", "kart": "linear-gradient(180deg, #16122a, #0c0a18)", "kenar": "inset 0 0 0 1px rgba(201,166,255,.18), inset 0 1px 0 rgba(255,217,160,.25), 0 18px 40px rgba(0,0,0,.5)", "vurgu": "#ffd9a0", "soluk": "#b3a8c9", "etiket": "#c9a6ff", "cerceve": "linear-gradient(135deg, #f2cd85, #8a5a22 40%, #c9a6ff)"},
    css: `@keyframes t-suz{from{transform:translateY(0)}to{transform:translateY(-30px)}}
.yildiz-b{animation:t-suz 40s ease-in-out infinite alternate}
.ortam-kayan{opacity:0;animation:t-kayan 13s ease-in 3s infinite}
@keyframes t-kayan{0%{transform:translate3d(0,0,0);opacity:0}2%{opacity:1}7%{transform:translate3d(-420px,140px,0);opacity:0}100%{transform:translate3d(-420px,140px,0);opacity:0}}`,
    sahne: `  <!-- ══ Gözlemevi: yıldızlı gök, gezegen ufku, yörüngede launcher ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden">
    <img class="tema-arkaplan" src="${B}tema/gozlemevi.svg" alt="" aria-hidden="true" decoding="async">
    <svg class="tema-katman yildiz-b hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><defs><pattern id="g-stars2k" width="370" height="370" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="70" r="1.6" fill="#fff"></circle><circle cx="260" cy="40" r="1.3" fill="#ffe2b0"></circle><circle cx="320" cy="250" r="1.7" fill="#dfe6ff"></circle>
          <circle cx="140" cy="300" r="1.4" fill="#fff"></circle><circle cx="200" cy="180" r="1.1" fill="#ffe2b0"></circle>
        </pattern></defs><g><rect y="-40" width="1600" height="1240" fill="url(#g-stars2k)"></rect></g></svg>

    <svg class="tema-katman ortam-kayan hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="g-kayan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"></stop><stop offset="1" stop-color="#fff6e0" stop-opacity=".9"></stop></linearGradient></defs><line x1="1180" y1="90" x2="1330" y2="40" stroke="url(#g-kayan)" stroke-width="2.4" stroke-linecap="round"></line></svg>
    <div class="tema-ust" aria-hidden="true"></div>

    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: clamp(28px, 6vw, 72px) 16px 0">
      <h1 class="giris-ad" style="margin: 0; width: min(820px, 84%); line-height: 0">
        <img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(0 0 26px rgba(201,166,255,.35)) drop-shadow(0 0 2px rgba(255,236,200,.6))">
      </h1>
    </div>

    <!-- Yörüngedeki launcher -->
    <div style="position: relative; width: min(800px, 80%); margin: clamp(40px, 6vw, 72px) auto 0">
      <div aria-hidden="true" style="position: absolute; left: 50%; top: 50%; width: 132%; height: 74%; transform: translate(-50%, -50%) rotate(-9deg); border-radius: 50%; box-shadow: 0 0 0 1.4px rgba(255,217,160,.42); pointer-events: none"></div>
      <div aria-hidden="true" style="position: absolute; left: 50%; top: 50%; width: 118%; height: 92%; transform: translate(-50%, -50%) rotate(14deg); border-radius: 50%; box-shadow: 0 0 0 1px rgba(201,166,255,.32); pointer-events: none"></div>
      <div aria-hidden="true" style="position: absolute; left: -12%; top: 22%; width: clamp(8px, 1.2vw, 14px); aspect-ratio: 1; border-radius: 50%; background: #ffd9a0; box-shadow: 0 0 14px 4px rgba(255,200,120,.6)"></div>
      <div aria-hidden="true" style="position: absolute; right: -6%; bottom: -4%; width: clamp(6px, .9vw, 10px); aspect-ratio: 1; border-radius: 50%; background: #c9a6ff; box-shadow: 0 0 12px 4px rgba(201,166,255,.5)"></div>
      <div class="giris-gorsel" style="position: relative; padding: clamp(5px, .7vw, 8px); background: linear-gradient(135deg, #f2cd85, #8a5a22 40%, #c9a6ff 100%); box-shadow: 0 0 0 1px rgba(10,8,20,.9), 0 0 80px rgba(201,166,255,.25), 0 0 40px rgba(255,190,110,.25), 0 40px 80px rgba(0,0,0,.6)">
        <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto">
      </div>
    </div>
    <div style="display: flex; justify-content: center; padding: clamp(40px, 6vw, 72px) 16px clamp(72px, 10vw, 140px)">
        <a class="giris-cta" href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.45)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
    </div>
  </section>`,
    arkaPlan: `<img class="tema-arkaplan" src="${B}tema/gozlemevi.svg" alt="" aria-hidden="true" decoding="async">`,
};
