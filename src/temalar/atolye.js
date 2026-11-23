// Atölye teması. Tasarım prototipinden üretildi; sahne ve arka plan sabit, kullanıcı verisi içermez.
const B = import.meta.env.BASE_URL;

export default {
    anahtar: 'atolye',
    ad: 'Atölye',
    renk: {"zemin": "#07111f", "kart": "rgba(11,26,46,.6)", "kenar": "inset 0 0 0 1px rgba(156,195,222,.4), 0 18px 40px rgba(0,0,0,.4)", "vurgu": "#9cc3de", "soluk": "#9fb6cc", "etiket": "#9cc3de", "cerceve": "linear-gradient(135deg, #9cc3de, #3a5a7a 50%, #9cc3de)"},
    css: `@keyframes t-yuru{to{stroke-dashoffset:-40}}
.kesik{animation:t-yuru 6s linear infinite}
.egik{transform:perspective(1600px) rotateY(-11deg) rotateX(3deg)}
@media (max-width:900px){.egik{transform:none}}
.ortam-tarama{width:30%;background:linear-gradient(90deg,transparent,rgba(156,195,222,.07) 50%,transparent);animation:t-tarama 12s linear infinite}
@keyframes t-tarama{from{transform:translate3d(-100%,0,0)}to{transform:translate3d(440%,0,0)}}`,
    sahne: `  <!-- ══ Atölye: teknik çizim kâğıdı, iki sütun ══ -->
  <section style="position: relative; isolation: isolate; overflow: hidden; background: radial-gradient(ellipse 70% 60% at 65% 40%, #16335a 0%, #0d2140 45%, #08162a 100%)">
    <div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(rgba(150,190,235,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(150,190,235,.14) 1px, transparent 1px), linear-gradient(rgba(150,190,235,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(150,190,235,.06) 1px, transparent 1px); background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px"></div>
    <div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(4,10,20,.75))"></div>

    <div class="tema-katman ortam-tarama hareket" aria-hidden="true"></div>
    <div class="tema-ust" aria-hidden="true"></div>

    <div style="max-width: 1320px; margin: 0 auto; box-sizing: border-box; padding: clamp(32px, 6vw, 80px) clamp(16px, 4vw, 40px) clamp(64px, 9vw, 120px); display: flex; flex-wrap: wrap; align-items: center; gap: clamp(40px, 5vw, 72px)">
      <!-- Sol: başlık bloğu, teknik çizimin antet kutusu gibi -->
      <div style="flex: 1 1 340px; min-width: 0; max-width: 460px">
        <p style="margin: 0 0 18px; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; letter-spacing: .06em; color: #9cc3de">çizim no. VL-01 · ölçek 1:1</p>
        <h1 class="giris-ad" style="margin: 0; line-height: 0"><img src="${B}img/wordmark-full.svg" alt="vulu Launcher" width="4401" height="1182" style="display: block; width: 100%; height: auto; filter: drop-shadow(0 0 22px rgba(255,190,100,.35))"></h1>
        <dl style="margin: clamp(26px, 3vw, 36px) 0 clamp(26px, 3vw, 36px); display: grid; grid-template-columns: auto 1fr; font-family: 'IBM Plex Mono', monospace; font-size: 13px; box-shadow: inset 0 0 0 1px rgba(156,195,222,.45)">
          <dt style="padding: 9px 14px; color: #9cc3de; border-bottom: 1px solid rgba(156,195,222,.3); border-right: 1px solid rgba(156,195,222,.3)">platform</dt><dd style="margin: 0; padding: 9px 14px; color: #e6eef6; border-bottom: 1px solid rgba(156,195,222,.3)">Windows 10 ve 11</dd>
          <dt style="padding: 9px 14px; color: #9cc3de; border-bottom: 1px solid rgba(156,195,222,.3); border-right: 1px solid rgba(156,195,222,.3)">sürüm</dt><dd style="margin: 0; padding: 9px 14px; color: #e6eef6; border-bottom: 1px solid rgba(156,195,222,.3)">beta</dd>
          <dt style="padding: 9px 14px; color: #9cc3de; border-right: 1px solid rgba(156,195,222,.3)">lisans</dt><dd style="margin: 0; padding: 9px 14px; color: #e6eef6">AGPL-3.0</dd>
        </dl>
        <a class="giris-cta" href="${B}launcher" data-to="/launcher" style="display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 clamp(22px, 3vw, 38px); background: linear-gradient(180deg, #fcd07c 0%, #f2a33a 55%, #d9832a 100%); color: #1a0e02; font-weight: 600; font-size: clamp(15px, 1.4vw, 18px); box-shadow: inset 0 1px 0 rgba(255,250,230,.7), 0 0 0 1px rgba(90,50,10,.6), 0 0 44px rgba(255,186,90,.45)">
          vulu Launcher
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
      </div>

      <!-- Sağ: perspektifle duran launcher, üstünde notlar -->
      <div style="flex: 1.5 1 480px; min-width: 0">
        <div class="egik" style="position: relative">
          <div class="giris-gorsel" style="position: relative; box-shadow: 0 0 0 1px rgba(156,195,222,.6), 0 0 0 8px rgba(11,26,46,.6), 0 0 0 9px rgba(156,195,222,.25), 30px 40px 80px rgba(0,0,0,.55)">
            <img src="${B}img/launcher-shot.webp" alt="vulu Launcher'ın Oyna ekranı" width="1860" height="1140" style="display: block; width: 100%; height: auto">
          </div>
          <div style="position: absolute; left: 3%; top: 24%; display: flex; align-items: center; gap: 0; ; pointer-events: none">
          <span style="width: 12px; height: 12px; flex: none; border-radius: 50%; border: 1.5px solid #ffd58a; background: rgba(255,213,138,.25); box-shadow: 0 0 10px rgba(255,213,138,.6); transform: translateX(-50%)"></span>
          <span style="width: clamp(24px, 3vw, 42px); height: 0; border-top: 1.5px dashed rgba(255,213,138,.8)"></span>
          <span style="font-family: 'IBM Plex Mono', monospace; font-size: clamp(11px, 1vw, 13px); color: #ffe7bd; background: rgba(11,26,46,.85); padding: 2px 8px; box-shadow: inset 0 0 0 1px rgba(255,213,138,.45); white-space: nowrap">instance'lar</span>
        </div>
          <div style="position: absolute; left: 30%; top: 4%; display: flex; align-items: center; gap: 0; ; pointer-events: none">
          <span style="width: 12px; height: 12px; flex: none; border-radius: 50%; border: 1.5px solid #ffd58a; background: rgba(255,213,138,.25); box-shadow: 0 0 10px rgba(255,213,138,.6); transform: translateX(-50%)"></span>
          <span style="width: clamp(24px, 3vw, 42px); height: 0; border-top: 1.5px dashed rgba(255,213,138,.8)"></span>
          <span style="font-family: 'IBM Plex Mono', monospace; font-size: clamp(11px, 1vw, 13px); color: #ffe7bd; background: rgba(11,26,46,.85); padding: 2px 8px; box-shadow: inset 0 0 0 1px rgba(255,213,138,.45); white-space: nowrap">keşfet · paketler</span>
        </div>
          <div style="position: absolute; left: 94%; top: 57%; display: flex; align-items: center; gap: 0; flex-direction: row-reverse; transform: translateX(-100%); pointer-events: none">
          <span style="width: 12px; height: 12px; flex: none; border-radius: 50%; border: 1.5px solid #ffd58a; background: rgba(255,213,138,.25); box-shadow: 0 0 10px rgba(255,213,138,.6); transform: translateX(50%)"></span>
          <span style="width: clamp(24px, 3vw, 42px); height: 0; border-top: 1.5px dashed rgba(255,213,138,.8)"></span>
          <span style="font-family: 'IBM Plex Mono', monospace; font-size: clamp(11px, 1vw, 13px); color: #ffe7bd; background: rgba(11,26,46,.85); padding: 2px 8px; box-shadow: inset 0 0 0 1px rgba(255,213,138,.45); white-space: nowrap">dünyalar ve yedekler</span>
        </div>
          <div style="position: absolute; left: 50%; top: 96%; display: flex; align-items: center; gap: 0; ; pointer-events: none">
          <span style="width: 12px; height: 12px; flex: none; border-radius: 50%; border: 1.5px solid #ffd58a; background: rgba(255,213,138,.25); box-shadow: 0 0 10px rgba(255,213,138,.6); transform: translateX(-50%)"></span>
          <span style="width: clamp(24px, 3vw, 42px); height: 0; border-top: 1.5px dashed rgba(255,213,138,.8)"></span>
          <span style="font-family: 'IBM Plex Mono', monospace; font-size: clamp(11px, 1vw, 13px); color: #ffe7bd; background: rgba(11,26,46,.85); padding: 2px 8px; box-shadow: inset 0 0 0 1px rgba(255,213,138,.45); white-space: nowrap">tek tuşla oyna</span>
        </div>
          <!-- ölçü çizgisi -->
          <svg aria-hidden="true" viewBox="0 0 1000 40" preserveAspectRatio="none" style="position: absolute; left: 0; top: calc(100% + 26px); width: 100%; height: 22px; overflow: visible">
            <g stroke="#9cc3de" stroke-width="1.5" fill="none" vector-effect="non-scaling-stroke"><line x1="0" y1="0" x2="0" y2="40" vector-effect="non-scaling-stroke"></line><line x1="1000" y1="0" x2="1000" y2="40" vector-effect="non-scaling-stroke"></line><line class="kesik hareket" x1="0" y1="20" x2="1000" y2="20" stroke-dasharray="10 10" vector-effect="non-scaling-stroke"></line></g>
          </svg>
        </div>
      </div>
    </div>
  </section>`,
    arkaPlan: `<div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse 70% 60% at 65% 40%, #16335a 0%, #0d2140 45%, #08162a 100%)"></div>
    <div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(rgba(150,190,235,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(150,190,235,.14) 1px, transparent 1px), linear-gradient(rgba(150,190,235,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(150,190,235,.06) 1px, transparent 1px); background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px"></div>
    <div aria-hidden="true" style="position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(4,10,20,.75))"></div>`,
};
