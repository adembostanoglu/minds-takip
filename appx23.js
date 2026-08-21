// V1.13.6 — safe event-driven personnel target vs actual summary (no MutationObserver)
(function bootTeamTargetActualV136(){
  if(typeof state==='undefined' || typeof selectedMonth==='undefined'){
    setTimeout(bootTeamTargetActualV136,120);
    return;
  }
  if(window.__mindsTeamTargetActualV136) return;
  window.__mindsTeamTargetActualV136=true;

  function n(v){ return Number(v||0); }
  function qty(list){
    try{return typeof sumWorkQty==='function'?sumWorkQty(list||[]):(list||[]).reduce((s,w)=>s+n(w?.quantity||1),0);}
    catch(_e){return (list||[]).reduce((s,w)=>s+n(w?.quantity||1),0);}
  }
  function ready(w){
    try{return typeof workReady==='function'?workReady(w):['hazir','onaylandi'].includes(w?.status);}
    catch(_e){return ['hazir','onaylandi'].includes(w?.status);}
  }
  function pct(done,total){ return total>0?Math.max(0,Math.min(100,Math.round(done/total*100))):0; }
  function pretty(){ try{return typeof prettyMonth==='function'?prettyMonth(selectedMonth):selectedMonth;}catch(_e){return selectedMonth;} }

  function targets(pid){
    const seen=new Set(), firms=new Set();
    let post=0,video=0;
    (state.assignments||[]).forEach(a=>{
      if(a.person_id!==pid || !['tasarim','video'].includes(a.responsibility)) return;
      const key=`${a.firm_id}:${a.responsibility}`;
      if(seen.has(key)) return;
      seen.add(key);
      const f=(state.firms||[]).find(x=>x.id===a.firm_id);
      if(f?.active) firms.add(a.firm_id);
      const fm=(state.months||[]).find(m=>m.firm_id===a.firm_id && m.month===selectedMonth);
      if(!fm) return;
      if(a.responsibility==='tasarim') post+=n(fm.post_quota);
      if(a.responsibility==='video') video+=n(fm.video_quota);
    });
    return {post,video,firmCount:firms.size};
  }

  function actual(pid){
    const mids=new Set((state.months||[]).filter(m=>m.month===selectedMonth).map(m=>m.id));
    const works=(state.works||[]).filter(w=>w.assigned_to===pid && mids.has(w.firm_month_id));
    const readyPost=qty(works.filter(w=>w.type==='post'&&ready(w)));
    const readyVideo=qty(works.filter(w=>w.type==='video'&&ready(w)));
    const ongoing=qty(works.filter(w=>!ready(w)));
    let shares=[];
    try{ shares=typeof monthShares==='function'?monthShares().filter(s=>s.shared_by===pid):[]; }catch(_e){}
    let sharedPost=0,sharedVideo=0;
    shares.forEach(s=>{
      const w=(state.works||[]).find(x=>x.id===s.work_id);
      if(w?.type==='post') sharedPost+=n(s.quantity);
      if(w?.type==='video') sharedVideo+=n(s.quantity);
    });
    const extras=(state.extras||[]).filter(x=>x.month===selectedMonth&&x.person_id===pid);
    const extra=extras.reduce((s,x)=>s+n(x.quantity),0);
    const shoots=(state.shoots||[]).filter(x=>x.month===selectedMonth&&x.responsible_id===pid);
    const shootVideos=shoots.reduce((s,x)=>s+n(x.video_count),0);
    return {readyPost,readyVideo,ongoing,sharedPost,sharedVideo,extra,shoots:shoots.length,shootVideos};
  }

  function card(label,value,sub='',progress=null,target=false){
    return `<div class="ta-card-v136${target?' target-card-v136':''}"><small>${label}</small><b>${value}</b>${sub?`<span>${sub}</span>`:''}${progress===null?'':`<div class="ta-progress-v136"><i style="width:${progress}%"></i></div>`}</div>`;
  }

  function installStyle(){
    if(document.getElementById('teamTargetActualStyleV136')) return;
    const s=document.createElement('style'); s.id='teamTargetActualStyleV136';
    s.textContent=`
      .ta-wrap-v136{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.38fr);gap:12px;margin:13px 0 15px}
      .ta-group-v136{border:1px solid #2b353a;border-radius:14px;padding:12px;background:linear-gradient(145deg,#10171b,#0d1317)}
      .ta-group-v136.target-group-v136{border-color:#777513;background:radial-gradient(circle at 7% 6%,rgba(235,233,60,.13),transparent 45%),linear-gradient(145deg,#191a0c,#11160f);box-shadow:inset 0 0 0 1px rgba(235,233,60,.04)}
      .ta-head-v136{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 1px 10px}.ta-head-v136 b{font-size:10px;letter-spacing:.045em}.target-group-v136 .ta-head-v136 b{color:#eeec3d}.ta-head-v136 span{font-size:8px;color:#7e8a90}
      .ta-grid-v136{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}.actual-group-v136 .ta-grid-v136{grid-template-columns:repeat(4,minmax(0,1fr))}
      .ta-card-v136{min-height:74px;border:1px solid #273137;border-radius:10px;padding:10px;background:#11181c;display:flex;flex-direction:column;justify-content:center}.target-card-v136{border-color:#626316;background:linear-gradient(145deg,rgba(235,233,60,.11),rgba(29,31,8,.24))}
      .ta-card-v136 small{font-size:8px;color:#8d999f;margin-bottom:6px;line-height:1.25}.target-card-v136 small{color:#d5d53a}.ta-card-v136 b{font-size:19px;line-height:1;color:#f4f6f7}.target-card-v136 b{color:#f0ee42}.ta-card-v136 span{font-size:7px;color:#77848a;margin-top:5px;line-height:1.3}.target-card-v136 span{color:#a7a945}
      .ta-progress-v136{height:3px;background:#272f24;border-radius:99px;overflow:hidden;margin-top:7px}.ta-progress-v136 i{display:block;height:100%;border-radius:99px;background:#e4e33a}
      @media(max-width:1250px){.ta-wrap-v136{grid-template-columns:1fr}.ta-grid-v136,.actual-group-v136 .ta-grid-v136{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:850px){.ta-grid-v136,.actual-group-v136 .ta-grid-v136{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `; document.head.appendChild(s);
  }

  function enhance(){
    const panel=document.getElementById('teamPersonDetailV121');
    if(!panel || panel.style.display==='none' || !panel.innerHTML) return;
    const selected=document.querySelector('#teamPulsePanel .team-pulse-card.selected-person-v121');
    const pid=selected?.dataset?.personId; if(!pid) return;
    const old=panel.querySelector('.person-detail-stats-v121'); if(!old) return;
    const t=targets(pid),a=actual(pid);
    const remainingPost=Math.max(0,t.post-a.readyPost), remainingVideo=Math.max(0,t.video-a.readyVideo);
    let wrap=panel.querySelector('#teamTargetActualV136');
    if(!wrap){wrap=document.createElement('div');wrap.id='teamTargetActualV136';wrap.className='ta-wrap-v136';old.insertAdjacentElement('beforebegin',wrap);}
    wrap.innerHTML=`
      <section class="ta-group-v136 target-group-v136"><div class="ta-head-v136"><b>HEDEF (HAZIRLAMASI GEREKEN)</b><span>${pretty()}</span></div><div class="ta-grid-v136">
        ${card('Sorumlu Firma',t.firmCount,'Üretim sorumluluğu',null,true)}
        ${card('Toplam Post',t.post,'Hazırlaması gereken',null,true)}
        ${card('Toplam Video',t.video,'Hazırlaması gereken',null,true)}
        ${card('Kalan Post',remainingPost,`${a.readyPost} / ${t.post} hazır`,pct(a.readyPost,t.post),true)}
        ${card('Kalan Video',remainingVideo,`${a.readyVideo} / ${t.video} hazır`,pct(a.readyVideo,t.video),true)}
      </div></section>
      <section class="ta-group-v136 actual-group-v136"><div class="ta-head-v136"><b>GERÇEKLEŞEN (HAZIRLADIĞI)</b><span>${pretty()}</span></div><div class="ta-grid-v136">
        ${card('Hazırladığı Post',a.readyPost,t.post?`%${pct(a.readyPost,t.post)} tamamlandı`:'Post hedefi yok',pct(a.readyPost,t.post))}
        ${card('Hazırladığı Video',a.readyVideo,t.video?`%${pct(a.readyVideo,t.video)} tamamlandı`:'Video hedefi yok',pct(a.readyVideo,t.video))}
        ${card('Devam / Bekleyen',a.ongoing,'Aktif üretim')}
        ${card('Paylaştığı Post',a.sharedPost,'Gerçek paylaşım')}
        ${card('Paylaştığı Video',a.sharedVideo,'Gerçek paylaşım')}
        ${card('Ekstra İş',a.extra,'Paket dışı katkı')}
        ${card('Çekim',a.shoots,`${a.shootVideos} video içeriği`)}
      </div></section>`;
    old.style.display='none';
  }

  installStyle();
  document.addEventListener('click',e=>{if(e.target.closest('#teamPulsePanel .team-pulse-card')) setTimeout(enhance,0);});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest?.('#teamPulsePanel .team-pulse-card')) setTimeout(enhance,0);});
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker') setTimeout(enhance,120);});
  setTimeout(enhance,300);
})();
