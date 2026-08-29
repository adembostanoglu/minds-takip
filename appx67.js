// V1.21.9 — Eylül hazırlık kontrolü + paket tempo takibi + vardiya özet görünümü.
(function bootSeptemberReadinessV219(){
  if(window.__mindsSeptemberReadinessV219)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof state==='undefined'){
    setTimeout(bootSeptemberReadinessV219,180);return;
  }
  window.__mindsSeptemberReadinessV219=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const roleLabel=v=>({ana_sorumlu:'Ana Sorumlu',tasarim:'Tasarım',video:'Video',sosyal_medya:'Sosyal Medya'})[v]||v||'—';
  let channel=null,reloadTimer=null,readinessBusy=false,paceBusy=false;

  function istanbulParts(){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    return Object.fromEntries(parts.map(x=>[x.type,x.value]));
  }
  function currentMonth(){const p=istanbulParts();return `${p.year}-${p.month}-01`;}
  function transitionTarget(){
    const p=istanbulParts(),y=Number(p.year),m=Number(p.month),d=Number(p.day);
    if(d<=3)return `${y}-${String(m).padStart(2,'0')}-01`;
    const n=new Date(Date.UTC(y,m,1));return `${n.getUTCFullYear()}-${String(n.getUTCMonth()+1).padStart(2,'0')}-01`;
  }
  function monthName(v){return typeof prettyMonth==='function'?prettyMonth(v):String(v||'');}

  function installStyles(){
    if(document.getElementById('septemberReadyV219Style'))return;
    const s=document.createElement('style');s.id='septemberReadyV219Style';s.textContent=`
      #monthReadinessV219,#packagePaceV219{margin:0 0 15px;border:1px solid #2c383e;border-radius:14px;background:#0f161a;overflow:hidden}
      .v219-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid #29343a;background:linear-gradient(180deg,#151d21,#11181c)}
      .v219-head h3{margin:0;color:#eef2f3;font-size:15px}.v219-head p{margin:4px 0 0;color:#849198;font-size:10.5px;line-height:1.45}
      .v219-tag{flex:0 0 auto;border:1px solid #4b4f27;border-radius:999px;background:#1b1d12;color:#d9d45a;padding:6px 9px;font-size:8.5px;font-weight:850;white-space:nowrap}
      .v219-body{padding:12px 14px 14px}.v219-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:9px}
      .v219-check{border:1px solid #334047;border-radius:10px;background:#121a1e;padding:11px 12px;min-height:74px;cursor:pointer}.v219-check.good{border-color:#315a3c;background:#142019}.v219-check.warning{border-color:#655322;background:#211e12}.v219-check.danger{border-color:#6b3734;background:#241617}.v219-check.scheduled{border-color:#31556b;background:#121f28}
      .v219-check .top,.v219-pace .top{display:flex;align-items:flex-start;justify-content:space-between;gap:9px}.v219-check b,.v219-pace b{font-size:11.5px;color:#edf1f2;line-height:1.35}.v219-check p,.v219-pace p{margin:6px 0 0;color:#909da3;font-size:9.5px;line-height:1.5}
      .v219-status{font-size:8.5px;font-weight:900;text-transform:uppercase;letter-spacing:.25px}.v219-check.good .v219-status{color:#8dd09a}.v219-check.warning .v219-status{color:#dfc65f}.v219-check.danger .v219-status{color:#ec847c}.v219-check.scheduled .v219-status{color:#7ab9dd}
      .v219-summary{margin-bottom:9px;border:1px solid #315a3c;background:#14241a;color:#8dd09a;border-radius:9px;padding:10px 11px;font-size:10.5px;font-weight:800}.v219-summary.warning{border-color:#655322;background:#211e12;color:#dfc65f}.v219-summary.danger{border-color:#6b3734;background:#241617;color:#ec847c}
      .v219-pace{border:1px solid #5b4b25;border-radius:10px;background:#211d12;padding:11px 12px;cursor:pointer}.v219-pace.critical{border-color:#6b3936;background:#241617}.v219-gap{font-size:15px;font-weight:900;color:#dfc65f;white-space:nowrap}.v219-pace.critical .v219-gap{color:#ed8179}
      .v219-progress{height:6px;border-radius:999px;background:#2b3337;overflow:hidden;margin-top:9px}.v219-progress span{display:block;height:100%;background:#d6cf43;border-radius:999px}.v219-pace.critical .v219-progress span{background:#d96d66}
      .v219-foot{margin-top:10px;color:#718087;font-size:8.8px;line-height:1.5}.v219-empty{border:1px solid #315a3c;background:#14241a;color:#8dd09a;border-radius:9px;padding:11px 12px;font-size:10.5px;font-weight:750}
      @media(max-width:760px){.v219-head{align-items:flex-start}.v219-grid{grid-template-columns:1fr}.v219-tag{white-space:normal;text-align:center}}
    `;document.head.appendChild(s);
  }

  function dashboardAnchor(){
    const dash=document.getElementById('dashboard'),hero=dash?.querySelector('.hero');if(!dash||!hero)return null;
    return document.getElementById('contentRhythmV217')||document.getElementById('opsAttentionV216')||hero;
  }
  function ensureReadinessHost(){
    if(!admin())return null;let host=document.getElementById('monthReadinessV219');if(host)return host;
    const anchor=dashboardAnchor();if(!anchor)return null;host=document.createElement('section');host.id='monthReadinessV219';anchor.insertAdjacentElement('afterend',host);return host;
  }
  function ensurePaceHost(){
    let host=document.getElementById('packagePaceV219');if(host)return host;
    const readiness=document.getElementById('monthReadinessV219'),anchor=readiness||dashboardAnchor();if(!anchor)return null;host=document.createElement('section');host.id='packagePaceV219';anchor.insertAdjacentElement('afterend',host);return host;
  }
  function statusText(v){return ({good:'Hazır',warning:'Kontrol',danger:'Eksik',scheduled:'Otomatik'})[v]||v;}

  async function loadReadiness(){
    if(!admin()||readinessBusy)return;const host=ensureReadinessHost();if(!host)return;readinessBusy=true;
    const target=transitionTarget();host.innerHTML=`<div class="v219-head"><div><h3>✓ ${esc(monthName(target))} Geçiş Kontrolü</h3><p>Yeni aya geçmeden paketleri, sorumluları, otomatik açılışı ve ilk Cumartesi nöbetini doğrular.</p></div><span class="v219-tag">Ay geçiş güvenliği</span></div><div class="v219-body"><div class="ops-notify-empty-v216">Kontrol ediliyor...</div></div>`;
    try{
      const {data,error}=await sb.rpc('month_transition_readiness',{p_target_month:target});if(error)throw error;const rows=data||[];
      const dangers=rows.filter(x=>x.status==='danger').length,warnings=rows.filter(x=>x.status==='warning').length;
      const summary=dangers?`<div class="v219-summary danger">${dangers} kritik ay geçiş eksiği var. Eylül başlamadan düzeltelim.</div>`:warnings?`<div class="v219-summary warning">Ana geçiş hazır; ${warnings} kontrol notu bulunuyor.</div>`:`<div class="v219-summary">${esc(monthName(target))} geçişi hazır. Kritik eksik görünmüyor.</div>`;
      host.innerHTML=`<div class="v219-head"><div><h3>✓ ${esc(monthName(target))} Geçiş Kontrolü</h3><p>Yeni aya geçmeden paketleri, sorumluları, otomatik açılışı ve ilk Cumartesi nöbetini doğrular.</p></div><span class="v219-tag">${dangers?'Müdahale gerekli':warnings?'Kontrol gerekli':'Hazır'}</span></div><div class="v219-body">${summary}<div class="v219-grid">${rows.map(r=>`<div class="v219-check ${esc(r.status)}" data-v219-readiness="${esc(r.title)}"><div class="top"><b>${esc(r.title)}</b><span class="v219-status">${esc(statusText(r.status))}</span></div><p>${esc(r.detail)}</p></div>`).join('')}</div></div>`;
    }catch(e){console.warn('Ay geçiş kontrolü yüklenemedi',e);host.querySelector('.v219-body').innerHTML='<div class="v219-summary danger">Ay geçiş kontrolü alınamadı.</div>';}
    finally{readinessBusy=false;}
  }

  async function loadPace(){
    if(paceBusy)return;const host=ensurePaceHost();if(!host)return;
    const cur=currentMonth();
    if(typeof selectedMonth!=='undefined'&&selectedMonth!==cur){host.style.display='none';return;}host.style.display='';paceBusy=true;
    const p=istanbulParts(),today=Number(p.day),beforeStart=cur<'2026-09-01';
    host.innerHTML='<div class="v219-head"><div><h3>↗ Paket Tempo Takibi</h3><p>Ayın ilerleme oranıyla firmaların gerçek üretim hızını karşılaştırır.</p></div><span class="v219-tag">Otomatik tempo kontrolü</span></div><div class="v219-body"><div class="ops-notify-empty-v216">Kontrol ediliyor...</div></div>';
    try{
      if(beforeStart){host.querySelector('.v219-body').innerHTML='<div class="v219-empty">Paket tempo takibi 1 Eylül itibarıyla aktif olacak. Ağustos verileri geriye dönük cezalandırılmayacak.</div><div class="v219-foot">Sabah özeti 09:15’te, gün sonu özeti hafta içi 18:15 ve Cumartesi 13:15 civarında uygulama bildirimlerine düşer.</div>';return;}
      const {data,error}=await sb.rpc('package_pace_preview',{p_month:cur});if(error)throw error;const rows=data||[];
      let content='';
      if(today<5&&!rows.length)content='<div class="v219-empty">Ayın ilk 4 günü gözlem dönemi. Tempo uyarıları 5. günden itibaren devreye girer.</div>';
      else if(!rows.length)content='<div class="v219-empty">Takip edilen paketler şu anda planlanan aylık tempoda ilerliyor.</div>';
      else content=`<div class="v219-grid">${rows.map(r=>{
        const critical=r.level==='critical',actual=Math.max(0,Math.min(100,Number(r.actual_pct||0))),target=Math.max(0,Math.min(100,Number(r.expected_pct||0)));
        return `<div class="v219-pace ${critical?'critical':''}" data-v219-pace-view="${r.responsibility==='sosyal_medya'?'shares':'works'}"><div class="top"><div><b>${esc(r.firm_name)}</b><p>${admin()?`<strong>${esc(r.full_name)}</strong> · `:''}${esc(roleLabel(r.responsibility))}</p></div><span class="v219-gap">-${Number(r.gap_pct||0).toFixed(0)}%</span></div><p>Bugünkü tempo hedefi: <b>${Number(r.expected_by_now||0)}</b> · Tamamlanan: <b>${Number(r.done_units||0)}</b> · Aylık kapsam: ${Number(r.expected_units||0)}<br>Kalan kapsam: ${Number(r.remaining_units||0)}</p><div class="v219-progress" title="Gerçek %${actual.toFixed(0)} / Hedef %${target.toFixed(0)}"><span style="width:${actual}%"></span></div></div>`;
      }).join('')}</div>`;
      host.innerHTML=`<div class="v219-head"><div><h3>↗ Paket Tempo Takibi</h3><p>${admin()?'Ekip firmalarında':'Sorumlu olduğun firmalarda'} ayın ilerleyişine göre üretim temposu. 15 puan gerilik uyarı, 30+ puan kritik kabul edilir.</p></div><span class="v219-tag">${rows.length?`${rows.length} takip gerekiyor`:'Tempo normal'}</span></div><div class="v219-body">${content}<div class="v219-foot">Müşteri/onay kaynaklı muafiyetler pilot performanstaki “Bu Ay Muaf Tut” kaydıyla tempo uyarısından da çıkar. Sabah özeti 09:15’te, gün sonu özeti hafta içi 18:15 ve Cumartesi 13:15 civarında bildirimlere düşer.</div></div>`;
    }catch(e){console.warn('Paket tempo takibi yüklenemedi',e);host.querySelector('.v219-body').innerHTML='<div class="v219-summary danger">Paket tempo kontrolü alınamadı.</div>';}
    finally{paceBusy=false;}
  }

  function scheduleReload(){clearTimeout(reloadTimer);reloadTimer=setTimeout(()=>{loadReadiness();loadPace();},260);}
  function subscribe(){
    if(channel)return;channel=sb.channel('minds-september-ready-'+profile.id)
      .on('postgres_changes',{event:'*',schema:'public',table:'works'},scheduleReload)
      .on('postgres_changes',{event:'*',schema:'public',table:'content_shares'},scheduleReload)
      .on('postgres_changes',{event:'*',schema:'public',table:'firm_assignments'},scheduleReload)
      .on('postgres_changes',{event:'*',schema:'public',table:'firm_months'},scheduleReload)
      .subscribe();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.nav-item[data-view="dashboard"]'))setTimeout(()=>{loadReadiness();loadPace();},120);
    const pace=e.target.closest('[data-v219-pace-view]');if(pace){document.querySelector(`.nav-item[data-view="${pace.dataset.v219PaceView}"]`)?.click();return;}
    const check=e.target.closest('[data-v219-readiness]');if(check){document.querySelector('.nav-item[data-view="firms"]')?.click();}
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(()=>{loadReadiness();loadPace();},150);},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){loadReadiness();loadPace();}});

  installStyles();subscribe();setTimeout(()=>{loadReadiness();loadPace();},650);
})();
