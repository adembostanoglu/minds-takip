// V1.16.3 — Mesai ekranı premium referans düzeni; daha okunaklı tipografi ve geniş personel detayı.
(function bootAttendanceReferenceLayoutV162(){
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){setTimeout(bootAttendanceReferenceLayoutV162,150);return;}
  if(window.__mindsAttendanceReferenceLayoutV162)return;
  window.__mindsAttendanceReferenceLayoutV162=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const money=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(v||0));
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const monthStart=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';
  let kpiLoading=false;

  function installStyles(){
    if(document.getElementById('attendanceRefV162Styles'))return;
    const s=document.createElement('style');s.id='attendanceRefV162Styles';s.textContent=`
      #attendance.ref-ui-v162{padding:0 0 36px}
      #attendance.ref-ui-v162 .att-head-v160{margin-bottom:16px;align-items:center}
      #attendance.ref-ui-v162 .att-head-v160 h2{font-size:27px!important;letter-spacing:-.6px}
      #attendance.ref-ui-v162 .att-head-v160 p{font-size:12px!important;color:#929da2!important}
      #attendance.ref-ui-v162 .att-team-status-v160{display:none!important}
      .att-ref-kpis-v162{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:0 0 15px}
      .att-ref-kpi-v162{min-height:104px;border:1px solid #2a3339;border-radius:12px;background:linear-gradient(145deg,#151b1f,#101519);padding:14px 15px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
      .att-ref-kpi-v162:before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:#676323}
      .att-ref-kpi-v162 .ico{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1px solid #5c5622;background:#26230d;color:#e9df2c;font-size:16px;margin-bottom:9px}
      .att-ref-kpi-v162 small{font-size:10px;color:#98a2a7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .att-ref-kpi-v162 b{font-size:21px;color:#edf1f2;margin-top:5px;line-height:1.1}
      .att-ref-kpi-v162.warn:before{background:#a8502d}.att-ref-kpi-v162.warn .ico{border-color:#7b3e2b;background:#2d1812;color:#e58959}
      .att-ref-kpi-v162.blue:before{background:#347c80}.att-ref-kpi-v162.blue .ico{border-color:#356b70;background:#10282a;color:#72c4c7}
      .att-ref-kpi-v162.purple:before{background:#6d4e87}.att-ref-kpi-v162.purple .ico{border-color:#624778;background:#27182f;color:#be91d5}
      .att-ref-kpi-v162.red:before{background:#8f4239}.att-ref-kpi-v162.red .ico{border-color:#73342f;background:#2d1716;color:#e36c61}
      .att-ref-kpi-v162.gold b{color:#f0e72d}
      #attendance.ref-ui-v162 .att-grid-v160{grid-template-columns:minmax(0,1fr) 430px;gap:14px;align-items:start}
      #attendance.ref-ui-v162 .att-panel-v160{border-color:#2b343a;border-radius:12px;background:#10161a;box-shadow:0 8px 24px rgba(0,0,0,.14)}
      #attendance.ref-ui-v162 .att-panel-head-v160{padding:15px 16px;background:linear-gradient(180deg,#141b20,#11171b)}
      #attendance.ref-ui-v162 .att-panel-head-v160 h3{font-size:15px!important}
      #attendance.ref-ui-v162 .att-panel-head-v160 p{font-size:10px!important}
      #attendance.ref-ui-v162 .att-table-v160 th{background:#151b20;color:#a6afb3;font-size:10px!important;padding:12px 10px}
      #attendance.ref-ui-v162 .att-table-v160 td{font-size:11.5px!important;padding:13px 10px}
      #attendance.ref-ui-v162 .att-table-v160 td b{font-size:11.5px}
      #attendance.ref-ui-v162 .att-table-v160 tbody tr:hover td{background:#151a17}
      #attendance.ref-ui-v162 .att-table-v160 tbody tr:has(.money-strong):hover{outline:1px solid rgba(224,215,44,.28);outline-offset:-1px}
      #attendance.ref-ui-v162 .att-badge-v160{font-size:9.5px!important;padding:5px 8px}
      #attendance.ref-ui-v162 aside>.att-panel-v160{margin-bottom:12px}
      #attendance.ref-ui-v162 aside>.att-panel-v160.att-section-gap-v160{margin-top:0;max-height:75vh;overflow:auto;position:sticky;top:12px}
      #attendance.ref-ui-v162 aside .att-panel-head-v160{align-items:flex-start;flex-wrap:wrap}
      #attendance.ref-ui-v162 aside .att-person-select-v160{display:flex;flex-wrap:wrap;gap:8px;width:100%;align-items:center}
      #attendance.ref-ui-v162 aside .att-person-select-v160 select{min-width:0!important;flex:1 1 220px;font-size:11px;height:38px}
      #attendance.ref-ui-v162 aside .att-person-select-v160 button{flex:0 0 auto;min-height:38px;font-size:10px;white-space:nowrap}
      #attendance.ref-ui-v162 aside .att-detail-summary-v160{grid-template-columns:1fr 1fr;gap:8px}
      #attendance.ref-ui-v162 aside .att-detail-item-v160{padding:11px}
      #attendance.ref-ui-v162 aside .att-detail-item-v160 small{font-size:9.5px!important}
      #attendance.ref-ui-v162 aside .att-detail-item-v160 b{font-size:13.5px!important}
      #attendance.ref-ui-v162 aside .att-table-v160{min-width:720px}
      #attendance.ref-ui-v162 aside .att-table-scroll-v160{overflow:auto;max-height:275px;border-top:1px solid #222b30}
      #attendance.ref-ui-v162 aside .att-adjust-v160{font-size:10px!important}
      #attendance.ref-ui-v162 .att-rules-ref-v162{margin-top:13px}
      #attendance.ref-ui-v162 .att-rules-ref-v162 .att-rules-v160{grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      #attendance.ref-ui-v162 .att-rules-ref-v162 .att-rule-v160{padding:12px 13px}
      #attendance.ref-ui-v162 .att-rules-ref-v162 .att-rule-v160 b{font-size:11.5px!important}
      #attendance.ref-ui-v162 .att-rules-ref-v162 .att-rule-v160 p{font-size:10.5px!important;line-height:1.6}
      #attendance.ref-ui-v162 .att-rules-ref-v162 .att-rule-v160:nth-child(n+4){grid-column:auto}
      #attendance.ref-ui-v162 .att-ref-bottom-actions-v162{display:flex!important;gap:9px;justify-content:flex-end;margin-top:13px;padding:11px;border:1px solid #2a3338;border-radius:12px;background:rgba(14,19,22,.96);position:sticky;bottom:10px;z-index:8;box-shadow:0 10px 35px rgba(0,0,0,.35);backdrop-filter:blur(9px)}
      #attendance.ref-ui-v162 .att-ref-bottom-actions-v162 button{min-width:150px;min-height:42px;font-size:11px}
      #attendance.ref-ui-v162 .att-ref-bottom-actions-v162 .primary{background:linear-gradient(180deg,#9d7b20,#6e5515);border-color:#b68d25;color:#fff}
      #attendance.ref-ui-v162 .att-today-v160{gap:11px}
      #attendance.ref-ui-v162 .att-clock-card-v160{border-radius:12px;background:linear-gradient(145deg,#151c20,#10161a);padding:18px}
      #attendance.ref-ui-v162 .att-clock-card-v160 h3{font-size:15px!important}
      #attendance.ref-ui-v162 .att-clock-status-v160{font-size:24px}
      #attendance.ref-ui-v162 .att-clock-sub-v160{font-size:11px!important}
      #attendance.ref-ui-v162 .att-kpis-v160{gap:9px}
      #attendance.ref-ui-v162 .att-kpi-v160{min-height:84px;display:flex;flex-direction:column;justify-content:center;padding:14px}
      #attendance.ref-ui-v162 .att-kpi-v160 small{font-size:9.5px!important}
      #attendance.ref-ui-v162 .att-kpi-v160 b{font-size:20px!important}
      @media(max-width:1450px){.att-ref-kpis-v162{grid-template-columns:repeat(3,1fr)}#attendance.ref-ui-v162 .att-grid-v160{grid-template-columns:minmax(0,1fr) 390px}}
      @media(max-width:1120px){#attendance.ref-ui-v162 .att-grid-v160{grid-template-columns:1fr}#attendance.ref-ui-v162 aside>.att-panel-v160.att-section-gap-v160{position:static;max-height:none}.att-ref-kpis-v162{grid-template-columns:repeat(2,1fr)}#attendance.ref-ui-v162 .att-rules-ref-v162 .att-rules-v160{grid-template-columns:1fr 1fr}}
      @media(max-width:680px){.att-ref-kpis-v162{grid-template-columns:1fr 1fr}.att-ref-kpi-v162{min-height:86px}#attendance.ref-ui-v162 .att-ref-bottom-actions-v162{position:static;flex-direction:column}#attendance.ref-ui-v162 .att-ref-bottom-actions-v162 button{width:100%}#attendance.ref-ui-v162 .att-rules-ref-v162 .att-rules-v160{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function istMinutes(ts){
    if(!ts)return null;
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ts));
    const o=Object.fromEntries(parts.map(x=>[x.type,x.value]));return Number(o.hour)*60+Number(o.minute);
  }
  function todayISO(){
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${o.year}-${o.month}-${o.day}`;
  }

  async function refreshKpis(root){
    if(kpiLoading||!isAdmin?.())return;kpiLoading=true;
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
      host.dataset.month=month;
      host.innerHTML=`
        <div class="att-ref-kpi-v162"><span class="ico">◎</span><small>Bugün Giriş Yapanlar</small><b>${entered}</b></div>
        <div class="att-ref-kpi-v162 warn"><span class="ico">◷</span><small>Geç Gelenler</small><b>${late}</b></div>
        <div class="att-ref-kpi-v162 blue"><span class="ico">◴</span><small>Fazla Mesai Saati</small><b>${esc(minsText(overtime))}</b></div>
        <div class="att-ref-kpi-v162 purple"><span class="ico">☂</span><small>İzinli Personel</small><b>${leave}</b></div>
        <div class="att-ref-kpi-v162 red"><span class="ico">✚</span><small>Raporlu Personel</small><b>${sick}</b></div>
        <div class="att-ref-kpi-v162 gold"><span class="ico">₺</span><small>Bu Ay Toplam Ödeme</small><b>${esc(money(total))}</b></div>`;
    }catch(e){console.warn('Mesai üst kartları hazırlanamadı',e);}finally{kpiLoading=false;}
  }

  function decorate(){
    const section=document.getElementById('attendance'),root=document.getElementById('attendanceRootV160');
    if(!section||!root)return;
    section.classList.add('ref-ui-v162');
    const grid=root.querySelector('.att-grid-v160');if(!grid)return;
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
      const host=root.querySelector('.att-ref-kpis-v162');if(!host||host.dataset.month!==monthStart())refreshKpis(root);
    }
  }

  installStyles();
  decorate();
  setInterval(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))decorate();},650);
})();