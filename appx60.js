// V1.20.7 — Sosyal Medya Takip yalnızca yönetici menüsünde görünür.
(function bootAdminOnlySocialMediaNavV207(){
  if(window.__mindsAdminOnlySocialMediaNavV207)return;
  window.__mindsAdminOnlySocialMediaNavV207=true;

  function applyVisibility(){
    const admin=typeof isAdmin==='function'&&isAdmin();
    const candidates=[
      document.getElementById('socialMediaTrackNav'),
      ...document.querySelectorAll('.sidebar nav .nav-item[data-view="socialMediaTrack"], .sidebar nav .nav-item[data-nav-color-key="social"]')
    ].filter(Boolean);
    [...new Set(candidates)].forEach(btn=>{
      btn.style.setProperty('display',admin?'flex':'none','important');
      btn.setAttribute('aria-hidden',admin?'false':'true');
      if(!admin)btn.tabIndex=-1;
      else btn.removeAttribute('tabindex');
    });

    const view=document.getElementById('socialMediaTrack');
    if(view&&!admin){
      view.classList.remove('active-view');
      view.style.setProperty('display','none','important');
    }else if(view&&admin){
      view.style.removeProperty('display');
    }
  }

  applyVisibility();
  [100,400,900,1600,3000,5500].forEach(ms=>setTimeout(applyVisibility,ms));
  document.addEventListener('click',e=>{
    if(e.target.closest('.sidebar nav')||e.target.closest('#loginBtn'))setTimeout(applyVisibility,30);
  },true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)applyVisibility();});
})();
