// V1.11.2 — approved Firms page visual status system + icon KPI cards
(function bootFirmsVisualV112(){
  const required=['firmMetrics','monthWorks','monthShares','sumSharesOfType','sumWorkQty','workReady','selectedMonthFirms','activeFirms','assignedPeople','firmLogo','escapeHtml'];
  if(required.some(k=>typeof window[k]!=='function')){ setTimeout(bootFirmsVisualV112,100); return; }
  if(window.__mindsFirmsV112Installed) return;
  window.__mindsFirmsV112Installed=true;

  function iconSvg(kind){
    const common='width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const paths={
      firms:`<svg ${common}><path d="M4 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M16 8h3a1 1 0 0 1 1 1v12"/><path d="M8 7h4M8 11h4M8 15h4M8 19h4"/></svg>`,
      post:`<svg ${common}><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>`,
      video:`<svg ${common}><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>`,
      sharePost:`<svg ${common}><path d="m21 3-7.6 18-4.2-8.2L1 8.6z"/><path d="M9.2 12.8 21 3"/></svg>`,
      shareVideo:`<svg ${common}><rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 5-3v10l-5-3z"/><path d="M7 3h4"/></svg>`,
      waiting:`<svg ${common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`
    };
    return paths[kind]||paths.firms;
  }

  function firmPageCounts(){
    const ws=monthWorks(), shares=monthShares();
    return {
      firms:selectedMonthFirms().length,
      post:sumWorkQty(ws.filter(w=>w.type==='post'&&workReady(w))),
      video:sumWorkQty(ws.filter(w=>w.type==='video'&&workReady(w))),
      sharedPost:sumSharesOfType(shares,'post'),
      sharedVideo:sumSharesOfType(shares,'video'),
      waiting:ws.filter(workReady).reduce((n,w)=>n+remainingToShare(w),0)
    };
  }

  function statusForFirm(f){
    const m=firmMetrics(f.id);
    const packageDone=m.post>=m.pq && m.video>=m.vq;
    if(packageDone && m.sharePending===0) return {key:'done',label:'Tamamlandı',icon:'✓'};
    if(packageDone && m.sharePending>0) return {key:'waiting',label:'Paylaşım Bekliyor',icon:'◷'};
    return {key:'progress',label:'Devam Ediyor',icon:'◷'};
  }

  function ensureFirmsOverview(){
    const section=document.getElementById('firms');
    const cards=document.getElementById('firmCards');
    if(!section||!cards) return null;
    let wrap=document.getElementById('firmsOverviewV112');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='firmsOverviewV112';
      cards.parentNode.insertBefore(wrap,cards);
    }
    return wrap;
  }

  function renderFirmsOverview(){
    const wrap=ensureFirmsOverview(); if(!wrap) return;
    if(!isAdmin()){ wrap.innerHTML=''; wrap.style.display='none'; return; }
    wrap.style.display='block';
    const c=firmPageCounts();
    const items=[
      ['firms','Toplam Firma',c.firms,'Aktif firmalar','purple'],
      ['post','Hazırlanan Post',c.post,'Bu ay tamamlanan','blue'],
      ['video','Hazırlanan Video',c.video,'Bu ay tamamlanan','green'],
      ['sharePost','Paylaşılan Post',c.sharedPost,'Bu ay paylaşılan','orange'],
      ['shareVideo','Paylaşılan Video',c.sharedVideo,'Bu ay paylaşılan','red'],
      ['waiting','Paylaşım Bekleyen',c.waiting,'İçerik','teal']
    ];
    wrap.innerHTML=`<div class="firms-kpi-grid-v112">${items.map(([kind,label,value,sub,tone])=>`<div class="firms-kpi-v112"><div class="firms-kpi-icon-v112 tone-${tone}">${iconSvg(kind)}</div><div><small>${label}</small><b>${value}</b><span>${sub}</span></div></div>`).join('')}</div><div class="firms-legend-v112"><b>Durum Renkleri</b><span><i class="legend-dot-v112 done"></i><strong>Tamamlandı</strong><em>İçerik ve paylaşımlar bitti</em></span><span><i class="legend-dot-v112 waiting"></i><strong>Paylaşım Bekliyor</strong><em>İçerikler hazır, paylaşım bekliyor</em></span><span><i class="legend-dot-v112 progress"></i><strong>Devam Ediyor</strong><em>İçerikler devam ediyor</em></span></div>`;
  }

  function renderFirmsV112(){
    renderFirmsOverview();
    const make=(arr,passive=false)=>arr.map((f,i)=>{
      const m=firmMetrics(f.id), people=assignedPeople(f.id), status=passive?{key:'progress',label:'Pasif',icon:'—'}:statusForFirm(f);
      return `<div class="firm-card firm-status-v112 status-${status.key} ${passive?'passive-card':''}">
        <div class="firm-card-top"><span class="firm-order">${passive?'PASİF':String(i+1).padStart(2,'0')}</span><div class="firm-card-actions-v112"><span class="firm-state-badge-v112 state-${status.key}">${status.icon} ${status.label}</span>${isAdmin()?`<div class="card-actions"><button class="small-primary" data-edit-firm="${f.id}">Düzenle</button><button class="small-danger" data-toggle-firm="${f.id}" data-active="${f.active}">${f.active?'Pasife Al':'Aktif Et'}</button><button class="small-danger" data-delete-firm="${f.id}">Kalıcı Sil</button></div>`:''}</div></div>
        <div class="firm-card-head">${firmLogo(f)}<div><h3>${escapeHtml(f.name)}</h3><div class="muted">${escapeHtml(f.sector||'')}</div></div></div>
        <div class="firm-package-line-v112">Paket: ${m.pq} Post / ${m.vq} Video</div>
        <div class="firm-metrics-v112"><div><b>${m.post}/${m.pq}</b><small>Post</small></div><div><b>${m.video}/${m.vq}</b><small>Video</small></div><div class="share-metric-v112"><b>${m.sharedPost}/${m.pq}</b><small>Paylaşılan Post</small></div><div class="share-metric-v112"><b>${m.sharedVideo}/${m.vq}</b><small>Paylaşılan Video</small></div><div class="pending-metric-v112"><b>${m.sharePending}</b><small>Bekleyen</small></div></div>
        <div class="pill-row">${people.length?people.map(x=>`<span class="pill">${escapeHtml(x.p.full_name)} · ${escapeHtml(({ana_sorumlu:'Ana Sorumlu',tasarim:'Tasarım',video:'Video',sosyal_medya:'Sosyal Medya',diger:'Diğer'})[x.a.responsibility])}</span>`).join(''):'<span class="pill">Sorumlu atanmadı</span>'}</div>
      </div>`;
    }).join('');
    document.getElementById('firmCards').innerHTML=make(activeFirms())||'<div class="empty">Henüz aktif firma yok.</div>';
    if(isAdmin()) document.getElementById('passiveFirmCards').innerHTML=make(state.firms.filter(f=>!f.active),true)||'<div class="empty">Pasif firma yok.</div>'; else document.getElementById('passiveFirmCards').innerHTML='';
  }

  function installStyles(){
    if(document.getElementById('firmsV112Style')) return;
    const st=document.createElement('style'); st.id='firmsV112Style'; st.textContent=`
      .firms-kpi-grid-v112{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:13px;margin:0 0 16px}.firms-kpi-v112{min-height:86px;background:linear-gradient(145deg,#11171c,#0f1418);border:1px solid #252e34;border-radius:14px;padding:13px;display:flex;gap:12px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.12)}.firms-kpi-icon-v112{width:46px;height:46px;flex:0 0 46px;border-radius:12px;display:grid;place-items:center;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 7px 20px rgba(0,0,0,.25)}.tone-purple{background:linear-gradient(145deg,#8456ff,#5730d9)}.tone-blue{background:linear-gradient(145deg,#3d9cff,#1765e9)}.tone-green{background:linear-gradient(145deg,#46d87b,#15984b)}.tone-orange{background:linear-gradient(145deg,#ffad32,#ec7d00)}.tone-red{background:linear-gradient(145deg,#ff6477,#d93150)}.tone-teal{background:linear-gradient(145deg,#32c8c4,#098d91)}.firms-kpi-v112 small{display:block;color:#c3c9cd;font-size:10px}.firms-kpi-v112 b{display:block;font-size:24px;line-height:1;margin:7px 0 5px}.firms-kpi-v112 span{display:block;color:#818b91;font-size:9px}.firms-legend-v112{display:flex;align-items:center;gap:28px;flex-wrap:wrap;background:linear-gradient(145deg,#11171c,#0e1317);border:1px solid #252e34;border-radius:14px;padding:13px 16px;margin-bottom:16px}.firms-legend-v112>b{font-size:11px;padding-right:18px;border-right:1px solid #2b3338}.firms-legend-v112>span{display:grid;grid-template-columns:12px auto;column-gap:7px;align-items:center}.firms-legend-v112 strong{font-size:10px}.firms-legend-v112 em{grid-column:2;font-style:normal;color:#7f888e;font-size:9px}.legend-dot-v112{width:10px;height:10px;border-radius:50%}.legend-dot-v112.done{background:#39d45a;box-shadow:0 0 12px rgba(57,212,90,.45)}.legend-dot-v112.waiting{background:#f0cf20;box-shadow:0 0 12px rgba(240,207,32,.35)}.legend-dot-v112.progress{background:#697781}.firm-status-v112{position:relative;overflow:hidden;transition:border-color .2s,box-shadow .2s,background .2s}.firm-status-v112.status-done{border-color:#1e8f35;background:linear-gradient(145deg,#101a14,#101519);box-shadow:inset 0 0 35px rgba(30,143,53,.07),0 0 0 1px rgba(54,210,83,.05)}.firm-status-v112.status-waiting{border-color:#8e7911;background:linear-gradient(145deg,#18180e,#111518);box-shadow:inset 0 0 35px rgba(202,176,20,.06)}.firm-status-v112.status-progress{border-color:#43505a}.firm-card-actions-v112{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.firm-state-badge-v112{border-radius:9px;padding:6px 9px;font-size:9px;font-weight:800;white-space:nowrap}.state-done{background:#102f17;border:1px solid #1e6e2c;color:#66e878}.state-waiting{background:#302a09;border:1px solid #6a5e0f;color:#f0d52a}.state-progress{background:#172027;border:1px solid #35424b;color:#c7d0d6}.firm-package-line-v112{font-size:10px;color:#aeb5b9;margin-top:14px;padding-bottom:10px;border-bottom:1px solid #252c31}.firm-metrics-v112{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));margin-top:6px}.firm-metrics-v112>div{padding:10px 8px;border-right:1px solid #242c31}.firm-metrics-v112>div:last-child{border-right:0}.firm-metrics-v112 b{display:block;font-size:17px}.firm-metrics-v112 small{display:block;margin-top:5px;color:#8e979d;font-size:8px}.status-waiting .share-metric-v112 b,.status-waiting .pending-metric-v112 b{color:#f0d52a}.status-done .share-metric-v112 b{color:#69de7e}.status-done .firm-order{color:#68e17d}.status-waiting .firm-order{color:#f0d52a}@media(max-width:1400px){.firms-kpi-grid-v112{grid-template-columns:repeat(3,1fr)}}@media(max-width:900px){.firms-kpi-grid-v112{grid-template-columns:repeat(2,1fr)}.firm-metrics-v112{grid-template-columns:repeat(2,1fr)}.firm-metrics-v112>div{border-bottom:1px solid #242c31}.firm-card-actions-v112{align-items:flex-end;flex-direction:column}}@media(max-width:600px){.firms-kpi-grid-v112{grid-template-columns:1fr}.firms-legend-v112{align-items:flex-start;flex-direction:column;gap:11px}.firms-legend-v112>b{border-right:0;padding-right:0}.firm-metrics-v112{grid-template-columns:1fr 1fr}.firm-state-badge-v112{order:-1}}
    `; document.head.appendChild(st);
  }

  installStyles();
  window.renderFirms=renderFirmsV112;
  try{ if(profile) renderFirmsV112(); }catch(e){ console.warn('V1.11.2 firms render',e); }
})();
