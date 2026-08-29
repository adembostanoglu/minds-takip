// V1.20.4 — Firma kartlarında sorumluları görev bazlı, büyük ve renkli satırlar halinde gösterir.
(function bootFirmResponsibilityClarityV204(){
  if(window.__mindsFirmResponsibilityClarityV204)return;
  window.__mindsFirmResponsibilityClarityV204=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const roleMeta={
    ana_sorumlu:{label:'ANA SORUMLU',icon:'★',cls:'lead'},
    tasarim:{label:'TASARIM',icon:'◆',cls:'design'},
    video:{label:'VİDEO',icon:'▶',cls:'video'},
    sosyal_medya:{label:'SOSYAL MEDYA',icon:'●',cls:'social'},
    diger:{label:'DİĞER',icon:'•',cls:'other'}
  };

  function installStyle(){
    if(document.getElementById('firmRespV204Style'))return;
    const s=document.createElement('style');
    s.id='firmRespV204Style';
    s.textContent=`
      #firms .firm-resp-v204{margin-top:14px;padding-top:11px;border-top:1px solid #293238;display:grid;gap:7px}
      #firms .firm-resp-title-v204{font-size:9.5px;font-weight:900;letter-spacing:.12em;color:#87939a;margin-bottom:1px}
      #firms .firm-resp-row-v204{min-height:38px;display:grid;grid-template-columns:112px minmax(0,1fr);align-items:center;gap:9px;padding:6px 8px;border:1px solid #293238;border-radius:9px;background:#0d1317}
      #firms .firm-resp-role-v204{display:inline-flex;align-items:center;gap:6px;width:max-content;max-width:112px;padding:5px 7px;border-radius:7px;font-size:9.5px;font-weight:950;letter-spacing:.03em;white-space:nowrap}
      #firms .firm-resp-role-v204.design{background:#241a31;border:1px solid #65468a;color:#c69bf0}
      #firms .firm-resp-role-v204.video{background:#13263a;border:1px solid #315e87;color:#8bc7ff}
      #firms .firm-resp-role-v204.social{background:#122d20;border:1px solid #326948;color:#85dda5}
      #firms .firm-resp-role-v204.lead{background:#2c2a0e;border:1px solid #66611f;color:#f0e83b}
      #firms .firm-resp-role-v204.other{background:#1a2024;border:1px solid #3b464c;color:#b9c2c7}
      #firms .firm-resp-name-v204{min-width:0;color:#f2f4f5;font-size:12px;font-weight:850;line-height:1.25;white-space:normal;overflow-wrap:anywhere}
      #firms .firm-resp-empty-v204{padding:9px 10px;border:1px dashed #344047;border-radius:9px;color:#8d989e;font-size:11px;font-weight:700;background:#0d1317}
      @media(max-width:1280px){#firms .firm-resp-row-v204{grid-template-columns:100px minmax(0,1fr)}#firms .firm-resp-role-v204{max-width:100px;font-size:8.7px}#firms .firm-resp-name-v204{font-size:11.5px}}
    `;
    document.head.appendChild(s);
  }

  function responsibilityHtml(people){
    if(!people?.length)return '<div class="firm-resp-v204"><div class="firm-resp-title-v204">SORUMLULAR</div><div class="firm-resp-empty-v204">Sorumlu atanmadı</div></div>';
    const rows=people.map(x=>{
      const meta=roleMeta[x?.a?.responsibility]||roleMeta.diger;
      return `<div class="firm-resp-row-v204"><span class="firm-resp-role-v204 ${meta.cls}"><i>${meta.icon}</i>${meta.label}</span><span class="firm-resp-name-v204">${esc(x?.p?.full_name||'—')}</span></div>`;
    }).join('');
    return `<div class="firm-resp-v204"><div class="firm-resp-title-v204">SORUMLULAR</div>${rows}</div>`;
  }

  function enhancedRenderFirms(){
    if(typeof firmMetrics!=='function'||typeof assignedPeople!=='function'||typeof activeFirms!=='function'||typeof el!=='function')return;
    const make=(arr,passive=false)=>arr.map((f,i)=>{
      const m=firmMetrics(f.id),people=assignedPeople(f.id);
      return `<div class="firm-card ${passive?'passive-card':''}"><div class="firm-card-top"><span class="firm-order">${passive?'PASİF':String(i+1).padStart(2,'0')}</span><div class="card-actions">${typeof isAdmin==='function'&&isAdmin()?`<button class="small-primary" data-edit-firm="${f.id}">Düzenle</button><button class="small-danger" data-toggle-firm="${f.id}" data-active="${f.active}">${f.active?'Pasife Al':'Aktif Et'}</button><button class="small-danger" data-delete-firm="${f.id}">Kalıcı Sil</button>`:''}</div></div><div class="firm-card-head">${firmLogo(f)}<div><h3>${esc(f.name)}</h3><div class="muted">${esc(f.sector||'')}</div></div></div><div class="metric-four"><div class="mini"><small>Post</small><b>${m.post}/${m.pq}</b></div><div class="mini"><small>Video</small><b>${m.video}/${m.vq}</b></div><div class="mini"><small>Paylaşılan</small><b>${m.shared}</b></div><div class="mini"><small>Kalan</small><b>${m.remaining}</b></div></div>${responsibilityHtml(people)}</div>`;
    }).join('');
    const activeHost=el('firmCards');
    if(activeHost)activeHost.innerHTML=make(activeFirms())||'<div class="empty">Henüz aktif firma yok.</div>';
    const passiveHost=el('passiveFirmCards');
    if(passiveHost){
      if(typeof isAdmin==='function'&&isAdmin())passiveHost.innerHTML=make((state?.firms||[]).filter(f=>!f.active),true)||'<div class="empty">Pasif firma yok.</div>';
      else passiveHost.innerHTML='';
    }
  }

  installStyle();
  window.renderFirms=enhancedRenderFirms;
  try{renderFirms();}catch(e){console.warn('Firma sorumluluk görünümü hazırlanamadı',e);}
})();
