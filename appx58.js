// V1.20.3 — Uzun açık oturum stabilitesi: hızlı dekorasyon döngülerini yavaşlatır, gizli sekmede durdurur, veri yenilemelerini tekilleştirir ve oturumu tazeler.
(function bootLongSessionStabilityV203(){
  if(window.__mindsLongSessionStabilityV203)return;
  window.__mindsLongSessionStabilityV203=true;

  const nativeSetInterval=window.setInterval.bind(window);
  const nativeClearInterval=window.clearInterval.bind(window);
  window.__mindsNativeSetIntervalV203=nativeSetInterval;
  window.__mindsNativeClearIntervalV203=nativeClearInterval;

  // Sonradan yüklenen görünüm/dekorasyon modüllerinin 650–1200 ms arası sürekli DOM taramasını azalt.
  // Sekme arka plandaysa bu dekorasyon döngüleri tamamen pas geçilir.
  window.setInterval=function(handler,delay,...args){
    const requested=Number(delay)||0;
    const effective=requested>0&&requested<2000?2600:requested;
    if(typeof handler!=='function')return nativeSetInterval(handler,effective,...args);
    return nativeSetInterval(function(){
      if(document.hidden)return;
      try{return handler.apply(window,args);}catch(err){console.error('[Stability interval]',err);}
    },effective);
  };

  let reloadInFlight=null;
  let queuedReloadArgs=null;
  let flushTimer=null;
  let lastWakeSync=0;
  let sessionBusy=false;
  let wasOffline=!navigator.onLine;

  function modalIsBeingEdited(){
    const modal=document.getElementById('modal');
    if(!modal||modal.classList.contains('hidden'))return false;
    const active=document.activeElement;
    return !!(active&&modal.contains(active)&&active.matches('input,textarea,select,[contenteditable="true"]'));
  }

  function scheduleQueuedReload(){
    if(flushTimer)return;
    flushTimer=setTimeout(function tick(){
      flushTimer=null;
      if(!queuedReloadArgs||modalIsBeingEdited()){
        if(queuedReloadArgs)scheduleQueuedReload();
        return;
      }
      const args=queuedReloadArgs;queuedReloadArgs=null;
      try{window.loadData?.(...args);}catch(e){console.warn('[Stability reload flush]',e);}
    },450);
  }

  function wrapLoadData(){
    const current=window.loadData;
    if(typeof current!=='function'||current.__mindsStabilityWrapped)return;
    const original=current;
    const wrapped=function(...args){
      if(modalIsBeingEdited()){
        queuedReloadArgs=args;
        scheduleQueuedReload();
        return reloadInFlight||Promise.resolve(false);
      }
      if(reloadInFlight){
        queuedReloadArgs=args;
        return reloadInFlight;
      }
      reloadInFlight=Promise.resolve().then(()=>original.apply(this,args)).catch(err=>{
        console.error('[Stability loadData]',err);
        throw err;
      }).finally(()=>{
        reloadInFlight=null;
        if(queuedReloadArgs)scheduleQueuedReload();
      });
      return reloadInFlight;
    };
    wrapped.__mindsStabilityWrapped=true;
    wrapped.__mindsOriginal=original;
    window.loadData=wrapped;
  }

  async function ensureFreshSession(){
    if(sessionBusy||!navigator.onLine||!window.sb?.auth)return false;
    sessionBusy=true;
    try{
      const {data,error}=await sb.auth.getSession();
      if(error)throw error;
      const sess=data?.session;
      if(!sess)return false;
      const expiresAt=Number(sess.expires_at||0)*1000;
      if(expiresAt&&expiresAt-Date.now()<12*60*1000){
        const r=await sb.auth.refreshSession();
        if(r.error)throw r.error;
      }
      return true;
    }catch(e){
      console.warn('[Stability session]',e);
      return false;
    }finally{sessionBusy=false;}
  }

  async function wakeSync(force=false){
    if(document.hidden||!navigator.onLine)return;
    wrapLoadData();
    await ensureFreshSession();
    const now=Date.now();
    if(!force&&now-lastWakeSync<180000)return;
    if(modalIsBeingEdited())return;
    lastWakeSync=now;
    try{await window.loadData?.({silent:true});}catch(e){console.warn('[Stability wake sync]',e);}
  }

  // İnternet yokken form submit edilirse mevcut girilen metni koru; başarısız kayıt denemesine izin verme.
  document.addEventListener('submit',e=>{
    if(navigator.onLine)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(typeof toast==='function')toast('İnternet bağlantısı yok. Girdiğin bilgiler ekranda duruyor; bağlantı gelince tekrar Kaydet.',true);
  },true);

  window.addEventListener('offline',()=>{
    wasOffline=true;
    if(typeof toast==='function')toast('Bağlantı koptu. Açık formu kapatma; bağlantı gelince tekrar kaydedebilirsin.',true);
  });

  window.addEventListener('online',()=>{
    const notify=wasOffline;wasOffline=false;
    wakeSync(true).finally(()=>{if(notify&&typeof toast==='function')toast('Bağlantı yeniden kuruldu. Veriler eşitlendi.');});
  });

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)wakeSync(false);
  });
  window.addEventListener('pageshow',()=>wakeSync(false));
  window.addEventListener('focus',()=>wakeSync(false));

  wrapLoadData();
  setTimeout(wrapLoadData,250);
  setTimeout(()=>wakeSync(false),900);

  // Bu heartbeat native timer kullanır; dekorasyon timer throttle'ından etkilenmez.
  nativeSetInterval(()=>{if(!document.hidden)ensureFreshSession();},8*60*1000);
})();
