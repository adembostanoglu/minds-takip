// V1.23.8 — Yönetici iş düzeltme yetkisi: personel kayıtlarında firma dahil tüm iş alanlarını admin düzeltebilir.
(function bootAdminWorkCorrectionV238(){
  if(window.__mindsAdminWorkCorrectionV238)return;
  if(typeof sb==='undefined'||typeof openModal!=='function'||typeof state==='undefined'){
    setTimeout(bootAdminWorkCorrectionV238,120);return;
  }
  window.__mindsAdminWorkCorrectionV238=true;

  const READY=new Set(['hazir','onaylandi']);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const qty=w=>{try{return typeof workQty==='function'?workQty(w):Math.max(1,Number(w?.quantity||1));}catch(_e){return Math.max(1,Number(w?.quantity||1));}};
  const admin=()=>{try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}};

  function workById(id){return (state.works||[]).find(w=>String(w.id)===String(id));}
  function monthById(id){return (state.months||[]).find(m=>m.id===id);}
  function workMonthKey(w){return monthById(w?.firm_month_id)?.month||selectedMonth;}
  function firmMonthFor(fid,monthKey){return (state.months||[]).find(m=>m.firm_id===fid&&m.month===monthKey);}
  function firmForMonthId(mid){const fm=monthById(mid);return fm?(state.firms||[]).find(f=>f.id===fm.firm_id):null;}
  function activePeople(){return (state.profiles||[]).filter(p=>p.active&&p.role!=='admin');}

  function availableFirms(w){
    const monthKey=workMonthKey(w), oldFirm=firmForMonthId(w?.firm_month_id);
    const arr=(state.firms||[]).filter(f=>f.active&&!!firmMonthFor(f.id,monthKey));
    if(oldFirm&&!arr.some(f=>f.id===oldFirm.id))arr.unshift(oldFirm);
    return arr.sort((a,b)=>new Date(a.list_order_at||0)-new Date(b.list_order_at||0));
  }

  function installStyle(){
    if(document.getElementById('adminWorkCorrectionV238Style'))return;
    const s=document.createElement('style');s.id='adminWorkCorrectionV238Style';s.textContent=`
      .admin-work-correct-v238{border-color:#625d1c!important;background:#292707!important;color:#eee83d!important}
      .admin-work-correct-v238:hover{background:#35320a!important}
      .admin-work-note-v238{grid-column:1/-1;border:1px solid #514d1d;background:#1c1b0d;color:#d8d39a;border-radius:10px;padding:10px 12px;font-size:10px;line-height:1.45}
      .admin-work-note-v238 b{color:#f0e83b}
    `;document.head.appendChild(s);
  }

  function addButtons(){
    if(!admin())return;
    installStyle();
    document.querySelectorAll('#worksPersonGridV228 .works-job-v228[data-work-id]').forEach(card=>{
      const id=card.dataset.workId;if(!id||card.querySelector('[data-admin-correct-work]'))return;
      let actions=card.querySelector('.works-actions-v228');
      if(!actions){actions=document.createElement('div');actions.className='works-actions-v228';card.appendChild(actions);}
      const b=document.createElement('button');b.type='button';b.className='small-primary admin-work-correct-v238';b.dataset.adminCorrectWork=id;b.textContent='Yönetici Düzelt';actions.appendChild(b);
    });
  }

  function quotaSnapshot(w,targetMonth,type,status,quantity){
    if(!targetMonth||!READY.has(status))return null;
    const quota=Number(type==='video'?targetMonth.video_quota:targetMonth.post_quota)||0;
    const base=(state.works||[]).filter(x=>x.id!==w.id&&x.firm_month_id===targetMonth.id&&x.type===type&&READY.has(x.status)).reduce((s,x)=>s+qty(x),0);
    const projected=base+quantity;
    return {quota,base,projected,over:projected>quota};
  }

  function openAdminCorrection(w){
    if(!admin()||!w)return;
    const oldMonth=monthById(w.firm_month_id), monthKey=workMonthKey(w), firms=availableFirms(w), people=activePeople();
    if(!firms.length)return typeof toast==='function'&&toast('Bu ay için paket kaydı olan firma bulunamadı.',true);
    const currentFirmId=oldMonth?.firm_id||'';
    openModal('Yönetici İş Düzeltmesi',`<div class="form-grid">
      <div class="admin-work-note-v238"><b>Yönetici düzeltmesi:</b> Personelin yanlış girdiği firma, sorumlu, adet, durum, tarih ve diğer iş bilgilerini buradan düzeltebilirsin. Bu yetki personele açılmaz.</div>
      <div class="field full"><label>Firma</label><select name="firm" required>${firms.map(f=>`<option value="${f.id}" ${f.id===currentFirmId?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div class="field full"><label>İş Başlığı</label><input name="title" required value="${esc(w.title||'')}"></div>
      <div class="field"><label>Tür</label><select name="type"><option value="post" ${w.type==='post'?'selected':''}>Post</option><option value="video" ${w.type==='video'?'selected':''}>Video</option></select></div>
      <div class="field"><label>Adet</label><input name="quantity" type="number" min="1" step="1" required value="${qty(w)}"></div>
      <div class="field"><label>Sorumlu</label><select name="person"><option value="">Seçilmedi</option>${people.map(p=>`<option value="${p.id}" ${p.id===w.assigned_to?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>
      <div class="field"><label>Hazırlık</label><select name="status">${['bekliyor','devam_ediyor','hazir','revizede','onaylandi'].map(x=>`<option value="${x}" ${w.status===x?'selected':''}>${typeof workStatusLabel==='function'?esc(workStatusLabel(x)):esc(x)}</option>`).join('')}</select></div>
      <div class="field"><label>Paylaşım</label><select name="share">${['paylasilmadi','planlandi','paylasildi'].map(x=>`<option value="${x}" ${w.share_status===x?'selected':''}>${typeof shareLabel==='function'?esc(shareLabel(x)):esc(x)}</option>`).join('')}</select></div>
      <div class="field"><label>Tarih</label><input type="date" name="date" required value="${esc(w.work_date||'')}"></div>
      <div class="field full"><label>Not</label><textarea name="notes">${esc(w.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Düzeltmeyi Kaydet</button></div>
    </div>`,async fd=>{
      const fid=String(fd.get('firm')||''), targetMonth=firmMonthFor(fid,monthKey);
      if(!targetMonth)throw new Error('Seçilen firma için bu ay paket kaydı yok.');
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
        assigned_to:String(fd.get('person')||'')||null,
        work_date:date,
        shared_date:share==='paylasildi'?(w.shared_date||date):null,
        notes:String(fd.get('notes')||'').trim()||null
      };
      if(!payload.title)throw new Error('İş başlığı gerekli.');
      const {error}=await sb.from('works').update(payload).eq('id',w.id);if(error)throw error;
    });
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-admin-correct-work]');
    if(b){e.preventDefault();e.stopPropagation();openAdminCorrection(workById(b.dataset.adminCorrectWork));return;}
    if(e.target.closest('[data-view="works"]')){setTimeout(addButtons,90);setTimeout(addButtons,260);}
  },true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>setTimeout(addButtons,260));

  if(typeof renderAll==='function'&&!renderAll.__mindsAdminWorkCorrectionV238){
    const previous=renderAll;
    const wrapped=function(){const out=previous.apply(this,arguments);setTimeout(addButtons,30);return out;};
    wrapped.__mindsAdminWorkCorrectionV238=true;
    try{renderAll=wrapped;}catch(_e){}
  }

  [120,420,900].forEach(ms=>setTimeout(addButtons,ms));
})();
