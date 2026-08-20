// Events
el('loginBtn').onclick=login; el('setupBtn').onclick=setupAdmin; el('showSetupBtn').onclick=()=>{el('loginBox').classList.add('hidden');el('setupBox').classList.remove('hidden')}; el('showLoginBtn').onclick=()=>{el('setupBox').classList.add('hidden');el('loginBox').classList.remove('hidden')};
el('logoutBtn').onclick=async()=>{await sb.auth.signOut();location.reload()}; el('modalClose').onclick=closeModal; el('modal').onclick=e=>{if(e.target===el('modal'))closeModal()};
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));
el('monthPicker').onchange=async e=>{selectedMonth=e.target.value;await loadData()};
el('quickAddFirmBtn').onclick=()=>openFirmModal(); el('addFirmBtn').onclick=()=>openFirmModal(); el('addWorkBtn').onclick=()=>openWorkModal(); el('addExtraBtn').onclick=()=>openExtraModal(); el('addShootBtn').onclick=()=>openShootModal(); el('addPersonBtn').onclick=()=>openPersonModal();
document.addEventListener('click',async e=>{ const a=e.target.closest('[data-action]'); if(a){ if(a.dataset.action==='firm')openFirmModal(); if(a.dataset.action==='work')openWorkModal(); if(a.dataset.action==='extra')openExtraModal(); if(a.dataset.action==='shoot')openShootModal(); }
  const ef=e.target.closest('[data-edit-firm]'); if(ef) openFirmModal(firm(ef.dataset.editFirm));
  const tf=e.target.closest('[data-toggle-firm]'); if(tf&&isAdmin()){ const active=tf.dataset.active==='true'; const f=firm(tf.dataset.toggleFirm); if(!confirm(`${f.name} ${active?'pasife alınsın mı?':'yeniden aktif edilsin mi?'}`)) return; const payload={active:!active,deactivated_at:active?todayISO():null}; if(!active) payload.list_order_at=new Date().toISOString(); const {error}=await sb.from('firms').update(payload).eq('id',f.id); if(error)toast(error.message,true); else { if(!active){ const r=await sb.rpc('ensure_month',{target_month:monthISO()}); if(r.error) console.warn(r.error); } await loadData(); }}
  const df=e.target.closest('[data-delete-firm]'); if(df&&isAdmin()){
    const f=firm(df.dataset.deleteFirm); if(!f)return;
    const months=state.months.filter(m=>m.firm_id===f.id), monthIds=new Set(months.map(m=>m.id));
    const impact={works:state.works.filter(w=>monthIds.has(w.firm_month_id)).length,shoots:state.shoots.filter(x=>x.firm_id===f.id).length,extras:state.extras.filter(x=>x.firm_id===f.id).length,months:months.length};
    if(!confirm(`${f.name} kalıcı olarak silinsin mi?\n\nSilinecek bağlı kayıtlar:\n• ${impact.months} aylık paket kaydı\n• ${impact.works} paket işi\n• ${impact.shoots} çekim kaydı\n• ${impact.extras} ekstra iş\n\nNormal müşteri ayrılığında “Pasife Al” kullan.`)) return;
    const typed=prompt(`Kalıcı silmeyi onaylamak için firma adını aynen yaz:\n${f.name}`); if(typed!==f.name){ if(typed!==null) toast('Firma adı eşleşmedi; silme iptal edildi.',true); return; }
    const {error}=await sb.rpc('admin_delete_firm',{p_firm_id:f.id});
    if(error) toast('Firma silinemedi: '+friendlyError(error),true);
    else { if(f.logo_path){ const rm=await sb.storage.from('firm-logos').remove([f.logo_path]); if(rm.error) console.warn('Logo dosyası temizlenemedi',rm.error); } await loadData(); toast('Firma ve bağlı kayıtları kalıcı olarak silindi.'); }
  }
  const ew=e.target.closest('[data-edit-work]'); if(ew) openWorkModal(state.works.find(w=>w.id===ew.dataset.editWork));
  const esh=e.target.closest('[data-edit-shoot]'); if(esh) openShootModal(state.shoots.find(x=>x.id===esh.dataset.editShoot));
  const sw=e.target.closest('[data-share-work]'); if(sw){ const work=state.works.find(w=>w.id===sw.dataset.shareWork); const shareDate=selectedMonth===monthISO()?todayISO():(work?.work_date||defaultDateForSelectedMonth()); const {error}=await sb.from('works').update({share_status:'paylasildi',shared_date:shareDate}).eq('id',sw.dataset.shareWork); if(error)toast(friendlyError(error),true); else await loadData(); }
  const tp=e.target.closest('[data-toggle-person]'); if(tp&&isAdmin()){ try{await manageUser({action:'active',user_id:tp.dataset.togglePerson,active:tp.dataset.active!=='true'});await loadData();toast('Personel durumu güncellendi.')}catch(err){toast(err.message,true)} }
  const rp=e.target.closest('[data-reset-pass]'); if(rp&&isAdmin()){ const pass=prompt('Yeni şifreyi gir (en az 8 karakter):'); if(!pass)return; try{await manageUser({action:'password',user_id:rp.dataset.resetPass,password:pass});toast('Şifre güncellendi.')}catch(err){toast(err.message,true)} }
});

(async()=>{
  const {data}=await sb.auth.getSession();
  if(data.session){ session=data.session; const ok=await startApp(); if(!ok) await bootstrapCheck(); }
  else { await bootstrapCheck(); }
})();

// V1.10 — package work quantity tracking
function workQty(w){ const q=Number(w?.quantity??1); return Number.isInteger(q)&&q>0?q:1; }
function sumWorkQty(arr){ return arr.reduce((s,w)=>s+workQty(w),0); }

function counts(){
  const allWs=monthWorks(), ws=isAdmin()?allWs:allWs.filter(staffOwnWork), ex=monthExtras(), sh=monthShoots();
  const shareScope=allWs;
  return {
    post:sumWorkQty(ws.filter(w=>w.type==='post'&&workReady(w))),
    video:sumWorkQty(ws.filter(w=>w.type==='video'&&workReady(w))),
    waiting:sumWorkQty(shareScope.filter(w=>workReady(w)&&w.share_status!=='paylasildi')),
    shared:sumWorkQty(ws.filter(w=>w.share_status==='paylasildi')),
    extras:ex.reduce((s,x)=>s+x.quantity,0),
    staffExtras:ex.filter(x=>x.source==='staff').reduce((s,x)=>s+x.quantity,0),
    shootFirms:new Set(sh.map(x=>x.firm_id)).size,
    shootVideos:sh.reduce((sum,x)=>sum+(x.video_count||0),0)
  };
}

function firmMetrics(fid){
  const fm=currentFirmMonth(fid);
  if(!fm) return {post:0,video:0,shared:0,remaining:0,pq:0,vq:0};
  const ws=state.works.filter(w=>w.firm_month_id===fm.id);
  const post=sumWorkQty(ws.filter(w=>w.type==='post'&&workReady(w)));
  const video=sumWorkQty(ws.filter(w=>w.type==='video'&&workReady(w)));
  const shared=sumWorkQty(ws.filter(w=>w.share_status==='paylasildi'));
  return {post,video,shared,remaining:Math.max(0,fm.post_quota-post)+Math.max(0,fm.video_quota-video),pq:fm.post_quota,vq:fm.video_quota};
}

function renderWorks(){
  const ws=monthWorks().filter(w=>isAdmin()||staffOwnWork(w));
  el('workRows').innerHTML=ws.map(w=>{
    const fm=state.months.find(m=>m.id===w.firm_month_id), f=fm?firm(fm.firm_id):null, q=workQty(w);
    return `<tr><td>${escapeHtml(f?.name||'—')}</td><td><b>${escapeHtml(w.title)}</b>${q>1?`<div class="muted">${q} adet</div>`:''}</td><td>${typeLabel(w.type)} · ${q}</td><td><span class="badge yellow">${workStatusLabel(w.status)}</span></td><td><span class="badge ${w.share_status==='paylasildi'?'green':'orange'}">${shareLabel(w.share_status)}</span></td><td>${escapeHtml(personName(w.assigned_to))}</td><td>${formatDate(w.work_date)}</td><td>${staffOwnWork(w)?`<button class="small-primary" data-edit-work="${w.id}">Güncelle</button>`:'—'}</td></tr>`;
  }).join('')||'<tr><td colspan="8" class="empty">Bu ay sana atanmış paket işi yok.</td></tr>';
}

function renderShares(){
  const ws=monthWorks().filter(w=>workReady(w)&&w.share_status!=='paylasildi');
  el('shareCards').innerHTML=ws.map(w=>{
    const fm=state.months.find(m=>m.id===w.firm_month_id), f=fm?firm(fm.firm_id):null, q=workQty(w);
    return `<div class="share-card"><span class="badge orange">${shareLabel(w.share_status)}</span><h3>${escapeHtml(f?.name||'—')}</h3><p>${escapeHtml(w.title)}</p><div class="muted">${typeLabel(w.type)} · ${q} adet · ${personName(w.assigned_to)} · ${formatDate(w.work_date)}</div><div class="card-bottom"><button class="small-primary" data-share-work="${w.id}">Paylaşıldı Yap</button></div></div>`;
  }).join('')||'<div class="empty">Paylaşım bekleyen içerik yok.</div>';
}

function renderTeam(){
  const ws=monthWorks(), ex=monthExtras();
  const make=(arr,passive=false)=>arr.map(p=>{
    const done=sumWorkQty(ws.filter(w=>w.assigned_to===p.id&&workReady(w)));
    const extra=ex.filter(x=>x.person_id===p.id).reduce((s,x)=>s+x.quantity,0);
    const ongoing=sumWorkQty(ws.filter(w=>w.assigned_to===p.id&&['bekliyor','devam_ediyor','revizede'].includes(w.status)));
    return `<div class="person-card ${passive?'passive-card':''}"><div class="firm-card-top"><span class="badge ${p.role==='admin'?'yellow':'blue'}">${roleLabel(p.role)}</span>${isAdmin()&&p.role!=='admin'?`<button class="small-danger" data-toggle-person="${p.id}" data-active="${p.active}">${p.active?'Pasife Al':'Aktif Et'}</button>`:''}</div><h3>${escapeHtml(p.full_name)}</h3><div class="username">@${escapeHtml(p.username)}</div><p class="muted">${escapeHtml(p.job_title||'')}</p><div class="metric-four"><div class="mini"><small>Tamamlanan</small><b>${done}</b></div><div class="mini"><small>Devam</small><b>${ongoing}</b></div><div class="mini"><small>Ekstra</small><b>${extra}</b></div><div class="mini"><small>Firma</small><b>${state.assignments.filter(a=>a.person_id===p.id).length}</b></div></div>${isAdmin()&&p.role!=='admin'?`<div class="card-bottom"><button class="small-primary" data-reset-pass="${p.id}">Şifre Sıfırla</button></div>`:''}</div>`;
  }).join('');
  el('teamCards').innerHTML=make(activeProfiles())||'<div class="empty">Aktif personel yok.</div>';
  el('passiveTeamCards').innerHTML=make(state.profiles.filter(p=>!p.active),true)||'<div class="empty">Pasif personel yok.</div>';
}

function renderReports(){
  const c=counts(), ws=monthWorks(), ex=monthExtras(), sh=monthShoots(), packageTotal=sumWorkQty(ws);
  const vals=[['Paket İşi',packageTotal],['Paylaşılan',c.shared],['Ekstra İş',c.extras],['Çekim Yapılan Firma',c.shootFirms],['Çekilen Video İçeriği',c.shootVideos],['Paylaşım Bekleyen',c.waiting],['Hazır Post',c.post]];
  el('reportStats').innerHTML=vals.map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value">${v}</div></div>`).join('');
  el('reportBreakdown').innerHTML=`<div class="report-row"><span>Paket dahilindeki toplam içerik</span><span>${packageTotal}</span></div><div class="report-row"><span>Firma ekstra işleri</span><span>${ex.filter(x=>x.kind==='firma').reduce((s,x)=>s+x.quantity,0)}</span></div><div class="report-row"><span>Ajans içi ekstra işler</span><span>${ex.filter(x=>x.kind==='ajans').reduce((s,x)=>s+x.quantity,0)}</span></div><div class="report-row"><span>Personelin kendi eklediği ekstra işler</span><span>${c.staffExtras}</span></div><div class="report-row"><span>Çekim kayıtları</span><span>${sh.length}</span></div><div class="report-row"><span>Çekilen video içeriği</span><span>${c.shootVideos}</span></div>`;
  el('reportPeople').innerHTML=activeProfiles().map(p=>`<div class="report-row"><span>${escapeHtml(p.full_name)}</span><span>${sumWorkQty(ws.filter(w=>w.assigned_to===p.id&&workReady(w)))} + ${ex.filter(x=>x.person_id===p.id).reduce((s,x)=>s+x.quantity,0)} ekstra</span></div>`).join('');
}

function openWorkModal(w=null){
  const fm=w?state.months.find(m=>m.id===w.firm_month_id):null;
  let available=activeFirms().filter(f=>!!currentFirmMonth(f.id));
  if(w&&fm){ const oldFirm=firm(fm.firm_id); if(oldFirm&&!available.some(f=>f.id===oldFirm.id)) available=[oldFirm,...available]; }
  if(!available.length) return toast('Önce firma ve aylık paket oluşturulmalı.',true);
  openModal(w?'İşi Güncelle':'Yeni Paket İşi',`<div class="form-grid"><div class="field full"><label>Firma</label><select name="firm" required ${w?'disabled':''}>${available.map(f=>`<option value="${f.id}" ${(fm?.firm_id===f.id)?'selected':''}>${escapeHtml(f.name)}</option>`).join('')}</select></div><div class="field full"><label>İş Başlığı</label><input name="title" required value="${escapeHtml(w?.title||'')}"></div><div class="field"><label>Tür</label><select name="type"><option value="post" ${w?.type==='post'?'selected':''}>Post</option><option value="video" ${w?.type==='video'?'selected':''}>Video</option></select></div><div class="field"><label>Adet</label><input name="quantity" type="number" min="1" step="1" required value="${workQty(w)}"><div class="field-help">Bu kayıt kaç içerik temsil ediyor?</div></div>${isAdmin()?`<div class="field"><label>Sorumlu</label><select name="person"><option value="">Seçilmedi</option>${peopleOptions(w?.assigned_to||profile.id)}</select></div>`:`<div class="field"><label>Sorumlu</label><input value="${escapeHtml(profile.full_name)}" disabled><input type="hidden" name="person" value="${profile.id}"></div>`}<div class="field"><label>Hazırlık</label><select name="status">${['bekliyor','devam_ediyor','hazir','revizede','onaylandi'].map(x=>`<option value="${x}" ${w?.status===x?'selected':''}>${workStatusLabel(x)}</option>`).join('')}</select></div><div class="field"><label>Paylaşım</label><select name="share">${['paylasilmadi','planlandi','paylasildi'].map(x=>`<option value="${x}" ${w?.share_status===x?'selected':''}>${shareLabel(x)}</option>`).join('')}</select></div><div class="field"><label>Tarih</label><input type="date" name="date" value="${w?.work_date||defaultDateForSelectedMonth()}"></div><div class="field full"><label>Not</label><textarea name="notes">${escapeHtml(w?.notes||'')}</textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary">Kaydet</button></div></div>`,async fd=>{
    const fid=w?fm.firm_id:fd.get('firm'), month=currentFirmMonth(fid);
    if(!month) throw new Error('Bu firma için seçili ay paketi yok.');
    assertSelectedMonthDate(fd.get('date'),'İş tarihi');
    const quantity=Number(fd.get('quantity'));
    if(!Number.isInteger(quantity)||quantity<1) throw new Error('İş adedi en az 1 olmalı.');
    const share=fd.get('share');
    const payload={title:String(fd.get('title')||'').trim(),type:fd.get('type'),quantity,status:fd.get('status'),share_status:share,assigned_to:fd.get('person')||null,work_date:fd.get('date'),shared_date:share==='paylasildi'?(w?.shared_date||fd.get('date')):null,notes:String(fd.get('notes')||'').trim()||null};
    if(w){ const {error}=await sb.from('works').update(payload).eq('id',w.id); if(error) throw error; }
    else { payload.firm_month_id=month.id; payload.created_by=profile.id; const {error}=await sb.from('works').insert(payload); if(error) throw error; }
  });
}
