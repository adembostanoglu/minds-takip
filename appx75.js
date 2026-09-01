// V1.23.3 — Sosyal Medya Takip firma sürekliliği: firmalar eklendikleri aydan itibaren sonraki aylarda görünmeye devam eder.
(function bootSocialTrackingFirmContinuityV233(){
  if(window.__mindsSocialTrackingFirmContinuityV233)return;
  if(typeof selectedMonthFirms!=='function'||typeof state==='undefined'){
    setTimeout(bootSocialTrackingFirmContinuityV233,120);
    return;
  }
  window.__mindsSocialTrackingFirmContinuityV233=true;

  const originalSelectedMonthFirms=selectedMonthFirms;
  const monthPart=v=>String(v||'').slice(0,7);
  const socialViewActive=()=>document.getElementById('socialMediaTrack')?.classList.contains('active-view');
  const sortFirms=arr=>[...arr].sort((a,b)=>new Date(a.list_order_at||a.created_at||0)-new Date(b.list_order_at||b.created_at||0));

  function socialFirmsForSelectedMonth(){
    const target=monthPart(typeof selectedMonth!=='undefined'?selectedMonth:'');
    return sortFirms((state.firms||[]).filter(f=>{
      const created=monthPart(f.created_at);
      if(target&&created&&created>target)return false;

      const deactivated=monthPart(f.deactivated_at);
      if(target&&deactivated&&deactivated<target)return false;

      if(f.active)return true;
      return !!deactivated&&(!target||target<=deactivated);
    }));
  }

  const patchedSelectedMonthFirms=function(...args){
    if(socialViewActive())return socialFirmsForSelectedMonth();
    return originalSelectedMonthFirms.apply(this,args);
  };

  try{selectedMonthFirms=patchedSelectedMonthFirms;}catch(_e){}
  window.selectedMonthFirms=patchedSelectedMonthFirms;
  window.__mindsSocialFirmsForSelectedMonthV233=socialFirmsForSelectedMonth;
})();
