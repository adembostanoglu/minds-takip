// V1.14.2 — direct, independent Performance UI recovery layer.
(function bootPerformanceDirectV142(){
  if (window.__mindsPerformanceDirectV142) return;

  function ready(){
    return typeof sb !== 'undefined' && typeof setView === 'function' && typeof isAdmin === 'function' && typeof selectedMonth !== 'undefined' && typeof profile !== 'undefined' && !!profile;
  }

  function esc(v){
    return typeof escapeHtml === 'function' ? escapeHtml(String(v ?? '')) : String(v ?? '');
  }
  function num(v){ return Number(v || 0); }
  function monthLabel(v){ return typeof prettyMonth === 'function' ? prettyMonth(v) : String(v || ''); }

  async function refresh(){
    const body = document.getElementById('performanceBodyV113');
    if (!body || !isAdmin()) return;
    body.innerHTML = '<div class="empty compact-empty">Performans hesaplanıyor...</div>';
    const {data,error} = await sb.rpc('performance_preview',{p_month:selectedMonth});
    if (error){
      console.error('Performance direct V1.14.2',error);
      body.innerHTML = `<div class="info-banner"><b>Performans yüklenemedi:</b> ${esc(error.message || 'Bilinmeyen hata')}</div>`;
      return;
    }
    const rows = (data || []).slice().sort((a,b)=>(num(a.rank)||999)-(num(b.rank)||999));
    const leader = rows.find(r=>r.rank != null) || null;
    const training = selectedMonth === '2026-08-01';
    body.innerHTML = `
      <div class="info-banner"><b>${training?'🧪 Eğitim / Test Ayı:':'Puan sistemi:'}</b> ${training?'Ağustos 2026 resmi ödül üretmez. ':''}55 Ana Görev + 30 Zamanlama + 5 Ayı Eksiksiz Kapatma + 10 Ekstra Katkı. Postlarda ayın 1'i tam zaman puanı; her geciken gün %10 düşer. Video ve hazır içerik paylaşımları ay sonuna kadar tamamlanır.</div>
      <div class="stats-grid compact-stats" style="margin:12px 0">
        <div class="stat"><div class="label">Ana Görev</div><div class="value">55</div><div class="foot">Rol bazlı</div></div>
        <div class="stat"><div class="label">Zamanlama</div><div class="value">30</div><div class="foot">Post / video / paylaşım</div></div>
        <div class="stat"><div class="label">Temiz Kapanış</div><div class="value">5</div><div class="foot">Ay sonu eksiksiz</div></div>
        <div class="stat"><div class="label">Ekstra Katkı</div><div class="value">+10</div><div class="foot">Ekstra işler + çekimler</div></div>
      </div>
      <div class="panel" style="margin-bottom:12px">
        <div class="panel-head"><div><h3>${training?'Test Lideri':'Ayın Personeli Durumu'} · ${esc(monthLabel(selectedMonth))}</h3><p>Ödül için ana görev tamamlama en az %90 ve toplam puan en az 80 olmalı.</p></div><span class="badge ${leader?'yellow':'blue'}">${leader?`${esc(leader.full_name)} · ${num(leader.total_score).toFixed(1)}`:'Henüz sonuç yok'}</span></div>
      </div>
      <div class="panel"><div class="table-wrap"><table><thead><tr><th>Sıra</th><th>Personel</th><th>Ana Görev</th><th>Zamanlama</th><th>Temiz Kapanış</th><th>Ekstra Bonus</th><th>Toplam</th></tr></thead><tbody>
      ${rows.map(r=>{
        const d=r.details||{};
        const close=num(d.close_score);
        const award=d.award_eligible===true || d.award_eligible==='true';
        return `<tr><td><b>${r.rank?('#'+r.rank):'—'}</b></td><td><b>${esc(r.full_name)}</b><div class="muted">${award?'✓ Ödül şartlarını sağlıyor':'Şartlar henüz tamam değil'}</div></td><td>${num(r.core_score).toFixed(1)} / 55</td><td>${num(r.timing_score).toFixed(1)} / 30</td><td>${close.toFixed(1)} / 5</td><td>${num(r.extra_score).toFixed(1)} / +10</td><td><b>${num(r.total_score).toFixed(1)}</b></td></tr>`;
      }).join('') || '<tr><td colspan="7" class="empty">Puan kaydı yok.</td></tr>'}
      </tbody></table></div></div>`;
  }

  function install(){
    if (!ready()) return false;
    if (!isAdmin()) { window.__mindsPerformanceDirectV142=true; return true; }

    let nav=document.querySelector('.nav-item[data-view="performance"]');
    if(!nav){
      nav=document.createElement('button');
      nav.className='nav-item admin-nav';
      nav.dataset.view='performance';
      nav.innerHTML='★ <span>Performans</span>';
      const reports=document.querySelector('.nav-item[data-view="reports"]');
      if(reports) reports.insertAdjacentElement('afterend',nav);
      else document.querySelector('.sidebar nav')?.appendChild(nav);
    }
    nav.style.display='';

    let section=document.getElementById('performance');
    if(!section){
      section=document.createElement('section');
      section.id='performance';
      section.className='view';
      section.innerHTML='<div class="section-actions"><div><h2>Performans</h2><p>Rol bazlı otomatik performans puanları ve Ayın Personeli.</p></div></div><div id="performanceBodyV113"></div>';
      const archive=document.getElementById('archive');
      if(archive) archive.insertAdjacentElement('beforebegin',section);
      else document.querySelector('.main')?.appendChild(section);
    } else if(!document.getElementById('performanceBodyV113')){
      section.innerHTML='<div class="section-actions"><div><h2>Performans</h2><p>Rol bazlı otomatik performans puanları ve Ayın Personeli.</p></div></div><div id="performanceBodyV113"></div>';
    }

    nav.onclick=()=>{
      setView('performance');
      const title=document.getElementById('pageTitle');
      const sub=document.getElementById('pageSub');
      if(title) title.textContent='Performans';
      if(sub) sub.textContent='55 + 30 + 5 + 10 adil performans modeli.';
      refresh();
    };

    document.addEventListener('change',e=>{
      if(e.target?.id==='monthPicker' && document.getElementById('performance')?.classList.contains('active-view')) setTimeout(refresh,60);
    });
    window.__mindsPerformanceDirectV142=true;
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(install() || tries>80) clearInterval(timer);
  },100);
})();
