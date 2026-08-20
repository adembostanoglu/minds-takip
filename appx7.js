// V1.11 — live team dashboard + structured social media sharing
state.shares = state.shares || [];
let shareRealtimeReady = false;

function workFirmId(w){
  const fm = state.months.find(m=>m.id===w?.firm_month_id);
  return fm?.firm_id || null;
}
function monthShares(){ return (state.shares||[]).filter(s=>dateMonthISO(s.share_date)===selectedMonth); }
function sharesForWork(workId){ return (state.shares||[]).filter(s=>s.work_id===workId); }
function sharedQty(workOrId){ const id=typeof workOrId==='string'?workOrId:workOrId?.id; return sharesForWork(id).reduce((n,s)=>n+Number(s.quantity||0),0); }
function remainingToShare(w){ return Math.max(0,workQty(w)-sharedQty(w)); }
function platformLabel(v){ return ({instagram:'Instagram',facebook:'Facebook',tiktok:'TikTok',youtube:'YouTube',linkedin:'LinkedIn',diger:'Diğer'})[v]||v||'—'; }
function isSocialMediaForFirm(fid,personId=profile?.id){ return !!fid && state.assignments.some(a=>a.firm_id===fid && a.person_id===personId && a.responsibility==='sosyal_medya'); }
function isSocialMediaStaff(){ return !isAdmin() && state.assignments.some(a=>a.person_id===profile?.id && a.responsibility==='sosyal_medya'); }
function canShareWork(w){ return !!w && workReady(w) && (isAdmin() || isSocialMediaForFirm(workFirmId(w))); }
function canManageShare(s){ return !!s && (isAdmin() || (s.shared_by===profile?.id && s.created_by===profile?.id)); }
function socialPersonForWork(w){
  const fid=workFirmId(w);
  const a=state.assignments.find(x=>x.firm_id===fid && x.responsibility==='sosyal_medya' && person(x.person_id)?.active);
  return a?.person_id || profile?.id || '';
}
function shareState(w){
  const done=sharedQty(w), total=workQty(w);
  if(done>=total && total>0) return {key:'done',label:'Paylaşıldı',cls:'green'};
  if(done>0) return {key:'partial',label:'Kısmen Paylaşıldı',cls:'blue'};
  if(w?.share_status==='planlandi') return {key:'planned',label:'Planlandı',cls:'orange'};
  return {key:'none',label:'Paylaşılmadı',cls:'orange'};
}
function sharesByPerson(personId){ return monthShares().filter(s=>s.shared_by===personId); }
function sharesByWorkSet(workSet){ const ids=new Set(workSet.map(w=>w.id)); return monthShares().filter(s=>ids.has(s.work_id)); }
function sumSharesOfType(shares,type){
  return shares.reduce((sum,s)=>{
    const w=state.works.find(x=>x.id===s.work_id);
    return sum+(w?.type===type?Number(s.quantity||0):0);
  },0);
}

function friendlyError(err){
  const m=String(err?.message||err||'İşlem başarısız.');
  const map={
    historical_month_locked:'Geçmiş aylar otomatik olarak değiştirilemez.',
    admin_required:'Bu işlem için yönetici yetkisi gerekli.',
    share_work_not_found:'Paylaşılacak içerik bulunamadı.',
    share_work_not_ready:'Yalnızca Hazır veya Onaylandı durumundaki içerikler paylaşılabilir.',
    share_date_outside_work_month:'Paylaşım tarihi içerik paketinin bulunduğu ay içinde olmalı.',
    share_person_inactive:'Paylaşan personel aktif değil.',
    share_quantity_exceeds_work:'Paylaşım adedi hazırlanmış içerik adedini aşamaz.',
    work_quantity_below_shared:'İş adedi, daha önce paylaşılmış içerik adedinin altına düşürülemez.',
    shared_work_must_stay_ready:'Paylaşım kaydı bulunan içerik Hazır veya Onaylandı durumunda kalmalı.'
  };
  if(map[m]) return map[m];
  if(m.includes('share_quantity_exceeds_work')) return map.share_quantity_exceeds_work;
  if(m.includes('work_quantity_below_shared')) return map.work_quantity_below_shared;
  if(m.includes('shared_work_must_stay_ready')) return map.shared_work_must_stay_ready;
  if(m.includes('share_work_not_ready')) return map.share_work_not_ready;
  if(m.includes('share_date_outside_work_month')) return map.share_date_outside_work_month;
  if(m.includes('duplicate key')) return 'Bu kayıt zaten mevcut.';
  if(m.includes('invalid input syntax for type uuid')) return 'Personel veya firma seçimi geçersiz. Sayfayı yenileyip tekrar dene.';
  if(m.includes('violates foreign key constraint')) return 'Bu kayıt başka verilerle bağlantılı. İşlem güvenli biçimde tamamlanamadı.';
  if(m.includes('check constraint') && m.includes('video_count')) return 'Çekilen video içeriği en az 1 olmalı.';
  return m;
}

async function loadData({silent=false}={}){
  const results=await Promise.all([
    sb.from('profiles').select('*').order('created_at'),
    sb.from('firms').select('*').order('list_order_at'),
    sb.from('firm_months').select('*').order('month',{ascending:false}),
    sb.from('works').select('*').order('created_at',{ascending:false}),
    sb.from('extra_works').select('*').order('created_at',{ascending:false}),
    sb.from('shoots').select('*').order('shoot_date',{ascending:false}),
    sb.from('activity_log').select('*').order('created_at',{ascending:false}).limit(200),
    sb.from('firm_assignments').select('*'),
    sb.from('content_shares').select('*').order('share_date',{ascending:false}).order('created_at',{ascending:false})
  ]);
  const keys=['profiles','firms','months','works','extras','shoots','activity','assignments','shares'];
  let hadError=false;
  results.forEach((r,i)=>{ if(r.error){ hadError=true; console.warn(keys[i],r.error); } else state[keys[i]]=r.data||[]; });
  renderAll();
  applyRoleUI();
  if(hadError&&!silent) toast('Bazı veriler sunucudan alınamadı. Mevcut kayıtlar ekranda korundu; tekrar deneyebilirsin.',true);
  return !hadError;
}

function subscribeRealtime(){
  if(realtimeChannel) sb.removeChannel(realtimeChannel);
  realtimeChannel=sb.channel('minds-takip-live-v11');
  ['firms','firm_months','works','extra_works','shoots','content_shares','activity_log','profiles','firm_assignments'].forEach(table=>{
    realtimeChannel.on('postgres_changes',{event:'*',schema:'public',table},scheduleReload);
  });
  realtimeChannel.subscribe();
  shareRealtimeReady=true;
}

function applyRoleUI(){
  const admin=isAdmin(), social=isSocialMediaStaff();
  document.querySelectorAll('.admin-nav').forEach(x=>x.style.display=admin?'':'none');
  document.querySelectorAll('.admin-only').forEach(x=>x.style.display=admin?'':'none');
  const labels=admin
    ? {firms:'Firmalar',works:'İş Takibi',shares:'Paylaşım Takibi',activity:'Günlük Hareketler'}
    : {firms:'Firmalarım',works:'Görevlerim',shares:social?'Paylaşım Merkezi':'Paylaşım Bekleyenler',activity:'Günlük Hareketlerim'};
  Object.entries({firms:labels.firms,works:labels.works,shares:labels.shares,activity:labels.activity}).forEach(([view,text])=>{
    const s=document.querySelector(`.nav-item[data-view="${view}"] span`); if(s)s.textContent=text;
  });
  if(el('firmsTitle')) el('firmsTitle').textContent=labels.firms;
  if(el('firmsDesc')) el('firmsDesc').textContent=admin?'Firma, logo, aylık paket ve ekip sorumluları.':'Sana atanmış aktif firmalar.';
  if(el('worksTitle')) el('worksTitle').textContent=labels.works;
  if(el('worksDesc')) el('worksDesc').textContent=admin?'Paket dahilindeki post ve videolar.':'Sana atanmış veya senin oluşturduğun paket işleri.';
  if(el('sharesTitle')) el('sharesTitle').textContent=labels.shares;
  if(el('activityTitle')) el('activityTitle').textContent=labels.activity;
}

function setView(v){
  if(!isAdmin()&&ADMIN_VIEWS.has(v)) v='dashboard';
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active-view')); el(v).classList.add('active-view');
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===v));
  const social=isSocialMediaStaff();
  const names=isAdmin()?{dashboard:'Ana Panel',firms:'Firmalar',works:'İş Takibi',shares:'Paylaşım Takibi',extras:'Ekstra İşler',shoots:'Çekimler',team:'Ekip',activity:'Günlük Hareketler',reports:'Raporlar',archive:'Arşiv',settings:'Ayarlar'}:{dashboard:'Ana Panel',firms:'Firmalarım',works:'Görevlerim',shares:social?'Paylaşım Merkezi':'Paylaşım Bekleyenler',extras:'Ekstra İşler',shoots:'Çekimler',activity:'Günlük Hareketlerim'};
  el('pageTitle').textContent=names[v]||"Mind's Takip";
}

function shareScopeWorks(){
  const ws=monthWorks();
  if(isAdmin()) return ws;
  if(isSocialMediaStaff()) return ws.filter(w=>isSocialMediaForFirm(workFirmId(w)));
  return ws.filter(staffOwnWork);
}
function counts(){
  const allWs=monthWorks(), ownWs=isAdmin()?allWs:allWs.filter(staffOwnWork), ex=monthExtras(), sh=monthShoots();
  const waitingScope=shareScopeWorks().filter(workReady);
  const visibleShares=isAdmin()?monthShares():(isSocialMediaStaff()?sharesByPerson(profile.id):sharesByWorkSet(ownWs));
  return {
    post:sumWorkQty(ownWs.filter(w=>w.type==='post'&&workReady(w))),
    video:sumWorkQty(ownWs.filter(w=>w.type==='video'&&workReady(w))),
    waiting:waitingScope.reduce((n,w)=>n+remainingToShare(w),0),
    shared:visibleShares.reduce((n,s)=>n+Number(s.quantity||0),0),
    sharedPost:sumSharesOfType(visibleShares,'post'),
    sharedVideo:sumSharesOfType(visibleShares,'video'),
    extras:ex.reduce((s,x)=>s+x.quantity,0),
    staffExtras:ex.filter(x=>x.source==='staff').reduce((s,x)=>s+x.quantity,0),
    shootFirms:new Set(sh.map(x=>x.firm_id)).size,
    shootVideos:sh.reduce((sum,x)=>sum+(x.video_count||0),0)
  };
}
function firmMetrics(fid){
  const fm=currentFirmMonth(fid); if(!fm) return {post:0,video:0,shared:0,sharedPost:0,sharedVideo:0,sharePending:0,remaining:0,pq:0,vq:0};
  const ws=state.works.filter(w=>w.firm_month_id===fm.id), ids=new Set(ws.map(w=>w.id));
  const sh=monthShares().filter(s=>ids.has(s.work_id));
  const post=sumWorkQty(ws.filter(w=>w.type==='post'&&workReady(w)));
  const video=sumWorkQty(ws.filter(w=>w.type==='video'&&workReady(w)));
  const sharedPost=sumSharesOfType(sh,'post'), sharedVideo=sumSharesOfType(sh,'video');
  const sharePending=ws.filter(workReady).reduce((n,w)=>n+remainingToShare(w),0);
  return {post,video,shared:sharedPost+sharedVideo,sharedPost,sharedVideo,sharePending,remaining:Math.max(0,fm.post_quota-post)+Math.max(0,fm.video_quota-video),pq:fm.post_quota,vq:fm.video_quota};
}

function renderMonths(){
  const shareMonths=(state.shares||[]).map(s=>dateMonthISO(s.share_date)).filter(Boolean);
  const set=new Set([monthISO(),...state.months.map(m=>m.month),...state.extras.map(x=>x.month),...state.shoots.map(x=>x.month),...shareMonths]);
  el('monthPicker').innerHTML=[...set].sort().reverse().map(m=>`<option value="${m}" ${m===selectedMonth?'selected':''}>${prettyMonth(m)}</option>`).join('');
}
function renderStats(){
  const c=counts(), firmCount=selectedMonthFirms().length, social=isSocialMediaStaff();
  const vals=isAdmin()
    ? [[selectedMonth===monthISO()?'Aktif Firma':'Firma',firmCount],['Hazırlanan Post',c.post],['Hazırlanan Video',c.video],['Paylaşılan Post',c.sharedPost],['Paylaşılan Video',c.sharedVideo],['Paylaşım Bekleyen',c.waiting],['Personel Ekstrası',c.staffExtras],['Çekim Yapılan Firma',c.shootFirms],['Çekilen Video İçeriği',c.shootVideos]]
    : social
      ? [['Firmalarım',firmCount],['Hazırladığım Post',c.post],['Hazırladığım Video',c.video],['Paylaştığım Post',c.sharedPost],['Paylaştığım Video',c.sharedVideo],['Paylaşım Bekleyen',c.waiting],['Ekstra İşim',c.extras],['Çekim Yaptığım Firma',c.shootFirms],['Çektiğim Video İçeriği',c.shootVideos]]
      : [['Firmalarım',firmCount],['Hazırladığım Post',c.post],['Hazırladığım Video',c.video],['Paylaşım Bekleyen',c.waiting],['Ekstra İşim',c.extras],['Çekim Yaptığım Firma',c.shootFirms],['Çektiğim Video İçeriği',c.shootVideos]];
  el('stats').innerHTML=vals.map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value">${v}</div><div class="foot"><b>${prettyMonth(selectedMonth)}</b> verisi</div></div>`).join('');
}
function renderDashboardFirms(){
  const rows=selectedMonthFirms().map((f,i)=>{
    const m=firmMetrics(f.id), people=assignedPeople(f.id).map(x=>x.p.full_name).join(', ')||'—';
    const status=m.remaining===0?(m.sharePending===0?['Tamamlandı','green']:['Paylaşım Bekliyor','orange']):['Devam Ediyor','yellow'];
    return `<tr><td><span class="firm-no">${i+1}</span></td><td><div class="firm-cell">${firmLogo(f)}<b>${escapeHtml(f.name)}</b></div></td><td>${m.pq} Post / ${m.vq} Video</td><td>${m.post} P / ${m.video} V</td><td>${m.sharedPost} P / ${m.sharedVideo} V</td><td>${m.remaining}</td><td>${escapeHtml(people)}</td><td><span class="badge ${status[1]}">${status[0]}</span></td></tr>`;
  }).join('');
  el('dashboardFirmRows').innerHTML=rows||`<tr><td colspan="8" class="empty">Bu ay için firma kaydı yok.</td></tr>`;
}

function ensureTeamPulsePanel(){
  let panel=el('teamPulsePanel');
  if(!panel){
    panel=document.createElement('section'); panel.id='teamPulsePanel'; panel.className='panel team-pulse-panel admin-only';
    const content=el('dashboard').querySelector('.content-grid');
    el('dashboard').insertBefore(panel,content);
  }
  return panel;
}
function renderTeamPulse(){
  const panel=ensureTeamPulsePanel();
  if(!isAdmin()){ panel.style.display='none'; return; }
  panel.style.display='block';
  const ws=monthWorks(), ex=state.extras.filter(x=>x.month===selectedMonth), sh=state.shoots.filter(x=>x.month===selectedMonth), people=activeProfiles().filter(p=>p.role!=='admin');
  const cards=people.map(p=>{
    const pw=ws.filter(w=>w.assigned_to===p.id), pshares=sharesByPerson(p.id);
    const post=sumWorkQty(pw.filter(w=>w.type==='post'&&workReady(w))), video=sumWorkQty(pw.filter(w=>w.type==='video'&&workReady(w)));
    const sharedPost=sumSharesOfType(pshares,'post'), sharedVideo=sumSharesOfType(pshares,'video');
    const extra=ex.filter(x=>x.person_id===p.id).reduce((n,x)=>n+Number(x.quantity||0),0);
    const shoots=sh.filter(x=>x.responsible_id===p.id).length;
    const firms=new Set(state.assignments.filter(a=>a.person_id===p.id).map(a=>a.firm_id)).size;
    const last=state.activity.find(a=>a.actor_id===p.id);
    return `<article class="team-pulse-card"><div class="team-pulse-head"><div class="avatar accent">${escapeHtml((p.full_name||'?').charAt(0).toUpperCase())}</div><div><h4>${escapeHtml(p.full_name)}</h4><small>${escapeHtml(p.job_title||'Personel')}</small></div></div><div class="team-pulse-metrics"><div><small>Firma</small><b>${firms}</b></div><div><small>Post</small><b>${post}</b></div><div><small>Video</small><b>${video}</b></div><div><small>Paylaşım</small><b>${sharedPost+sharedVideo}</b></div><div><small>Ekstra</small><b>${extra}</b></div><div><small>Çekim</small><b>${shoots}</b></div></div><div class="team-pulse-share"><span>${sharedPost} Post paylaştı</span><span>${sharedVideo} Video paylaştı</span></div><div class="team-pulse-last"><b>Son hareket</b><span>${last?escapeHtml(last.description):'Henüz hareket yok'}</span><time>${last?formatDateTime(last.created_at):'—'}</time></div></article>`;
  }).join('');
  panel.innerHTML=`<div class="panel-head"><div><h3>Ekip Anlık Durumu</h3><p>${prettyMonth(selectedMonth)} · kim ne hazırladı, paylaştı ve yaptı</p></div></div><div class="team-pulse-grid">${cards||'<div class="empty">Aktif personel yok.</div>'}</div>`;
}

function renderFirms(){
  const make=(arr,passive=false)=>arr.map((f,i)=>{const m=firmMetrics(f.id), people=assignedPeople(f.id); return `<div class="firm-card ${passive?'passive-card':''}"><div class="firm-card-top"><span class="firm-order">${passive?'PASİF':String(i+1).padStart(2,'0')}</span><div class="card-actions">${isAdmin()?`<button class="small-primary" data-edit-firm="${f.id}">Düzenle</button><button class="small-danger" data-toggle-firm="${f.id}" data-active="${f.active}">${f.active?'Pasife Al':'Aktif Et'}</button><button class="small-danger" data-delete-firm="${f.id}">Kalıcı Sil</button>`:''}</div></div><div class="firm-card-head">${firmLogo(f)}<div><h3>${escapeHtml(f.name)}</h3><div class="muted">${escapeHtml(f.sector||'')}</div></div></div><div class="metric-four"><div class="mini"><small>Post</small><b>${m.post}/${m.pq}</b></div><div class="mini"><small>Video</small><b>${m.video}/${m.vq}</b></div><div class="mini"><small>Paylaşılan</small><b>${m.sharedPost}P / ${m.sharedVideo}V</b></div><div class="mini"><small>Paylaşım Bekleyen</small><b>${m.sharePending}</b></div></div><div class="pill-row">${people.length?people.map(x=>`<span class="pill">${escapeHtml(x.p.full_name)} · ${escapeHtml(({ana_sorumlu:'Ana Sorumlu',tasarim:'Tasarım',video:'Video',sosyal_medya:'Sosyal Medya',diger:'Diğer'})[x.a.responsibility])}</span>`).join(''):'<span class="pill">Sorumlu atanmadı</span>'}</div></div>`}).join('');
  el('firmCards').innerHTML=make(activeFirms())||'<div class="empty">Henüz aktif firma yok.</div>';
  if(isAdmin()) el('passiveFirmCards').innerHTML=make(state.firms.filter(f=>!f.active),true)||'<div class="empty">Pasif firma yok.</div>'; else el('passiveFirmCards').innerHTML='';
}

function renderWorks(){
  const ws=monthWorks().filter(w=>isAdmin()||staffOwnWork(w));
  el('workRows').innerHTML=ws.map(w=>{
    const fm=state.months.find(m=>m.id===w.firm_month_id), f=fm?firm(fm.firm_id):null, q=workQty(w), sq=sharedQty(w), ss=shareState(w);
    return `<tr><td>${escapeHtml(f?.name||'—')}</td><td><b>${escapeHtml(w.title)}</b>${q>1?`<div class="muted">${q} adet</div>`:''}</td><td>${typeLabel(w.type)} · ${q}</td><td><span class="badge yellow">${workStatusLabel(w.status)}</span></td><td><span class="badge ${ss.cls}">${ss.label}</span><div class="muted share-progress-text">${sq}/${q} paylaşıldı</div></td><td>${escapeHtml(personName(w.assigned_to))}</td><td>${formatDate(w.work_date)}</td><td>${actionButtons('work',w.id,canManageWork(w))}</td></tr>`;
  }).join('')||'<tr><td colspan="8" class="empty">Bu ay sana atanmış paket işi yok.</td></tr>';
}

function ensureShareTopButton(){
  const sec=el('shares'), actions=sec?.querySelector('.section-actions'); if(!actions) return;
  let btn=el('addShareBtnV11');
  if(!btn){ btn=document.createElement('button'); btn.id='addShareBtnV11'; btn.className='primary'; btn.textContent='+ Paylaşım Gir'; actions.appendChild(btn); btn.onclick=()=>openShareModal(); }
  btn.style.display=(isAdmin()||isSocialMediaStaff())?'':'none';
  const p=actions.querySelector('p'); if(p) p.textContent='Hazırlanan içeriklerin paylaşım durumunu, platformunu ve paylaşan personeli takip et.';
}
function renderShares(){
  ensureShareTopButton();
  const pending=monthWorks().filter(w=>workReady(w)&&remainingToShare(w)>0);
  const history=monthShares().slice().sort((a,b)=>String(b.share_date).localeCompare(String(a.share_date))||String(b.created_at).localeCompare(String(a.created_at)));
  const sharedPost=sumSharesOfType(history,'post'), sharedVideo=sumSharesOfType(history,'video'), waiting=pending.reduce((n,w)=>n+remainingToShare(w),0);
  el('shareCards').className='share-hub';
  const pendingHtml=pending.map(w=>{
    const f=firm(workFirmId(w)), q=workQty(w), done=sharedQty(w), left=remainingToShare(w), can=canShareWork(w);
    return `<div class="share-pending-card"><div class="share-pending-top"><span class="badge ${done?'blue':'orange'}">${done?`${done}/${q} Paylaşıldı`:'Bekliyor'}</span><b>${left} adet kaldı</b></div><h3>${escapeHtml(f?.name||'—')}</h3><p>${escapeHtml(w.title)}</p><div class="muted">${typeLabel(w.type)} · Hazırlayan: ${escapeHtml(personName(w.assigned_to))}</div>${can?`<div class="card-bottom"><button class="small-primary" data-share-work-v11="${w.id}">Paylaşım Gir</button></div>`:''}</div>`;
  }).join('')||'<div class="empty">Paylaşım bekleyen içerik yok.</div>';
  const historyRows=history.map(s=>{
    const w=state.works.find(x=>x.id===s.work_id), f=firm(workFirmId(w));
    return `<tr><td>${formatDate(s.share_date)}</td><td>${escapeHtml(f?.name||'—')}</td><td><b>${escapeHtml(w?.title||'—')}</b></td><td>${typeLabel(w?.type)} · ${s.quantity}</td><td>${platformLabel(s.platform)}</td><td>${escapeHtml(personName(s.shared_by))}</td><td>${escapeHtml(s.notes||'—')}</td><td>${canManageShare(s)?`<div class="row-actions"><button class="small-primary" data-edit-share-v11="${s.id}">Güncelle</button><button class="small-danger" data-delete-share-v11="${s.id}">Sil</button></div>`:'—'}</td></tr>`;
  }).join('')||'<tr><td colspan="8" class="empty">Bu ay henüz paylaşım kaydı yok.</td></tr>';
  el('shareCards').innerHTML=`<div class="share-summary-grid"><div class="stat"><div class="label">Paylaşılan Post</div><div class="value">${sharedPost}</div></div><div class="stat"><div class="label">Paylaşılan Video</div><div class="value">${sharedVideo}</div></div><div class="stat"><div class="label">Paylaşım Bekleyen</div><div class="value">${waiting}</div></div></div><section class="panel"><div class="panel-head"><div><h3>Paylaşım Bekleyenler</h3><p>Hazır veya onaylanmış fakat tamamı paylaşılmamış içerikler</p></div></div><div class="share-pending-grid">${pendingHtml}</div></section><section class="panel"><div class="panel-head"><div><h3>Paylaşım Geçmişi</h3><p>Hangi firma, hangi içerik, kim, ne zaman ve nerede paylaştı</p></div></div><div class="table-wrap"><table><thead><tr><th>Tarih</th><th>Firma</th><th>İçerik</th><th>Tür / Adet</th><th>Platform</th><th>Paylaşan</th><th>Not</th><th>İşlem</th></tr></thead><tbody>${historyRows}</tbody></table></div></section>`;
}

function openShareModal(s=null,presetWorkId=null){
  if(s && !canManageShare(s)) return toast('Bu paylaşımı düzenleme yetkin yok.',true);
  let available=monthWorks().filter(w=>workReady(w)&&canShareWork(w)&&(remainingToShare(w)>0 || w.id===s?.work_id));
  if(presetWorkId){ const w=state.works.find(x=>x.id===presetWorkId); if(w&&!available.some(x=>x.id===w.id)&&canShareWork(w)) available=[w,...available]; }
  if(!available.length) return toast('Paylaşım girişi yapılabilecek hazır içerik yok.',true);
  const selectedWork=state.works.find(w=>w.id===(s?.work_id||presetWorkId))||available[0];
  const defaultPerson=s?.shared_by || socialPersonForWork(selectedWork);
  const maxFor=(w)=>Math.max(1,remainingToShare(w)+(s?.work_id===w.id?Number(s.quantity||0):0));
  openModal(s?'Paylaşımı Güncelle':'Yeni Paylaşım',`<div class="form-grid"><div class="field full"><label>Firma / İçerik</label><select name="work" id="shareWorkSelect" required>${available.map(w=>{const f=firm(workFirmId(w));return `<option value="${w.id}" ${w.id===selectedWork.id?'selected':''}>${escapeHtml(f?.name||'—')} · ${escapeHtml(w.title)} · ${typeLabel(w.type)} · kalan ${maxFor(w)}</option>`}).join('')}</select></div><div class="field"><label>Adet</label><input id="shareQtyInput" name="qty" type="number" min="1" max="${maxFor(selectedWork)}" step="1" required value="${s?.quantity??1}"><div class="field-help">Hazırlanan adetten fazla paylaşım girilemez.</div></div><div class="field"><label>Platform</label><select name="platform">${['instagram','facebook','tiktok','youtube','linkedin','diger'].map(p=>`<option value="${p}" ${(s?.platform||'instagram')===p?'selected':''}>${platformLabel(p)}</option>`).join('')}</select></div><div class="field"><label>Paylaşım Tarihi</label><input name="date" type="date" required value="${s?.share_date||defaultDateForSelectedMonth()}"></div>${isAdmin()?`<div class="field"><label>Paylaşan Personel</label><select name="person">${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===defaultPerson?'selected':''}>${escapeHtml(p.full_name)}</option>`).join('')}</select></div>`:`<div class="field"><label>Paylaşan Personel</label><input value="${escapeHtml(profile.full_name)}" disabled><input type="hidden" name="person" value="${profile.id}"></div>`}<div class="field full"><label>Not</label><textarea name="notes" placeholder="İçerik veya paylaşım notu...">${escapeHtml(s?.notes||'')}</textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div></div>`,async fd=>{
    const workId=fd.get('work'), w=state.works.find(x=>x.id===workId); if(!w) throw new Error('Paylaşılacak içerik bulunamadı.');
    if(!canShareWork(w)&&!isAdmin()) throw new Error('Bu firma için paylaşım yetkin yok.');
    assertSelectedMonthDate(fd.get('date'),'Paylaşım tarihi');
    const qty=Number(fd.get('qty')); if(!Number.isInteger(qty)||qty<1) throw new Error('Paylaşım adedi en az 1 olmalı.');
    const payload={work_id:workId,quantity:qty,platform:fd.get('platform'),share_date:fd.get('date'),shared_by:fd.get('person')||profile.id,notes:String(fd.get('notes')||'').trim()||null};
    if(s){ const {error}=await sb.from('content_shares').update(payload).eq('id',s.id); if(error) throw error; }
    else { payload.created_by=profile.id; const {error}=await sb.from('content_shares').insert(payload); if(error) throw error; }
  });
  setTimeout(()=>{
    const sel=el('shareWorkSelect'), qty=el('shareQtyInput');
    if(sel&&qty) sel.onchange=()=>{const w=state.works.find(x=>x.id===sel.value); const max=w?maxFor(w):1; qty.max=String(max); if(Number(qty.value)>max) qty.value=String(max);};
  },0);
}

function openWorkModal(w=null){
  const fm=w?state.months.find(m=>m.id===w.firm_month_id):null;
  let available=activeFirms().filter(f=>!!currentFirmMonth(f.id));
  if(w&&fm){ const oldFirm=firm(fm.firm_id); if(oldFirm&&!available.some(f=>f.id===oldFirm.id)) available=[oldFirm,...available]; }
  if(!available.length) return toast('Önce firma ve aylık paket oluşturulmalı.',true);
  const alreadyShared=w?sharedQty(w):0, shareInfo=w?shareState(w):null;
  const typeField=alreadyShared>0?`<div class="field"><label>Tür</label><input value="${typeLabel(w.type)}" disabled><input type="hidden" name="type" value="${w.type}"><div class="field-help">Paylaşım kaydı olduğu için tür değiştirilemez.</div></div>`:`<div class="field"><label>Tür</label><select name="type"><option value="post" ${w?.type==='post'?'selected':''}>Post</option><option value="video" ${w?.type==='video'?'selected':''}>Video</option></select></div>`;
  const shareField=alreadyShared>0?`<div class="field"><label>Paylaşım</label><input value="${shareInfo.label} · ${alreadyShared}/${workQty(w)}" disabled><div class="field-help">Paylaşım değişiklikleri Paylaşım Takibi bölümünden yapılır.</div></div>`:`<div class="field"><label>Paylaşım Planı</label><select name="share"><option value="paylasilmadi" ${w?.share_status!=='planlandi'?'selected':''}>Paylaşılmadı</option><option value="planlandi" ${w?.share_status==='planlandi'?'selected':''}>Planlandı</option></select></div>`;
  const responsible=w?.assigned_to||profile.id;
  openModal(w?'İşi Güncelle':'Yeni Paket İşi',`<div class="form-grid"><div class="field full"><label>Firma</label><select name="firm" required ${w?'disabled':''}>${available.map(f=>`<option value="${f.id}" ${(fm?.firm_id===f.id)?'selected':''}>${escapeHtml(f.name)}</option>`).join('')}</select></div><div class="field full"><label>İş Başlığı</label><input name="title" required value="${escapeHtml(w?.title||'')}"></div>${typeField}<div class="field"><label>Adet</label><input name="quantity" type="number" min="${Math.max(1,alreadyShared)}" step="1" required value="${workQty(w)}"><div class="field-help">${alreadyShared>0?`En az ${alreadyShared}; bu kadar içerik zaten paylaşıldı.`:'Bu kayıt kaç içerik temsil ediyor?'}</div></div>${isAdmin()?`<div class="field"><label>Sorumlu</label><select name="person"><option value="">Seçilmedi</option>${peopleOptions(responsible)}</select></div>`:`<div class="field"><label>Sorumlu</label><input value="${escapeHtml(personName(responsible))}" disabled><input type="hidden" name="person" value="${responsible}"></div>`}<div class="field"><label>Hazırlık</label><select name="status">${['bekliyor','devam_ediyor','hazir','revizede','onaylandi'].map(x=>`<option value="${x}" ${w?.status===x?'selected':''}>${workStatusLabel(x)}</option>`).join('')}</select></div>${shareField}<div class="field"><label>Tarih</label><input type="date" name="date" value="${w?.work_date||defaultDateForSelectedMonth()}"></div><div class="field full"><label>Not</label><textarea name="notes">${escapeHtml(w?.notes||'')}</textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary">Kaydet</button></div></div>`,async fd=>{
    const fid=w?fm.firm_id:fd.get('firm'), month=currentFirmMonth(fid); if(!month) throw new Error('Bu firma için seçili ay paketi yok.');
    assertSelectedMonthDate(fd.get('date'),'İş tarihi');
    const quantity=Number(fd.get('quantity')); if(!Number.isInteger(quantity)||quantity<1) throw new Error('İş adedi en az 1 olmalı.');
    const payload={title:String(fd.get('title')||'').trim(),type:fd.get('type'),quantity,status:fd.get('status'),assigned_to:fd.get('person')||null,work_date:fd.get('date'),notes:String(fd.get('notes')||'').trim()||null};
    if(alreadyShared===0){ payload.share_status=fd.get('share')||'paylasilmadi'; payload.shared_date=null; }
    if(w){ const {error}=await sb.from('works').update(payload).eq('id',w.id); if(error) throw error; }
    else { payload.firm_month_id=month.id; payload.created_by=profile.id; const {error}=await sb.from('works').insert(payload); if(error) throw error; }
  });
}

function renderReports(){
  if(!isAdmin()) return;
  const c=counts(), ws=monthWorks(), ex=state.extras.filter(x=>x.month===selectedMonth), sh=state.shoots.filter(x=>x.month===selectedMonth), packageTotal=sumWorkQty(ws);
  const vals=[['Paket İçeriği',packageTotal],['Paylaşılan Post',c.sharedPost],['Paylaşılan Video',c.sharedVideo],['Paylaşım Bekleyen',c.waiting],['Ekstra İş',ex.reduce((n,x)=>n+Number(x.quantity||0),0)],['Çekim Yapılan Firma',new Set(sh.map(x=>x.firm_id)).size],['Çekilen Video İçeriği',sh.reduce((n,x)=>n+Number(x.video_count||0),0)]];
  el('reportStats').innerHTML=vals.map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value">${v}</div></div>`).join('');
  el('reportBreakdown').innerHTML=`<div class="report-row"><span>Hazırlanan paket içeriği</span><span>${sumWorkQty(ws.filter(workReady))}</span></div><div class="report-row"><span>Paylaşılan toplam içerik</span><span>${c.sharedPost+c.sharedVideo}</span></div><div class="report-row"><span>Paylaşım bekleyen</span><span>${c.waiting}</span></div><div class="report-row"><span>Firma ekstra işleri</span><span>${ex.filter(x=>x.kind==='firma').reduce((s,x)=>s+x.quantity,0)}</span></div><div class="report-row"><span>Ajans içi ekstra işler</span><span>${ex.filter(x=>x.kind==='ajans').reduce((s,x)=>s+x.quantity,0)}</span></div>`;
  el('reportPeople').innerHTML=activeProfiles().filter(p=>p.role!=='admin').map(p=>{const pw=ws.filter(w=>w.assigned_to===p.id), ps=sharesByPerson(p.id), pe=ex.filter(x=>x.person_id===p.id).reduce((n,x)=>n+Number(x.quantity||0),0);return `<div class="report-row"><span>${escapeHtml(p.full_name)}</span><span>${sumWorkQty(pw.filter(workReady))} hazır · ${ps.reduce((n,x)=>n+Number(x.quantity||0),0)} paylaşım · ${pe} ekstra</span></div>`}).join('');
}

function renderArchive(){
  const shareMonths=(state.shares||[]).map(s=>dateMonthISO(s.share_date)).filter(Boolean);
  const ms=[...new Set([...state.months.map(m=>m.month),...state.shoots.map(x=>x.month),...state.extras.map(x=>x.month),...shareMonths])].sort().reverse();
  el('archiveCards').innerHTML=ms.map(m=>{
    const ids=new Set(state.months.filter(x=>x.month===m).map(x=>x.id));
    const ws=state.works.filter(w=>ids.has(w.firm_month_id)), ex=state.extras.filter(x=>x.month===m), sh=state.shoots.filter(x=>x.month===m), ss=(state.shares||[]).filter(s=>dateMonthISO(s.share_date)===m);
    return `<div class="archive-card"><h3>${prettyMonth(m)}</h3><div class="metric-four"><div class="mini"><small>Firma</small><b>${new Set(state.months.filter(x=>x.month===m).map(x=>x.firm_id)).size}</b></div><div class="mini"><small>Hazır İçerik</small><b>${sumWorkQty(ws.filter(workReady))}</b></div><div class="mini"><small>Paylaşım</small><b>${ss.reduce((n,x)=>n+Number(x.quantity||0),0)}</b></div><div class="mini"><small>Ekstra</small><b>${ex.reduce((n,x)=>n+Number(x.quantity||0),0)}</b></div></div><div class="muted archive-extra">${sh.length} çekim · ${sh.reduce((n,x)=>n+Number(x.video_count||0),0)} video içeriği çekildi</div></div>`;
  }).join('')||'<div class="empty">Arşiv kaydı yok.</div>';
}

function renderAll(){
  renderMonths(); renderStats(); renderTeamPulse(); renderDashboardFirms(); renderFirms(); renderWorks(); renderShares(); renderExtras(); renderShoots(); renderTeam(); renderActivity(); renderReports(); renderArchive();
}

function installV11Styles(){
  if(el('v11Style')) return;
  const st=document.createElement('style'); st.id='v11Style'; st.textContent=`
    .team-pulse-panel{margin:16px 0}.team-pulse-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:12px}.team-pulse-card{background:#0d1216;border:1px solid #242c31;border-radius:14px;padding:15px}.team-pulse-head{display:flex;align-items:center;gap:10px}.team-pulse-head h4{margin:0;font-size:13px}.team-pulse-head small{display:block;color:var(--muted);margin-top:3px}.team-pulse-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:13px}.team-pulse-metrics>div{background:#11171b;border:1px solid #222a30;border-radius:9px;padding:8px}.team-pulse-metrics small{display:block;color:var(--muted);font-size:9px}.team-pulse-metrics b{display:block;margin-top:4px;font-size:16px}.team-pulse-share{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.team-pulse-share span{font-size:9px;background:#171b0b;border:1px solid #3f4216;color:var(--accent);border-radius:999px;padding:5px 7px}.team-pulse-last{display:grid;grid-template-columns:1fr auto;gap:3px 8px;margin-top:12px;padding-top:10px;border-top:1px solid #20272c}.team-pulse-last b{grid-column:1/-1;font-size:9px;color:var(--muted);text-transform:uppercase}.team-pulse-last span{font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.team-pulse-last time{font-size:9px;color:#717a80}.share-hub{display:flex;flex-direction:column;gap:14px}.share-summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.share-pending-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}.share-pending-card{background:#0d1216;border:1px solid #252d32;border-radius:13px;padding:15px}.share-pending-card h3{margin:12px 0 5px;font-size:13px}.share-pending-card p{margin:0 0 6px}.share-pending-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.share-pending-top>b{font-size:10px;color:var(--accent)}.share-progress-text{font-size:9px;margin-top:4px}.archive-extra{margin-top:12px;font-size:10px}.badge.blue{background:#15263c;color:#7fafff}@media(max-width:760px){.share-summary-grid{grid-template-columns:1fr}.team-pulse-grid{grid-template-columns:1fr}}
  `; document.head.appendChild(st);
}

document.addEventListener('click',async e=>{
  const open=e.target.closest('[data-share-work-v11]'); if(open){ openShareModal(null,open.dataset.shareWorkV11); return; }
  const edit=e.target.closest('[data-edit-share-v11]'); if(edit){ const s=(state.shares||[]).find(x=>x.id===edit.dataset.editShareV11); if(s) openShareModal(s); return; }
  const del=e.target.closest('[data-delete-share-v11]'); if(del){ const s=(state.shares||[]).find(x=>x.id===del.dataset.deleteShareV11); if(!canManageShare(s)) return toast('Bu paylaşımı silme yetkin yok.',true); await deleteRecord('content_shares',s.id,'Paylaşım kaydı'); return; }
});

installV11Styles();
setTimeout(async()=>{
  if(!profile) return;
  try{ await loadData({silent:true}); subscribeRealtime(); applyRoleUI(); const s=el('settings')?.querySelector('.settings-list span'); if(s) s.textContent="Mind's Takip V1.11"; }
  catch(e){ console.warn('V1.11 init',e); }
},80);
