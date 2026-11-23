// Derinlik teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'derinlik',
    ad: 'Derinlik',
    renk: {"zemin": "#070809", "kart": "linear-gradient(180deg, #1a1b1e, #101113)", "kenar": "inset 0 0 0 1px rgba(143,227,239,.12), inset 0 -2px 0 rgba(255,138,58,.35), 0 18px 40px rgba(0,0,0,.5)", "vurgu": "#8fe3ef", "soluk": "#a8b4b8", "etiket": "#8fe3ef", "cerceve": "linear-gradient(160deg, #3a3532, #1d1a18 45%, #4a2a18)"},
    css: `@keyframes t-yuksel{from{transform:translateY(0)}to{transform:translateY(-90px)}}
.kor-a{animation:t-yuksel 18s ease-in-out infinite alternate}
.kor-b{animation:t-yuksel 26s ease-in-out infinite alternate-reverse}`,
    sahne: `  <!-- ══ Derinlik: yeraltı mağarası, ışık aşağıdaki lavdan ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden">
    <img class="tema-arkaplan" src="${B}tema/derinlik.svg" alt="" aria-hidden="true" decoding="async">
    <svg class="tema-katman kor-a hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><g fill="#ffb46a">
        <rect x="620" y="980" width="3" height="3"></rect><rect x="700" y="900" width="2" height="2"></rect><rect x="880" y="950" width="3" height="3"></rect>
        <rect x="960" y="860" width="2" height="2"></rect><rect x="540" y="820" width="2" height="2"></rect><rect x="1060" y="780" width="3" height="3"></rect>
      </g></svg>
    <svg class="tema-katman kor-b hareket" aria-hidden="true" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice"><g fill="#ff8a3a">
        <rect x="760" y="1000" width="2" height="2"></rect><rect x="820" y="880" width="3" height="3"></rect><rect x="660" y="760" width="2" height="2"></rect>
        <rect x="1010" y="960" width="2" height="2"></rect><rect x="480" y="940" width="3" height="3"></rect><rect x="1120" y="900" width="2" height="2"></rect>
      </g></svg>

    <div class="tema-ust" aria-hidden="true"></div>

    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: clamp(28px, 6vw, 72px) 16px 0">
      <h1 style="margin: 0; width: min(820px, 84%); line-height: 0">
        <img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(0 14px 30px rgba(255,90,20,.55)) drop-shadow(0 2px 0 rgba(60,20,5,.8))">
      </h1>
    </div>

    <!-- Bazalt sütunların tepesinde launcher -->
    <div style="position: relative; width: min(840px, 84%); margin: clamp(28px, 4.6vw, 56px) auto 0">
      <div style="position: relative; padding: clamp(6px, .8vw, 10px); background: linear-gradient(160deg, #3a3532 0%, #1d1a18 45%, #4a2a18 100%); box-shadow: 0 0 0 1px rgba(0,0,0,.8), inset 0 -2px 0 rgba(255,140,60,.6), 0 30px 60px rgba(0,0,0,.6), 0 40px 90px rgba(255,90,20,.35)">
        <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto">
      </div>
      <!-- Altıgen bazalt sütunlar; düğme önlerinde -->
      <div style="position: relative; width: 116%; margin-left: -8%">
        <svg aria-hidden="true" viewBox="80 30 780 300" style="display: block; width: 100%; height: auto"><defs><linearGradient id="b-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2724"></stop><stop offset=".6" stop-color="#171413"></stop><stop offset=".9" stop-color="#5a2410"></stop><stop offset="1" stop-color="#b8461a"></stop></linearGradient><linearGradient id="b-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1917"></stop><stop offset=".6" stop-color="#0e0c0b"></stop><stop offset=".9" stop-color="#4a1d0c"></stop><stop offset="1" stop-color="#9a3a14"></stop></linearGradient><linearGradient id="b-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121010"></stop><stop offset=".6" stop-color="#090808"></stop><stop offset=".9" stop-color="#3a1608"></stop><stop offset="1" stop-color="#7a2e10"></stop></linearGradient><linearGradient id="b-t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4440"></stop><stop offset="1" stop-color="#2a2624"></stop></linearGradient></defs><polygon points="266.0,70 298.0,82 298.0,330 266.0,330" fill="url(#b-l)"></polygon><polygon points="298.0,82 362.0,82 362.0,330 298.0,330" fill="url(#b-f)"></polygon><polygon points="362.0,82 394.0,70 394.0,330 362.0,330" fill="url(#b-r)"></polygon><polygon points="266.0,70 298.0,58 362.0,58 394.0,70 362.0,82 298.0,82" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon><polygon points="402.0,46 436.0,58 436.0,330 402.0,330" fill="url(#b-l)"></polygon><polygon points="436.0,58 504.0,58 504.0,330 436.0,330" fill="url(#b-f)"></polygon><polygon points="504.0,58 538.0,46 538.0,330 504.0,330" fill="url(#b-r)"></polygon><polygon points="402.0,46 436.0,34 504.0,34 538.0,46 504.0,58 436.0,58" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon><polygon points="546.0,64 578.0,76 578.0,330 546.0,330" fill="url(#b-l)"></polygon><polygon points="578.0,76 642.0,76 642.0,330 578.0,330" fill="url(#b-f)"></polygon><polygon points="642.0,76 674.0,64 674.0,330 642.0,330" fill="url(#b-r)"></polygon><polygon points="546.0,64 578.0,52 642.0,52 674.0,64 642.0,76 578.0,76" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon><polygon points="338.0,118 369.0,130 369.0,330 338.0,330" fill="url(#b-l)"></polygon><polygon points="369.0,130 431.0,130 431.0,330 369.0,330" fill="url(#b-f)"></polygon><polygon points="431.0,130 462.0,118 462.0,330 431.0,330" fill="url(#b-r)"></polygon><polygon points="338.0,118 369.0,106 431.0,106 462.0,118 431.0,130 369.0,130" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon><polygon points="475.0,104 507.5,116 507.5,330 475.0,330" fill="url(#b-l)"></polygon><polygon points="507.5,116 572.5,116 572.5,330 507.5,330" fill="url(#b-f)"></polygon><polygon points="572.5,116 605.0,104 605.0,330 572.5,330" fill="url(#b-r)"></polygon><polygon points="475.0,104 507.5,92 572.5,92 605.0,104 572.5,116 507.5,116" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon><polygon points="191.0,130 220.5,142 220.5,330 191.0,330" fill="url(#b-l)"></polygon><polygon points="220.5,142 279.5,142 279.5,330 220.5,330" fill="url(#b-f)"></polygon><polygon points="279.5,142 309.0,130 309.0,330 279.5,330" fill="url(#b-r)"></polygon><polygon points="191.0,130 220.5,118 279.5,118 309.0,130 279.5,142 220.5,142" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon><polygon points="631.0,126 660.5,138 660.5,330 631.0,330" fill="url(#b-l)"></polygon><polygon points="660.5,138 719.5,138 719.5,330 660.5,330" fill="url(#b-f)"></polygon><polygon points="719.5,138 749.0,126 749.0,330 719.5,330" fill="url(#b-r)"></polygon><polygon points="631.0,126 660.5,114 719.5,114 749.0,126 719.5,138 660.5,138" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon><polygon points="118.0,170 144.0,182 144.0,330 118.0,330" fill="url(#b-l)"></polygon><polygon points="144.0,182 196.0,182 196.0,330 144.0,330" fill="url(#b-f)"></polygon><polygon points="196.0,182 222.0,170 222.0,330 196.0,330" fill="url(#b-r)"></polygon><polygon points="118.0,170 144.0,158 196.0,158 222.0,170 196.0,182 144.0,182" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon><polygon points="718.0,168 744.0,180 744.0,330 718.0,330" fill="url(#b-l)"></polygon><polygon points="744.0,180 796.0,180 796.0,330 744.0,330" fill="url(#b-f)"></polygon><polygon points="796.0,180 822.0,168 822.0,330 796.0,330" fill="url(#b-r)"></polygon><polygon points="718.0,168 744.0,156 796.0,156 822.0,168 796.0,180 744.0,180" fill="url(#b-t)" stroke="#5a524c" stroke-opacity=".5" stroke-width="1"></polygon></svg>
        <div style="position: absolute; left: 0; right: 0; top: 58%; display: flex; justify-content: center; transform: translateY(-50%)">
          <a href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.45)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
        </div>
      </div>
    </div>
    <!-- Lav nehri -->
    <div aria-hidden="true" style="position: relative; height: clamp(70px, 9vw, 130px); margin-top: -2px">
      <svg viewBox="0 0 1600 130" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block">
        <defs>
          <linearGradient id="d-river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a0"></stop><stop offset=".25" stop-color="#ffa53a"></stop><stop offset=".7" stop-color="#d6440f"></stop><stop offset="1" stop-color="#3a0e04"></stop></linearGradient>
          <filter id="d-rblur" x="-10%" y="-100%" width="120%" height="300%"><feGaussianBlur stdDeviation="10"></feGaussianBlur></filter>
        </defs>
        <path d="M0 40 Q200 22 400 38 T800 34 T1200 40 T1600 30 L1600 130 L0 130 Z" fill="url(#d-river)"></path>
        <path d="M0 40 Q200 22 400 38 T800 34 T1200 40 T1600 30" fill="none" stroke="#fff0b8" stroke-width="8" filter="url(#d-rblur)"></path>
        <g fill="none" stroke="#fff2c0" stroke-opacity=".35" stroke-width="2"><path d="M120 70 Q300 60 480 72"></path><path d="M760 66 Q920 58 1080 68"></path><path d="M1240 78 Q1380 70 1520 80"></path></g>
      </svg>
    </div>
  </section>`,
    arkaPlan: `<img class="tema-arkaplan" src="${B}tema/derinlik.svg" alt="" aria-hidden="true" decoding="async">`,
};
