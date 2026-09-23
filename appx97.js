// V1.27.1 — Hızlı Paylaşım Masası
// Mevcut paylaşım akışını değiştirmez; yalnızca tek tık / toplu kayıt arayüzü ekler.
(function bootQuickShareDeskV271(){
  if(window.__mindsQuickShareDeskV271)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||
     typeof monthWorks!=='function'||typeof workReady!=='function'||
     typeof remainingToShare!=='function'||typeof canShareWork!=='function'){
    setTimeout(bootQuickShareDeskV271,120);return;
  }
  window.__mindsQuickShareDeskV271=true;

  const selected=new Set();
  let busy=false;
  let filter='all';
  let search='';
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const workFirm=w=>typeof firm==='function'?firm(workFirmId(w)):null;
  const typeText=w=>w.type==='video'?'Video':'Post';

  function todayTR(){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const x=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    return `${x.year}-${x.month}-${x.day}`;
  }
  function monthKey(){
    return String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  }
  function quickDate(){
    const t=todayTR();
    if(t.slice(0,7)===monthKey())return t;
    if(typeof defaultDateForSelectedMonth==='function')return defaultDateForSelectedMonth();
    return monthKey()+'-01';
  }

  function eligibleWorks(){
    return monthWorks()
      .filter(w=>workReady(w)&&remainingToShare(w)>0&&canShareWork(w))
      .sort((a,b)=>{
        const fa=workFirm(a)?.name||'',fb=workFirm(b)?.name||'';
        return fa.localeCompare(fb,'tr')||String(a.type).localeCompare(String(b.type));
      });
  }

  function visibleWorks(){
    return eligibleWorks().filter(w=>{
      if(filter!=='all'&&w.type!==filter)return false;
      if(!search)return true;
      const f=workFirm(w);
      const hay=`${f?.name||''} ${w.title||''} ${typeText(w)}`.toLocaleLowerCase('tr-TR');
      return hay.includes(search.toLocaleLowerCase('tr-TR'));
    });
  }

  function installStyle(){
    if(document.getElementById('quickShareDeskV271Style'))return;
    const s=document.createElement('style');s.id='quickShareDeskV271Style';
    s.textContent=`
      .quick-share-v271{margin:0 0 16px;border:1px solid #30393f;border-radius:14px;background:#0f1519;overflow:hidden}
      .qs-head-v271{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 15px;border-bottom:1px solid #283138;background:linear-gradient(180deg,#151c20,#11171b)}
      .qs-head-v271 h3{margin:0;font-size:15px}.qs-head-v271 p{margin:4px 0 0;color:#87939a;font-size:9px}
      .qs-head-actions-v271{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
      .qs-head-actions-v271 select,.qs-search-v271{background:#11181c;border:1px solid #344047;color:#eef1f2;border-radius:8px;padding:8px 9px;font-size:9px}
      .qs-toolbar-v271{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 15px;border-bottom:1px solid #252e34}
      .qs-tab-v271{border:1px solid #354047;background:#151c20;color:#aeb8bd;border-radius:8px;padding:7px 10px;font-size:9px;font-weight:800;cursor:pointer}
      .qs-tab-v271.active{border-color:#777018;background:#29280e;color:#efe82b}
      .qs-count-v271{margin-left:auto;color:#8d989e;font-size:9px}
      .qs-list-v271{display:grid}
      .qs-row-v271{display:grid;grid-template-columns:32px minmax(180px,1.4fr) 90px 120px minmax(245px,auto);gap:10px;align-items:center;padding:11px 15px;border-bottom:1px solid #222b30}
      .qs-row-v271:last-child{border-bottom:0}.qs-row-v271:hover{background:#121a1e}
      .qs-row-v271.selected{background:#17180d;box-shadow:inset 3px 0 #e4dc2d}
      .qs-check-v271{width:17px;height:17px;accent-color:#e6df2d}
      .qs-firm-v271 b{display:block;font-size:10px;color:#eef1f2}.qs-firm-v271 span{display:block;margin-top:3px;color:#7e8a90;font-size:8px}
      .qs-type-v271{font-size:9px;font-weight:800}.qs-progress-v271 b{display:block;font-size:11px}.qs-progress-v271 span{font-size:8px;color:#89949a}
      .qs-actions-v271{display:flex;justify-content:flex-end;gap:5px;flex-wrap:wrap}
      .qs-actions-v271 button{font-size:8px!important;padding:6px 8px!important;white-space:nowrap}
      .qs-plus-v271{border-color:#50601d!important;background:#25290f!important;color:#e8e653!important}
      .qs-all-v271{border-color:#356844!important;background:#17331e!important;color:#91d09c!important}
      .qs-bulk-v271{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 15px;background:#12191d;border-top:1px solid #2b3439}
      .qs-bulk-v271 span{font-size:9px;color:#a4afb4}.qs-bulk-v271 b{color:#ece62f}
      .qs-empty-v271{padding:24px;text-align:center;color:#77858c;font-size:10px}
      .qs-flash-v271{animation:qsFlashV271 .7s ease}@keyframes qsFlashV271{0%{background:#29442c}100%{background:transparent}}
      @media(max-width:900px){.qs-row-v271{grid-template-columns:28px 1fr 75px}.qs-progress-v271{grid-column:2}.qs-actions-v271{grid-column:2/4;justify-content:flex-start}.qs-head-v271{align-items:flex-start;flex-direction:column}.qs-head-actions-v271{width:100%}.qs-search-v271{flex:1;min-width:140px}.qs-count-v271{margin-left:0}}
    `;
    document.head.appendChild(s);
  }

  function host(){
    const sec=document.getElementById('shares'),cards=document.getElementById('shareCards');
    if(!sec||!cards)return null;
    let h=document.getElementById('quickShareDeskV271');
    if(!h){
      h=document.createElement('section');
      h.id='quickShareDeskV271';h.className='quick-share-v271';
      cards.parentNode.insertBefore(h,cards);
    }
    return h;
  }

  function isAllowed(){
    return typeof isAdmin==='function'&&isAdmin() || (typeof isSocialMediaStaff==='function'&&isSocialMediaStaff());
  }

  function cleanSelection(){
    const ids=new Set(eligibleWorks().map(w=>String(w.id)));
    [...selected].forEach(id=>{if(!ids.has(String(id)))selected.delete(id);});
  }

  function render(){
    const h=host();if(!h)return;
    installStyle();
    if(!isAllowed()){h.style.display='none';return;}
    h.style.display='';
    cleanSelection();
    const rows=visibleWorks();
    const totalWaiting=eligibleWorks().reduce((n,w)=>n+remainingToShare(w),0);
    const platform=document.getElementById('qsPlatformV271')?.value||'instagram';
    h.innerHTML=`
      <div class="qs-head-v271">
        <div><h3>⚡ Hızlı Paylaşım Masası</h3><p>Form açmadan paylaşımı kaydet. Kayıt otomatik olarak senin adına ve seçilen tarihe işlenir.</p></div>
        <div class="qs-head-actions-v271">
          <input id="qsSearchV271" class="qs-search-v271" placeholder="Firma / içerik ara" value="${esc(search)}">
          <select id="qsPlatformV271">
            ${['instagram','facebook','tiktok','youtube','linkedin','diger'].map(p=>`<option value="${p}" ${platform===p?'selected':''}>${typeof platformLabel==='function'?platformLabel(p):p}</option>`).join('')}
          </select>
          <input id="qsDateV271" class="qs-search-v271" type="date" value="${quickDate()}">
        </div>
      </div>
      <div class="qs-toolbar-v271">
        <button class="qs-tab-v271 ${filter==='all'?'active':''}" data-qs-filter-v271="all">Tümü</button>
        <button class="qs-tab-v271 ${filter==='post'?'active':''}" data-qs-filter-v271="post">Postlar</button>
        <button class="qs-tab-v271 ${filter==='video'?'active':''}" data-qs-filter-v271="video">Videolar</button>
        <button class="qs-tab-v271" data-qs-select-visible-v271="1">Görünenleri Seç</button>
        <button class="qs-tab-v271" data-qs-clear-v271="1">Seçimi Temizle</button>
        <span class="qs-count-v271"><b>${totalWaiting}</b> içerik paylaşım bekliyor</span>
      </div>
      <div class="qs-list-v271">
        ${rows.length?rows.map(w=>{
          const f=workFirm(w),total=typeof workQty==='function'?workQty(w):Number(w.quantity||1),done=typeof sharedQty==='function'?sharedQty(w):0,left=remainingToShare(w),checked=selected.has(String(w.id));
          return `<div class="qs-row-v271 ${checked?'selected':''}" data-qs-row-v271="${w.id}">
            <input class="qs-check-v271" type="checkbox" data-qs-check-v271="${w.id}" ${checked?'checked':''}>
            <div class="qs-firm-v271"><b>${esc(f?.name||'—')}</b><span>${esc(w.title||typeText(w))} · Hazırlayan: ${esc(typeof personName==='function'?personName(w.assigned_to):'—')}</span></div>
            <div class="qs-type-v271"><span class="badge ${w.type==='video'?'blue':'yellow'}">${typeText(w)}</span></div>
            <div class="qs-progress-v271"><b>${done}/${total}</b><span>${left} kaldı</span></div>
            <div class="qs-actions-v271">
              <button class="ghost qs-plus-v271" data-qs-add-v271="${w.id}" data-qty="1">+1 Paylaşıldı</button>
              ${left>=2?`<button class="ghost qs-plus-v271" data-qs-add-v271="${w.id}" data-qty="2">+2</button>`:''}
              <button class="ghost qs-all-v271" data-qs-add-v271="${w.id}" data-qty="${left}">Tümü (${left})</button>
            </div>
          </div>`;
        }).join(''):'<div class="qs-empty-v271">Bu filtrede paylaşım bekleyen hazır içerik yok.</div>'}
      </div>
      <div class="qs-bulk-v271">
        <span><b>${selected.size}</b> içerik seçili · Toplu işlem her seçili içerikten <b>1 adet</b> paylaşır.</span>
        <button class="primary" data-qs-bulk-v271="1" ${selected.size?'':'disabled'}>✓ Seçilenleri Paylaşıldı Yap (${selected.size})</button>
      </div>`;
  }

  function settings(){
    const platform=document.getElementById('qsPlatformV271')?.value||'instagram';
    const date=document.getElementById('qsDateV271')?.value||quickDate();
    return {platform,date};
  }

  function validateDate(date){
    if(!date||date.slice(0,7)!==monthKey())throw new Error('Paylaşım tarihi seçili ay içinde olmalı.');
  }

  async function insertShares(items){
    if(busy||!items.length)return;
    busy=true;
    try{
      const {platform,date}=settings();validateDate(date);
      const payload=[];
      for(const item of items){
        const w=state.works.find(x=>String(x.id)===String(item.workId));
        if(!w||!workReady(w)||!canShareWork(w))continue;
        const left=remainingToShare(w);
        const qty=Math.max(0,Math.min(left,Number(item.qty||1)));
        if(!qty)continue;
        payload.push({work_id:w.id,quantity:qty,platform,share_date:date,shared_by:profile.id,created_by:profile.id,notes:null});
      }
      if(!payload.length)throw new Error('Paylaşılabilecek içerik bulunamadı.');
      const {error}=await sb.from('content_shares').insert(payload);
      if(error)throw error;
      selected.clear();
      if(typeof loadData==='function')await loadData({silent:true});
      if(typeof toast==='function')toast(payload.length===1?'Paylaşım kaydedildi.':payload.length+' paylaşım tek seferde kaydedildi.');
      setTimeout(render,80);
    }catch(e){
      console.error('Hızlı paylaşım',e);
      const msg=typeof friendlyError==='function'?friendlyError(e):(e.message||String(e));
      if(typeof toast==='function')toast(msg,true);
    }finally{busy=false;}
  }

  document.addEventListener('click',e=>{
    const nav=e.target.closest('.nav-item[data-view="shares"]');
    if(nav)setTimeout(render,180);

    const f=e.target.closest('[data-qs-filter-v271]');
    if(f){filter=f.dataset.qsFilterV271;render();return;}

    if(e.target.closest('[data-qs-select-visible-v271]')){
      visibleWorks().forEach(w=>selected.add(String(w.id)));render();return;
    }
    if(e.target.closest('[data-qs-clear-v271]')){selected.clear();render();return;}

    const add=e.target.closest('[data-qs-add-v271]');
    if(add){
      e.preventDefault();
      insertShares([{workId:add.dataset.qsAddV271,qty:Number(add.dataset.qty||1)}]);
      return;
    }
    const bulk=e.target.closest('[data-qs-bulk-v271]');
    if(bulk){
      e.preventDefault();
      insertShares([...selected].map(workId=>({workId,qty:1})));
    }
  },true);

  document.addEventListener('change',e=>{
    const c=e.target.closest('[data-qs-check-v271]');
    if(c){
      const id=String(c.dataset.qsCheckV271);
      if(c.checked)selected.add(id);else selected.delete(id);
      render();return;
    }
    if(e.target?.id==='monthPicker'){selected.clear();setTimeout(render,180);}
  },true);

  document.addEventListener('input',e=>{
    if(e.target?.id==='qsSearchV271'){
      search=e.target.value||'';
      const pos=e.target.selectionStart;
      render();
      setTimeout(()=>{const n=document.getElementById('qsSearchV271');if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(_e){}}},0);
    }
  },true);

  // Mevcut render fonksiyonlarına dokunmadan, onların sonrasında paneli yenile.
  const observer=new MutationObserver(()=>{
    if(document.getElementById('shares')?.classList.contains('active-view')){
      clearTimeout(window.__qsV271Timer);
      window.__qsV271Timer=setTimeout(render,120);
    }
  });
  const shares=document.getElementById('shares');
  if(shares)observer.observe(shares,{childList:true,subtree:true});

  installStyle();
  setTimeout(render,700);
})();