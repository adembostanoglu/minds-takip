// V1.22.6 — Mobil Ajanda hizalama koruması. Masaüstüne dokunmadan gün başlıkları ve takvim hücrelerini aynı 7 kolon ölçüsünde sabitler.
(function bootMobileAgendaAlignmentV226(){
  if(window.__mindsMobileAgendaAlignmentV226)return;
  window.__mindsMobileAgendaAlignmentV226=true;

  function installStyle(){
    if(document.getElementById('mobileAgendaAlignmentV226Style'))return;
    const s=document.createElement('style');
    s.id='mobileAgendaAlignmentV226Style';
    s.textContent=`
      @media(max-width:760px){
        #agenda .agenda-calendar-panel-v150{
          overflow-x:auto!important;
          overflow-y:hidden!important;
          -webkit-overflow-scrolling:touch;
          overscroll-behavior-x:contain;
        }
        #agenda .agenda-weekdays-v150,
        #agenda .agenda-grid-v150{
          display:grid!important;
          grid-template-columns:repeat(7,minmax(0,1fr))!important;
          width:760px!important;
          min-width:760px!important;
          max-width:760px!important;
          box-sizing:border-box!important;
        }
        #agenda .agenda-weekdays-v150>div,
        #agenda .agenda-day-v150{
          min-width:0!important;
          max-width:none!important;
          box-sizing:border-box!important;
        }
        #agenda .agenda-day-v150{
          overflow:hidden!important;
        }
        #agenda .agenda-card-v150{
          min-width:0!important;
          max-width:100%!important;
          box-sizing:border-box!important;
          overflow:hidden!important;
        }
        #agenda .agenda-card-v150 b,
        #agenda .agenda-card-v150 small{
          min-width:0!important;
          max-width:100%!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function normalizeScroll(){
    if(!window.matchMedia('(max-width:760px)').matches)return;
    const agenda=document.getElementById('agenda');
    if(!agenda?.classList.contains('active-view'))return;
    const panel=agenda.querySelector('.agenda-calendar-panel-v150');
    if(!panel)return;
    // Yeni ay/ilk açılışta takvim her zaman Pazartesi kolonundan başlasın.
    if(!panel.dataset.mobileAgendaReadyV226){
      panel.scrollLeft=0;
      panel.dataset.mobileAgendaReadyV226='1';
    }
  }

  function resetAndNormalize(){
    const panel=document.querySelector('#agenda .agenda-calendar-panel-v150');
    if(panel)delete panel.dataset.mobileAgendaReadyV226;
    requestAnimationFrame(normalizeScroll);
    setTimeout(normalizeScroll,120);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="agenda"],#agendaPrevV150,#agendaNextV150,#agendaTodayV150'))resetAndNormalize();
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')resetAndNormalize();},true);
  window.addEventListener('orientationchange',()=>setTimeout(resetAndNormalize,120));
  window.addEventListener('resize',()=>{if(window.matchMedia('(max-width:760px)').matches)normalizeScroll();});

  installStyle();
  setTimeout(normalizeScroll,350);
})();
