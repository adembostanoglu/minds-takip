// V1.28.4 — Final Saturday overtime invariant.
// Saturday automatic overtime exists only when clock-out is >= 19:30.
// If an older renderer writes stale overtime UI later, this module removes it.
(function bootSaturdayOvertimeInvariantV284(){
  if(window.__mindsSaturdayOvertimeInvariantV284)return;
  window.__mindsSaturdayOvertimeInvariantV284=true;

  const norm=s=>String(s||'').trim().toLocaleLowerCase('tr-TR');
  const parseDate=s=>{
    const m=String(s||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return m?{iso:`${m[3]}-${m[2]}-${m[1]}`,day:new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00Z`).getUTCDay()}:null;
  };
  const parseTime=s=>{
    const m=String(s||'').trim().match(/^(\d{1,2}):(\d{2})$/);
    return m?Number(m[1])*60+Number(m[2]):null;
  };

  function cleanTable(table){
    const heads=[...table.querySelectorAll('thead th')].map(th=>norm(th.textContent));
    let dateI=heads.indexOf('tarih');
    let outI=heads.indexOf('çıkış');
    let otI=heads.indexOf('fazla mesai');
    let statusI=heads.indexOf('mesai durumu');
    let actionI=heads.indexOf('işlem');

    // Native attendance table fallback.
    if(dateI<0)dateI=0;
    if(outI<0)outI=3;
    if(otI<0)otI=5;
    if(statusI<0)statusI=6;

    table.querySelectorAll('tbody tr').forEach(tr=>{
      if(tr.dataset.manualOnlyV182==='1')return;
      const cells=[...tr.children];
      if(!cells.length||!cells[dateI]||!cells[outI]||!cells[otI])return;

      const d=parseDate(cells[dateI].textContent);
      if(!d||d.day!==6)return;

      const out=parseTime(cells[outI].textContent);
      if(out===null||out>=19*60+30)return;

      // Clear automatic OT value.
      cells[otI].textContent='—';
      cells[otI].classList.remove('pos','good','warn');

      // Clear only automatic approval badges, keep duty/other statuses.
      if(cells[statusI]){
        const t=norm(cells[statusI].textContent);
        if(t==='onay bekliyor'||t==='onaylı'){
          cells[statusI].textContent='—';
        }
      }

      // Remove all automatic overtime approval controls from that row.
      const actionCell=actionI>=0?cells[actionI]:cells[cells.length-1];
      if(actionCell){
        actionCell.querySelectorAll('[data-att-overtime],[data-v235-normal]').forEach(x=>x.remove());
        actionCell.querySelectorAll('button').forEach(b=>{
          const t=norm(b.textContent);
          if(t==='mesaiyi onayla'||t==='onayı kaldır')b.remove();
        });
        actionCell.querySelectorAll('.att-row-actions-v160').forEach(w=>{
          if(!w.children.length)w.remove();
        });
      }
    });
  }

  function enforce(){
    const att=document.getElementById('attendance');
    if(!att||!att.classList.contains('active-view'))return;
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160')
      .forEach(cleanTable);
  }

  let timer=null;
  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(enforce,20);
  }

  const obs=new MutationObserver(schedule);
  function attach(){
    const att=document.getElementById('attendance');
    if(!att)return;
    obs.disconnect();
    obs.observe(att,{childList:true,subtree:true,characterData:true});
    schedule();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="attendance"],[data-att-detail],.att-payroll-person-cell-v195,.att-payroll-person-click-v195,[data-att-edit-day]')){
      setTimeout(attach,50);
      setTimeout(enforce,150);
      setTimeout(enforce,500);
    }
  },true);
  document.addEventListener('change',e=>{
    if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]')){
      setTimeout(attach,50);
      setTimeout(enforce,180);
    }
  },true);
  window.addEventListener('pageshow',()=>setTimeout(attach,80));
  setInterval(enforce,1000);
  setTimeout(attach,300);
})();