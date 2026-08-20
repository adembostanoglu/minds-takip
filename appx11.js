// V1.11.6 — separate design-firm scope from social-media sharing scope
(function bootStaffResponsibilityScopesV116(){
  if(typeof isSocialMediaStaff!=='function' || typeof activeFirms!=='function' || typeof selectedMonthFirms!=='function' || typeof renderFirms!=='function'){
    setTimeout(bootStaffResponsibilityScopesV116,100);
    return;
  }
  if(window.__mindsStaffResponsibilityScopesV116) return;
  window.__mindsStaffResponsibilityScopesV116=true;

  const originalActiveFirms=activeFirms;
  const originalSelectedMonthFirms=selectedMonthFirms;
  const originalRenderFirms=renderFirms;

  function idsForResponsibility(resp){
    if(!profile?.id) return new Set();
    return new Set(
      state.assignments
        .filter(a=>a.person_id===profile.id && a.responsibility===resp)
        .map(a=>a.firm_id)
    );
  }

  function designFirmIds(){ return idsForResponsibility('tasarim'); }
  function socialFirmIds(){ return idsForResponsibility('sosyal_medya'); }
  window.mindsDesignFirmIds=designFirmIds;
  window.mindsSocialFirmIds=socialFirmIds;

  function sortFirms(arr){
    return [...arr].sort((a,b)=>new Date(a.list_order_at)-new Date(b.list_order_at));
  }

  // For a staff member who is both designer and social-media specialist,
  // "Firmalarım" is intentionally the design/post-production list.
  // Sharing stays independent and continues to use sosyal_medya assignments
  // through shareScopeWorks()/isSocialMediaForFirm() in V1.11 core.
  activeFirms=function(){
    if(!isSocialMediaStaff()) return originalActiveFirms();
    const designIds=designFirmIds();
    if(!designIds.size) return originalActiveFirms();
    return sortFirms(state.firms.filter(f=>f.active && designIds.has(f.id)));
  };

  selectedMonthFirms=function(){
    if(!isSocialMediaStaff()) return originalSelectedMonthFirms();
    const designIds=designFirmIds();
    if(!designIds.size) return originalSelectedMonthFirms();
    if(selectedMonth===monthISO()) return activeFirms();
    const monthIds=new Set(state.months.filter(m=>m.month===selectedMonth).map(m=>m.firm_id));
    return sortFirms(state.firms.filter(f=>designIds.has(f.id) && monthIds.has(f.id)));
  };

  function ensureDesignFirmNote(){
    const section=el('firms');
    if(!section) return;
    let note=el('staffDesignScopeNoteV116');
    if(!isSocialMediaStaff() || !designFirmIds().size){
      if(note) note.remove();
      return;
    }
    if(!note){
      note=document.createElement('div');
      note.id='staffDesignScopeNoteV116';
      note.className='info-banner';
      const actions=section.querySelector('.section-actions');
      if(actions) actions.insertAdjacentElement('afterend',note);
      else section.prepend(note);
    }
    const count=activeFirms().length;
    note.innerHTML=`<b>Tasarım / Post hazırlayacağın firmalar:</b> ${count} aktif firma. Bu liste sadece “Tasarım” sorumluluğu verilen firmaları gösterir.`;
    if(el('firmsDesc')) el('firmsDesc').textContent='Tasarım / post hazırlama sorumluluğun bulunan firmalar.';
  }

  function ensureShareScopeNote(){
    const section=el('shares');
    if(!section) return;
    let note=el('staffShareScopeNoteV116');
    if(!isSocialMediaStaff()){
      if(note) note.remove();
      return;
    }
    if(!note){
      note=document.createElement('div');
      note.id='staffShareScopeNoteV116';
      note.className='info-banner';
      const actions=section.querySelector('.section-actions');
      if(actions) actions.insertAdjacentElement('afterend',note);
      else section.prepend(note);
    }
    const ids=socialFirmIds();
    const activeCount=state.firms.filter(f=>f.active && ids.has(f.id)).length;
    note.innerHTML=`<b>Paylaşım yapacağın firmalar:</b> ${activeCount} aktif firma. Paylaşım Merkezi yalnızca “Sosyal Medya” sorumluluğu verilen firmaların hazır/onaylı içeriklerini gösterir.`;
  }

  renderFirms=function(){
    originalRenderFirms();
    ensureDesignFirmNote();
  };

  const previousRenderAll=renderAll;
  renderAll=function(){
    previousRenderAll();
    ensureDesignFirmNote();
    ensureShareScopeNote();
  };

  const previousApplyRoleUI=applyRoleUI;
  applyRoleUI=function(){
    previousApplyRoleUI();
    if(isSocialMediaStaff() && designFirmIds().size){
      if(el('firmsDesc')) el('firmsDesc').textContent='Tasarım / post hazırlama sorumluluğun bulunan firmalar.';
    }
    ensureDesignFirmNote();
    ensureShareScopeNote();
  };

  setTimeout(()=>{
    try{
      if(profile){
        renderFirms();
        ensureShareScopeNote();
        if(typeof renderStats==='function') renderStats();
        if(typeof renderDashboardFirms==='function') renderDashboardFirms();
        if(typeof renderShares==='function') renderShares();
      }
    }catch(e){ console.warn('V1.11.6 responsibility scope init',e); }
  },140);
})();