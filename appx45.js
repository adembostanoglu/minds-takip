// V1.18.1 — Ayrı ek mesai / akşam çekimi kaydı: personel bildirir, yönetici onaylar, hakedişe eklenir.
(function bootManualOvertimeV181(){
  if(window.__mindsManualOvertimeV181)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof state==='undefined'||typeof openModal!=='function'){
    setTimeout(bootManualOvertimeV181,140);return;
  }
  window.__mindsManualOvertimeV181=true;

  let entries=[],attendanceRows=[],loadedMonth='',loading=false;
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const currentMonth=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  const monthStart=()=>currentMonth()+'-01';
  const nextMonth=()=>{const [y,m]=currentMonth().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const person=id=>(state.profiles||[]).find(p=>String(p.id)===String(id));
  const personName=id=>person(id)?.full_name||'Personel';
  const activeStaff=()=>(state.profiles||[]).filter(p=>p.active&&p.role!=='admin');
  const dateTR=v=>{if(!v)return '—';const [y,m,d]=String(v).slice(0,10).split('-');return `${d}.${m}.${y}`;};
  const timeShort=v=>String(v||'').slice(0,5);
  const toMin=t=>{const m=String(t||'').match(/^(\d{2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):0;};
  const duration=x=>Math.max(0,toMin(x.end_time)-toMin(x.start_time));
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};

  function installStyles(){
    if(document.getElementById('manualOvertimeV181Style'))return;
    const s=document.createElement('style');s.id='manualOvertimeV181Style';s.textContent=`
      .att-manual-panel-v181{margin-top:14px;border:1px solid #2a343a;border-radius:12px;background:#10161a;overflow:hidden}
      .att-manual-head-v181{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid #263037;background:linear-gradient(180deg,#151c20,#11171b)}
      .att-manual-head-v181 h3{margin:0;font-size:15px}.att-manual-head-v181 p{margin:4px 0 0;color:#87949a;font-size:10px}
      .att-manual-head-v181 button{white-space:nowrap}
      .att-manual-wrap-v181{overflow:auto}.att-manual-table-v181{width:100%;border-collapse:collapse;min-width:760px}
      .att-manual-table-v181 th,.att-manual-table-v181 td{padding:11px 10px;border-bottom:1px solid #222b30;text-align:left;font-size:10px;vertical-align:middle}
      .att-manual-table-v181 th{font-size:9px;color:#8c989e;text-transform:uppercase;letter-spacing:.35px;background:#12191d}.att-manual-table-v181 tr:last-child td{border-bottom:0}
      .att-manual-status-v181{display:inline-flex;align-items:center;border-radius:14px;padding:4px 7px;font-size:8.5px;font-weight:800;border:1px solid #5d4d25;background:#332a14;color:#e2c35d}
      .att-manual-status-v181.ok{border-color:#315d38;background:#17321d;color:#93da80}.att-manual-actions-v181{display:flex;gap:5px;flex-wrap:wrap}
      .att-manual-actions-v181 button{font-size:8.5px;padding:6px 8px;min-height:auto}
      .att-manual-note-v181{color:#9aa5aa;max-width:320px}.att-manual-empty-v181{padding:24px;text-align:center;color:#748188;font-size:10px}
      .att-manual-overtime-v181{display:block;margin-top:4px;font-size:8px;font-weight:800;color:#e2c35d;line-height:1.2}.att-manual-overtime-v181.ok{color:#8fd27a}
      @media(max-width:760px){.att-manual-head-v181{align-items:flex-start;flex-direction:column}.att-manual-head-v181 button{width:100%}}
    `;document.head.appendChild(s);
  }

  function triggerAttendanceRefresh(){
    const picker=document.getElementById('monthPicker');
    if(picker)picker.dispatchEvent(new Event('change',{bubbles:true}));
    setTimeout(()=>{ensurePanel();patchDailyTables();},450);
  }

  async function loadEntries(force=false){
    const m=monthStart();if(!m||loading)return;if(!force&&loadedMonth===m)return;
    loading=true;
    try{
      const [o,a]=await Promise.all([
        sb.from('attendance_overtime_entries').select('*').gte('work_date',m).lt('work_date',nextMonth()).order('work_date',{ascending:false}).order('start_time',{ascending:false}),
        sb.from('attendance_records').select('person_id,work_date,overtime_approved').gte('work_date',m).lt('work_date',nextMonth())
      ]);
      if(o.error)throw o.error;if(a.error)throw a.error;
      entries=o.data||[];attendanceRows=a.data||[];loadedMonth=m;
      renderPanel();patchDailyTables();
    }catch(e){console.error('Ek mesai yüklenemedi',e);}finally{loading=false;}
  }

  function ensurePanel(){
    installStyles();
    const root=document.getElementById('attendanceRootV160');
    if(!root)return;
    let panel=document.getElementById('attManualPanelV181');
    if(!panel){
      panel=document.createElement('section');panel.id='attManualPanelV181';panel.className='att-manual-panel-v181';
      const grid=root.querySelector('.att-grid-v160');
      if(grid)grid.insertAdjacentElement('afterend',panel);else root.appendChild(panel);
    }
    renderPanel();
    if(loadedMonth!==monthStart())loadEntries(true);
  }

  function renderPanel(){
    const panel=document.getElementById('attManualPanelV181');if(!panel)return;
    const rows=admin()?entries:entries.filter(x=>String(x.person_id)===String(profile.id));
    panel.innerHTML=`<div class="att-manual-head-v181"><div><h3>Ek Mesai / Akşam Çekimleri</h3><p>${admin()?'Personelin normal giriş–çıkış kaydından ayrı yapılan mesaileri onayla.':'Normal giriş–çıkıştan ayrı yaptığın akşam çekimi veya ek mesaiyi bildir.'}</p></div><button class="primary" id="attManualAddV181">${admin()?'+ Ek Mesai Ekle':'+ Ek Mesai Bildir'}</button></div>
      ${rows.length?`<div class="att-manual-wrap-v181"><table class="att-manual-table-v181"><thead><tr>${admin()?'<th>Personel</th>':''}<th>Tarih</th><th>Saat</th><th>Süre</th><th>Açıklama</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>${rows.map(x=>`<tr>${admin()?`<td><b>${esc(personName(x.person_id))}</b></td>`:''}<td>${dateTR(x.work_date)}</td><td>${esc(timeShort(x.start_time))}–${esc(timeShort(x.end_time))}</td><td><b>${minsText(duration(x))}</b></td><td class="att-manual-note-v181">${esc(x.note||'—')}</td><td><span class="att-manual-status-v181 ${x.approved?'ok':''}">${x.approved?'Onaylı':'Onay Bekliyor'}</span></td><td><div class="att-manual-actions-v181">${admin()?`<button class="ghost" data-manual-approve-v181="${x.id}" data-value="${x.approved?'0':'1'}">${x.approved?'Onayı Kaldır':'Onayla'}</button><button class="small-danger" data-manual-delete-v181="${x.id}">Sil</button>`:(!x.approved?`<button class="small-danger" data-manual-delete-v181="${x.id}">Sil</button>`:'—')}</div></td></tr>`).join('')}</tbody></table></div>`:'<div class="att-manual-empty-v181">Bu ay ayrı ek mesai kaydı yok.</div>'}`;
    document.getElementById('attManualAddV181')?.addEventListener('click',openEntryModal);
  }

  function defaultDate(){
    const now=new Date();const y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,'0'),d=String(now.getDate()).padStart(2,'0');
    return `${y}-${m}`===currentMonth()?`${y}-${m}-${d}`:monthStart();
  }

  function selectedAdminPerson(){
    const real=[...document.querySelectorAll('#attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));
    return real?.value||activeStaff()[0]?.id||'';
  }

  function openEntryModal(){
    const pid=admin()?selectedAdminPerson():profile.id;
    if(admin()&&!pid){if(typeof toast==='function')toast('Aktif personel bulunamadı.',true);return;}
    const personField=admin()?`<div class="field full"><label>Personel</label><select name="person_id">${activeStaff().map(p=>`<option value="${p.id}" ${p.id===pid?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="person_id" value="${profile.id}">`;
    openModal(admin()?'Ek Mesai Ekle':'Ek Mesai Bildir',`<div class="form-grid">${personField}<div class="field"><label>Tarih</label><input type="date" name="work_date" value="${defaultDate()}" required></div><div class="field"><label>Açıklama</label><input name="note" placeholder="Örn. Akşam çekimi"></div><div class="field"><label>Başlangıç</label><input type="time" name="start_time" required></div><div class="field"><label>Bitiş</label><input type="time" name="end_time" required></div><div class="field full"><div class="att-form-note-v160">Bu kayıt gündüz giriş–çıkışını değiştirmez. ${admin()?'Yönetici tarafından eklenen kayıt varsayılan olarak onaylıdır.':'Kaydın hakedişe eklenmesi için yönetici onayı gerekir.'}</div></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Kaydet</button></div></div>`,async fd=>{
      const work_date=String(fd.get('work_date')||''),start_time=String(fd.get('start_time')||''),end_time=String(fd.get('end_time')||'');
      if(work_date.slice(0,7)!==currentMonth())throw new Error('Ek mesai tarihi seçili ay içinde olmalı.');
      if(toMin(end_time)<=toMin(start_time))throw new Error('Bitiş saati başlangıçtan sonra olmalı.');
      const approved=admin();
      const payload={person_id:fd.get('person_id'),work_date,start_time,end_time,note:String(fd.get('note')||'').trim()||null,approved,approved_by:approved?profile.id:null,approved_at:approved?new Date().toISOString():null,created_by:profile.id,updated_at:new Date().toISOString()};
      const {error}=await sb.from('attendance_overtime_entries').insert(payload);if(error)throw error;
      loadedMonth='';setTimeout(()=>{loadEntries(true);triggerAttendanceRefresh();},350);
    });
  }

  async function approve(id,value){
    if(!admin())return;
    const payload={approved:value,approved_by:value?profile.id:null,approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()};
    const {error}=await sb.from('attendance_overtime_entries').update(payload).eq('id',id);if(error){if(typeof toast==='function')toast(error.message,true);return;}
    if(typeof toast==='function')toast(value?'Ek mesai onaylandı.':'Ek mesai onayı kaldırıldı.');
    loadedMonth='';await loadEntries(true);triggerAttendanceRefresh();
  }

  async function remove(id){
    if(!confirm('Ek mesai kaydı silinsin mi?'))return;
    const {error}=await sb.from('attendance_overtime_entries').delete().eq('id',id);if(error){if(typeof toast==='function')toast(error.message,true);return;}
    if(typeof toast==='function')toast('Ek mesai kaydı silindi.');loadedMonth='';await loadEntries(true);triggerAttendanceRefresh();
  }

  function tablePersonId(table){
    const panel=table.closest('.att-panel-v160');
    const ownSelect=panel?.querySelector('#attPersonSelectV160,[data-original-id="attPersonSelectV160"]');
    if(ownSelect?.value)return ownSelect.value;
    if(table.closest('#attDetailDrawerV166')){
      const ds=table.closest('#attDetailDrawerV166')?.querySelector('[data-original-id="attPersonSelectV160"]');if(ds?.value)return ds.value;
    }
    return admin()?selectedAdminPerson():profile.id;
  }

  function patchDailyTables(){
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(table=>{
      const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
      const dateI=heads.indexOf('tarih'),otI=heads.indexOf('fazla mesai');if(dateI<0||otI<0)return;
      const pid=tablePersonId(table);if(!pid)return;
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cells=[...tr.children];if(cells.length<=otI)return;
        cells[otI].querySelectorAll('.att-manual-overtime-v181').forEach(x=>x.remove());
        const t=cells[dateI]?.textContent.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);if(!t)return;
        const iso=`${t[3]}-${t[2]}-${t[1]}`;
        const arr=entries.filter(x=>String(x.person_id)===String(pid)&&x.work_date===iso);if(!arr.length)return;
        const total=arr.reduce((s,x)=>s+duration(x),0),allApproved=arr.every(x=>x.approved);
        const line=document.createElement('span');line.className=`att-manual-overtime-v181 ${allApproved?'ok':''}`;line.textContent=`+ ${minsText(total)} ek mesai${allApproved?' • onaylı':' • onay bekliyor'}`;cells[otI].appendChild(line);
      });
    });
  }

  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-manual-approve-v181]');if(a){e.preventDefault();approve(a.dataset.manualApproveV181,a.dataset.value==='1');return;}
    const d=e.target.closest('[data-manual-delete-v181]');if(d){e.preventDefault();remove(d.dataset.manualDeleteV181);return;}
    if(e.target.closest('.nav-item[data-view="attendance"],[data-att-detail],[data-att-edit-day]'))setTimeout(()=>{ensurePanel();loadEntries();patchDailyTables();},500);
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]')){loadedMonth='';setTimeout(()=>loadEntries(true),180);}},true);

  installStyles();
  setInterval(()=>{
    if(document.getElementById('attendance')?.classList.contains('active-view')){ensurePanel();patchDailyTables();}
  },900);
  setTimeout(()=>{ensurePanel();if(document.getElementById('attendance')?.classList.contains('active-view'))loadEntries(true);},500);
})();
