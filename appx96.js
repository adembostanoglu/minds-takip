// V1.25.9 — Ekip Firmalar başlığını ve menü adını tüm render'lardan sonra korur.
(function bootTeamFirmsTitleGuardV259(){
  if(window.__mindsTeamFirmsTitleGuardV259)return;
  window.__mindsTeamFirmsTitleGuardV259=true;

  function apply(){
    const nav=document.querySelector('.nav-item[data-view="assignmentOverview"]');
    const span=nav?.querySelector('span');
    if(span&&span.textContent!=='Ekip Firmalar')span.textContent='Ekip Firmalar';

    const section=document.getElementById('assignmentOverview');
    const h2=section?.querySelector('.tf-head-v258 h2, .dist-head-v257 h2, h2');
    if(h2&&h2.textContent!=='Ekip Firmalar')h2.textContent='Ekip Firmalar';

    if(section?.classList.contains('active-view')){
      const t=document.getElementById('pageTitle');
      const s=document.getElementById('pageSub');
      if(t&&t.textContent!=='Ekip Firmalar')t.textContent='Ekip Firmalar';
      if(s)s.textContent='Personel bazında firma, post, video ve sosyal medya sorumlulukları.';
    }
  }

  const obs=new MutationObserver(()=>queueMicrotask(apply));
  obs.observe(document.body,{childList:true,subtree:true,characterData:true});

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="assignmentOverview"]'))setTimeout(apply,0);
  },true);
  window.addEventListener('pageshow',apply);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply();});
  [0,120,400,900,1800].forEach(ms=>setTimeout(apply,ms));
})();