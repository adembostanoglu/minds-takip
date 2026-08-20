// V1.13.1 — role-based automatic performance scoring + Employee of the Month badge
(function bootPerformanceV1131(){
  if(typeof sb==='undefined' || typeof el!=='function' || typeof setView!=='function' || !profile){
    setTimeout(bootPerformanceV1131,120);
    return;
  }
  if(window.__mindsPerformanceV1131) return;
  window.__mindsPerformanceV1131=true;

  let selectedDetailId=null;
  let refreshTimer=null;
  let badgeKey='';
  const roleLabels={tasarim:'Tasarım / Post',video:'Video Edit',sosyal_medya:'Sosyal Medya / Paylaşım'};

  function esc(v){ return typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??''); }
  function num(v){ return Number(v||0); }
  function pct(done,expected){ return expected>0?Math.min(100,Math.round((done/expected)*1000)/10):0; }
  function currentMonth(){ return typeof monthISO==='function'?monthISO():new Date().toISOString().slice(0,7)+'-01'; }
  function monthName(v){ return typeof prettyMonth==='function'?prettyMonth(v):String(v||''); }
  function isAdminUser(){ return typeof isAdmin==='function'&&isAdmin(); }
  function maxes(r){ const m=r?.details?.score_max||{}; return {core:num(m.core||60),timing:num(m.timing||20),shoot:num(m.shoot||10),extra:num(m.extra_bonus||10)}; }

  function installStyles(){
    if(document.getElementById('performanceV113Style')) return;
    const st=document.createElement('style'); st.id='performanceV113Style'; st.textContent=`
      .performance-rules-v113{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:14px 0 16px}.performance-rule-v113{border:1px solid #293139;border-radius:13px;background:linear-gradient(145deg,#11181d,#0e1418);padding:14px}.performance-rule-v113 small{display:block;color:#88949b;font-size:9px;text-transform:uppercase;letter-spacing:.06em}.performance-rule-v113 b{display:block;font-size:20px;margin:6px 0 4px}.performance-rule-v113 span{font-size:9px;color:#aab3b8;line-height:1.45}.performance-top-v113{display:grid;grid-template-columns:1.1fr 2fr;gap:14px;margin-bottom:16px}.performance-leader-v113{border:1px solid #7a6813;border-radius:16px;padding:18px;background:radial-gradient(circle at 10% 10%,rgba(220,203,42,.12),transparent 42%),linear-gradient(145deg,#17170d,#10161a);min-height:145px}.performance-leader-v113 .crown{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:#2d2908;border:1px solid #665d11;font-size:21px;margin-bottom:12px}.performance-leader-v113 h3{margin:0 0 5px;font-size:20px}.performance-leader-v113 p{margin:0;color:#8d979d;font-size:10px}.performance-leader-v113 strong{display:block;color:#e8df45;font-size:31px;margin-top:12px}.performance-status-v113{border:1px solid #293139;border-radius:16px;background:#10161a;padding:18px}.performance-status-v113 h4{margin:0 0 8px}.performance-status-v113 p{margin:0;color:#9ba5aa;font-size:10px;line-height:1.6}.performance-table-v113 tbody tr{cursor:pointer}.performance-table-v113 tbody tr:hover{background:rgba(255,255,255,.025)}.performance-table-v113 .rank{font-size:16px;font-weight:800}.performance-table-v113 .score-total{font-size:18px;font-weight:900;color:#e1de39}.performance-table-v113 .score-muted{color:#8d979d}.performance-detail-v113{margin-top:14px;border:1px solid #2b343a;border-radius:14px;background:#0e1418;padding:16px}.performance-detail-v113 h4{margin:0 0 4px}.performance-detail-v113>p{margin:0 0 14px;color:#879198;font-size:9px}.performance-role-grid-v113{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.performance-role-v113{border:1px solid #252e34;border-radius:11px;padding:12px;background:#11171b}.performance-role-v113 b{display:block;margin-bottom:7px}.performance-role-v113 span{display:block;font-size:9px;color:#9aa4aa;margin:3px 0}.performance-award-badge-v113{position:absolute;right:-7px;bottom:-6px;width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#f2df43,#a98507);border:2px solid #11171b;box-shadow:0 3px 14px rgba(220,193,36,.4);font-size:13px;z-index:5;pointer-events:none}.profile-box #sideAvatar{position:relative}.performance-live-v113{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 8px;font-size:9px;font-weight:800;background:#142126;border:1px solid #29414b;color:#8fd6e6}.performance-final-v113{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 8px;font-size:9px;font-weight:800;background:#242407;border:1px solid #5f5b10;color:#e8df45}.performance-role-note-v113{margin:0 0 12px;padding:10px 12px;border-radius:10px;background:#151b1f;border:1px solid #273138;color:#b6c0c5;font-size:10px}@media(max-width:1000px){.performance-rules-v113{grid-template-columns:repeat(2,1fr)}.performance-top-v113{grid-template-columns:1fr}.performance-role-grid-v113{grid-template-columns:1fr}}@media(max-width:600px){.performance-rules-v113{grid-template-columns:1fr}}
    `; document.head.appendChild(st);
  }

  function ensureAdminUI(){
    if(!isAdminUser()) return;
    let nav=document.querySelector('.nav-item[data-view="performance"]');
    if(!nav){
      nav=document.createElement('button'); nav.className='nav-item admin-nav'; nav.dataset.view='performance'; nav.innerHTML='★ <span>Performans</span>';
      const reports=document.querySelector('.nav-item[data-view="reports"]');
      if(reports) reports.insertAdjacentElement('afterend',nav); else document.querySelector('.sidebar nav')?.appendChild(nav);
      nav.onclick=()=>{ setView('performance'); el('pageTitle').textContent='Performans'; if(el('pageSub'))el('pageSub').textContent='Rol bazlı otomatik performans puanları ve Ayın Personeli.'; refreshPerformance(true); };
    }
    let section=document.getElementById('performance');
    if(!section){
      section=document.createElement('section'); section.id='performance'; section.className='view';
      section.innerHTML=`<div class="section-actions"><div><h2>Performans</h2><p>Puanlar kişinin gerçek sorumluluklarına göre sistem tarafından otomatik hesaplanır; manuel puan yoktur.</p></div></div><div id="performanceBodyV113"></div>`;
      const archive=document.getElementById('archive'); if(archive) archive.insertAdjacentElement('beforebegin',section); else document.querySelector('.main')?.appendChild(section);
    }
  }

  async function fetchScores(){
    const m=selectedMonth;
    const cur=currentMonth();
    if(m<cur){
      const {data,error}=await sb.from('monthly_performance_scores').select('*').eq('month',m).order('rank',{ascending:true,nullsFirst:false});
      if(!error && data?.length){
        return {rows:data.map(r=>({...r,full_name:(state.profiles||[]).find(p=>p.id===r.person_id)?.full_name||'Personel'})),finalized:true};
      }
    }
    const {data,error}=await sb.rpc('performance_preview',{p_month:m});
    if(error) throw error;
    return {rows:data||[],finalized:false};
  }

  function roleDetailHtml(details){
    const roles=details?.roles||{};
    const keys=Object.keys(roles);
    if(!keys.length) return '<div class="empty">Bu ay puanlanabilir ana sorumluluk bulunmuyor.</div>';
    return `<div class="performance-role-grid-v113">${keys.map(k=>{const r=roles[k]||{},ex=num(r.expected),dn=num(r.done),tm=num(r.timely),wt=num(r.weight);return `<div class="performance-role-v113"><b>${esc(roleLabels[k]||k)}</b><span>Beklenen: ${ex}</span><span>Tamamlanan: ${dn} · %${pct(dn,ex)}</span><span>Zamanında: ${tm} · %${pct(tm,ex)}</span>${wt?`<span>Tanımlı rol ağırlığı: %${Math.round(wt*100)}</span>`:''}</div>`}).join('')}</div>`;
  }

  function renderPerformance(rows,finalized){
    const body=document.getElementById('performanceBodyV113'); if(!body) return;
    const eligible=rows.filter(r=>r.eligible && r.rank!=null).sort((a,b)=>num(a.rank)-num(b.rank));
    const leader=eligible[0]||null;
    const isCurrent=selectedMonth===currentMonth();
    const onboarding=rows.some(r=>r.details?.onboarding_grace);
    const status=finalized?'<span class="performance-final-v113">✓ Kesinleşti</span>':'<span class="performance-live-v113">● Canlı Puan</span>';
    const leaderLabel=finalized?'Ayın Personeli':isCurrent?'Şu An Lider':'Hesaplanan Lider';
    const minAward=60;
    const awardReady=leader&&num(leader.total_score)>=minAward;

    body.innerHTML=`
      <div class="info-banner"><b>Performans kuralı:</b> Yeni ayın postları ayın 1'inde “Hazır/Onaylandı” olarak sisteme girilir. Videolar ve o aya ait paylaşımlar ay sonuna kadar tamamlanır. Puan ağırlıkları kişinin gerçek görevine göre değişir.${onboarding?' <b>Ağustos 2026 ilk kurulum ayı olduğu için post zamanlama son tarihi yalnızca bu ay 31 Ağustos olarak uygulanır.</b>':''}</div>
      <div class="performance-rules-v113"><div class="performance-rule-v113"><small>Ana Görev</small><b>Rol Bazlı</b><span>Tasarım, video edit ve sosyal medya sorumlulukları kişiye özel ağırlıkla hesaplanır.</span></div><div class="performance-rule-v113"><small>Zamanlama</small><b>Otomatik</b><span>Post: ayın 1'i. Video ve paylaşım: ayın son günü.</span></div><div class="performance-rule-v113"><small>Çekim</small><b>Sorumluluğa Göre</b><span>Çekim görevi olan personelde ana puanın önemli bir parçasıdır. Takım/antrenman/deplasman çekimleri ayrıca ağırlıklandırılır.</span></div><div class="performance-rule-v113"><small>Ekstra Katkı</small><b>Bonus</b><span>Logo, katalog, broşür ve diğer paket dışı işler bonus sağlar; toplam puan 100'ü geçmez.</span></div></div>
      <div class="performance-top-v113"><div class="performance-leader-v113"><div class="crown">🏆</div><p>${leaderLabel} · ${monthName(selectedMonth)}</p><h3>${leader?esc(leader.full_name):'Henüz sonuç yok'}</h3><strong>${leader?num(leader.total_score).toFixed(1):'—'}</strong><p>${finalized?(awardReady?'Ödül sahibi kesinleşti.':'Minimum 60 puan şartı sağlanmadığı için ödül yok.'):'Ay kapanana kadar sıralama değişebilir.'}</p></div><div class="performance-status-v113"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><h4>${monthName(selectedMonth)} Puan Durumu</h4>${status}</div><p>Puanlar tamamen sistem verisinden hesaplanır ve manuel müdahale yoktur. Yapılmayan bir rol kişiye ceza olarak yazılmaz. Eşit puanda önce görev tamamlama, sonra zamanlama ve son olarak sorumluluk yükü dikkate alınır.</p></div></div>
      <div class="panel"><div class="table-wrap"><table class="performance-table-v113"><thead><tr><th>Sıra</th><th>Personel</th><th>Ana Görev</th><th>Zamanlama</th><th>Ekstra Bonus</th><th>Çekim</th><th>Toplam</th></tr></thead><tbody>${rows.map(r=>{const mx=maxes(r);return `<tr data-perf-person="${r.person_id}"><td><span class="rank">${r.rank?('#'+r.rank):'—'}</span></td><td><b>${esc(r.full_name)}</b>${!r.eligible?'<div class="score-muted">Puanlanabilir ana görev yok</div>':''}</td><td>${num(r.core_score).toFixed(1)} / ${mx.core}</td><td>${num(r.timing_score).toFixed(1)} / ${mx.timing}</td><td>${num(r.extra_score).toFixed(1)} / +${mx.extra}</td><td>${mx.shoot?`${num(r.shoot_score).toFixed(1)} / ${mx.shoot}`:'—'}</td><td><span class="score-total">${num(r.total_score).toFixed(1)}</span></td></tr>`}).join('')||'<tr><td colspan="7" class="empty">Personel puanı bulunamadı.</td></tr>'}</tbody></table></div></div>
      <div id="performanceDetailV113"></div>`;

    body.querySelectorAll('[data-perf-person]').forEach(tr=>tr.addEventListener('click',()=>{
      selectedDetailId=tr.dataset.perfPerson;
      const r=rows.find(x=>x.person_id===selectedDetailId); const d=document.getElementById('performanceDetailV113'); if(!r||!d)return;
      const mx=maxes(r);
      const summary=r.details?.responsibility_summary||'Rol bazlı görev profili';
      const shootText=mx.shoot
        ? `${num(r.details?.shoot_count)} çekim · ${num(r.details?.team_shoot_count)} takım/antrenman/deplasman · ${num(r.details?.firm_shoot_count)} firma · ${num(r.details?.shoot_video_count)} video içeriği`
        : 'Bu personelin performans modelinde zorunlu çekim puanı yok.';
      const shootUnits=mx.shoot?`Ağırlıklı çekim birimi: ${num(r.details?.weighted_shoot_units).toFixed(1)} / ${num(r.details?.shoot_target_units).toFixed(1)}`:'';
      d.innerHTML=`<div class="performance-detail-v113"><h4>${esc(r.full_name)} · Puan Detayı</h4><div class="performance-role-note-v113"><b>Sorumluluk:</b> ${esc(summary)}</div>${roleDetailHtml(r.details)}<div class="performance-role-grid-v113" style="margin-top:10px"><div class="performance-role-v113"><b>Ana Görev + Zaman</b><span>${num(r.core_score).toFixed(1)} / ${mx.core} ana görev</span><span>${num(r.timing_score).toFixed(1)} / ${mx.timing} zamanlama</span></div><div class="performance-role-v113"><b>Çekim</b><span>${esc(shootText)}</span>${shootUnits?`<span>${esc(shootUnits)}</span>`:''}<span>Puan: ${num(r.shoot_score).toFixed(1)} / ${mx.shoot}</span></div><div class="performance-role-v113"><b>Ekstra / Kurumsal Katkı</b><span>${num(r.details?.extra_quantity)} adet</span><span>Bonus: ${num(r.extra_score).toFixed(1)} / +${mx.extra}</span></div><div class="performance-role-v113"><b>Toplam</b><span>Ekstra bonus dahil toplam 100 ile sınırlandırılır.</span><span><strong>${num(r.total_score).toFixed(1)} / 100</strong></span></div></div></div>`;
      d.scrollIntoView({behavior:'smooth',block:'nearest'});
    }));
  }

  async function refreshPerformance(force=false){
    if(!isAdminUser()) return;
    ensureAdminUI();
    if(!force && !document.getElementById('performance')?.classList.contains('active-view')) return;
    const body=document.getElementById('performanceBodyV113'); if(body) body.innerHTML='<div class="panel"><div class="empty">Performans hesaplanıyor…</div></div>';
    try{ const x=await fetchScores(); renderPerformance(x.rows,x.finalized); }
    catch(e){ console.error('Performance',e); if(body)body.innerHTML=`<div class="panel"><div class="empty">Performans verisi alınamadı: ${esc(e.message||e)}</div></div>`; }
  }

  function schedulePerformance(){ clearTimeout(refreshTimer); refreshTimer=setTimeout(()=>refreshPerformance(false),120); }

  async function updateAwardBadge(){
    const key=`${profile.id}:${currentMonth()}`; if(badgeKey===key) return; badgeKey=key;
    const avatar=document.getElementById('sideAvatar'); if(!avatar) return;
    avatar.querySelector('.performance-award-badge-v113')?.remove();
    try{
      const {data,error}=await sb.from('employee_month_awards').select('performance_month,display_month,score').eq('display_month',currentMonth()).eq('person_id',profile.id).maybeSingle();
      if(error) throw error;
      if(data){ const badge=document.createElement('span'); badge.className='performance-award-badge-v113'; badge.textContent='🏆'; badge.title=`${monthName(data.performance_month)} Ayın Personeli · ${num(data.score).toFixed(1)} puan`; avatar.appendChild(badge); }
    }catch(e){ console.warn('Employee award badge',e); }
  }

  function updateVersionLabel(){
    document.querySelectorAll('#settings .settings-list span').forEach(s=>{ if(/^Mind's Takip V/i.test(s.textContent||'')) s.textContent="Mind's Takip V1.13.1"; });
  }

  installStyles(); ensureAdminUI(); updateAwardBadge(); updateVersionLabel();

  const previousRenderAll=renderAll;
  renderAll=function(){ previousRenderAll(); ensureAdminUI(); updateVersionLabel(); schedulePerformance(); updateAwardBadge(); };
})();