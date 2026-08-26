// V1.16.4 — Mesai personel Detay geçişini sabitler; yeniden render sırasında panelin zıplamasını engeller.
(function bootAttendanceDetailStabilityV164(){
  if(window.__mindsAttendanceDetailStabilityV164)return;
  window.__mindsAttendanceDetailStabilityV164=true;

  function installStyle(){
    if(document.getElementById('attendanceDetailStabilityV164Style'))return;
    const s=document.createElement('style');
    s.id='attendanceDetailStabilityV164Style';
    s.textContent=`
      /* Detay kartı render sonrası kısa süre ana kolonda doğar; kullanıcıya flaş göstermeden sağ panele taşınır. */
      #attendance.ref-ui-v162 .att-grid-v160 > div:first-child > .att-panel-v160.att-section-gap-v160{visibility:hidden!important}
      #attendance.ref-ui-v162 .att-grid-v160 > aside > .att-panel-v160.att-section-gap-v160{visibility:visible!important}
    `;
    document.head.appendChild(s);
  }

  function attendanceActive(){
    return document.getElementById('attendance')?.classList.contains('active-view');
  }

  function relocateDetail(){
    const root=document.getElementById('attendanceRootV160');
    const grid=root?.querySelector('.att-grid-v160');
    if(!grid)return;
    const left=grid.children[0],aside=grid.querySelector('aside');
    if(!left||!aside)return;
    const detail=left.querySelector('.att-panel-v160.att-section-gap-v160');
    if(detail&&detail.parentElement!==aside)aside.prepend(detail);
  }

  // appx32 Detay handler'ı render sonrası scrollIntoView çağırıyor.
  // Tıklama anında yalnız o çağrıyı kısa süreli devre dışı bırakıyoruz; sayfa zıplamıyor.
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-att-detail]');
    if(!btn||!attendanceActive())return;
    const original=Element.prototype.scrollIntoView;
    let restored=false;
    Element.prototype.scrollIntoView=function(){};
    const restore=()=>{
      if(!restored){Element.prototype.scrollIntoView=original;restored=true;}
      relocateDetail();
    };
    setTimeout(restore,0);
    setTimeout(relocateDetail,30);
    setTimeout(relocateDetail,120);
  },true);

  // Sağ paneldeki personel seçimi de render tetiklediği için aynı yerleşimi hemen geri kur.
  document.addEventListener('change',e=>{
    if(e.target?.id!=='attPersonSelectV160'||!attendanceActive())return;
    setTimeout(relocateDetail,0);
    setTimeout(relocateDetail,40);
  },true);

  installStyle();
  setTimeout(relocateDetail,0);
})();
