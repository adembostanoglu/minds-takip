// V1.18.2 — Ek mesai olan fakat normal giriş/çıkış kaydı olmayan günleri personel detay tablosunda ayrı satır olarak gösterir.
(function bootManualOvertimeDetailRowsV182(){
  if(window.__mindsManualOvertimeDetailRowsV182)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof state==='undefined'){
    setTimeout(bootManualOvertimeDetailRowsV182,140);return;
  }
  window.__mindsManualOvertimeDetailRowsV182=true;

  let entries=[],loadedMonth='',loading=false;
  const monthKey=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  const monthStart=()=>monthKey()+'-01';
  const nextMonth=()=>{const [y,m]=monthKey().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const toMin=t=>{const m=String(t||'').match(/^(\d{2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):0;};
  const duration=x=>Math.max(0,toMin(x.end_time)-toMin(x.start_time));
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const dateTR=v=>{const [y,m,d]=String(v||'').slice(0,10).split('-');return y&&m&&d?`${d}.${m}.${y}`:'—';};
  const timeShort=v=>String(v||'').slice(0,5)||'—';
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const admin=()=>typeof isAdmin==='function'&&isAdmin();

  function selectedPersonId(table){
    const panel=table.closest('.att-panel-v160');
    const local=panel?.querySelector('#attPersonSelectV160,[data-original-id="attPersonSelectV160"]');
    if(local?.value)return local.value;
    if(table.closest('#attDetailDrawerV166')){
      const s=table.closest('#attDetailDrawerV166')?.querySelector('[data-original-id="attPersonSelectV160"]');
      if(s?.value)return s.value;
    }
    const native=[...document.querySelectorAll('#attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));
    return native?.value||(admin()?null:profile.id);
  }

  function parseRowDate(text){
    const m=String(text||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';
  }

  function patchTable(table){
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
    const dateI=heads.indexOf('tarih'),statusI=heads.indexOf('durum'),inI=heads.indexOf('giriş'),outI=heads.indexOf('çıkış'),lateI=heads.indexOf('geç'),otI=heads.indexOf('fazla mesai'),otStatusI=heads.indexOf('mesai durumu'),actionI=heads.indexOf('işlem');
    if([dateI,statusI,inI,outI,lateI,otI,otStatusI].some(i=>i<0))return;
    const pid=selectedPersonId(table);if(!pid)return;
    const tbody=table.querySelector('tbody');if(!tbody)return;

    tbody.querySelectorAll('tr[data-manual-only-v182="1"]').forEach(x=>x.remove());
    const existingDates=new Set([...tbody.querySelectorAll('tr')].map(tr=>parseRowDate(tr.children[dateI]?.textContent)).filter(Boolean));
    const byDate=new Map();
    entries.filter(x=>String(x.person_id)===String(pid)).forEach(x=>{
      if(!byDate.has(x.work_date))byDate.set(x.work_date,[]);byDate.get(x.work_date).push(x);
    });

    for(const [date,arr] of byDate){
      if(existingDates.has(date))continue;
      const total=arr.reduce((s,x)=>s+duration(x),0),allApproved=arr.every(x=>x.approved);
      const first=[...arr].sort((a,b)=>String(a.start_time).localeCompare(String(b.start_time)))[0];
      const last=[...arr].sort((a,b)=>String(b.end_time).localeCompare(String(a.end_time)))[0];
      const notes=[...new Set(arr.map(x=>String(x.note||'').trim()).filter(Boolean))];
      const tr=document.createElement('tr');tr.dataset.manualOnlyV182='1';tr.dataset.isoDateV182=date;
      const cells=[];
      for(let i=0;i<heads.length;i++)cells.push('<td>—</td>');
      cells[dateI]=`<td>${dateTR(date)}</td>`;
      cells[statusI]='<td><span class="att-badge-v160 blue">Ek Mesai</span></td>';
      cells[inI]=`<td>${esc(timeShort(first?.start_time))}</td>`;
      cells[outI]=`<td>${esc(timeShort(last?.end_time))}</td>`;
      cells[lateI]='<td>—</td>';
      cells[otI]=`<td class="pos"><b>${minsText(total)}</b>${notes.length?`<span class="att-manual-overtime-v181 ${allApproved?'ok':''}">${esc(notes.join(' • '))}</span>`:''}</td>`;
      cells[otStatusI]=`<td><span class="att-badge-v160 ${allApproved?'good':'warn'}">${allApproved?'Onaylı':'Onay Bekliyor'}</span></td>`;
      if(actionI>=0)cells[actionI]='<td>—</td>';
      tr.innerHTML=cells.join('');tbody.appendChild(tr);
    }

    const rows=[...tbody.querySelectorAll('tr')];
    rows.sort((a,b)=>{
      const da=a.dataset.isoDateV182||parseRowDate(a.children[dateI]?.textContent),db=b.dataset.isoDateV182||parseRowDate(b.children[dateI]?.textContent);
      if(!da&&!db)return 0;if(!da)return 1;if(!db)return -1;return db.localeCompare(da);
    }).forEach(r=>tbody.appendChild(r));
  }

  function patchAll(){
    document.querySelectorAll('#attendance .att-table-v160,#attDetailDrawerV166 .att-table-v160').forEach(patchTable);
  }

  async function loadEntries(force=false){
    const m=monthStart();if(!/^\d{4}-\d{2}-01$/.test(m))return;
    if(loading||(!force&&loadedMonth===m)){patchAll();return;}
    loading=true;
    try{
      const {data,error}=await sb.from('attendance_overtime_entries').select('id,person_id,work_date,start_time,end_time,note,approved').gte('work_date',m).lt('work_date',nextMonth()).order('work_date',{ascending:false});
      if(error)throw error;entries=data||[];loadedMonth=m;patchAll();
    }catch(e){console.warn('Ek mesai detay satırları yüklenemedi',e);}finally{loading=false;}
  }

  function schedule(force=false){[80,220,520].forEach(ms=>setTimeout(()=>loadEntries(force),ms));}
  document.addEventListener('click',e=>{
    if(e.target.closest('.nav-item[data-view="attendance"],[data-att-detail],[data-att-edit-day],[data-manual-approve-v181],[data-manual-delete-v181],#attManualAddV181'))schedule(true);
  },true);
  document.addEventListener('change',e=>{
    if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]')){loadedMonth='';schedule(true);}
  },true);
  setInterval(()=>{if(document.getElementById('attendance')?.classList.contains('active-view'))patchAll();},1200);
  schedule(true);
})();