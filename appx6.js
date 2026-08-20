// V1.10.1 — record edit/delete controls and tightened staff ownership UI
function canManageWork(w){ return !!w && (isAdmin() || w.assigned_to===profile?.id || w.created_by===profile?.id); }
function canManageExtra(x){ return !!x && (isAdmin() || x.person_id===profile?.id); }
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

function renderShoots(){
  const sh=monthShoots();
  const firmCount=new Set(sh.map(x=>x.firm_id)).size, videoCount=sh.reduce((sum,x)=>sum+(x.video_count||0),0);
  el('shootStats').innerHTML=[['Çekim Kaydı',sh.length],['Çekim Yapılan Firma',firmCount],['Toplam Video İçeriği',videoCount]].map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value shoot-count">${v}</div><div class="foot"><b>${prettyMonth(selectedMonth)}</b> verisi</div></div>`).join('');
  el('shootRows').innerHTML=sh.map(x=>`<tr><td>${formatDate(x.shoot_date)}</td><td><div class="firm-cell">${firm(x.firm_id)?firmLogo(firm(x.firm_id)):''}<b>${escapeHtml(firm(x.firm_id)?.name||'—')}</b></div></td><td><b>${escapeHtml(x.title||'Video Çekimi')}</b></td><td><span class="badge blue">${x.video_count||0} Video</span></td><td>${escapeHtml(personName(x.responsible_id))}</td><td>${escapeHtml(x.notes||'—')}</td><td>${actionButtons('shoot',x.id,canManageShoot(x))}</td></tr>`).join('')||'<tr><td colspan="7" class="empty">Bu ay çekim kaydı yok.</td></tr>';
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
  const ex=e.target.closest('[data-edit-extra]');
  if(ex){ const x=state.extras.find(v=>v.id===ex.dataset.editExtra); if(x) openExtraModal(x); return; }

  const dw=e.target.closest('[data-delete-work]');
  if(dw){ const w=state.works.find(v=>v.id===dw.dataset.deleteWork); if(!canManageWork(w)) return toast('Bu işi silme yetkin yok.',true); await deleteRecord('works',w.id,'Paket işi'); return; }

  const de=e.target.closest('[data-delete-extra]');
  if(de){ const x=state.extras.find(v=>v.id===de.dataset.deleteExtra); if(!canManageExtra(x)) return toast('Bu ekstra işi silme yetkin yok.',true); await deleteRecord('extra_works',x.id,'Ekstra iş'); return; }

  const ds=e.target.closest('[data-delete-shoot]');
  if(ds){ const x=state.shoots.find(v=>v.id===ds.dataset.deleteShoot); if(!canManageShoot(x)) return toast('Bu çekimi silme yetkin yok.',true); await deleteRecord('shoots',x.id,'Çekim kaydı'); return; }
});

// Make sure the extra table header is correct on first load and future renders.
setTimeout(()=>{ try{ ensureActionHeaders(); renderAll(); }catch(e){ console.warn('V1.10.1 initial render',e); } },0);
