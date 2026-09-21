// V1.25.1 — Ek mesai satır onayı + süre/durum görünümü. MutationObserver kullanmaz.
(function bootSafeOvertimeApprovalV251(){
  if(window.__mindsSafeOvertimeApprovalV251)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){setTimeout(bootSafeOvertimeApprovalV251,150);return;}
  window.__mindsSafeOvertimeApprovalV251=true;

  let rows=[],month='',busy=false,timer=null;
  const admin=()=>{try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}};
  const key=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  const start=()=>key()+'-01';
  const end=()=>{const [y,m]=key().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const iso=t=>{const m=String(t||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';};
  const toMin=t=>{const m=String(t||'').match(/^(\d{1,2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):0;};
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};

  function installStyle(){
    if(document.getElementById('safeOvertimeV251Style'))return;
    const s=document.createElement('style');s.id='safeOvertimeV251Style';s.textContent=`
      #attendance .att-safe-manual-detail-v251{display:block;margin-top:3px;color:#e7d84b;font-size:9px;font-weight:850;line-height:1.2;white-space:nowrap}
      #attendance .att-safe-manual-detail-v251.ok{color:#83d777}
      #attendance .att-safe-manual-note-v251{display:block;margin-top:2px;color:#8c989e;font-size:7.5px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      #attendance .att-safe-status-v251{display:inline-flex;align-items:center;border-radius:12px;padding:4px 7px;font-size:8px;font-weight:850;border:1px solid #665b20;background:#2b270d;color:#e8da51}
      #attendance .att-safe-status-v251.ok{border-color:#35633d;background:#17321d;color:#8fd67e}
    `;document.head.appendChild(s);
  }

  function personId(table){
    const focus=table.closest('#attPersonFocusV195,.att-person-focus-v195');
    if(focus)return document.querySelector('#attendance tr.att-focus-selected-v195 [data-att-detail]')?.dataset.attDetail||'';
    const drawer=table.closest('#attDetailDrawerV166');
    if(drawer)return drawer.querySelector('[data-original-id="attPersonSelectV160"]')?.value||drawer.querySelector('#attPersonSelectV160')?.value||'';
    const panel=table.closest('.att-panel-v160');
    return panel?.querySelector('#attPersonSelectV160,[data-original-id="attPersonSelectV160"]')?.value||'';
  }

  async function load(force=false){
    if(!admin()||busy||!key())return;
    if(!force&&month===key()){patch();return;}
    busy=true;
    try{
      const {data,error}=await sb.from('attendance_overtime_entries')
        .select('id,person_id,work_date,start_time,end_time,note,approved')
        .gte('work_date',start()).lt('work_date',end());
      if(error)throw error;rows=data||[];month=key();
    }catch(e){console.warn('[Mesai onay]',e);}finally{busy=false;}
    patch();
  }

  function indexes(table){
    const h=[...table.querySelectorAll('thead th')].map(x=>String(x.textContent||'').trim().toLocaleLowerCase('tr-TR'));
    return {date:h.indexOf('tarih'),ot:h.indexOf('fazla mesai'),status:h.indexOf('mesai durumu'),action:h.indexOf('işlem')};
  }

  function renderManualDetail(cell,list,approved){
    if(!cell)return;
    cell.querySelectorAll('.att-safe-manual-detail-v251,.att-safe-manual-note-v251').forEach(x=>x.remove());
    const total=list.reduce((sum,x)=>sum+Math.max(0,toMin(x.end_time)-toMin(x.start_time)),0);
    const detail=document.createElement('span');detail.className=`att-safe-manual-detail-v251 ${approved?'ok':''}`;
    detail.textContent=`${minsText(total)} ek mesai${approved?' • onaylı':' • onay bekliyor'}`;
    const raw=String(cell.textContent||'').trim();
    if(raw==='—'||raw==='-'||raw==='')cell.textContent='';
    cell.appendChild(detail);
    const notes=[...new Set(list.map(x=>String(x.note||'').trim()).filter(Boolean))];
    if(notes.length){const note=document.createElement('small');note.className='att-safe-manual-note-v251';note.textContent=notes.join(' · ');note.title=notes.join(' · ');cell.appendChild(note);}
  }

  function renderStatus(cell,approved){
    if(!cell)return;
    cell.querySelectorAll('.att-safe-status-v251').forEach(x=>x.remove());
    const existing=String(cell.textContent||'').trim();
    if(existing==='—'||existing==='-'||existing==='')cell.textContent='';
    const badge=document.createElement('span');badge.className=`att-safe-status-v251 ${approved?'ok':''}`;badge.textContent=approved?'Onaylı':'Onay Bekliyor';cell.appendChild(badge);
  }

  function patch(){
    if(!admin()||!document.getElementById('attendance')?.classList.contains('active-view'))return;
    installStyle();
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(table=>{
      const ix=indexes(table);if(ix.date<0||ix.action<0)return;
      const pid=personId(table);if(!pid)return;
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const c=[...tr.children],date=iso(c[ix.date]?.textContent);if(!date||!c[ix.action])return;
        const list=rows.filter(x=>String(x.person_id)===String(pid)&&x.work_date===date);
        c[ix.ot]?.querySelectorAll('.att-safe-manual-detail-v251,.att-safe-manual-note-v251').forEach(x=>x.remove());
        c[ix.status]?.querySelectorAll('.att-safe-status-v251').forEach(x=>x.remove());
        const oldButton=c[ix.action].querySelector('[data-safe-ot-date]');
        if(!list.length){oldButton?.remove();return;}
        const approved=list.every(x=>x.approved);
        renderManualDetail(c[ix.ot],list,approved);
        if(ix.status>=0)renderStatus(c[ix.status],approved);
        const cell=c[ix.action];
        let b=oldButton;
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

// V1.25.3 loader bridge — Onaylı paylaşım kuyruğu + devam eden eski paylaşım kayıtları.
(function loadApprovedShareQueueV253(){
  if(document.querySelector('script[data-minds-v253-approved-share-queue]'))return;
  const s=document.createElement('script');
  s.src='appx92.js?v=2620';s.async=false;s.setAttribute('data-minds-v253-approved-share-queue','1');
  s.onerror=()=>console.error('V1.25.3 approved share queue module could not be loaded');
  document.body.appendChild(s);
})();
