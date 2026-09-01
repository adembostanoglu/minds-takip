// V1.23.5 — Mesai detayında gerçek veriye bağlı onay alanı; Cumartesi nöbetini mesai saymaz.
(function bootAttendanceApprovalControlsV235(){
  if(window.__mindsAttendanceApprovalControlsV235)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile){
    setTimeout(bootAttendanceApprovalControlsV235,140);return;
  }
  window.__mindsAttendanceApprovalControlsV235=true;

  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const monthKey=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,7);
  const monthStart=()=>monthKey()+'-01';
  const nextMonth=()=>{const [y,m]=monthKey().split('-').map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;};
  const dateTR=v=>{const [y,m,d]=String(v||'').slice(0,10).split('-');return y&&m&&d?`${d}.${m}.${y}`:'—';};
  const dow=v=>new Date(`${v}T12:00:00Z`).getUTCDay();
  const tzMinutes=ts=>{if(!ts)return null;const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ts));const o=Object.fromEntries(parts.map(x=>[x.type,x.value]));return Number(o.hour)*60+Number(o.minute);};
  const toMin=t=>{const m=String(t||'').match(/^(\d{1,2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):0;};
  const minsText=v=>{const n=Math.max(0,Math.round(Number(v||0))),h=Math.floor(n/60),m=n%60;return h?(m?`${h} sa ${m} dk`:`${h} sa`):`${m} dk`;};
  const parseRowDate=text=>{const m=String(text||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:'';};

  let lastKey='',lastData=null,loading=false;

  function selectedPersonId(){
    const drawer=document.getElementById('attDetailDrawerV166');
    const ds=drawer?.querySelector('[data-original-id="attPersonSelectV160"]');
    if(ds?.value)return ds.value;
    const real=[...document.querySelectorAll('#attPersonSelectV160')].find(x=>!x.closest('#attDetailDrawerV166'));
    return real?.value||(!admin()?profile.id:'');
  }

  function normalOvertimeMinutes(r,dutyDates){
    if(!r?.clock_out)return 0;
    const d=dow(r.work_date),co=tzMinutes(r.clock_out),ci=tzMinutes(r.clock_in);
    if(co===null)return 0;
    if(d>=1&&d<=5)return co>=19*60+30?Math.max(0,co-(18*60+30)):0;
    if(d===6){
      if(dutyDates.has(r.work_date))return 0;
      return co>14*60+30?Math.max(0,co-Math.max(ci??0,14*60+30)):0;
    }
    return 0;
  }

  async function load(pid,force=false){
    if(!pid||!admin())return null;
    const key=`${pid}|${monthKey()}`;
    if(!force&&lastKey===key&&lastData)return lastData;
    if(loading)return lastData;
    loading=true;
    try{
      const [r,m,d]=await Promise.all([
        sb.from('attendance_records').select('id,person_id,work_date,clock_in,clock_out,overtime_approved,overtime_note').eq('person_id',pid).gte('work_date',monthStart()).lt('work_date',nextMonth()).order('work_date',{ascending:false}),
        sb.from('attendance_overtime_entries').select('id,person_id,work_date,start_time,end_time,note,approved').eq('person_id',pid).gte('work_date',monthStart()).lt('work_date',nextMonth()).order('work_date',{ascending:false}),
        sb.from('attendance_saturday_duty').select('duty_date').eq('person_id',pid).gte('duty_date',monthStart()).lt('duty_date',nextMonth())
      ]);
      if(r.error)throw r.error;if(m.error)throw m.error;if(d.error)throw d.error;
      lastKey=key;lastData={records:r.data||[],manual:m.data||[],dutyDates:new Set((d.data||[]).map(x=>x.duty_date))};return lastData;
    }catch(e){console.warn('Mesai onay alanı yüklenemedi',e);return null;}finally{loading=false;}
  }

  function installStyles(){
    if(document.getElementById('attApprovalV235Style'))return;
    const s=document.createElement('style');s.id='attApprovalV235Style';s.textContent=`
      .att-approval-v235{margin:0 0 12px;border:1px solid #5d5122;border-radius:11px;background:#18170d;overflow:hidden}.att-approval-head-v235{padding:10px 12px;border-bottom:1px solid #4a421d;display:flex;align-items:center;justify-content:space-between;gap:8px}.att-approval-head-v235 b{font-size:11px;color:#ece52c}.att-approval-head-v235 span{font-size:8px;color:#a8a478}.att-approval-list-v235{display:grid}.att-approval-row-v235{display:grid;grid-template-columns:84px 1fr auto;gap:8px;align-items:center;padding:9px 12px;border-bottom:1px solid #302d18}.att-approval-row-v235:last-child{border-bottom:0}.att-approval-row-v235 small{font-size:8px;color:#9d9a7e}.att-approval-row-v235 strong{display:block;font-size:9px;color:#e8edef}.att-approval-row-v235 em{display:block;margin-top:2px;font-size:8px;color:#aaa58a;font-style:normal}.att-approval-row-v235 button{font-size:8px!important;padding:6px 8px!important;white-space:nowrap}.att-approval-empty-v235{padding:10px 12px;color:#8f957f;font-size:9px}
      #attDetailDrawerV166 td[data-v235-action="1"]{display:table-cell!important}
      @media(max-width:760px){.att-approval-row-v235{grid-template-columns:70px 1fr}.att-approval-row-v235 button{grid-column:1/-1;width:100%}}
    `;document.head.appendChild(s);
  }

  function tableIndexes(table){
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLocaleLowerCase('tr-TR'));
    return {date:heads.indexOf('tarih'),ot:heads.indexOf('fazla mesai'),status:heads.indexOf('mesai durumu'),action:heads.indexOf('işlem')};
  }

  function patchTable(root,pid,data){
    const recMap=new Map(data.records.map(x=>[x.work_date,x]));
    const manMap=new Map();data.manual.forEach(x=>{if(!manMap.has(x.work_date))manMap.set(x.work_date,[]);manMap.get(x.work_date).push(x);});
    root.querySelectorAll('.att-table-v160').forEach(table=>{
      const ix=tableIndexes(table);if(ix.date<0||ix.ot<0||ix.status<0)return;
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cells=[...tr.children];const iso=parseRowDate(cells[ix.date]?.textContent);if(!iso)return;
        const rec=recMap.get(iso),manual=manMap.get(iso)||[];
        const normalOt=rec?normalOvertimeMinutes(rec,data.dutyDates):0;
        if(normalOt>0){
          if(cells[ix.ot]){cells[ix.ot].textContent=minsText(normalOt);cells[ix.ot].classList.add('pos');}
          if(cells[ix.status])cells[ix.status].innerHTML=`<span class="att-badge-v160 ${rec.overtime_approved?'good':'warn'}">${rec.overtime_approved?'Onaylı':'Onay Bekliyor'}</span>`;
          if(ix.action>=0&&cells[ix.action]){
            cells[ix.action].dataset.v235Action='1';
            let wrap=cells[ix.action].querySelector('.att-row-actions-v160');if(!wrap){wrap=document.createElement('div');wrap.className='att-row-actions-v160';cells[ix.action].prepend(wrap);}
            if(!wrap.querySelector('[data-v235-normal]')){
              const b=document.createElement('button');b.className='ghost';b.dataset.v235Normal=rec.id;b.dataset.v235Value=rec.overtime_approved?'0':'1';b.textContent=rec.overtime_approved?'Onayı Kaldır':'Mesaiyi Onayla';wrap.prepend(b);
            }
          }
        }
        if(manual.length&&tr.dataset.manualOnlyV182==='1'){
          const allApproved=manual.every(x=>x.approved);
          if(cells[ix.status])cells[ix.status].innerHTML=`<span class="att-badge-v160 ${allApproved?'good':'warn'}">${allApproved?'Onaylı':'Onay Bekliyor'}</span>`;
          if(ix.action>=0&&cells[ix.action]){
            cells[ix.action].dataset.v235Action='1';
            cells[ix.action].innerHTML=`<button class="ghost" data-v235-manual-date="${iso}" data-v235-value="${allApproved?'0':'1'}">${allApproved?'Onayı Kaldır':'Ek Mesaiyi Onayla'}</button>`;
          }
        }
      });
    });
  }

  function pendingItems(data){
    const items=[];
    data.records.forEach(r=>{const mins=normalOvertimeMinutes(r,data.dutyDates);if(mins>0&&!r.overtime_approved)items.push({kind:'normal',id:r.id,date:r.work_date,mins,note:r.overtime_note||'Giriş–çıkış kaydından oluşan fazla mesai'});});
    data.manual.filter(x=>!x.approved).forEach(x=>items.push({kind:'manual',id:x.id,date:x.work_date,mins:Math.max(0,toMin(x.end_time)-toMin(x.start_time)),note:x.note||'Ayrı ek mesai / akşam çekimi'}));
    return items.sort((a,b)=>b.date.localeCompare(a.date));
  }

  function renderApprovalBox(drawer,data){
    const body=drawer.querySelector('.att-drawer-body-v166');if(!body)return;
    body.querySelector('.att-approval-v235')?.remove();
    const items=pendingItems(data);
    const box=document.createElement('section');box.className='att-approval-v235';
    box.innerHTML=`<div class="att-approval-head-v235"><b>Onay Bekleyen Mesailer</b><span>${items.length} kayıt</span></div>${items.length?`<div class="att-approval-list-v235">${items.map(x=>`<div class="att-approval-row-v235"><small>${dateTR(x.date)}</small><div><strong>${x.kind==='manual'?'Ek Mesai / Akşam Çekimi':'Fazla Mesai'} · ${minsText(x.mins)}</strong><em>${esc(x.note)}</em></div><button class="ghost" ${x.kind==='manual'?`data-v235-manual-id="${x.id}"`:`data-v235-normal="${x.id}"`} data-v235-value="1">Onayla</button></div>`).join('')}</div>`:'<div class="att-approval-empty-v235">Bu personelde onay bekleyen mesai yok.</div>'}`;
    const firstPanel=body.querySelector('.att-panel-v160');firstPanel?body.insertBefore(box,firstPanel):body.prepend(box);
  }

  async function refresh(force=false){
    if(!admin())return;
    installStyles();
    const drawer=document.getElementById('attDetailDrawerV166');if(!drawer?.classList.contains('open'))return;
    const pid=selectedPersonId();if(!pid)return;
    const data=await load(pid,force);if(!data)return;
    renderApprovalBox(drawer,data);patchTable(drawer,pid,data);
  }

  async function setNormal(id,value){
    const payload={overtime_approved:value,overtime_approved_by:value?profile.id:null,overtime_approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()};
    const {error}=await sb.from('attendance_records').update(payload).eq('id',id);if(error)throw error;
  }
  async function setManualById(id,value){
    const payload={approved:value,approved_by:value?profile.id:null,approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()};
    const {error}=await sb.from('attendance_overtime_entries').update(payload).eq('id',id);if(error)throw error;
  }
  async function setManualByDate(date,value){
    const pid=selectedPersonId();if(!pid)return;
    const payload={approved:value,approved_by:value?profile.id:null,approved_at:value?new Date().toISOString():null,updated_at:new Date().toISOString()};
    const {error}=await sb.from('attendance_overtime_entries').update(payload).eq('person_id',pid).eq('work_date',date);if(error)throw error;
  }

  async function act(fn,ok){
    try{await fn();lastKey='';lastData=null;if(typeof toast==='function')toast(ok);await refresh(true);document.getElementById('monthPicker')?.dispatchEvent(new Event('change',{bubbles:true}));}
    catch(e){if(typeof toast==='function')toast(e.message||String(e),true);}
  }

  function schedule(force=false){[90,220,480,850].forEach(ms=>setTimeout(()=>refresh(force),ms));}
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-att-detail],.nav-item[data-view="attendance"]'))schedule(false);
    const n=e.target.closest('#attDetailDrawerV166 [data-v235-normal]');if(n){e.preventDefault();act(()=>setNormal(n.dataset.v235Normal,n.dataset.v235Value==='1'),'Fazla mesai durumu güncellendi.');return;}
    const mi=e.target.closest('#attDetailDrawerV166 [data-v235-manual-id]');if(mi){e.preventDefault();act(()=>setManualById(mi.dataset.v235ManualId,mi.dataset.v235Value==='1'),'Ek mesai durumu güncellendi.');return;}
    const md=e.target.closest('#attDetailDrawerV166 [data-v235-manual-date]');if(md){e.preventDefault();act(()=>setManualByDate(md.dataset.v235ManualDate,md.dataset.v235Value==='1'),'Ek mesai durumu güncellendi.');}
  },true);
  document.addEventListener('change',e=>{if(e.target.closest('#monthPicker,#attPersonSelectV160,[data-original-id="attPersonSelectV160"]')){lastKey='';lastData=null;schedule(true);}},true);
  window.addEventListener('pageshow',()=>schedule(false));
  installStyles();
})();
