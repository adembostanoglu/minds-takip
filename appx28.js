// V1.27.2 — Performans V2: Eylül önizleme, 1 Ekim 2026 resmi geçiş.
(function bootPerformanceDirectV272(){
  if(window.__mindsPerformanceDirectV272)return;

  let continuityDetailRows=[];

  function ready(){
    return typeof sb!=='undefined'&&typeof setView==='function'&&typeof isAdmin==='function'&&
      typeof selectedMonth!=='undefined'&&typeof profile!=='undefined'&&!!profile;
  }
  function esc(v){return typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');}
  function num(v){return Number(v||0);}
  function monthLabel(v){return typeof prettyMonth==='function'?prettyMonth(v):String(v||'');}
  function roleLabel(v){return ({ana_sorumlu:'Ana Sorumlu',tasarim:'Tasarım',video:'Video',sosyal_medya:'Sosyal Medya'})[v]||v||'—';}
  function dateLabel(v){return v?(typeof formatDate==='function'?formatDate(v):v):'Bu ay henüz üretim yok';}
  function pctFrom(d,key){return num(d?.[key])*100;}
  function isV2Month(){return String(selectedMonth||'')>='2026-10-01';}
  function continuityClass(pct){return pct>=90?'good':pct>=70?'warn':'bad';}

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
      #performance .perf-v2-active-v272{border-color:#315a3c!important;background:#142019!important;color:#9bd9a5!important}
      #performance .perf-v2-note-v272{font-size:9px;color:#8e9aa0;margin-top:4px;line-height:1.45}
    `;document.head.appendChild(s);
  }

  function renderLegacyOfficial(rows,training){
    const leader=rows.find(r=>r.rank!=null)||null;
    return `
      <div class="info-banner"><b>${training?'🧪 Eğitim / Test Ayı:':'Eylül resmi model:'}</b> ${training?'Ağustos 2026 resmi ödül üretmez. ':''}55 Ana Görev + 30 Zamanlama + 5 Ayı Eksiksiz Kapatma + 10 Ekstra Katkı. Eylül resmi sonucu bu modelde kalır.</div>
      <div class="stats-grid compact-stats" style="margin:12px 0">
        <div class="stat"><div class="label">Ana Görev</div><div class="value">55</div><div class="foot">Rol bazlı</div></div>
        <div class="stat"><div class="label">Zamanlama</div><div class="value">30</div><div class="foot">Eski model</div></div>
        <div class="stat"><div class="label">Temiz Kapanış</div><div class="value">5</div><div class="foot">Ay sonu eksiksiz</div></div>
        <div class="stat"><div class="label">Ekstra Katkı</div><div class="value">10</div><div class="foot">Eski bonus sistemi</div></div>
      </div>
      <div class="panel" style="margin-bottom:12px"><div class="panel-head"><div><h3>Resmi Sonuç · ${esc(monthLabel(selectedMonth))}</h3><p>Ekim geçişinden önceki resmi hesap.</p></div><span class="badge ${leader?'yellow':'blue'}">${leader?`${esc(leader.full_name)} · ${num(leader.total_score).toFixed(1)}`:'Henüz sonuç yok'}</span></div></div>
      <div class="panel"><div class="table-wrap"><table><thead><tr><th>Sıra</th><th>Personel</th><th>Ana Görev</th><th>Zamanlama</th><th>Temiz Kapanış</th><th>Ekstra</th><th>Toplam</th></tr></thead><tbody>
      ${rows.map(r=>{const d=r.details||{},close=num(d.close_score),award=d.award_eligible===true||d.award_eligible==='true';return `<tr><td><b>${r.rank?('#'+r.rank):'—'}</b></td><td><b>${esc(r.full_name)}</b><div class="muted">${award?'✓ Ödül şartlarını sağlıyor':'Şartlar henüz tamam değil'}</div></td><td>${num(r.core_score).toFixed(1)} / 55</td><td>${num(r.timing_score).toFixed(1)} / 30</td><td>${close.toFixed(1)} / 5</td><td>${num(r.extra_score).toFixed(1)} / 10</td><td><b>${num(r.total_score).toFixed(1)}</b></td></tr>`;}).join('')||'<tr><td colspan="7" class="empty">Puan kaydı yok.</td></tr>'}
      </tbody></table></div></div>`;
  }

  function renderV2Official(rows){
    const leader=rows.find(r=>r.rank!=null)||null;
    return `
      <div class="info-banner perf-v2-active-v272"><b>✓ Performans V2 aktif:</b> 1 Ekim 2026 itibarıyla resmi model. 60 Ana Görev + 15 Süreklilik + 10 Zamanlama + 10 Ekstra Katkı + 5 Temiz Kapanış.</div>
      <div class="stats-grid compact-stats" style="margin:12px 0">
        <div class="stat"><div class="label">Ana Görev</div><div class="value">60</div><div class="foot">Kendi rolü / firma kotası</div></div>
        <div class="stat"><div class="label">Süreklilik</div><div class="value">15</div><div class="foot">Rol ağırlıklı firma düzeni</div></div>
        <div class="stat"><div class="label">Zamanlama</div><div class="value">10</div><div class="foot">İş yapılabilir olduktan sonra</div></div>
        <div class="stat"><div class="label">Ekstra Katkı</div><div class="value">10</div><div class="foot">Tür + teslim + tamamlanma</div></div>
        <div class="stat"><div class="label">Temiz Kapanış</div><div class="value">5</div><div class="foot">Ana sorumluluk %100</div></div>
      </div>
      <div class="panel" style="margin-bottom:12px"><div class="panel-head"><div><h3>Resmi V2 Sonuç · ${esc(monthLabel(selectedMonth))}</h3><p>Aslı'nın sosyal medya süresi yalnızca içerik hazır olduğunda başlar. Bir firmadaki fazla üretim başka firmadaki açığı kapatmaz.</p></div><span class="badge ${leader?'yellow':'blue'}">${leader?`${esc(leader.full_name)} · ${num(leader.total_score).toFixed(1)}`:'Henüz sonuç yok'}</span></div></div>
      <div class="panel"><div class="table-wrap"><table><thead><tr><th>Sıra</th><th>Personel</th><th>Ana Görev</th><th>Süreklilik</th><th>Zamanlama</th><th>Ekstra</th><th>Kapanış</th><th>Toplam</th><th>Detay</th></tr></thead><tbody>
      ${rows.map(r=>{const d=r.details||{},cont=num(d.continuity_score),close=num(d.close_score),cp=pctFrom(d,'completion_ratio'),tp=pctFrom(d,'timing_ratio');return `<tr><td><b>${r.rank?('#'+r.rank):'—'}</b></td><td><b>${esc(r.full_name)}</b><div class="muted">Ana görev %${cp.toFixed(0)} · zaman %${tp.toFixed(0)}</div></td><td>${num(r.core_score).toFixed(1)} / 60</td><td>${cont.toFixed(1)} / 15</td><td>${num(r.timing_score).toFixed(1)} / 10</td><td>${num(r.extra_score).toFixed(1)} / 10</td><td>${close.toFixed(1)} / 5</td><td><b>${num(r.total_score).toFixed(1)}</b></td><td><button class="small-primary" data-pilot-person-v218="${r.person_id}">Firmalar</button></td></tr>`;}).join('')||'<tr><td colspan="9" class="empty">Puan kaydı yok.</td></tr>'}
      </tbody></table></div></div>`;
  }

  function renderV2Preview(rows,error){
    if(error)return `<div class="perf-pilot-banner-v218"><b>Ekim V2 önizlemesi yüklenemedi.</b> Eylül resmi puanı etkilenmedi.</div>`;
    const leader=rows.find(r=>r.rank!=null)||null;
    return `
      <div class="perf-pilot-banner-v218"><b>🧪 Ekim V2 Önizleme:</b> Bu bölüm Eylül verisini yeni kurallarla simüle eder. <b>Eylül resmi sıralamasını, maaşı veya primi değiştirmez.</b> 1 Ekim 2026'dan itibaren resmi hesap bu modele geçer.</div>
      <div class="stats-grid compact-stats" style="margin:10px 0 12px">
        <div class="stat"><div class="label">Ana Görev</div><div class="value">60</div><div class="foot">Kendi sorumluluğu</div></div>
        <div class="stat"><div class="label">Süreklilik</div><div class="value">15</div><div class="foot">Firma bazlı, rol ağırlıklı</div></div>
        <div class="stat"><div class="label">Zamanlama</div><div class="value">10</div><div class="foot">Kontrolündeki gecikme</div></div>
        <div class="stat"><div class="label">Ekstra</div><div class="value">10</div><div class="foot">Tür + teslim süresi</div></div>
        <div class="stat"><div class="label">Kapanış</div><div class="value">5</div><div class="foot">%100 sorumluluk</div></div>
      </div>
      <div class="panel" style="margin-bottom:12px"><div class="panel-head"><div><h3>V2 Simülasyon · ${esc(monthLabel(selectedMonth))}</h3><p>Sosyal medyada içerik hazır olmadan süre başlamaz. Ekstra katkı eski model gibi erken tavana vurmaz.</p></div><span class="badge yellow">${leader?`${esc(leader.full_name)} · ${num(leader.total_score).toFixed(1)}`:'Henüz sonuç yok'}</span></div></div>
      <div class="panel"><div class="table-wrap"><table><thead><tr><th>V2</th><th>Personel</th><th>Ana Görev</th><th>Süreklilik</th><th>Zamanlama</th><th>Ekstra</th><th>Kapanış</th><th>V2 Toplam</th><th>Detay</th></tr></thead><tbody>
      ${rows.map(r=>{const d=r.details||{},cp=pctFrom(d,'completion_ratio'),contPct=pctFrom(d,'continuity_ratio');return `<tr><td><b>${r.rank?('#'+r.rank):'—'}</b></td><td><b>${esc(r.full_name)}</b><div class="muted">Ana görev %${cp.toFixed(0)}</div></td><td>${num(r.core_score).toFixed(1)} / 60</td><td><span class="perf-cont-v218 ${continuityClass(contPct)}">${num(r.continuity_score).toFixed(1)} / 15</span><div class="muted">%${contPct.toFixed(0)} düzen</div></td><td>${num(r.timing_score).toFixed(1)} / 10</td><td>${num(r.extra_score).toFixed(1)} / 10</td><td>${num(r.close_score).toFixed(1)} / 5</td><td><span class="perf-pilot-score-v218">${num(r.total_score).toFixed(1)}</span></td><td><button class="small-primary" data-pilot-person-v218="${r.person_id}">Firmalar</button></td></tr>`;}).join('')||'<tr><td colspan="9" class="empty">V2 puan kaydı yok.</td></tr>'}
      </tbody></table></div></div>`;
  }

  async function refresh(){
    const body=document.getElementById('performanceBodyV113');if(!body||!isAdmin())return;
    body.innerHTML='<div class="empty compact-empty">Performans hesaplanıyor...</div>';
    const [official,v2,detail]=await Promise.all([
      sb.rpc('performance_preview',{p_month:selectedMonth}),
      sb.rpc('performance_v2_preview',{p_month:selectedMonth}),
      sb.rpc('performance_pilot_preview',{p_month:selectedMonth})
    ]);
    if(official.error){
      console.error('Performance V1.27.2 official',official.error);
      body.innerHTML=`<div class="info-banner"><b>Performans yüklenemedi:</b> ${esc(official.error.message||'Bilinmeyen hata')}</div>`;return;
    }
    continuityDetailRows=(detail.data||[]).slice();
    const officialRows=(official.data||[]).slice().sort((a,b)=>(num(a.rank)||999)-(num(b.rank)||999));
    const v2Rows=(v2.data||[]).slice().sort((a,b)=>(num(a.rank)||999)-(num(b.rank)||999));
    const training=selectedMonth==='2026-08-01';
    if(isV2Month())body.innerHTML=renderV2Official(officialRows);
    else body.innerHTML=renderLegacyOfficial(officialRows,training)+renderV2Preview(v2Rows,v2.error);
  }

  function openPilotDetails(personId){
    const row=continuityDetailRows.find(r=>String(r.person_id)===String(personId));if(!row)return;
    const items=Array.isArray(row.details?.continuity_rows)?row.details.continuity_rows:[];
    const html=`<div class="info-banner"><b>${esc(row.full_name)} · Firma Sürekliliği</b><br>Müşteri bekleniyor, firma geçici durdu veya personelin kontrolü dışında bir durum varsa bu ay için muaf tutulabilir.</div><div class="perf-cont-detail-v218">${items.map(x=>{
      const pct=Math.round(num(x.continuity_factor)*100),cls=x.is_exempt?'exempt':x.is_complete?'complete':'';
      const state=x.is_exempt?`Muaf · ${esc(x.exemption_reason||'Yönetici muafiyeti')}`:x.is_complete?'Kapsam tamamlandı':`${num(x.inactivity_days)} gün hareketsiz · ${num(x.pending_units)} kapsam kaldı`;
      return `<div class="perf-cont-row-v218 ${cls}"><div class="top"><div><b>${esc(x.firm_name)}</b><p>${esc(roleLabel(x.responsibility))}</p></div><span class="score">%${pct}</span></div><p>Son üretim: ${esc(dateLabel(x.last_activity_date))}<br>${state}</p><div class="actions">${x.is_complete?'':`<button type="button" class="${x.is_exempt?'ghost':'small-primary'}" data-continuity-toggle-v218="1" data-person="${row.person_id}" data-firm="${x.firm_id}" data-role="${esc(x.responsibility)}" data-exempt="${x.is_exempt?'1':'0'}">${x.is_exempt?'Muafiyeti Kaldır':'Bu Ay Muaf Tut'}</button>`}</div></div>`;
    }).join('')||'<div class="empty">Bu personel için takip edilen firma sorumluluğu yok.</div>'}</div><div class="form-actions" style="margin-top:12px"><button type="button" class="ghost" onclick="closeModal()">Kapat</button></div>`;
    const modal=document.getElementById('modal'),form=document.getElementById('modalForm'),title=document.getElementById('modalTitle');if(!modal||!form||!title)return;
    title.textContent='Firma Sürekliliği Detayı';form.innerHTML=html;form.onsubmit=e=>e.preventDefault();modal.classList.remove('hidden');
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
    if(!isAdmin()){window.__mindsPerformanceDirectV272=true;return true;}
    installStyles();
    let nav=document.querySelector('.nav-item[data-view="performance"]');
    if(!nav){nav=document.createElement('button');nav.className='nav-item admin-nav';nav.dataset.view='performance';nav.innerHTML='★ <span>Performans</span>';const reports=document.querySelector('.nav-item[data-view="reports"]');if(reports)reports.insertAdjacentElement('afterend',nav);else document.querySelector('.sidebar nav')?.appendChild(nav);}
    nav.style.display='';
    let section=document.getElementById('performance');
    if(!section){section=document.createElement('section');section.id='performance';section.className='view';section.innerHTML='<div class="section-actions"><div><h2>Performans</h2><p>Resmi performans ve Ekim V2 geçiş modeli.</p></div></div><div id="performanceBodyV113"></div>';const archive=document.getElementById('archive');if(archive)archive.insertAdjacentElement('beforebegin',section);else document.querySelector('.main')?.appendChild(section);}
    else if(!document.getElementById('performanceBodyV113'))section.innerHTML='<div class="section-actions"><div><h2>Performans</h2><p>Resmi performans ve Ekim V2 geçiş modeli.</p></div></div><div id="performanceBodyV113"></div>';

    nav.onclick=()=>{setView('performance');const title=document.getElementById('pageTitle'),sub=document.getElementById('pageSub');if(title)title.textContent='Performans';if(sub)sub.textContent=isV2Month()?'Performans V2 · resmi model':'Eylül resmi sonuç + Ekim V2 önizleme';refresh();};
    document.addEventListener('change',e=>{if(e.target?.id==='monthPicker'&&document.getElementById('performance')?.classList.contains('active-view'))setTimeout(refresh,60);});
    document.addEventListener('click',e=>{const p=e.target.closest('[data-pilot-person-v218]');if(p){openPilotDetails(p.dataset.pilotPersonV218);return;}const t=e.target.closest('[data-continuity-toggle-v218]');if(t){e.preventDefault();toggleException(t);}},true);
    window.__mindsPerformanceDirectV272=true;return true;
  }

  let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(timer);},100);
})();