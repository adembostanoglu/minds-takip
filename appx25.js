// V1.24.1 — Geçmiş aylardan kalanlar: ana kart açılır/kapanır, eksikler kaynak aya göre ayrı akordeonlarda izlenir.
(function bootCarryoverV241(){
  if(typeof sb==='undefined'||typeof state==='undefined'||typeof renderAll!=='function'){
    setTimeout(bootCarryoverV241,120);return;
  }
  if(window.__mindsCarryoverV241)return;
  window.__mindsCarryoverV241=true;

  let groups=[];
  let rowByKey=new Map();
  let expanded=false;
  const openMonths=new Set();
  let lastSignature='';
  let refreshSeq=0;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const currentMonth=()=>typeof monthISO==='function'?monthISO():new Date().toISOString().slice(0,7)+'-01';
  const monthLabel=v=>{
    try{if(typeof prettyMonth==='function')return prettyMonth(v);}catch(_e){}
    const d=new Date(`${String(v).slice(0,10)}T12:00:00`);
    return Number.isNaN(d.getTime())?String(v||''):new Intl.DateTimeFormat('tr-TR',{month:'long',year:'numeric'}).format(d);
  };
  const normMonth=v=>String(v||'').slice(0,7)+'-01';

  function sourceMonths(){
    const selected=normMonth(selectedMonth);
    return [...new Set((state.months||[]).map(m=>normMonth(m.month)).filter(m=>/^\d{4}-\d{2}-01$/.test(m)&&m<selected))].sort().reverse();
  }

  function relevantSignature(){
    const sources=sourceMonths(), sourceSet=new Set(sources);
    const monthRows=(state.months||[]).filter(m=>sourceSet.has(normMonth(m.month))).map(m=>`${m.id}:${normMonth(m.month)}:${m.firm_id}:${m.post_quota}:${m.video_quota}`).sort();
    const monthIds=new Set((state.months||[]).filter(m=>sourceSet.has(normMonth(m.month))).map(m=>m.id));
    const works=(state.works||[]).filter(w=>monthIds.has(w.firm_month_id)).map(w=>`${w.id}:${w.firm_month_id}:${w.type}:${w.status}:${w.quantity}:${w.updated_at||''}`).sort();
    return [normMonth(selectedMonth),...monthRows,...works].join('|');
  }

  function installStyle(){
    if(document.getElementById('carryoverV241Style'))return;
    const s=document.createElement('style');s.id='carryoverV241Style';s.textContent=`
      #carryoverPanelV138.carryover-v241{padding:0!important;overflow:hidden}
      .carryover-summary-v241{width:100%;border:0;background:transparent;color:inherit;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:14px;text-align:left;cursor:pointer}
      .carryover-summary-v241:hover{background:#12191d}.carryover-summary-main-v241{display:flex;align-items:center;gap:11px;min-width:0}.carryover-chevron-v241{width:24px;height:24px;display:grid;place-items:center;flex:0 0 24px;border:1px solid #394248;border-radius:7px;color:#d8df32;background:#10161a;font-size:12px;transition:transform .18s ease}.carryover-v241.is-open .carryover-chevron-v241{transform:rotate(90deg)}
      .carryover-summary-copy-v241{min-width:0}.carryover-summary-copy-v241 h3{margin:0 0 3px;font-size:16px}.carryover-summary-copy-v241 p{margin:0;color:#8f9aa0;font-size:10.5px;line-height:1.35}.carryover-summary-side-v241{display:flex;align-items:center;gap:8px;flex:0 0 auto}.carryover-total-v241{font-size:10px;font-weight:850;border:1px solid #6b5719;background:#2a2109;color:#e9bc42;border-radius:999px;padding:5px 8px;white-space:nowrap}.carryover-total-v241.clear{border-color:#28543a;background:#0e2117;color:#8ed0a4}
      .carryover-body-v241{display:none;border-top:1px solid #263036;padding:10px 12px 12px;background:#0d1317}.carryover-v241.is-open .carryover-body-v241{display:block}
      .carryover-month-v241{border:1px solid #2b353b;border-radius:10px;background:#10171b;overflow:hidden;margin-bottom:8px}.carryover-month-v241:last-child{margin-bottom:0}.carryover-month-head-v241{width:100%;border:0;background:transparent;color:inherit;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;text-align:left}.carryover-month-head-v241:hover{background:#141c20}.carryover-month-left-v241{display:flex;align-items:center;gap:9px;min-width:0}.carryover-month-arrow-v241{color:#d9df36;font-size:11px;transition:transform .18s ease}.carryover-month-v241.open .carryover-month-arrow-v241{transform:rotate(90deg)}.carryover-month-name-v241{font-weight:850;font-size:12.5px;text-transform:capitalize}.carryover-month-meta-v241{color:#8e9aa0;font-size:9.5px;margin-top:2px}.carryover-month-right-v241{display:flex;align-items:center;gap:7px;white-space:nowrap}.carryover-month-count-v241{font-size:9px;color:#c9d0d3;border:1px solid #344047;border-radius:999px;padding:4px 7px;background:#0d1317}.carryover-month-qty-v241{font-size:9px;color:#efc14c;font-weight:800}
      .carryover-month-body-v241{display:none;border-top:1px solid #273137}.carryover-month-v241.open .carryover-month-body-v241{display:block}.carryover-month-body-v241 .table-wrap{margin:0;border:0;border-radius:0}.carryover-month-body-v241 table{margin:0}.carryover-month-body-v241 th{font-size:8.5px!important}.carryover-month-body-v241 td{font-size:10px!important}
      .carryover-empty-v241{padding:14px 12px;color:#839096;font-size:10.5px;text-align:center}.carryover-error-v241{padding:10px 12px;color:#d6aa74;font-size:10px;border-top:1px solid #3b2f21;background:#1b160f}
      @media(max-width:760px){.carryover-summary-v241{padding:12px}.carryover-summary-copy-v241 p{display:none}.carryover-summary-side-v241{gap:5px}.carryover-total-v241{font-size:9px}.carryover-month-head-v241{padding:10px}.carryover-month-right-v241{gap:5px}.carryover-month-body-v241 .table-wrap{overflow-x:auto}.carryover-month-body-v241 table{min-width:760px}}
    `;document.head.appendChild(s);
  }

  function ensurePanel(){
    const dash=document.getElementById('dashboard');if(!dash)return null;
    if(typeof isAdmin==='function'&&!isAdmin()){
      document.getElementById('carryoverPanelV138')?.remove();return null;
    }
    installStyle();
    let panel=document.getElementById('carryoverPanelV138');
    if(!panel){panel=document.createElement('section');panel.id='carryoverPanelV138';panel.className='panel admin-only carryover-v241';panel.style.margin='12px 0';}
    panel.classList.add('carryover-v241');
    const stats=document.getElementById('stats');
    if(stats&&stats.nextElementSibling!==panel)stats.insertAdjacentElement('afterend',panel);
    else if(!panel.parentNode)dash.prepend(panel);
    return panel;
  }

  function rowKey(r){return `${normMonth(r.source_month)}|${r.firm_id}|${r.type}`;}

  function rebuildRowMap(){
    rowByKey=new Map();
    groups.forEach(g=>g.rows.forEach(r=>rowByKey.set(rowKey(r),r)));
  }

  function renderPanel(){
    const panel=ensurePanel();if(!panel)return;
    const visibleGroups=groups.filter(g=>g.rows.length||g.error);
    const totalRows=visibleGroups.reduce((s,g)=>s+g.rows.length,0);
    const totalQty=visibleGroups.reduce((s,g)=>s+g.rows.reduce((a,r)=>a+Number(r.remaining_qty||0),0),0);
    const canComplete=normMonth(selectedMonth)===normMonth(currentMonth());
    panel.classList.toggle('is-open',expanded);

    const badge=totalRows?`${totalRows} kalem · ${totalQty} içerik`:'✓ Eksik yok';
    const desc=totalRows?`${visibleGroups.filter(g=>g.rows.length).length} geçmiş ayda kapanmamış paket işi var. Ay ay açıp takip edebilirsin.`:'Seçili aydan önce kapanmamış paket işi bulunmuyor.';

    const monthsHtml=visibleGroups.length?visibleGroups.map(g=>{
      const qty=g.rows.reduce((s,r)=>s+Number(r.remaining_qty||0),0),open=openMonths.has(g.source);
      if(g.error){
        return `<section class="carryover-month-v241 ${open?'open':''}" data-carryover-month="${esc(g.source)}"><button type="button" class="carryover-month-head-v241" data-toggle-carryover-month="${esc(g.source)}"><div class="carryover-month-left-v241"><span class="carryover-month-arrow-v241">▶</span><div><div class="carryover-month-name-v241">${esc(monthLabel(g.source))}</div><div class="carryover-month-meta-v241">Bu ayın eksikleri alınamadı</div></div></div><div class="carryover-month-right-v241"><span class="badge orange">Kontrol edilemedi</span></div></button><div class="carryover-month-body-v241"><div class="carryover-error-v241">Liste alınamadı. Sayfayı yenileyip tekrar deneyebilirsin.</div></div></section>`;
      }
      return `<section class="carryover-month-v241 ${open?'open':''}" data-carryover-month="${esc(g.source)}"><button type="button" class="carryover-month-head-v241" data-toggle-carryover-month="${esc(g.source)}"><div class="carryover-month-left-v241"><span class="carryover-month-arrow-v241">▶</span><div><div class="carryover-month-name-v241">${esc(monthLabel(g.source))}</div><div class="carryover-month-meta-v241">${g.rows.length} eksik kalem</div></div></div><div class="carryover-month-right-v241"><span class="carryover-month-qty-v241">${qty} içerik kaldı</span><span class="carryover-month-count-v241">${g.rows.length} kalem</span></div></button><div class="carryover-month-body-v241"><div class="table-wrap"><table><thead><tr><th>Firma</th><th>İçerik</th><th>Paket</th><th>O Ay Hazır</th><th>Sonradan Tamamlanan</th><th>Kalan</th><th>Sorumlu</th><th>İşlem</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td><b>${esc(r.firm_name)}</b></td><td><span class="badge ${r.type==='post'?'blue':'yellow'}">${r.type==='post'?'Post':'Video'}</span></td><td>${Number(r.package_qty||0)}</td><td>${Number(r.prepared_qty||0)}</td><td>${Number(r.carryover_done||0)}</td><td><b>${Number(r.remaining_qty||0)}</b></td><td>${(r.responsible_names||[]).map(esc).join(', ')||'—'}</td><td>${canComplete?`<button class="small-primary" data-carryover-complete-key="${esc(rowKey(r))}">Tamamlandı</button>`:'<span class="muted">Sadece güncel ayda kapatılır</span>'}</td></tr>`).join('')}</tbody></table></div></div></section>`;
    }).join(''):`<div class="carryover-empty-v241">Geçmiş aylardan devreden eksik içerik yok.</div>`;

    panel.innerHTML=`<button type="button" class="carryover-summary-v241" data-toggle-carryover-panel aria-expanded="${expanded?'true':'false'}"><div class="carryover-summary-main-v241"><span class="carryover-chevron-v241">▶</span><div class="carryover-summary-copy-v241"><h3>Geçen Aylardan Kalanlar</h3><p>${esc(desc)}</p></div></div><div class="carryover-summary-side-v241"><span class="carryover-total-v241 ${totalRows?'':'clear'}">${esc(badge)}</span></div></button><div class="carryover-body-v241">${monthsHtml}</div>`;
  }

  async function loadGroups(force=false){
    if(!profile)return;
    const panel=ensurePanel();if(!panel)return;
    const sig=relevantSignature();
    if(!force&&sig===lastSignature&&groups.length){renderPanel();return;}
    lastSignature=sig;
    const seq=++refreshSeq,sources=sourceMonths();
    if(!sources.length){groups=[];rebuildRowMap();renderPanel();return;}
    panel.innerHTML=`<button type="button" class="carryover-summary-v241"><div class="carryover-summary-main-v241"><span class="carryover-chevron-v241">▶</span><div class="carryover-summary-copy-v241"><h3>Geçen Aylardan Kalanlar</h3><p>Geçmiş ay eksikleri kontrol ediliyor.</p></div></div><div class="carryover-summary-side-v241"><span class="carryover-total-v241">Kontrol ediliyor</span></div></button>`;
    const results=await Promise.all(sources.map(async source=>{
      const {data,error}=await sb.rpc('carryover_preview',{p_source_month:source});
      if(error){console.warn('carryover_preview',source,error);return {source,rows:[],error};}
      return {source,rows:data||[],error:null};
    }));
    if(seq!==refreshSeq)return;
    groups=results;
    rebuildRowMap();
    renderPanel();
  }

  async function openComplete(row){
    const names=row.responsible_names||[],ids=row.responsible_ids||[];
    const candidates=ids.map((id,i)=>({id,name:names[i]||((state.profiles||[]).find(p=>p.id===id)?.full_name)||'Personel'}));
    const options=candidates.length?candidates:(state.profiles||[]).filter(p=>p.active&&p.role==='staff').map(p=>({id:p.id,name:p.full_name}));
    openModal(`${monthLabel(row.source_month)} Eksiğini Tamamla`,`<div class="form-grid"><div class="field full"><label>Kaynak Ay</label><input value="${esc(monthLabel(row.source_month))}" disabled></div><div class="field full"><label>Firma / İçerik</label><input value="${esc(row.firm_name)} · ${row.type==='post'?'Post':'Video'}" disabled></div><div class="field"><label>Kalan Adet</label><input value="${Number(row.remaining_qty||0)}" disabled></div><div class="field"><label>Tamamlanan Adet</label><input name="qty" type="number" min="1" max="${Number(row.remaining_qty||0)}" value="${Number(row.remaining_qty||0)}" required></div>${typeof isAdmin==='function'&&isAdmin()?`<div class="field full"><label>Tamamlayan Personel</label><select name="person">${options.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="person" value="${profile.id}">`}<div class="field full"><label>Not</label><textarea name="notes" placeholder="İstersen kısa not ekle"></textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Tamamlandı Olarak Kaydet</button></div></div>`,async fd=>{
      const q=Number(fd.get('qty'));if(!Number.isInteger(q)||q<1||q>Number(row.remaining_qty))throw new Error('Adet geçersiz.');
      const {error}=await sb.rpc('complete_carryover',{p_source_month:row.source_month,p_firm_id:row.firm_id,p_type:row.type,p_quantity:q,p_person_id:fd.get('person')||null,p_notes:String(fd.get('notes')||'').trim()||null});
      if(error)throw error;
      lastSignature='';
      setTimeout(()=>loadGroups(true),80);
    });
  }

  document.addEventListener('click',e=>{
    const top=e.target.closest('[data-toggle-carryover-panel]');
    if(top){
      expanded=!expanded;
      if(expanded&&!openMonths.size){const first=groups.find(g=>g.rows.length);if(first)openMonths.add(first.source);}
      renderPanel();return;
    }
    const mh=e.target.closest('[data-toggle-carryover-month]');
    if(mh){const m=mh.dataset.toggleCarryoverMonth;if(openMonths.has(m))openMonths.delete(m);else openMonths.add(m);renderPanel();return;}
    const b=e.target.closest('[data-carryover-complete-key]');
    if(b){const r=rowByKey.get(b.dataset.carryoverCompleteKey);if(r)openComplete(r);}
  });
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker'){lastSignature='';openMonths.clear();setTimeout(()=>loadGroups(true),120);}});

  const prev=renderAll;
  renderAll=function(){const out=prev.apply(this,arguments);setTimeout(()=>loadGroups(false),60);return out;};
  setTimeout(()=>loadGroups(true),300);
})();