// V1.20.5 — Firma sorumlularını tek satırda, kalın ve renkli gösterir; personel firmalarını görevine göre Tasarım / Video / Sosyal Medya olarak ayırır.
(function bootFirmResponsibilityClarityV205(){
  if(window.__mindsFirmResponsibilityClarityV205)return;
  window.__mindsFirmResponsibilityClarityV205=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const roleMeta={
    ana_sorumlu:{label:'ANA SORUMLU',section:'Ana Sorumlu',icon:'★',cls:'lead'},
    tasarim:{label:'TASARIM',section:'Tasarım',icon:'◆',cls:'design'},
    video:{label:'VİDEO',section:'Video',icon:'▶',cls:'video'},
    sosyal_medya:{label:'SOSYAL MEDYA',section:'Sosyal Medya',icon:'●',cls:'social'},
    diger:{label:'DİĞER',section:'Diğer',icon:'•',cls:'other'}
  };
  const staffRoleOrder=['tasarim','video','sosyal_medya','ana_sorumlu','diger'];

  function isAdminLocal(){try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return String(window.profile?.role||'').toLowerCase()==='admin';}}
  function myId(){return window.profile?.id||profile?.id||'';}

  function installStyle(){
    if(document.getElementById('firmRespV205Style'))return;
    document.getElementById('firmRespV204Style')?.remove();
    const s=document.createElement('style');
    s.id='firmRespV205Style';
    s.textContent=`
      #firms .firm-resp-v205{margin-top:12px;padding-top:10px;border-top:1px solid #293238;min-width:0}
      #firms .firm-resp-title-v205{font-size:9px;font-weight:950;letter-spacing:.12em;color:#87939a;margin-bottom:7px}
      #firms .firm-resp-line-v205{display:flex;align-items:center;gap:6px;min-width:0;white-space:nowrap;overflow-x:auto;overflow-y:hidden;padding:1px 0 3px;scrollbar-width:thin;scrollbar-color:#344047 transparent}
      #firms .firm-resp-pair-v205{display:inline-flex;align-items:center;gap:6px;min-width:max-content;padding:4px 6px;border:1px solid #293238;border-radius:8px;background:#0d1317}
      #firms .firm-resp-pair-v205.mine{border-color:#6e6922;box-shadow:inset 0 0 0 1px rgba(235,233,60,.13)}
      #firms .firm-resp-role-v205{display:inline-flex;align-items:center;gap:4px;padding:3px 5px;border-radius:6px;font-size:8px;font-weight:950;letter-spacing:.025em;line-height:1;white-space:nowrap}
      #firms .firm-resp-role-v205.design{background:#241a31;border:1px solid #65468a;color:#d1a5fa}
      #firms .firm-resp-role-v205.video{background:#13263a;border:1px solid #315e87;color:#92ccff}
      #firms .firm-resp-role-v205.social{background:#122d20;border:1px solid #326948;color:#8ae2a9}
      #firms .firm-resp-role-v205.lead{background:#2c2a0e;border:1px solid #66611f;color:#f3eb3f}
      #firms .firm-resp-role-v205.other{background:#1a2024;border:1px solid #3b464c;color:#c0c8cc}
      #firms .firm-resp-name-v205{color:#f5f7f8;font-size:10px;font-weight:900;line-height:1;white-space:nowrap}
      #firms .firm-resp-empty-v205{padding:8px 9px;border:1px dashed #344047;border-radius:8px;color:#8d989e;font-size:10px;font-weight:800;background:#0d1317}

      #firms .firm-role-section-v205{grid-column:1/-1;min-width:0;margin-bottom:8px}
      #firms .firm-role-section-v205+.firm-role-section-v205{margin-top:8px;padding-top:14px;border-top:1px solid #222b30}
      #firms .firm-role-head-v205{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px;padding:10px 12px;border:1px solid #2c353a;border-radius:10px;background:#0e1418}
      #firms .firm-role-title-v205{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:950;letter-spacing:.02em;color:#f4f6f7}
      #firms .firm-role-title-v205 .role-dot{width:9px;height:9px;border-radius:50%;display:inline-block}
      #firms .firm-role-title-v205.design .role-dot{background:#b071eb;box-shadow:0 0 12px rgba(176,113,235,.35)}
      #firms .firm-role-title-v205.video .role-dot{background:#5ca9ee;box-shadow:0 0 12px rgba(92,169,238,.35)}
      #firms .firm-role-title-v205.social .role-dot{background:#56cb83;box-shadow:0 0 12px rgba(86,203,131,.35)}
      #firms .firm-role-title-v205.lead .role-dot{background:#ebe93c;box-shadow:0 0 12px rgba(235,233,60,.35)}
      #firms .firm-role-title-v205.other .role-dot{background:#87939a}
      #firms .firm-role-count-v205{font-size:10px;font-weight:900;color:#9aa5aa;padding:4px 7px;border-radius:999px;border:1px solid #303a40;background:#11181c}
      #firms .firm-role-grid-v205{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
      #firms .firm-card-v205-my-role{box-shadow:inset 0 2px 0 rgba(255,255,255,.02)}
      #firms .firm-card-v205-my-role.design{border-color:#5c3f7a}
      #firms .firm-card-v205-my-role.video{border-color:#2d5f87}
      #firms .firm-card-v205-my-role.social{border-color:#2d6845}

      @media(max-width:1350px){
        #firms .firm-resp-line-v205{gap:4px}
        #firms .firm-resp-pair-v205{gap:4px;padding:4px 5px}
        #firms .firm-resp-role-v205{font-size:7.4px;padding:3px 4px}
        #firms .firm-resp-name-v205{font-size:9.2px}
      }
      @media(max-width:1100px){#firms .firm-role-grid-v205{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){#firms .firm-role-grid-v205{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function responsibilityHtml(people){
    if(!people?.length)return '<div class="firm-resp-v205"><div class="firm-resp-title-v205">SORUMLULAR</div><div class="firm-resp-empty-v205">Sorumlu atanmadı</div></div>';
    const me=myId(),admin=isAdminLocal();
    const ordered=[...people].sort((a,b)=>staffRoleOrder.indexOf(a?.a?.responsibility)-staffRoleOrder.indexOf(b?.a?.responsibility));
    const pairs=ordered.map(x=>{
      const meta=roleMeta[x?.a?.responsibility]||roleMeta.diger;
      const mine=!admin&&x?.p?.id===me?' mine':'';
      return `<span class="firm-resp-pair-v205${mine}"><span class="firm-resp-role-v205 ${meta.cls}">${meta.icon} ${meta.label}</span><b class="firm-resp-name-v205">${esc(x?.p?.full_name||'—')}</b></span>`;
    }).join('');
    return `<div class="firm-resp-v205"><div class="firm-resp-title-v205">SORUMLULAR</div><div class="firm-resp-line-v205">${pairs}</div></div>`;
  }

  function cardHtml(f,i,passive=false,myRole=''){
    const m=firmMetrics(f.id),people=assignedPeople(f.id),meta=roleMeta[myRole]||null;
    const roleClass=meta?` firm-card-v205-my-role ${meta.cls}`:'';
    return `<div class="firm-card ${passive?'passive-card':''}${roleClass}"><div class="firm-card-top"><span class="firm-order">${passive?'PASİF':String(i+1).padStart(2,'0')}</span><div class="card-actions">${isAdminLocal()?`<button class="small-primary" data-edit-firm="${f.id}">Düzenle</button><button class="small-danger" data-toggle-firm="${f.id}" data-active="${f.active}">${f.active?'Pasife Al':'Aktif Et'}</button><button class="small-danger" data-delete-firm="${f.id}">Kalıcı Sil</button>`:''}</div></div><div class="firm-card-head">${firmLogo(f)}<div><h3>${esc(f.name)}</h3><div class="muted">${esc(f.sector||'')}</div></div></div><div class="metric-four"><div class="mini"><small>Post</small><b>${m.post}/${m.pq}</b></div><div class="mini"><small>Video</small><b>${m.video}/${m.vq}</b></div><div class="mini"><small>Paylaşılan</small><b>${m.shared}</b></div><div class="mini"><small>Kalan</small><b>${m.remaining}</b></div></div>${responsibilityHtml(people)}</div>`;
  }

  function adminCards(arr,passive=false){return arr.map((f,i)=>cardHtml(f,i,passive)).join('');}

  function staffGroupedCards(firms){
    const me=myId();
    const myAssignments=(state?.assignments||[]).filter(a=>a.person_id===me);
    const grouped=[];
    staffRoleOrder.forEach(role=>{
      const ids=new Set(myAssignments.filter(a=>a.responsibility===role).map(a=>a.firm_id));
      const items=firms.filter(f=>ids.has(f.id));
      if(items.length)grouped.push({role,items});
    });
    const groupedIds=new Set(grouped.flatMap(g=>g.items.map(f=>f.id)));
    const ungrouped=firms.filter(f=>!groupedIds.has(f.id));
    if(ungrouped.length)grouped.push({role:'diger',items:ungrouped,fallback:true});
    if(!grouped.length)return '<div class="empty">Sana atanmış aktif firma yok.</div>';

    return grouped.map(g=>{
      const meta=roleMeta[g.role]||roleMeta.diger;
      const title=g.fallback?'Diğer Firmalarım':`${meta.section} Firmalarım`;
      const cards=g.items.map((f,i)=>cardHtml(f,i,false,g.role)).join('');
      return `<section class="firm-role-section-v205"><div class="firm-role-head-v205"><div class="firm-role-title-v205 ${meta.cls}"><span class="role-dot"></span>${esc(title)}</div><span class="firm-role-count-v205">${g.items.length} firma</span></div><div class="firm-role-grid-v205">${cards}</div></section>`;
    }).join('');
  }

  function enhancedRenderFirms(){
    if(typeof firmMetrics!=='function'||typeof assignedPeople!=='function'||typeof activeFirms!=='function'||typeof el!=='function')return;
    const active=activeFirms();
    const activeHost=el('firmCards');
    if(activeHost){
      activeHost.innerHTML=isAdminLocal()
        ? (adminCards(active)||'<div class="empty">Henüz aktif firma yok.</div>')
        : staffGroupedCards(active);
    }
    const passiveHost=el('passiveFirmCards');
    if(passiveHost){
      if(isAdminLocal())passiveHost.innerHTML=adminCards((state?.firms||[]).filter(f=>!f.active),true)||'<div class="empty">Pasif firma yok.</div>';
      else passiveHost.innerHTML='';
    }
  }

  installStyle();
  window.renderFirms=enhancedRenderFirms;
  try{renderFirms();}catch(e){console.warn('Firma sorumluluk görünümü hazırlanamadı',e);}
})();
