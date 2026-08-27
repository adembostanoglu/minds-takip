// V1.18.6 — Personel Ajanda ekranında erişim kısıtı nedeniyle gizlenen kayıtlı firma adlarını güvenli biçimde gösterir.
(function bootAgendaFirmNamesV186(){
  if(window.__mindsAgendaFirmNamesV186)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){setTimeout(bootAgendaFirmNamesV186,140);return;}
  window.__mindsAgendaFirmNamesV186=true;

  let loadedMonth='',loading=false,currentDetailId=null;
  let eventsById=new Map(),namesByFirm=new Map();

  const monthKey=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  const monthStart=()=>monthKey()+'-01';
  const monthEnd=()=>{
    const [y,m]=monthKey().split('-').map(Number);
    const d=new Date(y,m,0);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const agendaOpen=()=>document.getElementById('agenda')?.classList.contains('active-view');
  const firmNameForEvent=id=>{
    const e=eventsById.get(String(id));
    return e?.firm_id?namesByFirm.get(String(e.firm_id))||'': '';
  };

  function patchDetail(){
    if(!currentDetailId)return;
    const name=firmNameForEvent(currentDetailId);if(!name)return;
    const el=document.querySelector('#agenda .agenda-detail-client-v150');if(!el)return;
    const txt=el.textContent||'';
    const i=txt.indexOf('·');
    el.textContent=i>=0?`${txt.slice(0,i).trim()} · ${name}`:name;
  }

  function patchAll(){
    if(!agendaOpen())return;
    document.querySelectorAll('#agenda [data-agenda-id]').forEach(card=>{
      const name=firmNameForEvent(card.dataset.agendaId);if(!name)return;
      const b=card.querySelector('b');if(b)b.textContent=name;
    });
    document.querySelectorAll('#agenda [data-upcoming-agenda]').forEach(row=>{
      const name=firmNameForEvent(row.dataset.upcomingAgenda);if(!name)return;
      const b=row.querySelector('b');if(b)b.textContent=name;
    });
    patchDetail();
  }

  async function load(force=false){
    if(!agendaOpen())return;
    const m=monthStart(),end=monthEnd();
    if(!/^\d{4}-\d{2}-01$/.test(m))return;
    if(loading||(!force&&loadedMonth===m)){patchAll();return;}
    loading=true;
    try{
      const [ev,nm]=await Promise.all([
        sb.from('agenda_events').select('id,firm_id,event_date').gte('event_date',m).lte('event_date',end),
        sb.rpc('agenda_firm_names',{p_start:m,p_end:end})
      ]);
      if(ev.error)throw ev.error;if(nm.error)throw nm.error;
      eventsById=new Map((ev.data||[]).map(x=>[String(x.id),x]));
      namesByFirm=new Map((nm.data||[]).map(x=>[String(x.firm_id),x.firm_name]));
      loadedMonth=m;
      patchAll();
    }catch(e){console.warn('Ajanda firma adları yüklenemedi',e);}finally{loading=false;}
  }

  function schedule(force=false){[80,240,520].forEach(ms=>setTimeout(()=>load(force),ms));}

  document.addEventListener('click',e=>{
    const card=e.target.closest('[data-agenda-id]');
    const upcoming=e.target.closest('[data-upcoming-agenda]');
    if(card)currentDetailId=card.dataset.agendaId;
    else if(upcoming)currentDetailId=upcoming.dataset.upcomingAgenda;
    if(e.target.closest('.nav-item[data-view="agenda"]'))schedule(true);
    else if(card||upcoming)setTimeout(patchAll,80);
    else if(e.target.closest('#agendaConvertV150'))setTimeout(()=>{
      const name=firmNameForEvent(currentDetailId);if(!name)return;
      document.querySelectorAll('.info-banner b').forEach(b=>{if((b.textContent||'').trim()==='Kayıtlı Firma')b.textContent=name;});
    },120);
  },true);

  document.addEventListener('change',e=>{
    if(e.target?.id==='monthPicker'){loadedMonth='';currentDetailId=null;schedule(true);}
  },true);

  setInterval(()=>{if(agendaOpen())patchAll();},1200);
  setTimeout(()=>{if(agendaOpen())load(true);},550);
})();
