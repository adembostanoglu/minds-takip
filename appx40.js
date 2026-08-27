// V1.17.1 — Mesai detay çekmecesinde günlük puantaj tablosunu yatay kaydırma olmadan tam gösterir.
(function bootAttendanceFullWidthTableV171(){
  if(window.__mindsAttendanceFullWidthTableV171)return;
  window.__mindsAttendanceFullWidthTableV171=true;

  const style=document.createElement('style');
  style.id='attFullWidthTableV171Style';
  style.textContent=`
    /* Detay panelini biraz genişlet: giriş / çıkış / geç / fazla mesai / mesai durumu tek ekranda görünsün. */
    .att-drawer-v166{
      width:min(680px,96vw)!important;
    }

    /* Günlük Puantaj tablosunda yatay scroll'u kaldır. */
    .att-drawer-v166 .att-drawer-table-wrap-v166{
      overflow-y:auto!important;
      overflow-x:hidden!important;
    }

    .att-drawer-v166 .att-drawer-table-v166{
      width:100%!important;
      min-width:0!important;
      table-layout:fixed!important;
    }

    .att-drawer-v166 .att-drawer-table-v166 th,
    .att-drawer-v166 .att-drawer-table-v166 td{
      padding:9px 6px!important;
      font-size:10px!important;
      line-height:1.25!important;
      white-space:normal!important;
      overflow-wrap:anywhere!important;
      vertical-align:middle!important;
    }

    .att-drawer-v166 .att-drawer-table-v166 th{
      font-size:9px!important;
      letter-spacing:.01em!important;
    }

    /* Sütunları kontrollü dağıt. */
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(1),
    .att-drawer-v166 .att-drawer-table-v166 td:nth-child(1){width:14%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(2),
    .att-drawer-v166 .att-drawer-table-v166 td:nth-child(2){width:17%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(3),
    .att-drawer-v166 .att-drawer-table-v166 td:nth-child(3){width:10%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(4),
    .att-drawer-v166 .att-drawer-table-v166 td:nth-child(4){width:10%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(5),
    .att-drawer-v166 .att-drawer-table-v166 td:nth-child(5){width:10%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(6),
    .att-drawer-v166 .att-drawer-table-v166 td:nth-child(6){width:18%!important}
    .att-drawer-v166 .att-drawer-table-v166 th:nth-child(7),
    .att-drawer-v166 .att-drawer-table-v166 td:nth-child(7){width:21%!important}

    /* Orta boy ekranlarda da yatay kaydırma üretme. */
    @media(max-width:900px){
      .att-drawer-v166{width:min(640px,100vw)!important}
      .att-drawer-v166 .att-drawer-body-v166{padding-left:14px!important;padding-right:14px!important}
      .att-drawer-v166 .att-drawer-table-v166 th,
      .att-drawer-v166 .att-drawer-table-v166 td{padding:8px 4px!important;font-size:9px!important}
    }
  `;
  document.head.appendChild(style);

  function relabel(){
    const table=document.querySelector('#attDetailDrawerV166 .att-drawer-table-v166');
    if(!table)return;
    const heads=table.querySelectorAll('thead th');
    if(heads[6])heads[6].textContent='Mesai Durumu';
  }

  const observer=new MutationObserver(relabel);
  observer.observe(document.body,{childList:true,subtree:true});
  relabel();
})();
