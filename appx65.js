// V1.21.6 — Operasyon merkezi: dikkat gerekenler, sistem sağlığı, kalıcı personel bildirimleri ve ekstra iş kayıt geçmişi.
(function bootOperationsHubV216(){
  if(window.__mindsOperationsHubV216)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof state==='undefined'){
    setTimeout(bootOperationsHubV216,160);return;
  }
  window.__mindsOperationsHubV216=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  let notifications=[];
  let notificationChannel=null;
  let lastGeneratedAt=0;
  let attentionBusy=false;

  function installStyles(){
    if(document.getElementById('opsHubV216Style'))return;
    const s=document.createElement('style');s.id='opsHubV216Style';s.textContent=`
      .top-actions{position:relative}
      .ops-notify-btn-v216{position:relative;width:40px;height:40px;display:grid;place-items:center;border:1px solid #39434a;border-radius:10px;background:#151c20;color:#eef2f3;font-size:17px;cursor:pointer}
      .ops-notify-btn-v216:hover{border-color:#6a6423;background:#1d1e14}.ops-notify-count-v216{position:absolute;right:-5px;top:-6px;min-width:19px;height:19px;padding:0 5px;border-radius:999px;display:grid;place-items:center;background:#d7524c;color:white;font-size:9px;font-weight:900;border:2px solid #0f1518}.ops-notify-count-v216.hidden{display:none}
      .ops-notify-panel-v216{position:fixed;right:22px;top:68px;width:min(410px,calc(100vw - 24px));max-height:72vh;overflow:hidden;z-index:9988;border:1px solid #354047;border-radius:14px;background:#0e1519;box-shadow:0 22px 60px rgba(0,0,0,.52);display:none}.ops-notify-panel-v216.open{display:block}
      .ops-notify-head-v216{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 15px;border-bottom:1px solid #29343a;background:#121a1e}.ops-notify-head-v216 b{font-size:14px;color:#f1f4f5}.ops-notify-head-v216 button{border:0;background:transparent;color:#d7d15b;font-size:10px;font-weight:800;cursor:pointer}
      .ops-notify-list-v216{max-height:calc(72vh - 55px);overflow:auto}.ops-notify-item-v216{display:grid;grid-template-columns:31px minmax(0,1fr);gap:10px;padding:12px 14px;border-bottom:1px solid #222c31;cursor:pointer;background:#0f161a}.ops-notify-item-v216:hover{background:#151d21}.ops-notify-item-v216.unread{background:#171b13}.ops-notify-item-v216 .ico{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#1f292f;font-size:13px}.ops-notify-item-v216.unread .ico{background:#2b2a12;color:#ece52c}.ops-notify-item-v216 b{display:block;font-size:11.5px;color:#eef2f3;margin-bottom:3px}.ops-notify-item-v216 p{margin:0;color:#9ca7ac;font-size:10px;line-height:1.45}.ops-notify-item-v216 time{display:block;margin-top:5px;color:#66747b;font-size:8.5px}.ops-notify-empty-v216{padding:28px;text-align:center;color:#7d8a90;font-size:11px}
      #opsAttentionV216{margin:0 0 15px;border:1px solid #2c373d;border-radius:14px;background:#0f161a;overflow:hidden}.ops-att-head-v216{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid #29343a;background:linear-gradient(180deg,#151d21,#11181c)}.ops-att-head-v216 h3{margin:0;color:#f0f3f4;font-size:15px}.ops-att-head-v216 p{margin:4px 0 0;color:#849198;font-size:10.5px}.ops-att-refresh-v216{border:1px solid #414c52;border-radius:8px;background:#161e22;color:#cbd3d6;padding:7px 9px;font-size:9px;font-weight:800;cursor:pointer}
      .ops-att-body-v216{padding:12px 14px 14px}.ops-att-grid-v216{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:9px}.ops-att-item-v216{border:1px solid #334047;border-radius:10px;background:#121a1e;padding:11px 12px;cursor:pointer;min-height:76px}.ops-att-item-v216:hover{transform:translateY(-1px);border-color:#59656b}.ops-att-item-v216 .top{display:flex;align-items:center;justify-content:space-between;gap:8px}.ops-att-item-v216 b{font-size:11.5px;color:#edf1f2}.ops-att-item-v216 .count{font-size:16px;font-weight:900;color:#e8df38}.ops-att-item-v216 p{font-size:9.5px;color:#89969c;line-height:1.45;margin:6px 0 0}.ops-att-item-v216.danger{border-color:#673a37;background:#211617}.ops-att-item-v216.danger .count{color:#ed8178}.ops-att-item-v216.warning{border-color:#665523;background:#211e12}.ops-att-item-v216.warning .count{color:#dfc65f}.ops-att-item-v216.review{border-color:#5b4270;background:#211728}.ops-att-item-v216.review .count{color:#c49adc}.ops-att-item-v216.duty{border-color:#4e5125;background:#1c1e12}.ops-att-item-v216.info{border-color:#31556b;background:#121f28}.ops-att-item-v216.info .count{color:#77b6dc}
      .ops-health-v216{margin-top:11px;padding-top:11px;border-top:1px solid #283238}.ops-health-title-v216{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:900;color:#adb7bb;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px}.ops-health-ok-v216{border:1px solid #315a3c;background:#14241a;color:#8dd09a;border-radius:9px;padding:10px 11px;font-size:10.5px;font-weight:750}.ops-health-list-v216{display:flex;gap:7px;flex-wrap:wrap}.ops-health-chip-v216{border:1px solid #5f4728;background:#251c13;color:#dcb476;border-radius:9px;padding:8px 9px;font-size:9.5px;cursor:pointer}.ops-health-chip-v216.danger{border-color:#6d3734;background:#251515;color:#eb8b84}
      .extra-history-btn-v216{border:1px solid #414b50!important;background:#151c20!important;color:#bdc6ca!important}.ops-history-list-v216{display:grid;gap:8px}.ops-history-row-v216{border:1px solid #303b41;border-radius:10px;background:#11191d;padding:11px 12px}.ops-history-row-v216 b{font-size:11px;color:#edf1f2}.ops-history-row-v216 p{margin:5px 0 0;color:#909da3;font-size:9.5px;line-height:1.45}.ops-history-row-v216 time{display:block;margin-top:5px;color:#68767d;font-size:8.5px}
      @media(max-width:760px){.ops-notify-panel-v216{right:12px;top:62px}.ops-att-grid-v216{grid-template-columns:1fr}.ops-att-head-v216{align-items:flex-start}.ops-att-refresh-v216{flex:0 0 auto}}
    `;document.head.appendChild(s);
  }

  function localDateTime(v){
    if(!v)return '—';
    try{return new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v));}catch(_e){return String(v);}
  }
  function notificationIcon(type){return ({task:'✦',review:'◎',success:'✓',warning:'!',danger:'!',shoot:'◉',duty:'◷',info:'i'})[type]||'•';}

  function ensureNotificationUi(){
    const actions=document.querySelector('.top-actions');if(!actions)return;
    let btn=document.getElementById('opsNotifyBtnV216');
    if(!btn){
      btn=document.createElement('button');btn.type='button';btn.id='opsNotifyBtnV216';btn.className='ops-notify-btn-v216';btn.title='Bildirimler';btn.innerHTML='♢<span id="opsNotifyCountV216" class="ops-notify-count-v216 hidden">0</span>';
      actions.insertBefore(btn,actions.querySelector('#logoutBtn')||null);
    }
    let panel=document.getElementById('opsNotifyPanelV216');
    if(!panel){panel=document.createElement('div');panel.id='opsNotifyPanelV216';panel.className='ops-notify-panel-v216';panel.innerHTML='<div class="ops-notify-head-v216"><b>Bildirimler</b><button type="button" data-ops-read-all="1">Tümünü okundu yap</button></div><div id="opsNotifyListV216" class="ops-notify-list-v216"></div>';document.body.appendChild(panel);}
  }

  function renderNotifications(){
    ensureNotificationUi();
    const unread=notifications.filter(x=>!x.read_at).length,badge=document.getElementById('opsNotifyCountV216');
    if(badge){badge.textContent=unread>99?'99+':String(unread);badge.classList.toggle('hidden',unread===0);}
    const list=document.getElementById('opsNotifyListV216');if(!list)return;
    list.innerHTML=notifications.length?notifications.map(n=>`<div class="ops-notify-item-v216 ${n.read_at?'':'unread'}" data-ops-notification="${n.id}" data-ops-view="${esc(n.view_name||'')}"><div class="ico">${notificationIcon(n.type)}</div><div><b>${esc(n.title)}</b>${n.body?`<p>${esc(n.body)}</p>`:''}<time>${esc(localDateTime(n.created_at))}</time></div></div>`).join(''):'<div class="ops-notify-empty-v216">Henüz bildirimin yok.</div>';
  }

  async function generateDueNotifications(force=false){
    if(!force&&Date.now()-lastGeneratedAt<10*60*1000)return;
    lastGeneratedAt=Date.now();
    try{await sb.rpc('ensure_due_notifications');}catch(e){console.warn('Bildirim hatırlatıcıları hazırlanamadı',e);}
  }
  async function loadNotifications(){
    try{
      await generateDueNotifications();
      const {data,error}=await sb.from('app_notifications').select('*').order('created_at',{ascending:false}).limit(50);
      if(error)throw error;notifications=data||[];renderNotifications();
    }catch(e){console.warn('Bildirimler yüklenemedi',e);}
  }
  async function markRead(id){
    const n=notifications.find(x=>x.id===id);if(!n||n.read_at)return;
    const at=new Date().toISOString();n.read_at=at;renderNotifications();
    const {error}=await sb.from('app_notifications').update({read_at:at}).eq('id',id);if(error)console.warn('Bildirim okundu bilgisi kaydedilemedi',error);
  }
  async function markAllRead(){
    const at=new Date().toISOString();notifications.forEach(x=>{if(!x.read_at)x.read_at=at;});renderNotifications();
    const {error}=await sb.from('app_notifications').update({read_at:at}).is('read_at',null);if(error)console.warn('Bildirimler toplu güncellenemedi',error);
  }
  function navigate(view,recordId){
    if(!view)return;
    const nav=document.querySelector(`.nav-item[data-view="${CSS.escape(view)}"]`);
    if(nav)nav.click();else if(typeof setView==='function'&&document.getElementById(view))setView(view);
    if(view==='extras'&&recordId)setTimeout(()=>document.querySelector(`#extras [data-extra-task-id="${CSS.escape(recordId)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),180);
  }
  function subscribeNotifications(){
    if(notificationChannel||!profile?.id)return;
    notificationChannel=sb.channel('minds-user-notifications-'+profile.id)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'app_notifications',filter:`user_id=eq.${profile.id}`},payload=>{
        const n=payload.new;if(!n||notifications.some(x=>x.id===n.id))return;notifications.unshift(n);renderNotifications();if(typeof toast==='function')toast(n.title||'Yeni bildirim');
      }).on('postgres_changes',{event:'UPDATE',schema:'public',table:'app_notifications',filter:`user_id=eq.${profile.id}`},payload=>{
        const i=notifications.findIndex(x=>x.id===payload.new?.id);if(i>=0){notifications[i]=payload.new;renderNotifications();}
      }).subscribe();
  }

  function ensureAttentionHost(){
    if(!admin())return null;
    const dash=document.getElementById('dashboard'),hero=dash?.querySelector('.hero');if(!dash||!hero)return null;
    let host=document.getElementById('opsAttentionV216');if(!host){host=document.createElement('section');host.id='opsAttentionV216';hero.insertAdjacentElement('afterend',host);}return host;
  }
  function severityClass(x){return ['danger','warning','review','duty','info'].includes(x)?x:'info';}
  async function refreshAttention(){
    if(!admin()||attentionBusy)return;const host=ensureAttentionHost();if(!host)return;attentionBusy=true;
    host.innerHTML='<div class="ops-att-head-v216"><div><h3>⚡ Dikkat Gerekenler</h3><p>Şu anda müdahale veya kontrol gerektiren konular.</p></div><button class="ops-att-refresh-v216" type="button" data-ops-att-refresh="1">Yenile</button></div><div class="ops-att-body-v216"><div class="ops-notify-empty-v216">Kontrol ediliyor...</div></div>';
    try{
      const {data,error}=await sb.rpc('operations_attention_preview',{p_month:selectedMonth});if(error)throw error;
      const rows=data||[],attention=rows.filter(x=>x.kind==='attention'),health=rows.filter(x=>x.kind==='health');
      host.innerHTML=`<div class="ops-att-head-v216"><div><h3>⚡ Dikkat Gerekenler</h3><p>Şu anda müdahale veya kontrol gerektiren konular.</p></div><button class="ops-att-refresh-v216" type="button" data-ops-att-refresh="1">Yenile</button></div><div class="ops-att-body-v216"><div class="ops-att-grid-v216">${attention.length?attention.map(x=>`<div class="ops-att-item-v216 ${severityClass(x.severity)}" data-ops-open-view="${esc(x.view_name||'')}" title="İlgili bölüme git"><div class="top"><b>${esc(x.title)}</b><span class="count">${Number(x.item_count||0)}</span></div><p>${esc(x.detail||'')}</p></div>`).join(''):'<div class="ops-health-ok-v216">Şu anda acil müdahale gerektiren kayıt görünmüyor.</div>'}</div><div class="ops-health-v216"><div class="ops-health-title-v216">◉ Sistem Sağlığı</div>${health.length?`<div class="ops-health-list-v216">${health.map(x=>`<span class="ops-health-chip-v216 ${x.severity==='danger'?'danger':''}" data-ops-open-view="${esc(x.view_name||'')}">${esc(x.title)} · ${Number(x.item_count||0)}</span>`).join('')}</div>`:'<div class="ops-health-ok-v216">Kontroller temiz: açık kalmış kritik kayıt veya belirgin veri tutarsızlığı görünmüyor.</div>'}</div></div>`;
    }catch(e){console.warn('Operasyon özeti yüklenemedi',e);host.querySelector('.ops-att-body-v216').innerHTML='<div class="ops-health-chip-v216 danger">Operasyon özeti alınamadı. Yenile ile tekrar deneyebilirsin.</div>';}
    finally{attentionBusy=false;}
  }

  function visibleExtraRows(){
    const arr=(typeof monthExtras==='function'?monthExtras():(state.extras||[]).filter(x=>x.month===selectedMonth&&(admin()||x.person_id===profile?.id))).slice();
    const rank={review:0,waiting:1,in_progress:2,completed:3};
    return arr.sort((a,b)=>{const ar=rank[a.task_status]??4,br=rank[b.task_status]??4;if(ar!==br)return ar-br;return String(a.due_date||a.work_date||'').localeCompare(String(b.due_date||b.work_date||''));});
  }
  function patchExtraHistoryButtons(){
    const grid=document.getElementById('extraPersonGridV179');if(!grid)return;
    const rows=visibleExtraRows();
    grid.querySelectorAll('.extra-person-card-v179').forEach(card=>{
      const name=card.querySelector('.extra-person-head-v179 h3')?.textContent?.trim();
      const p=(state.profiles||[]).find(x=>String(x.full_name||'').trim()===name);if(!p)return;
      const list=rows.filter(x=>String(x.person_id)===String(p.id)),items=[...card.querySelectorAll('.extra-item-v179')];
      items.forEach((item,i)=>{const x=list[i];if(!x)return;item.dataset.extraTaskId=x.id;let actions=item.querySelector('.extra-item-actions-v179');if(!actions){actions=document.createElement('div');actions.className='extra-item-actions-v179';item.appendChild(actions);}if(!actions.querySelector('[data-extra-history-v216]')){const b=document.createElement('button');b.type='button';b.className='extra-history-btn-v216';b.dataset.extraHistoryV216=x.id;b.textContent='Geçmiş';actions.appendChild(b);}});
    });
  }
  function historyActionLabel(v){return ({assigned:'Görev atandı',created:'Ekstra iş oluşturuldu',reassigned:'Sorumlu değiştirildi',status_changed:'Durum değiştirildi',updated:'Kayıt güncellendi',deleted:'Kayıt silindi',baseline:'Mevcut kayıt sisteme aktarıldı'})[v]||v;}
  function statusLabel(v){return ({waiting:'Bekliyor',in_progress:'Devam Ediyor',review:'Kontrol Bekliyor',completed:'Tamamlandı'})[v]||v||'—';}
  async function showExtraHistory(id){
    try{
      const {data,error}=await sb.from('extra_work_history').select('*').eq('extra_work_id',id).order('created_at',{ascending:false});if(error)throw error;
      const rows=data||[],task=(state.extras||[]).find(x=>x.id===id),title=task?.title||rows[0]?.title_snapshot||'Ekstra İş';
      const html=`<div class="ops-history-list-v216">${rows.length?rows.map(h=>{const actor=(state.profiles||[]).find(p=>p.id===h.actor_id)?.full_name||'Sistem';const transition=h.from_status!==h.to_status&&h.to_status?`<p>${esc(statusLabel(h.from_status))} → <b>${esc(statusLabel(h.to_status))}</b></p>`:'';return `<div class="ops-history-row-v216"><b>${esc(historyActionLabel(h.action))}</b>${transition}<p>${esc(actor)}</p><time>${esc(localDateTime(h.created_at))}</time></div>`;}).join(''):'<div class="ops-notify-empty-v216">Bu görev için ayrıntılı geçmiş kaydı yok.</div>'}</div><div class="form-actions" style="margin-top:12px"><button type="button" class="ghost" onclick="closeModal()">Kapat</button></div>`;
      const modal=document.getElementById('modal'),form=document.getElementById('modalForm'),head=document.getElementById('modalTitle');if(!modal||!form||!head)return;head.textContent='Kayıt Geçmişi · '+title;form.innerHTML=html;form.onsubmit=e=>e.preventDefault();modal.classList.remove('hidden');
    }catch(e){console.warn('Ekstra iş geçmişi yüklenemedi',e);if(typeof toast==='function')toast('Kayıt geçmişi yüklenemedi.',true);}
  }

  function wrapRenderers(){
    if(typeof window.renderExtras==='function'&&!window.renderExtras.__opsV216){
      const original=window.renderExtras;const wrapped=function(...args){const r=original.apply(this,args);setTimeout(patchExtraHistoryButtons,30);return r;};wrapped.__opsV216=true;window.renderExtras=wrapped;try{renderExtras=wrapped;}catch(_e){}
    }
    if(typeof window.renderStats==='function'&&!window.renderStats.__opsV216){
      const original=window.renderStats;const wrapped=function(...args){const r=original.apply(this,args);if(admin())setTimeout(refreshAttention,40);return r;};wrapped.__opsV216=true;window.renderStats=wrapped;try{renderStats=wrapped;}catch(_e){}
    }
  }

  document.addEventListener('click',async e=>{
    const notifyBtn=e.target.closest('#opsNotifyBtnV216');if(notifyBtn){e.preventDefault();e.stopPropagation();document.getElementById('opsNotifyPanelV216')?.classList.toggle('open');return;}
    if(!e.target.closest('#opsNotifyPanelV216'))document.getElementById('opsNotifyPanelV216')?.classList.remove('open');
    if(e.target.closest('[data-ops-read-all]')){e.preventDefault();await markAllRead();return;}
    const n=e.target.closest('[data-ops-notification]');if(n){e.preventDefault();await markRead(n.dataset.opsNotification);const rec=notifications.find(x=>x.id===n.dataset.opsNotification);document.getElementById('opsNotifyPanelV216')?.classList.remove('open');navigate(n.dataset.opsView,rec?.record_id);return;}
    const av=e.target.closest('[data-ops-open-view]');if(av){navigate(av.dataset.opsOpenView);return;}
    if(e.target.closest('[data-ops-att-refresh]')){refreshAttention();return;}
    const hb=e.target.closest('[data-extra-history-v216]');if(hb){e.preventDefault();e.stopPropagation();showExtraHistory(hb.dataset.extraHistoryV216);return;}
    if(e.target.closest('.nav-item[data-view="dashboard"]'))setTimeout(refreshAttention,100);
    if(e.target.closest('.nav-item[data-view="extras"],#addExtraBtn,[data-edit-extra],[data-extra-start-v215],[data-extra-submit-v215],[data-extra-approve-v215],[data-extra-reopen-v215]'))setTimeout(patchExtraHistoryButtons,220);
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker'){setTimeout(()=>{refreshAttention();patchExtraHistoryButtons();},140);}},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){generateDueNotifications().then(loadNotifications);if(admin())refreshAttention();}});

  installStyles();ensureNotificationUi();wrapRenderers();subscribeNotifications();
  generateDueNotifications(true).then(loadNotifications);
  setTimeout(()=>{patchExtraHistoryButtons();if(admin())refreshAttention();},420);
})();
