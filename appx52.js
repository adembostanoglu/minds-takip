// V1.22.2 — Mesai personel sabit sıralamasını render sonrası event-driven uygular; polling yok.
(function bootAttendanceStaffOrderV222(){
  if(window.__mindsAttendanceStaffOrderV222)return;
  window.__mindsAttendanceStaffOrderV222=true;

  const ORDER=[
    {no:1,match:['umut faruk paroğlu','umut faruk paroglu']},
    {no:2,match:['yusuf ebem']},
    {no:3,match:['aslı coşkun','asli coskun']},
    {no:4,match:['imran canbaz','İmran canbaz'.toLocaleLowerCase('tr-TR')]}
  ];

  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');
  const cleanLabel=v=>String(v||'').replace(/^\s*\d+\.\s*/,'').trim();
  function rank(name){
    const n=norm(cleanLabel(name));
    const found=ORDER.find(x=>x.match.some(m=>n.includes(norm(m))));
    return found?found.no:999;
  }

  function installStyle(){
    if(document.getElementById('attStaffOrderV191Style'))return;
    const s=document.createElement('style');
    s.id='attStaffOrderV191Style';
    s.textContent=`.att-staff-no-v190{display:inline-grid;place-items:center;min-width:20px;height:20px;margin-right:7px;border:1px solid #57531b;border-radius:6px;background:#252407;color:#eee52b;font-size:9px;font-weight:900;vertical-align:middle}`;
    document.head.appendChild(s);
  }

  function payrollPanel(){
    return [...document.querySelectorAll('#attendance .att-panel-v160')].find(p=>norm(p.querySelector('.att-panel-head-v160 h3')?.textContent).includes('aylık puantaj'))||null;
  }

  function patchPayrollTable(){
    const tbody=payrollPanel()?.querySelector('table.att-table-v160 tbody');
    if(!tbody)return;
    const rows=[...tbody.querySelectorAll(':scope > tr')].filter(r=>r.querySelector('[data-att-detail]')&&!r.classList.contains('att-person-expand-row-v191'));
    if(!rows.length)return;
    rows.sort((a,b)=>rank(a.cells[0]?.textContent)-rank(b.cells[0]?.textContent));
    rows.forEach(row=>{
      const cell=row.cells[0];if(!cell)return;
      const no=rank(cell.textContent);
      if(no<999){
        let badge=cell.querySelector('.att-staff-no-v190');
        if(!badge){badge=document.createElement('span');badge.className='att-staff-no-v190';cell.prepend(badge);}
        badge.textContent=no;
      }
      const expansion=row.nextElementSibling;
      tbody.appendChild(row);
      if(expansion?.classList.contains('att-person-expand-row-v191'))tbody.appendChild(expansion);
    });
  }

  function patchTodayPanel(){
    const panel=[...document.querySelectorAll('#attendance .att-panel-v160')].find(p=>norm(p.querySelector('.att-panel-head-v160 h3')?.textContent).includes('bugün ekip durumu'));
    const body=panel?.querySelector('.att-panel-body-v160');
    if(!body)return;
    const rows=[...body.children].filter(x=>x.querySelector('b'));
    rows.sort((a,b)=>rank(a.querySelector('b')?.textContent)-rank(b.querySelector('b')?.textContent));
    rows.forEach(r=>body.appendChild(r));
  }

  function patchPersonSelect(){
    document.querySelectorAll('#attendance #attPersonSelectV160,#attDetailDrawerV166 [data-original-id="attPersonSelectV160"],#attDetailDrawerV166 #attDrawerPersonV166').forEach(sel=>{
      const current=sel.value;
      const options=[...sel.options];
      options.sort((a,b)=>rank(a.textContent)-rank(b.textContent));
      options.forEach(o=>{
        const base=cleanLabel(o.textContent);
        const no=rank(base);
        o.textContent=no<999?`${no}. ${base}`:base;
        sel.appendChild(o);
      });
      if([...sel.options].some(o=>o.value===current))sel.value=current;
    });
  }

  function apply(){
    if(!document.getElementById('attendance')?.classList.contains('active-view'))return;
    installStyle();
    patchPayrollTable();
    patchTodayPanel();
    patchPersonSelect();
  }

  function scheduleApply(){[40,140,320,700,1200].forEach(ms=>setTimeout(apply,ms));}

  window.__mindsApplyAttendanceStaffOrderV222=apply;
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="attendance"],#attendanceRootV160,[data-att-detail]'))scheduleApply();},true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,#attDrawerPersonV166'))scheduleApply();},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleApply();});
  window.addEventListener('pageshow',scheduleApply);
  installStyle();
  setTimeout(scheduleApply,450);
})();
