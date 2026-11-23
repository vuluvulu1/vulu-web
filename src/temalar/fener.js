// Fener teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'fener',
    ad: 'Fener',
    renk: {"zemin": "#060a10", "kart": "linear-gradient(180deg, #121c2a, #0b121c)", "kenar": "inset 0 0 0 1px rgba(169,199,224,.16), inset 0 2px 0 rgba(255,214,140,.25), 0 18px 40px rgba(0,0,0,.5)", "vurgu": "#ffd58a", "soluk": "#9fb2c4", "etiket": "#ffd58a", "cerceve": "linear-gradient(110deg, #f2d9a0, #b98d4a 30%, #5a4426 65%, #2a2a30)"},
    css: `@keyframes t-yagmur{from{transform:translate3d(0,0,0)}to{transform:translate3d(-22px,90px,0)}}
.yagmur{position:absolute;inset:-90px -40px 0 0;z-index:-1;pointer-events:none;background:url("${B}tema/yagmur.svg") 0 0/36px 90px;animation:t-yagmur 1.1s linear infinite}
.ortam-lamba{will-change:opacity;animation:t-lamba 3.2s ease-in-out infinite}
@keyframes t-lamba{0%,100%{opacity:.4}45%{opacity:1}60%{opacity:.8}}`,
    sahne: `  <!-- ══ Fener: fırtınalı gece, fenerin huzmesi launcher'a düşer ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden">
    <img class="tema-arkaplan" src="${B}tema/fener.svg" alt="" aria-hidden="true" decoding="async">
    <div class="tema-katman yagmur hareket" aria-hidden="true"></div>

    <svg class="tema-katman ortam-lamba hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><defs><radialGradient id="f-lamba-k"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".55"></stop><stop offset="1" stop-color="#ffd58a" stop-opacity="0"></stop></radialGradient></defs><circle cx="212" cy="420" r="150" fill="url(#f-lamba-k)"></circle></svg>
    <div class="tema-ust" aria-hidden="true"></div>

    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: clamp(28px, 6vw, 72px) 16px 0">
      <h1 class="giris-ad" style="margin: 0; width: min(820px, 84%); line-height: 0">
        <img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(-18px 0 34px rgba(255,214,140,.35)) drop-shadow(0 2px 0 rgba(20,30,50,.8))">
      </h1>
    </div>

    <!-- Huzmenin düştüğü launcher: pirinç çerçeve, sol yanı aydınlık -->
    <div style="position: relative; width: min(820px, 82%); margin: clamp(28px, 4.6vw, 56px) auto 0">
      <div class="giris-gorsel" style="position: relative; padding: clamp(6px, .8vw, 10px); background: linear-gradient(110deg, #f2d9a0 0%, #b98d4a 30%, #5a4426 65%, #2a2a30 100%); box-shadow: 0 0 0 1px rgba(10,15,25,.9), -30px 0 80px rgba(255,214,140,.30), 0 40px 80px rgba(0,0,0,.6)">
        <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto">
        <div aria-hidden="true" style="position: absolute; inset: clamp(6px, .8vw, 10px); background: linear-gradient(100deg, rgba(255,226,170,.18), transparent 45%, rgba(10,20,40,.25)); pointer-events: none"></div>
      </div>
    </div>
    <div style="display: flex; justify-content: center; padding: clamp(28px, 4.6vw, 52px) 16px clamp(56px, 8vw, 104px)">
        <a class="giris-cta" href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.45)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
    </div>
  </section>`,
    arkaPlan: `<img class="tema-arkaplan" src="${B}tema/fener.svg" alt="" aria-hidden="true" decoding="async">`,
};
