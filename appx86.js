// V1.24.5 — Desktop Ajanda okunabilirlik ve tablo ölçek iyileştirmesi. Mobil görünüm korunur.
(function bootAgendaDesktopScaleV245(){
  if(window.__mindsAgendaDesktopScaleV245)return;
  window.__mindsAgendaDesktopScaleV245=true;

  function installStyle(){
    if(document.getElementById('agendaDesktopScaleV245Style'))return;
    const s=document.createElement('style');
    s.id='agendaDesktopScaleV245Style';
    s.textContent=`
      @media(min-width:1151px){
        #agenda .section-actions{margin-bottom:14px!important}
        #agenda .section-actions h2{font-size:27px!important;line-height:1.15!important;letter-spacing:-.45px!important}
        #agenda .section-actions p{font-size:13px!important;line-height:1.45!important;color:#9aa5aa!important}

        #agenda .agenda-toolbar-v150{margin-bottom:14px!important;gap:14px!important}
        #agenda .agenda-filter-row-v150{gap:9px!important}
        #agenda .agenda-filter-v150{padding:10px 15px!important;font-size:12px!important;border-radius:10px!important}
        #agenda .agenda-month-label-v150{min-width:145px!important;font-size:13px!important}
        #agenda .agenda-icon-btn-v150{width:40px!important;height:40px!important;font-size:17px!important}
        #agenda #agendaTodayV150{min-height:40px!important;padding:8px 13px!important;font-size:11.5px!important}

        #agenda .agenda-layout-v150{grid-template-columns:minmax(0,1fr) 310px!important;gap:16px!important}
        #agenda .agenda-calendar-panel-v150{border-radius:15px!important}
        #agenda .agenda-weekdays-v150 div{padding:11px 10px!important;font-size:11px!important;letter-spacing:.1px!important}
        #agenda .agenda-day-v150{min-height:132px!important;padding:9px!important}
        #agenda .agenda-day-number-v150{font-size:12.5px!important;margin-bottom:6px!important}

        #agenda .agenda-card-v150{padding:7px 8px!important;margin:5px 0!important;border-radius:8px!important;min-height:42px!important}
        #agenda .agenda-card-v150 b{font-size:10.5px!important;line-height:1.2!important}
        #agenda .agenda-card-v150 small{font-size:9.2px!important;line-height:1.2!important;margin-top:4px!important}
        #agenda .agenda-more-v150{font-size:9px!important;padding:4px 2px!important}

        #agenda .agenda-side-head-v150{padding:15px 16px!important}
        #agenda .agenda-side-head-v150 h3{font-size:15px!important}
        #agenda .agenda-side-body-v150{padding:15px!important}
        #agenda .agenda-detail-title-v150{font-size:18px!important;line-height:1.2!important}
        #agenda .agenda-detail-client-v150{font-size:10.5px!important}
        #agenda .agenda-detail-row-v150{grid-template-columns:82px 1fr!important;padding:9px 0!important;font-size:10.5px!important}
        #agenda .agenda-person-chip-v150{font-size:9.5px!important;padding:5px 8px!important}
        #agenda .agenda-status-v150{font-size:8.5px!important;padding:4px 8px!important}
        #agenda .agenda-upcoming-v150 h4{font-size:11.5px!important}
        #agenda .agenda-upcoming-item-v150{padding:9px 0!important}
        #agenda .agenda-upcoming-date-v150{font-size:9.5px!important}
        #agenda .agenda-upcoming-item-v150 b{font-size:9.5px!important}
        #agenda .agenda-upcoming-item-v150 small{font-size:8.5px!important}
        #agenda .agenda-legend-v150{font-size:9.5px!important;padding-top:11px!important}
      }

      @media(min-width:1450px){
        #agenda .agenda-layout-v150{grid-template-columns:minmax(0,1fr) 320px!important}
        #agenda .agenda-day-v150{min-height:138px!important}
        #agenda .agenda-card-v150 b{font-size:11px!important}
        #agenda .agenda-card-v150 small{font-size:9.5px!important}
      }
    `;
    document.head.appendChild(s);
  }

  installStyle();
})();
