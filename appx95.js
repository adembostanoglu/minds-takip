// V1.25.7 — Admin-only staff firm distribution overview.
(function bootFirmDistributionV257(){
  if(window.__mindsFirmDistributionV257)return;
  if(typeof state==='undefined'||typeof profile==='undefined'||!profile||typeof isAdmin!=='function'){
    setTimeout(bootFirmDistributionV257,160);return;
  }
  if(!isAdmin())return;
  window.__mindsFirmDistributionV257=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const roleMeta={
    tasarim:{label:'Post / Tasarım',cls:'design',icon:'◆'},
    video:{label:'Video',cls:'video',icon:'▶'},
    sosyal_medya:{label:'Sosyal Medya',cls:'social',icon:'●'},
    ana_sorumlu:{label:'Ana Sorumlu',cls:'lead',icon:'★'},
    diger:{label:'Diğer',cls:'other',icon:'•'}
  };
  const roleOrder=['tasarim','video','sosyal_medya','ana_sorumlu','diger'];

  function installStyle(){
    if(document.getElementById('firmDistributionV257Style'))return;
    const s=document.createElement('style');s.id='firmDistributionV257Style';s.textContent=`
      #assignmentOverview{padding-bottom:36px}
      #assignmentOverview .dist-head-v257{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:14px}
      #assignmentOverview .dist-head-v257 h2{margin:0}
      #assignmentOverview .dist-head-v257 p{margin:5px 0 0;color:#849198}
      #assignmentOverview .dist-summary-v257{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:12px 0 16px}
      #assignmentOverview .dist-summary-card-v257{border:1px solid #29343a;border-radius:11px;background:#10171b;padding:12px 13px}
      #assignmentOverview .dist-summary-card-v257 small{display:block;color:#829097;font-size:8.5px;text-transform:uppercase;letter-spacing:.35px}
      #assignmentOverview .dist-summary-card-v257 b{display:block;margin-top:5px;font-size:20px;color:#eef2f3}
      #assignmentOverview .dist-summary-card-v257.design b{color:#d3a8ee}
      #assignmentOverview .dist-summary-card-v257.video b{color:#8fd5f1}
      #assignmentOverview .dist-summary-card-v257.social b{color:#E4E251}
      #assignmentOverview .dist-people-v257{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      #assignmentOverview .dist-person-v257{border:1px solid #2b363c;border-radius:14px;background:linear-gradient(145deg,#11191d,#0e1417);overflow:hidden}
      #assignmentOverview .dist-person-head-v257{padding:15px 16px;border-bottom:1px solid #283238;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;background:linear-gradient(180deg,#151d21,#11181c)}
      #assignmentOverview .dist-person-head-v257 h3{margin:0;font-size:15px}
      #assignmentOverview .dist-person-head-v257 p{margin:4px 0 0;color:#829097;font-size:9px}
      #assignmentOverview .dist-total-v257{min-width:48px;text-align:center;border:1px solid #68671e;background:#20210f;border-radius:10px;padding:7px 8px}
      #assignmentOverview .dist-total-v257 small{display:block;color:#aaa95b;font-size:7px;text-transform:uppercase}
      #assignmentOverview .dist-total-v257 b{display:block;color:#E4E251;font-size:18px;margin-top:2px}
      #assignmentOverview .dist-kpis-v257{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:12px 14px 0}
      #assignmentOverview .dist-kpi-v257{border:1px solid #29343a;border-radius:9px;background:#0f1518;padding:9px 10px}
      #assignmentOverview .dist-kpi-v257 small{display:block;color:#839097;font-size:8px}
      #assignmentOverview .dist-kpi-v257 b{display:block;font-size:16px;margin-top:4px}
      #assignmentOverview .dist-kpi-v257.design b{color:#d3a8ee}
      #assignmentOverview .dist-kpi-v257.video b{color:#8fd5f1}
      #assignmentOverview .dist-kpi-v257.social b{color:#E4E251}
      #assignmentOverview .dist-sections-v257{padding:12px 14px 15px;display:grid;gap:10px}
      #assignmentOverview .dist-role-v257{border:1px solid #273137;border-radius:10px;background:#0d1316;overflow:hidden}
      #assignmentOverview .dist-role-head-v257{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid #252f34}
      #assignmentOverview .dist-role-title-v257{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:900}
      #assignmentOverview .dist-role-title-v257.design{color:#d3a8ee}
      #assignmentOverview .dist-role-title-v257.video{color:#8fd5f1}
      #assignmentOverview .dist-role-title-v257.social{color:#E4E251}
      #assignmentOverview .dist-role-title-v257.lead{color:#f0df66}
      #assignmentOverview .dist-role-title-v257.other{color:#adb6ba}
      #assignmentOverview .dist-role-count-v257{font-size:9px;color:#9aa5aa}
      #assignmentOverview .dist-firm-list-v257{display:flex;gap:6px;flex-wrap:wrap;padding:10px}
      #assignmentOverview .dist-firm-v257{display:inline-flex;align-items:center;padding:6px 8px;border:1px solid #303a40;border-radius:8px;background:#12191d;color:#e2e7e9;font-size:9px;font-weight:800}
      #assignmentOverview .dist-empty-v257{padding:10px;color:#738087;font-size:9px}
      @media(max-width:1050px){#assignmentOverview .dist-people-v257{grid-template-columns:1fr}}
      @media(max-width:760px){#assignmentOverview .dist-summary-v257{grid-template-columns:repeat(2,1fr)}#assignmentOverview .dist-kpis-v257{grid-template-columns:repeat(3,1fr)}}
    `;document.head.appendChild(s);
  }

  function activeStaff(){
    return (state.profiles||[]).filter(p=>p.active&&p.role!=='admin');
  }

  function activeFirmMap(){
    return new Map((state.firms||[]).filter(f=>f.active).map(f=>[String(f.id),f]));
  }

  function assignmentsFor(pid){
    const fm=activeFirmMap();
    return (state.assignments||[]).filter(a=>String(a.person_id)===String(pid)&&fm.has(String(a.firm_id)));
  }

  function firmsFor(pid,role){
    const fm=activeFirmMap();
    const seen=new Set(),out=[];
    assignmentsFor(pid).filter(a=>a.responsibility===role).forEach(a=>{
      const id=String(a.firm_id);if(seen.has(id))return;seen.add(id);
      const f=fm.get(id);if(f)out.push(f);
    });
    return out.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'tr'));
  }

  function uniqueFirmCount(pid){
    return new Set(assignmentsFor(pid).map(a=>String(a.firm_id))).size;
  }

  function roleSection(pid,role){
    const meta=roleMeta[role]||roleMeta.diger, firms=firmsFor(pid,role);
    if(!firms.length)return '';
    return `<section class="dist-role-v257">
      <div class="dist-role-head-v257"><div class="dist-role-title-v257 ${meta.cls}">${meta.icon} ${esc(meta.label)}</div><span class="dist-role-count-v257">${firms.length} firma</span></div>
      <div class="dist-firm-list-v257">${firms.map(f=>`<span class="dist-firm-v257">${esc(f.name)}</span>`).join('')}</div>
    </section>`;
  }

  function render(){
    ensureUi();
    const host=document.getElementById('firmDistributionPeopleV257'),sum=document.getElementById('firmDistributionSummaryV257');
    if(!host||!sum)return;
    const people=activeStaff();
    const totalPost=people.reduce((n,p)=>n+firmsFor(p.id,'tasarim').length,0);
    const totalVideo=people.reduce((n,p)=>n+firmsFor(p.id,'video').length,0);
    const totalSocial=people.reduce((n,p)=>n+firmsFor(p.id,'sosyal_medya').length,0);
    const uniqueActive=(state.firms||[]).filter(f=>f.active).length;
    sum.innerHTML=`
      <div class="dist-summary-card-v257"><small>Aktif Firma</small><b>${uniqueActive}</b></div>
      <div class="dist-summary-card-v257 design"><small>Post / Tasarım Ataması</small><b>${totalPost}</b></div>
      <div class="dist-summary-card-v257 video"><small>Video Ataması</small><b>${totalVideo}</b></div>
      <div class="dist-summary-card-v257 social"><small>Sosyal Medya Ataması</small><b>${totalSocial}</b></div>`;

    host.innerHTML=people.map(p=>{
      const post=firmsFor(p.id,'tasarim').length,video=firmsFor(p.id,'video').length,social=firmsFor(p.id,'sosyal_medya').length,total=uniqueFirmCount(p.id);
      const sections=roleOrder.map(r=>roleSection(p.id,r)).join('');
      return `<article class="dist-person-v257">
        <div class="dist-person-head-v257"><div><h3>${esc(p.full_name)}</h3><p>${esc(p.job_title||'Personel')} · aktif firma sorumlulukları</p></div><div class="dist-total-v257"><small>Toplam</small><b>${total}</b></div></div>
        <div class="dist-kpis-v257">
          <div class="dist-kpi-v257 design"><small>Post / Tasarım</small><b>${post}</b></div>
          <div class="dist-kpi-v257 video"><small>Video</small><b>${video}</b></div>
          <div class="dist-kpi-v257 social"><small>Sosyal Medya</small><b>${social}</b></div>
        </div>
        <div class="dist-sections-v257">${sections||'<div class="dist-empty-v257">Aktif firma ataması yok.</div>'}</div>
      </article>`;
    }).join('')||'<div class="empty">Aktif personel yok.</div>';
  }

  function showView(){
    ensureUi();
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));
    document.getElementById('assignmentOverview')?.classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view==='assignmentOverview'));
    const t=document.getElementById('pageTitle'),s=document.getElementById('pageSub');
    if(t)t.textContent='Firma Dağılımı';
    if(s)s.textContent='Personel bazında post, video ve sosyal medya firma sorumlulukları.';
    render();
  }

  function ensureUi(){
    installStyle();
    if(!document.querySelector('.nav-item[data-view="assignmentOverview"]')){
      const nav=document.createElement('button');
      nav.className='nav-item admin-nav';nav.dataset.view='assignmentOverview';nav.innerHTML='▦ <span>Firma Dağılımı</span>';
      const team=document.querySelector('.nav-item[data-view="team"]');
      if(team)team.insertAdjacentElement('afterend',nav);
      else document.querySelector('.sidebar nav')?.appendChild(nav);
      nav.addEventListener('click',e=>{e.preventDefault();showView();});
    }
    if(!document.getElementById('assignmentOverview')){
      const section=document.createElement('section');section.id='assignmentOverview';section.className='view';
      section.innerHTML=`
        <div class="dist-head-v257"><div><h2>Firma Dağılımı</h2><p>Kimin hangi firmadan ve hangi görev türünden sorumlu olduğunu tek ekranda gör.</p></div></div>
        <div id="firmDistributionSummaryV257" class="dist-summary-v257"></div>
        <div id="firmDistributionPeopleV257" class="dist-people-v257"></div>`;
      document.querySelector('main.main')?.appendChild(section);
    }
  }

  const prevRenderAll=typeof renderAll==='function'?renderAll:null;
  if(prevRenderAll&&!prevRenderAll.__firmDistributionV257){
    const wrapped=function(){const out=prevRenderAll.apply(this,arguments);if(document.getElementById('assignmentOverview')?.classList.contains('active-view'))queueMicrotask(render);return out;};
    wrapped.__firmDistributionV257=true;
    try{renderAll=wrapped;window.renderAll=wrapped;}catch(_e){}
  }

  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.getElementById('assignmentOverview')?.classList.contains('active-view'))render();});
  window.addEventListener('pageshow',()=>{if(document.getElementById('assignmentOverview')?.classList.contains('active-view'))render();});

  ensureUi();
})();