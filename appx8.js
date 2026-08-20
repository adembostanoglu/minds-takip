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
