// Kitap teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'kitap',
    ad: 'Kitap',
    renk: {"zemin": "#120b06", "kart": "linear-gradient(180deg, #2a1c12, #1a1009)", "kenar": "inset 0 0 0 1px rgba(184,134,46,.35), 0 18px 40px rgba(0,0,0,.5)", "vurgu": "#d8aa5a", "soluk": "#c4b090", "etiket": "#d8aa5a", "cerceve": "linear-gradient(135deg, #e9dcc0, #b8862e 30%, #7a4a1c 60%, #e9dcc0)"},
    css: `@keyframes t-mum{0%,100%{opacity:1}40%{opacity:.82}70%{opacity:.94}}
.mum{animation:t-mum 5s ease-in-out infinite}`,
    sahne: `  <!-- ══ Kitap: mum ışığında açık bir el yazması ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden; background: repeating-linear-gradient(92deg, #1e130b 0 18px, #23160d 18px 26px, #1a1009 26px 44px), #1e130b">
    <div aria-hidden="true" class="tema-katman mum hareket" style="position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse 55% 50% at 50% 38%, rgba(255,190,110,.32), rgba(255,150,60,.08) 50%, transparent 75%)"></div>
    <div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse 100% 90% at 50% 45%, transparent 50%, rgba(5,3,2,.8))"></div>

    <div class="tema-ust" aria-hidden="true"></div>

    <!-- Açık kitap -->
    <div style="width: min(1240px, 94%); margin: clamp(28px, 5vw, 64px) auto clamp(56px, 8vw, 110px); position: relative">
      <div aria-hidden="true" style="position: absolute; left: 1%; right: 1%; bottom: -14px; height: 22px; background: linear-gradient(180deg, #5a3a1c, #2a1a0c); border-radius: 0 0 8px 8px; box-shadow: 0 24px 50px rgba(0,0,0,.7)"></div>
      <div style="position: relative; display: flex; flex-wrap: wrap; box-shadow: 0 0 0 1px rgba(60,35,15,.6), 0 30px 70px rgba(0,0,0,.6)">
        <!-- Sol sayfa -->
        <div style="position: relative; flex: 1 1 380px; min-width: 0; box-sizing: border-box; padding: clamp(36px, 5vw, 72px) clamp(24px, 4vw, 64px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(22px, 3vw, 36px); text-align: center; background: linear-gradient(90deg, #d9c39a 0%, #eadbb9 22%, #eddfbf 70%, #cdb486 94%, #a8895a 100%)">
          <svg aria-hidden="true" viewBox="0 0 60 60" style="position: absolute; width: clamp(26px, 4vw, 48px); height: auto; left: 14px; top: 14px"><path d="M4 56 V20 Q4 4 20 4 H56" fill="none" stroke="#7a4a1c" stroke-width="2"></path><path d="M12 56 V24 Q12 12 24 12 H56" fill="none" stroke="#7a4a1c" stroke-width="1"></path><circle cx="20" cy="20" r="4" fill="#b8862e"></circle></svg>
          <svg aria-hidden="true" viewBox="0 0 60 60" style="position: absolute; width: clamp(26px, 4vw, 48px); height: auto; right: 14px; bottom: 14px; transform: rotate(180deg)"><path d="M4 56 V20 Q4 4 20 4 H56" fill="none" stroke="#7a4a1c" stroke-width="2"></path><path d="M12 56 V24 Q12 12 24 12 H56" fill="none" stroke="#7a4a1c" stroke-width="1"></path><circle cx="20" cy="20" r="4" fill="#b8862e"></circle></svg>
          <h1 class="giris-ad" style="margin: 0; width: 100%; max-width: 440px; line-height: 0"><img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(0 1px 0 rgba(90,50,15,.9)) drop-shadow(0 2px 4px rgba(90,50,15,.35))"></h1>
          <svg aria-hidden="true" viewBox="0 0 240 20" style="width: min(240px, 60%); height: auto"><path d="M0 10 H96 M144 10 H240" stroke="#7a4a1c" stroke-width="1.5"></path><path d="M120 2 L130 10 L120 18 L110 10 Z" fill="#b8862e"></path><circle cx="102" cy="10" r="2.5" fill="#7a4a1c"></circle><circle cx="138" cy="10" r="2.5" fill="#7a4a1c"></circle></svg>
          <a class="giris-cta" href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.45)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
        </div>
        <!-- Sağ sayfa -->
        <div style="position: relative; flex: 1.25 1 420px; min-width: 0; box-sizing: border-box; padding: clamp(32px, 4.4vw, 64px) clamp(22px, 3.6vw, 56px); display: flex; flex-direction: column; justify-content: center; background: linear-gradient(90deg, #a8895a 0%, #cdb486 6%, #eddfbf 30%, #eadbb9 78%, #d9c39a 100%)">
          <svg aria-hidden="true" viewBox="0 0 60 60" style="position: absolute; width: clamp(26px, 4vw, 48px); height: auto; right: 14px; top: 14px; transform: scaleX(-1)"><path d="M4 56 V20 Q4 4 20 4 H56" fill="none" stroke="#7a4a1c" stroke-width="2"></path><path d="M12 56 V24 Q12 12 24 12 H56" fill="none" stroke="#7a4a1c" stroke-width="1"></path><circle cx="20" cy="20" r="4" fill="#b8862e"></circle></svg>
          <svg aria-hidden="true" viewBox="0 0 60 60" style="position: absolute; width: clamp(26px, 4vw, 48px); height: auto; left: 14px; bottom: 14px; transform: scaleY(-1)"><path d="M4 56 V20 Q4 4 20 4 H56" fill="none" stroke="#7a4a1c" stroke-width="2"></path><path d="M12 56 V24 Q12 12 24 12 H56" fill="none" stroke="#7a4a1c" stroke-width="1"></path><circle cx="20" cy="20" r="4" fill="#b8862e"></circle></svg>
          <figure style="margin: 0">
            <div class="giris-gorsel" style="padding: clamp(6px, .8vw, 10px); box-shadow: inset 0 0 0 2px #7a4a1c, inset 0 0 0 5px #eadbb9, inset 0 0 0 6px #b8862e">
              <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto; filter: sepia(.12) contrast(1.02)">
            </div>
            <figcaption style="margin-top: 12px; text-align: center; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: clamp(15px, 1.4vw, 18px); color: #5a3a1c">levha I</figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>`,
    arkaPlan: `<div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background: repeating-linear-gradient(92deg, #1e130b 0 18px, #23160d 18px 26px, #1a1009 26px 44px), #1e130b"></div>
    <div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse 55% 50% at 50% 38%, rgba(255,190,110,.32), rgba(255,150,60,.08) 50%, transparent 75%)"></div>
    <div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse 100% 90% at 50% 45%, transparent 50%, rgba(5,3,2,.8))"></div>`,
};
