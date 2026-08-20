// V1.12.1 — clickable team pulse cards + per-person firm/work drilldown
(function bootTeamPersonDrilldownV121(){
  const required=['isAdmin','activeProfiles','monthWorks','monthShares','workFirmId','workReady','sumWorkQty','firm','firmLogo','escapeHtml','prettyMonth','formatDateTime','dateMonthISO'];
  if(required.some(k=>typeof window[k]!=='function') || typeof renderTeamPulse!=='function'){
    setTimeout(bootTeamPersonDrilldownV121,120);
    return;
  }
  if(window.__mindsTeamPersonDrilldownV121) return;
  window.__mindsTeamPersonDrilldownV121=true;

  let selectedPersonId=null;

  const respLabels={
    ana_sorumlu:'Ana Sorumlu',
    tasarim:'Tasarım',
    video:'Video',
    sosyal_medya:'Sosyal Medya',
    diger:'Diğer'
  };

  function qty(list){
    try{return sumWorkQty(list||[]);}catch(_e){return (list||[]).reduce((n,w)=>n+Number(w?.quantity||1),0);}
  }

  function personRecord(pid){ return state.profiles.find(p=>p.id===pid) || null; }

  function personAvatar(p,cls='person-detail-avatar-v121'){
    if(p?.avatar_url) return `<img class="${cls}" src="${escapeHtml(p.avatar_url)}" alt="${escapeHtml(p.full_name||'Personel')}">`;
    return `<span class="${cls} person-detail-avatar-fallback-v121">${escapeHtml(String(p?.full_name||'?').trim().charAt(0).toUpperCase()||'?')}</span>`;
  }

  function selectedMonthExtras(pid){
    return (state.extras||[]).filter(x=>x.month===selectedMonth && x.person_id===pid);
  }
  function selectedMonthShoots(pid){
    return (state.shoots||[]).filter(x=>x.month===selectedMonth && x.responsible_id===pid);
  }

  function responsibilitiesFor(pid,fid){
    return (state.assignments||[])
      .filter(a=>a.person_id===pid && a.firm_id===fid)
      .map(a=>respLabels[a.responsibility]||a.responsibility)
      .filter(Boolean);
  }

  function workFirmMonth(fid){
    return (state.months||[]).find(m=>m.firm_id===fid && m.month===selectedMonth) || null;
  }

  function firmSharesByPerson(pid,fid){
    return monthShares().filter(s=>{
      if(s.shared_by!==pid) return false;
      const w=(state.works||[]).find(x=>x.id===s.work_id);
      return workFirmId(w)===fid;
    });
  }

  function shareTypeQty(shares,type){
    return (shares||[]).reduce((n,s)=>{
      const w=(state.works||[]).find(x=>x.id===s.work_id);
      return n+(w?.type===type?Number(s.quantity||0):0);
    },0);
  }

  function relatedFirmIds(pid){
    const ids=new Set();
    (state.assignments||[]).filter(a=>a.person_id===pid).forEach(a=>ids.add(a.firm_id));
    monthWorks().filter(w=>w.assigned_to===pid).forEach(w=>{const fid=workFirmId(w); if(fid) ids.add(fid);});
    monthShares().filter(s=>s.shared_by===pid).forEach(s=>{
      const w=(state.works||[]).find(x=>x.id===s.work_id); const fid=workFirmId(w); if(fid) ids.add(fid);
    });
    selectedMonthExtras(pid).forEach(x=>{if(x.firm_id) ids.add(x.firm_id);});
    selectedMonthShoots(pid).forEach(x=>{if(x.firm_id) ids.add(x.firm_id);});
    return [...ids].filter(fid=>firm(fid));
  }

  function firmSort(a,b){
    const fa=firm(a), fb=firm(b);
    const da=new Date(fa?.list_order_at||0).getTime(), db=new Date(fb?.list_order_at||0).getTime();
    if(da!==db) return da-db;
    return String(fa?.name||'').localeCompare(String(fb?.name||''),'tr');
  }

  function ensureDetailPanel(){
    const pulse=document.getElementById('teamPulsePanel');
    if(!pulse) return null;
    let panel=document.getElementById('teamPersonDetailV121');
    if(!panel){
      panel=document.createElement('section');
      panel.id='teamPersonDetailV121';
      panel.className='panel team-person-detail-v121 admin-only';
      pulse.insertAdjacentElement('afterend',panel);
    }
    return panel;
  }

  function closeDetail(){
    selectedPersonId=null;
    const panel=document.getElementById('teamPersonDetailV121');
    if(panel){ panel.innerHTML=''; panel.style.display='none'; }
    document.querySelectorAll('#teamPulsePanel .team-pulse-card').forEach(c=>c.classList.remove('selected-person-v121'));
  }

  function renderPersonDetail(pid,{scroll=false}={}){
    if(!isAdmin()) return closeDetail();
    const p=personRecord(pid); if(!p) return closeDetail();
    const panel=ensureDetailPanel(); if(!panel) return;
    selectedPersonId=pid;

    const pWorks=monthWorks().filter(w=>w.assigned_to===pid);
    const readyPost=qty(pWorks.filter(w=>w.type==='post'&&workReady(w)));
    const readyVideo=qty(pWorks.filter(w=>w.type==='video'&&workReady(w)));
    const ongoingQty=qty(pWorks.filter(w=>!workReady(w)));
    const pShares=monthShares().filter(s=>s.shared_by===pid);
    const sharedPost=shareTypeQty(pShares,'post');
    const sharedVideo=shareTypeQty(pShares,'video');
    const extras=selectedMonthExtras(pid);
    const extraQty=extras.reduce((n,x)=>n+Number(x.quantity||0),0);
    const shoots=selectedMonthShoots(pid);
    const shootVideos=shoots.reduce((n,x)=>n+Number(x.video_count||0),0);
    const assignedFirmCount=new Set((state.assignments||[]).filter(a=>a.person_id===pid && firm(a.firm_id)?.active).map(a=>a.firm_id)).size;

    const ids=relatedFirmIds(pid).sort(firmSort);
    const rows=ids.map((fid,i)=>{
      const f=firm(fid), fm=workFirmMonth(fid);
      const fw=fm?(state.works||[]).filter(w=>w.firm_month_id===fm.id && w.assigned_to===pid):[];
      const post=qty(fw.filter(w=>w.type==='post'&&workReady(w)));
      const video=qty(fw.filter(w=>w.type==='video'&&workReady(w)));
      const activeQty=qty(fw.filter(w=>!workReady(w)));
      const fshares=firmSharesByPerson(pid,fid);
      const sp=shareTypeQty(fshares,'post'), sv=shareTypeQty(fshares,'video');
      const fextra=extras.filter(x=>x.firm_id===fid).reduce((n,x)=>n+Number(x.quantity||0),0);
      const fshoots=shoots.filter(x=>x.firm_id===fid);
      const fshootVideos=fshoots.reduce((n,x)=>n+Number(x.video_count||0),0);
      const resp=responsibilitiesFor(pid,fid);
      const last=(state.activity||[]).find(a=>a.actor_id===pid && a.firm_id===fid);
      const pkg=fm?`${Number(fm.post_quota||0)} P / ${Number(fm.video_quota||0)} V`:'—';
      return `<tr>
        <td><span class="firm-no">${i+1}</span></td>
        <td><div class="firm-cell">${firmLogo(f)}<div><b>${escapeHtml(f.name)}</b><small class="person-detail-sector-v121">${escapeHtml(f.sector||'')}</small></div></div></td>
        <td>${resp.length?resp.map(r=>`<span class="person-role-chip-v121">${escapeHtml(r)}</span>`).join(' '):'<span class="muted">Geçmiş üretim</span>'}</td>
        <td>${pkg}</td>
        <td><b>${post} P / ${video} V</b>${activeQty?`<small class="person-detail-sub-v121">${activeQty} adet devam/bekleyen</small>`:''}</td>
        <td><b>${sp} P / ${sv} V</b></td>
        <td>${fextra||'0'}</td>
        <td>${fshoots.length} çekim${fshootVideos?` · ${fshootVideos} video`:''}</td>
        <td>${last?`<span class="person-last-action-v121">${escapeHtml(last.description||'Hareket')}</span><small class="person-detail-sub-v121">${formatDateTime(last.created_at)}</small>`:'<span class="muted">—</span>'}</td>
      </tr>`;
    }).join('');

    const monthActivities=(state.activity||[])
      .filter(a=>a.actor_id===pid && dateMonthISO(a.created_at)===selectedMonth)
      .slice(0,8);

    panel.style.display='block';
    panel.innerHTML=`
      <div class="person-detail-head-v121">
        <div class="person-detail-identity-v121">${personAvatar(p)}<div><h3>${escapeHtml(p.full_name)}</h3><p>${escapeHtml(p.job_title||'Personel')} · ${prettyMonth(selectedMonth)} detayları</p></div></div>
        <button type="button" class="person-detail-close-v121" id="teamPersonDetailCloseV121" aria-label="Detayı kapat">×</button>
      </div>
      <div class="person-detail-stats-v121">
        <div><small>Sorumlu Firma</small><b>${assignedFirmCount}</b></div>
        <div><small>Hazırladığı Post</small><b>${readyPost}</b></div>
        <div><small>Hazırladığı Video</small><b>${readyVideo}</b></div>
        <div><small>Devam / Bekleyen</small><b>${ongoingQty}</b></div>
        <div><small>Paylaştığı Post</small><b>${sharedPost}</b></div>
        <div><small>Paylaştığı Video</small><b>${sharedVideo}</b></div>
        <div><small>Ekstra</small><b>${extraQty}</b></div>
        <div><small>Çekim</small><b>${shoots.length}</b><span>${shootVideos} video içeriği</span></div>
      </div>
      <div class="person-detail-table-head-v121"><div><h4>Firma Bazlı İş Takibi</h4><p>Bu personelin seçili ayda firma bazında yaptığı işler</p></div><span>${ids.length} firma kaydı</span></div>
      <div class="table-wrap person-detail-table-wrap-v121"><table><thead><tr><th>No</th><th>Firma</th><th>Sorumluluk</th><th>Paket</th><th>Hazırladığı</th><th>Paylaştığı</th><th>Ekstra</th><th>Çekim</th><th>Son Hareket</th></tr></thead><tbody>${rows||'<tr><td colspan="9" class="empty">Bu ay için firma bazlı hareket bulunmuyor.</td></tr>'}</tbody></table></div>
      <div class="person-detail-activity-v121"><div class="person-detail-table-head-v121"><div><h4>Son Hareketleri</h4><p>${prettyMonth(selectedMonth)} içindeki son işlemler</p></div></div>${monthActivities.length?monthActivities.map(a=>`<div class="person-detail-activity-row-v121"><span class="dot"></span><div><b>${escapeHtml(a.description||'Hareket')}</b><small>${a.firm_id&&firm(a.firm_id)?escapeHtml(firm(a.firm_id).name):'Ajans / Genel'}</small></div><time>${formatDateTime(a.created_at)}</time></div>`).join(''):'<div class="empty compact-empty">Bu ay hareket kaydı yok.</div>'}</div>
    `;

    document.getElementById('teamPersonDetailCloseV121')?.addEventListener('click',closeDetail);
    document.querySelectorAll('#teamPulsePanel .team-pulse-card').forEach(c=>c.classList.toggle('selected-person-v121',c.dataset.personId===pid));
    if(scroll) setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  function bindPulseCards(){
    const panel=document.getElementById('teamPulsePanel');
    if(!panel || !isAdmin()) return;
    const people=activeProfiles().filter(p=>p.role!=='admin');
    const cards=[...panel.querySelectorAll('.team-pulse-card')];
    cards.forEach((card,i)=>{
      const p=people[i]; if(!p) return;
      card.dataset.personId=p.id;
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label',`${p.full_name} detaylarını aç`);
      card.title=`${p.full_name} · detayları görmek için tıkla`;
      card.classList.add('team-pulse-clickable-v121');

      const av=card.querySelector('.team-pulse-head .avatar');
      if(av){
        if(p.avatar_url){
          av.textContent=''; av.classList.add('team-pulse-photo-v121'); av.style.backgroundImage=`url("${String(p.avatar_url).replace(/\\/g,'\\\\').replace(/"/g,'\\"')}")`;
        }else{
          av.classList.remove('team-pulse-photo-v121'); av.style.backgroundImage=''; av.textContent=String(p.full_name||'?').charAt(0).toUpperCase();
        }
      }

      if(card.dataset.drilldownBoundV121!=='1'){
        card.dataset.drilldownBoundV121='1';
        const open=()=>{
          const pid=card.dataset.personId;
          if(selectedPersonId===pid){ closeDetail(); return; }
          renderPersonDetail(pid,{scroll:true});
        };
        card.addEventListener('click',open);
        card.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();open();} });
      }
      card.classList.toggle('selected-person-v121',selectedPersonId===p.id);
    });
  }

  function installStyles(){
    if(document.getElementById('teamPersonDrilldownStyleV121')) return;
    const st=document.createElement('style');
    st.id='teamPersonDrilldownStyleV121';
    st.textContent=`
      #teamPulsePanel .team-pulse-card.team-pulse-clickable-v121{cursor:pointer;position:relative;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease,background .16s ease}
      #teamPulsePanel .team-pulse-card.team-pulse-clickable-v121:hover{transform:translateY(-2px);border-color:#505b61;box-shadow:0 10px 26px rgba(0,0,0,.2)}
      #teamPulsePanel .team-pulse-card.team-pulse-clickable-v121.selected-person-v121{border-color:#c9c81d;box-shadow:0 0 0 1px rgba(235,233,60,.18),0 12px 28px rgba(0,0,0,.24);background:linear-gradient(145deg,#17190e,#11161b)}
      #teamPulsePanel .team-pulse-card.team-pulse-clickable-v121:after{content:'Detayları gör  →';display:block;margin-top:9px;padding-top:8px;border-top:1px solid rgba(255,255,255,.05);font-size:9px;font-weight:700;color:#a5a832;letter-spacing:.02em}
      #teamPulsePanel .team-pulse-card.team-pulse-clickable-v121.selected-person-v121:after{content:'Detayı kapat  ↑';color:#ebe93c}
      .team-pulse-photo-v121{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;color:transparent!important}
      .team-person-detail-v121{display:none;margin:10px 0 16px;border-color:#343d42;box-shadow:0 18px 45px rgba(0,0,0,.18)}
      .person-detail-head-v121{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid #242c31}
      .person-detail-identity-v121{display:flex;align-items:center;gap:12px}.person-detail-identity-v121 h3{margin:0 0 4px}.person-detail-identity-v121 p{margin:0;color:#879198;font-size:11px}
      .person-detail-avatar-v121{width:48px;height:48px;border-radius:50%;object-fit:cover;background:#ebe93c;color:#111;display:grid;place-items:center;font-weight:900;border:1px solid #3d454a}
      .person-detail-avatar-fallback-v121{border-color:#d8d62e}.person-detail-close-v121{width:34px;height:34px;border-radius:9px;border:1px solid #343d42;background:#0e1317;color:#c9d0d4;font-size:23px;line-height:1;cursor:pointer}.person-detail-close-v121:hover{border-color:#666;color:#fff}
      .person-detail-stats-v121{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px;margin:14px 0}.person-detail-stats-v121>div{min-height:62px;padding:10px;background:#0d1216;border:1px solid #222a2f;border-radius:10px}.person-detail-stats-v121 small{display:block;color:#7f898f;font-size:9px}.person-detail-stats-v121 b{display:block;font-size:19px;margin-top:6px}.person-detail-stats-v121 span{display:block;color:#707a80;font-size:8px;margin-top:2px}
      .person-detail-table-head-v121{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin:13px 0 8px}.person-detail-table-head-v121 h4{margin:0;font-size:13px}.person-detail-table-head-v121 p{margin:4px 0 0;color:#79838a;font-size:9px}.person-detail-table-head-v121>span{font-size:9px;color:#b8ba3e;background:#1c1d0d;border:1px solid #3e4014;border-radius:999px;padding:5px 8px}
      .person-detail-table-wrap-v121{border:1px solid #222a2f;border-radius:11px;background:#0d1216}.person-detail-table-wrap-v121 table{min-width:1080px}.person-detail-table-wrap-v121 th,.person-detail-table-wrap-v121 td{padding:11px 9px;font-size:10px}.person-detail-table-wrap-v121 th{font-size:8px}.person-detail-table-wrap-v121 .firm-logo{width:31px;height:31px}.person-detail-sector-v121,.person-detail-sub-v121{display:block;color:#747e84;font-size:8px;margin-top:3px}.person-role-chip-v121{display:inline-block;background:#171d21;border:1px solid #30393f;border-radius:999px;padding:4px 6px;color:#c8d0d4;font-size:8px;margin:1px}.person-last-action-v121{display:block;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .person-detail-activity-v121{margin-top:12px;border-top:1px solid #242c31;padding-top:2px}.person-detail-activity-row-v121{display:grid;grid-template-columns:8px 1fr auto;gap:9px;align-items:start;padding:9px 3px;border-bottom:1px solid #20272c}.person-detail-activity-row-v121 .dot{width:6px;height:6px;margin-top:4px}.person-detail-activity-row-v121 b{font-size:9px;display:block}.person-detail-activity-row-v121 small{font-size:8px;color:#758087;display:block;margin-top:3px}.person-detail-activity-row-v121 time{font-size:8px;color:#667078;white-space:nowrap}
      @media(max-width:1450px){.person-detail-stats-v121{grid-template-columns:repeat(4,1fr)}}
      @media(max-width:850px){.person-detail-stats-v121{grid-template-columns:repeat(2,1fr)}.person-detail-head-v121{align-items:flex-start}.person-detail-activity-row-v121{grid-template-columns:8px 1fr}.person-detail-activity-row-v121 time{grid-column:2}.team-person-detail-v121{scroll-margin-top:10px}}
    `;
    document.head.appendChild(st);
  }

  installStyles();

  const previousRenderTeamPulse=renderTeamPulse;
  renderTeamPulse=function(){
    previousRenderTeamPulse();
    bindPulseCards();
    if(selectedPersonId){
      const stillExists=activeProfiles().some(p=>p.id===selectedPersonId && p.role!=='admin');
      if(stillExists) renderPersonDetail(selectedPersonId); else closeDetail();
    }
  };

  bindPulseCards();
  if(selectedPersonId) renderPersonDetail(selectedPersonId);
  setTimeout(bindPulseCards,220);
})();