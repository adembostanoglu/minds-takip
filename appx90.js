// V1.24.9 — Günlük puantajda aynı güne bağlı ayrı ek mesai varsa yönetici doğrudan satırdan onaylayabilir.
// Mevcut Düzenle / normal mesai butonlarını korur; sadece eksik ek-mesai onay kontrolünü ekler.
(function bootInlineManualOvertimeApprovalV249(){
  if(window.__mindsInlineManualOvertimeApprovalV249)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){
    setTimeout(bootInlineManualOvertimeApprovalV249,140);return;
  }
  window.__mindsInlineManualOvertimeApprovalV249=true;

  let entries=[],loading=false,loadedMonth='';
  let observer=null,observedRoot=null,patchQueued=false;

  const admin=()=>{try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}};
  const monthKey=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  const monthStart=()=>monthKey()+'-01';
  const nextMonth=()=>{const [y,m]=monthKey().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const parseRowDate=text=>{const m=String(text||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';};

  function installStyle(){
    if(document.getElementById('inlineManualOvertimeApprovalV249Style'))return;
    const s=document.createElement('style');
    s.id='inlineManualOvertimeApprovalV249Style';
    s.textContent=`
      #attendance .att-manual-day-approve-v249{border-color:#5d5122!important;background:#24210d!important;color:#ece52c!important;white-space:nowrap!important}
      #attendance .att-manual-day-approve-v249:hover{border-color:#807126!important;background:#312d10!important;color:#fff85a!important}
      #attendance td[data-v249-action="1"]{display:table-cell!important}
      #attendance td[data-v249-action="1"] .att-row-actions-v160{display:flex!important;align-items:center!important;gap:5px!important;flex-wrap:wrap!important}
    `;
    document.head.appendChild(s);
  }

  function sourcePersonId(){
    const selected=document.querySelector('#attendance tr.att-focus-selected-v195 [data-att-detail]')?.dataset.attDetail;
    if(selected)return selected;
    const sel=[...document.querySelectorAll('#attendance #attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));
    return sel?.value||'';
  }

  function personForTable(table){
    const focus=table.closest('#attPersonFocusV195,.att-person-focus-v195');
    if(focus){const p=sourcePersonId();if(p)return p;}

    const inline=table.closest('.att-person-expand-v191');
    if(inline){
      const base=inline.closest('tr.att-person-expand-row-v191')?.previousElementSibling;
      const p=base?.querySelector('[data-att-detail]')?.dataset.attDetail;
      if(p)return p;
    }

    const drawer=table.closest('#attDetailDrawerV166');
    if(drawer){
      const p=drawer.querySelector('[data-original-id="attPersonSelectV160"]')?.value||drawer.querySelector('#attPersonSelectV160')?.value;
      if(p)return p;
    }

    const panel=table.closest('.att-panel-v160');
    const own=panel?.querySelector('#attPersonSelectV160,[data-original-id="attPersonSelectV160"]');
    if(own?.value)return own.value;

    return !admin()?String(profile?.id||''):sourcePersonId();
  }

  async function load(force=false){
    if(!monthKey()||loading)return;
    if(!force&&loadedMonth===monthStart()){patch();return;}
    loading=true;
    try{
      const {data,error}=await sb.from('attendance_overtime_entries')
        .select('id,person_id,work_date,approved')
        .gte('work_date',monthStart()).lt('work_date',nextMonth());
      if(error)throw error;
      entries=data||[];loadedMonth=monthStart();
    }catch(e){console.warn('[Ek mesai satır onayı]',e);}finally{loading=false;}
    patch();
  }

  function tableIndexes(table){
    const heads=[...table.querySelectorAll('thead th')].map(x=>String(x.textContent||'').trim().toLocaleLowerCase('tr-TR'));
    return {date:heads.indexOf('tarih'),ot:heads.indexOf('fazla mesai'),action:heads.indexOf('işlem')};
  }

  function patchTable(table){
    const ix=tableIndexes(table);
    if(ix.date<0||ix.ot<0||ix.action<0)return;
    const pid=personForTable(table);if(!pid)return;

    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells=[...tr.children];
      const iso=parseRowDate(cells[ix.date]?.textContent);if(!iso||!cells[ix.action])return;
      const arr=entries.filter(x=>String(x.person_id)===String(pid)&&x.work_date===iso);
      const existing=cells[ix.action].querySelector('.att-manual-day-approve-v249');
      if(!arr.length){existing?.remove();return;}

      const allApproved=arr.every(x=>x.approved);
      const cell=cells[ix.action];cell.dataset.v249Action='1';
      let wrap=cell.querySelector('.att-row-actions-v160');
      if(!wrap){wrap=document.createElement('div');wrap.className='att-row-actions-v160';cell.prepend(wrap);}

      let btn=wrap.querySelector('.att-manual-day-approve-v249');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';btn.className='ghost att-manual-day-approve-v249';
        wrap.prepend(btn);
      }
      btn.dataset.manualDayV249=iso;
      btn.dataset.manualPersonV249=String(pid);
      btn.dataset.manualValueV249=allApproved?'0':'1';
      btn.textContent=allApproved?'Ek Mesai Onayını Kaldır':'Ek Mesaiyi Onayla';
    });
  }

  function patch(){
    if(!admin())return;
    const section=document.getElementById('attendance');
    if(!section?.classList.contains('active-view'))return;
    installStyle();
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(patchTable);
    attachObserver();
  }

  function schedule(force=false){
    if(patchQueued&&!force)return;
    patchQueued=true;
    setTimeout(()=>{patchQueued=false;if(force)loadedMonth='';load(force);},90);
    [260,620].forEach(ms=>setTimeout(patch,ms));
  }

  function attachObserver(){
    const root=document.getElementById('attendanceRootV160');if(!root)return;
    if(!observer)observer=new MutationObserver(()=>schedule(false));
    if(observedRoot===root)return;
    observer.disconnect();observedRoot=root;observer.observe(root,{childList:true,subtree:true});
  }

  async function setDayApproval(pid,date,value){
    if(!admin()||!pid||!date)return;
    const payload={approved:value,approved_by:value?profile.id:null,approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()};
    const {error}=await sb.from('attendance_overtime_entries').update(payload).eq('person_id',pid).eq('work_date',date);
    if(error)throw error;
    if(typeof toast==='function')toast(value?'Ek mesai onaylandı.':'Ek mesai onayı kaldırıldı.');
    loadedMonth='';
    const picker=document.getElementById('monthPicker');
    if(picker)picker.dispatchEvent(new Event('change',{bubbles:true}));
    setTimeout(()=>load(true),180);
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-manual-day-v249]');
    if(b){
      e.preventDefault();e.stopPropagation();
      setDayApproval(b.dataset.manualPersonV249,b.dataset.manualDayV249,b.dataset.manualValueV249==='1')
        .catch(err=>typeof toast==='function'&&toast(err?.message||String(err),true));
      return;
    }
    if(e.target.closest('[data-view="attendance"],[data-att-detail],[data-att-edit-day],[data-att-focus-close]'))schedule(true);
  },true);

  document.addEventListener('change',e=>{
    if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]'))schedule(true);
  },true);

  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(true);});
  window.addEventListener('pageshow',()=>schedule(true));

  installStyle();
  [220,650,1200].forEach(ms=>setTimeout(()=>schedule(true),ms));
})();
