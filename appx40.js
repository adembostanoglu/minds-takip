// V1.17.2 — Mesai detay tablosu tam genişlik; yatay kaydırma yok. Donma oluşturan MutationObserver kaldırıldı.
(function bootAttendanceFullWidthTableV172(){
  if(window.__mindsAttendanceFullWidthTableV172)return;
  window.__mindsAttendanceFullWidthTableV172=true;

  const style=document.createElement('style');
  style.id='attFullWidthTableV172Style';
  style.textContent=`
    .att-drawer-v166{width:min(680px,96vw)!important}
    .att-drawer-v166 .att-drawer-table-wrap-v166{overflow-y:auto!important;overflow-x:hidden!important}
    .att-drawer-v166 .att-drawer-table-v166{width:100%!important;min-width:0!important;table-layout:fixed!important}
    .att-drawer-v166 .att-drawer-table-v166 th,
    .att-drawer-v166 .att-drawer-table-v166 td{
      padding:9px 6px!important;font-size:10px!important;line-height:1.25!important;
      white-space:normal!important;overflow-wrap:anywhere!important;vertical-align:middle!important
    }
    .att-drawer-v166 .att-drawer-table-v166 th{font-size:9px!important;letter-spacing:.01em!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(1),.att-drawer-v166 .att-drawer-table-v166 td:nth-child(1){width:14%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(2),.att-drawer-v166 .att-drawer-table-v166 td:nth-child(2){width:17%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(3),.att-drawer-v166 .att-drawer-table-v166 td:nth-child(3){width:10%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(4),.att-drawer-v166 .att-drawer-table-v166 td:nth-child(4){width:10%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(5),.att-drawer-v166 .att-drawer-table-v166 td:nth-child(5){width:10%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(6),.att-drawer-v166 .att-drawer-table-v166 td:nth-child(6){width:18%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(7),.att-drawer-v166 .att-drawer-table-v166 td:nth-child(7){width:21%!important}
    @media(max-width:900px){
      .att-drawer-v166{width:min(640px,100vw)!important}
      .att-drawer-v166 .att-drawer-body-v166{padding-left:14px!important;padding-right:14px!important}
      .att-drawer-v166 .att-drawer-table-v166 th,.att-drawer-v166 .att-drawer-table-v166 td{padding:8px 4px!important;font-size:9px!important}
    }
  `;
  document.head.appendChild(style);

  function relabel(){
    const table=document.querySelector('#attDetailDrawerV166 .att-drawer-table-v166');
    if(!table)return;
    const heads=table.querySelectorAll('thead th');
    if(heads[6] && heads[6].textContent!=='Mesai Durumu') heads[6].textContent='Mesai Durumu';
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-att-detail]')) setTimeout(relabel,250);
  },true);
  document.addEventListener('change',e=>{
    if(e.target?.id==='attDrawerPersonV166') setTimeout(relabel,250);
  },true);
  setTimeout(relabel,500);
})();
