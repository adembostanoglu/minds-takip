// V1.11.4 — social media staff firm scope hardening
(function bootSocialFirmScopeV114(){
  if(typeof isSocialMediaStaff!=='function' || typeof activeFirms!=='function' || typeof selectedMonthFirms!=='function' || typeof renderFirms!=='function'){
    setTimeout(bootSocialFirmScopeV114,100);
    return;
  }
  if(window.__mindsSocialFirmScopeV114) return;
  window.__mindsSocialFirmScopeV114=true;

  const originalActiveFirms=activeFirms;
  const originalSelectedMonthFirms=selectedMonthFirms;
  const originalRenderFirms=renderFirms;

  function socialFirmIds(){
    if(!profile?.id) return new Set();
    return new Set(
      state.assignments
        .filter(a=>a.person_id===profile.id && a.responsibility==='sosyal_medya')
        .map(a=>a.firm_id)
    );
  }

  function sortFirms(arr){
    return arr.sort((a,b)=>new Date(a.list_order_at)-new Date(b.list_order_at));
  }

  activeFirms=function(){
    if(!isSocialMediaStaff()) return originalActiveFirms();
    const ids=socialFirmIds();
    return sortFirms(state.firms.filter(f=>f.active && ids.has(f.id)));
  };

  selectedMonthFirms=function(){
    if(!isSocialMediaStaff()) return originalSelectedMonthFirms();
    const ids=socialFirmIds();
    if(selectedMonth===monthISO()) return activeFirms();
    const monthIds=new Set(state.months.filter(m=>m.month===selectedMonth).map(m=>m.firm_id));
    return sortFirms(state.firms.filter(f=>ids.has(f.id) && monthIds.has(f.id)));
  };

  function ensureSocialFirmNote(){
    const section=el('firms');
    if(!section) return;
    let note=el('socialFirmScopeNoteV114');
    if(!isSocialMediaStaff()){
      if(note) note.remove();
      return;
    }
    if(!note){
      note=document.createElement('div');
      note.id='socialFirmScopeNoteV114';
      note.className='info-banner';
      const actions=section.querySelector('.section-actions');
      if(actions) actions.insertAdjacentElement('afterend',note);
      else section.prepend(note);
    }
    const count=activeFirms().length;
    note.innerHTML=`<b>Sosyal medya sorumluluğun:</b> ${count} aktif firma. Paylaşım Merkezi bu firmaların hazır/onaylı içeriklerini gösterir.`;
  }

  renderFirms=function(){
    originalRenderFirms();
    ensureSocialFirmNote();
  };

  setTimeout(()=>{
    try{
      if(profile){
        renderFirms();
        if(typeof renderStats==='function') renderStats();
        if(typeof renderDashboardFirms==='function') renderDashboardFirms();
        if(typeof renderShares==='function') renderShares();
      }
    }catch(e){ console.warn('V1.11.4 social firm scope init',e); }
  },120);
})();
