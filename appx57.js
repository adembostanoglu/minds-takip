// V1.19.9 — Gün içi saatlik izin: personel İzne Çık / İzinden Döndüm akışı, ücretli-ücretsiz tür, yönetici manuel yönetim ve puantaj notları.
(function bootIntradayLeaveV199(){
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){setTimeout(bootIntradayLeaveV199,140);return;}
  if(window.__mindsIntradayLeaveV199)return;
  window.__mindsIntradayLeaveV199=true;

  const TZ='Europe/Istanbul';
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  let entries=[];
  let attendanceRows=[];
  let loadedMonth='';
  let loading=false;
  let channel=null;

  const n2=n=>String(n).padStart(2,'0');
  function monthStart(){return String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';}
  function nextMonth(){const [y,m]=monthStart().split('-').map(Number);return `${m===12?y+1:y}-${n2(m===12?1:m+1)}-01`;}
  function isAdminLocal(){try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return String(profile?.role||'').toLowerCase()==='admin';}}
  function personName(id){return (state?.profiles||[]).find(p=>p.id===id)?.full_name||'Personel';}
  function todayISO(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${o.year}-${o.month}-${o.day}`;}
  function timeTR(v){if(!v)return '—';const p=new Intl.DateTimeFormat('tr-TR',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(v));const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${o.hour}:${o.minute}`;}
  function dateTR(v){if(!v)return '—';const [y,m,d]=String(v).slice(0,10).split('-');return `${d}.${m}.${y}`;}
  function trToIso(v){const m=String(v||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';}
  function minsText(v){const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;}
  function durationMinutes(x,openNow=true){const end=x.end_at?new Date(x.end_at):(openNow?new Date():null);if(!end||!x.start_at)return 0;return Math.max(0,(end-new Date(x.start_at))/60000);}
  function typeLabel(t){return t==='unpaid'?'Ücretsiz':'Ücretli';}
  function currentMonthIsToday(){return monthStart().slice(0,7)===todayISO().slice(0,7);}

  function installStyle(){
    if(document.getElementById('attIntradayV199Style'))return;
    const s=document.createElement('style');s.id='attIntradayV199Style';s.textContent=`
      #attendance .att-intraday-today-v199{margin-top:12px;padding:11px 12px;border:1px solid #314047;border-radius:10px;background:#10171b;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      #attendance .att-intraday-today-v199 .copy{display:flex;flex-direction:column;gap:3px;min-width:180px}
      #attendance .att-intraday-today-v199 .copy b{font-size:11px;color:#edf1f2}.att-intraday-today-v199 .copy span{font-size:9.5px;color:#8f9ba0;line-height:1.45}
      #attendance .att-intraday-today-v199 button{min-height:36px!important;padding:8px 11px!important;border-radius:8px!important;font-size:10px!important;font-weight:850!important}
      #attendance .att-intraday-start-v199{border:1px solid #5b5520!important;background:#29270c!important;color:#eee52b!important}
      #attendance .att-intraday-end-v199{border:1px solid #276a52!important;background:#123526!important;color:#8fe0b6!important}
      #attendance #attClockOutV160.att-intraday-disabled-v199{opacity:.42!important;cursor:not-allowed!important;filter:saturate(.5)}
      #attendance .att-intraday-day-v199{margin-top:5px;display:grid;gap:4px;white-space:normal!important}
      #attendance .att-intraday-chip-v199{display:inline-flex;align-items:center;gap:5px;max-width:100%;width:max-content;padding:4px 6px;border-radius:7px;border:1px solid #3b454a;background:#171e22;color:#cfd7da;font-size:8.7px;font-weight:750;line-height:1.35;white-space:normal!important}
      #attendance .att-intraday-chip-v199.paid{border-color:#315e48;background:#142a20;color:#8dd3a8}
      #attendance .att-intraday-chip-v199.unpaid{border-color:#6b4b27;background:#2d2113;color:#e7bc72}
      #attendance .att-intraday-chip-v199.open{box-shadow:0 0 0 1px rgba(238,229,43,.15);border-color:#696323;color:#eee572}
      #attendance .att-intraday-section-v199{margin:12px 0;border:1px solid #2d383e;border-radius:11px;background:#0f1619;overflow:hidden}
      #attendance .att-intraday-head-v199{padding:11px 12px;border-bottom:1px solid #273137;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:#12191d}
      #attendance .att-intraday-title-v199{display:flex;flex-direction:column;gap:3px}.att-intraday-title-v199 b{font-size:11.5px;color:#edf1f2}.att-intraday-title-v199 span{font-size:9px;color:#8b989e}
      #attendance .att-intraday-add-v199{min-height:32px!important;padding:6px 9px!important;border:1px solid #5a5520!important;border-radius:8px!important;background:#26240c!important;color:#eee52b!important;font-size:9px!important;font-weight:850!important}
      #attendance .att-intraday-list-v199{display:grid}.att-intraday-item-v199{display:grid;grid-template-columns:78px 116px 82px 86px minmax(120px,1fr) auto;gap:8px;align-items:center;padding:9px 11px;border-bottom:1px solid #232d32;font-size:9.5px}.att-intraday-item-v199:last-child{border-bottom:0}
      #attendance .att-intraday-item-v199 .date{font-weight:850;color:#dfe5e7}.att-intraday-item-v199 .hours{color:#b8c1c5}.att-intraday-item-v199 .duration{color:#d7dde0;font-weight:800}.att-intraday-item-v199 .note{color:#939fa4;white-space:normal;overflow-wrap:anywhere}
      #attendance .att-intraday-type-v199{display:inline-flex;width:max-content;padding:4px 6px;border-radius:7px;border:1px solid #354148;font-size:8px;font-weight:850}.att-intraday-type-v199.paid{background:#153022;border-color:#35604a;color:#8bd0a6}.att-intraday-type-v199.unpaid{background:#302214;border-color:#6a4b2a;color:#e5ba72}
      #attendance .att-intraday-actions-v199{display:flex;gap:5px}.att-intraday-actions-v199 button{min-height:28px!important;padding:5px 7px!important;font-size:8px!important;border-radius:7px!important}
      #attendance .att-intraday-empty-v199{padding:15px 12px;color:#748187;font-size:9.5px;text-align:center}
      #attendance .att-intraday-rule-v199 strong{color:#eee52b}
      @media(max-width:1150px){#attendance .att-intraday-item-v199{grid-template-columns:78px 110px 80px 86px 1fr}.att-intraday-actions-v199{grid-column:1/-1;justify-content:flex-end}}
    `;document.head.appendChild(s);
  }

  async function loadData(force=false){
    const m=monthStart();if(!m||loading||(!force&&loadedMonth===m))return;
    loading=true;
    try{
      const [l,a]=await Promise.all([
        sb.from('attendance_intraday_leave_entries').select('*').gte('work_date',m).lt('work_date',nextMonth()).order('work_date',{ascending:false}).order('start_at',{ascending:false}),
        sb.from('attendance_records').select('id,person_id,work_date,clock_in,clock_out,mode').gte('work_date',m).lt('work_date',nextMonth())
      ]);
      if(l.error)throw l.error;if(a.error)throw a.error;
      entries=l.data||[];attendanceRows=a.data||[];loadedMonth=m;setTimeout(patchAll,20);
    }catch(e){console.warn('Gün içi izin verileri yüklenemedi',e);}finally{loading=false;}
  }

  function personForTable(table){
    const focus=table.closest('#attPersonFocusV195');
    if(focus)return document.querySelector('#attendance tr.att-focus-selected-v195 [data-att-detail]')?.dataset.attDetail||'';
    const drawer=table.closest('#attDetailDrawerV166');
    if(drawer)return drawer.querySelector('[data-original-id="attPersonSelectV160"]')?.value||drawer.querySelector('select')?.value||'';
    const panel=table.closest('.att-panel-v160');
    return panel?.querySelector('#attPersonSelectV160')?.value||'';
  }

  function dailyStatusIndex(table){
    const hs=[...table.querySelectorAll('thead th')];
    let i=hs.findIndex(h=>String(h.textContent||'').trim().toLocaleLowerCase('tr-TR')==='durum');
    if(i<0)i=1;return i;
  }

  function patchDailyTables(){
    document.querySelectorAll('#attendance table.att-table-v160').forEach(table=>{
      const first=String(table.querySelector('thead th')?.textContent||'').trim().toLocaleLowerCase('tr-TR');if(first!=='tarih')return;
      const pid=personForTable(table);if(!pid)return;const idx=dailyStatusIndex(table);
      [...table.querySelectorAll('tbody tr')].forEach(tr=>{
        const date=trToIso(tr.cells?.[0]?.textContent);if(!date)return;
        const cell=tr.cells?.[idx];if(!cell)return;
        cell.querySelector('.att-intraday-day-v199')?.remove();
        const day=entries.filter(x=>x.person_id===pid&&x.work_date===date);if(!day.length)return;
        const host=document.createElement('div');host.className='att-intraday-day-v199';
        day.sort((x,y)=>new Date(x.start_at)-new Date(y.start_at)).forEach(x=>{
          const c=document.createElement('div');c.className=`att-intraday-chip-v199 ${x.leave_type}${x.end_at?'':' open'}`;
          c.innerHTML=`☕ Gün İçi İzin · ${esc(timeTR(x.start_at))}–${x.end_at?esc(timeTR(x.end_at)):'devam ediyor'} · ${esc(minsText(durationMinutes(x)))} · ${esc(typeLabel(x.leave_type))}${x.note?` · ${esc(x.note)}`:''}`;
          host.appendChild(c);
        });cell.appendChild(host);
      });
    });
  }

  function selectedPidFromFocus(){return document.querySelector('#attendance tr.att-focus-selected-v195 [data-att-detail]')?.dataset.attDetail||'';}
  function detailHosts(){
    const out=[],seen=new Set();
    const src=[...document.querySelectorAll('#attendance #attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));
    if(src){const body=src.closest('.att-panel-v160')?.querySelector('.att-panel-body-v160');if(body&&!seen.has(body)){out.push({body,pid:src.value||''});seen.add(body);}}
    const focus=document.querySelector('#attendance #attPersonFocusV195');
    if(focus){const body=focus.querySelector('.att-panel-body-v160');if(body&&!seen.has(body)){out.push({body,pid:selectedPidFromFocus()});seen.add(body);}}
    const drawer=document.querySelector('#attendance #attDetailDrawerV166');
    if(drawer){const body=drawer.querySelector('.att-panel-body-v160');const sel=drawer.querySelector('[data-original-id="attPersonSelectV160"]')||drawer.querySelector('select');if(body&&!seen.has(body)){out.push({body,pid:sel?.value||''});seen.add(body);}}
    return out;
  }

  function renderSection(body,pid){
    if(!body||!pid)return;
    let section=body.querySelector(':scope > .att-intraday-section-v199');
    if(!section){section=document.createElement('div');section.className='att-intraday-section-v199';const summary=body.querySelector('.att-detail-summary-v160');summary?summary.insertAdjacentElement('afterend',section):body.prepend(section);}
    section.dataset.pid=pid;
    const mine=entries.filter(x=>x.person_id===pid);
    const closed=mine.filter(x=>x.end_at);
    const paid=closed.filter(x=>x.leave_type==='paid').reduce((s,x)=>s+durationMinutes(x,false),0);
    const unpaid=closed.filter(x=>x.leave_type==='unpaid').reduce((s,x)=>s+durationMinutes(x,false),0);
    const total=paid+unpaid;
    const rows=mine.length?mine.map(x=>`<div class="att-intraday-item-v199"><span class="date">${esc(dateTR(x.work_date))}</span><span class="hours">${esc(timeTR(x.start_at))}–${x.end_at?esc(timeTR(x.end_at)):'Devam ediyor'}</span><span class="duration">${esc(minsText(durationMinutes(x)))}</span><span class="att-intraday-type-v199 ${x.leave_type}">${esc(typeLabel(x.leave_type))}</span><span class="note">${x.note?esc(x.note):'Açıklama yok'}</span>${isAdminLocal()?`<span class="att-intraday-actions-v199"><button type="button" class="ghost" data-att-intraday-edit="${x.id}">Düzenle</button><button type="button" class="danger" data-att-intraday-delete="${x.id}">Sil</button></span>`:''}</div>`).join(''):`<div class="att-intraday-empty-v199">Bu ay gün içi izin kaydı yok.</div>`;
    section.innerHTML=`<div class="att-intraday-head-v199"><div class="att-intraday-title-v199"><b>Gün İçi İzinler</b><span>Bu ay toplam ${esc(minsText(total))} · Ücretli ${esc(minsText(paid))} · Ücretsiz ${esc(minsText(unpaid))}</span></div>${isAdminLocal()?`<button type="button" class="att-intraday-add-v199" data-att-intraday-add="${pid}">+ Gün İçi İzin Ekle</button>`:''}</div><div class="att-intraday-list-v199">${rows}</div>`;
  }

  function patchDetailSections(){detailHosts().forEach(x=>renderSection(x.body,x.pid));}

  function patchTodayCard(){
    if(isAdminLocal())return;
    const card=document.querySelector('#attendance .att-today-v160 .att-clock-card-v160');if(!card)return;
    let host=card.querySelector('.att-intraday-today-v199');
    const today=todayISO(),att=attendanceRows.find(x=>x.person_id===profile.id&&x.work_date===today),open=entries.find(x=>x.person_id===profile.id&&!x.end_at);
    const canUse=currentMonthIsToday()&&att?.clock_in&&!att?.clock_out;
    const outBtn=card.querySelector('#attClockOutV160');
    if(outBtn){outBtn.classList.toggle('att-intraday-disabled-v199',!!open);outBtn.disabled=!!open;outBtn.title=open?'Önce İzinden Döndüm butonuna basmalısın.':'';}
    if(!canUse){host?.remove();return;}
    if(!host){host=document.createElement('div');host.className='att-intraday-today-v199';card.appendChild(host);}
    if(open){host.innerHTML=`<div class="copy"><b>Gün İçi İzindesin</b><span>${esc(timeTR(open.start_at))} itibarıyla · ${esc(typeLabel(open.leave_type))}${open.note?` · ${esc(open.note)}`:''}</span></div><button type="button" class="att-intraday-end-v199" data-att-intraday-end="1">✓ İzinden Döndüm</button>`;}
    else{host.innerHTML=`<div class="copy"><b>Gün içinde kısa süreli izin mi kullanacaksın?</b><span>İzne çıkış ve dönüş saatin otomatik kaydedilir.</span></div><button type="button" class="att-intraday-start-v199" data-att-intraday-start="1">☕ Gün İçi İzin</button>`;}
  }

  function patchRule(){
    document.querySelectorAll('#attendance .att-rules-v160').forEach(r=>{
      if(r.querySelector('.att-intraday-rule-v199'))return;
      const d=document.createElement('div');d.className='att-rule-v160 att-intraday-rule-v199';d.innerHTML='<b>Gün İçi İzin</b><p>Personel <strong>İzne Çık</strong> ve <strong>İzinden Döndüm</strong> ile saat kaydı oluşturur. Ücretli saatlik izin maaş kesintisi oluşturmaz; ücretsiz saatlik izin yalnız normal çalışma süresine denk gelen bölüm kadar hakedişten düşer.</p>';r.appendChild(d);
    });
  }

  function patchAll(){
    if(!document.getElementById('attendance')?.classList.contains('active-view'))return;
    installStyle();patchTodayCard();patchDailyTables();patchDetailSections();patchRule();
  }

  function refreshBase(){
    setTimeout(()=>{const p=document.getElementById('monthPicker');if(p)p.dispatchEvent(new Event('change',{bubbles:true}));},120);
  }

  function openStartModal(){
    if(typeof openModal!=='function')return;
    openModal('Gün İçi İzin',`<div class="form-grid"><div class="field full"><div class="info-banner"><b>İzne çıkış saatin otomatik kaydedilecek.</b><br>Döndüğünde Mesai ekranındaki “İzinden Döndüm” butonuna bas.</div></div><div class="field"><label>İzin Türü</label><select name="leave_type"><option value="paid">Ücretli İzin</option><option value="unpaid">Ücretsiz İzin</option></select></div><div class="field full"><label>Açıklama</label><textarea name="note" rows="3" maxlength="300" placeholder="Örn. Doktor randevusu / kişisel işlem / banka..."></textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">İzne Çık</button></div></div>`,async fd=>{
      const type=String(fd.get('leave_type')||'paid'),note=String(fd.get('note')||'').trim();
      const {error}=await sb.rpc('attendance_intraday_leave_start',{p_leave_type:type,p_note:note||null});if(error)throw error;
      if(typeof toast==='function')toast(`${type==='unpaid'?'Ücretsiz':'Ücretli'} gün içi izin başladı.`);loadedMonth='';await loadData(true);patchAll();
    });
  }

  async function endLeave(){
    try{const {error}=await sb.rpc('attendance_intraday_leave_end');if(error)throw error;if(typeof toast==='function')toast('İzin dönüş saati kaydedildi.');loadedMonth='';await loadData(true);refreshBase();}
    catch(e){console.error(e);if(typeof toast==='function')toast('İzin dönüşü kaydedilemedi: '+(e.message||e),true);}
  }

  function defaultAdminDate(){const t=todayISO();return t.slice(0,7)===monthStart().slice(0,7)?t:monthStart();}
  function localInputTime(ts){return ts?timeTR(ts):'';}
  function dtIso(date,time){return new Date(`${date}T${time}:00+03:00`).toISOString();}

  function openAdminModal(pid,id=''){
    if(!isAdminLocal()||typeof openModal!=='function')return;
    const row=id?entries.find(x=>x.id===id):null;
    const date=row?.work_date||defaultAdminDate(),start=row?localInputTime(row.start_at):'14:00',end=row?.end_at?localInputTime(row.end_at):'15:00',type=row?.leave_type||'paid';
    openModal(row?'Gün İçi İzni Düzenle':'Gün İçi İzin Ekle',`<div class="form-grid"><div class="field full"><div class="info-banner"><b>${esc(personName(pid))}</b><br>Geçmiş bir gün için izin başlangıç ve dönüş saatini manuel girebilirsin.</div></div><div class="field"><label>Tarih</label><input type="date" name="work_date" value="${esc(date)}" required></div><div class="field"><label>İzin Türü</label><select name="leave_type"><option value="paid" ${type==='paid'?'selected':''}>Ücretli İzin</option><option value="unpaid" ${type==='unpaid'?'selected':''}>Ücretsiz İzin</option></select></div><div class="field"><label>İzne Çıkış</label><input type="time" name="start_time" value="${esc(start)}" required></div><div class="field"><label>İzinden Dönüş</label><input type="time" name="end_time" value="${esc(end)}" required></div><div class="field full"><label>Açıklama</label><textarea name="note" rows="3" maxlength="300" placeholder="İzin nedeni...">${esc(row?.note||'')}</textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Kaydet</button></div></div>`,async fd=>{
      const workDate=String(fd.get('work_date')||''),st=String(fd.get('start_time')||''),et=String(fd.get('end_time')||''),leaveType=String(fd.get('leave_type')||'paid'),note=String(fd.get('note')||'').trim();
      if(!workDate||!st||!et)throw new Error('Tarih, çıkış ve dönüş saati zorunlu.');
      const startAt=dtIso(workDate,st),endAt=dtIso(workDate,et);if(new Date(endAt)<=new Date(startAt))throw new Error('Dönüş saati çıkış saatinden sonra olmalı.');
      const att=attendanceRows.find(x=>x.person_id===pid&&x.work_date===workDate&&x.clock_in);if(!att)throw new Error('Bu tarihte personelin işe giriş kaydı yok. Önce günlük puantaj kaydı olmalı.');
      if(row){const {error}=await sb.from('attendance_intraday_leave_entries').update({work_date:workDate,leave_type:leaveType,start_at:startAt,end_at:endAt,note:note||null}).eq('id',row.id);if(error)throw error;}
      else{const {error}=await sb.from('attendance_intraday_leave_entries').insert({person_id:pid,work_date:workDate,leave_type:leaveType,start_at:startAt,end_at:endAt,note:note||null,created_by:profile.id});if(error)throw error;}
      if(typeof toast==='function')toast(row?'Gün içi izin güncellendi.':'Gün içi izin eklendi.');loadedMonth='';await loadData(true);refreshBase();
    });
  }

  async function deleteEntry(id){
    if(!isAdminLocal())return;const row=entries.find(x=>x.id===id);if(!row)return;
    if(!window.confirm(`${personName(row.person_id)} · ${dateTR(row.work_date)} gün içi izin kaydı silinsin mi?`))return;
    const {error}=await sb.from('attendance_intraday_leave_entries').delete().eq('id',id);if(error){if(typeof toast==='function')toast('İzin kaydı silinemedi: '+error.message,true);return;}
    if(typeof toast==='function')toast('Gün içi izin kaydı silindi.');loadedMonth='';await loadData(true);refreshBase();
  }

  function subscribe(){
    if(channel||!sb?.channel)return;
    channel=sb.channel('intraday-leave-v199')
      .on('postgres_changes',{event:'*',schema:'public',table:'attendance_intraday_leave_entries'},()=>{if(document.getElementById('attendance')?.classList.contains('active-view')){loadedMonth='';loadData(true);}})
      .on('postgres_changes',{event:'*',schema:'public',table:'attendance_records'},()=>{if(document.getElementById('attendance')?.classList.contains('active-view')){loadedMonth='';loadData(true);}})
      .subscribe();
  }

  document.addEventListener('click',e=>{
    const start=e.target.closest('#attendance [data-att-intraday-start]');if(start){e.preventDefault();e.stopPropagation();openStartModal();return;}
    const end=e.target.closest('#attendance [data-att-intraday-end]');if(end){e.preventDefault();e.stopPropagation();endLeave();return;}
    const add=e.target.closest('#attendance [data-att-intraday-add]');if(add){e.preventDefault();e.stopPropagation();openAdminModal(add.dataset.attIntradayAdd);return;}
    const edit=e.target.closest('#attendance [data-att-intraday-edit]');if(edit){e.preventDefault();e.stopPropagation();const row=entries.find(x=>x.id===edit.dataset.attIntradayEdit);if(row)openAdminModal(row.person_id,row.id);return;}
    const del=e.target.closest('#attendance [data-att-intraday-delete]');if(del){e.preventDefault();e.stopPropagation();deleteEntry(del.dataset.attIntradayDelete);return;}
    const out=e.target.closest('#attendance #attClockOutV160');const open=entries.find(x=>x.person_id===profile.id&&!x.end_at);if(out&&open&&!isAdminLocal()){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(typeof toast==='function')toast('Önce “İzinden Döndüm” butonuna basmalısın.',true);return;}
    if(e.target.closest('[data-view="attendance"]'))setTimeout(()=>{loadedMonth='';loadData(true);},180);
    if(e.target.closest('#attClockInV160,#attClockOutV160'))setTimeout(()=>{loadedMonth='';loadData(true);},650);
    if(e.target.closest('[data-att-detail],.att-payroll-person-cell-v195'))setTimeout(patchAll,170);
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker'){loadedMonth='';setTimeout(()=>loadData(true),100);}if(e.target?.id==='attPersonSelectV160')setTimeout(patchAll,100);});

  installStyle();subscribe();
  setInterval(()=>{if(document.getElementById('attendance')?.classList.contains('active-view')){if(loadedMonth!==monthStart())loadData(true);else patchAll();}},900);
  setTimeout(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))loadData(true);},420);
})();
