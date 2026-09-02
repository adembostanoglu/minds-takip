// V1.23.9 — Personel kendi iş kaydındaki yanlış firmayı güvenli sınırlar içinde düzeltebilir.
// Yalnızca kendi işi, aynı ay ve kendisine üretim sorumluluğu atanmış firmalar; sorumlu kişi değiştirilemez.
(function bootStaffWorkCorrectionV239(){
  if(window.__mindsStaffWorkCorrectionV239)return;
  if(typeof sb==='undefined'||typeof openModal!=='function'||typeof state==='undefined'){
    setTimeout(bootStaffWorkCorrectionV239,120);return;
  }
  window.__mindsStaffWorkCorrectionV239=true;

  const READY=new Set(['hazir','onaylandi']);
  const PRODUCTION_ROLES=new Set(['tasarim','video','ana_sorumlu']);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const qty=w=>{try{return typeof workQty==='function'?workQty(w):Math.max(1,Number(w?.quantity||1));}catch(_e){return Math.max(1,Number(w?.quantity||1));}};
  const admin=()=>{try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}};
  const mine=w=>{try{return typeof staffOwnWork==='function'&&staffOwnWork(w);}catch(_e){return false;}};

  function workById(id){return (state.works||[]).find(w=>String(w.id)===String(id));}
  function monthById(id){return (state.months||[]).find(m=>m.id===id);}
  function workMonthKey(w){return monthById(w?.firm_month_id)?.month||selectedMonth;}
  function firmMonthFor(fid,monthKey){return (state.months||[]).find(m=>m.firm_id===fid&&m.month===monthKey);}
  function firmForMonthId(mid){const fm=monthById(mid);return fm?(state.firms||[]).find(f=>f.id===fm.firm_id):null;}

  function allowedFirms(w){
    const monthKey=workMonthKey(w), me=profile?.id||'', oldFirm=firmForMonthId(w?.firm_month_id);
    const ids=new Set((state.assignments||[]).filter(a=>a.person_id===me&&PRODUCTION_ROLES.has(a.responsibility)).map(a=>a.firm_id));
    const arr=(state.firms||[]).filter(f=>f.active&&ids.has(f.id)&&!!firmMonthFor(f.id,monthKey));
    if(oldFirm&&!arr.some(f=>f.id===oldFirm.id))arr.unshift(oldFirm);
    return arr.sort((a,b)=>new Date(a.list_order_at||0)-new Date(b.list_order_at||0));
  }

  function quotaSnapshot(w,targetMonth,type,status,quantity){
    if(!targetMonth||!READY.has(status))return null;
    const quota=Number(type==='video'?targetMonth.video_quota:targetMonth.post_quota)||0;
    const base=(state.works||[]).filter(x=>x.id!==w.id&&x.firm_month_id===targetMonth.id&&x.type===type&&READY.has(x.status)).reduce((s,x)=>s+qty(x),0);
    const projected=base+quantity;
    return {quota,base,projected,over:projected>quota};
  }

  function openStaffCorrection(w){
    if(admin()||!w||!mine(w))return;
    const oldMonth=monthById(w.firm_month_id), monthKey=workMonthKey(w), firms=allowedFirms(w);
    if(!firms.length)return typeof toast==='function'&&toast('Bu iş için düzenleyebileceğin firma bulunamadı.',true);
    const currentFirmId=oldMonth?.firm_id||'';
    openModal('İşi Güncelle',`<div class="form-grid">
      <div class="field full"><label>Firma</label><select name="firm" required>${firms.map(f=>`<option value="${f.id}" ${f.id===currentFirmId?'selected':''}>${esc(f.name)}</option>`).join('')}</select><div class="field-help">Yanlış firma seçtiysen kendi sorumluluğundaki başka bir firmaya taşıyabilirsin.</div></div>
      <div class="field full"><label>İş Başlığı</label><input name="title" required value="${esc(w.title||'')}"></div>
      <div class="field"><label>Tür</label><select name="type"><option value="post" ${w.type==='post'?'selected':''}>Post</option><option value="video" ${w.type==='video'?'selected':''}>Video</option></select></div>
      <div class="field"><label>Adet</label><input name="quantity" type="number" min="1" step="1" required value="${qty(w)}"></div>
      <div class="field"><label>Sorumlu</label><input value="${esc(profile?.full_name||'Personel')}" disabled></div>
      <div class="field"><label>Hazırlık</label><select name="status">${['bekliyor','devam_ediyor','hazir','revizede','onaylandi'].map(x=>`<option value="${x}" ${w.status===x?'selected':''}>${typeof workStatusLabel==='function'?esc(workStatusLabel(x)):esc(x)}</option>`).join('')}</select></div>
      <div class="field"><label>Paylaşım</label><select name="share">${['paylasilmadi','planlandi','paylasildi'].map(x=>`<option value="${x}" ${w.share_status===x?'selected':''}>${typeof shareLabel==='function'?esc(shareLabel(x)):esc(x)}</option>`).join('')}</select></div>
      <div class="field"><label>Tarih</label><input type="date" name="date" required value="${esc(w.work_date||'')}"></div>
      <div class="field full"><label>Not</label><textarea name="notes">${esc(w.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      const fid=String(fd.get('firm')||''), targetMonth=firmMonthFor(fid,monthKey);
      if(!targetMonth||!firms.some(f=>f.id===fid))throw new Error('Bu firmaya iş taşıma yetkin yok.');
      const date=String(fd.get('date')||'');
      if(!date||date.slice(0,7)!==String(monthKey).slice(0,7))throw new Error('İş tarihi kayıtlı olduğu ay içinde olmalı.');
      const quantity=Number(fd.get('quantity'));if(!Number.isInteger(quantity)||quantity<1)throw new Error('İş adedi en az 1 olmalı.');
      const type=String(fd.get('type')||'post'),status=String(fd.get('status')||'bekliyor'),share=String(fd.get('share')||'paylasilmadi');
      const qs=quotaSnapshot(w,targetMonth,type,status,quantity);
      if(qs?.over){
        const f=(state.firms||[]).find(x=>x.id===fid),label=type==='video'?'video':'post';
        const ok=confirm(`${f?.name||'Firma'} için paket kotası aşılacak.\n\nŞu an: ${qs.base}/${qs.quota} ${label}\nBu kayıt: +${quantity}\nDüzeltme sonrası: ${qs.projected}/${qs.quota}\n\nYine de kaydedilsin mi?`);
        if(!ok)throw new Error('Düzeltme iptal edildi.');
      }
      const payload={
        firm_month_id:targetMonth.id,
        title:String(fd.get('title')||'').trim(),
        type,quantity,status,share_status:share,
        assigned_to:w.assigned_to,
        work_date:date,
        shared_date:share==='paylasildi'?(w.shared_date||date):null,
        notes:String(fd.get('notes')||'').trim()||null
      };
      if(!payload.title)throw new Error('İş başlığı gerekli.');
      const {error}=await sb.from('works').update(payload).eq('id',w.id);if(error)throw error;
    });
  }

  // Mevcut genel Güncelle akışını yalnızca personel için yakala; admin akışı değişmez.
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-edit-work]');
    if(!b||admin())return;
    const w=workById(b.dataset.editWork);if(!w||!mine(w))return;
    e.preventDefault();e.stopPropagation();
    openStaffCorrection(w);
  },true);
})();
