// V1.19.2 — Personel fazla mesai açıklaması: çalışan kendi mesai kaydına iş/not ekler, yönetici aynı tarihte görür.
(function bootAttendanceOvertimeNotesV192(){
  if(window.__mindsAttendanceOvertimeNotesV192)return;
  window.__mindsAttendanceOvertimeNotesV192=true;

  let rows=[];
  let loadedMonth='';
  let loading=false;
  const TZ='Europe/Istanbul';
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');

  function monthStart(){return String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7)+'-01';}
  function nextMonth(){const [y,m]=monthStart().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;}
  function isAdminLocal(){try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return String(window.profile?.role||'').toLowerCase()==='admin';}}
  function localMinutes(ts){
    if(!ts)return null;
    const p=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ts));
    const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return Number(o.hour)*60+Number(o.minute);
  }
  function dow(date){return new Date(`${date}T12:00:00Z`).getUTCDay();}
  function isOvertimeRecord(r){
    if(!r?.clock_out)return false;
    const d=dow(r.work_date),t=localMinutes(r.clock_out);
    if(d>=1&&d<=5)return t>=1170; // 19:30 ve sonrası
    if(d===6)return t>810; // Cumartesi 13:30 sonrası
    return false;
  }
  function trToIso(v){
    const m=String(v||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';
  }
  function personForTable(table){
    const inline=table.closest('.att-person-expand-v191');
    if(inline){
      const expandRow=inline.closest('tr.att-person-expand-row-v191');
      const base=expandRow?.previousElementSibling;return base?.querySelector('[data-att-detail]')?.dataset.attDetail||'';
    }
    const drawer=table.closest('#attDetailDrawerV166');
    if(drawer)return drawer.querySelector('[data-original-id="attPersonSelectV160"]')?.value||'';
    const panel=table.closest('.att-panel-v160');
    const sel=panel?.querySelector('#attPersonSelectV160');
    if(sel)return sel.value||'';
    return window.profile?.id||'';
  }

  function installStyle(){
    if(document.getElementById('attOtNoteV192Style'))return;
    const s=document.createElement('style');s.id='attOtNoteV192Style';s.textContent=`
      .att-ot-note-wrap-v192{display:flex;flex-direction:column;align-items:flex-start;gap:5px;margin-top:6px;max-width:260px}
      .att-ot-note-text-v192{white-space:normal!important;line-height:1.35;color:#d6cf72;font-size:9px;font-weight:650;overflow-wrap:anywhere}
      .att-ot-note-btn-v192{min-height:0!important;padding:5px 7px!important;font-size:8px!important;border:1px solid #514d22!important;border-radius:7px!important;background:#201f0d!important;color:#e8df50!important;cursor:pointer}
      .att-ot-today-v192{margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .att-ot-today-v192 button{min-height:34px!important;padding:7px 10px!important;border:1px solid #60591f!important;background:#26240b!important;color:#eee52b!important;border-radius:8px!important;font-size:9px!important;font-weight:800}
      .att-ot-today-v192 span{font-size:9px;color:#a6a26c}
    `;document.head.appendChild(s);
  }

  async function loadData(force=false){
    const m=monthStart();if(!m||loading||(!force&&loadedMonth===m&&rows.length))return;
    loading=true;
    try{
      const {data,error}=await sb.from('attendance_records').select('id,person_id,work_date,clock_in,clock_out,overtime_note').gte('work_date',m).lt('work_date',nextMonth());
      if(error)throw error;rows=data||[];loadedMonth=m;setTimeout(patch,20);
    }catch(e){console.warn('Fazla mesai notları yüklenemedi',e);}finally{loading=false;}
  }

  function noteCellIndex(table){
    const hs=[...table.querySelectorAll('thead th')];
    let i=hs.findIndex(h=>String(h.textContent||'').toLocaleLowerCase('tr-TR').includes('mesai durumu'));
    if(i<0)i=hs.findIndex(h=>String(h.textContent||'').toLocaleLowerCase('tr-TR').includes('fazla mesai'));
    return i;
  }

  function patchTables(){
    document.querySelectorAll('#attendance table.att-table-v160').forEach(table=>{
      const first=String(table.querySelector('thead th')?.textContent||'').trim().toLocaleLowerCase('tr-TR');
      if(first!=='tarih')return;
      const pid=personForTable(table);if(!pid)return;
      const idx=noteCellIndex(table);if(idx<0)return;
      [...table.querySelectorAll('tbody tr')].forEach(tr=>{
        const date=trToIso(tr.cells?.[0]?.textContent);if(!date)return;
        const rec=rows.find(x=>x.person_id===pid&&x.work_date===date);
        const old=tr.querySelector('.att-ot-note-wrap-v192');
        if(!rec||!isOvertimeRecord(rec)){old?.remove();return;}
        const cell=tr.cells[idx];if(!cell)return;
        let wrap=old;
        if(!wrap){wrap=document.createElement('div');wrap.className='att-ot-note-wrap-v192';cell.appendChild(wrap);}
        wrap.innerHTML=`${rec.overtime_note?`<div class="att-ot-note-text-v192">📝 ${esc(rec.overtime_note)}</div>`:'<div class="att-ot-note-text-v192">Mesai açıklaması girilmedi.</div>'}<button type="button" class="att-ot-note-btn-v192" data-att-ot-note-v192="${rec.id}">${rec.overtime_note?'Notu Düzenle':'Mesai Notu Yaz'}</button>`;
      });
    });
  }

  function todayIso(){
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${o.year}-${o.month}-${o.day}`;
  }
  function patchTodayCard(){
    if(isAdminLocal())return;
    const rec=rows.find(x=>x.person_id===window.profile?.id&&x.work_date===todayIso());
    const card=document.querySelector('#attendance .att-today-v160 .att-clock-card-v160');if(!card)return;
    let host=card.querySelector('.att-ot-today-v192');
    if(!rec||!isOvertimeRecord(rec)){host?.remove();return;}
    if(!host){host=document.createElement('div');host.className='att-ot-today-v192';card.appendChild(host);}
    host.innerHTML=`<button type="button" data-att-ot-note-v192="${rec.id}">${rec.overtime_note?'Fazla Mesai Notunu Düzenle':'Fazla Mesai Açıklaması Yaz'}</button>${rec.overtime_note?`<span>📝 ${esc(rec.overtime_note)}</span>`:''}`;
  }

  function patch(){
    if(!document.getElementById('attendance')?.classList.contains('active-view'))return;
    installStyle();patchTables();patchTodayCard();
  }

  function openNote(recordId){
    const rec=rows.find(x=>x.id===recordId);if(!rec||typeof openModal!=='function')return;
    const person=(state.profiles||[]).find(p=>p.id===rec.person_id)?.full_name||'Personel';
    const [y,m,d]=rec.work_date.split('-');
    openModal('Fazla Mesai Açıklaması',`<div class="form-grid"><div class="field full"><div class="info-banner"><b>${esc(person)}</b> · ${d}.${m}.${y}<br>Mesaiye neden kalındığını veya hangi iş üzerinde çalışıldığını yaz.</div></div><div class="field full"><label>Mesai Notu / Yapılan İş</label><textarea name="overtime_note" rows="4" maxlength="500" placeholder="Örn. Tavus Camii video edit teslimi / Saraçoğlu akşam çekimi / Müşteri revizeleri...">${esc(rec.overtime_note||'')}</textarea><div class="att-form-note-v160">Bu not aynı tarihte yönetici puantajında da görünür.</div></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Kaydet</button></div></div>`,async fd=>{
      const note=String(fd.get('overtime_note')||'').trim();
      const {error}=await sb.rpc('attendance_set_overtime_note',{p_record_id:recordId,p_note:note});if(error)throw error;
      rec.overtime_note=note||null;if(typeof toast==='function')toast(note?'Fazla mesai açıklaması kaydedildi.':'Fazla mesai açıklaması kaldırıldı.');setTimeout(patch,30);
    });
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-att-ot-note-v192]');if(b){e.preventDefault();e.stopPropagation();openNote(b.dataset.attOtNoteV192);return;}
    if(e.target.closest('[data-view="attendance"]'))setTimeout(()=>loadData(true),180);
    if(e.target.closest('#attClockOutV160'))setTimeout(()=>loadData(true),650);
    if(e.target.closest('[data-att-detail],.att-payroll-person-click-v191'))setTimeout(patch,140);
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(()=>{loadedMonth='';rows=[];loadData(true);},100);});

  installStyle();
  setInterval(()=>{if(document.getElementById('attendance')?.classList.contains('active-view')){if(loadedMonth!==monthStart())loadData(true);else patch();}},900);
  setTimeout(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))loadData(true);},350);
})();
