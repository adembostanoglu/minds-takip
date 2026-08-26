// V1.16.6 — Stable attendance personnel detail drawer. Independent from appx32 render cycle.
(function bootAttendanceDetailDrawerV166(){
  if(window.__mindsAttendanceDetailDrawerV166)return;
  window.__mindsAttendanceDetailDrawerV166=true;
  const TZ='Europe/Istanbul';
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const money=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0));
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const monthStart=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';
  const nextMonth=()=>{const [y,m]=monthStart().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const dateTR=v=>{if(!v)return '—';const [y,m,d]=String(v).slice(0,10).split('-');return `${d}.${m}.${y}`;};
  const tzParts=v=>{const p=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(v));return Object.fromEntries(p.map(x=>[x.type,x.value]));};
  const timeTR=v=>{if(!v)return '—';const o=tzParts(v);return `${o.hour}:${o.minute}`;};
  const localMinutes=v=>{if(!v)return null;const o=tzParts(v);return Number(o.hour)*60+Number(o.minute);};
  const dow=date=>new Date(`${date}T12:00:00Z`).getUTCDay();
  const profileName=id=>(state?.profiles||[]).find(p=>p.id===id)?.full_name||'Personel';
  function lateFor(r,ds){if(!r?.clock_in||r.mode==='field')return 0;if(ds&&ds.status!=='absent')return 0;if(dow(r.work_date)===0)return 0;const t=localMinutes(r.clock_in);return t>=550?Math.max(0,t-510):0;}
  function overtimeFor(r){if(!r?.clock_out)return 0;const d=dow(r.work_date);if(d<1||d>5)return 0;const t=localMinutes(r.clock_out);return t>=1170?Math.max(0,t-1110):0;}

  function installStyles(){
    if(document.getElementById('attDetailDrawerV166Style'))return;
    const s=document.createElement('style');s.id='attDetailDrawerV166Style';s.textContent=`
      .att-drawer-backdrop-v166{position:fixed;inset:0;background:rgba(0,0,0,.46);backdrop-filter:blur(2px);z-index:9990;opacity:0;transition:opacity .18s ease}.att-drawer-backdrop-v166.open{opacity:1}
      .att-drawer-v166{position:fixed;top:0;right:0;height:100vh;width:min(520px,94vw);background:#0e1418;border-left:1px solid #30393f;z-index:9991;box-shadow:-24px 0 60px rgba(0,0,0,.45);transform:translateX(102%);transition:transform .22s ease;display:flex;flex-direction:column;color:#e8edef}
      .att-drawer-v166.open{transform:translateX(0)}
      .att-drawer-head-v166{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px;border-bottom:1px solid #273137;background:linear-gradient(180deg,#151c20,#10161a)}
      .att-drawer-head-v166 h3{margin:0;font-size:20px;letter-spacing:-.3px}.att-drawer-head-v166 p{margin:5px 0 0;color:#839098;font-size:11px}.att-drawer-close-v166{width:36px;height:36px;border:1px solid #354047;border-radius:10px;background:#151c20;color:#d9e0e3;font-size:20px;cursor:pointer}
      .att-drawer-toolbar-v166{display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid #222b30}.att-drawer-toolbar-v166 select{flex:1;min-width:0}
      .att-drawer-body-v166{padding:18px 20px 26px;overflow:auto;flex:1}
      .att-drawer-summary-v166{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:16px}.att-drawer-kpi-v166{border:1px solid #2a343a;border-radius:11px;background:#12191d;padding:12px}.att-drawer-kpi-v166 small{display:block;color:#839097;font-size:10px;margin-bottom:5px}.att-drawer-kpi-v166 b{font-size:16px}.att-drawer-kpi-v166.good b{color:#91d47a}.att-drawer-kpi-v166.bad b{color:#e8908b}.att-drawer-kpi-v166.accent{border-color:#625d22;background:#1c1d0e}.att-drawer-kpi-v166.accent b{color:#ece52c}
      .att-drawer-section-v166{border:1px solid #293239;border-radius:12px;background:#10171b;margin-top:12px;overflow:hidden}.att-drawer-section-head-v166{padding:12px 13px;border-bottom:1px solid #252e33;font-size:12px;font-weight:800}.att-drawer-table-wrap-v166{overflow:auto;max-height:330px}.att-drawer-table-v166{width:100%;border-collapse:collapse;min-width:650px}.att-drawer-table-v166 th,.att-drawer-table-v166 td{padding:10px 9px;border-bottom:1px solid #20282d;font-size:10px;text-align:left;white-space:nowrap}.att-drawer-table-v166 th{color:#8d999f;background:#131a1e;font-size:9px;position:sticky;top:0}.att-drawer-table-v166 .good{color:#91d47a}.att-drawer-table-v166 .bad{color:#e8908b}.att-drawer-empty-v166{padding:24px;text-align:center;color:#6f7c83;font-size:11px}.att-drawer-adjust-v166{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid #222b30;font-size:10px}.att-drawer-adjust-v166:last-child{border-bottom:0}.att-drawer-adjust-v166 span{color:#99a4a9}.att-drawer-adjust-v166 b.plus{color:#91d47a}.att-drawer-adjust-v166 b.minus{color:#e8908b}.att-drawer-loading-v166{padding:40px 20px;text-align:center;color:#8b979d;font-size:12px}
      @media(max-width:620px){.att-drawer-v166{width:100vw}.att-drawer-summary-v166{grid-template-columns:1fr 1fr}.att-drawer-head-v166{padding:16px}.att-drawer-body-v166{padding:14px 16px 22px}}
    `;document.head.appendChild(s);
  }

  function ensureDrawer(){
    installStyles();
    let back=document.getElementById('attDetailBackdropV166'),drawer=document.getElementById('attDetailDrawerV166');
    if(!back){back=document.createElement('div');back.id='attDetailBackdropV166';back.className='att-drawer-backdrop-v166';document.body.appendChild(back);back.addEventListener('click',closeDrawer);}
    if(!drawer){drawer=document.createElement('aside');drawer.id='attDetailDrawerV166';drawer.className='att-drawer-v166';drawer.innerHTML='<div class="att-drawer-loading-v166">Personel detayı hazırlanıyor…</div>';document.body.appendChild(drawer);}
    return {back,drawer};
  }
  function closeDrawer(){const {back,drawer}=ensureDrawer();drawer.classList.remove('open');back.classList.remove('open');setTimeout(()=>{if(!drawer.classList.contains('open'))back.style.pointerEvents='none';},180);}
  function showDrawer(){const {back,drawer}=ensureDrawer();back.style.pointerEvents='auto';requestAnimationFrame(()=>{back.classList.add('open');drawer.classList.add('open');});}

  function statusLabel(s,mode,clockOut,clockIn){
    const map={paid_leave:'Ücretli İzin',unpaid_leave:'Ücretsiz İzin',sick_leave:'Raporlu',field:'Saha / Çekim',official_holiday:'Resmî Tatil',weekly_rest:'Hafta Tatili',excused:'Mazeretli',absent:'Gelmedi'};
    if(s)return map[s]||s;if(mode==='field')return 'Saha / Çekim';if(clockOut)return 'Tamamlandı';if(clockIn)return 'Çalışıyor';return '—';
  }

  async function loadDetail(pid){
    const {drawer}=ensureDrawer();showDrawer();drawer.innerHTML='<div class="att-drawer-loading-v166">Personel detayı yükleniyor…</div>';
    try{
      const start=monthStart(),end=nextMonth();
      const [payRes,recRes,statusRes,adjRes]=await Promise.all([
        sb.rpc('payroll_preview',{p_month:start,p_person_id:pid}),
        sb.from('attendance_records').select('*').eq('person_id',pid).gte('work_date',start).lt('work_date',end).order('work_date',{ascending:false}),
        sb.from('attendance_day_status').select('*').eq('person_id',pid).gte('status_date',start).lt('status_date',end).order('status_date',{ascending:false}),
        sb.from('payroll_adjustments').select('*').eq('person_id',pid).eq('month',start).order('created_at',{ascending:false})
      ]);
      for(const r of [payRes,recRes,statusRes,adjRes])if(r.error)throw r.error;
      const pay=Array.isArray(payRes.data)?(payRes.data[0]||{}):(payRes.data||{}),recs=recRes.data||[],stats=statusRes.data||[],adjs=adjRes.data||[];
      const name=pay.full_name||profileName(pid);
      const dates=new Set([...recs.map(x=>x.work_date),...stats.map(x=>x.status_date)]);
      const rows=[...dates].sort((a,b)=>b.localeCompare(a)).map(date=>{
        const r=recs.find(x=>x.work_date===date),ds=stats.find(x=>x.status_date===date),late=lateFor(r,ds),ot=overtimeFor(r);
        return `<tr><td>${dateTR(date)}</td><td>${esc(statusLabel(ds?.status,r?.mode,r?.clock_out,r?.clock_in))}</td><td>${timeTR(r?.clock_in)}</td><td>${timeTR(r?.clock_out)}</td><td class="bad">${late?minsText(late):'—'}</td><td class="good">${ot?minsText(ot):'—'}</td><td>${ot?(r?.overtime_approved?'Onaylı':'Onay Bekliyor'):'—'}</td></tr>`;
      }).join('');
      const people=(state?.profiles||[]).filter(p=>p.active);
      const adjNames={bonus:'Prim',addition:'Ek Ödeme',advance:'Avans',deduction:'Kesinti'};
      drawer.innerHTML=`
        <div class="att-drawer-head-v166"><div><h3>${esc(name)} • Detay</h3><p>${esc(typeof prettyMonth==='function'?prettyMonth(start):start)} giriş–çıkış ve ödeme hareketleri</p></div><button class="att-drawer-close-v166" id="attDrawerCloseV166" aria-label="Kapat">×</button></div>
        <div class="att-drawer-toolbar-v166"><select class="select" id="attDrawerPersonV166">${people.map(p=>`<option value="${p.id}" ${p.id===pid?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>
        <div class="att-drawer-body-v166">
          <div class="att-drawer-summary-v166">
            <div class="att-drawer-kpi-v166"><small>Aylık Maaş</small><b>${money(pay.monthly_salary)}</b></div>
            <div class="att-drawer-kpi-v166"><small>Saatlik Ücret</small><b>${money(pay.hourly_rate)}</b></div>
            <div class="att-drawer-kpi-v166 bad"><small>Geç Kalma Kesintisi</small><b>-${money(pay.late_deduction)}</b></div>
            <div class="att-drawer-kpi-v166 good"><small>Onaylı Fazla Mesai</small><b>+${money(pay.overtime_amount)}</b></div>
            <div class="att-drawer-kpi-v166 bad"><small>Ücretsiz İzin</small><b>-${money(pay.unpaid_leave_deduction)}</b></div>
            <div class="att-drawer-kpi-v166 accent"><small>Hakediş</small><b>${money(pay.payable_amount)}</b></div>
          </div>
          <div class="att-drawer-section-v166"><div class="att-drawer-section-head-v166">Günlük Puantaj</div><div class="att-drawer-table-wrap-v166"><table class="att-drawer-table-v166"><thead><tr><th>Tarih</th><th>Durum</th><th>Giriş</th><th>Çıkış</th><th>Geç</th><th>Fazla Mesai</th><th>Onay</th></tr></thead><tbody>${rows||'<tr><td colspan="7"><div class="att-drawer-empty-v166">Bu ay için henüz puantaj kaydı yok.</div></td></tr>'}</tbody></table></div></div>
          <div class="att-drawer-section-v166"><div class="att-drawer-section-head-v166">Prim / Avans / Kesinti</div>${adjs.length?adjs.map(a=>{const plus=['bonus','addition'].includes(a.adjustment_type);return `<div class="att-drawer-adjust-v166"><div><b>${esc(adjNames[a.adjustment_type]||'Kalem')}</b><br><span>${esc(a.note||'Açıklama yok')}</span></div><b class="${plus?'plus':'minus'}">${plus?'+':'-'}${money(a.amount)}</b></div>`;}).join(''):'<div class="att-drawer-empty-v166">Bu ay ödeme kalemi yok.</div>'}</div>
        </div>`;
      document.getElementById('attDrawerCloseV166')?.addEventListener('click',closeDrawer);
      document.getElementById('attDrawerPersonV166')?.addEventListener('change',e=>loadDetail(e.target.value));
    }catch(err){console.error('[Mesai Detay V1.16.6]',err);drawer.innerHTML=`<div class="att-drawer-head-v166"><div><h3>Personel Detayı</h3><p>Detay yüklenemedi</p></div><button class="att-drawer-close-v166" id="attDrawerCloseV166">×</button></div><div class="att-drawer-empty-v166">${esc(err.message||err)}</div>`;document.getElementById('attDrawerCloseV166')?.addEventListener('click',closeDrawer);}
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-att-detail]');
    if(!btn||!document.getElementById('attendance')?.classList.contains('active-view'))return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    loadDetail(btn.dataset.attDetail);
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('attDetailDrawerV166')?.classList.contains('open'))closeDrawer();});
  installStyles();
})();
