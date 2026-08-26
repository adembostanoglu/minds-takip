// V1.16.0 — Mesai / Puantaj / Maaş Hakediş modülü.
(function bootAttendancePayrollV160(){
  if(typeof sb==='undefined'||typeof state==='undefined'||typeof profile==='undefined'||!profile||typeof selectedMonth==='undefined'){
    setTimeout(bootAttendancePayrollV160,120); return;
  }
  if(window.__mindsAttendancePayrollV160) return;
  window.__mindsAttendancePayrollV160=true;

  let settings=null,records=[],dayStatuses=[],adjustments=[],salaryRates=[],payroll=[];
  let loading=false, selectedPersonId=null, attendanceChannel=null;
  const TZ='Europe/Istanbul';
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const money=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0));
  const n2=n=>String(n).padStart(2,'0');
  const statusMeta={
    paid_leave:['Ücretli İzin','good'],unpaid_leave:['Ücretsiz İzin','warn'],sick_leave:['Raporlu','blue'],field:['Saha / Çekim','blue'],
    official_holiday:['Resmî Tatil','good'],weekly_rest:['Hafta Tatili','muted'],excused:['Mazeretli','blue'],absent:['Gelmedi','bad']
  };
  const adjMeta={bonus:['Prim','good'],addition:['Ek Ödeme','good'],advance:['Avans','warn'],deduction:['Kesinti','bad']};

  function monthStart(){return String(selectedMonth).slice(0,7)+'-01';}
  function nextMonth(){const [y,m]=monthStart().split('-').map(Number);return `${m===12?y+1:y}-${n2(m===12?1:m+1)}-01`;}
  function monthEnd(){const [y,m]=nextMonth().split('-').map(Number);const d=new Date(Date.UTC(y,m-1,1));d.setUTCDate(d.getUTCDate()-1);return `${d.getUTCFullYear()}-${n2(d.getUTCMonth()+1)}-${n2(d.getUTCDate())}`;}
  function monthLabel(){return typeof prettyMonth==='function'?prettyMonth(monthStart()):monthStart();}
  function dateTR(v){if(!v)return '—';const [y,m,d]=String(v).slice(0,10).split('-');return `${d}.${m}.${y}`;}
  function tzParts(v=new Date()){
    const p=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(v));
    return Object.fromEntries(p.map(x=>[x.type,x.value]));
  }
  function todayTRISO(){const p=tzParts();return `${p.year}-${p.month}-${p.day}`;}
  function timeTR(v){if(!v)return '—';const p=tzParts(v);return `${p.hour}:${p.minute}`;}
  function dtLocalISO(date,time){return time?new Date(`${date}T${time}:00+03:00`).toISOString():null;}
  function minsText(v){const n=Math.max(0,Math.round(Number(v||0)));const h=Math.floor(n/60),m=n%60;if(!h)return `${m} dk`;if(!m)return `${h} sa`;return `${h} sa ${m} dk`;}
  function dow(date){return new Date(`${date}T12:00:00Z`).getUTCDay();}
  function localMinutes(ts){if(!ts)return null;const p=tzParts(ts);return Number(p.hour)*60+Number(p.minute);}
  function statusFor(pid,date){return dayStatuses.find(x=>x.person_id===pid&&x.status_date===date);}
  function lateMinutes(r){
    if(!r?.clock_in||r.mode==='field')return 0;
    const ds=statusFor(r.person_id,r.work_date); if(ds&&ds.status!=='absent')return 0;
    const d=dow(r.work_date); if(d===0)return 0;
    const t=localMinutes(r.clock_in); return t>=550?Math.max(0,t-510):0;
  }
  function overtimeMinutes(r){
    if(!r?.clock_out)return 0;const d=dow(r.work_date);if(d<1||d>5)return 0;const t=localMinutes(r.clock_out);return t>=1170?Math.max(0,t-1110):0;
  }
  function personNameLocal(id){return (state.profiles||[]).find(p=>p.id===id)?.full_name||'Personel';}
  function activePeople(){return (state.profiles||[]).filter(p=>p.active);}
  function payRow(pid){return payroll.find(x=>x.person_id===pid);}
  function monthIsCurrent(){return monthStart()===todayTRISO().slice(0,7)+'-01';}

  function installStyles(){
    if(document.getElementById('attendanceV160Styles'))return;
    const st=document.createElement('style');st.id='attendanceV160Styles';st.textContent=`
      #attendance{padding-bottom:34px}.att-head-v160{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}.att-head-actions-v160{display:flex;gap:7px;flex-wrap:wrap}.att-grid-v160{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:14px;align-items:start}.att-panel-v160{background:#0f1519;border:1px solid #263037;border-radius:14px;overflow:hidden}.att-panel-head-v160{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 15px;border-bottom:1px solid #263037}.att-panel-head-v160 h3{margin:0;font-size:14px}.att-panel-head-v160 p{margin:3px 0 0;color:#77858c;font-size:9px}.att-panel-body-v160{padding:14px}.att-today-v160{display:grid;grid-template-columns:1.1fr 1fr;gap:12px;margin-bottom:14px}.att-clock-card-v160{border:1px solid #30393f;border-radius:14px;background:linear-gradient(145deg,#151d22,#10161a);padding:16px}.att-clock-card-v160 h3{margin:0 0 5px;font-size:15px}.att-clock-status-v160{font-size:24px;font-weight:850;letter-spacing:-.5px;margin:12px 0 4px}.att-clock-sub-v160{font-size:10px;color:#87949a}.att-clock-actions-v160{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.att-clock-actions-v160 button{min-height:38px}.att-clock-actions-v160 .clock-in{background:#dfe72c;color:#111;border-color:#dfe72c}.att-clock-actions-v160 .clock-out{background:#421b20;color:#ffb7b2;border-color:#743139}.att-clock-actions-v160 .field-btn{background:#142940;color:#84bbed;border-color:#31577a}.att-kpis-v160{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:14px}.att-kpi-v160{border:1px solid #293239;border-radius:12px;background:#11181c;padding:12px}.att-kpi-v160 small{display:block;color:#7e8b91;font-size:8px;text-transform:uppercase;letter-spacing:.5px}.att-kpi-v160 b{display:block;color:#e5ebed;font-size:18px;margin-top:5px}.att-kpi-v160.accent{border-color:#655e20;background:linear-gradient(145deg,#292707,#15180e)}.att-kpi-v160.accent b{color:#f0e72d}.att-kpi-v160.good b{color:#9cdb7d}.att-kpi-v160.bad b{color:#ef9793}.att-kpi-v160.blue b{color:#89bcea}.att-rules-v160{display:grid;gap:9px}.att-rule-v160{border:1px solid #293239;border-radius:10px;padding:10px 11px;background:#11181c}.att-rule-v160 b{font-size:10px;color:#e1e8ea}.att-rule-v160 p{font-size:9px;color:#98a4aa;line-height:1.55;margin:5px 0 0}.att-rule-v160 strong{color:#e9df2c}.att-team-status-v160{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-bottom:14px}.att-team-stat-v160{padding:11px;border:1px solid #293239;border-radius:11px;background:#11181c}.att-team-stat-v160 small{display:block;font-size:8px;color:#7c8a90}.att-team-stat-v160 b{display:block;font-size:18px;margin-top:5px}.att-table-v160{width:100%;border-collapse:collapse}.att-table-v160 th,.att-table-v160 td{padding:10px 9px;border-bottom:1px solid #20292e;text-align:left;font-size:9px;vertical-align:middle}.att-table-v160 th{font-size:8px;color:#7f8c92;text-transform:uppercase;letter-spacing:.4px;background:#11181c;position:sticky;top:0}.att-table-v160 td{color:#d7dfe2}.att-table-v160 tr:last-child td{border-bottom:0}.att-table-v160 .money-strong{color:#e9df2c;font-weight:850}.att-table-v160 .neg{color:#e4938e}.att-table-v160 .pos{color:#91d47a}.att-badge-v160{display:inline-flex;align-items:center;border:1px solid #364149;border-radius:16px;padding:4px 7px;font-size:8px;font-weight:800;white-space:nowrap}.att-badge-v160.good{background:#17321d;border-color:#315d38;color:#93da80}.att-badge-v160.warn{background:#342a14;border-color:#665424;color:#e2c35d}.att-badge-v160.bad{background:#351a1e;border-color:#643139;color:#e89691}.att-badge-v160.blue{background:#142a3f;border-color:#315570;color:#86b9e4}.att-badge-v160.muted{background:#181e22;color:#89959a}.att-row-actions-v160{display:flex;gap:5px;flex-wrap:wrap}.att-row-actions-v160 button{font-size:8px;padding:6px 8px;min-height:auto}.att-detail-summary-v160{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:12px}.att-detail-item-v160{border:1px solid #293239;border-radius:9px;padding:9px;background:#11181c}.att-detail-item-v160 small{font-size:8px;color:#77858b;display:block}.att-detail-item-v160 b{font-size:12px;display:block;margin-top:4px}.att-adjust-list-v160{display:grid;gap:7px;margin-top:10px}.att-adjust-v160{display:grid;grid-template-columns:90px 1fr auto auto;gap:8px;align-items:center;border:1px solid #293239;border-radius:9px;padding:8px 10px;background:#11181c;font-size:9px}.att-privacy-v160{font-size:9px;color:#7f8b91;line-height:1.5;border-top:1px solid #232d32;margin-top:12px;padding-top:10px}.att-empty-v160{text-align:center;padding:28px 10px;color:#69777d;font-size:10px}.att-person-select-v160{display:flex;align-items:center;gap:7px}.att-person-select-v160 select{min-width:190px}.att-section-gap-v160{margin-top:14px}.att-form-note-v160{font-size:9px;color:#7f8c92;line-height:1.5;margin-top:5px}.att-loading-v160{opacity:.6;pointer-events:none}@media(max-width:1200px){.att-grid-v160{grid-template-columns:1fr}.att-today-v160{grid-template-columns:1fr}.att-kpis-v160{grid-template-columns:repeat(2,1fr)}.att-team-status-v160{grid-template-columns:repeat(3,1fr)}.att-detail-summary-v160{grid-template-columns:repeat(3,1fr)}}@media(max-width:760px){.att-kpis-v160,.att-team-status-v160,.att-detail-summary-v160{grid-template-columns:repeat(2,1fr)}.att-table-scroll-v160{overflow-x:auto}.att-table-v160{min-width:860px}.att-head-actions-v160{width:100%}.att-head-actions-v160 button{flex:1}.att-adjust-v160{grid-template-columns:1fr auto}.att-adjust-v160 span:nth-child(2){grid-column:1/-1;grid-row:2}}
    `;document.head.appendChild(st);
  }

  function ensureUI(){
    installStyles();
    let nav=document.querySelector('.nav-item[data-view="attendance"]');
    if(!nav){
      nav=document.createElement('button');nav.className='nav-item';nav.dataset.view='attendance';nav.innerHTML='◷ <span>Mesai</span>';
      const agenda=document.querySelector('.nav-item[data-view="agenda"]'),shoots=document.querySelector('.nav-item[data-view="shoots"]');
      (agenda||shoots)?.insertAdjacentElement('afterend',nav);
      nav.addEventListener('click',e=>{e.preventDefault();openAttendance();});
    }
    let section=document.getElementById('attendance');
    if(!section){
      section=document.createElement('section');section.id='attendance';section.className='view';
      section.innerHTML='<div id="attendanceRootV160"></div>';
      const team=document.getElementById('team');team?team.insertAdjacentElement('beforebegin',section):document.querySelector('.main')?.appendChild(section);
    }
    const picker=document.getElementById('monthPicker');
    if(picker&&!picker.dataset.attendanceV160){picker.dataset.attendanceV160='1';picker.addEventListener('change',()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))setTimeout(loadAttendance,50);});}
  }

  function openAttendance(){
    ensureUI();
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active-view'));
    document.getElementById('attendance')?.classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='attendance'));
    const t=document.getElementById('pageTitle'),s=document.getElementById('pageSub');if(t)t.textContent='Mesai / Puantaj';if(s)s.textContent='Giriş–çıkış, izin, rapor, fazla mesai ve aylık hakediş.';
    loadAttendance();
  }

  async function loadAttendance(){
    if(loading)return;loading=true;const root=document.getElementById('attendanceRootV160');root?.classList.add('att-loading-v160');
    try{
      const start=monthStart(),end=nextMonth();
      const req=[
        sb.from('attendance_settings').select('*').eq('id',1).single(),
        sb.from('attendance_records').select('*').gte('work_date',start).lt('work_date',end).order('work_date',{ascending:false}),
        sb.from('attendance_day_status').select('*').gte('status_date',start).lt('status_date',end).order('status_date',{ascending:false}),
        sb.from('payroll_adjustments').select('*').eq('month',start).order('created_at',{ascending:false}),
        sb.from('salary_rates').select('*').lte('effective_from',monthEnd()).order('effective_from',{ascending:false}),
        sb.rpc('payroll_preview',{p_month:start,p_person_id:null})
      ];
      const [a,b,c,d,e,f]=await Promise.all(req);
      [a,b,c,d,e,f].forEach(r=>{if(r.error)throw r.error;});
      settings=a.data;records=b.data||[];dayStatuses=c.data||[];adjustments=d.data||[];salaryRates=e.data||[];payroll=f.data||[];
      if(!selectedPersonId||!(state.profiles||[]).some(p=>p.id===selectedPersonId&&p.active)){
        selectedPersonId=isAdmin()?((state.profiles||[]).find(p=>p.active&&p.role!=='admin')?.id||profile.id):profile.id;
      }
      render();subscribeAttendance();
    }catch(err){console.error('Mesai yükleme',err);if(root)root.innerHTML=`<div class="att-panel-v160"><div class="att-empty-v160">Mesai verileri yüklenemedi: ${esc(err.message||err)}</div></div>`;if(typeof toast==='function')toast('Mesai verileri yüklenemedi.',true);}
    finally{loading=false;root?.classList.remove('att-loading-v160');}
  }

  function subscribeAttendance(){
    if(attendanceChannel)return;
    attendanceChannel=sb.channel('minds-attendance-v160');
    ['attendance_records','attendance_day_status','payroll_adjustments','salary_rates'].forEach(table=>attendanceChannel.on('postgres_changes',{event:'*',schema:'public',table},()=>{
      if(document.getElementById('attendance')?.classList.contains('active-view'))setTimeout(loadAttendance,120);
    }));
    attendanceChannel.subscribe();
  }

  function todayRecord(pid){return records.find(x=>x.person_id===pid&&x.work_date===todayTRISO());}
  function todayStatus(pid){return dayStatuses.find(x=>x.person_id===pid&&x.status_date===todayTRISO());}
  function todayClass(pid){
    const r=todayRecord(pid),ds=todayStatus(pid);if(ds&&!r)return statusMeta[ds.status]?.[0]||'Durum Girildi';
    if(!r?.clock_in)return 'Henüz giriş yok';if(r.clock_out)return 'Çıkış yaptı';return r.mode==='field'?'Sahada / Çekimde':'Ofiste';
  }

  function render(){
    const root=document.getElementById('attendanceRootV160');if(!root)return;
    const admin=isAdmin();
    root.innerHTML=`
      <div class="att-head-v160"><div><h2 style="margin:0">Mesai / Puantaj</h2><p style="margin:5px 0 0;color:#7c8990;font-size:10px">${esc(monthLabel())} • Maaş, giriş–çıkış, izin ve fazla mesai takibi</p></div>
        <div class="att-head-actions-v160">${admin?'<button class="ghost" id="attSalaryBtnV160">Maaş Tanımla</button><button class="ghost" id="attDayStatusBtnV160">İzin / Rapor</button><button class="primary" id="attAdjustmentBtnV160">+ Ödeme Kalemi</button>':''}</div></div>
      ${admin?renderAdminTop():renderOwnTop()}
      <div class="att-grid-v160">
        <div>${admin?renderAdminPayroll():renderOwnMonth(profile.id)}${admin?renderAdminDetail():''}</div>
        <aside>${renderRules()}${admin?renderAdminTodayList():renderOwnAdjustments(profile.id)}</aside>
      </div>`;
    bindActions();
  }

  function renderAdminTop(){
    const today=todayTRISO(),people=activePeople();
    let office=0,field=0,out=0,away=0,missing=0;
    people.forEach(p=>{const r=records.find(x=>x.person_id===p.id&&x.work_date===today),ds=dayStatuses.find(x=>x.person_id===p.id&&x.status_date===today);if(r?.clock_out)out++;else if(r?.clock_in&&r.mode==='field')field++;else if(r?.clock_in)office++;else if(ds)away++;else missing++;});
    const total=payroll.reduce((s,x)=>s+Number(x.payable_amount||0),0);
    return `<div class="att-team-status-v160"><div class="att-team-stat-v160"><small>Ofiste</small><b>${office}</b></div><div class="att-team-stat-v160"><small>Sahada</small><b>${field}</b></div><div class="att-team-stat-v160"><small>İzin / Rapor</small><b>${away}</b></div><div class="att-team-stat-v160"><small>Henüz Giriş Yok</small><b>${missing}</b></div><div class="att-team-stat-v160"><small>${esc(monthLabel())} Toplam Hakediş</small><b style="font-size:14px;color:#e9df2c">${money(total)}</b></div></div>`;
  }

  function renderOwnTop(pid=profile.id){
    const r=todayRecord(pid),ds=todayStatus(pid),p=payRow(pid)||{},current=monthIsCurrent();
    let status='Henüz giriş yapılmadı',sub='Bugünkü çalışma kaydın başlamadı.';
    if(ds&&!r){status=statusMeta[ds.status]?.[0]||'Durum Girildi';sub=ds.note||'Bugün için yönetici tarafından durum girildi.';}
    else if(r?.clock_out){status='Çıkış Yapıldı';sub=`${timeTR(r.clock_in)} giriş • ${timeTR(r.clock_out)} çıkış`;}
    else if(r?.clock_in){status=r.mode==='field'?'Sahada / Çekimde':'Mesai Devam Ediyor';sub=`${timeTR(r.clock_in)} giriş • ${r.mode==='field'?'Saha':'Ofis'}`;}
    const noSalary=Number(p.monthly_salary||0)<=0;
    return `<div class="att-today-v160"><div class="att-clock-card-v160"><h3>Bugünkü Durum</h3><div class="att-clock-status-v160">${esc(status)}</div><div class="att-clock-sub-v160">${esc(sub)}</div>${current?renderClockButtons(r):'<div class="att-clock-sub-v160" style="margin-top:14px">Geçmiş ay görüntüleniyor. Giriş–çıkış işlemleri yalnızca güncel ayda yapılır.</div>'}</div><div class="att-clock-card-v160"><h3>${esc(monthLabel())} Hakediş</h3><div class="att-clock-status-v160" style="color:#e9df2c">${noSalary?'Maaş tanımlanmadı':money(p.payable_amount)}</div><div class="att-clock-sub-v160">Aylık maaş ${money(p.monthly_salary)} • Saatlik ${money(p.hourly_rate)}</div><div class="att-clock-sub-v160" style="margin-top:10px">Fazla mesai +${money(p.overtime_amount)} • Geç kalma -${money(p.late_deduction)} • Avans -${money(p.advance_amount)}</div><div class="att-privacy-v160">Bu ücret ve puantaj bilgileri yalnızca sana ve yönetici hesabına görünür.</div></div></div>${renderOwnKpis(pid)}`;
  }

  function renderClockButtons(r){
    if(!r?.clock_in)return `<div class="att-clock-actions-v160"><button class="clock-in" id="attClockInV160">Giriş Yap</button><button class="field-btn" id="attFieldInV160">Sahada Giriş</button></div>`;
    if(r.clock_out)return '';
    return `<div class="att-clock-actions-v160"><button class="clock-out" id="attClockOutV160">Çıkış Yap</button><button class="field-btn" id="attToggleModeV160">${r.mode==='field'?'Ofise Döndüm':'Sahadayım / Çekimdeyim'}</button></div>`;
  }

  function renderOwnKpis(pid){
    const p=payRow(pid)||{};
    return `<div class="att-kpis-v160"><div class="att-kpi-v160"><small>Toplam Geç Kalma</small><b>${minsText(p.late_minutes)}</b></div><div class="att-kpi-v160 blue"><small>Onaylı Fazla Mesai</small><b>${minsText(p.overtime_minutes_approved)}</b></div><div class="att-kpi-v160"><small>Ücretli İzin / Rapor</small><b>${Number(p.paid_leave_days||0)+Number(p.sick_leave_days||0)} gün</b></div><div class="att-kpi-v160 accent"><small>Alacağın Tutar</small><b>${money(p.payable_amount)}</b></div></div>`;
  }

  function renderRules(){
    return `<div class="att-panel-v160"><div class="att-panel-head-v160"><div><h3>Çalışma & Mesai Kuralları</h3><p>Tüm personel için geçerli çalışma düzeni</p></div></div><div class="att-panel-body-v160"><div class="att-rules-v160">
      <div class="att-rule-v160"><b>Pazartesi – Cuma</b><p><strong>09:00</strong> mesai başlangıcı • 09:00–09:30 temizlik / ofis hazırlığı<br>09:30–09:45 sabah molası • 12:30–13:30 öğle arası • 16:30–16:45 ara mola<br><strong>18:30</strong> normal çıkış</p></div>
      <div class="att-rule-v160"><b>Cumartesi</b><p><strong>09:00–13:30</strong> çalışma • Ara mola yok</p></div>
      <div class="att-rule-v160"><b>Pazar</b><p>Hafta tatili</p></div>
      <div class="att-rule-v160"><b>Geç Kalma Kuralı</b><p><strong>09:00–09:09 tolerans.</strong> 09:10 ve sonrasında geç kalma süresi <strong>08:30’dan itibaren</strong> hesaplanır.<br>09:10 giriş = 40 dk • 09:25 giriş = 55 dk</p></div>
      <div class="att-rule-v160"><b>Fazla Mesai Kuralı</b><p>Hafta içi 18:30–19:29 arası çıkış fazla mesai oluşturmaz. <strong>19:30 ve sonrasında</strong> çıkış yapılırsa süre <strong>18:30’dan itibaren</strong> hesaplanır.<br>19:30 çıkış = 1 sa • 20:15 çıkış = 1 sa 45 dk</p></div>
      <div class="att-rule-v160"><b>Ücret Hesabı</b><p>Saatlik ücret = <strong>Aylık maaş ÷ 30 ÷ 7,5</strong>. Hakedişe yalnızca yönetici tarafından onaylanan fazla mesai eklenir.</p></div>
    </div></div></div>`;
  }

  function renderAdminPayroll(){
    return `<div class="att-panel-v160"><div class="att-panel-head-v160"><div><h3>Aylık Puantaj & Hakediş</h3><p>Personel bazında ${esc(monthLabel())} özeti</p></div><span class="att-badge-v160 muted">${payroll.length} personel</span></div><div class="att-table-scroll-v160"><table class="att-table-v160"><thead><tr><th>Personel</th><th>Maaş</th><th>Geç</th><th>FM Onaylı</th><th>İzin / Rapor</th><th>Prim</th><th>Avans</th><th>Kesinti</th><th>Hakediş</th><th></th></tr></thead><tbody>${payroll.map(p=>`<tr><td><b>${esc(p.full_name)}</b></td><td>${money(p.monthly_salary)}</td><td class="neg">${minsText(p.late_minutes)}</td><td class="pos">${minsText(p.overtime_minutes_approved)}</td><td>${Number(p.paid_leave_days||0)+Number(p.sick_leave_days||0)} gün</td><td class="pos">${money(p.bonus_amount)}</td><td class="neg">${money(p.advance_amount)}</td><td class="neg">${money(Number(p.late_deduction||0)+Number(p.manual_deduction_amount||0)+Number(p.unpaid_leave_deduction||0)+Number(p.absence_deduction||0))}</td><td class="money-strong">${money(p.payable_amount)}</td><td><button class="ghost" data-att-detail="${p.person_id}">Detay</button></td></tr>`).join('')||'<tr><td colspan="10">Kayıt yok.</td></tr>'}</tbody></table></div></div>`;
  }

  function renderAdminDetail(){
    const pid=selectedPersonId,p=payRow(pid)||{},name=personNameLocal(pid);
    return `<div class="att-panel-v160 att-section-gap-v160"><div class="att-panel-head-v160"><div><h3>${esc(name)} • Detay</h3><p>Günlük giriş–çıkış ve ödeme hareketleri</p></div><div class="att-person-select-v160"><select class="select" id="attPersonSelectV160">${activePeople().map(x=>`<option value="${x.id}" ${x.id===pid?'selected':''}>${esc(x.full_name)}</option>`).join('')}</select><button class="ghost" id="attCorrectBtnV160">Saat Düzelt</button></div></div><div class="att-panel-body-v160"><div class="att-detail-summary-v160"><div class="att-detail-item-v160"><small>Maaş</small><b>${money(p.monthly_salary)}</b></div><div class="att-detail-item-v160"><small>Saatlik</small><b>${money(p.hourly_rate)}</b></div><div class="att-detail-item-v160"><small>Geç Kalma Kesintisi</small><b class="neg">-${money(p.late_deduction)}</b></div><div class="att-detail-item-v160"><small>Onaylı Mesai</small><b class="pos">+${money(p.overtime_amount)}</b></div><div class="att-detail-item-v160"><small>Ücretsiz İzin</small><b class="neg">-${money(p.unpaid_leave_deduction)}</b></div><div class="att-detail-item-v160"><small>Hakediş</small><b style="color:#e9df2c">${money(p.payable_amount)}</b></div></div>${renderDailyTable(pid)}${renderAdjustments(pid,true)}</div></div>`;
  }

  function renderOwnMonth(pid){
    const p=payRow(pid)||{};
    return `<div class="att-panel-v160"><div class="att-panel-head-v160"><div><h3>${esc(monthLabel())} Puantajın</h3><p>Günlük giriş–çıkış, izin, rapor ve fazla mesai kayıtların</p></div></div><div class="att-panel-body-v160"><div class="att-detail-summary-v160"><div class="att-detail-item-v160"><small>Aylık Maaş</small><b>${money(p.monthly_salary)}</b></div><div class="att-detail-item-v160"><small>Geç Kalma Kesintisi</small><b class="neg">-${money(p.late_deduction)}</b></div><div class="att-detail-item-v160"><small>Mesai Ücreti</small><b class="pos">+${money(p.overtime_amount)}</b></div><div class="att-detail-item-v160"><small>Prim / Ek Ödeme</small><b class="pos">+${money(Number(p.bonus_amount||0)+Number(p.addition_amount||0))}</b></div><div class="att-detail-item-v160"><small>Avans / Kesinti</small><b class="neg">-${money(Number(p.advance_amount||0)+Number(p.manual_deduction_amount||0))}</b></div><div class="att-detail-item-v160"><small>Alacağın</small><b style="color:#e9df2c">${money(p.payable_amount)}</b></div></div>${renderDailyTable(pid)}</div></div>`;
  }

  function renderDailyTable(pid){
    const dates=new Set([...records.filter(x=>x.person_id===pid).map(x=>x.work_date),...dayStatuses.filter(x=>x.person_id===pid).map(x=>x.status_date)]);
    const rows=[...dates].sort((a,b)=>b.localeCompare(a)).map(date=>{
      const r=records.find(x=>x.person_id===pid&&x.work_date===date),ds=statusFor(pid,date),late=r?lateMinutes(r):0,ot=r?overtimeMinutes(r):0;
      const status=ds?statusMeta[ds.status]:r?.mode==='field'?statusMeta.field:r?.clock_out?['Tamamlandı','good']:r?.clock_in?['Çalışıyor','blue']:['—','muted'];
      const otBadge=ot?`<span class="att-badge-v160 ${r?.overtime_approved?'good':'warn'}">${r?.overtime_approved?'Onaylı':'Onay Bekliyor'}</span>`:'—';
      const adminBtns=isAdmin()?`<div class="att-row-actions-v160">${ot?`<button class="ghost" data-att-overtime="${r.id}" data-value="${r.overtime_approved?'0':'1'}">${r.overtime_approved?'Onayı Kaldır':'Mesaiyi Onayla'}</button>`:''}<button class="ghost" data-att-edit-day="${date}">Düzenle</button></div>`:'';
      return `<tr><td>${dateTR(date)}</td><td><span class="att-badge-v160 ${status?.[1]||'muted'}">${esc(status?.[0]||'—')}</span></td><td>${r?timeTR(r.clock_in):'—'}</td><td>${r?timeTR(r.clock_out):'—'}</td><td class="${late?'neg':''}">${late?minsText(late):'—'}</td><td class="${ot?'pos':''}">${ot?minsText(ot):'—'}</td><td>${otBadge}</td>${isAdmin()?`<td>${adminBtns}</td>`:''}</tr>`;
    }).join('');
    return `<div class="att-table-scroll-v160"><table class="att-table-v160"><thead><tr><th>Tarih</th><th>Durum</th><th>Giriş</th><th>Çıkış</th><th>Geç</th><th>Fazla Mesai</th><th>Mesai Durumu</th>${isAdmin()?'<th>İşlem</th>':''}</tr></thead><tbody>${rows||`<tr><td colspan="${isAdmin()?8:7}"><div class="att-empty-v160">Bu ay için henüz kayıt yok.</div></td></tr>`}</tbody></table></div>`;
  }

  function renderAdjustments(pid,admin=false){
    const arr=adjustments.filter(x=>x.person_id===pid);
    return `<div class="att-section-gap-v160"><div style="display:flex;justify-content:space-between;align-items:center"><h4 style="margin:0;font-size:11px">Prim / Avans / Kesinti</h4>${admin?'<button class="ghost" id="attAdjustmentDetailBtnV160">+ Kalem Ekle</button>':''}</div><div class="att-adjust-list-v160">${arr.map(x=>{const m=adjMeta[x.adjustment_type]||['Kalem','muted'];return `<div class="att-adjust-v160"><span class="att-badge-v160 ${m[1]}">${m[0]}</span><span>${esc(x.note||'Açıklama yok')}</span><b class="${['bonus','addition'].includes(x.adjustment_type)?'pos':'neg'}">${['bonus','addition'].includes(x.adjustment_type)?'+':'-'}${money(x.amount)}</b>${admin?`<button class="ghost" data-att-del-adjust="${x.id}">Sil</button>`:''}</div>`;}).join('')||'<div class="att-empty-v160">Bu ay ödeme kalemi yok.</div>'}</div></div>`;
  }

  function renderOwnAdjustments(pid){return `<div class="att-panel-v160 att-section-gap-v160"><div class="att-panel-head-v160"><div><h3>Ödeme Hareketlerin</h3><p>Prim, avans, ek ödeme ve kesintiler</p></div></div><div class="att-panel-body-v160">${renderAdjustments(pid,false)}<div class="att-privacy-v160">Başka personelin maaş, avans, prim veya puantaj bilgilerine erişemezsin.</div></div></div>`;}

  function renderAdminTodayList(){
    const today=todayTRISO();return `<div class="att-panel-v160 att-section-gap-v160"><div class="att-panel-head-v160"><div><h3>Bugün Ekip Durumu</h3><p>${dateTR(today)}</p></div></div><div class="att-panel-body-v160">${activePeople().map(p=>{const r=todayRecord(p.id),label=todayClass(p.id);return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 0;border-bottom:1px solid #20292e"><div><b style="font-size:9px">${esc(p.full_name)}</b><div style="font-size:8px;color:#7e8b91;margin-top:3px">${r?.clock_in?`${timeTR(r.clock_in)} giriş${r.clock_out?` • ${timeTR(r.clock_out)} çıkış`:''}`:'Kayıt yok'}</div></div><span class="att-badge-v160 ${label==='Ofiste'?'good':label.includes('Saha')?'blue':label.includes('Çıkış')?'muted':label.includes('giriş')?'warn':'blue'}">${esc(label)}</span></div>`;}).join('')}</div></div>`;
  }

  function bindActions(){
    document.getElementById('attClockInV160')?.addEventListener('click',()=>clockIn('office'));
    document.getElementById('attFieldInV160')?.addEventListener('click',()=>clockIn('field'));
    document.getElementById('attClockOutV160')?.addEventListener('click',clockOut);
    document.getElementById('attToggleModeV160')?.addEventListener('click',toggleMode);
    document.getElementById('attSalaryBtnV160')?.addEventListener('click',openSalaryModal);
    document.getElementById('attDayStatusBtnV160')?.addEventListener('click',()=>openDayStatusModal(selectedPersonId||profile.id));
    document.getElementById('attAdjustmentBtnV160')?.addEventListener('click',()=>openAdjustmentModal(selectedPersonId||profile.id));
    document.getElementById('attAdjustmentDetailBtnV160')?.addEventListener('click',()=>openAdjustmentModal(selectedPersonId));
    document.getElementById('attCorrectBtnV160')?.addEventListener('click',()=>openCorrectionModal(selectedPersonId,todayTRISO()));
    document.getElementById('attPersonSelectV160')?.addEventListener('change',e=>{selectedPersonId=e.target.value;render();});
    document.querySelectorAll('[data-att-detail]').forEach(b=>b.addEventListener('click',()=>{selectedPersonId=b.dataset.attDetail;render();document.getElementById('attPersonSelectV160')?.scrollIntoView({behavior:'smooth',block:'center'});}));
    document.querySelectorAll('[data-att-overtime]').forEach(b=>b.addEventListener('click',()=>setOvertimeApproval(b.dataset.attOvertime,b.dataset.value==='1')));
    document.querySelectorAll('[data-att-edit-day]').forEach(b=>b.addEventListener('click',()=>openCorrectionModal(selectedPersonId,b.dataset.attEditDay)));
    document.querySelectorAll('[data-att-del-adjust]').forEach(b=>b.addEventListener('click',()=>deleteAdjustment(b.dataset.attDelAdjust)));
  }

  async function clockIn(mode){
    try{const {error}=await sb.rpc('attendance_clock_in',{p_mode:mode});if(error)throw error;if(typeof toast==='function')toast(mode==='field'?'Saha girişi kaydedildi.':'Giriş kaydedildi.');await loadAttendance();}catch(e){console.error(e);if(typeof toast==='function')toast(e.message==='already_clocked_in'?'Bugün zaten giriş yapıldı.':e.message,true);}
  }
  async function clockOut(){try{const {error}=await sb.rpc('attendance_clock_out');if(error)throw error;if(typeof toast==='function')toast('Çıkış kaydedildi.');await loadAttendance();}catch(e){console.error(e);if(typeof toast==='function')toast(e.message||'Çıkış kaydedilemedi.',true);}}
  async function toggleMode(){const r=todayRecord(profile.id);if(!r)return;const mode=r.mode==='field'?'office':'field';try{const {error}=await sb.rpc('attendance_set_mode',{p_mode:mode});if(error)throw error;if(typeof toast==='function')toast(mode==='field'?'Durum: Sahada / Çekimde':'Durum: Ofiste');await loadAttendance();}catch(e){if(typeof toast==='function')toast(e.message,true);}}

  function peopleOptionsLocal(selected=''){return activePeople().map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''}>${esc(p.full_name)}</option>`).join('');}
  function openSalaryModal(){if(!isAdmin())return;const pid=selectedPersonId||activePeople()[0]?.id||profile.id;const existing=salaryRates.find(x=>x.person_id===pid&&x.effective_from===monthStart());
    openModal('Maaş Tanımla',`<div class="form-grid"><div class="field full"><label>Personel</label><select name="person_id">${peopleOptionsLocal(pid)}</select></div><div class="field"><label>Geçerlilik Ayı</label><input name="effective_from" type="month" value="${monthStart().slice(0,7)}" required></div><div class="field"><label>Aylık Maaş</label><input name="monthly_salary" type="number" min="0" step="0.01" value="${existing?.monthly_salary??''}" required></div><div class="field full"><div class="att-form-note-v160">Saatlik ücret sistem tarafından Maaş ÷ 30 ÷ 7,5 formülüyle hesaplanır. Eski ayların maaş geçmişi korunur.</div></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Kaydet</button></div></div>`,async fd=>{const m=String(fd.get('effective_from'))+'-01',amount=Number(fd.get('monthly_salary'));if(!Number.isFinite(amount)||amount<0)throw new Error('Geçerli maaş tutarı gir.');const {error}=await sb.from('salary_rates').upsert({person_id:fd.get('person_id'),effective_from:m,monthly_salary:amount,created_by:profile.id},{onConflict:'person_id,effective_from'});if(error)throw error;setTimeout(loadAttendance,350);});}

  function openDayStatusModal(pid,date=todayTRISO()){
    if(!isAdmin())return;const old=statusFor(pid,date);
    openModal('İzin / Rapor / Gün Durumu',`<div class="form-grid"><div class="field"><label>Personel</label><select name="person_id">${peopleOptionsLocal(pid)}</select></div><div class="field"><label>Tarih</label><input name="status_date" type="date" value="${date}" required></div><div class="field full"><label>Durum</label><select name="status"><option value="">Normal / Durumu Kaldır</option>${Object.entries(statusMeta).map(([k,v])=>`<option value="${k}" ${old?.status===k?'selected':''}>${v[0]}</option>`).join('')}</select></div><div class="field full"><label>Not</label><textarea name="note" rows="3">${esc(old?.note||'')}</textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Kaydet</button></div></div>`,async fd=>{const person_id=fd.get('person_id'),status_date=fd.get('status_date'),status=fd.get('status');if(!status){const {error}=await sb.from('attendance_day_status').delete().eq('person_id',person_id).eq('status_date',status_date);if(error)throw error;}else{const {error}=await sb.from('attendance_day_status').upsert({person_id,status_date,status,day_fraction:1,note:String(fd.get('note')||'').trim()||null,created_by:profile.id},{onConflict:'person_id,status_date'});if(error)throw error;}setTimeout(loadAttendance,350);});
  }

  function openAdjustmentModal(pid){if(!isAdmin())return;openModal('Ödeme Kalemi Ekle',`<div class="form-grid"><div class="field full"><label>Personel</label><select name="person_id">${peopleOptionsLocal(pid)}</select></div><div class="field"><label>Kalem</label><select name="type"><option value="bonus">Prim</option><option value="addition">Ek Ödeme</option><option value="advance">Avans</option><option value="deduction">Diğer Kesinti</option></select></div><div class="field"><label>Tutar</label><input name="amount" type="number" min="0" step="0.01" required></div><div class="field full"><label>Açıklama</label><input name="note" placeholder="Örn. Ağustos primi / Avans"></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Ekle</button></div></div>`,async fd=>{const amount=Number(fd.get('amount'));if(!Number.isFinite(amount)||amount<0)throw new Error('Geçerli tutar gir.');const {error}=await sb.from('payroll_adjustments').insert({person_id:fd.get('person_id'),month:monthStart(),adjustment_type:fd.get('type'),amount,note:String(fd.get('note')||'').trim()||null,created_by:profile.id});if(error)throw error;setTimeout(loadAttendance,350);});}

  function openCorrectionModal(pid,date){if(!isAdmin())return;const r=records.find(x=>x.person_id===pid&&x.work_date===date),ds=statusFor(pid,date);openModal('Mesai Kaydı Düzenle',`<div class="form-grid"><div class="field"><label>Personel</label><select name="person_id">${peopleOptionsLocal(pid)}</select></div><div class="field"><label>Tarih</label><input name="work_date" type="date" value="${date}" required></div><div class="field"><label>Giriş</label><input name="clock_in" type="time" value="${r?.clock_in?timeTR(r.clock_in):''}"></div><div class="field"><label>Çıkış</label><input name="clock_out" type="time" value="${r?.clock_out?timeTR(r.clock_out):''}"></div><div class="field"><label>Çalışma Tipi</label><select name="mode"><option value="office" ${r?.mode!=='field'?'selected':''}>Ofis</option><option value="field" ${r?.mode==='field'?'selected':''}>Saha / Çekim</option></select></div><div class="field"><label>Fazla Mesai</label><select name="approved"><option value="0" ${!r?.overtime_approved?'selected':''}>Onay Bekliyor</option><option value="1" ${r?.overtime_approved?'selected':''}>Onaylı</option></select></div><div class="field full"><label>Yönetici Notu</label><input name="admin_note" value="${esc(r?.admin_note||ds?.note||'')}"></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="button" class="ghost" id="attStatusFromCorrectionV160">İzin / Rapor Gir</button><button type="submit" class="primary">Kaydet</button></div></div>`,async fd=>{const person_id=fd.get('person_id'),work_date=fd.get('work_date'),ci=fd.get('clock_in'),co=fd.get('clock_out');if(co&&!ci)throw new Error('Çıkış saati için giriş saati gerekli.');const approved=fd.get('approved')==='1';const payload={person_id,work_date,clock_in:dtLocalISO(work_date,ci),clock_out:dtLocalISO(work_date,co),mode:fd.get('mode'),admin_note:String(fd.get('admin_note')||'').trim()||null,overtime_approved:approved,overtime_approved_by:approved?profile.id:null,overtime_approved_at:approved?new Date().toISOString():null,updated_at:new Date().toISOString()};const {error}=await sb.from('attendance_records').upsert(payload,{onConflict:'person_id,work_date'});if(error)throw error;setTimeout(loadAttendance,350);});setTimeout(()=>document.getElementById('attStatusFromCorrectionV160')?.addEventListener('click',()=>{closeModal();openDayStatusModal(pid,date);}),0);}

  async function setOvertimeApproval(id,value){if(!isAdmin())return;try{const {error}=await sb.from('attendance_records').update({overtime_approved:value,overtime_approved_by:value?profile.id:null,overtime_approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;if(typeof toast==='function')toast(value?'Fazla mesai onaylandı.':'Fazla mesai onayı kaldırıldı.');await loadAttendance();}catch(e){if(typeof toast==='function')toast(e.message,true);}}
  async function deleteAdjustment(id){if(!isAdmin())return;try{const {error}=await sb.from('payroll_adjustments').delete().eq('id',id);if(error)throw error;if(typeof toast==='function')toast('Ödeme kalemi silindi.');await loadAttendance();}catch(e){if(typeof toast==='function')toast(e.message,true);}}

  ensureUI();
})();
