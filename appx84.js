// V1.24.3 — Aslı + yönetici için aylık Meta planlama takibi; gerçek paylaşım ve paket sayaçlarından tamamen bağımsızdır. Personelde yönetici Sosyal Medya Takip menüsü sert biçimde gizlenir.
(function bootMetaMonthlyPlanningV243(){
  if(window.__mindsMetaMonthlyPlanningV243)return;
  if(typeof sb==='undefined'||typeof state==='undefined'||typeof selectedMonth==='undefined'||!profile||typeof openModal!=='function'||typeof isAdmin!=='function'){
    setTimeout(bootMetaMonthlyPlanningV243,120);return;
  }
  window.__mindsMetaMonthlyPlanningV243=true;

  let plans=[];
  let loading=false;
  let realtime=null;
  let renderQueued=false;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/\s+/g,' ');
  const isAsli=()=>!isAdmin()&&norm(profile?.full_name)==='asli coskun';
  const allowed=()=>isAdmin()||isAsli();
  const monthKey=()=>String(selectedMonth||'').slice(0,10);
  const monthLabel=()=>typeof prettyMonth==='function'?prettyMonth(monthKey()):monthKey();
  const todayTR=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const dateText=v=>v?(typeof formatDate==='function'?formatDate(v):String(v).slice(0,10)):'—';
  const personNameLocal=id=>(state.profiles||[]).find(p=>p.id===id)?.full_name||'—';

  function installStyles(){
    if(document.getElementById('metaMonthlyPlanningV243Style'))return;
    const s=document.createElement('style');s.id='metaMonthlyPlanningV243Style';s.textContent=`
      body.minds-staff-no-smt-v243 .sidebar nav #socialMediaTrackNav,
      body.minds-staff-no-smt-v243 .sidebar nav .nav-item[data-view="socialMediaTrack"],
      body.minds-staff-no-smt-v243 .sidebar nav .nav-item[data-nav-color-key="social"]{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;max-height:0!important;padding:0!important;margin:0!important;border:0!important;overflow:hidden!important;pointer-events:none!important}
      body.minds-staff-no-smt-v243 #socialMediaTrack{display:none!important;visibility:hidden!important;pointer-events:none!important}
      #metaPlanBtnV243{white-space:nowrap}
      .meta-plan-panel-v243{margin:14px 0;border:1px solid #2b353b;border-radius:14px;background:linear-gradient(145deg,#11181c,#0e1418);overflow:hidden}
      .meta-plan-head-v243{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:16px 17px;border-bottom:1px solid #263036}.meta-plan-head-v243 h3{margin:0 0 5px;font-size:16px}.meta-plan-head-v243 p{margin:0;color:#88959c;font-size:10px;line-height:1.5}.meta-plan-month-v243{display:inline-flex;align-items:center;border:1px solid #5d5920;border-radius:8px;background:#1b1b0d;color:#ece52c;padding:6px 9px;font-size:9px;font-weight:850;white-space:nowrap}
      .meta-plan-kpis-v243{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;padding:13px 16px 0}.meta-plan-kpi-v243{border:1px solid #283238;border-radius:11px;background:#12191d;padding:12px}.meta-plan-kpi-v243 small{display:block;color:#839097;font-size:9px;margin-bottom:5px}.meta-plan-kpi-v243 b{font-size:21px;color:#eef2f3}.meta-plan-kpi-v243.done{border-color:#285238}.meta-plan-kpi-v243.done b{color:#82d873}.meta-plan-kpi-v243.wait{border-color:#5f5520}.meta-plan-kpi-v243.wait b{color:#ece52c}
      .meta-plan-progress-v243{height:6px;margin:12px 16px 0;border-radius:999px;background:#20292e;overflow:hidden}.meta-plan-progress-v243>i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#a9ad1d,#ece52c)}
      .meta-plan-list-v243{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:13px 16px 16px}.meta-plan-row-v243{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:9px;align-items:center;min-width:0;border:1px solid #273137;border-radius:10px;background:#10171b;padding:10px}.meta-plan-row-v243.planned{border-color:#285238;background:linear-gradient(145deg,#101a14,#10171b)}.meta-plan-no-v243{display:grid;place-items:center;width:28px;height:28px;border-radius:7px;background:#1b2226;color:#9da8ad;font-size:9px;font-weight:900}.meta-plan-row-v243.planned .meta-plan-no-v243{background:#16301d;color:#85dd79}.meta-plan-main-v243{min-width:0}.meta-plan-main-v243 b{display:block;color:#e8edef;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.meta-plan-main-v243 small{display:block;color:#7f8c92;font-size:8.5px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.meta-plan-side-v243{display:flex;align-items:center;gap:7px}.meta-plan-status-v243{display:inline-flex;align-items:center;border-radius:8px;padding:5px 7px;font-size:8px;font-weight:850;white-space:nowrap}.meta-plan-status-v243.done{background:#14331b;border:1px solid #2c6537;color:#87dc79}.meta-plan-status-v243.wait{background:#302b0c;border:1px solid #655c16;color:#ece52c}.meta-plan-actions-v243{display:flex;gap:5px}.meta-plan-actions-v243 button{min-height:29px;padding:5px 7px;font-size:8px}.meta-plan-empty-v243{grid-column:1/-1;padding:28px 14px;text-align:center;color:#78858c;font-size:10px}
      @media(max-width:980px){.meta-plan-list-v243{grid-template-columns:1fr}}
      @media(max-width:760px){#shares .section-actions{gap:8px!important}#metaPlanBtnV243{width:100%!important;min-height:44px!important}.meta-plan-head-v243{padding:13px;align-items:flex-start}.meta-plan-kpis-v243{padding:10px 12px 0;gap:7px}.meta-plan-kpi-v243{padding:10px}.meta-plan-kpi-v243 b{font-size:18px}.meta-plan-progress-v243{margin:10px 12px 0}.meta-plan-list-v243{grid-template-columns:1fr;padding:10px 12px 13px}.meta-plan-row-v243{grid-template-columns:30px minmax(0,1fr);padding:9px}.meta-plan-side-v243{grid-column:1/-1;justify-content:space-between;padding-left:39px}.meta-plan-actions-v243 button{min-height:34px;font-size:8.5px}}
    `;document.head.appendChild(s);
  }

  function applySocialTrackingVisibility(){
    const admin=isAdmin();
    document.body.classList.toggle('minds-staff-no-smt-v243',!admin);
    const candidates=[document.getElementById('socialMediaTrackNav'),...document.querySelectorAll('.sidebar nav .nav-item[data-view="socialMediaTrack"],.sidebar nav .nav-item[data-nav-color-key="social"]')].filter(Boolean);
    [...new Set(candidates)].forEach(btn=>{
      if(admin){
        btn.hidden=false;btn.removeAttribute('aria-hidden');btn.style.removeProperty('display');btn.style.removeProperty('visibility');btn.style.removeProperty('height');btn.style.removeProperty('min-height');btn.style.removeProperty('max-height');
      }else{
        btn.hidden=true;btn.setAttribute('aria-hidden','true');btn.tabIndex=-1;btn.style.setProperty('display','none','important');btn.style.setProperty('visibility','hidden','important');btn.style.setProperty('height','0','important');btn.style.setProperty('min-height','0','important');btn.style.setProperty('max-height','0','important');
      }
    });
    const view=document.getElementById('socialMediaTrack');
    if(view&&!admin){
      if(view.classList.contains('active-view')){
        view.classList.remove('active-view');document.getElementById('dashboard')?.classList.add('active-view');
      }
      view.setAttribute('aria-hidden','true');view.style.setProperty('display','none','important');
    }else if(view&&admin){view.removeAttribute('aria-hidden');view.style.removeProperty('display');}
  }

  function socialFirmIds(){
    const rows=(state.assignments||[]).filter(a=>a.responsibility==='sosyal_medya');
    if(isAdmin())return new Set(rows.map(a=>a.firm_id));
    return new Set(rows.filter(a=>a.person_id===profile.id).map(a=>a.firm_id));
  }

  function planningFirms(){
    const socialIds=socialFirmIds();
    const monthIds=new Set((state.months||[]).filter(m=>m.month===monthKey()).map(m=>m.firm_id));
    let arr=(state.firms||[]).filter(f=>socialIds.has(f.id)&&(monthIds.size?monthIds.has(f.id):f.active));
    return arr.sort((a,b)=>{
      const da=new Date(a.list_order_at||a.created_at||0),db=new Date(b.list_order_at||b.created_at||0);
      return da-db||String(a.name||'').localeCompare(String(b.name||''),'tr');
    });
  }

  function pkgText(fid){
    const fm=(state.months||[]).find(m=>m.month===monthKey()&&m.firm_id===fid),f=(state.firms||[]).find(x=>x.id===fid);
    const p=Number(fm?.post_quota??f?.default_post_quota??0),v=Number(fm?.video_quota??f?.default_video_quota??0);
    return `${p} Post / ${v} Video`;
  }

  function ensureUi(){
    installStyles();applySocialTrackingVisibility();
    const shares=document.getElementById('shares');if(!shares)return;
    let btn=document.getElementById('metaPlanBtnV243');
    if(!allowed()){
      btn?.remove();document.getElementById('metaPlanningPanelV243')?.remove();return;
    }
    const actions=shares.querySelector('.section-actions');
    if(actions&&!btn){btn=document.createElement('button');btn.id='metaPlanBtnV243';btn.type='button';btn.className='primary';btn.textContent='+ Meta Planlama Gir';btn.addEventListener('click',()=>openPlanModal());actions.appendChild(btn);}
    let panel=document.getElementById('metaPlanningPanelV243');
    if(!panel){panel=document.createElement('section');panel.id='metaPlanningPanelV243';panel.className='meta-plan-panel-v243';const cards=document.getElementById('shareCards');cards?.parentNode?.insertBefore(panel,cards);}
  }

  function render(){
    ensureUi();if(!allowed())return;
    const host=document.getElementById('metaPlanningPanelV243');if(!host)return;
    const firms=planningFirms(),map=new Map(plans.map(p=>[p.firm_id,p]));
    const ordered=[...firms].sort((a,b)=>Number(map.has(a.id))-Number(map.has(b.id))||String(a.name||'').localeCompare(String(b.name||''),'tr'));
    const total=firms.length,done=firms.filter(f=>map.has(f.id)).length,wait=Math.max(0,total-done),pct=total?Math.round(done/total*100):0;
    host.innerHTML=`
      <div class="meta-plan-head-v243"><div><h3>Meta Aylık Planlama</h3><p>Meta Business Suite aylık planlama takibi. Bu kayıt gerçek paylaşım sayılarını ve firma paket kotasını etkilemez.</p></div><span class="meta-plan-month-v243">${esc(monthLabel())}</span></div>
      <div class="meta-plan-kpis-v243"><div class="meta-plan-kpi-v243"><small>Toplam Firma</small><b>${total}</b></div><div class="meta-plan-kpi-v243 done"><small>Planlandı</small><b>${done}</b></div><div class="meta-plan-kpi-v243 wait"><small>Bekliyor</small><b>${wait}</b></div></div>
      <div class="meta-plan-progress-v243" title="%${pct} tamamlandı"><i style="width:${pct}%"></i></div>
      <div class="meta-plan-list-v243">${ordered.length?ordered.map((f,i)=>{const p=map.get(f.id);return `<div class="meta-plan-row-v243 ${p?'planned':''}"><span class="meta-plan-no-v243">${String(i+1).padStart(2,'0')}</span><div class="meta-plan-main-v243"><b>${esc(f.name)}</b><small>${esc(pkgText(f.id))}${p?` · ${esc(personNameLocal(p.planned_by))} · ${esc(dateText(p.plan_date))}`:''}</small></div><div class="meta-plan-side-v243"><span class="meta-plan-status-v243 ${p?'done':'wait'}">${p?'✓ Planlandı':'Bekliyor'}</span><div class="meta-plan-actions-v243">${p?`<button class="small-primary" data-meta-edit-v243="${p.id}">Düzenle</button><button class="small-danger" data-meta-delete-v243="${p.id}">Geri Al</button>`:`<button class="small-primary" data-meta-firm-v243="${f.id}">Planla</button>`}</div></div></div>`;}).join(''):'<div class="meta-plan-empty-v243">Bu ay için Meta planlama kapsamına giren firma yok.</div>'}</div>`;
  }

  async function loadPlans(){
    if(!allowed()){plans=[];render();return;}
    if(loading)return;loading=true;
    try{
      const {data,error}=await sb.from('meta_monthly_plans').select('*').eq('month',monthKey()).order('plan_date',{ascending:false}).order('created_at',{ascending:false});
      if(error)throw error;plans=data||[];render();
    }catch(e){console.error('[Meta Planlama]',e);if(typeof toast==='function')toast('Meta planlama kayıtları alınamadı.',true);}finally{loading=false;}
  }

  function openPlanModal(plan=null,presetFirmId=null){
    if(!allowed())return;
    const firms=planningFirms();if(!firms.length){if(typeof toast==='function')toast('Meta planlama yapılabilecek firma yok.',true);return;}
    const selectedFid=plan?.firm_id||presetFirmId||firms.find(f=>!plans.some(p=>p.firm_id===f.id))?.id||firms[0].id;
    openModal(plan?'Meta Planlamasını Güncelle':'Meta Planlama Gir',`<div class="form-grid">
      <div class="field"><label>Ay</label><input value="${esc(monthLabel())}" disabled></div>
      <div class="field"><label>Planlama Tarihi</label><input name="plan_date" type="date" required value="${esc(plan?.plan_date||todayTR())}"></div>
      <div class="field full"><label>Firma</label><select name="firm" id="metaPlanFirmSelectV243" required>${firms.map(f=>`<option value="${f.id}" ${f.id===selectedFid?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div class="field full"><label>Aylık Paket</label><input id="metaPlanPackageV243" value="${esc(pkgText(selectedFid))}" disabled></div>
      <div class="field full"><label>Not</label><textarea name="notes" placeholder="Meta planlama detayı, özel gün, kampanya veya müşteri notu…">${esc(plan?.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">${plan?'Güncellemeyi Kaydet':'Planlandı Olarak Kaydet'}</button></div>
    </div>`,async fd=>{
      const fid=String(fd.get('firm')||'');if(!fid)throw new Error('Firma seçmelisin.');
      const payload={firm_id:fid,plan_date:String(fd.get('plan_date')||todayTR()),notes:String(fd.get('notes')||'').trim()||null,updated_at:new Date().toISOString()};
      if(plan){const {error}=await sb.from('meta_monthly_plans').update(payload).eq('id',plan.id);if(error)throw error;}
      else{const {error}=await sb.from('meta_monthly_plans').insert({...payload,month:monthKey(),planned_by:profile.id,created_by:profile.id});if(error){if(String(error.message||'').includes('duplicate key'))throw new Error('Bu firmanın bu ayki Meta planlaması zaten kayıtlı.');throw error;}}
      await loadPlans();
      if(typeof toast==='function')toast(plan?'Meta planlaması güncellendi.':'Meta planlaması kaydedildi.');
    });
    setTimeout(()=>{
      const sel=document.getElementById('metaPlanFirmSelectV243'),pkg=document.getElementById('metaPlanPackageV243');
      if(sel&&pkg)sel.addEventListener('change',()=>{pkg.value=pkgText(sel.value);});
    },0);
  }

  async function deletePlan(id){
    const p=plans.find(x=>x.id===id);if(!p||!allowed())return;
    const f=(state.firms||[]).find(x=>x.id===p.firm_id);
    if(!confirm(`${f?.name||'Firma'} için ${monthLabel()} Meta planlama kaydı geri alınsın mı?`))return;
    const {error}=await sb.from('meta_monthly_plans').delete().eq('id',id);
    if(error){if(typeof toast==='function')toast('Meta planlama kaydı silinemedi.',true);return;}
    await loadPlans();if(typeof toast==='function')toast('Meta planlama kaydı geri alındı.');
  }

  function scheduleRender(){
    if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;ensureUi();if(allowed())render();else applySocialTrackingVisibility();});
  }

  document.addEventListener('click',e=>{
    const firmBtn=e.target.closest('[data-meta-firm-v243]');if(firmBtn){openPlanModal(null,firmBtn.dataset.metaFirmV243);return;}
    const edit=e.target.closest('[data-meta-edit-v243]');if(edit){const p=plans.find(x=>x.id===edit.dataset.metaEditV243);if(p)openPlanModal(p);return;}
    const del=e.target.closest('[data-meta-delete-v243]');if(del){deletePlan(del.dataset.metaDeleteV243);return;}
    if(e.target.closest('[data-view="shares"],.sidebar nav,#loginBtn'))setTimeout(()=>{applySocialTrackingVisibility();if(document.getElementById('shares')?.classList.contains('active-view'))loadPlans();},60);
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(()=>{applySocialTrackingVisibility();loadPlans();},80);},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){applySocialTrackingVisibility();if(document.getElementById('shares')?.classList.contains('active-view'))loadPlans();}});
  window.addEventListener('pageshow',()=>{applySocialTrackingVisibility();scheduleRender();});

  try{
    const previousRenderAll=renderAll;
    renderAll=function(){previousRenderAll();scheduleRender();};
  }catch(_e){}
  try{
    const previousApplyRoleUI=applyRoleUI;
    applyRoleUI=function(){previousApplyRoleUI();applySocialTrackingVisibility();scheduleRender();};
  }catch(_e){}

  try{
    realtime=sb.channel(`meta-monthly-plans-v243-${profile.id}`).on('postgres_changes',{event:'*',schema:'public',table:'meta_monthly_plans'},()=>{if(allowed())loadPlans();}).subscribe();
  }catch(e){console.warn('[Meta Planlama realtime]',e);}

  installStyles();applySocialTrackingVisibility();ensureUi();loadPlans();
  [120,420,900].forEach(ms=>setTimeout(()=>{applySocialTrackingVisibility();scheduleRender();},ms));
})();
