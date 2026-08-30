// V1.22.5 — Cumartesi nöbet sistemi: yeni inline personel detayıyla uyumlu, personelde kendi nöbet durumunu doğru gösterir.
(function bootSaturdayDutyV225(){
  if(window.__mindsSaturdayDutyV225)return;
  window.__mindsSaturdayDutyV225=true;

  let dutyRows=[];
  let loading=false;
  const TZ='Europe/Istanbul';
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const n2=n=>String(n).padStart(2,'0');

  function isAdminLocal(){try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return typeof profile!=='undefined'&&String(profile?.role||'').toLowerCase()==='admin';}}
  function monthStart(){return String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';}
  function shiftMonth(date,delta){const [y,m]=String(date).slice(0,7).split('-').map(Number);const d=new Date(Date.UTC(y,m-1+delta,1));return `${d.getUTCFullYear()}-${n2(d.getUTCMonth()+1)}-01`;}
  function todayIso(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${o.year}-${o.month}-${o.day}`;}
  function isSaturdayIso(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))&&new Date(`${v}T12:00:00Z`).getUTCDay()===6;}
  function trToIso(v){const m=String(v||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';}
  function dateTR(v){if(!v)return '—';const [y,m,d]=v.split('-');return `${d}.${m}.${y}`;}
  function nextSaturday(){const d=new Date(`${todayIso()}T12:00:00Z`);const day=d.getUTCDay();const add=day===6?0:(6-day+7)%7;d.setUTCDate(d.getUTCDate()+add);return d.toISOString().slice(0,10);}
  function activeStaff(){return (typeof state!=='undefined'?state.profiles:[]).filter(p=>p.active&&String(p.role||'').toLowerCase()!=='admin');}
  function personName(id){return (typeof state!=='undefined'?state.profiles:[]).find(p=>p.id===id)?.full_name||'Personel';}
  function isDuty(pid,date){return !!pid&&!!date&&dutyRows.some(x=>x.person_id===pid&&x.duty_date===date);}

  function sourcePersonId(){
    const selected=document.querySelector('#attendance tr.att-focus-selected-v195 [data-att-detail]')?.dataset.attDetail;
    if(selected)return selected;
    const sel=[...document.querySelectorAll('#attendance #attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));
    return sel?.value||'';
  }

  function personForTable(table){
    const focus=table.closest('#attPersonFocusV195,.att-person-focus-v195');
    if(focus){const pid=sourcePersonId();if(pid)return pid;}
    const inline=table.closest('.att-person-expand-v191');
    if(inline){const expandRow=inline.closest('tr.att-person-expand-row-v191');const base=expandRow?.previousElementSibling;return base?.querySelector('[data-att-detail]')?.dataset.attDetail||'';}
    const drawer=table.closest('#attDetailDrawerV166');
    if(drawer)return drawer.querySelector('[data-original-id="attPersonSelectV160"]')?.value||drawer.querySelector('#attPersonSelectV160')?.value||'';
    const panel=table.closest('.att-panel-v160');
    const sel=panel?.querySelector('#attPersonSelectV160');if(sel)return sel.value||'';
    return typeof profile!=='undefined'?(profile?.id||''):'';
  }

  function installStyle(){
    if(document.getElementById('attSaturdayDutyV212Style'))return;
    const s=document.createElement('style');s.id='attSaturdayDutyV212Style';s.textContent=`
      tr[data-saturday-duty-v212="1"] .att-ot-note-wrap-v192{display:none!important}
      #attendance.att-duty-today-v212 .att-ot-today-v192{display:none!important}
      .att-duty-summary-v212{margin-top:7px;padding-top:7px;border-top:1px dashed #334149;color:#9eb4bf;font-size:9px;line-height:1.45}
      .att-duty-summary-v212 b{color:#79c6e8!important}
      .att-duty-checks-v212{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:7px}
      .att-duty-check-v212{display:flex;align-items:center;gap:8px;border:1px solid #2b363d;background:#10171b;border-radius:9px;padding:10px;font-size:10px;font-weight:750;color:#dce5e8}
      .att-duty-check-v212 input{width:16px;height:16px;accent-color:#dfe72c}
      #attSaturdayDutyBtnV212{border-color:#315570!important;background:#142a3f!important;color:#8ec7ed!important}
      @media(max-width:760px){.att-duty-checks-v212{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  async function loadDuty(force=false){
    if(loading)return;
    const m=monthStart();if(!m)return;
    loading=true;
    try{
      const start=shiftMonth(m,-1),end=shiftMonth(m,3);
      const {data,error}=await sb.from('attendance_saturday_duty').select('id,person_id,duty_date,note').gte('duty_date',start).lt('duty_date',end).order('duty_date',{ascending:true});
      if(error)throw error;dutyRows=data||[];
    }catch(e){console.warn('Cumartesi nöbetleri yüklenemedi',e);}finally{loading=false;}
    schedulePatch();
  }

  function patchRules(){
    document.querySelectorAll('#attendance .att-rule-v160').forEach(card=>{
      if(card.querySelector('b')?.textContent?.trim()!=='Cumartesi')return;
      const p=card.querySelector('p');
      if(p)p.innerHTML='<strong>09:00–13:30</strong> normal çalışma • Nöbetçi olmayan personelde <strong>14:30 sonrası süre</strong> fazla mesai • <strong>Nöbetçi personelde Cumartesi mesaisi yok</strong>.';
      let box=card.querySelector('.att-duty-summary-v212');if(!box){box=document.createElement('div');box.className='att-duty-summary-v212';card.appendChild(box);}
      const d=nextSaturday();
      if(isAdminLocal()){
        const list=dutyRows.filter(x=>x.duty_date===d).map(x=>personName(x.person_id));
        box.innerHTML=list.length?`<b>${dateTR(d)} nöbetçi:</b> ${list.map(esc).join(' · ')}`:`<b>${dateTR(d)}:</b> Nöbetçi atanmamış`;
      }else{
        const pid=typeof profile!=='undefined'?profile?.id:'';
        box.innerHTML=isDuty(pid,d)?`<b>${dateTR(d)}:</b> Bu Cumartesi nöbetçisin.`:`<b>${dateTR(d)}:</b> Bu Cumartesi nöbetçi değilsin.`;
      }
    });
  }

  function patchTables(){
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(table=>{
      const heads=[...table.querySelectorAll('thead th')].map(x=>String(x.textContent||'').trim().toLocaleLowerCase('tr-TR'));
      const dateI=heads.indexOf('tarih'),otI=heads.indexOf('fazla mesai'),statusI=heads.indexOf('mesai durumu');
      if(dateI<0||otI<0)return;
      const pid=personForTable(table);if(!pid)return;
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cells=[...tr.children],date=trToIso(cells[dateI]?.textContent);
        const duty=isDuty(pid,date);
        if(!duty){delete tr.dataset.saturdayDutyV212;return;}
        tr.dataset.saturdayDutyV212='1';
        if(cells[otI]){cells[otI].textContent='—';cells[otI].classList.remove('pos');}
        if(statusI>=0&&cells[statusI])cells[statusI].innerHTML='<span class="att-badge-v160 blue">Nöbetçi</span>';
      });
    });
  }

  function patchToday(){
    const att=document.getElementById('attendance');if(!att)return;
    const pid=typeof profile!=='undefined'?profile?.id:null;
    att.classList.toggle('att-duty-today-v212',isDuty(pid,todayIso()));
  }

  function ensureAdminButton(){
    if(!isAdminLocal())return;
    const host=document.querySelector('#attendance .att-head-actions-v160');if(!host||document.getElementById('attSaturdayDutyBtnV212'))return;
    const b=document.createElement('button');b.type='button';b.id='attSaturdayDutyBtnV212';b.className='ghost';b.textContent='📅 Cumartesi Nöbeti';b.addEventListener('click',openDutyModal);host.appendChild(b);
  }

  async function syncModalChecks(date){
    const form=document.getElementById('modalForm');if(!form)return;
    form.querySelectorAll('input[name="person_ids"]').forEach(x=>x.checked=false);
    if(!isSaturdayIso(date))return;
    const {data,error}=await sb.from('attendance_saturday_duty').select('person_id').eq('duty_date',date);if(error)return;
    const ids=new Set((data||[]).map(x=>x.person_id));form.querySelectorAll('input[name="person_ids"]').forEach(x=>x.checked=ids.has(x.value));
  }

  function openDutyModal(){
    if(!isAdminLocal()||typeof openModal!=='function')return;
    const people=activeStaff();const def=nextSaturday();
    openModal('Cumartesi Nöbeti',`<div class="form-grid"><div class="field full"><label>Cumartesi Tarihi</label><input type="date" name="duty_date" value="${def}" required><div class="att-form-note-v160">Nöbetçi olarak işaretlenen personelin bu Cumartesi kaydı normal nöbet olarak görünür; Cumartesi mesaisi oluşturulmaz.</div></div><div class="field full"><label>Nöbetçiler</label><div class="att-duty-checks-v212">${people.map(p=>`<label class="att-duty-check-v212"><input type="checkbox" name="person_ids" value="${esc(p.id)}"><span>${esc(p.full_name)}</span></label>`).join('')}</div></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Nöbeti Kaydet</button></div></div>`,async fd=>{
      const date=String(fd.get('duty_date')||'');if(!isSaturdayIso(date)){if(typeof toast==='function')toast('Nöbet tarihi Cumartesi olmalı.',true);throw new Error('Nöbet tarihi Cumartesi olmalı');}
      const ids=fd.getAll('person_ids').map(String);
      const del=await sb.from('attendance_saturday_duty').delete().eq('duty_date',date);if(del.error)throw del.error;
      const creator=typeof profile!=='undefined'?profile?.id:null;
      if(ids.length){const ins=await sb.from('attendance_saturday_duty').insert(ids.map(person_id=>({person_id,duty_date:date,note:'Cumartesi nöbeti',created_by:creator||null})));if(ins.error)throw ins.error;}
      if(typeof toast==='function')toast(ids.length?`${dateTR(date)} nöbeti kaydedildi.`:`${dateTR(date)} nöbet ataması temizlendi.`);
      await loadDuty(true);setTimeout(()=>document.querySelector('.nav-item[data-view="attendance"]')?.click(),180);
    });
    setTimeout(()=>{
      const input=document.querySelector('#modalForm input[name="duty_date"]');if(!input)return;
      syncModalChecks(input.value);input.addEventListener('change',()=>syncModalChecks(input.value));
    },30);
  }

  function patch(){
    if(!document.getElementById('attendance')?.classList.contains('active-view'))return;
    installStyle();ensureAdminButton();patchRules();patchTables();patchToday();
  }
  function schedulePatch(){[70,220,650,1200].forEach(ms=>setTimeout(patch,ms));}

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="attendance"]'))setTimeout(()=>loadDuty(true),140);
    if(e.target.closest('[data-att-detail],.att-payroll-person-click-v191,.att-payroll-person-click-v195,.att-payroll-person-cell-v195,[data-att-edit-day],#attPersonSelectV160'))schedulePatch();
  },true);
  document.addEventListener('change',e=>{
    if(e.target?.id==='monthPicker'){setTimeout(()=>loadDuty(true),100);return;}
    if(e.target.closest('#attPersonSelectV160,[data-original-id="attPersonSelectV160"]'))schedulePatch();
  },true);
  window.addEventListener('load',()=>setTimeout(()=>loadDuty(true),500));
  installStyle();setTimeout(()=>loadDuty(true),500);
})();
