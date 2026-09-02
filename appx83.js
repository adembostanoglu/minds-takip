// V1.24.2 — Mobile agenda event labels. Desktop untouched; full-month phone layout stays intact.
(function bootMobileAgendaLabelsV242(){
  if(window.__mindsMobileAgendaLabelsV242)return;
  window.__mindsMobileAgendaLabelsV242=true;

  function installStyle(){
    if(document.getElementById('mobileAgendaLabelsV242Style'))return;
    const s=document.createElement('style');
    s.id='mobileAgendaLabelsV242Style';
    s.textContent=`
      @media(max-width:760px){
        #agenda .agenda-day-v150{
          min-height:104px!important;
          padding:4px 3px 6px!important;
          overflow:hidden!important;
        }
        #agenda .agenda-card-v150{
          display:flex!important;
          flex-direction:column!important;
          justify-content:center!important;
          align-items:stretch!important;
          gap:1px!important;
          width:100%!important;
          height:auto!important;
          min-height:42px!important;
          max-height:58px!important;
          margin:3px 0!important;
          padding:4px 4px!important;
          border-radius:6px!important;
          box-sizing:border-box!important;
          overflow:hidden!important;
          line-height:1.08!important;
          text-align:left!important;
        }
        #agenda .agenda-card-v150 b{
          display:-webkit-box!important;
          min-width:0!important;
          max-width:100%!important;
          margin:0!important;
          color:#f3f6f7!important;
          font-size:8.2px!important;
          font-weight:850!important;
          line-height:1.12!important;
          white-space:normal!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
          overflow-wrap:anywhere!important;
          -webkit-box-orient:vertical!important;
          -webkit-line-clamp:2!important;
        }
        #agenda .agenda-card-v150 small{
          display:-webkit-box!important;
          min-width:0!important;
          max-width:100%!important;
          margin:2px 0 0!important;
          color:#c3cdd2!important;
          font-size:7.1px!important;
          font-weight:650!important;
          line-height:1.12!important;
          white-space:normal!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
          overflow-wrap:anywhere!important;
          -webkit-box-orient:vertical!important;
          -webkit-line-clamp:2!important;
        }
        #agenda .agenda-more-v150{
          display:block!important;
          margin-top:2px!important;
          color:#b8c2c7!important;
          font-size:7.4px!important;
          line-height:1.15!important;
          white-space:normal!important;
          overflow:visible!important;
          text-overflow:clip!important;
        }
        #agenda .agenda-card-v150.agenda-type-shoot{background:linear-gradient(145deg,#19334d,#142635)!important}
        #agenda .agenda-card-v150.agenda-type-meeting{background:linear-gradient(145deg,#33234b,#211b31)!important}
        #agenda .agenda-card-v150.agenda-type-delivery{background:linear-gradient(145deg,#1b4427,#17301e)!important}
        #agenda .agenda-card-v150.agenda-type-share{background:linear-gradient(145deg,#473019,#2b2115)!important}
      }
      @media(max-width:390px){
        #agenda .agenda-day-v150{min-height:100px!important;padding-left:2px!important;padding-right:2px!important}
        #agenda .agenda-card-v150{min-height:40px!important;padding:4px 3px!important}
        #agenda .agenda-card-v150 b{font-size:7.7px!important}
        #agenda .agenda-card-v150 small{font-size:6.8px!important}
      }
    `;
    document.head.appendChild(s);
  }

  installStyle();
})();
