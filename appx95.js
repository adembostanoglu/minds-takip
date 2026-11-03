// V1.25.8 — Ekip Firmalar: logo-first, firm-based staff responsibility list.
(function bootTeamFirmsV258(){
  if(window.__mindsTeamFirmsV258)return;
  if(typeof state==='undefined'||typeof profile==='undefined'||!profile||typeof isAdmin!=='function'){
    setTimeout(bootTeamFirmsV258,160);return;
  }
  if(!isAdmin())return;
  window.__mindsTeamFirmsV258=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const roleMeta={
    tasarim:{label:'Post / Tasarım',cls:'design'},
    video:{label:'Video',cls:'video'},
    sosyal_medya:{label:'Sosyal Medya',cls:'social'},
    ana_sorumlu:{label:'Ana Sorumlu',cls:'lead'},
    diger:{label:'Diğer',cls:'other'}
  };
  const roleOrder=['tasarim','video','sosyal_medya','ana_sorumlu','diger'];

  function installStyle(){
    document.getElementById('firmDistributionV257Style')?.remove();
    if(document.getElementById('teamFirmsV258Style'))return;
    const s=document.createElement('style');s.id='teamFirmsV258Style';s.textContent=`
      #assignmentOverview{padding-bottom:36px}
      #assignmentOverview .tf-head-v258{margin-bottom:15px}
      #assignmentOverview .tf-head-v258 h2{margin:0;font-size:20px}
      #assignmentOverview .tf-head-v258 p{margin:5px 0 0;color:#849198;font-size:10px}
      #assignmentOverview .tf-top-v258{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:0 0 16px}
      #assignmentOverview .tf-top-card-v258{border:1px solid #29343a;border-radius:11px;background:#10171b;padding:11px 13px}
      #assignmentOverview .tf-top-card-v258 small{display:block;color:#829097;font-size:8px;text-transform:uppercase;letter-spacing:.35px}
      #assignmentOverview .tf-top-card-v258 b{display:block;margin-top:4px;font-size:19px;color:#eef2f3}
      #assignmentOverview .tf-top-card-v258.design b{color:#d3a8ee}
      #assignmentOverview .tf-top-card-v258.video b{color:#8fd5f1}
      #assignmentOverview .tf-top-card-v258.social b{color:#E4E251}

      #assignmentOverview .tf-people-v258{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}
      #assignmentOverview .tf-person-v258{border:1px solid #2b363c;border-radius:14px;background:#0e1417;overflow:hidden}
      #assignmentOverview .tf-person-head-v258{padding:14px 15px 12px;border-bottom:1px solid #283238;background:linear-gradient(180deg,#151d21,#11181c)}
      #assignmentOverview .tf-person-title-v258{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
      #assignmentOverview .tf-person-title-v258 h3{margin:0;font-size:15px;color:#f3f6f7}
      #assignmentOverview .tf-person-title-v258 p{margin:4px 0 0;color:#829097;font-size:9px}
      #assignmentOverview .tf-total-v258{min-width:52px;text-align:center;border:1px solid #66651d;background:#20210f;border-radius:9px;padding:6px 8px}
      #assignmentOverview .tf-total-v258 small{display:block;font-size:7px;color:#a8a75c;text-transform:uppercase}
      #assignmentOverview .tf-total-v258 b{display:block;margin-top:1px;color:#E4E251;font-size:18px}
      #assignmentOverview .tf-kpis-v258{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:11px}
      #assignmentOverview .tf-kpi-v258{border:1px solid #2a3439;border-radius:8px;background:#0e1518;padding:7px 9px}
      #assignmentOverview .tf-kpi-v258 small{display:block;color:#7f8d93;font-size:7.5px}
      #assignmentOverview .tf-kpi-v258 b{display:block;margin-top:3px;font-size:14px}
      #assignmentOverview .tf-kpi-v258.design b{color:#d3a8ee}
      #assignmentOverview .tf-kpi-v258.video b{color:#8fd5f1}
      #assignmentOverview .tf-kpi-v258.social b{color:#E4E251}

      #assignmentOverview .tf-list-v258{padding:8px}
      #assignmentOverview .tf-row-v258{display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:10px;padding:9px 10px;border:1px solid transparent;border-bottom-color:#222c31;border-radius:9px}
      #assignmentOverview .tf-row-v258:last-child{border-bottom-color:transparent}
      #assignmentOverview .tf-row-v258:hover{background:#121a1e;border-color:#2b373d}
      #assignmentOverview .tf-logo-v258{width:36px;height:36px;display:flex;align-items:center;justify-content:center}
      #assignmentOverview .tf-logo-v258 .firm-logo{width:36px!important;height:36px!important;min-width:36px!important;border-radius:50%!important;object-fit:contain!important;background:#fff!important;padding:3px!important;box-sizing:border-box!important}
      #assignmentOverview .tf-logo-v258 .logo-placeholder{display:flex!important;align-items:center!important;justify-content:center!important;color:#202426!important;font-size:9px!important;font-weight:950!important}
      #assignmentOverview .tf-name-v258{min-width:0}
      #assignmentOverview .tf-name-v258 b{display:block;color:#eef2f3;font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #assignmentOverview .tf-name-v258 span{display:block;color:#78868c;font-size:8.5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #assignmentOverview .tf-badges-v258{display:flex;justify-content:flex-end;gap:5px;flex-wrap:wrap;max-width:250px}
      #assignmentOverview .tf-badge-v258{display:inline-flex;align-items:center;border-radius:999px;padding:4px 7px;font-size:7.5px;font-weight:900;white-space:nowrap;border:1px solid #354047}
      #assignmentOverview .tf-badge-v258.design{background:#241a31;border-color:#65468a;color:#d1a5fa}
      #assignmentOverview .tf-badge-v258.video{background:#13263a;border-color:#315e87;color:#92ccff}
      #assignmentOverview .tf-badge-v258.social{background:#24250e;border-color:#69691e;color:#E4E251}
      #assignmentOverview .tf-badge-v258.lead{background:#2c2a0e;border-color:#66611f;color:#f3eb3f}
      #assignmentOverview .tf-badge-v258.other{background:#1a2024;border-color:#3b464c;color:#c0c8cc}
      #assignmentOverview .tf-empty-v258{padding:22px;text-align:center;color:#718087;font-size:10px}

      @media(max-width:1100px){#assignmentOverview .tf-people-v258{grid-template-columns:1fr}}
      @media(max-width:760px){
        #assignmentOverview .tf-top-v258{grid-template-columns:repeat(2,1fr)}
        #assignmentOverview .tf-row-v258{grid-template-columns:36px minmax(0,1fr)}
        #assignmentOverview .tf-badges-v258{grid-column:2;justify-content:flex-start;max-width:none}
      }
    `;document.head.appendChild(s);
  }

  function activeStaff(){
    return (state.profiles||[])
      .filter(p=>p.active&&p.role!=='admin')
      .sort((a,b)=>String(a.full_name||'').localeCompare(String(b.full_name||''),'tr'));
  }

  function activeFirmMap(){
    return new Map((state.firms||[]).filter(f=>f.active).map(f=>[String(f.id),f]));
  }

  function assignmentsFor(pid){
    const fm=activeFirmMap();
    return (state.assignments||[]).filter(a=>String(a.person_id)===String(pid)&&fm.has(String(a.firm_id)));
  }

  function roleCount(pid,role){
    return new Set(assignmentsFor(pid).filter(a=>a.responsibility===role).map(a=>String(a.firm_id))).size;
  }

  function firmRows(pid){
    const fm=activeFirmMap(),group=new Map();
    assignmentsFor(pid).forEach(a=>{
      const id=String(a.firm_id),f=fm.get(id);if(!f)return;
      if(!group.has(id))group.set(id,{firm:f,roles:new Set()});
      group.get(id).roles.add(a.responsibility||'diger');
    });
    return [...group.values()].sort((a,b)=>String(a.firm.name||'').localeCompare(String(b.firm.name||''),'tr'));
  }

  function logoHtml(f){
    try{
      if(typeof firmLogo==='function')return firmLogo(f);
    }catch(_e){}
    const initials=String(f?.name||'?').split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,3).toUpperCase();
    return `<span class="firm-logo logo-placeholder">${esc(initials)}</span>`;
  }

  function badgesHtml(roles){
    return roleOrder.filter(r=>roles.has(r)).map(r=>{
      const m=roleMeta[r]||roleMeta.diger;
      return `<span class="tf-badge-v258 ${m.cls}">${esc(m.label)}</span>`;
    }).join('');
  }

  function rowHtml(item){
    const f=item.firm;
    return `<div class="tf-row-v258">
      <div class="tf-logo-v258">${logoHtml(f)}</div>
      <div class="tf-name-v258"><b>${esc(f.name)}</b><span>${esc(f.sector||'Sektör belirtilmedi')}</span></div>
      <div class="tf-badges-v258">${badgesHtml(item.roles)}</div>
    </div>`;
  }

  function render(){
    const host=document.getElementById('firmDistributionPeopleV257'),sum=document.getElementById('firmDistributionSummaryV257');
    if(!host||!sum)return;
    const people=activeStaff(),activeCount=(state.firms||[]).filter(f=>f.active).length;
    const totalPost=people.reduce((n,p)=>n+roleCount(p.id,'tasarim'),0);
    const totalVideo=people.reduce((n,p)=>n+roleCount(p.id,'video'),0);
    const totalSocial=people.reduce((n,p)=>n+roleCount(p.id,'sosyal_medya'),0);

    sum.className='tf-top-v258';
    sum.innerHTML=`
      <div class="tf-top-card-v258"><small>Aktif Firma</small><b>${activeCount}</b></div>
      <div class="tf-top-card-v258 design"><small>Post / Tasarım Ataması</small><b>${totalPost}</b></div>
      <div class="tf-top-card-v258 video"><small>Video Ataması</small><b>${totalVideo}</b></div>
      <div class="tf-top-card-v258 social"><small>Sosyal Medya Ataması</small><b>${totalSocial}</b></div>`;

    host.className='tf-people-v258';
    host.innerHTML=people.map(p=>{
      const rows=firmRows(p.id);
      const post=roleCount(p.id,'tasarim'),video=roleCount(p.id,'video'),social=roleCount(p.id,'sosyal_medya');
      return `<article class="tf-person-v258">
        <div class="tf-person-head-v258">
          <div class="tf-person-title-v258">
            <div><h3>${esc(p.full_name)}</h3><p>${esc(p.job_title||'Personel')} · sorumlu olduğu aktif firmalar</p></div>
            <div class="tf-total-v258"><small>Firma</small><b>${rows.length}</b></div>
          </div>
          <div class="tf-kpis-v258">
            <div class="tf-kpi-v258 design"><small>Post / Tasarım</small><b>${post}</b></div>
            <div class="tf-kpi-v258 video"><small>Video</small><b>${video}</b></div>
            <div class="tf-kpi-v258 social"><small>Sosyal Medya</small><b>${social}</b></div>
          </div>
        </div>
        <div class="tf-list-v258">${rows.length?rows.map(rowHtml).join(''):'<div class="tf-empty-v258">Aktif firma ataması yok.</div>'}</div>
      </article>`;
    }).join('')||'<div class="tf-empty-v258">Aktif personel yok.</div>';
  }

  function showView(){
    ensureUi();
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));
    document.getElementById('assignmentOverview')?.classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view==='assignmentOverview'));
    const t=document.getElementById('pageTitle'),s=document.getElementById('pageSub');
    if(t)t.textContent='Ekip Firmalar';
    if(s)s.textContent='Personel bazında firma, post, video ve sosyal medya sorumlulukları.';
    render();
  }

  function ensureUi(){
    installStyle();
    let nav=document.querySelector('.nav-item[data-view="assignmentOverview"]');
    if(!nav){
      nav=document.createElement('button');
      nav.className='nav-item admin-nav';nav.dataset.view='assignmentOverview';
      const team=document.querySelector('.nav-item[data-view="team"]');
      if(team)team.insertAdjacentElement('afterend',nav);
      else document.querySelector('.sidebar nav')?.appendChild(nav);
      nav.addEventListener('click',e=>{e.preventDefault();showView();});
    }
    nav.innerHTML='▦ <span>Ekip Firmalar</span>';

    let section=document.getElementById('assignmentOverview');
    if(!section){
      section=document.createElement('section');section.id='assignmentOverview';section.className='view';
      section.innerHTML=`
        <div class="tf-head-v258"><h2>Ekip Firmalar</h2><p>Kimin hangi firmadan ve hangi görev türünden sorumlu olduğunu tek ekranda gör.</p></div>
        <div id="firmDistributionSummaryV257" class="tf-top-v258"></div>
        <div id="firmDistributionPeopleV257" class="tf-people-v258"></div>`;
      document.querySelector('main.main')?.appendChild(section);
    }
  }

  const prevRenderAll=typeof renderAll==='function'?renderAll:null;
  if(prevRenderAll&&!prevRenderAll.__teamFirmsV258){
    const wrapped=function(){
      const out=prevRenderAll.apply(this,arguments);
      if(document.getElementById('assignmentOverview')?.classList.contains('active-view'))queueMicrotask(render);
      return out;
    };
    wrapped.__teamFirmsV258=true;
    try{renderAll=wrapped;window.renderAll=wrapped;}catch(_e){}
  }

  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.getElementById('assignmentOverview')?.classList.contains('active-view'))render();});
  window.addEventListener('pageshow',()=>{if(document.getElementById('assignmentOverview')?.classList.contains('active-view'))render();});

  ensureUi();
})();