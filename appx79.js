// V1.23.7 — Mobile agenda + modal usability. Desktop untouched.
(function bootMobileAgendaModalV237(){
  if(window.__mindsMobileAgendaModalV237)return;
  window.__mindsMobileAgendaModalV237=true;

  const mobile=()=>window.matchMedia('(max-width:760px)').matches;

  function installStyles(){
    if(document.getElementById('mobileAgendaModalV237Style'))return;
    const s=document.createElement('style');
    s.id='mobileAgendaModalV237Style';
    s.textContent=`
      @media(max-width:760px){
        /* Modal always sits above the mobile navigation. */
        #modal{z-index:10250!important;align-items:flex-end!important;place-items:end center!important;padding:0!important}
        body:has(#modal:not(.hidden)) #mobileNavV220{visibility:hidden!important;pointer-events:none!important}
        #modal .modal-card{width:100%!important;max-width:none!important;max-height:calc(100dvh - 8px)!important;height:calc(100dvh - 8px)!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;border-radius:20px 20px 0 0!important;padding:14px 12px calc(10px + env(safe-area-inset-bottom))!important}
        #modal .modal-head{position:relative!important;top:auto!important;flex:0 0 auto!important;padding:2px 0 10px!important;margin:0!important;background:#12171b!important;border-bottom:1px solid #273036!important}
        #modal .modal-head h3{font-size:18px!important}
        #modalForm{display:flex!important;flex-direction:column!important;flex:1 1 auto!important;min-height:0!important;overflow:hidden!important}
        #modalForm>.form-grid{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;padding:12px 1px 14px!important;overscroll-behavior:contain}
        #modalForm>.form-actions.mobile-modal-actions-v237{position:relative!important;bottom:auto!important;z-index:3!important;flex:0 0 auto!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important;margin:0!important;padding:10px 0 calc(4px + env(safe-area-inset-bottom))!important;background:#12171b!important;border-top:1px solid #273036!important;box-shadow:0 -14px 30px rgba(0,0,0,.28)!important}
        #modalForm>.form-actions.mobile-modal-actions-v237 button{min-height:48px!important;width:100%!important;font-size:13px!important}

        /* Checkboxes must not inherit the 44px text-input height. */
        #modal .agenda-assignee-option-v150{min-height:50px!important;padding:10px 12px!important;gap:10px!important}
        #modal .agenda-assignee-option-v150 input[type="checkbox"]{width:20px!important;height:20px!important;min-width:20px!important;min-height:20px!important;max-width:20px!important;max-height:20px!important;padding:0!important;margin:0!important;flex:0 0 20px!important}
        #modal .agenda-assignee-option-v150 span{font-size:12px!important;line-height:1.25!important}
        #modal .agenda-assignee-grid-v150{gap:7px!important}

        /* Phone agenda: fit the full month to the viewport instead of showing only half of a 760px desktop calendar. */
        #agenda .agenda-layout-v150{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}
        #agenda .agenda-calendar-panel-v150{width:100%!important;max-width:100%!important;overflow-x:hidden!important;overflow-y:hidden!important}
        #agenda .agenda-weekdays-v150,
        #agenda .agenda-grid-v150{width:100%!important;min-width:0!important;max-width:100%!important;grid-template-columns:repeat(7,minmax(0,1fr))!important}
        #agenda .agenda-weekdays-v150>div{padding:8px 1px!important;font-size:8px!important}
        #agenda .agenda-day-v150{min-height:67px!important;padding:4px 3px!important;overflow:hidden!important}
        #agenda .agenda-day-number-v150{font-size:9px!important;margin-bottom:4px!important}
        #agenda .agenda-card-v150{height:8px!important;min-height:8px!important;margin:3px 0!important;padding:0!important;border-radius:999px!important;overflow:hidden!important}
        #agenda .agenda-card-v150 b,
        #agenda .agenda-card-v150 small{display:none!important}
        #agenda .agenda-more-v150{font-size:7px!important;padding:1px 0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
        #agenda .agenda-side-panel-v150{order:2!important;width:100%!important}
        #agenda .agenda-side-body-v150{padding:12px!important}
        #agenda .agenda-empty-detail-v150{padding:18px 10px!important}
        #agenda .agenda-toolbar-v150{gap:9px!important}
        #agenda .agenda-filter-row-v150{width:100%!important;overflow-x:auto!important;flex-wrap:nowrap!important;padding-bottom:2px!important;scrollbar-width:none}
        #agenda .agenda-filter-row-v150::-webkit-scrollbar{display:none}
        #agenda .agenda-filter-v150{flex:0 0 auto!important;white-space:nowrap!important;padding:8px 10px!important;font-size:9px!important}
        #agenda .agenda-month-actions-v150{width:100%!important;display:grid!important;grid-template-columns:38px minmax(0,1fr) 38px auto!important;gap:6px!important}
        #agenda .agenda-month-label-v150{min-width:0!important;font-size:11px!important}
        #agenda #agendaTodayV150{padding:8px 9px!important;font-size:9px!important;white-space:nowrap!important}
        #agenda .agenda-legend-v150{gap:9px!important;padding:8px 2px!important;font-size:8px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function normalizeModal(){
    if(!mobile())return;
    const form=document.getElementById('modalForm');
    if(!form)return;
    const grid=form.querySelector(':scope > .form-grid');
    const actions=grid?.querySelector('.form-actions');
    if(actions){
      actions.classList.add('mobile-modal-actions-v237');
      form.appendChild(actions);
    }
    requestAnimationFrame(()=>{
      if(grid)grid.scrollTop=0;
      const card=document.querySelector('#modal .modal-card');
      if(card)card.scrollTop=0;
    });
  }

  function patchOpenModal(){
    if(typeof window.openModal!=='function')return false;
    if(window.openModal.__mobileV237)return true;
    const base=window.openModal;
    const wrapped=function(...args){
      const out=base.apply(this,args);
      normalizeModal();
      setTimeout(normalizeModal,0);
      return out;
    };
    wrapped.__mobileV237=true;
    window.openModal=wrapped;
    return true;
  }

  function boot(){
    installStyles();
    if(patchOpenModal())return;
    let tries=0;
    const retry=()=>{
      tries++;
      if(patchOpenModal()||tries>=20)return;
      setTimeout(retry,100);
    };
    retry();
  }

  window.addEventListener('orientationchange',()=>setTimeout(normalizeModal,120));
  window.addEventListener('resize',()=>{if(mobile())normalizeModal();});
  boot();
})();
