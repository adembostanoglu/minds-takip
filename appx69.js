// V1.22.2 — Mesai render senkronu: premium yerleşim + sabit personel sırası aynı event-driven akışta korunur.
(function bootAttendanceRenderSyncV222(){
  if(window.__mindsAttendanceRenderSyncV222)return;
  window.__mindsAttendanceRenderSyncV222=true;

  let observer=null,observedRoot=null,pending=false,kpiBusy=false;
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const monthStart=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';
  const money=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(v||0));
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};

  function istMinutes(ts){
    if(!ts)return null;
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ts));
    const o=Object.fromEntries(parts.map(x=>[x.type,x.value]));return Number(o.hour)*60+Number(o.minute);
  }
  function todayISO(){
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${o.year}-${o.month}-${o.day}`;
  }

  async function ensureKpis(root){
    if(kpiBusy||typeof isAdmin!=='function'||!isAdmin())return;
    const current=root.querySelector('.att-ref-kpis-v162');
    if(current&&current.dataset.month===monthStart())return;
    kpiBusy=true;
    try{
      const today=todayISO(),month=monthStart();
      const [ar,ds,pp]=await Promise.all([
        sb.from('attendance_records').select('person_id,clock_in,clock_out,mode').eq('work_date',today),
        sb.from('attendance_day_status').select('person_id,status').eq('status_date',today),
        sb.rpc('payroll_preview',{p_month:month,p_person_id:null})
      ]);
      if(ar.error||ds.error||pp.error)return;
      const recs=ar.data||[],stats=ds.data||[],pay=pp.data||[];
      const entered=recs.filter(x=>x.clock_in).length;
      const late=recs.filter(x=>x.clock_in&&x.mode!=='field'&&istMinutes(x.clock_in)>=550).length;
      const overtime=pay.reduce((s,x)=>s+Number(x.overtime_minutes_approved||0),0);
      const leave=stats.filter(x=>['paid_leave','unpaid_leave','excused'].includes(x.status)).length;
      const sick=stats.filter(x=>x.status==='sick_leave').length;
      const total=pay.reduce((s,x)=>s+Number(x.payable_amount||0),0);
      let host=root.querySelector('.att-ref-kpis-v162');
      if(!host){host=document.createElement('div');host.className='att-ref-kpis-v162';root.querySelector('.att-head-v160')?.insertAdjacentElement('afterend',host);}
      if(!host)return;
      host.dataset.month=month;
      host.innerHTML=`
        <div class="att-ref-kpi-v162"><span class="ico">◎</span><small>Bugün Giriş Yapanlar</small><b>${entered}</b></div>
        <div class="att-ref-kpi-v162 warn"><span class="ico">◷</span><small>Geç Gelenler</small><b>${late}</b></div>
        <div class="att-ref-kpi-v162 blue"><span class="ico">◴</span><small>Fazla Mesai Saati</small><b>${esc(minsText(overtime))}</b></div>
        <div class="att-ref-kpi-v162 purple"><span class="ico">☂</span><small>İzinli Personel</small><b>${leave}</b></div>
        <div class="att-ref-kpi-v162 red"><span class="ico">✚</span><small>Raporlu Personel</small><b>${sick}</b></div>
        <div class="att-ref-kpi-v162 gold"><span class="ico">₺</span><small>Bu Ay Toplam Ödeme</small><b>${esc(money(total))}</b></div>`;
    }catch(e){console.warn('Mesai görünüm senkron KPI',e);}finally{kpiBusy=false;}
  }

  function syncLayout(){
    const section=document.getElementById('attendance'),root=document.getElementById('attendanceRootV160');
    if(!section||!root)return;
    section.classList.add('ref-ui-v162');
    const grid=root.querySelector('.att-grid-v160');
    if(!grid)return;

    if(typeof isAdmin==='function'&&isAdmin()){
      const left=grid.children[0],aside=grid.querySelector('aside');
      if(left&&aside){
        const detail=left.querySelector('.att-panel-v160.att-section-gap-v160');
        if(detail&&detail.parentElement!==aside)aside.prepend(detail);
        const rules=[...aside.children].find(x=>x.querySelector('h3')?.textContent?.includes('Çalışma & Mesai Kuralları'));
        if(rules&&rules.parentElement===aside){rules.classList.add('att-rules-ref-v162');grid.insertAdjacentElement('afterend',rules);}
      }
      const actions=root.querySelector('.att-head-actions-v160');
      if(actions&&!actions.classList.contains('att-ref-bottom-actions-v162')){actions.classList.add('att-ref-bottom-actions-v162');root.appendChild(actions);}
      ensureKpis(root);
    }

    const sourceSelect=root.querySelector('#attPersonSelectV160');
    const sourcePanel=sourceSelect?.closest('.att-panel-v160');
    if(sourcePanel)sourcePanel.classList.add('att-inline-source-v195');

    // Render sonrası korunması gereken UI invariantları tek noktadan yeniden uygula.
    try{window.__mindsApplyAttendanceStaffOrderV222?.();}catch(e){console.warn('Mesai personel sırası senkronu',e);}
  }

  function attachObserver(){
    const root=document.getElementById('attendanceRootV160');
    if(!root)return;
    if(!observer)observer=new MutationObserver(()=>{
      if(pending||document.hidden)return;
      pending=true;
      requestAnimationFrame(()=>{
        pending=false;
        const current=document.getElementById('attendanceRootV160');
        observer.disconnect();
        try{syncLayout();}finally{
          if(current?.isConnected){observedRoot=current;observer.observe(current,{childList:true,subtree:true});}
        }
      });
    });
    if(observedRoot===root)return;
    observer.disconnect();observedRoot=root;observer.observe(root,{childList:true,subtree:true});
  }

  function scheduleSync(){[30,120,300,650,1200].forEach(ms=>setTimeout(()=>{attachObserver();syncLayout();},ms));}

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="attendance"],#attendanceRootV160,[data-att-detail],[data-att-edit-day],[data-att-overtime]'))scheduleSync();
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160'))scheduleSync();},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleSync();});
  window.addEventListener('pageshow',scheduleSync);

  setTimeout(()=>{attachObserver();scheduleSync();},450);
})();
