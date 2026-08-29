// V1.21.7 — server-side 15-minute reminder engine + firm content inactivity tracking UI.
(function bootContentRhythmV217(){
  if(window.__mindsContentRhythmV217)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof state==='undefined'){
    setTimeout(bootContentRhythmV217,180);return;
  }
  window.__mindsContentRhythmV217=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const currentMonth=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).formatToParts(new Date());const o=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${o.year}-${o.month}-01`;};
  const roleLabel=v=>({ana_sorumlu:'Ana Sorumlu',tasarim:'Tasarım',video:'Video',sosyal_medya:'Sosyal Medya'})[v]||v;
  const dateLabel=v=>v?(typeof formatDate==='function'?formatDate(v):v):'Bu ay henüz hareket yok';
  let busy=false,channel=null,reloadTimer=null;

  function installStyles(){
    if(document.getElementById('contentRhythmV217Style'))return;
    const s=document.createElement('style');s.id='contentRhythmV217Style';s.textContent=`
      #contentRhythmV217{margin:0 0 15px;border:1px solid #2d393f;border-radius:14px;background:#0f161a;overflow:hidden}
      .rhythm-head-v217{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid #29343a;background:linear-gradient(180deg,#151d21,#11181c)}
      .rhythm-head-v217 h3{margin:0;color:#eef2f3;font-size:15px}.rhythm-head-v217 p{margin:4px 0 0;color:#849198;font-size:10.5px;line-height:1.4}
      .rhythm-engine-v217{flex:0 0 auto;border:1px solid #4f5225;border-radius:999px;background:#1a1d11;color:#d9d45a;padding:6px 9px;font-size:8.5px;font-weight:850;white-space:nowrap}
      .rhythm-body-v217{padding:12px 14px 14px}.rhythm-grid-v217{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:9px}
      .rhythm-card-v217{border:1px solid #5c4b25;border-radius:10px;background:#211d12;padding:11px 12px;cursor:pointer}.rhythm-card-v217.critical{border-color:#683a37;background:#211617}
      .rhythm-card-v217 .top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.rhythm-card-v217 b{font-size:11.5px;color:#edf1f2;line-height:1.35}.rhythm-days-v217{flex:0 0 auto;font-size:15px;font-weight:900;color:#dfc65f}.rhythm-card-v217.critical .rhythm-days-v217{color:#ee8179}
      .rhythm-meta-v217{margin-top:6px;color:#9aa6ab;font-size:9.5px;line-height:1.45}.rhythm-meta-v217 strong{color:#d5dddf}.rhythm-empty-v217{border:1px solid #315a3c;background:#14241a;color:#8dd09a;border-radius:9px;padding:11px 12px;font-size:10.5px;font-weight:750}
      @media(max-width:760px){.rhythm-head-v217{align-items:flex-start}.rhythm-grid-v217{grid-template-columns:1fr}.rhythm-engine-v217{white-space:normal;text-align:center}}
    `;document.head.appendChild(s);
  }

  function ensureHost(){
    const dash=document.getElementById('dashboard'),hero=dash?.querySelector('.hero');if(!dash||!hero)return null;
    let host=document.getElementById('contentRhythmV217');
    if(!host){host=document.createElement('section');host.id='contentRhythmV217';const att=document.getElementById('opsAttentionV216');(att||hero).insertAdjacentElement('afterend',host);}
    return host;
  }

  function patchNotificationPanel(){
    const head=document.querySelector('#opsNotifyPanelV216 .ops-notify-head-v216');if(!head||head.querySelector('[data-reminder-engine-v217]'))return;
    const tag=document.createElement('span');tag.dataset.reminderEngineV217='1';tag.textContent='15 dk otomatik';tag.style.cssText='font-size:8px;color:#8f9ca2;margin-left:auto;margin-right:8px';
    const btn=head.querySelector('button');head.insertBefore(tag,btn||null);
  }

  async function loadRhythm(){
    if(busy)return;const host=ensureHost();if(!host)return;
    if(typeof selectedMonth!=='undefined'&&selectedMonth!==currentMonth()){host.style.display='none';return;}host.style.display='';busy=true;
    host.innerHTML='<div class="rhythm-head-v217"><div><h3>◷ İçerik Ritmi</h3><p>Aktif firmalarda uzun süre içerik hareketi olmayan sorumlulukları takip eder.</p></div><span class="rhythm-engine-v217">Hatırlatma motoru · 15 dk</span></div><div class="rhythm-body-v217"><div class="ops-notify-empty-v216">Kontrol ediliyor...</div></div>';
    try{
      const {data,error}=await sb.rpc('firm_inactivity_preview');if(error)throw error;const rows=data||[];
      host.innerHTML=`<div class="rhythm-head-v217"><div><h3>◷ İçerik Ritmi</h3><p>${admin()?'Ekip sorumluluklarında':'Sana atanmış firmalarda'} 10+ günlük içerik sessizliği. 20+ gün kritik kabul edilir.</p></div><span class="rhythm-engine-v217">Sunucu kontrolü · 15 dk</span></div><div class="rhythm-body-v217">${rows.length?`<div class="rhythm-grid-v217">${rows.map(r=>`<div class="rhythm-card-v217 ${r.threshold_level==='critical'?'critical':''}" data-rhythm-firm-v217="${r.firm_id}"><div class="top"><b>${esc(r.firm_name)}</b><span class="rhythm-days-v217">${Number(r.inactivity_days||0)} gün</span></div><div class="rhythm-meta-v217">${admin()?`<strong>${esc(r.full_name)}</strong> · `:''}${esc(roleLabel(r.responsibility))}<br>Son hareket: ${esc(dateLabel(r.last_activity_date))} · Kalan kapsam: ${Number(r.pending_units||0)}</div></div>`).join('')}</div>`:'<div class="rhythm-empty-v217">Tüm takip edilen firmalarda içerik akışı normal görünüyor.</div>'}</div>`;
    }catch(e){console.warn('İçerik ritmi yüklenemedi',e);host.querySelector('.rhythm-body-v217').innerHTML='<div class="ops-health-chip-v216 danger">İçerik ritmi kontrolü alınamadı.</div>';}
    finally{busy=false;}
  }

  function scheduleRhythm(){clearTimeout(reloadTimer);reloadTimer=setTimeout(loadRhythm,220);}
  function subscribe(){
    if(channel)return;channel=sb.channel('minds-content-rhythm-'+profile.id)
      .on('postgres_changes',{event:'*',schema:'public',table:'works'},scheduleRhythm)
      .on('postgres_changes',{event:'*',schema:'public',table:'content_shares'},scheduleRhythm)
      .on('postgres_changes',{event:'*',schema:'public',table:'firm_assignments'},scheduleRhythm)
      .subscribe();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.nav-item[data-view="dashboard"]'))setTimeout(loadRhythm,120);
    const card=e.target.closest('[data-rhythm-firm-v217]');if(card){const nav=document.querySelector('.nav-item[data-view="firms"]');if(nav)nav.click();}
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(loadRhythm,140);},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadRhythm();});

  installStyles();patchNotificationPanel();subscribe();setTimeout(()=>{patchNotificationPanel();loadRhythm();},520);
})();
