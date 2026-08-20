// V1.11.1 — clarify sharing workflow and add direct share shortcuts
(function bootShareShortcut(){
  if(typeof openShareModal!=='function' || typeof isSocialMediaStaff!=='function' || typeof setView!=='function'){
    setTimeout(bootShareShortcut,100);
    return;
  }

  function installShareShortcut(){
    if(!profile) return;
    const canShare = isAdmin() || isSocialMediaStaff();
    const heroActions=document.querySelector('#dashboard .hero-actions');
    let heroBtn=document.getElementById('heroShareBtnV111');
    if(canShare && heroActions){
      if(!heroBtn){
        heroBtn=document.createElement('button');
        heroBtn.id='heroShareBtnV111';
        heroBtn.className='primary';
        heroBtn.textContent='+ Paylaşım Gir';
        heroBtn.onclick=()=>{ setView('shares'); setTimeout(()=>openShareModal(),40); };
        heroActions.insertBefore(heroBtn,heroActions.firstChild);
      }
      heroBtn.style.display='';
    }else if(heroBtn){
      heroBtn.style.display='none';
    }

    const workButtons=[document.getElementById('addWorkBtn'),document.querySelector('#dashboard [data-action="work"]')].filter(Boolean);
    workButtons.forEach(btn=>{ btn.textContent=isSocialMediaStaff()?'+ Hazırlanan İş Ekle':'+ İş Ekle'; });

    const sharesActions=document.querySelector('#shares .section-actions');
    if(sharesActions){
      let note=document.getElementById('shareFlowNoteV111');
      if(!note){
        note=document.createElement('div');
        note.id='shareFlowNoteV111';
        note.className='info-banner';
        note.style.marginTop='10px';
        sharesActions.parentNode.insertBefore(note,sharesActions.nextSibling);
      }
      note.innerHTML='<b>Paylaşım sayacı:</b> Yalnızca “Paylaşım Gir” ile kaydedilen gerçek yayınlar Paylaşılan Post/Video rakamını artırır. “Planlandı” yalnızca paylaşım planıdır.';
      note.style.display=canShare||isAdmin()?'':'none';
    }
  }

  const previousRenderAll=renderAll;
  renderAll=function(){ previousRenderAll(); installShareShortcut(); };

  const previousApplyRoleUI=applyRoleUI;
  applyRoleUI=function(){ previousApplyRoleUI(); installShareShortcut(); };

  installShareShortcut();
})();

// Load V1.11.2 approved Firms page visual layer.
if(!document.querySelector('script[data-minds-v112]')){
  const s=document.createElement('script');
  s.src='appx9.js?v=1112';
  s.dataset.mindsV112='1';
  s.onerror=()=>console.error('V1.11.2 Firms visual module could not be loaded');
  document.body.appendChild(s);
}

// Load V1.11.3 premium Ana Panel KPI icon layer.
if(!document.querySelector('script[data-minds-v113]')){
  const s=document.createElement('script');
  s.src='appx10.js?v=1113';
  s.dataset.mindsV113='1';
  s.onerror=()=>console.error('V1.11.3 dashboard icon module could not be loaded');
  document.body.appendChild(s);
}

// Load V1.11.6 separated design-firm and social-media sharing scopes.
if(!document.querySelector('script[data-minds-v116]')){
  const s=document.createElement('script');
  s.src='appx11.js?v=1116';
  s.dataset.mindsV116='1';
  s.onerror=()=>console.error('V1.11.6 responsibility scope module could not be loaded');
  document.body.appendChild(s);
}

// Load V1.11.5 robust firm completion colors.
if(!document.querySelector('script[data-minds-v115]')){
  const s=document.createElement('script');
  s.src='appx12.js?v=1115';
  s.dataset.mindsV115='1';
  s.onerror=()=>console.error('V1.11.5 firm completion color module could not be loaded');
  document.body.appendChild(s);
}

// Load V1.12 self-service profile avatars.
if(!document.querySelector('script[data-minds-v120]')){
  const s=document.createElement('script');
  s.src='appx13.js?v=1200';
  s.dataset.mindsV120='1';
  s.onerror=()=>console.error('V1.12 profile avatar module could not be loaded');
  document.body.appendChild(s);
}

// Load V1.12.1 clickable team member drilldown.
if(!document.querySelector('script[data-minds-v121]')){
  const s=document.createElement('script');
  s.src='appx14.js?v=1210';
  s.dataset.mindsV121='1';
  s.onerror=()=>console.error('V1.12.1 team detail module could not be loaded');
  document.body.appendChild(s);
}

// Compatibility aliases for lexical helpers used by V1.12.1.
if(!document.querySelector('script[data-minds-v121-compat]')){
  const s=document.createElement('script');
  s.src='appx15.js?v=1210';
  s.dataset.mindsV121Compat='1';
  s.onerror=()=>console.error('V1.12.1 team detail compatibility module could not be loaded');
  document.body.appendChild(s);
}
