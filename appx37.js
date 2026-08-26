// V1.16.7 — Mesai personel detay paneli: Günlük Puantaj alanını kalan yüksekliğe yayar.
(function bootAttendanceDetailLayoutV167(){
  if(window.__mindsAttendanceDetailLayoutV167)return;
  window.__mindsAttendanceDetailLayoutV167=true;

  const s=document.createElement('style');
  s.id='attDetailLayoutV167Style';
  s.textContent=`
    /* Sağ detay panelinde yalnızca içerik dağılımını değiştir; mevcut görünümü koru. */
    .att-drawer-v166 .att-drawer-body-v166{
      display:flex!important;
      flex-direction:column!important;
      min-height:0!important;
      overflow:hidden!important;
      padding-bottom:18px!important;
    }

    .att-drawer-v166 .att-drawer-summary-v166{
      flex:0 0 auto!important;
      margin-bottom:4px!important;
    }

    /* Günlük Puantaj: özet kartlarından sonra gelen ilk bölüm. */
    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166{
      flex:1 1 auto!important;
      min-height:300px!important;
      display:flex!important;
      flex-direction:column!important;
      overflow:hidden!important;
      margin-top:12px!important;
    }

    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 > .att-drawer-section-head-v166{
      flex:0 0 auto!important;
    }

    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 > .att-drawer-table-wrap-v166{
      flex:1 1 auto!important;
      min-height:0!important;
      max-height:none!important;
      overflow:auto!important;
    }

    /* Kayıt yoksa boş durum mesajını geniş alanın ortasında göster. */
    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 > .att-drawer-table-wrap-v166:has(.att-drawer-empty-v166) .att-drawer-table-v166{
      height:100%!important;
    }
    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 > .att-drawer-table-wrap-v166:has(.att-drawer-empty-v166) tbody,
    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 > .att-drawer-table-wrap-v166:has(.att-drawer-empty-v166) tr,
    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 > .att-drawer-table-wrap-v166:has(.att-drawer-empty-v166) td{
      height:100%!important;
    }
    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 > .att-drawer-table-wrap-v166:has(.att-drawer-empty-v166) .att-drawer-empty-v166{
      height:100%!important;
      min-height:250px!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      padding:24px!important;
      box-sizing:border-box!important;
    }

    /* Prim / Avans / Kesinti altta kompakt kalsın. */
    .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 + .att-drawer-section-v166{
      flex:0 0 auto!important;
      max-height:150px!important;
      overflow:auto!important;
      margin-top:12px!important;
    }

    /* Düşük ekranlarda tüm panelin erişilebilirliğini koru. */
    @media(max-height:720px){
      .att-drawer-v166 .att-drawer-body-v166{overflow:auto!important;display:block!important}
      .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166{min-height:300px!important}
      .att-drawer-v166 .att-drawer-summary-v166 + .att-drawer-section-v166 > .att-drawer-table-wrap-v166{max-height:360px!important}
    }
  `;
  document.head.appendChild(s);
})();
