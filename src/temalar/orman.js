// Orman teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'orman',
    ad: 'Orman',
    renk: {"zemin": "#04100a", "kart": "linear-gradient(180deg, #0f2116, #08140d)", "kenar": "inset 0 0 0 1px rgba(200,232,106,.18), inset 0 1px 0 rgba(233,255,138,.22), 0 18px 40px rgba(0,0,0,.5)", "vurgu": "#c8e86a", "soluk": "#a3b89a", "etiket": "#c8e86a", "cerceve": "linear-gradient(135deg, #6b5a2a 0%, #2a3a1a 30%, #8a7a3a 55%, #24361a 80%, #6b5a2a 100%)"},
    css: `@keyframes t-bocek{0%{transform:translate3d(0,0,0);opacity:.35}50%{opacity:1}100%{transform:translate3d(30px,-40px,0);opacity:.45}}
@keyframes t-bocek2{0%{transform:translate3d(0,0,0);opacity:1}50%{opacity:.3}100%{transform:translate3d(-36px,-24px,0);opacity:.9}}
.bocek-a{animation:t-bocek 7s ease-in-out infinite alternate}
.bocek-b{animation:t-bocek2 9s ease-in-out infinite alternate}
.orman-ic{flex-direction:row-reverse}`,
    sahne: `  <!-- ══ Orman: gece ormanı, ateşböcekleri; launcher solda, yazı sağda ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden">
    <img class="tema-arkaplan" src="${B}tema/orman.svg" alt="" aria-hidden="true" decoding="async">
    <!-- Ateşböcekleri: iki küme, ayrı ritimde -->
    <svg class="tema-katman bocek-a hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><defs><filter id="o-fly" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"></feGaussianBlur></filter></defs><g fill="#e9ff8a" opacity=".55" filter="url(#o-fly)"><circle cx="220" cy="520" r="7.800000000000001" fill="#e9ff8a"></circle><circle cx="340" cy="640" r="6.24" fill="#e9ff8a"></circle><circle cx="470" cy="450" r="7.279999999999999" fill="#e9ff8a"></circle><circle cx="1180" cy="520" r="7.800000000000001" fill="#e9ff8a"></circle><circle cx="1320" cy="610" r="5.720000000000001" fill="#e9ff8a"></circle><circle cx="1430" cy="470" r="6.760000000000001" fill="#e9ff8a"></circle><circle cx="760" cy="820" r="6.24" fill="#e9ff8a"></circle><circle cx="980" cy="760" r="7.279999999999999" fill="#e9ff8a"></circle><circle cx="600" cy="700" r="5.720000000000001" fill="#e9ff8a"></circle></g><g><circle cx="220" cy="520" r="3" fill="#f8ffd0"></circle><circle cx="340" cy="640" r="2.4" fill="#f8ffd0"></circle><circle cx="470" cy="450" r="2.8" fill="#f8ffd0"></circle><circle cx="1180" cy="520" r="3" fill="#f8ffd0"></circle><circle cx="1320" cy="610" r="2.2" fill="#f8ffd0"></circle><circle cx="1430" cy="470" r="2.6" fill="#f8ffd0"></circle><circle cx="760" cy="820" r="2.4" fill="#f8ffd0"></circle><circle cx="980" cy="760" r="2.8" fill="#f8ffd0"></circle><circle cx="600" cy="700" r="2.2" fill="#f8ffd0"></circle></g></svg>
    <svg class="tema-katman bocek-b hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><defs><filter id="o-fly2" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"></feGaussianBlur></filter></defs><g fill="#d6ff6a" opacity=".5" filter="url(#o-fly2)"><circle cx="280" cy="760" r="6.760000000000001" fill="#d6ff6a"></circle><circle cx="420" cy="560" r="5.2" fill="#d6ff6a"></circle><circle cx="1100" cy="700" r="6.24" fill="#d6ff6a"></circle><circle cx="1250" cy="420" r="5.720000000000001" fill="#d6ff6a"></circle><circle cx="1500" cy="700" r="7.279999999999999" fill="#d6ff6a"></circle><circle cx="860" cy="620" r="5.2" fill="#d6ff6a"></circle><circle cx="680" cy="520" r="6.24" fill="#d6ff6a"></circle><circle cx="150" cy="620" r="5.720000000000001" fill="#d6ff6a"></circle></g><g><circle cx="280" cy="760" r="2.6" fill="#f2ffc4"></circle><circle cx="420" cy="560" r="2" fill="#f2ffc4"></circle><circle cx="1100" cy="700" r="2.4" fill="#f2ffc4"></circle><circle cx="1250" cy="420" r="2.2" fill="#f2ffc4"></circle><circle cx="1500" cy="700" r="2.8" fill="#f2ffc4"></circle><circle cx="860" cy="620" r="2" fill="#f2ffc4"></circle><circle cx="680" cy="520" r="2.4" fill="#f2ffc4"></circle><circle cx="150" cy="620" r="2.2" fill="#f2ffc4"></circle></g></svg>

    <div class="tema-ust" aria-hidden="true"></div>

    <div class="orman-ic" style="max-width: 1320px; margin: 0 auto; box-sizing: border-box; padding: clamp(32px, 6vw, 80px) clamp(16px, 4vw, 40px) clamp(72px, 10vw, 140px); display: flex; flex-wrap: wrap; align-items: center; gap: clamp(36px, 5vw, 72px)">
      <div style="flex: 1 1 320px; min-width: 0; max-width: 460px; display: flex; flex-direction: column; gap: clamp(24px, 3vw, 36px)">
        <h1 class="giris-ad" style="margin: 0; width: 100%; line-height: 0"><img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(0 0 26px rgba(200,232,106,.35)) drop-shadow(0 2px 0 rgba(5,20,10,.8))"></h1>
        <div><a class="giris-cta" href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.45)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a></div>
      </div>
      <div style="flex: 1.5 1 480px; min-width: 0">
        <div class="giris-gorsel" style="position: relative; padding: clamp(6px, .8vw, 10px); background: linear-gradient(135deg, #6b5a2a 0%, #2a3a1a 30%, #8a7a3a 55%, #24361a 80%, #6b5a2a 100%); box-shadow: 0 0 0 1px rgba(0,0,0,.8), 0 0 70px rgba(200,232,106,.22), 0 40px 80px rgba(0,0,0,.6)">
          <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto">
        </div>
      </div>
    </div>
  </section>`,
    arkaPlan: `<img class="tema-arkaplan" src="${B}tema/orman.svg" alt="" aria-hidden="true" decoding="async">`,
};
