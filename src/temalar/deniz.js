// Deniz teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'deniz',
    ad: 'Deniz',
    renk: {"zemin": "#03121c", "kart": "linear-gradient(180deg, #0a2533, #06161f)", "kenar": "inset 0 0 0 1px rgba(127,224,224,.18), inset 0 1px 0 rgba(191,246,255,.22), 0 18px 40px rgba(0,0,0,.5)", "vurgu": "#7fe0e0", "soluk": "#94b3bf", "etiket": "#7fe0e0", "cerceve": "linear-gradient(135deg, #e7d39a 0%, #5a8a7a 30%, #d9c38a 55%, #3a6a6a 80%, #e7d39a 100%)"},
    css: `@keyframes t-kabarcik{from{transform:translate3d(0,0,0)}to{transform:translate3d(20px,-280px,0)}}
.kabarcik{position:absolute;inset:0 -40px -280px 0;width:auto;height:auto;background:url("${B}tema/kabarcik.svg") 0 0/200px 280px;animation:t-kabarcik 16s linear infinite}
.ortam-ust{background:linear-gradient(180deg,rgba(3,18,28,.72),rgba(3,18,28,0) 200px);will-change:auto}
.tema-kahraman::before,.tema-kutu::before{content:"";position:absolute;left:0;right:0;top:0;height:200px;z-index:-1;pointer-events:none;background:linear-gradient(180deg,rgba(3,18,28,.72),rgba(3,18,28,0))}`,
    sahne: `  <!-- ══ Deniz: su altında batık tapınak; launcher üstte, logo altında ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden">
    <img class="tema-arkaplan" src="${B}tema/deniz.svg" alt="" aria-hidden="true" decoding="async">
    <div class="tema-katman kabarcik hareket" aria-hidden="true"></div>

    <div class="tema-katman ortam-ust" aria-hidden="true"></div>
    <div class="tema-ust" aria-hidden="true"></div>

    <div style="position: relative; width: min(900px, 86%); margin: clamp(28px, 5vw, 64px) auto 0">
      <div class="giris-gorsel" style="position: relative; padding: clamp(6px, .8vw, 10px); background: linear-gradient(135deg, #e7d39a 0%, #5a8a7a 30%, #d9c38a 55%, #3a6a6a 80%, #e7d39a 100%); box-shadow: 0 0 0 1px rgba(0,10,20,.8), 0 0 80px rgba(127,224,224,.3), 0 40px 80px rgba(0,0,0,.6)">
        <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto">
      </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: clamp(22px, 3vw, 32px); text-align: center; padding: clamp(28px, 4vw, 48px) 16px clamp(80px, 11vw, 150px)">
      <h1 class="giris-ad" style="margin: 0; width: min(680px, 80%); line-height: 0"><img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(0 0 26px rgba(127,224,224,.4)) drop-shadow(0 2px 0 rgba(3,18,28,.8))"></h1>
      <a class="giris-cta" href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.45)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
    </div>
  </section>`,
    arkaPlan: `<img class="tema-arkaplan" src="${B}tema/deniz.svg" alt="" aria-hidden="true" decoding="async">`,
};
