// V1.25.0 — Ek mesai satır onayı: MutationObserver kullanmaz, personel alt detayını kilitlemez.
(function bootSafeOvertimeApprovalV250(){
  if(window.__mindsSafeOvertimeApprovalV250)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){setTimeout(bootSafeOvertimeApprovalV250,150);return;}
  window.__mindsSafeOvertimeApprovalV250=true;

  let rows=[],month='',busy=false,timer=null;
  const admin=()=>{try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}};
  const key=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  const start=()=>key()+'-01';
  const end=()=>{const [y,m]=key().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const iso=t=>{const m=String(t||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';};

  function personId(table){
    const focus=table.closest('#attPersonFocusV195,.att-person-focus-v195');
    if(focus)return document.querySelector('#attendance tr.att-focus-selected-v195 [data-att-detail]')?.dataset.attDetail||'';
    const drawer=table.closest('#attDetailDrawerV166');
    if(drawer)return drawer.querySelector('[data-original-id="attPersonSelectV160"]')?.value||drawer.querySelector('#attPersonSelectV160')?.value||'';
    const panel=table.closest('.att-panel-v160');
    return panel?.querySelector('#attPersonSelectV160')?.value||'';
  }

  async function load(force=false){
    if(!admin()||busy||!key())return;
    if(!force&&month===key()){patch();return;}
    busy=true;
    try{
      const {data,error}=await sb.from('attendance_overtime_entries').select('person_id,work_date,approved').gte('work_date',start()).lt('work_date',end());
      if(error)throw error;rows=data||[];month=key();
    }catch(e){console.warn('[Mesai onay]',e);}finally{busy=false;}
    patch();
  }

  function patch(){
    if(!admin()||!document.getElementById('attendance')?.classList.contains('active-view'))return;
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(table=>{
      const h=[...table.querySelectorAll('thead th')].map(x=>String(x.textContent||'').trim().toLocaleLowerCase('tr-TR'));
      const di=h.indexOf('tarih'),ai=h.indexOf('işlem');if(di<0||ai<0)return;
      const pid=personId(table);if(!pid)return;
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const c=[...tr.children],date=iso(c[di]?.textContent);if(!date||!c[ai])return;
        const list=rows.filter(x=>String(x.person_id)===String(pid)&&x.work_date===date);if(!list.length)return;
        const approved=list.every(x=>x.approved),cell=c[ai];
        let b=cell.querySelector('[data-safe-ot-date]');
        if(!b){b=document.createElement('button');b.type='button';b.className='ghost';cell.prepend(b);}
        b.dataset.safeOtDate=date;b.dataset.safeOtPerson=pid;b.dataset.safeOtValue=approved?'0':'1';
        const text=approved?'Ek Mesai Onayını Kaldır':'Ek Mesaiyi Onayla';if(b.textContent!==text)b.textContent=text;
      });
    });
  }

  function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>{if(force)month='';load(force);[180,450,800].forEach(ms=>setTimeout(patch,ms));},80);}

  async function approve(pid,date,value){
    const payload={approved:value,approved_by:value?profile.id:null,approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()};
    const {error}=await sb.from('attendance_overtime_entries').update(payload).eq('person_id',pid).eq('work_date',date);if(error)throw error;
    if(typeof toast==='function')toast(value?'Ek mesai onaylandı.':'Ek mesai onayı kaldırıldı.');month='';schedule(true);
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-safe-ot-date]');
    if(b){e.preventDefault();e.stopPropagation();approve(b.dataset.safeOtPerson,b.dataset.safeOtDate,b.dataset.safeOtValue==='1').catch(err=>typeof toast==='function'&&toast(err.message||String(err),true));return;}
    if(e.target.closest('[data-view="attendance"],[data-att-detail],#attendance table.att-table-v160 tbody tr,[data-att-focus-close]'))schedule(false);
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]'))schedule(true);},true);
  window.addEventListener('pageshow',()=>schedule(true));
  [250,700].forEach(ms=>setTimeout(()=>schedule(true),ms));
})();
