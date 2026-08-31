// V1.22.7 — İş Takibi adet görünürlüğü + event-driven anlık yenileme + hazır sayaçlarında quantity doğruluğu.
(function bootWorkQuantityIntegrityV227(){
  if(window.__mindsWorkQuantityIntegrityV227)return;
  if(typeof state==='undefined'||typeof monthWorks!=='function'||typeof renderWorks!=='function'||typeof workReady!=='function'){
    setTimeout(bootWorkQuantityIntegrityV227,140);return;
  }
  window.__mindsWorkQuantityIntegrityV227=true;

  const qty=w=>{const n=Number(w?.quantity??1);return Number.isFinite(n)&&n>0?Math.max(1,Math.trunc(n)):1;};
  const sumReady=(rows,type)=>rows.filter(w=>w.type===type&&workReady(w)).reduce((s,w)=>s+qty(w),0);

  try{
    counts=function(){
      const allWs=monthWorks(),ws=isAdmin()?allWs:allWs.filter(staffOwnWork),ex=monthExtras(),sh=monthShoots(),shareScope=isAdmin()?allWs:allWs;
      return {
        post:sumReady(ws,'post'),
        video:sumReady(ws,'video'),
        waiting:shareScope.filter(w=>workReady(w)&&w.share_status!=='paylasildi').reduce((s,w)=>s+qty(w),0),
        shared:ws.filter(w=>w.share_status==='paylasildi').reduce((s,w)=>s+qty(w),0),
        extras:ex.reduce((s,x)=>s+x.quantity,0),
        staffExtras:ex.filter(x=>x.source==='staff').reduce((s,x)=>s+x.quantity,0),
        shootFirms:new Set(sh.map(x=>x.firm_id)).size,
        shootVideos:sh.reduce((sum,x)=>sum+(x.video_count||0),0)
      };
    };
  }catch(_e){}

  try{
    firmMetrics=function(fid){
      const fm=currentFirmMonth(fid);if(!fm)return {post:0,video:0,shared:0,remaining:0,pq:0,vq:0};
      const ws=state.works.filter(w=>w.firm_month_id===fm.id);
      const post=sumReady(ws,'post'),video=sumReady(ws,'video');
      const shared=ws.filter(w=>w.share_status==='paylasildi').reduce((s,w)=>s+qty(w),0);
      return {post,video,shared,remaining:Math.max(0,fm.post_quota-post)+Math.max(0,fm.video_quota-video),pq:fm.post_quota,vq:fm.video_quota};
    };
  }catch(_e){}

  try{
    renderWorks=function(){
      const ws=monthWorks().filter(w=>isAdmin()||staffOwnWork(w));
      el('workRows').innerHTML=ws.map(w=>{
        const fm=state.months.find(m=>m.id===w.firm_month_id),f=fm?firm(fm.firm_id):null,q=qty(w);
        return `<tr><td>${escapeHtml(f?.name||'—')}</td><td><b>${escapeHtml(w.title)}</b><div class="muted">${q} adet</div></td><td>${typeLabel(w.type)}</td><td><span class="badge yellow">${workStatusLabel(w.status)}</span></td><td><span class="badge ${w.share_status==='paylasildi'?'green':'orange'}">${shareLabel(w.share_status)}</span></td><td>${escapeHtml(personName(w.assigned_to))}</td><td>${formatDate(w.work_date)}</td><td>${staffOwnWork(w)?`<button class="small-primary" data-edit-work="${w.id}">Güncelle</button>`:'—'}</td></tr>`;
      }).join('')||'<tr><td colspan="8" class="empty">Bu ay sana atanmış paket işi yok.</td></tr>';
    };
  }catch(_e){}

  let syncTimer=null,observer=null,observed=null;
  function syncGrouped(){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>{
      if(!document.getElementById('works')?.classList.contains('active-view'))return;
      const nav=document.querySelector('.nav-item[data-view="works"]');
      if(nav)nav.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    },90);
  }
  function watch(){
    const body=document.getElementById('workRows');if(!body||body===observed)return;
    observer?.disconnect();observed=body;
    observer=new MutationObserver(syncGrouped);
    observer.observe(body,{childList:true,subtree:true,characterData:true});
  }
  function refreshVisible(){
    try{renderStats();renderDashboardFirms();renderFirms();renderWorks();}catch(e){console.warn('Work quantity refresh',e);}
    watch();syncGrouped();
  }

  document.addEventListener('click',e=>{if(e.target.closest('[data-view="works"],[data-edit-work],#addWorkBtn,[data-action="work"]'))setTimeout(()=>{watch();syncGrouped();},180);},true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(refreshVisible,120);},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(refreshVisible,100);});

  [120,450,1100].forEach(ms=>setTimeout(refreshVisible,ms));
})();
