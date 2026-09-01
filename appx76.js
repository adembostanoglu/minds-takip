// V1.23.4 — Mesai detay çekmecesinde onay işlemlerini görünür tutar; hesaplamalara dokunmaz.
(function bootAttendanceApprovalVisibilityV234(){
  if(window.__mindsAttendanceApprovalVisibilityV234)return;
  window.__mindsAttendanceApprovalVisibilityV234=true;

  function installStyles(){
    if(document.getElementById('attendanceApprovalVisibilityV234Style'))return;
    const s=document.createElement('style');
    s.id='attendanceApprovalVisibilityV234Style';
    s.textContent=`
      #attDetailDrawerV166{width:min(820px,98vw)!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(1),#attDetailDrawerV166 .att-table-v160 td:nth-child(1){width:12%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(2),#attDetailDrawerV166 .att-table-v160 td:nth-child(2){width:15%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(3),#attDetailDrawerV166 .att-table-v160 td:nth-child(3){width:8%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(4),#attDetailDrawerV166 .att-table-v160 td:nth-child(4){width:8%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(5),#attDetailDrawerV166 .att-table-v160 td:nth-child(5){width:8%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(6),#attDetailDrawerV166 .att-table-v160 td:nth-child(6){width:15%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(7),#attDetailDrawerV166 .att-table-v160 td:nth-child(7){width:16%!important}
      #attDetailDrawerV166 .att-table-v160 th:nth-child(8),#attDetailDrawerV166 .att-table-v160 td:nth-child(8){display:table-cell!important;width:18%!important}
      #attDetailDrawerV166 .att-row-actions-v160{display:flex!important;gap:4px!important;flex-wrap:wrap!important}
      #attDetailDrawerV166 .att-row-actions-v160 button{font-size:7.5px!important;padding:5px 6px!important}
      @media(max-width:760px){#attDetailDrawerV166{width:100vw!important}#attDetailDrawerV166 .att-table-scroll-v160{overflow-x:auto!important}#attDetailDrawerV166 .att-table-v160{min-width:760px!important}}
    `;
    document.head.appendChild(s);
  }

  function patchManualRows(){
    if(typeof isAdmin!=='function'||!isAdmin())return;
    document.querySelectorAll('#attDetailDrawerV166 tr[data-manual-only-v182="1"]').forEach(tr=>{
      const table=tr.closest('table');if(!table)return;
      const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
      const actionI=heads.indexOf('işlem');if(actionI<0||!tr.children[actionI])return;
      const cell=tr.children[actionI];
      if(cell.querySelector('[data-jump-manual-v234]'))return;
      cell.innerHTML='<button class="ghost" data-jump-manual-v234="1">Ek Mesai Listesi</button>';
    });
  }

  function patch(){installStyles();patchManualRows();}
  function schedule(){[40,140,320,700].forEach(ms=>setTimeout(patch,ms));}

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-att-detail],.nav-item[data-view="attendance"]'))schedule();
    const jump=e.target.closest('#attDetailDrawerV166 [data-jump-manual-v234]');
    if(!jump)return;
    e.preventDefault();
    document.querySelector('#attDetailDrawerV166 [data-drawer-close]')?.click();
    setTimeout(()=>document.getElementById('attManualPanelV181')?.scrollIntoView({behavior:'smooth',block:'center'}),80);
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]'))schedule();},true);
  window.addEventListener('pageshow',schedule);
  installStyles();schedule();
})();
