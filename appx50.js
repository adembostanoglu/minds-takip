// V1.18.7 — Personel mobil/tablet erişim engeli. Yöneticiler tüm cihazlardan erişebilir.
(function bootStaffDesktopOnlyV187(){
  if(window.__mindsStaffDesktopOnlyV187)return;
  window.__mindsStaffDesktopOnlyV187=true;

  function isMobileOrTablet(){
    const ua=String(navigator.userAgent||'');
    if(navigator.userAgentData?.mobile)return true;
    if(/Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua))return true;
    // iPadOS, Safari'de masaüstü sitesi istendiğinde kendini Macintosh olarak gösterebilir.
    if(/Macintosh/i.test(ua)&&Number(navigator.maxTouchPoints||0)>1)return true;
    return false;
  }

  function isAdminProfile(){
    if(typeof isAdmin==='function'){
      try{if(isAdmin())return true;}catch(_e){}
    }
    return String(window.profile?.role||'').toLowerCase()==='admin';
  }

  function installStyle(){
    if(document.getElementById('staffDesktopOnlyV187Style'))return;
    const s=document.createElement('style');
    s.id='staffDesktopOnlyV187Style';
    s.textContent=`
      #staffDesktopOnlyV187{position:fixed;inset:0;z-index:2147483647;background:#090d0f;display:flex;align-items:center;justify-content:center;padding:24px;color:#eef2f3;font-family:inherit}
      #staffDesktopOnlyV187 .device-lock-card{width:min(520px,94vw);border:1px solid #313a3f;border-radius:18px;background:linear-gradient(145deg,#141b1f,#0e1316);box-shadow:0 28px 80px rgba(0,0,0,.55);padding:30px;text-align:center}
      #staffDesktopOnlyV187 .device-lock-icon{width:62px;height:62px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;border:1px solid #6d6820;background:#292707;color:#eee62d;font-size:28px;font-weight:900}
      #staffDesktopOnlyV187 h2{margin:0;font-size:24px;letter-spacing:-.4px}
      #staffDesktopOnlyV187 p{margin:11px auto 0;max-width:410px;color:#9aa6ab;font-size:13px;line-height:1.65}
      #staffDesktopOnlyV187 .device-lock-note{margin-top:18px;padding:11px 12px;border:1px solid #3b4322;border-radius:10px;background:#17190e;color:#d9d560;font-size:11px;font-weight:750}
    `;
    document.head.appendChild(s);
  }

  function showBlocked(){
    installStyle();
    if(document.getElementById('staffDesktopOnlyV187'))return;
    const el=document.createElement('div');
    el.id='staffDesktopOnlyV187';
    el.innerHTML=`<div class="device-lock-card"><div class="device-lock-icon">▣</div><h2>Bilgisayardan giriş yapmalısın</h2><p>Personel hesaplarında telefon ve tablet erişimi kapalıdır. Mind's Takip'i masaüstü veya dizüstü bilgisayardan açarak giriş yapabilirsin.</p><div class="device-lock-note">Yönetici hesaplarında mobil erişim açıktır.</div></div>`;
    document.body.appendChild(el);
  }

  async function enforce(){
    if(!isMobileOrTablet())return;
    if(typeof window.profile==='undefined'||!window.profile){setTimeout(enforce,120);return;}
    if(isAdminProfile())return;
    showBlocked();
    try{
      const auth=window.sb?.auth;
      if(auth?.signOut)await auth.signOut();
    }catch(e){console.warn('Personel mobil oturumu kapatılamadı',e);}
  }

  enforce();
  window.addEventListener('pageshow',()=>setTimeout(enforce,50));
})();
