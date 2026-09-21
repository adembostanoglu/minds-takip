// V1.10.1 — record edit/delete controls and tightened staff ownership UI
function canManageWork(w){ return !!w && (isAdmin() || w.assigned_to===profile?.id || w.created_by===profile?.id); }
function canManageExtra(x){ return !!x && (isAdmin() || (x.person_id===profile?.id && x.created_by===profile?.id)); }
function canManageShoot(x){ return !!x && (isAdmin() || x.responsible_id===profile?.id || x.created_by===profile?.id); }

function actionButtons(kind,id,canEdit=true){
  if(!canEdit) return '—';
  const editAttr=kind==='work'?'data-edit-work':kind==='extra'?'data-edit-extra':'data-edit-shoot';
  const delAttr=kind==='work'?'data-delete-work':kind==='extra'?'data-delete-extra':'data-delete-shoot';
  return `<div class="row-actions"><button class="small-primary" ${editAttr}="${id}">Güncelle</button><button class="small-danger" ${delAttr}="${id}">Sil</button></div>`;
}

function ensureActionHeaders(){
  const extraTable=el('extraRows')?.closest('table');
  if(extraTable){
    const tr=extraTable.querySelector('thead tr');
    if(tr && !tr.querySelector('[data-extra-action-head]')){
      const th=document.createElement('th'); th.textContent='İşlem'; th.dataset.extraActionHead='1'; tr.appendChild(th);
    }
  }
}

function renderWorks(){
  const ws=monthWorks().filter(w=>isAdmin()||staffOwnWork(w));
  el('workRows').innerHTML=ws.map(w=>{
    const fm=state.months.find(m=>m.id===w.firm_month_id), f=fm?firm(fm.firm_id):null, q=workQty(w);
    return `<tr><td>${escapeHtml(f?.name||'—')}</td><td><b>${escapeHtml(w.title)}</b>${q>1?`<div class="muted">${q} adet</div>`:''}</td><td>${typeLabel(w.type)} · ${q}</td><td><span class="badge yellow">${workStatusLabel(w.status)}</span></td><td><span class="badge ${w.share_status==='paylasildi'?'green':'orange'}">${shareLabel(w.share_status)}</span></td><td>${escapeHtml(personName(w.assigned_to))}</td><td>${formatDate(w.work_date)}</td><td>${actionButtons('work',w.id,canManageWork(w))}</td></tr>`;
  }).join('')||'<tr><td colspan="8" class="empty">Bu ay sana atanmış paket işi yok.</td></tr>';
}

function renderExtras(){
  ensureActionHeaders();
  const rows=monthExtras();
  el('extraRows').innerHTML=rows.map(x=>`<tr><td>${x.kind==='firma'?'Firma':'Ajans'}</td><td>${x.source==='staff'?'Personel':'Yönetici'}</td><td>${x.firm_id?escapeHtml(firm(x.firm_id)?.name||'—'):'Ajans İçi'}</td><td><b>${escapeHtml(x.title)}</b></td><td>${x.quantity}</td><td>${escapeHtml(personName(x.person_id))}</td><td>${formatDate(x.work_date)}</td><td>${actionButtons('extra',x.id,canManageExtra(x))}</td></tr>`).join('')||'<tr><td colspan="8" class="empty">Bu ay ekstra iş yok.</td></tr>';
}

function shootEditInfo(x){
  const total=Math.max(0,Number(x?.video_count||0));
  const done=Math.max(0,Math.min(total,Number(x?.edited_video_count||0)));
  let status=x?.delivered_at?'teslim_edildi':String(x?.edit_status||'bekliyor');
  if(status!=='teslim_edildi'){
    if(total>0&&done>=total) status='editlendi';
    else if(done>0) status='editleniyor';
    else status='bekliyor';
  }
  const meta={
    bekliyor:['Edit Bekliyor','red'],
    editleniyor:['Editleniyor','yellow'],
    editlendi:['Editlendi','green'],
    teslim_edildi:['Teslim Edildi','blue']
  }[status]||['Edit Bekliyor','red'];
  return {total,done,status,label:meta[0],cls:meta[1],pct:total?Math.round(done/total*100):0};
}

function canManageShootEdit(x){
  return !!x && (isAdmin() || x.editor_id===profile?.id || x.responsible_id===profile?.id || x.created_by===profile?.id);
}

function ensureShootEditStyles(){
  if(document.getElementById('shootEditCore262')) return;
  const s=document.createElement('style');
  s.id='shootEditCore262';
  s.textContent=`
    #shootRows tr.edit-done td{background:rgba(69,181,97,.08)}
    #shootRows tr.edit-delivered td{background:rgba(61,126,211,.08)}
    #shootRows .edit-cell{min-width:150px}
    #shootRows .edit-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
    #shootRows .edit-track{height:5px;border-radius:999px;background:#20282d;overflow:hidden}
    #shootRows .edit-fill{height:100%;border-radius:999px;background:#e6df29}
    #shootRows tr.edit-done .edit-fill{background:#53c972}
    #shootRows tr.edit-delivered .edit-fill{background:#4c8edf}
    #shootRows .edit-actions{display:flex;gap:5px;flex-wrap:wrap}
    #shoots .compact-stats{grid-template-columns:repeat(6,minmax(0,1fr))}
    @media(max-width:1200px){#shoots .compact-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
  `;
  document.head.appendChild(s);
}

function renderShoots(){
  ensureShootEditStyles();
  const sh=monthShoots();
  const infos=sh.map(shootEditInfo);
  const stats=[
    ['Çekim Kaydı',sh.length],
    ['Toplam Video',infos.reduce((s,i)=>s+i.total,0)],
    ['Edit Bekleyen',infos.filter(i=>i.status==='bekliyor').length],
    ['Editleniyor',infos.filter(i=>i.status==='editleniyor').length],
    ['Editlendi',infos.filter(i=>i.status==='editlendi').length],
    ['Teslim Edildi',infos.filter(i=>i.status==='teslim_edildi').length]
  ];
  el('shootStats').innerHTML=stats.map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value shoot-count">${v}</div><div class="foot"><b>${prettyMonth(selectedMonth)}</b> ekip verisi</div></div>`).join('');

  el('shootRows').innerHTML=sh.map(x=>{
    const i=shootEditInfo(x);
    const f=firm(x.firm_id);
    const rowClass=i.status==='editlendi'?'edit-done':i.status==='teslim_edildi'?'edit-delivered':'';
    const actions=[];
    if(canManageShootEdit(x)) actions.push(`<button class="small-primary" data-shoot-edit-core="${x.id}">Edit Takibi</button>`);
    if(canManageShoot(x)) actions.push(`<button class="small-primary" data-edit-shoot="${x.id}">Güncelle</button><button class="small-danger" data-delete-shoot="${x.id}">Sil</button>`);
    return `<tr class="${rowClass}">
      <td>${formatDate(x.shoot_date)}</td>
      <td><div class="firm-cell">${f?firmLogo(f):''}<b>${escapeHtml(f?.name||x.external_client_name||'—')}</b></div></td>
      <td><b>${escapeHtml(x.title||'Video Çekimi')}</b></td>
      <td><span class="badge blue">${i.total} Video</span></td>
      <td><div class="edit-cell"><div class="edit-top"><span class="badge ${i.cls}">${i.label}</span><b>${i.done}/${i.total}</b></div><div class="edit-track"><div class="edit-fill" style="width:${i.pct}%"></div></div></div></td>
      <td>${escapeHtml(x.editor_id?personName(x.editor_id):'Atanmadı')}</td>
      <td>${escapeHtml(personName(x.responsible_id))}</td>
      <td>${escapeHtml(x.notes||'—')}</td>
      <td><div class="edit-actions">${actions.join('')||'—'}</div></td>
    </tr>`;
  }).join('')||'<tr><td colspan="9" class="empty">Bu ay çekim kaydı yok.</td></tr>';
}

function openShootEditCore(x){
  if(!canManageShootEdit(x)) return toast('Bu çekimin edit durumunu güncelleme yetkin yok.',true);
  const i=shootEditInfo(x);
  const editor=x.editor_id||(!isAdmin()?profile.id:'');
  openModal('Edit Takibi',`<div class="form-grid">
    <div class="field full"><label>Çekim</label><input disabled value="${escapeHtml((firm(x.firm_id)?.name||x.external_client_name||'—')+' · '+(x.title||'Video Çekimi'))}"></div>
    <div class="field"><label>Toplam Video</label><input disabled value="${i.total}"></div>
    <div class="field"><label>Editlenen Video</label><input name="done" type="number" min="0" max="${i.total}" step="1" required value="${i.done}"></div>
    ${isAdmin()?`<div class="field full"><label>Editör</label><select name="editor"><option value="">Atanmadı</option>${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===editor?'selected':''}>${escapeHtml(p.full_name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="editor" value="${editor}"><div class="field full"><label>Editör</label><input disabled value="${escapeHtml(personName(editor))}"></div>`}
    <div class="field full"><label style="display:flex;align-items:center;gap:8px"><input style="width:auto" type="checkbox" name="delivered" value="1" ${i.status==='teslim_edildi'?'checked':''}> Müşteriye teslim edildi</label></div>
    <div class="field full"><div class="info-banner"><b>Durum otomatik:</b> 0/${i.total} Edit Bekliyor · ara değer Editleniyor · ${i.total}/${i.total} Editlendi.</div></div>
    <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
  </div>`,async fd=>{
    let done=Number(fd.get('done'));
    if(!Number.isInteger(done)||done<0||done>i.total) throw new Error(`Editlenen video sayısı 0 ile ${i.total} arasında olmalı.`);
    const delivered=fd.get('delivered')==='1';
    if(delivered) done=i.total;
    const status=delivered?'teslim_edildi':(i.total>0&&done>=i.total?'editlendi':done>0?'editleniyor':'bekliyor');
    const now=new Date().toISOString();
    const editorId=fd.get('editor')||x.editor_id||(!isAdmin()?profile.id:null);
    const payload={
      editor_id:editorId||null,
      edited_video_count:done,
      edit_status:status,
      edit_started_at:done>0?(x.edit_started_at||now):null,
      edited_at:(status==='editlendi'||status==='teslim_edildi')?(x.edited_at||now):null,
      delivered_at:status==='teslim_edildi'?(x.delivered_at||now):null
    };
    const {error}=await sb.from('shoots').update(payload).eq('id',x.id);
    if(error) throw error;
  });
}

function openExtraModal(x=null){
  if(x && !canManageExtra(x)) return toast('Bu ekstra işi düzenleme yetkin yok.',true);
  let available=activeFirms();
  if(x?.firm_id){ const oldFirm=firm(x.firm_id); if(oldFirm&&!available.some(f=>f.id===oldFirm.id)) available=[oldFirm,...available]; }
  const selectedPerson=x?.person_id || profile.id;
  openModal(x?'Ekstra İşi Güncelle':'Ekstra İş Ekle',`<div class="form-grid">
    <div class="field"><label>Tür</label><select name="kind"><option value="firma" ${(x?.kind||'firma')==='firma'?'selected':''}>Firma İçin Ekstra</option><option value="ajans" ${x?.kind==='ajans'?'selected':''}>Ajans İçi Ekstra</option></select></div>
    <div class="field"><label>Firma</label><select name="firm"><option value="">Seç</option>${available.map(f=>`<option value="${f.id}" ${x?.firm_id===f.id?'selected':''}>${escapeHtml(f.name)}</option>`).join('')}</select></div>
    ${isAdmin()?`<div class="field full"><label>İşi Yapan Personel</label><select name="person">${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===selectedPerson?'selected':''}>${escapeHtml(p.full_name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="person" value="${profile.id}">`}
    <div class="field full"><label>Yapılan İş</label><input name="title" required value="${escapeHtml(x?.title||'')}"></div>
    <div class="field"><label>Adet</label><input name="qty" type="number" min="1" step="1" required value="${x?.quantity??1}"></div>
    <div class="field"><label>Tarih</label><input name="date" type="date" required value="${x?.work_date||defaultDateForSelectedMonth()}"></div>
    <div class="field full"><label>Not</label><textarea name="notes">${escapeHtml(x?.notes||'')}</textarea></div>
    <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
  </div>`,async fd=>{
    const kind=fd.get('kind'), fid=fd.get('firm')||null;
    if(kind==='firma'&&!fid) throw new Error('Firma seçmelisin.');
    assertSelectedMonthDate(fd.get('date'),'Ekstra iş tarihi');
    const qty=Number(fd.get('qty')); if(!Number.isInteger(qty)||qty<1) throw new Error('Ekstra iş adedi en az 1 olmalı.');
    const targetPerson=isAdmin()?(fd.get('person')||profile.id):profile.id;
    const payload={month:selectedMonth,kind,firm_id:kind==='firma'?fid:null,title:String(fd.get('title')||'').trim(),quantity:qty,person_id:targetPerson,work_date:fd.get('date'),notes:String(fd.get('notes')||'').trim()||null};
    if(x){
      const {error}=await sb.from('extra_works').update(payload).eq('id',x.id); if(error) throw error;
    }else{
      payload.source=isAdmin()?'admin':'staff'; payload.created_by=profile.id;
      const {error}=await sb.from('extra_works').insert(payload); if(error) throw error;
    }
  });
}

async function deleteRecord(table,id,label){
  if(!confirm(`${label} silinsin mi? Bu işlem geri alınamaz.`)) return;
  const {error}=await sb.from(table).delete().eq('id',id);
  if(error) return toast('Silinemedi: '+friendlyError(error),true);
  await loadData(); toast(`${label} silindi.`);
}

document.addEventListener('click',async e=>{
  const se=e.target.closest('[data-shoot-edit-core]');
  if(se){ const x=state.shoots.find(v=>v.id===se.dataset.shootEditCore); if(x) openShootEditCore(x); return; }

  const ex=e.target.closest('[data-edit-extra]');
  if(ex){ const x=state.extras.find(v=>v.id===ex.dataset.editExtra); if(x) openExtraModal(x); return; }

  const dw=e.target.closest('[data-delete-work]');
  if(dw){ const w=state.works.find(v=>v.id===dw.dataset.deleteWork); if(!canManageWork(w)) return toast('Bu işi silme yetkin yok.',true); await deleteRecord('works',w.id,'Paket işi'); return; }

  const de=e.target.closest('[data-delete-extra]');
  if(de){ const x=state.extras.find(v=>v.id===de.dataset.deleteExtra); if(!canManageExtra(x)) return toast('Bu ekstra işi silme yetkin yok.',true); await deleteRecord('extra_works',x.id,'Ekstra iş'); return; }

  const ds=e.target.closest('[data-delete-shoot]');
  if(ds){ const x=state.shoots.find(v=>v.id===ds.dataset.deleteShoot); if(!canManageShoot(x)) return toast('Bu çekimi silme yetkin yok.',true); await deleteRecord('shoots',x.id,'Çekim kaydı'); return; }
});

setTimeout(()=>{ try{ ensureActionHeaders(); renderAll(); }catch(e){ console.warn('V1.10.1 initial render',e); } },0);

// Load V1.11 as a separate layer so the stable V1.10.1 core stays intact.
if(!document.querySelector('script[data-minds-v11]')){
  const s=document.createElement('script');
  s.src='appx7.js?v=111';
  s.dataset.mindsV11='1';
  s.onerror=()=>console.error('V1.11 module could not be loaded');
  document.body.appendChild(s);
}
