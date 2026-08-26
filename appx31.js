// V1.15.0 — shared agency agenda / shoot planning calendar.
(function bootAgencyAgendaV150(){
  if(typeof sb==='undefined'||typeof setView!=='function'||typeof openModal!=='function'||typeof state==='undefined'||!profile){
    setTimeout(bootAgencyAgendaV150,120); return;
  }
  if(window.__mindsAgencyAgendaV150) return;
  window.__mindsAgencyAgendaV150=true;

  let agendaEvents=[];
  let agendaAssignees=[];
  let selectedAgendaId=null;
  let agendaFilter='all';
  let loading=false;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const typeMeta={
    cekim:{label:'Çekim',icon:'◉',cls:'agenda-type-shoot'},
    toplanti:{label:'Toplantı',icon:'▣',cls:'agenda-type-meeting'},
    teslim:{label:'Teslim',icon:'✓',cls:'agenda-type-delivery'},
    paylasim:{label:'Paylaşım',icon:'↗',cls:'agenda-type-share'},
    diger:{label:'Diğer',icon:'•',cls:'agenda-type-other'}
  };
  const statusMeta={
    planlandi:{label:'Planlandı',cls:'agenda-status-planned'},
    tamamlandi:{label:'Tamamlandı',cls:'agenda-status-done'},
    iptal:{label:'İptal',cls:'agenda-status-cancelled'}
  };
  const months=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const weekdays=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

  function isoDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function monthDate(v=selectedMonth){const [y,m]=String(v).slice(0,7).split('-').map(Number);return new Date(y,m-1,1);}
  function monthTitle(){const d=monthDate();return `${months[d.getMonth()]} ${d.getFullYear()}`;}
  function eventAssigneeIds(id){return agendaAssignees.filter(a=>a.event_id===id).map(a=>a.person_id);}
  function eventAssigneeNames(id){return eventAssigneeIds(id).map(pid=>(state.profiles||[]).find(p=>p.id===pid)?.full_name).filter(Boolean);}
  function personNameLocal(id){return (state.profiles||[]).find(p=>p.id===id)?.full_name||'Personel';}
  function firmNameLocal(e){
    if(e.firm_id) return (state.firms||[]).find(f=>f.id===e.firm_id)?.name||'Kayıtlı Firma';
    if(e.external_client_name) return e.external_client_name;
    return 'Ajans İçi';
  }
  function canManage(e){return typeof isAdmin==='function'&&isAdmin() || e?.created_by===profile.id;}
  function canConvert(e){return canManage(e)||eventAssigneeIds(e.id).includes(profile.id);}
  function isToday(v){return v===isoDate(new Date());}
  function timeText(e){
    const start=e.start_time?String(e.start_time).slice(0,5):'';
    const end=e.end_time?String(e.end_time).slice(0,5):'';
    return start?(end?`${start} – ${end}`:start):'Saat belirtilmedi';
  }
  function dateTR(v){if(!v)return '—';const [y,m,d]=v.split('-');return `${d}.${m}.${y}`;}

  function installStyles(){
    if(document.getElementById('agendaV150Styles')) return;
    const st=document.createElement('style'); st.id='agendaV150Styles'; st.textContent=`
      #agenda{padding-bottom:28px}.agenda-toolbar-v150{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}.agenda-filter-row-v150{display:flex;gap:8px;flex-wrap:wrap}.agenda-filter-v150{border:1px solid #283137;background:#11171b;color:#b6c0c5;border-radius:10px;padding:9px 13px;font-size:11px;font-weight:700;cursor:pointer}.agenda-filter-v150.active{border-color:#b7a60d;background:linear-gradient(145deg,#292505,#16170e);color:#f0e72d;box-shadow:0 0 0 1px rgba(235,226,42,.08)}.agenda-month-actions-v150{display:flex;gap:7px;align-items:center}.agenda-month-label-v150{min-width:132px;text-align:center;font-weight:800;color:#e4e9eb;font-size:12px}.agenda-icon-btn-v150{width:36px;height:36px;border:1px solid #2b343a;border-radius:9px;background:#12181d;color:#d8e0e3;cursor:pointer}.agenda-layout-v150{display:grid;grid-template-columns:minmax(0,1fr) 335px;gap:14px;align-items:start}.agenda-calendar-panel-v150,.agenda-side-panel-v150{border:1px solid #263037;border-radius:14px;background:#0f1519;overflow:hidden}.agenda-weekdays-v150{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid #263037;background:#12191e}.agenda-weekdays-v150 div{padding:10px;text-align:center;font-size:10px;font-weight:800;color:#9aa5aa}.agenda-grid-v150{display:grid;grid-template-columns:repeat(7,1fr)}.agenda-day-v150{min-height:116px;border-right:1px solid #222c32;border-bottom:1px solid #222c32;padding:8px;position:relative;background:#0f1519}.agenda-day-v150:nth-child(7n){border-right:0}.agenda-day-v150.outside{background:#0c1114}.agenda-day-v150.outside .agenda-day-number-v150{color:#4f5a60}.agenda-day-v150.today{box-shadow:inset 0 0 0 1px rgba(234,224,39,.55);background:linear-gradient(145deg,rgba(230,219,32,.055),#0f1519 42%)}.agenda-day-number-v150{font-size:11px;font-weight:800;color:#dce3e6;margin-bottom:5px}.agenda-day-v150.weekend .agenda-day-number-v150{color:#d6bd20}.agenda-card-v150{display:block;width:100%;text-align:left;border:1px solid #33414a;border-radius:7px;padding:6px 7px;margin:4px 0;background:#172028;color:#e5ecef;cursor:pointer;overflow:hidden}.agenda-card-v150 b{display:block;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.agenda-card-v150 small{display:block;font-size:8px;color:#aab4b9;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.agenda-card-v150.agenda-type-shoot{border-color:#355d88;background:linear-gradient(145deg,#16283b,#14202a)}.agenda-card-v150.agenda-type-meeting{border-color:#65458b;background:linear-gradient(145deg,#291d3b,#191925)}.agenda-card-v150.agenda-type-delivery{border-color:#3c7246;background:linear-gradient(145deg,#183321,#152019)}.agenda-card-v150.agenda-type-share{border-color:#8a5f20;background:linear-gradient(145deg,#352714,#221b12)}.agenda-card-v150.agenda-type-other{border-color:#46525a}.agenda-more-v150{font-size:8px;color:#98a3a9;padding:3px 2px}.agenda-side-head-v150{display:flex;justify-content:space-between;align-items:center;padding:14px 15px;border-bottom:1px solid #263037}.agenda-side-head-v150 h3{margin:0;font-size:14px}.agenda-side-body-v150{padding:14px}.agenda-empty-detail-v150{padding:34px 16px;text-align:center;color:#69767d;font-size:10px}.agenda-detail-title-v150{font-size:17px;margin:0 0 5px}.agenda-detail-client-v150{font-size:10px;color:#cbd4d7;margin-bottom:13px}.agenda-detail-row-v150{display:grid;grid-template-columns:82px 1fr;gap:8px;padding:8px 0;border-bottom:1px solid #20292e;font-size:10px}.agenda-detail-row-v150 span:first-child{color:#7e8b91}.agenda-detail-row-v150 b,.agenda-detail-row-v150 div{color:#dce4e7}.agenda-person-chips-v150{display:flex;flex-wrap:wrap;gap:5px}.agenda-person-chip-v150{border:1px solid #354047;border-radius:20px;padding:4px 7px;background:#151c21;font-size:9px}.agenda-status-v150{display:inline-flex;border-radius:12px;padding:4px 8px;font-size:8px;font-weight:800}.agenda-status-planned{background:#152944;color:#72aee8;border:1px solid #284c72}.agenda-status-done{background:#17331d;color:#8cda83;border:1px solid #315f39}.agenda-status-cancelled{background:#32191d;color:#e48282;border:1px solid #633039}.agenda-detail-actions-v150{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:13px}.agenda-detail-actions-v150 button{min-height:35px}.agenda-upcoming-v150{margin-top:12px;border-top:1px solid #263037;padding-top:12px}.agenda-upcoming-v150 h4{margin:0 0 8px;font-size:11px}.agenda-upcoming-item-v150{display:grid;grid-template-columns:48px 1fr auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #20292e;cursor:pointer}.agenda-upcoming-date-v150{font-size:9px;color:#d7dfdf}.agenda-upcoming-item-v150 b{font-size:9px;display:block}.agenda-upcoming-item-v150 small{font-size:8px;color:#849198;display:block;margin-top:2px}.agenda-legend-v150{display:flex;gap:15px;flex-wrap:wrap;padding:10px 3px;font-size:9px;color:#8f9ba0}.agenda-legend-v150 span:before{content:'';width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px}.agenda-legend-v150 .lg-shoot:before{background:#4a86c5}.agenda-legend-v150 .lg-meeting:before{background:#8955b7}.agenda-legend-v150 .lg-delivery:before{background:#4a9a55}.agenda-legend-v150 .lg-share:before{background:#d48a21}.agenda-assignee-grid-v150{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.agenda-assignee-option-v150{display:flex!important;align-items:center;gap:7px;border:1px solid #2b353b;border-radius:9px;padding:8px;background:#12191d}.agenda-assignee-option-v150 input{width:auto!important}.agenda-help-v150{font-size:9px;color:#7d898f;margin-top:5px;line-height:1.5}@media(max-width:1150px){.agenda-layout-v150{grid-template-columns:1fr}.agenda-side-panel-v150{order:-1}.agenda-day-v150{min-height:105px}}@media(max-width:760px){.agenda-calendar-panel-v150{overflow-x:auto}.agenda-weekdays-v150,.agenda-grid-v150{min-width:760px}.agenda-assignee-grid-v150{grid-template-columns:1fr}}
    `; document.head.appendChild(st);
  }

  function ensureUI(){
    installStyles();
    let nav=document.querySelector('.nav-item[data-view="agenda"]');
    if(!nav){
      nav=document.createElement('button'); nav.className='nav-item'; nav.dataset.view='agenda'; nav.innerHTML='▣ <span>Ajanda</span>';
      const shoots=document.querySelector('.nav-item[data-view="shoots"]'); shoots?.insertAdjacentElement('afterend',nav);
      nav.addEventListener('click',()=>openAgendaView());
    }
    let section=document.getElementById('agenda');
    if(!section){
      section=document.createElement('section'); section.id='agenda'; section.className='view';
      section.innerHTML=`
        <div class="section-actions"><div><h2>Ajanda / Çekim Planı</h2><p>Aylık çekim, toplantı, teslim ve paylaşım planlarını ekipçe takip et.</p></div><button id="agendaAddBtnV150" class="primary">+ Yeni Plan</button></div>
        <div class="agenda-toolbar-v150"><div class="agenda-filter-row-v150" id="agendaFiltersV150"></div><div class="agenda-month-actions-v150"><button class="agenda-icon-btn-v150" id="agendaPrevV150">‹</button><div class="agenda-month-label-v150" id="agendaMonthLabelV150"></div><button class="agenda-icon-btn-v150" id="agendaNextV150">›</button><button class="ghost" id="agendaTodayV150">Bugüne Dön</button></div></div>
        <div class="agenda-layout-v150"><div><div class="agenda-calendar-panel-v150"><div class="agenda-weekdays-v150">${weekdays.map(x=>`<div>${x}</div>`).join('')}</div><div class="agenda-grid-v150" id="agendaGridV150"></div></div><div class="agenda-legend-v150"><span class="lg-shoot">Çekim</span><span class="lg-meeting">Toplantı</span><span class="lg-delivery">Teslim</span><span class="lg-share">Paylaşım</span></div></div><aside class="agenda-side-panel-v150"><div class="agenda-side-head-v150"><h3>Plan Detayları</h3><span class="badge yellow" id="agendaCountV150">0 plan</span></div><div class="agenda-side-body-v150" id="agendaDetailV150"></div></aside></div>`;
      const archive=document.getElementById('archive'); archive?archive.insertAdjacentElement('beforebegin',section):document.querySelector('.main')?.appendChild(section);
      document.getElementById('agendaAddBtnV150')?.addEventListener('click',()=>openAgendaModal());
      document.getElementById('agendaPrevV150')?.addEventListener('click',()=>shiftMonth(-1));
      document.getElementById('agendaNextV150')?.addEventListener('click',()=>shiftMonth(1));
      document.getElementById('agendaTodayV150')?.addEventListener('click',()=>goToday());
    }
    renderFilters();
    augmentMonthPicker();
  }

  function augmentMonthPicker(){
    const picker=document.getElementById('monthPicker'); if(!picker)return;
    const map=new Map([...picker.options].map(o=>[o.value,o.textContent]));
    const base=new Date(); base.setDate(1);
    for(let i=-3;i<=12;i++){const d=new Date(base.getFullYear(),base.getMonth()+i,1);const val=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;map.set(val,`${months[d.getMonth()]} ${d.getFullYear()}`);}
    agendaEvents.forEach(e=>{const val=e.event_date.slice(0,7)+'-01';const d=monthDate(val);map.set(val,`${months[d.getMonth()]} ${d.getFullYear()}`);});
    picker.innerHTML=[...map.entries()].sort((a,b)=>b[0].localeCompare(a[0])).map(([v,t])=>`<option value="${v}" ${v===selectedMonth?'selected':''}>${t}</option>`).join('');
  }

  function renderFilters(){
    const host=document.getElementById('agendaFiltersV150'); if(!host)return;
    const items=[['all','Tümü'],['cekim','◉ Çekim'],['toplanti','▣ Toplantı'],['teslim','✓ Teslim'],['paylasim','↗ Paylaşım']];
    host.innerHTML=items.map(([k,l])=>`<button class="agenda-filter-v150 ${agendaFilter===k?'active':''}" data-agenda-filter="${k}">${l}</button>`).join('');
    host.querySelectorAll('[data-agenda-filter]').forEach(b=>b.onclick=()=>{agendaFilter=b.dataset.agendaFilter;renderFilters();renderCalendar();});
  }

  async function loadAgenda(){
    if(loading)return; loading=true;
    try{
      const d=monthDate(), start=isoDate(new Date(d.getFullYear(),d.getMonth(),1)), end=isoDate(new Date(d.getFullYear(),d.getMonth()+1,0));
      const {data,error}=await sb.from('agenda_events').select('*').gte('event_date',start).lte('event_date',end).order('event_date',{ascending:true}).order('start_time',{ascending:true,nullsFirst:false});
      if(error) throw error; agendaEvents=data||[];
      const ids=agendaEvents.map(e=>e.id);
      if(ids.length){const r=await sb.from('agenda_event_assignees').select('*').in('event_id',ids);if(r.error)throw r.error;agendaAssignees=r.data||[];}else agendaAssignees=[];
      if(selectedAgendaId&&!agendaEvents.some(e=>e.id===selectedAgendaId)) selectedAgendaId=null;
      augmentMonthPicker(); renderAgenda();
    }catch(e){console.error('Agenda load',e); if(typeof toast==='function')toast('Ajanda yüklenemedi: '+(e?.message||e),true);
    }finally{loading=false;}
  }

  function filteredEvents(){return agendaEvents.filter(e=>agendaFilter==='all'||e.event_type===agendaFilter);}
  function renderAgenda(){
    const label=document.getElementById('agendaMonthLabelV150');if(label)label.textContent=monthTitle();
    const count=document.getElementById('agendaCountV150');if(count)count.textContent=`${filteredEvents().length} plan`;
    renderCalendar(); renderDetail();
  }

  function renderCalendar(){
    const grid=document.getElementById('agendaGridV150'); if(!grid)return;
    const d=monthDate(), first=new Date(d.getFullYear(),d.getMonth(),1), mondayIndex=(first.getDay()+6)%7;
    const start=new Date(d.getFullYear(),d.getMonth(),1-mondayIndex), events=filteredEvents();
    const cells=[];
    for(let i=0;i<42;i++){
      const day=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i), iso=isoDate(day), inside=day.getMonth()===d.getMonth(), weekend=[5,6].includes((day.getDay()+6)%7);
      const dayEvents=events.filter(e=>e.event_date===iso), shown=dayEvents.slice(0,3);
      cells.push(`<div class="agenda-day-v150 ${inside?'':'outside'} ${weekend?'weekend':''} ${isToday(iso)?'today':''}" data-agenda-day="${iso}"><div class="agenda-day-number-v150">${day.getDate()}</div>${shown.map(e=>{const meta=typeMeta[e.event_type]||typeMeta.diger;return `<button class="agenda-card-v150 ${meta.cls}" data-agenda-id="${e.id}"><b>${esc(firmNameLocal(e))}</b><small>${e.start_time?String(e.start_time).slice(0,5)+' · ':''}${esc(e.title)}</small></button>`;}).join('')}${dayEvents.length>3?`<div class="agenda-more-v150">+${dayEvents.length-3} plan daha</div>`:''}</div>`);
    }
    grid.innerHTML=cells.join('');
    grid.querySelectorAll('[data-agenda-id]').forEach(b=>b.onclick=e=>{e.stopPropagation();selectedAgendaId=b.dataset.agendaId;renderDetail();});
    grid.querySelectorAll('[data-agenda-day]').forEach(c=>c.onclick=()=>openAgendaModal(null,c.dataset.agendaDay));
  }

  function renderDetail(){
    const host=document.getElementById('agendaDetailV150'); if(!host)return;
    const e=agendaEvents.find(x=>x.id===selectedAgendaId);
    if(!e){
      const upcoming=[...agendaEvents].filter(x=>x.status!=='iptal'&&x.event_date>=isoDate(new Date())).slice(0,6);
      host.innerHTML=`<div class="agenda-empty-detail-v150">Takvimde bir plana tıklayarak detayını görüntüleyebilirsin.</div>${upcomingHtml(upcoming)}`;bindUpcoming();return;
    }
    const meta=typeMeta[e.event_type]||typeMeta.diger, sm=statusMeta[e.status]||statusMeta.planlandi, names=eventAssigneeNames(e.id), manager=canManage(e), converted=!!e.converted_shoot_id;
    host.innerHTML=`<span class="agenda-status-v150 ${sm.cls}">${sm.label}</span><h3 class="agenda-detail-title-v150">${esc(e.title)}</h3><div class="agenda-detail-client-v150">${meta.icon} ${esc(meta.label)} · ${esc(firmNameLocal(e))}</div>
      <div class="agenda-detail-row-v150"><span>Tarih</span><b>${dateTR(e.event_date)}</b></div><div class="agenda-detail-row-v150"><span>Saat</span><b>${esc(timeText(e))}</b></div><div class="agenda-detail-row-v150"><span>Lokasyon</span><b>${esc(e.location||'—')}</b></div><div class="agenda-detail-row-v150"><span>Sorumlular</span><div class="agenda-person-chips-v150">${names.length?names.map(n=>`<span class="agenda-person-chip-v150">${esc(n)}</span>`).join(''):'—'}</div></div><div class="agenda-detail-row-v150"><span>Not</span><div>${esc(e.notes||'—')}</div></div>${converted?'<div class="info-banner" style="margin-top:10px"><b>✓ Çekime dönüştürüldü.</b> Bu plan gerçek Çekimler kaydına aktarıldı.</div>':''}
      <div class="agenda-detail-actions-v150">${manager?`<button class="ghost" id="agendaEditV150">Düzenle</button><button class="small-danger" id="agendaDeleteV150">Sil</button>`:''}${e.event_type==='cekim'&&!converted&&e.status!=='iptal'&&canConvert(e)?`<button class="primary" id="agendaConvertV150" style="grid-column:1/-1">✓ Çekime Dönüştür</button>`:''}</div>${upcomingHtml([...agendaEvents].filter(x=>x.id!==e.id&&x.status!=='iptal'&&x.event_date>=isoDate(new Date())).slice(0,5))}`;
    document.getElementById('agendaEditV150')?.addEventListener('click',()=>openAgendaModal(e));
    document.getElementById('agendaDeleteV150')?.addEventListener('click',()=>deleteAgenda(e));
    document.getElementById('agendaConvertV150')?.addEventListener('click',()=>openConvertModal(e));
    bindUpcoming();
  }

  function upcomingHtml(list){return `<div class="agenda-upcoming-v150"><h4>Yaklaşan Planlar</h4>${list.length?list.map(e=>`<div class="agenda-upcoming-item-v150" data-upcoming-agenda="${e.id}"><div class="agenda-upcoming-date-v150">${dateTR(e.event_date).slice(0,5)}</div><div><b>${esc(firmNameLocal(e))}</b><small>${esc(e.title)}${e.start_time?' · '+String(e.start_time).slice(0,5):''}</small></div><span class="agenda-status-v150 ${(statusMeta[e.status]||statusMeta.planlandi).cls}">${(statusMeta[e.status]||statusMeta.planlandi).label}</span></div>`).join(''):'<div class="muted" style="font-size:9px">Yaklaşan plan yok.</div>'}</div>`;}
  function bindUpcoming(){document.querySelectorAll('[data-upcoming-agenda]').forEach(x=>x.onclick=()=>{selectedAgendaId=x.dataset.upcomingAgenda;renderDetail();});}

  function targetMode(e){if(e?.firm_id)return'registered';if(e?.external_client_name)return'external';return'agency';}
  function activePeople(){return (state.profiles||[]).filter(p=>p.active);}
  function activeFirmList(){return typeof activeFirms==='function'?activeFirms():(state.firms||[]).filter(f=>f.active);}

  function openAgendaModal(e=null,prefillDate=null){
    const mode=targetMode(e), assignees=e?eventAssigneeIds(e.id):[profile.id], firms=activeFirmList(), people=activePeople();
    const d=prefillDate||e?.event_date||isoDate(new Date());
    openModal(e?'Planı Düzenle':'Yeni Plan',`<div class="form-grid">
      <div class="field"><label>Plan Türü</label><select name="event_type" id="agendaTypeInputV150"><option value="cekim" ${e?.event_type==='cekim'?'selected':''}>Çekim</option><option value="toplanti" ${e?.event_type==='toplanti'?'selected':''}>Toplantı</option><option value="teslim" ${e?.event_type==='teslim'?'selected':''}>Teslim</option><option value="paylasim" ${e?.event_type==='paylasim'?'selected':''}>Paylaşım</option><option value="diger" ${e?.event_type==='diger'?'selected':''}>Diğer</option></select></div>
      <div class="field"><label>Durum</label><select name="status"><option value="planlandi" ${(e?.status||'planlandi')==='planlandi'?'selected':''}>Planlandı</option><option value="tamamlandi" ${e?.status==='tamamlandi'?'selected':''}>Tamamlandı</option><option value="iptal" ${e?.status==='iptal'?'selected':''}>İptal</option></select></div>
      <div class="field full"><label>Plan Kimin İçin?</label><select name="target_mode" id="agendaTargetModeV150"><option value="registered" ${mode==='registered'?'selected':''}>Kayıtlı Firma</option><option value="external" ${mode==='external'?'selected':''}>Harici Müşteri / Kişi</option><option value="agency" ${mode==='agency'?'selected':''}>Ajans İçi</option></select><div class="agenda-help-v150">Harici isim yalnızca Ajanda kaydında tutulur; Firmalar listesine eklenmez.</div></div>
      <div class="field full" id="agendaFirmFieldV150"><label>Firma</label><select name="firm"><option value="">Seç</option>${firms.map(f=>`<option value="${f.id}" ${e?.firm_id===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div class="field full" id="agendaExternalFieldV150"><label>Harici Müşteri / Kişi</label><input name="external_client" maxlength="120" value="${esc(e?.external_client_name||'')}" placeholder="Örn. ABC Marka / Ahmet Yılmaz"></div>
      <div class="field full"><label>Plan Başlığı</label><input name="title" required maxlength="160" value="${esc(e?.title||'')}" placeholder="Örn. Aylık sosyal medya çekimi"></div>
      <div class="field"><label>Tarih</label><input name="date" type="date" required value="${d}"></div><div class="field"><label>Başlangıç Saati</label><input name="start_time" type="time" value="${e?.start_time?String(e.start_time).slice(0,5):''}"></div><div class="field"><label>Bitiş Saati</label><input name="end_time" type="time" value="${e?.end_time?String(e.end_time).slice(0,5):''}"></div><div class="field"><label>Lokasyon</label><input name="location" value="${esc(e?.location||'')}" placeholder="Örn. Kıranköy / Firma adresi"></div>
      <div class="field full"><label>Sorumlular</label><div class="agenda-assignee-grid-v150">${people.map(p=>`<label class="agenda-assignee-option-v150"><input type="checkbox" name="assignee" value="${p.id}" ${assignees.includes(p.id)?'checked':''}><span>${esc(p.full_name)}</span></label>`).join('')}</div></div>
      <div class="field full"><label>Notlar</label><textarea name="notes" placeholder="Çekim detayı, içerik planı, ekipman veya teslim notu...">${esc(e?.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div></div>`,async fd=>{
        const type=String(fd.get('event_type')||'cekim'), tm=String(fd.get('target_mode')||'registered'), firmId=tm==='registered'?(String(fd.get('firm')||'').trim()||null):null, external=tm==='external'?String(fd.get('external_client')||'').trim():null, ids=fd.getAll('assignee').map(String);
        if(tm==='registered'&&!firmId) throw new Error('Firma seçmelisin.');
        if(tm==='external'&&(!external||external.length<2)) throw new Error('Harici müşteri / kişi adını yazmalısın.');
        if(tm==='agency'&&!['toplanti','diger'].includes(type)) throw new Error('Ajans içi plan için Toplantı veya Diğer türünü seçmelisin.');
        if(!ids.length) throw new Error('En az bir sorumlu seçmelisin.');
        const {data,error}=await sb.rpc('save_agenda_event',{p_event_id:e?.id||null,p_title:String(fd.get('title')||'').trim(),p_event_type:type,p_status:String(fd.get('status')||'planlandi'),p_event_date:fd.get('date'),p_start_time:fd.get('start_time')||null,p_end_time:fd.get('end_time')||null,p_firm_id:firmId,p_external_client_name:external,p_location:String(fd.get('location')||'').trim()||null,p_notes:String(fd.get('notes')||'').trim()||null,p_assignee_ids:ids});
        if(error) throw error; selectedAgendaId=data; selectedMonth=String(fd.get('date')).slice(0,7)+'-01'; setTimeout(loadAgenda,80);
      });
    setTimeout(()=>{const modeSel=document.getElementById('agendaTargetModeV150'),firmField=document.getElementById('agendaFirmFieldV150'),extField=document.getElementById('agendaExternalFieldV150');const sync=()=>{const v=modeSel?.value||'registered';if(firmField)firmField.style.display=v==='registered'?'':'none';if(extField)extField.style.display=v==='external'?'':'none';};modeSel?.addEventListener('change',sync);sync();},0);
  }

  async function deleteAgenda(e){
    if(!canManage(e))return; if(!confirm('Bu plan silinsin mi?'))return;
    const {error}=await sb.from('agenda_events').delete().eq('id',e.id); if(error)return toast(error.message,true); selectedAgendaId=null; await loadAgenda(); toast('Plan silindi.');
  }

  function openConvertModal(e){
    const ids=eventAssigneeIds(e.id), people=activePeople(), defaultPerson=ids[0]||profile.id;
    openModal('Çekime Dönüştür',`<div class="form-grid"><div class="field full"><div class="info-banner"><b>${esc(firmNameLocal(e))}</b> · ${esc(e.title)}<br>Bu işlem Çekimler bölümünde gerçek bir çekim kaydı oluşturur ve planı Tamamlandı yapar.</div></div><div class="field"><label>Çekilen Video İçeriği</label><input name="video_count" type="number" min="1" step="1" value="1" required></div><div class="field"><label>Çekim Türü</label><select name="category"><option value="firma">Firma Çekimi</option><option value="takim">Takım / Antrenman / Deplasman</option></select></div><div class="field full"><label>Sorumlu Personel</label><select name="person">${people.map(p=>`<option value="${p.id}" ${p.id===defaultPerson?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Çekim Kaydı Oluştur</button></div></div>`,async fd=>{
      const count=Number(fd.get('video_count'));if(!Number.isInteger(count)||count<1)throw new Error('Video içeriği en az 1 olmalı.');
      const {error}=await sb.rpc('convert_agenda_event_to_shoot',{p_event_id:e.id,p_video_count:count,p_shoot_category:String(fd.get('category')||'firma'),p_responsible_id:String(fd.get('person'))});if(error)throw error;await loadAgenda();
    });
  }

  function shiftMonth(delta){const d=monthDate();const n=new Date(d.getFullYear(),d.getMonth()+delta,1);selectedMonth=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01`;augmentMonthPicker();const p=document.getElementById('monthPicker');if(p)p.value=selectedMonth;selectedAgendaId=null;loadAgenda();}
  function goToday(){const d=new Date();selectedMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;augmentMonthPicker();const p=document.getElementById('monthPicker');if(p)p.value=selectedMonth;selectedAgendaId=null;loadAgenda();}
  function openAgendaView(){ensureUI();setView('agenda');const t=document.getElementById('pageTitle'),s=document.getElementById('pageSub');if(t)t.textContent='Ajanda / Çekim Planı';if(s)s.textContent='Aylık çekim, toplantı, teslim ve ajans planlamasını tek yerden yönet.';loadAgenda();}

  ensureUI();
  // Keep future months available in the global month picker.
  if(typeof renderMonths==='function'){
    const previousRenderMonths=renderMonths;
    renderMonths=function(){previousRenderMonths();augmentMonthPicker();};
  }
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker'){setTimeout(()=>{if(document.getElementById('agenda')?.classList.contains('active-view'))loadAgenda();},80);}});
  // Generic nav listener may not know the dynamically added view title, so enforce it here.
  document.querySelector('.nav-item[data-view="agenda"]')?.addEventListener('click',openAgendaView);
  setTimeout(()=>{ensureUI();if(document.getElementById('agenda')?.classList.contains('active-view'))loadAgenda();},300);
})();
