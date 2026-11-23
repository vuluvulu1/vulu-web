// Lütuf teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'lutuf',
    ad: 'Lütuf',
    renk: {"zemin": "#070605", "kart": "linear-gradient(180deg, #3a2f25, #211a14)", "kenar": "inset 0 0 0 1px rgba(255,226,180,.16), inset 0 0 0 7px #241c15, inset 0 0 0 8px rgba(214,170,100,.35), 0 20px 44px rgba(0,0,0,.5)", "vurgu": "#d9a050", "soluk": "#b8aa9a", "etiket": "#e6c48f", "cerceve": "linear-gradient(135deg, #6e4718, #f5d18a 18%, #a8732c 34%, #ffe8b0 50%, #9a6526 66%, #f0c46e 82%, #6e4718)"},
    css: `@keyframes t-suzul{from{transform:translateY(0)}to{transform:translateY(-46px)}}
.toz-a{animation:t-suzul 24s ease-in-out infinite alternate}
.toz-b{animation:t-suzul 33s ease-in-out infinite alternate-reverse}
.ortam-isik{left:18%;width:64%;height:72%;bottom:auto;background:radial-gradient(ellipse 50% 85% at 50% 0%,rgba(255,214,150,.20),transparent 70%);will-change:opacity;animation:t-nefes 8s ease-in-out infinite alternate}
@keyframes t-nefes{from{opacity:.35}to{opacity:1}}`,
    sahne: `  <!-- ══ Tapınak sahnesi ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden">

    <!-- Arka plan: tek SVG, her oranda ortası korunur, kenarları kırpılır -->
    <img class="tema-arkaplan" src="${B}tema/lutuf.svg" alt="" aria-hidden="true" decoding="async">
    <svg class="tema-katman toz-a hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><g fill="#ffe6b8">
        <circle cx="712" cy="210" r="2" opacity=".8"></circle><circle cx="866" cy="260" r="1.6" opacity=".7"></circle>
        <circle cx="742" cy="380" r="1.4" opacity=".6"></circle><circle cx="904" cy="420" r="2.2" opacity=".7"></circle>
        <circle cx="660" cy="520" r="1.2" opacity=".5"></circle><circle cx="944" cy="560" r="1.4" opacity=".55"></circle>
        <circle cx="700" cy="640" r="1.8" opacity=".5"></circle>
      </g></svg>
    <svg class="tema-katman toz-b hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><g fill="#ffe6b8">
        <circle cx="820" cy="150" r="1.2" opacity=".9"></circle><circle cx="780" cy="300" r="1" opacity=".8"></circle>
        <circle cx="612" cy="330" r="1.6" opacity=".45"></circle><circle cx="990" cy="310" r="1.2" opacity=".45"></circle>
        <circle cx="890" cy="700" r="1.4" opacity=".5"></circle><circle cx="560" cy="760" r="1.2" opacity=".35"></circle>
        <circle cx="1040" cy="800" r="1.6" opacity=".35"></circle>
      </g></svg>

    <div class="tema-katman ortam-isik hareket" aria-hidden="true"></div>
    <div class="tema-ust" aria-hidden="true"></div>

    <!-- Ad -->
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: clamp(36px, 7vw, 88px) 16px 0">
      <h1 class="giris-ad" style="margin: 0; width: min(900px, 86%); line-height: 0">
        <img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(0 0 30px rgba(255,190,100,.5)) drop-shadow(0 3px 0 rgba(80,44,12,.65))">
      </h1>
    </div>

    <!-- Emanet -->
    <div style="position: relative; width: min(880px, 88%); margin: clamp(28px, 4.6vw, 56px) auto 0">
      <div aria-hidden="true" style="position: absolute; top: -45%; bottom: 0; left: -20%; right: -20%; overflow: hidden; pointer-events: none">
        <div style="position: absolute; left: 50%; top: 65.5%; width: 84%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, rgba(255,214,150,.34) 0%, rgba(255,190,100,.10) 42%, transparent 66%)"></div>
        <div style="position: absolute; left: 50%; top: 65.5%; width: 68.6%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: repeating-conic-gradient(from 0deg, rgba(255,230,180,.6) 0deg .45deg, transparent .45deg 3deg); -webkit-mask-image: radial-gradient(circle, transparent 66%, #000 66.5%, #000 69.5%, transparent 70%); mask-image: radial-gradient(circle, transparent 66%, #000 66.5%, #000 69.5%, transparent 70%)"></div>
        <div style="position: absolute; left: 50%; top: 65.5%; width: 64%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; box-shadow: 0 0 0 1.5px rgba(255,226,170,.38), inset 0 0 90px rgba(255,200,120,.18)"></div>
      </div>
      <div class="giris-gorsel" style="position: relative; padding: clamp(6px, .9vw, 11px); background: linear-gradient(135deg, #6e4718 0%, #f5d18a 18%, #a8732c 34%, #ffe8b0 50%, #9a6526 66%, #f0c46e 82%, #6e4718 100%); box-shadow: 0 0 0 1px rgba(40,22,6,.8), 0 0 70px rgba(255,190,100,.45), 0 50px 90px rgba(0,0,0,.7)">
        <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto; box-shadow: 0 0 0 1px rgba(40,22,6,.9)">
      </div>

      <!-- Sunak -->
      <div aria-hidden="true" style="position: relative; width: 112%; left: -6%; height: clamp(14px, 2.2vw, 30px); margin-top: clamp(18px, 3vw, 34px); background: linear-gradient(180deg, #a3845f 0%, #6a5139 45%, #3c2d20 100%); box-shadow: inset 0 1px 0 rgba(255,240,210,.5), 0 -18px 50px rgba(255,196,110,.28)"></div>
      <div aria-hidden="true" style="position: relative; width: 102%; left: -1%; height: clamp(8px, 1.2vw, 16px); background: linear-gradient(180deg, #54412f, #2a2018)"></div>
      <div style="position: relative; width: 90%; left: 5%; padding: clamp(18px, 3vw, 34px) 12px; box-sizing: border-box; display: flex; justify-content: center; background: linear-gradient(180deg, rgba(255,214,150,.16), rgba(7,6,5,.35)), repeating-linear-gradient(90deg, #2c2219 0 22px, #45362a 22px 32px, #211a14 32px 36px)">
        <a class="giris-cta" href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.5)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
      </div>
      <div aria-hidden="true" style="position: relative; width: 104%; left: -2%; height: clamp(8px, 1.2vw, 16px); background: linear-gradient(180deg, #54412f, #2a2018)"></div>
    </div>

    <!-- Basamaklar -->
    <div aria-hidden="true" style="position: relative; display: flex; flex-direction: column; align-items: center">
      <div style="width: min(1040px, 96%); height: clamp(10px, 1.5vw, 20px); background: linear-gradient(180deg, #5a4633, #2f241b); box-shadow: inset 0 1px 0 rgba(255,226,180,.18)"></div>
      <div style="width: min(1200px, 98%); height: clamp(10px, 1.5vw, 20px); background: linear-gradient(180deg, #47372a, #261d16); box-shadow: inset 0 1px 0 rgba(255,226,180,.12)"></div>
      <div style="width: min(1380px, 100%); height: clamp(10px, 1.5vw, 20px); background: linear-gradient(180deg, #382b21, #1d1611); box-shadow: inset 0 1px 0 rgba(255,226,180,.08)"></div>
    </div>

    <!-- Cilalı mermer zemin: ışık ve emanet yansır -->
    <div aria-hidden="true" style="position: relative; height: clamp(80px, 11vw, 160px); overflow: hidden; background: linear-gradient(180deg, #2b231c 0%, #161210 55%, #070605 100%)">
      <svg viewBox="0 0 1600 160" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block">
        <g stroke="#d6b383" stroke-opacity=".12" stroke-width="1" fill="none">
          <line x1="350" y1="0" x2="-1000" y2="160" vector-effect="non-scaling-stroke"></line><line x1="530" y1="0" x2="-400" y2="160" vector-effect="non-scaling-stroke"></line>
          <line x1="710" y1="0" x2="200" y2="160" vector-effect="non-scaling-stroke"></line><line x1="890" y1="0" x2="1400" y2="160" vector-effect="non-scaling-stroke"></line>
          <line x1="1070" y1="0" x2="2000" y2="160" vector-effect="non-scaling-stroke"></line><line x1="1250" y1="0" x2="2600" y2="160" vector-effect="non-scaling-stroke"></line>
          <line x1="0" y1="14" x2="1600" y2="14" vector-effect="non-scaling-stroke"></line><line x1="0" y1="38" x2="1600" y2="38" vector-effect="non-scaling-stroke"></line>
          <line x1="0" y1="72" x2="1600" y2="72" vector-effect="non-scaling-stroke"></line><line x1="0" y1="118" x2="1600" y2="118" vector-effect="non-scaling-stroke"></line>
        </g>
      </svg>
      <div style="position: absolute; left: 50%; top: 0; width: min(900px, 80%); height: 100%; transform: translateX(-50%); background: radial-gradient(ellipse 50% 100% at 50% 0%, rgba(255,210,140,.34), transparent 72%)"></div>
      <div style="position: absolute; left: 50%; top: 0; width: min(620px, 56%); height: 100%; transform: translateX(-50%); background: linear-gradient(180deg, rgba(255,226,170,.30), rgba(240,180,90,.06) 70%, transparent); clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%); filter: blur(5px)"></div>
    </div>
  </section>

  <!-- ══ Friz ══ -->
  <div aria-hidden="true" style="background: linear-gradient(180deg, #2c2219, #17120e); box-shadow: inset 0 1px 0 rgba(255,226,180,.25); padding: 8px 0">
    <div style="height: 1px; background: #b08a52; opacity: .55"></div>
    <svg width="100%" height="26" style="display: block; margin: 6px 0"><defs><pattern id="friz" width="32" height="26" patternUnits="userSpaceOnUse"><path d="M1 25 H31 V1 H8 V18 H24 V8 H15" fill="none" stroke="#c99a58" stroke-width="2"></path></pattern></defs><rect width="100%" height="26" fill="url(#friz)"></rect></svg>
    <div style="height: 1px; background: #b08a52; opacity: .55"></div>
  </div>`,
    arkaPlan: `<img class="tema-arkaplan" src="${B}tema/lutuf.svg" alt="" aria-hidden="true" decoding="async">`,
};
