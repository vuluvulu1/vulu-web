// Kutup teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'kutup',
    ad: 'Kutup',
    renk: {"zemin": "#04101a", "kart": "linear-gradient(180deg, #0f2433, #081620)", "kenar": "inset 0 0 0 1px rgba(160,220,255,.18), inset 0 1px 0 rgba(127,255,212,.25), 0 18px 40px rgba(0,0,0,.5)", "vurgu": "#9fe3ff", "soluk": "#9fb8c8", "etiket": "#7fffd4", "cerceve": "linear-gradient(135deg, #f2fbff 0%, #9fd3ee 25%, #3d7aa0 50%, #c8ecff 75%, #5a92b6 100%)"},
    css: `@keyframes t-aurora{from{transform:translate3d(-50px,0,0)}to{transform:translate3d(60px,-14px,0)}}
.aurora{top:0;bottom:auto;height:58%;left:-120px;width:calc(100% + 240px);object-position:50% 0;animation:t-aurora 20s ease-in-out infinite alternate;transform-origin:50% 0}
@keyframes t-kar{from{transform:translate3d(0,0,0)}to{transform:translate3d(-30px,220px,0)}}
.kar{position:absolute;inset:-220px -40px 0 0;width:auto;height:auto;background:url("${B}tema/kar.svg") 0 0/200px 220px;animation:t-kar 14s linear infinite}`,
    sahne: `  <!-- ══ Kutup: karlı dağlar, kuzey ışıkları ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden">
    <img class="tema-arkaplan" src="${B}tema/kutup.svg" alt="" aria-hidden="true" decoding="async">
    <img class="tema-katman aurora hareket" src="${B}tema/kutup-aurora.svg" alt="" aria-hidden="true" decoding="async">
    <div class="tema-katman kar hareket" aria-hidden="true"></div>

    <div class="tema-ust" aria-hidden="true"></div>

    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: clamp(28px, 6vw, 72px) 16px 0">
      <h1 class="giris-ad" style="margin: 0; width: min(820px, 84%); line-height: 0"><img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(0 0 28px rgba(127,255,212,.35)) drop-shadow(0 2px 0 rgba(10,30,45,.8))"></h1>
    </div>
    <div style="position: relative; width: min(860px, 84%); margin: clamp(28px, 4.6vw, 56px) auto 0">
      <div class="giris-gorsel" style="position: relative; padding: clamp(6px, .8vw, 10px); background: linear-gradient(135deg, #f2fbff 0%, #9fd3ee 25%, #3d7aa0 50%, #c8ecff 75%, #5a92b6 100%); box-shadow: 0 0 0 1px rgba(5,20,30,.8), 0 0 70px rgba(127,232,255,.35), 0 40px 80px rgba(0,0,0,.6)">
        <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto">
      </div>
    </div>
    <div style="display: flex; justify-content: center; padding: clamp(32px, 5vw, 56px) 16px clamp(80px, 11vw, 150px)">
        <a class="giris-cta" href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.45)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
    </div>
  </section>`,
    arkaPlan: `<img class="tema-arkaplan" src="${B}tema/kutup.svg" alt="" aria-hidden="true" decoding="async">`,
};
