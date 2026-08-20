// V1.12.2 — clickable personnel summary in Reports + printable monthly person report
(function bootReportPersonDetailV122(){
  if(typeof renderReports!=='function' || typeof isAdmin!=='function' || typeof activeProfiles!=='function' || typeof monthWorks!=='function'){
    setTimeout(bootReportPersonDetailV122,120);
    return;
  }
  if(window.__mindsReportPersonDetailV122) return;
  window.__mindsReportPersonDetailV122=true;

  let selectedPersonId=null;
  const respLabels={ana_sorumlu:'Ana Sorumlu',tasarim:'Tasarım',video:'Video',sosyal_medya:'Sosyal Medya',diger:'Diğer'};

  function esc(v){
    if(typeof escapeHtml==='function') return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
  }
  function qty(arr){ return (arr||[]).reduce((n,w)=>n+Number(w?.quantity||1),0); }
  function ready(w){ return typeof workReady==='function'?workReady(w):['hazir','onaylandi'].includes(w?.status); }
  function workFirm(w){
    if(typeof workFirmId==='function') return workFirmId(w);
    const fm=(state.months||[]).find(m=>m.id===w?.firm_month_id); return fm?.firm_id||null;
  }
  function sharesForMonth(){
    if(typeof monthShares==='function') return monthShares();
    return (state.shares||[]).filter(s=>typeof dateMonthISO==='function'&&dateMonthISO(s.share_date)===selectedMonth);
  }
  function shareQty(shares,type){
    return (shares||[]).reduce((n,s)=>{
      const w=(state.works||[]).find(x=>x.id===s.work_id);
      return n+(w?.type===type?Number(s.quantity||0):0);
    },0);
  }
  function personRecord(pid){ return (state.profiles||[]).find(p=>p.id===pid)||null; }
  function firmRecord(fid){ return typeof firm==='function'?firm(fid):(state.firms||[]).find(f=>f.id===fid); }
  function monthFirmRecord(fid){ return (state.months||[]).find(m=>m.firm_id===fid&&m.month===selectedMonth)||null; }
  function roleList(pid,fid){
    return (state.assignments||[]).filter(a=>a.person_id===pid&&a.firm_id===fid).map(a=>respLabels[a.responsibility]||a.responsibility).filter(Boolean);
  }
  function monthExtras(pid){ return (state.extras||[]).filter(x=>x.month===selectedMonth&&x.person_id===pid); }
  function monthShootsFor(pid){ return (state.shoots||[]).filter(x=>x.month===selectedMonth&&x.responsible_id===pid); }
  function relatedFirmIds(pid){
    const ids=new Set();
    (state.assignments||[]).filter(a=>a.person_id===pid).forEach(a=>ids.add(a.firm_id));
    monthWorks().filter(w=>w.assigned_to===pid).forEach(w=>{const fid=workFirm(w);if(fid)ids.add(fid);});
    sharesForMonth().filter(s=>s.shared_by===pid).forEach(s=>{const w=(state.works||[]).find(x=>x.id===s.work_id);const fid=workFirm(w);if(fid)ids.add(fid);});
    monthExtras(pid).forEach(x=>{if(x.firm_id)ids.add(x.firm_id);});
    monthShootsFor(pid).forEach(x=>{if(x.firm_id)ids.add(x.firm_id);});
    return [...ids].filter(fid=>firmRecord(fid)).sort((a,b)=>String(firmRecord(a)?.name||'').localeCompare(String(firmRecord(b)?.name||''),'tr'));
  }
  function personData(pid){
    const p=personRecord(pid); if(!p) return null;
    const works=monthWorks().filter(w=>w.assigned_to===pid);
    const shares=sharesForMonth().filter(s=>s.shared_by===pid);
    const extras=monthExtras(pid), shoots=monthShootsFor(pid);
    const assignedFirmCount=new Set((state.assignments||[]).filter(a=>a.person_id===pid&&firmRecord(a.firm_id)?.active).map(a=>a.firm_id)).size;
    return {
      p,works,shares,extras,shoots,assignedFirmCount,
      post:qty(works.filter(w=>w.type==='post'&&ready(w))),
      video:qty(works.filter(w=>w.type==='video'&&ready(w))),
      ongoing:qty(works.filter(w=>!ready(w))),
      sharedPost:shareQty(shares,'post'),sharedVideo:shareQty(shares,'video'),
      extraQty:extras.reduce((n,x)=>n+Number(x.quantity||0),0),
      shootVideos:shoots.reduce((n,x)=>n+Number(x.video_count||0),0),
      firmIds:relatedFirmIds(pid)
    };
  }

  function firmRowData(pid,fid,data){
    const f=firmRecord(fid), fm=monthFirmRecord(fid);
    const fw=fm?(state.works||[]).filter(w=>w.firm_month_id===fm.id&&w.assigned_to===pid):[];
    const shares=data.shares.filter(s=>{const w=(state.works||[]).find(x=>x.id===s.work_id);return workFirm(w)===fid;});
    const extras=data.extras.filter(x=>x.firm_id===fid);
    const shoots=data.shoots.filter(x=>x.firm_id===fid);
    const last=(state.activity||[]).find(a=>a.actor_id===pid&&a.firm_id===fid);
    return {
      f,fm,roles:roleList(pid,fid),works:fw,
      post:qty(fw.filter(w=>w.type==='post'&&ready(w))),video:qty(fw.filter(w=>w.type==='video'&&ready(w))),
      ongoing:qty(fw.filter(w=>!ready(w))),sharedPost:shareQty(shares,'post'),sharedVideo:shareQty(shares,'video'),
      extra:extras.reduce((n,x)=>n+Number(x.quantity||0),0),shootCount:shoots.length,shootVideos:shoots.reduce((n,x)=>n+Number(x.video_count||0),0),last
    };
  }

  function ensurePanel(){
    const reports=document.getElementById('reports'); if(!reports) return null;
    let panel=document.getElementById('reportPersonDetailV122');
    if(!panel){ panel=document.createElement('section'); panel.id='reportPersonDetailV122'; panel.className='panel report-person-detail-v122'; reports.appendChild(panel); }
    return panel;
  }
  function closePanel(){
    selectedPersonId=null;
    const panel=document.getElementById('reportPersonDetailV122'); if(panel){panel.style.display='none';panel.innerHTML='';}
    document.querySelectorAll('#reportPeople .report-row').forEach(r=>r.classList.remove('selected-report-person-v122'));
  }

  function renderDetail(pid,{scroll=false}={}){
    if(!isAdmin()) return closePanel();
    const data=personData(pid); if(!data) return closePanel();
    selectedPersonId=pid;
    const panel=ensurePanel(); if(!panel) return;
    const rows=data.firmIds.map((fid,i)=>{
      const r=firmRowData(pid,fid,data);
      const pkg=r.fm?`${Number(r.fm.post_quota||0)} P / ${Number(r.fm.video_quota||0)} V`:'—';
      const workTitles=r.works.length?r.works.slice(0,4).map(w=>`${esc(w.title||'İş')} (${Number(w.quantity||1)})`).join('<br>'):'<span class="muted">—</span>';
      return `<tr><td><span class="firm-no">${i+1}</span></td><td><b>${esc(r.f?.name||'—')}</b><small class="report-person-sub-v122">${esc(r.f?.sector||'')}</small></td><td>${r.roles.length?r.roles.map(x=>`<span class="report-person-chip-v122">${esc(x)}</span>`).join(' '):'<span class="muted">Geçmiş üretim</span>'}</td><td>${pkg}</td><td><b>${r.post} P / ${r.video} V</b>${r.ongoing?`<small class="report-person-sub-v122">${r.ongoing} devam/bekleyen</small>`:''}</td><td>${workTitles}</td><td><b>${r.sharedPost} P / ${r.sharedVideo} V</b></td><td>${r.extra}</td><td>${r.shootCount}${r.shootVideos?` çekim · ${r.shootVideos} video`:' çekim'}</td><td>${r.last?`${esc(r.last.description||'Hareket')}<small class="report-person-sub-v122">${formatDateTime(r.last.created_at)}</small>`:'—'}</td></tr>`;
    }).join('');
    const activities=(state.activity||[]).filter(a=>a.actor_id===pid&&typeof dateMonthISO==='function'&&dateMonthISO(a.created_at)===selectedMonth).slice(0,10);
    const avatar=data.p.avatar_url?`<img class="report-person-avatar-v122" src="${esc(data.p.avatar_url)}" alt="${esc(data.p.full_name)}">`:`<span class="report-person-avatar-v122 fallback">${esc(String(data.p.full_name||'?').charAt(0).toUpperCase())}</span>`;

    panel.style.display='block';
    panel.innerHTML=`<div class="report-person-head-v122"><div class="report-person-identity-v122">${avatar}<div><h3>${esc(data.p.full_name)}</h3><p>${esc(data.p.job_title||'Personel')} · ${prettyMonth(selectedMonth)} ayrıntılı raporu</p></div></div><div class="report-person-actions-v122"><button type="button" class="primary" id="printPersonReportV122">Yazdır</button><button type="button" class="ghost" id="closePersonReportV122">Kapat</button></div></div>
      <div class="report-person-stats-v122"><div><small>Sorumlu Firma</small><b>${data.assignedFirmCount}</b></div><div><small>Hazırladığı Post</small><b>${data.post}</b></div><div><small>Hazırladığı Video</small><b>${data.video}</b></div><div><small>Devam / Bekleyen</small><b>${data.ongoing}</b></div><div><small>Paylaştığı Post</small><b>${data.sharedPost}</b></div><div><small>Paylaştığı Video</small><b>${data.sharedVideo}</b></div><div><small>Ekstra İş</small><b>${data.extraQty}</b></div><div><small>Çekim</small><b>${data.shoots.length}</b><span>${data.shootVideos} video içeriği</span></div></div>
      <div class="report-person-section-title-v122"><div><h4>Firma Bazlı İş Takibi</h4><p>Seçili ayda bu personele ait firma ve üretim detayları</p></div><span>${data.firmIds.length} firma kaydı</span></div>
      <div class="table-wrap"><table><thead><tr><th>No</th><th>Firma</th><th>Sorumluluk</th><th>Paket</th><th>Hazırladığı</th><th>İşler</th><th>Paylaştığı</th><th>Ekstra</th><th>Çekim</th><th>Son Hareket</th></tr></thead><tbody>${rows||'<tr><td colspan="10" class="empty">Bu ay firma bazlı kayıt bulunmuyor.</td></tr>'}</tbody></table></div>
      <div class="report-person-activity-v122"><div class="report-person-section-title-v122"><div><h4>Son Hareketleri</h4><p>${prettyMonth(selectedMonth)} içindeki son işlemler</p></div></div>${activities.length?activities.map(a=>`<div class="report-person-activity-row-v122"><span class="dot"></span><div><b>${esc(a.description||'Hareket')}</b><small>${a.firm_id&&firmRecord(a.firm_id)?esc(firmRecord(a.firm_id).name):'Ajans / Genel'}</small></div><time>${formatDateTime(a.created_at)}</time></div>`).join(''):'<div class="empty">Bu ay hareket kaydı yok.</div>'}</div>`;
    document.getElementById('closePersonReportV122')?.addEventListener('click',closePanel);
    document.getElementById('printPersonReportV122')?.addEventListener('click',()=>printPerson(pid));
    document.querySelectorAll('#reportPeople .report-row').forEach(r=>r.classList.toggle('selected-report-person-v122',r.dataset.personId===pid));
    if(scroll) setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  function bindRows(){
    const box=document.getElementById('reportPeople'); if(!box||!isAdmin()) return;
    const profiles=activeProfiles();
    box.querySelectorAll('.report-row').forEach(row=>{
      const name=(row.querySelector('span')?.textContent||'').trim();
      const p=profiles.find(x=>String(x.full_name||'').trim()===name); if(!p) return;
      row.dataset.personId=p.id; row.classList.add('clickable-report-person-v122'); row.setAttribute('role','button'); row.setAttribute('tabindex','0'); row.title=`${p.full_name} ayrıntılı raporunu aç`;
      if(row.dataset.reportBoundV122!=='1'){
        row.dataset.reportBoundV122='1';
        const open=()=>{ if(selectedPersonId===p.id) closePanel(); else renderDetail(p.id,{scroll:true}); };
        row.addEventListener('click',open); row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
      }
      row.classList.toggle('selected-report-person-v122',selectedPersonId===p.id);
    });
  }

  function printPerson(pid){
    const data=personData(pid); if(!data) return;
    const rows=data.firmIds.map((fid,i)=>{
      const r=firmRowData(pid,fid,data), pkg=r.fm?`${Number(r.fm.post_quota||0)} P / ${Number(r.fm.video_quota||0)} V`:'—';
      const works=r.works.length?r.works.map(w=>`${esc(w.title||'İş')} (${Number(w.quantity||1)})`).join('<br>'):'—';
      return `<tr><td>${i+1}</td><td><b>${esc(r.f?.name||'—')}</b></td><td>${esc(r.roles.join(', ')||'—')}</td><td>${pkg}</td><td>${r.post} P / ${r.video} V${r.ongoing?`<br><small>${r.ongoing} devam/bekleyen</small>`:''}</td><td>${works}</td><td>${r.sharedPost} P / ${r.sharedVideo} V</td><td>${r.extra}</td><td>${r.shootCount} çekim / ${r.shootVideos} video</td></tr>`;
    }).join('');
    const win=window.open('','_blank','width=1200,height=800');
    if(!win){ if(typeof toast==='function') toast('Yazdırma penceresi engellendi. Tarayıcıda açılır pencerelere izin ver.',true); return; }
    win.document.open();
    win.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(data.p.full_name)} - ${esc(prettyMonth(selectedMonth))} Raporu</title><style>@page{size:A4 landscape;margin:11mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#151515;margin:0;font-size:10px}h1{font-size:20px;margin:0 0 3px}h2{font-size:14px;margin:18px 0 8px}.brand{border-bottom:3px solid #d8d52b;padding-bottom:10px;margin-bottom:14px}.muted{color:#666}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:12px 0}.summary div{border:1px solid #ccc;border-radius:7px;padding:8px}.summary small{display:block;color:#666;margin-bottom:4px}.summary b{font-size:16px}table{width:100%;border-collapse:collapse;table-layout:auto}th,td{border:1px solid #bbb;padding:6px;vertical-align:top;text-align:left}th{background:#f1f1f1;font-size:9px}td{font-size:9px}small{color:#666}.footer{margin-top:12px;color:#777;font-size:8px}.no-print{display:none}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="brand"><h1>Mind's Takip · Personel Aylık Raporu</h1><div><b>${esc(data.p.full_name)}</b> · ${esc(data.p.job_title||'Personel')} · ${esc(prettyMonth(selectedMonth))}</div></div><div class="summary"><div><small>Sorumlu Firma</small><b>${data.assignedFirmCount}</b></div><div><small>Hazırlanan Post / Video</small><b>${data.post} / ${data.video}</b></div><div><small>Paylaşılan Post / Video</small><b>${data.sharedPost} / ${data.sharedVideo}</b></div><div><small>Ekstra / Çekim</small><b>${data.extraQty} / ${data.shoots.length}</b></div></div><h2>Firma Bazlı İş Takibi</h2><table><thead><tr><th>No</th><th>Firma</th><th>Sorumluluk</th><th>Paket</th><th>Hazırladığı</th><th>İşler</th><th>Paylaştığı</th><th>Ekstra</th><th>Çekim</th></tr></thead><tbody>${rows||'<tr><td colspan="9">Kayıt yok.</td></tr>'}</tbody></table><div class="footer">Mind's Creative Agency · ${esc(prettyMonth(selectedMonth))} · Mind's Takip tarafından oluşturuldu.</div><script>window.onload=()=>setTimeout(()=>window.print(),180)<\/script></body></html>`);
    win.document.close();
  }

  function installStyles(){
    if(document.getElementById('reportPersonStyleV122')) return;
    const st=document.createElement('style'); st.id='reportPersonStyleV122'; st.textContent=`#reportPeople .report-row.clickable-report-person-v122{cursor:pointer;border-radius:8px;padding-left:8px;padding-right:8px;transition:background .15s ease,border-color .15s ease,transform .15s ease;position:relative}#reportPeople .report-row.clickable-report-person-v122:hover{background:#171d20;transform:translateX(2px)}#reportPeople .report-row.clickable-report-person-v122:after{content:'›';color:#737d83;font-size:18px;margin-left:10px}#reportPeople .report-row.selected-report-person-v122{background:rgba(235,233,60,.07);box-shadow:inset 2px 0 #ebe93c}#reportPeople .report-row.selected-report-person-v122:after{color:#ebe93c}.report-person-detail-v122{display:none;margin-top:14px;border-color:#343d42}.report-person-head-v122{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:12px}.report-person-identity-v122{display:flex;align-items:center;gap:12px}.report-person-identity-v122 h3{margin:0 0 3px;font-size:18px}.report-person-identity-v122 p{margin:0;color:#7f8b91}.report-person-avatar-v122{width:46px;height:46px;border-radius:50%;object-fit:cover;background:#20272c;border:1px solid #3a4449}.report-person-avatar-v122.fallback{display:grid;place-items:center;background:#ebe93c;color:#101416;font-weight:900}.report-person-actions-v122{display:flex;gap:7px}.report-person-stats-v122{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;margin:10px 0 15px}.report-person-stats-v122>div{background:#0d1317;border:1px solid #242d32;border-radius:9px;padding:9px}.report-person-stats-v122 small{display:block;color:#7f8b91;font-size:9px}.report-person-stats-v122 b{display:block;font-size:19px;margin-top:3px}.report-person-stats-v122 span{display:block;color:#8a969b;font-size:8px;margin-top:2px}.report-person-section-title-v122{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:12px 0 7px}.report-person-section-title-v122 h4{margin:0;font-size:14px}.report-person-section-title-v122 p{margin:2px 0 0;color:#77848a;font-size:9px}.report-person-section-title-v122>span{color:#b6b93a;font-size:9px}.report-person-sub-v122{display:block;color:#718087;font-size:8px;margin-top:3px}.report-person-chip-v122{display:inline-block;padding:3px 5px;border:1px solid #313a3f;border-radius:999px;font-size:8px;margin:1px}.report-person-activity-v122{border-top:1px solid #242d32;margin-top:12px;padding-top:2px}.report-person-activity-row-v122{display:grid;grid-template-columns:8px 1fr auto;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid #1f272b}.report-person-activity-row-v122 .dot{width:6px;height:6px;border-radius:50%;background:#ebe93c}.report-person-activity-row-v122 b{display:block;font-size:9px}.report-person-activity-row-v122 small{display:block;color:#748087;font-size:8px;margin-top:2px}.report-person-activity-row-v122 time{color:#69767c;font-size:8px}@media(max-width:1100px){.report-person-stats-v122{grid-template-columns:repeat(4,1fr)}}`;
    document.head.appendChild(st);
  }

  installStyles();
  const previousRenderReports=renderReports;
  renderReports=function(){ previousRenderReports(); setTimeout(()=>{bindRows();if(selectedPersonId)renderDetail(selectedPersonId);},0); };
  setTimeout(bindRows,180);
})();
