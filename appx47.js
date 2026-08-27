// V1.18.3 — Pazar / hafta tatili çalışması: onay, +1,5 yevmiye ve hakediş görünümü.
(function bootWeeklyRestSundayV183(){
  if(window.__mindsWeeklyRestSundayV183)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof state==='undefined'){
    setTimeout(bootWeeklyRestSundayV183,140);return;
  }
  window.__mindsWeeklyRestSundayV183=true;

  let rows=[],payroll=[],loadedMonth='',loading=false;
  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const monthStart=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';
  const nextMonth=()=>{const [y,m]=monthStart().slice(0,7).split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const money=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0));
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const dateIso=v=>{const m=String(v||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';};
  const isSunday=iso=>iso&&new Date(`${iso}T12:00:00Z`).getUTCDay()===0;
  const duration=r=>r?.clock_in&&r?.clock_out?Math.max(0,(new Date(r.clock_out)-new Date(r.clock_in))/60000):0;

  function installStyles(){
    if(document.getElementById('weeklyRestV183Style'))return;
    const s=document.createElement('style');s.id='weeklyRestV183Style';s.textContent=`
      .att-weekrest-v183{display:inline-flex;align-items:center;border:1px solid #705f24;background:#342e12;color:#e5ce62;border-radius:16px;padding:4px 7px;font-size:8px;font-weight:850;white-space:nowrap}
      .att-weekrest-v183.ok{border-color:#315d38;background:#17321d;color:#93da80}
      .att-weekrest-sub-v183{display:block;margin-top:4px;font-size:8px;color:#aeb8bc;line-height:1.25}
      .att-weekrest-pay-v183{display:block;margin-top:4px;font-size:8px;color:#e9df2c;font-weight:850;line-height:1.25}
      .att-weekrest-btn-v183{margin-top:5px!important;padding:5px 7px!important;min-height:auto!important;font-size:8px!important}
      .att-detail-item-v160.weekrest-v183{border-color:#665e20!important;background:linear-gradient(145deg,#28260c,#15180e)!important}.att-detail-item-v160.weekrest-v183 b{color:#f0e72d!important}
      .att-weekrest-inline-v183{display:block;margin-top:3px;color:#e9df2c;font-size:8px;font-weight:800}
    `;document.head.appendChild(s);
  }

  function selectedPersonId(node=document){
    const drawer=node.closest?.('#attDetailDrawerV166');
    const ds=drawer?.querySelector?.('[data-original-id="attPersonSelectV160"]');if(ds?.value)return ds.value;
    const panel=node.closest?.('.att-panel-v160');
    const local=panel?.querySelector?.('#attPersonSelectV160,[data-original-id="attPersonSelectV160"]');if(local?.value)return local.value;
    const native=[...document.querySelectorAll('#attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));if(native?.value)return native.value;
    return admin()?((state.profiles||[]).find(p=>p.active&&p.role!=='admin')?.id||''):profile.id;
  }

  function weeklyRestAmount(pid){
    const p=payroll.find(x=>String(x.person_id)===String(pid));if(!p)return 0;
    const approved=rows.filter(r=>String(r.person_id)===String(pid)&&isSunday(r.work_date)&&r.clock_in&&r.clock_out&&r.overtime_approved);
    const excess=approved.reduce((s,r)=>s+Math.max(0,duration(r)-450),0);
    return Number(p.daily_rate||0)*1.5*approved.length + Number(p.hourly_rate||0)*0.5*(excess/60);
  }

  async function load(force=false){
    const m=monthStart();if(!/^\d{4}-\d{2}-01$/.test(m))return;
    if(loading||(!force&&loadedMonth===m)){patchAll();return;}loading=true;
    try{
      const [a,p]=await Promise.all([
        sb.from('attendance_records').select('id,person_id,work_date,clock_in,clock_out,overtime_approved').gte('work_date',m).lt('work_date',nextMonth()).order('work_date',{ascending:false}),
        sb.rpc('payroll_preview',{p_month:m,p_person_id:null})
      ]);
      if(a.error)throw a.error;if(p.error)throw p.error;
      rows=a.data||[];payroll=p.data||[];loadedMonth=m;patchAll();
    }catch(e){console.warn('Hafta tatili verisi yüklenemedi',e);}finally{loading=false;}
  }

  function patchRules(){
    document.querySelectorAll('#attendance .att-rule-v160').forEach(card=>{
      if(card.querySelector('b')?.textContent?.trim()!=='Pazar')return;
      const p=card.querySelector('p');if(!p)return;
      p.innerHTML='Hafta tatili. Pazar günü çalışma varsa <strong>Hafta Tatili Çalışması</strong> olarak değerlendirilir. Onaylandığında aylık ücretin içindeki 1 yevmiyeye ek olarak <strong>+1,5 yevmiye</strong> hakedişe eklenir; toplam karşılık 2,5 yevmiyedir. 7,5 saati aşan kısım ayrıca fazla çalışma hesabına girer.';
    });
  }

  function patchTable(table){
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
    const dateI=heads.indexOf('tarih'),otI=heads.indexOf('fazla mesai'),statusI=heads.indexOf('mesai durumu');if(dateI<0||otI<0||statusI<0)return;
    const pid=selectedPersonId(table);if(!pid)return;
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells=[...tr.children];if(cells.length<=statusI)return;
      const iso=dateIso(cells[dateI]?.textContent);if(!isSunday(iso))return;
      const r=rows.find(x=>String(x.person_id)===String(pid)&&x.work_date===iso);if(!r?.clock_in||!r?.clock_out)return;
      const dur=duration(r),p=payroll.find(x=>String(x.person_id)===String(pid)),baseExtra=Number(p?.daily_rate||0)*1.5;
      cells[otI].innerHTML=`<span class="att-weekrest-v183 ${r.overtime_approved?'ok':''}">Hafta Tatili</span><span class="att-weekrest-sub-v183">${minsText(dur)} çalışma</span>${r.overtime_approved?`<span class="att-weekrest-pay-v183">+${money(baseExtra)} hafta tatili</span>`:''}`;
      cells[statusI].innerHTML=`<span class="att-weekrest-v183 ${r.overtime_approved?'ok':''}">${r.overtime_approved?'Onaylı':'Onay Bekliyor'}</span>${admin()?`<button class="ghost att-weekrest-btn-v183" data-weekrest-v183="${r.id}" data-value="${r.overtime_approved?'0':'1'}">${r.overtime_approved?'Onayı Kaldır':'Hafta Tatilini Onayla'}</button>`:''}`;
    });
  }

  function patchSummary(){
    document.querySelectorAll('#attendance .att-detail-summary-v160,#attDetailDrawerV166 .att-detail-summary-v160').forEach(sum=>{
      const pid=selectedPersonId(sum);if(!pid)return;
      let box=sum.querySelector('.weekrest-v183');const amount=weeklyRestAmount(pid);
      const count=rows.filter(r=>String(r.person_id)===String(pid)&&isSunday(r.work_date)&&r.clock_in&&r.clock_out&&r.overtime_approved).length;
      if(!box){box=document.createElement('div');box.className='att-detail-item-v160 weekrest-v183';sum.appendChild(box);}
      box.innerHTML=`<small>Hafta Tatili</small><b>+${money(amount)}</b><span class="att-weekrest-sub-v183">${count?`${count} Pazar onaylı`:'Onaylı Pazar çalışması yok'}</span>`;
    });
  }

  function patchPayroll(){
    document.querySelectorAll('#attendance .att-table-v160').forEach(table=>{
      const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
      const personI=heads.indexOf('personel'),fmI=heads.indexOf('fm onaylı');if(personI<0||fmI<0)return;
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cells=[...tr.children],name=cells[personI]?.textContent.trim();
        const p=(state.profiles||[]).find(x=>x.full_name===name);if(!p)return;
        cells[fmI]?.querySelectorAll('.att-weekrest-inline-v183').forEach(x=>x.remove());
        const count=rows.filter(r=>String(r.person_id)===String(p.id)&&isSunday(r.work_date)&&r.clock_in&&r.clock_out&&r.overtime_approved).length;if(!count)return;
        const x=document.createElement('span');x.className='att-weekrest-inline-v183';x.textContent=`+ ${count} gün hafta tatili`;cells[fmI]?.appendChild(x);
      });
    });
  }

  function patchAll(){installStyles();patchRules();document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(patchTable);patchSummary();patchPayroll();}

  async function setApproval(id,value){
    if(!admin())return;
    const {error}=await sb.from('attendance_records').update({overtime_approved:value,overtime_approved_by:value?profile.id:null,overtime_approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('id',id);
    if(error){if(typeof toast==='function')toast(error.message,true);return;}
    if(typeof toast==='function')toast(value?'Hafta tatili çalışması onaylandı.':'Hafta tatili onayı kaldırıldı.');
    loadedMonth='';await load(true);setTimeout(()=>document.querySelector('.nav-item[data-view="attendance"]')?.click(),100);
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-weekrest-v183]');if(b){e.preventDefault();setApproval(b.dataset.weekrestV183,b.dataset.value==='1');return;}
    if(e.target.closest('.nav-item[data-view="attendance"],[data-att-detail],[data-att-edit-day]'))setTimeout(()=>{load();patchAll();},420);
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]')){loadedMonth='';setTimeout(()=>load(true),180);}},true);

  installStyles();
  setInterval(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))patchAll();},1200);
  setTimeout(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))load(true);},650);
})();
