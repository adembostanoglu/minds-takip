// V1.12.1 compatibility shim for helpers used by appx14
(function teamDrilldownCompatV121(){
  try{
    if(typeof isAdmin==='function') window.isAdmin=isAdmin;
    if(typeof activeProfiles==='function') window.activeProfiles=activeProfiles;
    if(typeof monthWorks==='function') window.monthWorks=monthWorks;
    if(typeof monthShares==='function') window.monthShares=monthShares;
    if(typeof workFirmId==='function') window.workFirmId=workFirmId;
    if(typeof workReady==='function') window.workReady=workReady;
    if(typeof sumWorkQty==='function') window.sumWorkQty=sumWorkQty;
    if(typeof firm==='function') window.firm=firm;
    if(typeof firmLogo==='function') window.firmLogo=firmLogo;
    if(typeof escapeHtml==='function') window.escapeHtml=escapeHtml;
    if(typeof prettyMonth==='function') window.prettyMonth=prettyMonth;
    if(typeof formatDateTime==='function') window.formatDateTime=formatDateTime;
    if(typeof dateMonthISO==='function') window.dateMonthISO=dateMonthISO;
  }catch(e){ console.warn('Team drilldown compatibility aliases',e); }
})();
