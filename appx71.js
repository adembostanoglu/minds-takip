// V1.23.0 — Son render bütünlüğü: structured paylaşım metriklerini korur; Firma/Dashboard durumunu render sonrası deterministik senkronlar.
(function bootFinalRenderIntegrityV230(){
  if(window.__mindsRenderIntegrityV230)return;
  if(typeof renderFirms!=='function'||typeof renderAll!=='function'){
    setTimeout(bootFinalRenderIntegrityV230,120);return;
  }
  window.__mindsRenderIntegrityV230=true;

  let syncTimer=null;

  function applyFirmState(){
    try{window.applyFirmPackageCompletionV168?.();}
    catch(e){console.warn('Firma tamamlanma senkronu',e);}
  }

  // appx59 en son firma kartı HTML'ini üretiyor. Her üretimden hemen sonra
  // onaylı paket/paylaşım durumunu tekrar uygula; böylece yenileme gerektirmez.
  const previousRenderFirms=renderFirms;
  if(!previousRenderFirms.__mindsRenderIntegrityV230){
    const wrappedRenderFirms=function(){
      const out=previousRenderFirms.apply(this,arguments);
      queueMicrotask(applyFirmState);
      return out;
    };
    wrappedRenderFirms.__mindsRenderIntegrityV230=true;
    try{renderFirms=wrappedRenderFirms;window.renderFirms=wrappedRenderFirms;}catch(_e){}
  }

  function syncVisible(){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>{
      try{
        const dashboardActive=document.getElementById('dashboard')?.classList.contains('active-view');
        const firmsActive=document.getElementById('firms')?.classList.contains('active-view');
        if(dashboardActive){
          if(typeof renderStats==='function')renderStats();
          if(typeof renderDashboardFirms==='function')renderDashboardFirms();
        }
        if(firmsActive&&typeof renderFirms==='function')renderFirms();
        applyFirmState();
      }catch(e){console.warn('Son render bütünlüğü',e);}
    },0);
  }

  // loadData/realtime sonrasında final görünümü bir kez senkronla.
  const previousRenderAll=renderAll;
  if(!previousRenderAll.__mindsRenderIntegrityV230){
    const wrappedRenderAll=function(){
      const out=previousRenderAll.apply(this,arguments);
      queueMicrotask(syncVisible);
      return out;
    };
    wrappedRenderAll.__mindsRenderIntegrityV230=true;
    try{renderAll=wrappedRenderAll;window.renderAll=wrappedRenderAll;}catch(_e){}
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="dashboard"],[data-view="firms"]'))setTimeout(syncVisible,90);
  },true);
  document.addEventListener('change',e=>{
    if(e.target?.id==='monthPicker')setTimeout(syncVisible,220);
  },true);
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(syncVisible,90);
  });
  window.addEventListener('pageshow',()=>setTimeout(syncVisible,90));

  [80,260,700].forEach(ms=>setTimeout(syncVisible,ms));
})();
