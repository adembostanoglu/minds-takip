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
        heroBtn=document.createElement('button'); heroBtn.id='heroShareBtnV111'; heroBtn.className='primary'; heroBtn.textContent='+ Paylaşım Gir';
        heroBtn.onclick=()=>{ setView('shares'); setTimeout(()=>openShareModal(),40); };
        heroActions.insertBefore(heroBtn,heroActions.firstChild);
      }
      heroBtn.style.display='';
    }else if(heroBtn){ heroBtn.style.display='none'; }

    const workButtons=[document.getElementById('addWorkBtn'),document.querySelector('#dashboard [data-action="work"]')].filter(Boolean);
    workButtons.forEach(btn=>{ btn.textContent=isSocialMediaStaff()?'+ Hazırlanan İş Ekle':'+ İş Ekle'; });

    const sharesActions=document.querySelector('#shares .section-actions');
    if(sharesActions){
      let note=document.getElementById('shareFlowNoteV111');
      if(!note){ note=document.createElement('div'); note.id='shareFlowNoteV111'; note.className='info-banner'; note.style.marginTop='10px'; sharesActions.parentNode.insertBefore(note,sharesActions.nextSibling); }
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

if(!document.querySelector('script[data-minds-v112]')){ const s=document.createElement('script'); s.src='appx9.js?v=1112'; s.dataset.mindsV112='1'; s.onerror=()=>console.error('V1.11.2 Firms visual module could not be loaded'); document.body.appendChild(s); }
if(!document.querySelector('script[data-minds-v113]')){ const s=document.createElement('script'); s.src='appx10.js?v=1113'; s.dataset.mindsV113='1'; s.onerror=()=>console.error('V1.11.3 dashboard icon module could not be loaded'); document.body.appendChild(s); }
if(!document.querySelector('script[data-minds-v116]')){ const s=document.createElement('script'); s.src='appx11.js?v=1116'; s.dataset.mindsV116='1'; s.onerror=()=>console.error('V1.11.6 responsibility scope module could not be loaded'); document.body.appendChild(s); }
if(!document.querySelector('script[data-minds-v115]')){ const s=document.createElement('script'); s.src='appx12.js?v=1117'; s.dataset.mindsV115='1'; s.onerror=()=>console.error('V1.11.7 firm completion color module could not be loaded'); document.body.appendChild(s); }
if(!document.querySelector('script[data-minds-v120]')){ const s=document.createElement('script'); s.src='appx13.js?v=1200'; s.dataset.mindsV120='1'; s.onerror=()=>console.error('V1.12 profile avatar module could not be loaded'); document.body.appendChild(s); }
if(!document.querySelector('script[data-minds-v121]')){ const s=document.createElement('script'); s.src='appx14.js?v=1210'; s.dataset.mindsV121='1'; s.onerror=()=>console.error('V1.12.1 team detail module could not be loaded'); document.body.appendChild(s); }
if(!document.querySelector('script[data-minds-v121-compat]')){ const s=document.createElement('script'); s.src='appx15.js?v=1351'; s.dataset.mindsV121Compat='1'; s.onerror=()=>console.error('V1.13.5 compatibility/performance loader could not be loaded'); document.body.appendChild(s); }
if(!document.querySelector('script[data-minds-v122]')){ const s=document.createElement('script'); s.src='appx16.js?v=1230'; s.dataset.mindsV122='1'; s.onerror=()=>console.error('V1.12.3 personnel report module could not be loaded'); document.body.appendChild(s); }
