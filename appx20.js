// V1.13.3 — read-only personnel target vs actual summary in team drilldown
(function bootTeamTargetActualV133(){
  if(typeof state==='undefined' || typeof selectedMonth==='undefined'){
    setTimeout(bootTeamTargetActualV133,120);
    return;
  }
  if(window.__mindsTeamTargetActualV133) return;
  window.__mindsTeamTargetActualV133=true;

  let timer=null;

  function n(v){ return Number(v||0); }
  function workReadyLocal(w){
    try{ return typeof workReady==='function' ? workReady(w) : ['hazir','onaylandi'].includes(w?.status); }
    catch(_e){ return ['hazir','onaylandi'].includes(w?.status); }
  }
  function qty(list){
    try{ return typeof sumWorkQty==='function' ? sumWorkQty(list||[]) : (list||[]).reduce((s,w)=>s+n(w?.quantity||1),0); }
    catch(_e){ return (list||[]).reduce((s,w)=>s+n(w?.quantity||1),0); }
  }
  function pct(done,total){ return total>0?Math.max(0,Math.min(100,Math.round(done/total*100))):0; }
  function monthName(){ try{return typeof prettyMonth==='function'?prettyMonth(selectedMonth):selectedMonth;}catch(_e){return selectedMonth;} }

  function personTargets(pid){
    const seen=new Set();
    const firmIds=new Set();
    let post=0, video=0;
    (state.assignments||[]).forEach(a=>{
      if(a.person_id!==pid || !['tasarim','video'].includes(a.responsibility)) return;
      const key=`${a.firm_id}:${a.responsibility}`;
      if(seen.has(key)) return;
      seen.add(key); firmIds.add(a.firm_id);
      const fm=(state.months||[]).find(m=>m.firm_id===a.firm_id && m.month===selectedMonth);
      if(!fm) return;
      if(a.responsibility==='tasarim') post+=n(fm.post_quota);
      if(a.responsibility==='video') video+=n(fm.video_quota);
    });
    return {post,video,firmCount:firmIds.size};
  }

  function personActual(pid){
    const monthIds=new Set((state.months||[]).filter(m=>m.month===selectedMonth).map(m=>m.id));
    const works=(state.works||[]).filter(w=>w.assigned_to===pid && monthIds.has(w.firm_month_id));
    const readyPost=qty(works.filter(w=>w.type==='post'&&workReadyLocal(w)));
    const readyVideo=qty(works.filter(w=>w.type==='video'&&workReadyLocal(w)));
    const ongoing=qty(works.filter(w=>!workReadyLocal(w)));

    let shares=[];
    try{ shares=typeof monthShares==='function' ? monthShares().filter(s=>s.shared_by===pid) : []; }catch(_e){ shares=[]; }
    let sharedPost=0,sharedVideo=0;
    shares.forEach(s=>{
      const w=(state.works||[]).find(x=>x.id===s.work_id);
      if(w?.type==='post') sharedPost+=n(s.quantity);
      if(w?.type==='video') sharedVideo+=n(s.quantity);
    });

    const extras=(state.extras||[]).filter(x=>x.month===selectedMonth&&x.person_id===pid);
    const extraQty=extras.reduce((s,x)=>s+n(x.quantity),0);
    const shoots=(state.shoots||[]).filter(x=>x.month===selectedMonth&&x.responsible_id===pid);
    const shootVideos=shoots.reduce((s,x)=>s+n(x.video_count),0);
    return {readyPost,readyVideo,ongoing,sharedPost,sharedVideo,extraQty,shootCount:shoots.length,shootVideos};
  }

  function metric(label,value,sub='',progress=null,kind='actual'){
    const bar=progress===null?'':`<div class="team-ta-progress-v133"><i style="width:${progress}%"></i></div>`;
    return `<div class="team-ta-card-v133 ${kind==='target'?'is-target-v133':''}"><small>${label}</small><b>${value}</b>${sub?`<span>${sub}</span>`:''}${bar}</div>`;
  }

  function installStyles(){
    if(document.getElementById('teamTargetActualStyleV133')) return;
    const st=document.createElement('style');
    st.id='teamTargetActualStyleV133';
    st.textContent=`
      .team-ta-wrap-v133{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.35fr);gap:12px;margin:13px 0 15px}
      .team-ta-group-v133{border:1px solid #2d363b;border-radius:13px;padding:12px;background:linear-gradient(145deg,#10171b,#0d1317)}
      .team-ta-group-v133.target-v133{border-color:#676817;background:radial-gradient(circle at 8% 5%,rgba(235,233,60,.12),transparent 42%),linear-gradient(145deg,#17190d,#11160f);box-shadow:inset 0 0 0 1px rgba(235,233,60,.04)}
      .team-ta-title-v133{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px;padding:0 2px}
      .team-ta-title-v133 b{font-size:10px;letter-spacing:.04em;color:#d8dde0}
      .target-v133 .team-ta-title-v133 b{color:#e9e738}
      .team-ta-title-v133 span{font-size:8px;color:#7f8b91}
      .team-ta-grid-v133{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}
      .actual-v133 .team-ta-grid-v133{grid-template-columns:repeat(4,minmax(0,1fr))}
      .team-ta-card-v133{min-height:72px;border:1px solid #263036;border-radius:10px;padding:10px;background:#11181c;display:flex;flex-direction:column;justify-content:center}
      .team-ta-card-v133.is-target-v133{border-color:#5f6014;background:linear-gradient(145deg,rgba(235,233,60,.105),rgba(31,33,9,.2))}
      .team-ta-card-v133 small{display:block;color:#8c989e;font-size:8px;line-height:1.25;margin-bottom:5px}
      .team-ta-card-v133.is-target-v133 small{color:#d2d338}
      .team-ta-card-v133 b{font-size:18px;line-height:1;color:#f2f5f6}
      .team-ta-card-v133.is-target-v133 b{color:#eeee41}
      .team-ta-card-v133 span{font-size:7px;color:#77848a;margin-top:5px;line-height:1.25}
      .team-ta-card-v133.is-target-v133 span{color:#a9aa45}
      .team-ta-progress-v133{height:3px;background:#272e22;border-radius:99px;overflow:hidden;margin-top:7px}.team-ta-progress-v133 i{display:block;height:100%;background:#dfdf32;border-radius:99px}
      @media(max-width:1250px){.team-ta-wrap-v133{grid-template-columns:1fr}.team-ta-grid-v133,.actual-v133 .team-ta-grid-v133{grid-template-columns:repeat(4,minmax(0,1fr))}}
      @media(max-width:850px){.team-ta-grid-v133,.actual-v133 .team-ta-grid-v133{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(st);
  }

  function apply(){
    const panel=document.getElementById('teamPersonDetailV121');
    if(!panel || panel.style.display==='none' || !panel.innerHTML) return;
    const selected=document.querySelector('#teamPulsePanel .team-pulse-card.selected-person-v121');
    const pid=selected?.dataset?.personId;
    if(!pid) return;
    const oldStats=panel.querySelector('.person-detail-stats-v121');
    if(!oldStats) return;

    const t=personTargets(pid), a=personActual(pid);
    const postRemain=Math.max(0,t.post-a.readyPost), videoRemain=Math.max(0,t.video-a.readyVideo);
    const sig=[pid,selectedMonth,t.post,t.video,a.readyPost,a.readyVideo,a.ongoing,a.sharedPost,a.sharedVideo,a.extraQty,a.shootCount,a.shootVideos].join('|');
    let wrap=panel.querySelector('#teamTargetActualV133');
    if(wrap?.dataset.sig===sig){ oldStats.style.display='none'; return; }
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='teamTargetActualV133';
      wrap.className='team-ta-wrap-v133';
      oldStats.insertAdjacentElement('beforebegin',wrap);
    }
    wrap.dataset.sig=sig;
    wrap.innerHTML=`
      <section class="team-ta-group-v133 target-v133">
        <div class="team-ta-title-v133"><b>HEDEF (HAZIRLAMASI GEREKEN)</b><span>${monthName()}</span></div>
        <div class="team-ta-grid-v133">
          ${metric('Sorumlu Firma',t.firmCount,'Üretim sorumluluğu',null,'target')}
          ${metric('Toplam Post',t.post,'Post hedefi',null,'target')}
          ${metric('Toplam Video',t.video,'Video hedefi',null,'target')}
          ${metric('Kalan Post',postRemain,`${a.readyPost} / ${t.post} hazır`,pct(a.readyPost,t.post),'target')}
          ${metric('Kalan Video',videoRemain,`${a.readyVideo} / ${t.video} hazır`,pct(a.readyVideo,t.video),'target')}
        </div>
      </section>
      <section class="team-ta-group-v133 actual-v133">
        <div class="team-ta-title-v133"><b>GERÇEKLEŞEN (HAZIRLADIĞI)</b><span>${monthName()}</span></div>
        <div class="team-ta-grid-v133">
          ${metric('Hazırladığı Post',a.readyPost,t.post?`%${pct(a.readyPost,t.post)} tamamlandı`:'Hedef yok',pct(a.readyPost,t.post))}
          ${metric('Hazırladığı Video',a.readyVideo,t.video?`%${pct(a.readyVideo,t.video)} tamamlandı`:'Hedef yok',pct(a.readyVideo,t.video))}
          ${metric('Devam / Bekleyen',a.ongoing,'Aktif iş')}
          ${metric('Paylaştığı Post',a.sharedPost,'Gerçek paylaşım')}
          ${metric('Paylaştığı Video',a.sharedVideo,'Gerçek paylaşım')}
          ${metric('Ekstra İş',a.extraQty,'Paket dışı katkı')}
          ${metric('Çekim',a.shootCount,`${a.shootVideos} video içeriği`)}
        </div>
      </section>`;
    oldStats.style.display='none';
  }

  function schedule(){ clearTimeout(timer); timer=setTimeout(apply,55); }
  installStyles();
  const obs=new MutationObserver(schedule);
  obs.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('change',e=>{ if(e.target?.id==='monthPicker') setTimeout(apply,100); });
  setTimeout(apply,250);
})();