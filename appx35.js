// V1.16.5 — Mesai personel Detay butonunu doğrudan sağ panel seçimine bağlar; eski render/scroll akışını devre dışı bırakır.
(function bootAttendanceDetailStabilityV165(){
  if(window.__mindsAttendanceDetailStabilityV165)return;
  window.__mindsAttendanceDetailStabilityV165=true;

  function attendanceActive(){
    return document.getElementById('attendance')?.classList.contains('active-view');
  }

  function installStyle(){
    if(document.getElementById('attendanceDetailStabilityV165Style'))return;
    const s=document.createElement('style');
    s.id='attendanceDetailStabilityV165Style';
    s.textContent=`
      #attendance.ref-ui-v162 .att-grid-v160 > div:first-child > .att-panel-v160.att-section-gap-v160{visibility:hidden!important}
      #attendance.ref-ui-v162 .att-grid-v160 > aside > .att-panel-v160.att-section-gap-v160{visibility:visible!important}
      #attendance.ref-ui-v162 aside > .att-panel-v160.att-section-gap-v160.att-detail-flash-v165{border-color:#81791e!important;box-shadow:0 0 0 1px rgba(233,223,44,.18),0 10px 30px rgba(0,0,0,.22)!important}
      #attendance.ref-ui-v162 [data-att-detail]{cursor:pointer}
    `;
    document.head.appendChild(s);
  }

  function getParts(){
    const root=document.getElementById('attendanceRootV160');
    const grid=root?.querySelector('.att-grid-v160');
    if(!grid)return {};
    return {root,grid,left:grid.children[0],aside:grid.querySelector('aside')};
  }

  function relocateDetail(){
    const {left,aside}=getParts();
    if(!left||!aside)return null;
    const detail=left.querySelector('.att-panel-v160.att-section-gap-v160');
    if(detail&&detail.parentElement!==aside)aside.prepend(detail);
    return aside.querySelector('.att-panel-v160.att-section-gap-v160');
  }

  function settleDetail(highlight=false){
    const run=()=>{
      const detail=relocateDetail();
      if(highlight&&detail){
        detail.classList.add('att-detail-flash-v165');
        setTimeout(()=>detail.classList.remove('att-detail-flash-v165'),420);
      }
    };
    run();
    requestAnimationFrame(run);
    setTimeout(run,20);
    setTimeout(run,80);
    setTimeout(run,180);
  }

  // Detay butonunda appx32'nin eski handler'ına hiç gitme.
  // Sağ paneldeki mevcut personel select'ini değiştirerek appx32'nin güvenli change akışını kullan.
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-att-detail]');
    if(!btn||!attendanceActive())return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    settleDetail(false);
    const targetId=btn.dataset.attDetail;
    const select=document.getElementById('attPersonSelectV160');
    if(!select||![...select.options].some(o=>o.value===targetId)){
      console.warn('[Mesai Detay] Personel seçimi bulunamadı',targetId);
      return;
    }

    if(select.value!==targetId){
      select.value=targetId;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }else{
      // Aynı kişiye tekrar basıldığında render gerekmiyor; paneli yalnızca sabitle.
      settleDetail(true);
      return;
    }
    settleDetail(true);
  },true);

  // Select değişimi render yaptığı için paneli render'ın hemen ardından sağ kolona geri al.
  document.addEventListener('change',e=>{
    if(e.target?.id!=='attPersonSelectV160'||!attendanceActive())return;
    settleDetail(true);
  },true);

  installStyle();
  settleDetail(false);
})();
