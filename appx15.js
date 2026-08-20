// V1.12.1 compatibility shim for lexical helpers used by appx14
(function teamDrilldownCompatV121(){
  try{
    if(typeof escapeHtml==='function') window.escapeHtml=escapeHtml;
    if(typeof prettyMonth==='function') window.prettyMonth=prettyMonth;
    if(typeof formatDateTime==='function') window.formatDateTime=formatDateTime;
    if(typeof dateMonthISO==='function') window.dateMonthISO=dateMonthISO;
  }catch(e){ console.warn('Team drilldown compatibility aliases',e); }
})();
