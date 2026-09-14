// V1.24.8 — Cumartesi nöbetçisi 18:30 sonrası fazla mesai hak eder.
// Nöbetin normal kısmı mesai sayılmaz; sadece 18:30'dan sonraki gerçek çalışma onay akışına girer.
(function bootSaturdayDutyOvertimeV248(){
  if(window.__mindsSaturdayDutyOvertimeV248)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){setTimeout(bootSaturdayDutyOvertimeV248,140);return;}
  window.__mindsSaturdayDutyOvertimeV248=true;

  const TZ='Europe/Istanbul';
  const BASE=18*60+30;
  let dutyRows=[],records=[],loading=false;
  const admin=()=>{try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}};
  const monthKey=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  const monthStart=()=>monthKey()+'-01';
  const nextMonth=()=>{const [y,m]=monthKey().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const parseRowDate=t=>{const m=String(t||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';};
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const localMinutes=ts=>{if(!ts)return null;const p=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ts));const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return Number(o.hour)*60+Number(o.minute);};
  const recKey=(pid,date)=>`${pid}|${date}`;
  const isDuty=(pid,date)=>dutyRows.some(x=>String(x.person_id)===String(pid)&&x.duty_date===date);
  const overtime=r=>{if(!r?.clock_out)return 0;const co=localMinutes(r.clock_out),ci=localMinutes(r.clock_in);if(co===null||co<=BASE)return 0;return Math.max(0,co-Math.max(ci??BASE,BASE));};

  function sourcePersonId(){
    const selected=document.querySelector('#attendance tr.att-focus-selected-v195 [data-att-detail]')?.dataset.attDetail;if(selected)return selected;
    const sel=[...document.querySelectorAll('#attendance #attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));return sel?.value||'';
  }
  function personForTable(table){
    const focus=table.closest('#attPersonFocusV195,.att-person-focus-v195');if(focus){const p=sourcePersonId();if(p)return p;}
    const inline=table.closest('.att-person-expand-v191');if(inline){const base=inline.closest('tr.att-person-expand-row-v191')?.previousElementSibling;return base?.querySelector('[data-att-detail]')?.dataset.attDetail||'';}
    const drawer=table.closest('#attDetailDrawerV166');if(drawer)return drawer.querySelector('[data-original-id="attPersonSelectV160"]')?.value||drawer.querySelector('#attPersonSelectV160')?.value||'';
    const panel=table.closest('.att-panel-v160');const sel=panel?.querySelector('#attPersonSelectV160');if(sel)return sel.value||'';
    return !admin()?String(profile?.id||''):'';
  }

  function installStyle(){
    if(document.getElementById('dutyOvertimeV248Style'))return;
    const s=document.createElement('style');s.id='dutyOvertimeV248Style';s.textContent=`
      tr[data-saturday-duty-v212="1"] .att-ot-note-wrap-v192{display:block!important}
      #attendance.att-duty-today-v212 .att-ot-today-v192{display:block!important}
      .att-duty-ot-v248{color:#94dc79!important;font-weight:800!important}
      .att-duty-ot-btn-v248{border-color:#5c5420!important;background:#27250d!important;color:#e9df2c!important}
    `;document.head.appendChild(s);
  }

  async function load(force=false){
    if(loading)return;
    if(!monthKey())return;
    loading=true;
    try{
      const [d,r]=await Promise.all([
        sb.from('attendance_saturday_duty').select('person_id,duty_date').gte('duty_date',monthStart()).lt('duty_date',nextMonth()),
        sb.from('attendance_records').select('id,person_id,work_date,clock_in,clock_out,overtime_approved').gte('work_date',monthStart()).lt('work_date',nextMonth())
      ]);
      if(d.error)throw d.error;if(r.error)throw r.error;dutyRows=d.data||[];records=r.data||[];
    }catch(e){console.warn('[Nöbet mesaisi]',e);}finally{loading=false;}
    schedulePatch();
  }

  function patchRules(){
    document.querySelectorAll('#attendance .att-rule-v160').forEach(card=>{
      if(card.querySelector('b')?.textContent?.trim()!=='Cumartesi')return;
      const p=card.querySelector('p');if(p)p.innerHTML='<strong>09:00–13:30</strong> normal çalışma • Nöbetçi olmayan personelde <strong>14:30 sonrası</strong> fazla mesai • <strong>Nöbetçi personelde yalnızca 18:30 sonrası</strong> fazla mesai ve ücret hesabına girer.';
    });
    document.querySelectorAll('#modalForm .att-form-note-v160').forEach(n=>{if(/Cumartesi mesaisi oluşturulmaz/i.test(n.textContent||''))n.textContent='Nöbetçi personelde normal nöbet süresi mesai sayılmaz; 18:30 sonrasında çalışmaya devam edilirse fazla mesai oluşur.';});
  }

  function patchTables(){
    const map=new Map(records.map(r=>[recKey(r.person_id,r.work_date),r]));
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(table=>{
      const heads=[...table.querySelectorAll('thead th')].map(x=>String(x.textContent||'').trim().toLocaleLowerCase('tr-TR'));
      const dateI=heads.indexOf('tarih'),otI=heads.indexOf('fazla mesai'),statusI=heads.indexOf('mesai durumu'),actionI=heads.indexOf('işlem');
      if(dateI<0||otI<0)return;const pid=personForTable(table);if(!pid)return;
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cells=[...tr.children],date=parseRowDate(cells[dateI]?.textContent);if(!date||!isDuty(pid,date))return;
        const r=map.get(recKey(pid,date));const mins=overtime(r);
        tr.dataset.saturdayDutyV212='1';
        if(cells[otI]){
          cells[otI].classList.toggle('pos',mins>0);cells[otI].classList.toggle('att-duty-ot-v248',mins>0);
          cells[otI].textContent=mins>0?minsText(mins):'—';
        }
        if(statusI>=0&&cells[statusI])cells[statusI].innerHTML=mins>0?`<span class="att-badge-v160 ${r?.overtime_approved?'good':'warn'}">${r?.overtime_approved?'Onaylı':'Onay Bekliyor'}</span>`:'<span class="att-badge-v160 blue">Nöbetçi</span>';
        if(admin()&&mins>0&&r&&actionI>=0&&cells[actionI]){
          let wrap=cells[actionI].querySelector('.att-row-actions-v160');if(!wrap){wrap=document.createElement('div');wrap.className='att-row-actions-v160';cells[actionI].prepend(wrap);}
          let b=wrap.querySelector('.att-duty-ot-btn-v248');if(!b){b=document.createElement('button');b.type='button';b.className='ghost att-duty-ot-btn-v248';wrap.prepend(b);}
          b.dataset.dutyOtId=r.id;b.dataset.dutyOtValue=r.overtime_approved?'0':'1';b.textContent=r.overtime_approved?'Onayı Kaldır':'Mesaiyi Onayla';
        }
      });
    });
  }

  function patch(){if(!document.getElementById('attendance')?.classList.contains('active-view'))return;installStyle();patchRules();patchTables();}
  function schedulePatch(){[80,260,700,1350,1750].forEach(ms=>setTimeout(patch,ms));}

  async function setApproval(id,value){
    const payload={overtime_approved:value,overtime_approved_by:value?profile.id:null,overtime_approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()};
    const {error}=await sb.from('attendance_records').update(payload).eq('id',id);if(error)throw error;
    if(typeof toast==='function')toast(value?'Nöbet sonrası fazla mesai onaylandı.':'Nöbet sonrası mesai onayı kaldırıldı.');
    await load(true);
    document.getElementById('monthPicker')?.dispatchEvent(new Event('change',{bubbles:true}));
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-duty-ot-id]');if(b){e.preventDefault();e.stopPropagation();setApproval(b.dataset.dutyOtId,b.dataset.dutyOtValue==='1').catch(err=>typeof toast==='function'&&toast(err.message||String(err),true));return;}
    if(e.target.closest('[data-view="attendance"],[data-att-detail],[data-att-edit-day],#attSaturdayDutyBtnV212'))setTimeout(()=>load(true),120);
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]'))setTimeout(()=>load(true),120);},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>load(true),120);});
  installStyle();setTimeout(()=>load(true),500);
})();
