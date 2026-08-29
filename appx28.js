// V1.21.8 — Performans pilotu: firma sürekliliği puanı yöneticiye görünür, resmi puanı henüz etkilemez.
(function bootPerformanceDirectV218(){
  if (window.__mindsPerformanceDirectV218) return;

  let pilotRows=[];

  function ready(){
    return typeof sb !== 'undefined' && typeof setView === 'function' && typeof isAdmin === 'function' && typeof selectedMonth !== 'undefined' && typeof profile !== 'undefined' && !!profile;
  }
  function esc(v){ return typeof escapeHtml === 'function' ? escapeHtml(String(v ?? '')) : String(v ?? ''); }
  function num(v){ return Number(v || 0); }
  function monthLabel(v){ return typeof prettyMonth === 'function' ? prettyMonth(v) : String(v || ''); }
  function roleLabel(v){ return ({ana_sorumlu:'Ana Sorumlu',tasarim:'Tasarım',video:'Video',sosyal_medya:'Sosyal Medya'})[v]||v||'—'; }
  function dateLabel(v){ return v?(typeof formatDate==='function'?formatDate(v):v):'Bu ay henüz üretim yok'; }

  function installStyles(){
    if(document.getElementById('performancePilotV218Style'))return;
    const s=document.createElement('style');s.id='performancePilotV218Style';s.textContent=`
      #performance .perf-pilot-banner-v218{margin:14px 0 10px;border:1px solid #595723;border-radius:11px;background:#1c1d11;padding:12px 14px;color:#cfd2b0;font-size:10.5px;line-height:1.55}
      #performance .perf-pilot-banner-v218 b{color:#e4df52}
      #performance .perf-pilot-score-v218{font-size:16px;font-weight:900;color:#e5df4f}
      #performance .perf-cont-v218{font-weight:850}.perf-cont-v218.good{color:#8dd09a}.perf-cont-v218.warn{color:#dfc65f}.perf-cont-v218.bad{color:#eb8179}
      .perf-cont-detail-v218{display:grid;gap:8px;max-height:58vh;overflow:auto;padding-right:3px}.perf-cont-row-v218{border:1px solid #303b41;border-radius:10px;background:#11191d;padding:11px 12px}
      .perf-cont-row-v218 .top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.perf-cont-row-v218 b{font-size:11px;color:#eef2f3}.perf-cont-row-v218 .score{font-size:11px;font-weight:900;color:#d9d45a;white-space:nowrap}
      .perf-cont-row-v218 p{margin:6px 0 0;color:#8f9ca2;font-size:9.5px;line-height:1.5}.perf-cont-row-v218.exempt{border-color:#315a3c;background:#142019}.perf-cont-row-v218.complete{opacity:.78}
      .perf-cont-row-v218 .actions{margin-top:8px;display:flex;gap:7px;flex-wrap:wrap}.perf-cont-row-v218 button{padding:6px 8px!important;font-size:8.5px!important}
    `;document.head.appendChild(s);
  }

  function continuityClass(pct){return pct>=90?'good':pct>=70?'warn':'bad';}

  function renderOfficial(rows,training){
    const leader=rows.find(r=>r.rank!=null)||null;
    return `
      <div class="info-banner"><b>${training?'🧪 Eğitim / Test Ayı:':'Mevcut resmi puan:'}</b> ${training?'Ağustos 2026 resmi ödül üretmez. ':''}55 Ana Görev + 30 Zamanlama + 5 Ayı Eksiksiz Kapatma + 10 Ekstra Katkı. Bu bölüm mevcut resmi sıralamadır.</div>
      <div class="stats-grid compact-stats" style="margin:12px 0">
        <div class="stat"><div class="label">Ana Görev</div><div class="value">55</div><div class="foot">Rol bazlı</div></div>
        <div class="stat"><div class="label">Zamanlama</div><div class="value">30</div><div class="foot">Post / video / paylaşım</div></div>
        <div class="stat"><div class="label">Temiz Kapanış</div><div class="value">5</div><div class="foot">Ay sonu eksiksiz</div></div>
        <div class="stat"><div class="label">Ekstra Katkı</div><div class="value">+10</div><div class="foot">Onaylı ekstra + çekim</div></div>
      </div>
      <div class="panel" style="margin-bottom:12px">
        <div class="panel-head"><div><h3>${training?'Test Lideri':'Mevcut Ayın Personeli Durumu'} · ${esc(monthLabel(selectedMonth))}</h3><p>Resmi puanlama şimdilik değiştirilmedi.</p></div><span class="badge ${leader?'yellow':'blue'}">${leader?`${esc(leader.full_name)} · ${num(leader.total_score).toFixed(1)}`:'Henüz sonuç yok'}</span></div>
      </div>
      <div class="panel"><div class="table-wrap"><table><thead><tr><th>Sıra</th><th>Personel</th><th>Ana Görev</th><th>Zamanlama</th><th>Temiz Kapanış</th><th>Ekstra Bonus</th><th>Toplam</th></tr></thead><tbody>
      ${rows.map(r=>{const d=r.details||{},close=num(d.close_score),award=d.award_eligible===true||d.award_eligible==='true';return `<tr><td><b>${r.rank?('#'+r.rank):'—'}</b></td><td><b>${esc(r.full_name)}</b><div class="muted">${award?'✓ Ödül şartlarını sağlıyor':'Şartlar henüz tamam değil'}</div></td><td>${num(r.core_score).toFixed(1)} / 55</td><td>${num(r.timing_score).toFixed(1)} / 30</td><td>${close.toFixed(1)} / 5</td><td>${num(r.extra_score).toFixed(1)} / +10</td><td><b>${num(r.total_score).toFixed(1)}</b></td></tr>`;}).join('')||'<tr><td colspan="7" class="empty">Puan kaydı yok.</td></tr>'}
      </tbody></table></div></div>`;
  }

  function renderPilot(rows,error){
    if(error)return `<div class="perf-pilot-banner-v218"><b>Pilot süreklilik puanı yüklenemedi.</b> Resmi puan etkilenmedi.</div>`;
    const leader=rows.find(r=>r.pilot_rank!=null)||null;
    return `
      <div class="perf-pilot-banner-v218"><b>🧪 Pilot model — sadece yönetici izliyor:</b> 55 Üretim + 20 Firma Sürekliliği + 15 Onaylı Ekstra + 10 Zamanlama. <b>Bu puan şu an resmi sıralamayı, ödülü, maaşı veya primi etkilemez.</b> Bir süre sonuçları izleyip adil olduğundan emin olduktan sonra aktif modele geçiririz.</div>
      <div class="stats-grid compact-stats" style="margin:10px 0 12px">
        <div class="stat"><div class="label">Üretim</div><div class="value">55</div><div class="foot">Aylık sorumluluk tamamlama</div></div>
        <div class="stat"><div class="label">Firma Sürekliliği</div><div class="value">20</div><div class="foot">Aksatmama / içerik ritmi</div></div>
        <div class="stat"><div class="label">Onaylı Ekstra</div><div class="value">15</div><div class="foot">Ekstra işler + çekimler</div></div>
        <div class="stat"><div class="label">Zamanlama</div><div class="value">10</div><div class="foot">Zamanında üretim</div></div>
      </div>
      <div class="panel" style="margin-bottom:12px"><div class="panel-head"><div><h3>Pilot Sıralama · ${esc(monthLabel(selectedMonth))}</h3><p>0–9 gün tam puan · 10–14 gün hafif düşüş · 15–19 gün belirgin düşüş · 20+ gün ciddi aksama. Paket tamamlandıysa veya yönetici muafiyeti varsa kesinti yok.</p></div><span class="badge yellow">${leader?`${esc(leader.full_name)} · ${num(leader.pilot_total_score).toFixed(1)}`:'Henüz sonuç yok'}</span></div></div>
      <div class="panel"><div class="table-wrap"><table><thead><tr><th>Pilot</th><th>Personel</th><th>Üretim</th><th>Süreklilik</th><th>Ekstra</th><th>Zamanlama</th><th>Pilot Toplam</th><th>Resmi</th><th>Detay</th></tr></thead><tbody>
      ${rows.map(r=>`<tr><td><b>${r.pilot_rank?('#'+r.pilot_rank):'—'}</b></td><td><b>${esc(r.full_name)}</b></td><td>${num(r.production_score).toFixed(1)} / 55</td><td><span class="perf-cont-v218 ${continuityClass(num(r.continuity_pct))}">${num(r.continuity_score).toFixed(1)} / 20</span><div class="muted">%${num(r.continuity_pct).toFixed(0)} düzen</div></td><td>${num(r.extra_score).toFixed(1)} / 15</td><td>${num(r.timing_score).toFixed(1)} / 10</td><td><span class="perf-pilot-score-v218">${num(r.pilot_total_score).toFixed(1)}</span></td><td>${num(r.official_total_score).toFixed(1)}</td><td><button class="small-primary" data-pilot-person-v218="${r.person_id}">Firmalar</button></td></tr>`).join('')||'<tr><td colspan="9" class="empty">Pilot puan kaydı yok.</td></tr>'}
      </tbody></table></div></div>`;
  }

  async function refresh(){
    const body=document.getElementById('performanceBodyV113');if(!body||!isAdmin())return;
    body.innerHTML='<div class="empty compact-empty">Performans hesaplanıyor...</div>';
    const [official,pilot]=await Promise.all([sb.rpc('performance_preview',{p_month:selectedMonth}),sb.rpc('performance_pilot_preview',{p_month:selectedMonth})]);
    if(official.error){console.error('Performance V1.21.8 official',official.error);body.innerHTML=`<div class="info-banner"><b>Performans yüklenemedi:</b> ${esc(official.error.message||'Bilinmeyen hata')}</div>`;return;}
    const rows=(official.data||[]).slice().sort((a,b)=>(num(a.rank)||999)-(num(b.rank)||999));
    pilotRows=(pilot.data||[]).slice().sort((a,b)=>(num(a.pilot_rank)||999)-(num(b.pilot_rank)||999));
    const training=selectedMonth==='2026-08-01';
    body.innerHTML=renderOfficial(rows,training)+renderPilot(pilotRows,pilot.error);
  }

  function openPilotDetails(personId){
    const row=pilotRows.find(r=>String(r.person_id)===String(personId));if(!row)return;
    const items=Array.isArray(row.details?.continuity_rows)?row.details.continuity_rows:[];
    const html=`<div class="info-banner"><b>${esc(row.full_name)} · Firma Sürekliliği</b><br>Bu ekran pilot puanın neden yükselip düştüğünü gösterir. Müşteri bekleniyor, firma geçici durdu veya personelin kontrolü dışında bir durum varsa o sorumluluğu bu ay için muaf tutabilirsin.</div><div class="perf-cont-detail-v218">${items.map(x=>{
      const pct=Math.round(num(x.continuity_factor)*100),cls=x.is_exempt?'exempt':x.is_complete?'complete':'';
      const state=x.is_exempt?`Muaf · ${esc(x.exemption_reason||'Yönetici muafiyeti')}`:x.is_complete?'Kapsam tamamlandı':`${num(x.inactivity_days)} gün hareketsiz · ${num(x.pending_units)} kapsam kaldı`;
      return `<div class="perf-cont-row-v218 ${cls}"><div class="top"><div><b>${esc(x.firm_name)}</b><p>${esc(roleLabel(x.responsibility))}</p></div><span class="score">%${pct}</span></div><p>Son üretim: ${esc(dateLabel(x.last_activity_date))}<br>${state}</p><div class="actions">${x.is_complete?'':`<button type="button" class="${x.is_exempt?'ghost':'small-primary'}" data-continuity-toggle-v218="1" data-person="${row.person_id}" data-firm="${x.firm_id}" data-role="${esc(x.responsibility)}" data-exempt="${x.is_exempt?'1':'0'}">${x.is_exempt?'Muafiyeti Kaldır':'Bu Ay Muaf Tut'}</button>`}</div></div>`;
    }).join('')||'<div class="empty">Bu personel için takip edilen firma sorumluluğu yok.</div>'}</div><div class="form-actions" style="margin-top:12px"><button type="button" class="ghost" onclick="closeModal()">Kapat</button></div>`;
    const modal=document.getElementById('modal'),form=document.getElementById('modalForm'),title=document.getElementById('modalTitle');if(!modal||!form||!title)return;
    title.textContent='Pilot Süreklilik Detayı';form.innerHTML=html;form.onsubmit=e=>e.preventDefault();modal.classList.remove('hidden');
  }

  async function toggleException(btn){
    const removing=btn.dataset.exempt==='1';let reason=null;
    if(!removing){reason=prompt('Muafiyet nedeni (örn. müşteri onayı bekleniyor / firma geçici durdu):');if(reason===null)return;reason=String(reason).trim();if(!reason)return toast('Muafiyet nedeni gerekli.',true);}
    btn.disabled=true;
    const {error}=await sb.rpc('performance_continuity_exception_set',{p_month:selectedMonth,p_firm_id:btn.dataset.firm,p_person_id:btn.dataset.person,p_responsibility:btn.dataset.role,p_reason:reason,p_exempt:!removing});
    if(error){btn.disabled=false;return toast('Muafiyet güncellenemedi: '+(error.message||'Hata'),true);}
    if(typeof closeModal==='function')closeModal();
    await refresh();toast(removing?'Muafiyet kaldırıldı.':'Bu ay için süreklilik muafiyeti eklendi.');
    setTimeout(()=>openPilotDetails(btn.dataset.person),80);
  }

  function install(){
    if(!ready())return false;
    if(!isAdmin()){window.__mindsPerformanceDirectV218=true;return true;}
    installStyles();
    let nav=document.querySelector('.nav-item[data-view="performance"]');
    if(!nav){nav=document.createElement('button');nav.className='nav-item admin-nav';nav.dataset.view='performance';nav.innerHTML='★ <span>Performans</span>';const reports=document.querySelector('.nav-item[data-view="reports"]');if(reports)reports.insertAdjacentElement('afterend',nav);else document.querySelector('.sidebar nav')?.appendChild(nav);}
    nav.style.display='';
    let section=document.getElementById('performance');
    if(!section){section=document.createElement('section');section.id='performance';section.className='view';section.innerHTML='<div class="section-actions"><div><h2>Performans</h2><p>Resmi puanlama ve pilot firma sürekliliği modeli.</p></div></div><div id="performanceBodyV113"></div>';const archive=document.getElementById('archive');if(archive)archive.insertAdjacentElement('beforebegin',section);else document.querySelector('.main')?.appendChild(section);}else if(!document.getElementById('performanceBodyV113')){section.innerHTML='<div class="section-actions"><div><h2>Performans</h2><p>Resmi puanlama ve pilot firma sürekliliği modeli.</p></div></div><div id="performanceBodyV113"></div>';}
    nav.onclick=()=>{setView('performance');const title=document.getElementById('pageTitle'),sub=document.getElementById('pageSub');if(title)title.textContent='Performans';if(sub)sub.textContent='Resmi puan + yöneticiye özel pilot süreklilik modeli.';refresh();};
    document.addEventListener('change',e=>{if(e.target?.id==='monthPicker'&&document.getElementById('performance')?.classList.contains('active-view'))setTimeout(refresh,60);});
    document.addEventListener('click',e=>{const p=e.target.closest('[data-pilot-person-v218]');if(p){openPilotDetails(p.dataset.pilotPersonV218);return;}const t=e.target.closest('[data-continuity-toggle-v218]');if(t){e.preventDefault();toggleException(t);}},true);
    window.__mindsPerformanceDirectV218=true;return true;
  }

  let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(timer);},100);
})();
