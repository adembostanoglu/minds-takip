// V1.20.2 — Cihaz erişimi düzeltmesi: yönetici her cihazdan, Aslı tablet+bilgisayardan, diğer personel yalnızca bilgisayardan erişebilir.
(function bootStaffDevicePolicyV202(){
  if(window.__mindsStaffDevicePolicyV202)return;
  window.__mindsStaffDevicePolicyV202=true;

  const ASLI_PROFILE_ID='59fe3728-d991-4fe4-aad8-22f0ecafc4a1';

  function currentProfile(){
    try{return typeof profile!=='undefined'?profile:null;}catch(_e){return null;}
  }

  function deviceType(){
    const ua=String(navigator.userAgent||'');
    const touch=Number(navigator.maxTouchPoints||0);
    const ipad=/iPad/i.test(ua)||(/Macintosh/i.test(ua)&&touch>1);
    const iphone=/iPhone|iPod/i.test(ua);
    const android=/Android/i.test(ua);
    const androidPhone=android&&/Mobile/i.test(ua);
    const androidTablet=android&&!/Mobile/i.test(ua);
    const otherPhone=/Windows Phone|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    if(ipad||androidTablet)return'tablet';
    if(iphone||androidPhone||otherPhone||navigator.userAgentData?.mobile)return'phone';
    return'desktop';
  }

  function isAdminProfile(){
    try{if(typeof isAdmin==='function'&&isAdmin())return true;}catch(_e){}
    return String(currentProfile()?.role||'').toLowerCase()==='admin';
  }

  function isAsliProfile(){
    const p=currentProfile()||{};
    return String(p.id||'')===ASLI_PROFILE_ID || String(p.full_name||'').trim().toLocaleLowerCase('tr-TR')==='aslı coşkun';
  }

  function isAllowed(){
    const type=deviceType();
    if(type==='desktop')return true;
    // Yönetici için telefon/tablet dahil cihaz kısıtı yok.
    if(isAdminProfile())return true;
    // Aslı tablet ve bilgisayardan erişebilir; telefondan erişemez.
    if(type==='tablet'&&isAsliProfile())return true;
    return false;
  }

  function installStyle(){
    if(document.getElementById('staffDevicePolicyV202Style'))return;
    document.getElementById('staffDevicePolicyV188Style')?.remove();
    const s=document.createElement('style');
    s.id='staffDevicePolicyV202Style';
    s.textContent=`
      #staffDevicePolicyV202{position:fixed;inset:0;z-index:2147483647;background:#090d0f;display:flex;align-items:center;justify-content:center;padding:24px;color:#eef2f3;font-family:inherit}
      #staffDevicePolicyV202 .device-lock-card{width:min(520px,94vw);border:1px solid #313a3f;border-radius:18px;background:linear-gradient(145deg,#141b1f,#0e1316);box-shadow:0 28px 80px rgba(0,0,0,.55);padding:30px;text-align:center}
      #staffDevicePolicyV202 .device-lock-icon{width:62px;height:62px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;border:1px solid #6d6820;background:#292707;color:#eee62d;font-size:28px;font-weight:900}
      #staffDevicePolicyV202 h2{margin:0;font-size:24px;letter-spacing:-.4px}
      #staffDevicePolicyV202 p{margin:11px auto 0;max-width:410px;color:#9aa6ab;font-size:13px;line-height:1.65}
      #staffDevicePolicyV202 .device-lock-note{margin-top:18px;padding:11px 12px;border:1px solid #3b4322;border-radius:10px;background:#17190e;color:#d9d560;font-size:11px;font-weight:750}
    `;
    document.head.appendChild(s);
  }

  function clearBlocked(){
    document.getElementById('staffDevicePolicyV188')?.remove();
    document.getElementById('staffDevicePolicyV202')?.remove();
  }

  function showBlocked(){
    installStyle();
    if(document.getElementById('staffDevicePolicyV202'))return;
    document.getElementById('staffDevicePolicyV188')?.remove();
    const el=document.createElement('div');
    el.id='staffDevicePolicyV202';
    el.innerHTML=`<div class="device-lock-card"><div class="device-lock-icon">▣</div><h2>Bilgisayardan giriş yapmalısın</h2><p>Bu personel hesabında telefon ve tablet erişimi kapalıdır. Mind's Takip'i masaüstü veya dizüstü bilgisayardan açarak giriş yapabilirsin.</p><div class="device-lock-note">Yönetici hesapları tüm cihazlardan erişebilir. Yetkili tablet hesabı yalnızca tablet ve bilgisayardan kullanılabilir.</div></div>`;
    document.body.appendChild(el);
  }

  async function enforce(){
    const p=currentProfile();
    if(!p){setTimeout(enforce,120);return;}
    if(isAllowed()){
      clearBlocked();
      return;
    }
    showBlocked();
    try{
      if(typeof sb!=='undefined'&&sb?.auth?.signOut)await sb.auth.signOut();
    }catch(e){console.warn('Personel cihaz oturumu kapatılamadı',e);}
  }

  enforce();
  window.addEventListener('pageshow',()=>setTimeout(enforce,50));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(enforce,50);});
})();
