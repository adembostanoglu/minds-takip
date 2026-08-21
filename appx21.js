// V1.13.4 — resilient data bootstrap/recovery. Prevent one stalled query from blanking the app.
(function bootResilientDataV134(){
  if(typeof sb==='undefined' || typeof state==='undefined'){
    setTimeout(bootResilientDataV134,100);
    return;
  }
  if(window.__mindsResilientDataV134) return;
  window.__mindsResilientDataV134=true;

  const specs=[
    ['profiles',()=>sb.from('profiles').select('*').order('created_at')],
    ['firms',()=>sb.from('firms').select('*').order('list_order_at')],
    ['months',()=>sb.from('firm_months').select('*').order('month',{ascending:false})],
    ['works',()=>sb.from('works').select('*').order('created_at',{ascending:false})],
    ['extras',()=>sb.from('extra_works').select('*').order('created_at',{ascending:false})],
    ['shoots',()=>sb.from('shoots').select('*').order('shoot_date',{ascending:false})],
    ['activity',()=>sb.from('activity_log').select('*').order('created_at',{ascending:false}).limit(200)],
    ['assignments',()=>sb.from('firm_assignments').select('*')]
  ];

  function withTimeout(p,ms=7000){
    return Promise.race([
      Promise.resolve(p),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))
    ]);
  }

  async function resilientLoad({silent=false}={}){
    if(!profile) return false;
    const failures=[];
    await Promise.all(specs.map(async([key,make])=>{
      try{
        const r=await withTimeout(make(),7000);
        if(r?.error) throw r.error;
        state[key]=r?.data||[];
      }catch(e){
        failures.push(`${key}: ${e?.message||e}`);
        console.error('[Mind’s recovery]',key,e);
      }
    }));

    try{ renderAll(); }
    catch(e){
      failures.push(`render: ${e?.message||e}`);
      console.error('[Mind’s recovery] render',e);
    }

    if(failures.length && !silent){
      try{ toast('Veri yükleme sorunu: '+failures.join(' | '),true); }catch(_e){}
    }
    return failures.length===0;
  }

  // Replace the fragile Promise.all loader for all future reloads.
  window.loadData=resilientLoad;
  try{ loadData=resilientLoad; }catch(_e){}

  // Existing startApp may already be waiting on the old loader. Force a clean recovery shortly after profile is ready.
  let attempts=0;
  const t=setInterval(async()=>{
    attempts++;
    if(profile){
      clearInterval(t);
      await resilientLoad({silent:false});
      try{ if(typeof subscribeRealtime==='function') subscribeRealtime(); }catch(_e){}
    }else if(attempts>50){ clearInterval(t); }
  },120);
})();
