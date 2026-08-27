// V1.18.8 — Personel cihaz erişimi: yönetici her cihazdan, Aslı tablet+bilgisayardan, diğer personel yalnızca bilgisayardan erişebilir.
(function bootStaffDevicePolicyV188(){
  if(window.__mindsStaffDevicePolicyV188)return;
  window.__mindsStaffDevicePolicyV188=true;

  const ASLI_PROFILE_ID='59fe3728-d991-4fe4-aad8-22f0ecafc4a1';

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
    if(typeof isAdmin==='function'){
      try{if(isAdmin())return true;}catch(_e){}
    }
    return String(window.profile?.role||'').toLowerCase()==='admin';
  }

  function isAsliProfile(){
    const p=window.profile||{};
    return String(p.id||'')===ASLI_PROFILE_ID || String(p.full_name||'').trim().toLocaleLowerCase('tr-TR')==='aslı coşkun';
  }

  function isAllowed(){
    const type=deviceType();
    if(type==='desktop')return true;
    if(isAdminProfile())return true;
    if(type==='tablet'&&isAsliProfile())return true;
    return false;
  }

  function installStyle(){
    if(document.getElementById('staffDevicePolicyV188Style'))return;
    const s=document.createElement('style');
    s.id='staffDevicePolicyV188Style';
    s.textContent=`
      #staffDevicePolicyV188{position:fixed;inset:0;z-index:2147483647;background:#090d0f;display:flex;align-items:center;justify-content:center;padding:24px;color:#eef2f3;font-family:inherit}
      #staffDevicePolicyV188 .device-lock-card{width:min(520px,94vw);border:1px solid #313a3f;border-radius:18px;background:linear-gradient(145deg,#141b1f,#0e1316);box-shadow:0 28px 80px rgba(0,0,0,.55);padding:30px;text-align:center}
      #staffDevicePolicyV188 .device-lock-icon{width:62px;height:62px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;border:1px solid #6d6820;background:#292707;color:#eee62d;font-size:28px;font-weight:900}
      #staffDevicePolicyV188 h2{margin:0;font-size:24px;letter-spacing:-.4px}
      #staffDevicePolicyV188 p{margin:11px auto 0;max-width:410px;color:#9aa6ab;font-size:13px;line-height:1.65}
      #staffDevicePolicyV188 .device-lock-note{margin-top:18px;padding:11px 12px;border:1px solid #3b4322;border-radius:10px;background:#17190e;color:#d9d560;font-size:11px;font-weight:750}
    `;
    document.head.appendChild(s);
  }

  function showBlocked(){
    installStyle();
    if(document.getElementById('staffDevicePolicyV188'))return;
    const el=document.createElement('div');
    el.id='staffDevicePolicyV188';
    el.innerHTML=`<div class="device-lock-card"><div class="device-lock-icon">▣</div><h2>Bilgisayardan giriş yapmalısın</h2><p>Bu personel hesabında telefon ve tablet erişimi kapalıdır. Mind's Takip'i masaüstü veya dizüstü bilgisayardan açarak giriş yapabilirsin.</p><div class="device-lock-note">Yönetici hesapları tüm cihazlardan erişebilir. Yetkili tablet hesabı yalnızca tablet ve bilgisayardan kullanılabilir.</div></div>`;
    document.body.appendChild(el);
  }

  async function enforce(){
    if(typeof window.profile==='undefined'||!window.profile){setTimeout(enforce,120);return;}
    if(isAllowed())return;
    showBlocked();
    try{
      const auth=window.sb?.auth;
      if(auth?.signOut)await auth.signOut();
    }catch(e){console.warn('Personel cihaz oturumu kapatılamadı',e);}
  }

  enforce();
  window.addEventListener('pageshow',()=>setTimeout(enforce,50));
})();
