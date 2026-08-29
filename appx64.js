// V1.21.5 — Ekstra İşler artık atanabilir ve durum bazlı takip edilebilir görev akışıdır.
(function bootExtraAssignmentTrackingV215(){
  if(window.__mindsExtraAssignmentTrackingV215)return;
  if(!window.__mindsExtraWorkTypesV140||!window.__mindsExtrasByPersonV179||typeof state==='undefined'||typeof openModal!=='function'||typeof sb==='undefined'){
    setTimeout(bootExtraAssignmentTrackingV215,140);return;
  }
  window.__mindsExtraAssignmentTrackingV215=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const typeMeta={adaptasyon:['Ekstra Post / Adaptasyon','×1'],video_edit:['Video Edit','×1,5'],cekim:['Çekim / Prodüksiyon','×1,5'],logo_kurumsal:['Logo / Kurumsal Kimlik','×2'],katalog_brosur:['Katalog / Broşür','×2'],acik_hava_matbaa:['Açık Hava / Matbaa','×1,5'],diger:['Diğer','×1']};
  const statusMeta={waiting:['Bekliyor','waiting'],in_progress:['Devam Ediyor','progress'],review:['Kontrol Bekliyor','review'],completed:['Tamamlandı','done']};
  const isAdminLocal=()=>typeof isAdmin==='function'&&isAdmin();
  const personById=id=>(state.profiles||[]).find(p=>String(p.id)===String(id));
  const personNameSafe=id=>personById(id)?.full_name||'Personel';
  const typeLabel=v=>(typeMeta[v]||typeMeta.diger)[0];
  const typeWeight=v=>(typeMeta[v]||typeMeta.diger)[1];
  const today=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${o.year}-${o.month}-${o.day}`;};
  const statusOf=x=>statusMeta[x?.task_status]||statusMeta.completed;
  const activeStaff=()=>typeof activeProfiles==='function'?activeProfiles().filter(p=>p.role!=='admin'):(state.profiles||[]).filter(p=>p.active&&p.role!=='admin');
  const rowsForMonth=()=>typeof monthExtras==='function'?monthExtras():(state.extras||[]).filter(x=>x.month===selectedMonth&&(isAdminLocal()||x.person_id===profile?.id));
  const canEditMeta=x=>isAdminLocal()||(x?.source==='staff'&&x?.person_id===profile?.id&&x?.created_by===profile?.id&&x?.task_status!=='completed');

  function overdueDays(x){
    if(!x?.due_date||x.task_status==='completed'||x.due_date>=today())return 0;
    return Math.max(1,Math.floor((Date.parse(today()+'T00:00:00Z')-Date.parse(x.due_date+'T00:00:00Z'))/86400000));
  }
  function clientName(x){
    if(x.kind==='ajans')return 'Ajans İçi';
    if(x.firm_id){const f=typeof firm==='function'?firm(x.firm_id):(state.firms||[]).find(v=>v.id===x.firm_id);return f?.name||'Kayıtlı Firma';}
    return x.external_client_name||'Harici Müşteri';
  }
  function targetBadge(x){if(x.kind==='ajans')return '<span class="badge blue">Ajans İçi</span>';if(x.firm_id)return '<span class="badge green">Kayıtlı Firma</span>';return '<span class="badge yellow">Harici</span>';}
  function dateText(v){return typeof formatDate==='function'?formatDate(v):esc(v||'—');}

  function installStyles(){
    if(document.getElementById('extraTrackingV215Style'))return;
    const s=document.createElement('style');s.id='extraTrackingV215Style';s.textContent=`
      #extras .extra-track-kpis-v215{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:13px 0 14px}
      #extras .extra-track-kpi-v215{border:1px solid #2d383e;border-radius:11px;background:#10171b;padding:12px 13px;min-height:75px;display:flex;flex-direction:column;justify-content:center}
      #extras .extra-track-kpi-v215 small{font-size:9px;color:#829097;text-transform:uppercase;letter-spacing:.35px}#extras .extra-track-kpi-v215 b{font-size:20px;margin-top:5px;color:#eef2f3}
      #extras .extra-track-kpi-v215.waiting b{color:#e3c260}#extras .extra-track-kpi-v215.progress b{color:#71b8ea}#extras .extra-track-kpi-v215.review b{color:#c79be5}#extras .extra-track-kpi-v215.done b{color:#8dd19a}#extras .extra-track-kpi-v215.late b{color:#ef8f88}
      #extras .extra-person-grid-v179{grid-template-columns:repeat(auto-fit,minmax(360px,1fr))}
      #extras .extra-person-head-v179{align-items:flex-start}#extras .extra-person-head-copy-v215{display:flex;flex-direction:column;gap:5px;min-width:0}
      #extras .extra-person-state-v215{display:flex;gap:5px;flex-wrap:wrap;font-size:8px;color:#89969c}#extras .extra-person-state-v215 span{border:1px solid #344047;border-radius:999px;padding:3px 6px;background:#151c20}
      #extras .extra-item-v179{position:relative;padding:14px 14px 13px}#extras .extra-item-v179.is-late-v215{box-shadow:inset 3px 0 0 #b9524d;background:linear-gradient(90deg,rgba(122,42,39,.13),transparent 35%)}
      #extras .extra-task-status-v215{display:inline-flex;align-items:center;border:1px solid #414b50;border-radius:999px;padding:5px 8px;font-size:8px;font-weight:900;letter-spacing:.15px;white-space:nowrap}
      #extras .extra-task-status-v215.waiting{background:#302913;border-color:#665524;color:#e6c966}#extras .extra-task-status-v215.progress{background:#14283a;border-color:#315a78;color:#83c0ea}#extras .extra-task-status-v215.review{background:#2b1b35;border-color:#604376;color:#c99ce2}#extras .extra-task-status-v215.done{background:#17301e;border-color:#346043;color:#91d09c}
      #extras .extra-due-v215{margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:9px;color:#8f9ca2}#extras .extra-due-v215 strong{color:#dce3e5}.extra-late-v215{color:#ef918b!important;font-weight:900}
      #extras .extra-completion-note-v215{margin-top:8px;border-left:2px solid #6b5e22;padding:6px 8px;background:#17190f;color:#cfc987;font-size:9px;line-height:1.45;border-radius:0 7px 7px 0}
      #extras .extra-item-actions-v179{margin-top:11px}#extras .extra-item-actions-v179 button{font-size:9px!important;font-weight:800!important;padding:7px 9px!important}
      #extras .extra-action-start-v215{border-color:#315a78!important;background:#14283a!important;color:#83c0ea!important}#extras .extra-action-submit-v215{border-color:#604376!important;background:#2b1b35!important;color:#c99ce2!important}#extras .extra-action-approve-v215{border-color:#346043!important;background:#17301e!important;color:#91d09c!important}
      #dashboard #extraLateDashboardV215 .value{color:#ef918b}
      @media(max-width:1100px){#extras .extra-track-kpis-v215{grid-template-columns:repeat(3,1fr)}}@media(max-width:760px){#extras .extra-track-kpis-v215{grid-template-columns:repeat(2,1fr)}#extras .extra-person-grid-v179{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function patchHeader(){
    const section=document.getElementById('extras');if(!section)return;
    const h=section.querySelector('.section-actions h2'),p=section.querySelector('.section-actions p'),b=document.getElementById('addExtraBtn');
    if(h)h.textContent=isAdminLocal()?'Ekstra İşler':'Ekstra Görevlerim';
    if(p)p.textContent=isAdminLocal()?'Ekibe görev ata, teslim tarihini ve ilerleme durumunu takip et.':'Sana atanmış ekstra görevleri başlat, tamamla ve yöneticinin kontrolüne gönder.';
    if(b)b.textContent=isAdminLocal()?'+ Ekstra İş Ver':'+ Ekstra İş Bildir';
    const nav=document.querySelector('.nav-item[data-view="extras"] span');if(nav&&!isAdminLocal())nav.textContent='Ekstra Görevlerim';
    const info=section.querySelector('.info-banner');if(info)info.innerHTML=isAdminLocal()?'<b>Görev akışı:</b> Bekliyor → Devam Ediyor → Kontrol Bekliyor → Tamamlandı. Yalnızca yönetici onayından geçen tamamlanmış işler performansa katkı verir.':'<b>Görev akışı:</b> Sana verilen işi Başladım ile aç, bitirince Tamamladım diyerek yöneticinin kontrolüne gönder.';
  }

  function ensureKpis(rows){
    const section=document.getElementById('extras');if(!section)return;
    let host=document.getElementById('extraTrackKpisV215');if(!host){host=document.createElement('div');host.id='extraTrackKpisV215';host.className='extra-track-kpis-v215';section.querySelector('.info-banner')?.insertAdjacentElement('afterend',host);}
    const c={waiting:0,in_progress:0,review:0,completed:0,late:0};rows.forEach(x=>{if(c[x.task_status]!==undefined)c[x.task_status]++;if(overdueDays(x))c.late++;});
    host.innerHTML=`<div class="extra-track-kpi-v215 waiting"><small>Bekleyen</small><b>${c.waiting}</b></div><div class="extra-track-kpi-v215 progress"><small>Devam Eden</small><b>${c.in_progress}</b></div><div class="extra-track-kpi-v215 review"><small>Kontrol Bekleyen</small><b>${c.review}</b></div><div class="extra-track-kpi-v215 done"><small>Tamamlanan</small><b>${c.completed}</b></div><div class="extra-track-kpi-v215 late"><small>Geciken</small><b>${c.late}</b></div>`;
  }

  function patchDashboard(rows){
    if(!isAdminLocal())return;const stats=document.getElementById('stats');if(!stats)return;
    let card=document.getElementById('extraLateDashboardV215');if(!card){card=document.createElement('div');card.className='stat';card.id='extraLateDashboardV215';stats.appendChild(card);}
    const late=rows.filter(overdueDays).length;card.innerHTML=`<div class="label">Geciken Ekstra İş</div><div class="value">${late}</div><div class="foot"><b>${typeof prettyMonth==='function'?prettyMonth(selectedMonth):selectedMonth}</b> takibi</div>`;
  }

  function personActions(x){
    if(isAdminLocal()){
      const primary=x.task_status==='completed'?`<button class="ghost" data-extra-reopen-v215="${x.id}">Tekrar Aç</button>`:`<button class="extra-action-approve-v215" data-extra-approve-v215="${x.id}">${x.task_status==='review'?'Onayla':'Tamamlandı Yap'}</button>`;
      return `${primary}${canEditMeta(x)?`<button class="small-primary" data-edit-extra="${x.id}">Düzenle</button>`:''}<button class="small-danger" data-delete-extra="${x.id}">Sil</button>`;
    }
    if(String(x.person_id)!==String(profile?.id))return '';
    if(x.task_status==='waiting')return `<button class="extra-action-start-v215" data-extra-start-v215="${x.id}">Başladım</button>${canEditMeta(x)?`<button class="small-primary" data-edit-extra="${x.id}">Düzenle</button>`:''}`;
    if(x.task_status==='in_progress')return `<button class="extra-action-submit-v215" data-extra-submit-v215="${x.id}">Tamamladım</button>${canEditMeta(x)?`<button class="small-primary" data-edit-extra="${x.id}">Düzenle</button>`:''}`;
    if(x.task_status==='review')return '<span class="muted">Yönetici kontrolü bekleniyor.</span>';
    return '<span class="muted">✓ Yönetici onayladı.</span>';
  }

  function rowHtml(x){
    const st=statusOf(x),late=overdueDays(x);return `<div class="extra-item-v179 ${late?'is-late-v215':''}">
      <div class="extra-item-top-v179"><div class="extra-client-v179" title="${esc(clientName(x))}">${esc(clientName(x))}</div><span class="extra-task-status-v215 ${st[1]}">${esc(st[0])}</span></div>
      <div class="extra-title-v179">${esc(x.title||'Ekstra İş')}</div>
      <div class="extra-meta-v179">${targetBadge(x)}<span class="badge blue">${esc(typeLabel(x.extra_work_type))}</span><span>${esc(typeWeight(x.extra_work_type))} katkı</span><span>•</span><span>${Number(x.quantity||0)} adet</span><span>•</span><span>${x.source==='admin'?'Yönetici atadı':'Personel bildirdi'}</span></div>
      <div class="extra-due-v215"><span>Atama / kayıt: <strong>${dateText(x.work_date)}</strong></span><span class="${late?'extra-late-v215':''}">${late?`GECİKTİ · ${late} gün`:`Teslim: ${dateText(x.due_date||x.work_date)}`}</span></div>
      ${x.notes?`<div class="muted" style="margin-top:7px;line-height:1.4">${esc(x.notes)}</div>`:''}${x.completion_note?`<div class="extra-completion-note-v215">Teslim notu: ${esc(x.completion_note)}</div>`:''}
      <div class="extra-item-actions-v179">${personActions(x)}</div></div>`;
  }

  function sortedPeople(rows){
    const ids=[...new Set(rows.map(x=>String(x.person_id||'')).filter(Boolean))],order=new Map((state.profiles||[]).map((p,i)=>[String(p.id),i]));
    return ids.sort((a,b)=>(order.get(a)??999)-(order.get(b)??999)||personNameSafe(a).localeCompare(personNameSafe(b),'tr'));
  }

  function renderExtrasV215(){
    installStyles();patchHeader();const rows=rowsForMonth().slice().sort((a,b)=>{
      const rank={review:0,waiting:1,in_progress:2,completed:3};const ar=rank[a.task_status]??4,br=rank[b.task_status]??4;if(ar!==br)return ar-br;
      return String(a.due_date||a.work_date||'').localeCompare(String(b.due_date||b.work_date||''));
    });
    ensureKpis(rows);patchDashboard(rows);
    const tbody=document.getElementById('extraRows'),wrap=tbody?.closest('.table-wrap'),panel=tbody?.closest('.panel');if(wrap)wrap.classList.add('extra-original-table-v179');if(!panel)return;
    let grid=document.getElementById('extraPersonGridV179');if(!grid){grid=document.createElement('div');grid.id='extraPersonGridV179';grid.className='extra-person-grid-v179';panel.insertBefore(grid,wrap||panel.firstChild);}
    if(!rows.length){grid.innerHTML='<div class="extra-grid-empty-v179">Bu ay ekstra görev yok.</div>';if(tbody)tbody.innerHTML='';return;}
    grid.innerHTML=sortedPeople(rows).map(pid=>{const list=rows.filter(x=>String(x.person_id)===pid),c={waiting:0,in_progress:0,review:0,completed:0};list.forEach(x=>{if(c[x.task_status]!==undefined)c[x.task_status]++;});return `<section class="extra-person-card-v179"><div class="extra-person-head-v179"><div class="extra-person-head-copy-v215"><h3>${esc(personNameSafe(pid))}</h3><div class="extra-person-state-v215"><span>${c.waiting} bekleyen</span><span>${c.in_progress} devam</span><span>${c.review} kontrol</span><span>${c.completed} tamam</span></div></div><span class="extra-person-count-v179">${list.length}</span></div><div class="extra-person-body-v179">${list.map(rowHtml).join('')}</div></section>`;}).join('');
    if(tbody)tbody.innerHTML='';
  }

  function openExtraModalV215(x=null){
    if(x&&!canEditMeta(x))return toast('Bu görevin ayrıntılarını düzenleme yetkin yok.',true);
    const admin=isAdminLocal(),available=typeof activeFirms==='function'?activeFirms():(state.firms||[]).filter(f=>f.active),mode=x?.kind==='ajans'?'agency':x?.external_client_name?'external':'registered',selectedPerson=x?.person_id||profile?.id,selectedType=x?.extra_work_type||'diger';
    const defaultDate=x?.work_date||(typeof defaultDateForSelectedMonth==='function'?defaultDateForSelectedMonth():today()),defaultDue=x?.due_date||defaultDate;
    openModal(x?'Ekstra Görevi Düzenle':(admin?'Ekstra İş Ver':'Ekstra İş Bildir'),`<div class="form-grid">
      <div class="field full"><label>İş Kimin İçin?</label><select name="target_mode" id="extraTargetModeV215"><option value="registered" ${mode==='registered'?'selected':''}>Kayıtlı Firma</option><option value="external" ${mode==='external'?'selected':''}>Harici Müşteri / Kişi</option><option value="agency" ${mode==='agency'?'selected':''}>Ajans İçi</option></select></div>
      <div class="field full" id="extraRegisteredFirmV215"><label>Kayıtlı Firma</label><select name="firm"><option value="">Seç</option>${available.map(f=>`<option value="${f.id}" ${x?.firm_id===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div class="field full" id="extraExternalClientV215"><label>Harici Müşteri / Kişi Adı</label><input name="external_client" maxlength="120" value="${esc(x?.external_client_name||'')}"></div>
      ${admin?`<div class="field full"><label>Sorumlu Personel</label><select name="person" required><option value="">Sorumlu seç</option>${activeStaff().map(p=>`<option value="${p.id}" ${p.id===selectedPerson?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select><div class="field-help">Görev kaydedildiği anda personelin Ekstra Görevlerim ekranına düşer.</div></div>`:`<input type="hidden" name="person" value="${profile.id}">`}
      <div class="field full"><label>Ekstra İş Türü</label><select name="extra_type">${Object.entries(typeMeta).map(([k,v])=>`<option value="${k}" ${k===selectedType?'selected':''}>${esc(v[0])} · ${esc(v[1])}</option>`).join('')}</select></div>
      <div class="field full"><label>Görev / Yapılacak İş</label><input name="title" required value="${esc(x?.title||'')}" placeholder="Örn. Reels edit / katalog tasarımı"></div>
      <div class="field"><label>Adet</label><input name="qty" type="number" min="1" step="1" required value="${x?.quantity??1}"></div>
      <div class="field"><label>${admin?'Atama Tarihi':'Yapıldığı Tarih'}</label><input name="date" type="date" required value="${defaultDate}"></div>
      <div class="field full"><label>${admin?'Teslim Tarihi':'Teslim / Bildirim Tarihi'}</label><input name="due_date" type="date" required value="${defaultDue}"><div class="field-help">Teslim tarihi geçerse görev otomatik GECİKTİ olarak işaretlenir.</div></div>
      <div class="field full"><label>Not / Açıklama</label><textarea name="notes" rows="3">${esc(x?.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">${x?'Kaydet':(admin?'Görevi Ata':'Kontrole Gönder')}</button></div></div>`,async fd=>{
        const targetMode=String(fd.get('target_mode')||'registered'),fid=String(fd.get('firm')||'').trim()||null,external=String(fd.get('external_client')||'').trim(),extraType=String(fd.get('extra_type')||'diger'),personId=String(fd.get('person')||'').trim(),date=String(fd.get('date')||''),due=String(fd.get('due_date')||'');
        if(targetMode==='registered'&&!fid)throw new Error('Kayıtlı firma seçmelisin.');if(targetMode==='external'&&external.length<2)throw new Error('Harici müşteri / kişi adını yazmalısın.');if(!personId)throw new Error('Sorumlu personel seçmelisin.');if(typeof assertSelectedMonthDate==='function'){assertSelectedMonthDate(date,admin?'Atama tarihi':'İş tarihi');assertSelectedMonthDate(due,'Teslim tarihi');}if(due<date)throw new Error('Teslim tarihi atama tarihinden önce olamaz.');const q=Number(fd.get('qty'));if(!Number.isInteger(q)||q<1)throw new Error('Adet en az 1 olmalı.');
        const payload={month:selectedMonth,kind:targetMode==='agency'?'ajans':'firma',firm_id:targetMode==='registered'?fid:null,external_client_name:targetMode==='external'?external:null,extra_work_type:extraType,title:String(fd.get('title')||'').trim(),quantity:q,person_id:personId,work_date:date,due_date:due,notes:String(fd.get('notes')||'').trim()||null};
        if(x){const {error}=await sb.from('extra_works').update(payload).eq('id',x.id);if(error)throw error;}else{payload.source=admin?'admin':'staff';payload.created_by=profile.id;payload.task_status=admin?'waiting':'review';if(!admin){payload.started_at=new Date().toISOString();payload.submitted_at=new Date().toISOString();}const {error}=await sb.from('extra_works').insert(payload);if(error)throw error;}
      });
    setTimeout(()=>{const modeSel=document.getElementById('extraTargetModeV215'),reg=document.getElementById('extraRegisteredFirmV215'),ext=document.getElementById('extraExternalClientV215');const sync=()=>{const v=modeSel?.value||'registered';if(reg)reg.style.display=v==='registered'?'':'none';if(ext)ext.style.display=v==='external'?'':'none';};modeSel?.addEventListener('change',sync);sync();},0);
  }

  async function rpc(name,args){const {error}=await sb.rpc(name,args);if(error)throw error;await loadData();}
  function submitTask(id){const x=(state.extras||[]).find(v=>v.id===id);if(!x)return;openModal('Ekstra Görevi Tamamla',`<div class="form-grid"><div class="field full"><div class="info-banner"><b>${esc(x.title)}</b><br>Görevi kontrol için yöneticiye gönderiyorsun.</div></div><div class="field full"><label>Teslim Notu</label><textarea name="note" rows="4" maxlength="500" placeholder="Ne yaptığını / teslim detayını kısaca yaz.">${esc(x.completion_note||'')}</textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kontrole Gönder</button></div></div>`,async fd=>{const {error}=await sb.rpc('extra_work_submit',{p_extra_id:id,p_note:String(fd.get('note')||'').trim()||null});if(error)throw error;});}

  document.addEventListener('click',async e=>{
    const start=e.target.closest('[data-extra-start-v215]');if(start){e.preventDefault();try{await rpc('extra_work_start',{p_extra_id:start.dataset.extraStartV215});toast('Görev Devam Ediyor durumuna alındı.');}catch(err){toast(friendlyError(err),true);}return;}
    const submit=e.target.closest('[data-extra-submit-v215]');if(submit){e.preventDefault();submitTask(submit.dataset.extraSubmitV215);return;}
    const approve=e.target.closest('[data-extra-approve-v215]');if(approve){e.preventDefault();try{await rpc('extra_work_approve',{p_extra_id:approve.dataset.extraApproveV215});toast('Ekstra görev onaylandı ve performansa işlendi.');}catch(err){toast(friendlyError(err),true);}return;}
    const reopen=e.target.closest('[data-extra-reopen-v215]');if(reopen){e.preventDefault();if(!confirm('Bu görevi tekrar Bekliyor durumuna almak istiyor musun?'))return;try{await rpc('extra_work_reopen',{p_extra_id:reopen.dataset.extraReopenV215});toast('Görev tekrar açıldı.');}catch(err){toast(friendlyError(err),true);}return;}
    if(e.target.closest('[data-view="extras"]'))setTimeout(()=>{patchHeader();renderExtrasV215();},90);
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(renderExtrasV215,120);});

  openExtraModal=openExtraModalV215;renderExtras=renderExtrasV215;window.openExtraModal=openExtraModalV215;window.renderExtras=renderExtrasV215;
  installStyles();setTimeout(()=>{patchHeader();renderExtrasV215();},220);
})();