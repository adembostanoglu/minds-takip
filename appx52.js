// V1.19.0 — Mesai personel sabit sıralaması ve sıra numaraları.
(function bootAttendanceStaffOrderV190(){
  if(window.__mindsAttendanceStaffOrderV190)return;
  window.__mindsAttendanceStaffOrderV190=true;

  const ORDER=[
    {no:1,match:['umut faruk paroğlu','umut faruk paroglu']},
    {no:2,match:['yusuf ebem']},
    {no:3,match:['aslı coşkun','asli coskun']},
    {no:4,match:['imran canbaz','İmran canbaz'.toLocaleLowerCase('tr-TR')]}
  ];

  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');
  function rank(name){
    const n=norm(name);
    const found=ORDER.find(x=>x.match.some(m=>n.includes(norm(m))));
    return found?found.no:999;
  }

  function installStyle(){
    if(document.getElementById('attStaffOrderV190Style'))return;
    const s=document.createElement('style');
    s.id='attStaffOrderV190Style';
    s.textContent=`
      .att-staff-no-v190{display:inline-grid;place-items:center;min-width:20px;height:20px;margin-right:7px;border:1px solid #57531b;border-radius:6px;background:#252407;color:#eee52b;font-size:9px;font-weight:900;vertical-align:middle}
    `;
    document.head.appendChild(s);
  }

  function patchPayrollTable(){
    const panels=[...document.querySelectorAll('#attendance .att-panel-v160')];
    const panel=panels.find(p=>norm(p.querySelector('.att-panel-head-v160 h3')?.textContent).includes('aylık puantaj'));
    const tbody=panel?.querySelector('table.att-table-v160 tbody');
    if(!tbody)return;
    const rows=[...tbody.querySelectorAll('tr')].filter(r=>r.querySelector('td'));
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
      tbody.appendChild(row);
    });
  }

  function patchPersonSelect(){
    document.querySelectorAll('#attendance #attPersonSelectV160, #attDetailDrawerV166 [data-original-id="attPersonSelectV160"]').forEach(sel=>{
      const options=[...sel.options];
      options.sort((a,b)=>rank(a.textContent)-rank(b.textContent));
      const current=sel.value;
      options.forEach(o=>{
        const no=rank(o.textContent.replace(/^\d+\.\s*/,''));
        const base=o.textContent.replace(/^\d+\.\s*/,'' );
        if(no<999)o.textContent=`${no}. ${base}`;
        sel.appendChild(o);
      });
      sel.value=current;
    });
  }

  function apply(){
    if(!document.getElementById('attendance')?.classList.contains('active-view'))return;
    installStyle();patchPayrollTable();patchPersonSelect();
  }

  installStyle();
  setInterval(apply,800);
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="attendance"],[data-att-detail]'))setTimeout(apply,80);},true);
})();
