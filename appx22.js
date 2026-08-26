// V1.13.5.1 — single-RPC role-aware bootstrap loader + content shares
(function bootSingleRpcV135(){
  if(typeof sb==='undefined' || typeof state==='undefined'){
    setTimeout(bootSingleRpcV135,100);
    return;
  }
  if(window.__mindsSingleRpcV135) return;
  window.__mindsSingleRpcV135=true;

  function banner(message,bad=true){
    let n=document.getElementById('bootstrapStatusV135');
    if(!n){
      n=document.createElement('div');
      n.id='bootstrapStatusV135';
      n.className='info-banner';
      n.style.margin='0 0 12px';
      const top=document.querySelector('.topbar');
      if(top) top.insertAdjacentElement('afterend',n);
    }
    n.style.borderColor=bad?'#7b3434':'#385d42';
    n.style.color=bad?'#ffb6b2':'#bde7c7';
    n.textContent=message;
    n.style.display='block';
  }

  function hideBanner(){
    const n=document.getElementById('bootstrapStatusV135');
    if(n) n.style.display='none';
  }

  async function bootstrapLoad({silent=false}={}){
    if(!profile) return false;
    try{
      const {data,error}=await sb.rpc('app_bootstrap_v135');
      if(error) throw error;
      if(!data || typeof data!=='object') throw new Error('Bootstrap verisi boş döndü.');

      const keys=['profiles','firms','months','works','shares','extras','shoots','activity','assignments'];
      keys.forEach(k=>{ state[k]=Array.isArray(data[k])?data[k]:[]; });

      if(typeof renderAll==='function') renderAll();
      if(typeof applyRoleUI==='function') applyRoleUI();

      if(state.firms.length){
        hideBanner();
      }else if(!silent){
        banner('Veri bağlantısı açık ancak firma listesi boş döndü. Yöneticiye bildir.',true);
      }
      return true;
    }catch(e){
      console.error('[Mind’s V1.13.5 bootstrap]',e);
      if(!silent) banner('Veri yüklenemedi: '+(e?.message||e),true);
      return false;
    }
  }

  // Replace all future reloads with the stable single-RPC bootstrap.
  try{ loadData=bootstrapLoad; }catch(_e){}
  window.loadData=bootstrapLoad;

  let tries=0;
  const timer=setInterval(async()=>{
    tries++;
    if(profile){
      clearInterval(timer);
      await bootstrapLoad({silent:false});
      // Run once more after legacy startup promises settle, so stale/empty results cannot win a race.
      setTimeout(()=>bootstrapLoad({silent:true}),1200);
      setTimeout(()=>bootstrapLoad({silent:true}),3500);
      try{ if(typeof subscribeRealtime==='function') subscribeRealtime(); }catch(_e){}
    }else if(tries>80){
      clearInterval(timer);
      banner('Oturum profili yüklenemedi. Çıkış yapıp tekrar giriş yap.',true);
    }
  },100);
})();