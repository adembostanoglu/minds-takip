// V1.24.0 — Personel İş Takibi geniş masaüstü görünümü. Yönetici 4 kolon görünümü aynen korunur.
(function bootStaffWideWorksV240(){
  if(window.__mindsStaffWideWorksV240)return;
  window.__mindsStaffWideWorksV240=true;

  function isAdminLocal(){
    try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}
  }

  function installStyle(){
    if(document.getElementById('staffWideWorksV240Style'))return;
    const s=document.createElement('style');
    s.id='staffWideWorksV240Style';
    s.textContent=`
      @media(min-width:761px){
        #works.staff-wide-works-v240 #worksPersonGridV228{
          grid-template-columns:minmax(0,1fr)!important;
          width:100%!important;
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          gap:12px!important;
        }
        #works.staff-wide-works-v240 .works-person-card-v228{
          width:100%!important;
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          overflow:visible!important;
        }
        #works.staff-wide-works-v240 .works-person-head-v228{
          padding:13px 15px!important;
        }
        #works.staff-wide-works-v240 .works-person-name-v228{
          font-size:15px!important;
        }
        #works.staff-wide-works-v240 .works-person-count-v228{
          font-size:10px!important;
          padding:5px 8px!important;
        }
        #works.staff-wide-works-v240 .works-person-body-v228{
          overflow:visible!important;
          padding:0 12px 14px!important;
        }
        #works.staff-wide-works-v240 .works-date-head-v228{
          position:static!important;
          padding:13px 2px 8px!important;
          font-size:12.5px!important;
        }
        #works.staff-wide-works-v240 .works-job-v228{
          display:grid!important;
          grid-template-columns:minmax(230px,1fr) minmax(260px,1.2fr) auto auto;
          align-items:center!important;
          gap:14px!important;
          padding:11px 12px!important;
          margin-bottom:7px!important;
        }
        #works.staff-wide-works-v240 .works-job-top-v228{
          margin:0!important;
          min-width:0!important;
          align-items:center!important;
        }
        #works.staff-wide-works-v240 .works-title-v228{
          margin:0!important;
          font-size:12.5px!important;
          min-width:0!important;
        }
        #works.staff-wide-works-v240 .works-status-v228{
          margin:0!important;
          flex-wrap:nowrap!important;
          justify-content:flex-start!important;
          white-space:nowrap!important;
        }
        #works.staff-wide-works-v240 .works-actions-v228{
          margin:0!important;
          padding:0!important;
          border-top:0!important;
          justify-content:flex-end!important;
          white-space:nowrap!important;
        }
        #works.staff-wide-works-v240 .works-actions-v228 button{
          min-height:31px!important;
          padding:6px 10px!important;
          font-size:9.5px!important;
        }
        #works.staff-wide-works-v240 .works-firm-v228{
          font-size:13px!important;
        }
        #works.staff-wide-works-v240 .works-type-v228{
          font-size:10px!important;
          padding:4px 7px!important;
        }
      }
      @media(min-width:761px) and (max-width:1100px){
        #works.staff-wide-works-v240 .works-job-v228{
          grid-template-columns:minmax(0,1fr) auto!important;
          gap:8px 12px!important;
        }
        #works.staff-wide-works-v240 .works-job-top-v228{grid-column:1/2}
        #works.staff-wide-works-v240 .works-title-v228{grid-column:1/2;margin-left:32px!important}
        #works.staff-wide-works-v240 .works-status-v228{grid-column:1/2;margin-left:32px!important}
        #works.staff-wide-works-v240 .works-actions-v228{grid-column:2/3;grid-row:1/4;align-self:center}
      }
    `;
    document.head.appendChild(s);
  }

  function apply(){
    const works=document.getElementById('works');
    if(!works)return;
    works.classList.toggle('staff-wide-works-v240',!isAdminLocal());
  }

  installStyle();
  apply();
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="works"]')){
      setTimeout(apply,30);
      setTimeout(apply,180);
    }
  },true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>setTimeout(apply,180));
  [120,420,900].forEach(ms=>setTimeout(apply,ms));
})();
