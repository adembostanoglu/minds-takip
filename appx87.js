// V1.24.6 — Ajanda: 3'ten fazla plan bulunan günlerde tüm planları hücre içinde kaydırarak gösterir.
(function bootAgendaDayScrollV246(){
  if(window.__mindsAgendaDayScrollV246)return;
  if(typeof sb==='undefined'||typeof selectedMonth==='undefined'){
    setTimeout(bootAgendaDayScrollV246,120);return;
  }
  window.__mindsAgendaDayScrollV246=true;

  let observer=null;
  let observedGrid=null;
  let busy=false;
  let pending=false;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const typeClass={cekim:'agenda-type-shoot',toplanti:'agenda-type-meeting',teslim:'agenda-type-delivery',paylasim:'agenda-type-share',diger:'agenda-type-other'};
  const firmName=e=>{
    if(e?.firm_id)return (state?.firms||[]).find(f=>f.id===e.firm_id)?.name||'Kayıtlı Firma';
    return e?.external_client_name||'Ajans İçi';
  };
  const monthRange=()=>{
    const key=String(selectedMonth||'').slice(0,7),[y,m]=key.split('-').map(Number);
    if(!y||!m)return null;
    const end=new Date(y,m,0).getDate();
    return {start:`${key}-01`,end:`${key}-${String(end).padStart(2,'0')}`};
  };

  function installStyle(){
    if(document.getElementById('agendaDayScrollV246Style'))return;
    const s=document.createElement('style');
    s.id='agendaDayScrollV246Style';
    s.textContent=`
      @media(min-width:761px){
        #agenda .agenda-day-v150.agenda-scroll-day-v246{overflow:hidden!important}
        #agenda .agenda-day-scroll-v246{max-height:116px;overflow-y:auto;overflow-x:hidden;padding-right:3px;margin-right:-3px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#46545b transparent}
        #agenda .agenda-day-scroll-v246::-webkit-scrollbar{width:5px}
        #agenda .agenda-day-scroll-v246::-webkit-scrollbar-track{background:transparent}
        #agenda .agenda-day-scroll-v246::-webkit-scrollbar-thumb{background:#46545b;border-radius:999px}
        #agenda .agenda-day-scroll-v246::-webkit-scrollbar-thumb:hover{background:#61717a}
        #agenda .agenda-day-scroll-v246 .agenda-card-v150{margin-top:4px!important;margin-bottom:4px!important}
        #agenda .agenda-day-v150.agenda-scroll-day-v246:after{content:'↕';position:absolute;right:5px;top:5px;color:#697980;font-size:9px;pointer-events:none;opacity:.8}
        #agenda .agenda-more-v150{display:none!important}
      }
    `;
    document.head.appendChild(s);
  }

  function activeFilter(){
    return document.querySelector('#agendaFiltersV150 .agenda-filter-v150.active')?.dataset?.agendaFilter||'all';
  }

  function proxyCoreClick(eventId,ev){
    ev?.stopPropagation?.();
    const grid=document.getElementById('agendaGridV150');
    const anchor=[...(grid?.querySelectorAll('.agenda-card-v150[data-agenda-id]:not([data-agenda-extra-v246])')||[])].find(x=>typeof x.onclick==='function');
    if(!anchor)return;
    const old=anchor.dataset.agendaId;
    anchor.dataset.agendaId=eventId;
    try{anchor.click();}finally{anchor.dataset.agendaId=old;}
  }

  function extraCard(e){
    const b=document.createElement('button');
    b.className=`agenda-card-v150 ${typeClass[e.event_type]||typeClass.diger}`;
    b.dataset.agendaId=e.id;
    b.dataset.agendaExtraV246='1';
    b.innerHTML=`<b>${esc(firmName(e))}</b><small>${e.start_time?String(e.start_time).slice(0,5)+' · ':''}${esc(e.title||'Plan')}</small>`;
    b.addEventListener('click',ev=>proxyCoreClick(e.id,ev));
    return b;
  }

  async function enhance(){
    if(busy){pending=true;return;}
    const agenda=document.getElementById('agenda'),grid=document.getElementById('agendaGridV150');
    if(!agenda?.classList.contains('active-view')||!grid)return;
    const range=monthRange();if(!range)return;
    busy=true;
    if(observer&&observedGrid===grid)observer.disconnect();
    try{
      const {data,error}=await sb.from('agenda_events').select('id,title,event_type,event_date,start_time,firm_id,external_client_name,status').gte('event_date',range.start).lte('event_date',range.end).order('event_date',{ascending:true}).order('start_time',{ascending:true,nullsFirst:false});
      if(error)throw error;
      const filter=activeFilter();
      const rows=(data||[]).filter(e=>filter==='all'||e.event_type===filter);
      const byDate=new Map();
      rows.forEach(e=>{if(!byDate.has(e.event_date))byDate.set(e.event_date,[]);byDate.get(e.event_date).push(e);});

      grid.querySelectorAll('.agenda-day-v150[data-agenda-day]').forEach(day=>{
        day.classList.remove('agenda-scroll-day-v246');
        day.querySelector('.agenda-day-scroll-v246')?.replaceWith(...day.querySelector('.agenda-day-scroll-v246')?.children||[]);
        day.querySelectorAll('[data-agenda-extra-v246]').forEach(x=>x.remove());
        const events=byDate.get(day.dataset.agendaDay)||[];
        if(events.length<=3)return;

        const cards=[...day.querySelectorAll(':scope > .agenda-card-v150[data-agenda-id]')];
        if(!cards.length)return;
        const more=day.querySelector(':scope > .agenda-more-v150');
        const scroller=document.createElement('div');
        scroller.className='agenda-day-scroll-v246';
        cards.forEach(c=>scroller.appendChild(c));
        const visibleIds=new Set(cards.map(c=>c.dataset.agendaId));
        events.filter(e=>!visibleIds.has(String(e.id))).forEach(e=>scroller.appendChild(extraCard(e)));
        if(more)more.remove();
        day.appendChild(scroller);
        day.classList.add('agenda-scroll-day-v246');
      });
    }catch(e){console.warn('[Ajanda kaydırma]',e);}finally{
      busy=false;
      attachObserver();
      if(pending){pending=false;setTimeout(enhance,60);}
    }
  }

  function schedule(){
    if(pending)return;
    pending=true;
    setTimeout(()=>{pending=false;enhance();},90);
  }

  function attachObserver(){
    const grid=document.getElementById('agendaGridV150');if(!grid)return;
    if(!observer)observer=new MutationObserver(schedule);
    if(observedGrid===grid){observer.observe(grid,{childList:true});return;}
    observer.disconnect();observedGrid=grid;observer.observe(grid,{childList:true});
  }

  installStyle();
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="agenda"],#agendaFiltersV150 .agenda-filter-v150,#agendaPrevV150,#agendaNextV150,#agendaTodayV150'))setTimeout(schedule,120);
  },true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>setTimeout(schedule,180));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(schedule,100);});
  [180,500,1000].forEach(ms=>setTimeout(()=>{attachObserver();schedule();},ms));
})();
